import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { projectData } = await req.json();
    
    if (!projectData || typeof projectData !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid project data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating professional PDF for project:', projectData.nomeProjeto);

    const pdfBytes = await generateProfessionalPDF(projectData);
    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));

    return new Response(
      JSON.stringify({ pdf: base64Pdf }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-proposal-pdf function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateProfessionalPDF(data: any): Promise<Uint8Array> {
  const cleanText = (str: string): string => {
    if (!str) return '';
    
    let cleaned = str
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\u2026/g, '...')
      .replace(/\u00A0/g, ' ')
      .replace(/[\u2022\u2023\u25E6\u2043]/g, '- ')
      .replace(/[^\x00-\xFF]/g, '');
    
    return cleaned;
  };

  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height
  const margin = 70;
  const contentWidth = pageWidth - 2 * margin;
  
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPosition - requiredSpace < margin + 100) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
      return true;
    }
    return false;
  };
  
  const drawText = (text: string, size: number, font: any, color = rgb(0, 0, 0), justify = true) => {
    const normalized = cleanText(text ?? '');
    const paragraphs = normalized.split(/\r?\n+/).filter(Boolean);

    if (paragraphs.length === 0) {
      return;
    }

    for (const para of paragraphs) {
      const lines = splitTextIntoLines(para, contentWidth - 20, size, font);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isLastLine = i === lines.length - 1;
        
        addNewPageIfNeeded(size + 5);
        
        if (justify && !isLastLine && line.includes(' ')) {
          // Calculate word spacing to justify the line
          const words = line.split(' ');
          const wordWidths = words.map(w => font.widthOfTextAtSize(w, size));
          const totalWordWidth = wordWidths.reduce((sum, w) => sum + w, 0);
          const availableSpace = contentWidth - 20 - totalWordWidth;
          const gaps = words.length - 1;
          const wordSpacing = gaps > 0 ? availableSpace / gaps : 0;
          
          let xPos = margin;
          words.forEach((word, idx) => {
            currentPage.drawText(word, {
              x: xPos,
              y: yPosition,
              size,
              font,
              color,
            });
            xPos += font.widthOfTextAtSize(word, size) + wordSpacing;
          });
        } else {
          currentPage.drawText(line, {
            x: margin,
            y: yPosition,
            size,
            font,
            color,
          });
        }
        yPosition -= size + 5;
      }
      // Extra spacing between paragraphs
      yPosition -= 5;
    }
  };
  
  const drawSection = (title: string, content: string) => {
    addNewPageIfNeeded(40);
    yPosition -= 10;
    
    currentPage.drawText(title, {
      x: margin,
      y: yPosition,
      size: 14,
      font: timesRomanBold,
      color: rgb(0.17, 0.35, 0.63),
    });
    yPosition -= 25;
    
    drawText(content, 11, timesRomanFont);
    yPosition -= 10;
  };
  
  const splitTextIntoLines = (text: string, maxWidth: number, fontSize: number, font: any): string[] => {
    const safe = (text ?? '').replace(/\r/g, '');
    const words = safe.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let currentLine = '';

    for (const rawWord of words) {
      const word = rawWord.replace(/\n/g, '');
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else if (width > maxWidth) {
        // Handle extremely long single words by hard-wrapping
        let buffer = '';
        for (const ch of word) {
          const attempt = buffer + ch;
          if (font.widthOfTextAtSize(attempt, fontSize) > maxWidth) {
            if (buffer) lines.push(buffer);
            buffer = ch;
          } else {
            buffer = attempt;
          }
        }
        currentLine = buffer;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };
  
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  // Header
  currentPage.drawText('PROPOSTA DE PROJETO', {
    x: margin,
    y: yPosition,
    size: 24,
    font: timesRomanBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  yPosition -= 35;
  
  drawText(data.organizationName || '', 12, timesRomanFont, rgb(0.4, 0.4, 0.4));
  drawText(`${data.city || ''} - ${currentDate}`, 10, timesRomanFont, rgb(0.4, 0.4, 0.4));
  
  yPosition -= 20;
  
  // Project Title
  currentPage.drawText(data.nomeProjeto || 'Projeto', {
    x: margin,
    y: yPosition,
    size: 18,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;
  
  // Organization Info Box
  const boxHeight = 80;
  addNewPageIfNeeded(boxHeight + 20);
  
  currentPage.drawRectangle({
    x: margin,
    y: yPosition - boxHeight,
    width: contentWidth,
    height: boxHeight,
    color: rgb(0.96, 0.96, 0.96),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });
  
  yPosition -= 20;
  currentPage.drawText(`Organização: ${data.organizationName || ''}`, {
    x: margin + 15,
    y: yPosition,
    size: 10,
    font: timesRomanFont,
  });
  yPosition -= 20;
  
  currentPage.drawText(`Tipo de Organização: ${data.organizationType || ''}`, {
    x: margin + 15,
    y: yPosition,
    size: 10,
    font: timesRomanFont,
  });
  yPosition -= 20;
  
  currentPage.drawText(`Cidade de Implementação: ${data.city || ''}`, {
    x: margin + 15,
    y: yPosition,
    size: 10,
    font: timesRomanFont,
  });
  yPosition -= 30;
  
  // Sections
  drawSection('1. RESUMO EXECUTIVO', data.resumo || '');
  drawSection('2. JUSTIFICATIVA', data.justificativa || '');
  drawSection('3. METODOLOGIA', data.metodologia || '');
  drawSection('4. ORÇAMENTO', data.orcamento || '');
  
  if (data.criteriosElegibilidade) {
    drawSection('5. CRITÉRIOS DE ELEGIBILIDADE', data.criteriosElegibilidade);
  }
  
  // Signature Section
  addNewPageIfNeeded(250);
  yPosition -= 40;
  
  currentPage.drawText('ASSINATURAS', {
    x: margin,
    y: yPosition,
    size: 14,
    font: timesRomanBold,
    color: rgb(0.17, 0.35, 0.63),
  });
  yPosition -= 50;
  
  // First signature line
  currentPage.drawLine({
    start: { x: margin + 100, y: yPosition },
    end: { x: pageWidth - margin - 100, y: yPosition },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;
  
  currentPage.drawText('Nome do Responsável Legal', {
    x: margin + 150,
    y: yPosition,
    size: 10,
    font: timesRomanFont,
  });
  yPosition -= 15;
  
  currentPage.drawText(data.organizationName || '', {
    x: margin + 150,
    y: yPosition,
    size: 10,
    font: timesRomanFont,
  });
  yPosition -= 50;
  
  // Second signature line
  currentPage.drawLine({
    start: { x: margin + 100, y: yPosition },
    end: { x: pageWidth - margin - 100, y: yPosition },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;
  
  currentPage.drawText('Coordenador do Projeto', {
    x: margin + 160,
    y: yPosition,
    size: 10,
    font: timesRomanFont,
  });
  yPosition -= 40;
  
  currentPage.drawText('Data: ___/___/______', {
    x: margin + 180,
    y: yPosition,
    size: 10,
    font: timesRomanFont,
  });
  
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

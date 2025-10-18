import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const pdfContent = generateProfessionalPDF(projectData);
    const base64Pdf = btoa(pdfContent);

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

function generateProfessionalPDF(data: any): string {
  const cleanText = (str: string): string => {
    if (!str) return '';
    
    // First, normalize Unicode characters to Latin1 equivalents
    let cleaned = str
      // Remove markdown formatting
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      // Replace smart quotes with regular quotes
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      // Replace em-dash and en-dash
      .replace(/[\u2013\u2014]/g, '-')
      // Replace ellipsis
      .replace(/\u2026/g, '...')
      // Replace other common Unicode characters
      .replace(/\u00A0/g, ' ') // non-breaking space
      .replace(/[\u2022\u2023\u25E6\u2043]/g, '-') // bullets
      // Remove any remaining non-Latin1 characters
      .replace(/[^\x00-\xFF]/g, '');
    
    return cleaned;
  };

  const escape = (str: string) => {
    if (!str) return '';
    const cleaned = cleanText(str);
    return cleaned
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\r/g, '')
      .replace(/\n/g, ' ');
  };

  const wrapText = (text: string, maxChars: number): string[] => {
    if (!text) return [''];
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length > maxChars && currentLine) {
        lines.push(escape(currentLine));
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(escape(currentLine));
    }

    return lines;
  };

  const addSection = (title: string, content: string, maxLines: number = 1000): string => {
    const lines = wrapText(content, 85);
    let section = `0 -30 Td\n/F2 14 Tf\n(${escape(title)}) Tj\n`;
    section += `0 -20 Td\n/F1 10 Tf\n`;
    
    lines.slice(0, maxLines).forEach((line, index) => {
      section += `(${line}) Tj\n0 -14 Td\n`;
    });
    
    return section;
  };

  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  let contentStream = 'BT\n';
  
  // Header with logo placeholder
  contentStream += `/F2 28 Tf\n50 750 Td\n(PROPOSTA DE PROJETO) Tj\n`;
  contentStream += `0 -30 Td\n/F1 12 Tf\n(${escape(data.organizationName || '')}) Tj\n`;
  contentStream += `0 -16 Td\n(${escape(data.city || '')} - ${currentDate}) Tj\n`;
  
  // Project Title
  contentStream += `0 -40 Td\n/F2 20 Tf\n(${escape(data.nomeProjeto || 'Projeto')}) Tj\n`;
  
  // Organization Info
  contentStream += `0 -30 Td\n/F1 10 Tf\n(Organizacao: ${escape(data.organizationName || '')}) Tj\n`;
  contentStream += `0 -14 Td\n(Tipo: ${escape(data.organizationType || '')}) Tj\n`;
  contentStream += `0 -14 Td\n(Cidade: ${escape(data.city || '')}) Tj\n`;
  
  // Executive Summary
  contentStream += addSection('1. RESUMO EXECUTIVO', data.resumo || '');
  
  // Justification
  contentStream += addSection('2. JUSTIFICATIVA', data.justificativa || '');
  
  // Methodology
  contentStream += addSection('3. METODOLOGIA', data.metodologia || '');
  
  // Budget
  contentStream += addSection('4. ORCAMENTO', data.orcamento || '');
  
  // Eligibility Criteria (if exists)
  if (data.criteriosElegibilidade) {
    contentStream += addSection('5. CRITERIOS DE ELEGIBILIDADE', data.criteriosElegibilidade);
  }
  
  // Signature Section
  contentStream += `0 -60 Td\n/F2 12 Tf\n(ASSINATURAS) Tj\n`;
  contentStream += `0 -40 Td\n/F1 10 Tf\n(_____________________________________________) Tj\n`;
  contentStream += `0 -14 Td\n(Nome do Responsavel Legal) Tj\n`;
  contentStream += `0 -14 Td\n(${escape(data.organizationName || '')}) Tj\n`;
  contentStream += `0 -30 Td\n(_____________________________________________) Tj\n`;
  contentStream += `0 -14 Td\n(Coordenador do Projeto) Tj\n`;
  contentStream += `0 -30 Td\n(Data: ___/___/______) Tj\n`;
  
  contentStream += 'ET';

  const streamLength = contentStream.length;

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >> >> >>
endobj
5 0 obj
<< /Length ${streamLength} >>
stream
${contentStream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
0000000380 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${520 + streamLength}
%%EOF`;

  return pdf;
}

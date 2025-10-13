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
    const { projectData } = await req.json();
    console.log('Generating PDF for project:', projectData.nomeProjeto);

    // Generate simple PDF content
    const pdfContent = generateSimplePDF(projectData);
    const base64Pdf = btoa(pdfContent);

    return new Response(
      JSON.stringify({ pdf: base64Pdf }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-proposal-pdf function:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSimplePDF(data: any): string {
  // Escape special characters for PDF
  const escape = (str: string) => {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\r/g, '')
      .replace(/\n/g, ' ');
  };

  // Wrap text into multiple lines
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

  // Build content stream with proper line breaks
  const resumoLines = wrapText(data.resumo || '', 85);
  const justificativaLines = wrapText(data.justificativa || '', 85);
  const metodologiaLines = wrapText(data.metodologia || '', 85);
  const criteriosLines = wrapText(data.criteriosElegibilidade || '', 85);
  const orcamentoLines = wrapText(data.orcamento || '', 85);

  let yPos = 750;
  let contentStream = 'BT\n';
  
  // Title
  contentStream += `/F1 24 Tf\n50 ${yPos} Td\n(PROPOSTA DE PROJETO) Tj\n`;
  yPos -= 40;
  
  // Project Name
  contentStream += `0 -40 Td\n/F1 18 Tf\n(${escape(data.nomeProjeto || '')}) Tj\n`;
  yPos -= 50;
  
  // Resumo Executivo
  contentStream += `0 -50 Td\n/F1 14 Tf\n(RESUMO EXECUTIVO) Tj\n`;
  yPos -= 25;
  contentStream += `0 -25 Td\n/F1 10 Tf\n`;
  resumoLines.slice(0, 8).forEach(line => {
    contentStream += `(${line}) Tj\n0 -12 Td\n`;
    yPos -= 12;
  });
  
  yPos -= 20;
  
  // Justificativa
  contentStream += `0 -20 Td\n/F1 14 Tf\n(JUSTIFICATIVA) Tj\n`;
  yPos -= 25;
  contentStream += `0 -25 Td\n/F1 10 Tf\n`;
  justificativaLines.slice(0, 8).forEach(line => {
    contentStream += `(${line}) Tj\n0 -12 Td\n`;
    yPos -= 12;
  });
  
  yPos -= 20;
  
  // Metodologia
  contentStream += `0 -20 Td\n/F1 14 Tf\n(METODOLOGIA) Tj\n`;
  yPos -= 25;
  contentStream += `0 -25 Td\n/F1 10 Tf\n`;
  metodologiaLines.slice(0, 8).forEach(line => {
    contentStream += `(${line}) Tj\n0 -12 Td\n`;
    yPos -= 12;
  });

  contentStream += 'ET';

  const streamLength = contentStream.length;

  // Build complete PDF with proper encoding
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
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >> >> >>
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
0000000340 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${460 + streamLength}
%%EOF`;

  return pdf;
}

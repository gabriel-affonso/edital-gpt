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
  // Simple PDF structure
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
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 6 0 R >>
stream
BT
/F1 24 Tf
50 750 Td
(PROPOSTA DE PROJETO) Tj
0 -40 Td
/F1 18 Tf
(${data.nomeProjeto}) Tj
0 -50 Td
/F1 14 Tf
(RESUMO EXECUTIVO) Tj
0 -25 Td
/F1 10 Tf
(${wrapText(data.resumo, 80)}) Tj
0 -60 Td
/F1 14 Tf
(JUSTIFICATIVA) Tj
0 -25 Td
/F1 10 Tf
(${wrapText(data.justificativa, 80)}) Tj
0 -60 Td
/F1 14 Tf
(METODOLOGIA) Tj
0 -25 Td
/F1 10 Tf
(${wrapText(data.metodologia, 80)}) Tj
ET
endstream
endobj
6 0 obj
${calculateStreamLength(data)}
endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000304 00000 n
0000000000 00000 n
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${calculateXrefOffset(data)}
%%EOF`;

  return pdf;
}

function wrapText(text: string, maxLength: number): string {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  
  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines.slice(0, 5).join('\\n');
}

function calculateStreamLength(data: any): number {
  return 800;
}

function calculateXrefOffset(data: any): number {
  return 1200;
}

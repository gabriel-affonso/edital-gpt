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

    console.log('Generating professional Word document for project:', projectData.nomeProjeto);

    const htmlContent = generateWordHTML(projectData);
    const base64Html = btoa(unescape(encodeURIComponent(htmlContent)));

    return new Response(
      JSON.stringify({ html: base64Html }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-proposal-docx function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateWordHTML(data: any): string {
  const cleanText = (str: string): string => {
    if (!str) return '';
    
    // Normalize Unicode characters and clean markdown
    let cleaned = str
      // Remove markdown headers but preserve structure
      .replace(/#{1,6}\s*/g, '')
      // Keep bold and italic for Word
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Replace smart quotes
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      // Replace dashes
      .replace(/[\u2013\u2014]/g, '-')
      // Replace ellipsis
      .replace(/\u2026/g, '...')
      // Replace non-breaking space
      .replace(/\u00A0/g, ' ')
      // Replace bullets
      .replace(/[\u2022\u2023\u25E6\u2043]/g, '-')
      // Preserve line breaks for paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    return cleaned;
  };

  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Proposta de Projeto</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm;
    }
    body {
      font-family: 'Calibri', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #000;
    }
    h1 {
      font-size: 24pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 10pt;
      color: #1a1a1a;
      border-bottom: 2pt solid #2c5aa0;
      padding-bottom: 10pt;
    }
    h2 {
      font-size: 16pt;
      font-weight: bold;
      margin-top: 20pt;
      margin-bottom: 10pt;
      color: #2c5aa0;
    }
    h3 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 15pt;
      margin-bottom: 8pt;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30pt;
    }
    .info-box {
      background-color: #f5f5f5;
      border: 1pt solid #ddd;
      padding: 15pt;
      margin: 15pt 0;
    }
    .info-item {
      margin: 5pt 0;
    }
    .info-label {
      font-weight: bold;
      display: inline-block;
      width: 150pt;
    }
    .section {
      margin: 20pt 0;
      text-align: justify;
    }
    .signature-section {
      margin-top: 50pt;
      page-break-inside: avoid;
    }
    .signature-line {
      border-top: 1pt solid #000;
      width: 300pt;
      margin: 40pt auto 5pt auto;
    }
    .signature-label {
      text-align: center;
      margin: 5pt 0;
    }
    .footer {
      margin-top: 30pt;
      font-size: 9pt;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>PROPOSTA DE PROJETO</h1>
    <p style="font-size: 12pt; color: #666;">${data.organizationName || ''}</p>
    <p style="font-size: 10pt; color: #666;">${data.city || ''} - ${currentDate}</p>
  </div>

  <h2>${data.nomeProjeto || 'Projeto'}</h2>

  <div class="info-box">
    <div class="info-item">
      <span class="info-label">Organização:</span>
      <span>${data.organizationName || ''}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Tipo de Organização:</span>
      <span>${data.organizationType || ''}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Cidade de Implementação:</span>
      <span>${data.city || ''}</span>
    </div>
  </div>

  <div class="section">
    <h3>1. RESUMO EXECUTIVO</h3>
    <p>${cleanText(data.resumo || '')}</p>
  </div>

  <div class="section">
    <h3>2. JUSTIFICATIVA</h3>
    <p>${cleanText(data.justificativa || '')}</p>
  </div>

  <div class="section">
    <h3>3. METODOLOGIA</h3>
    <p>${cleanText(data.metodologia || '')}</p>
  </div>

  <div class="section">
    <h3>4. ORÇAMENTO</h3>
    <p>${cleanText(data.orcamento || '')}</p>
  </div>

  ${data.criteriosElegibilidade ? `
  <div class="section">
    <h3>5. CRITÉRIOS DE ELEGIBILIDADE</h3>
    <p>${cleanText(data.criteriosElegibilidade)}</p>
  </div>
  ` : ''}

  <div class="signature-section">
    <h3>ASSINATURAS</h3>
    <div style="margin-top: 40pt;">
      <div class="signature-line"></div>
      <div class="signature-label">
        <strong>Nome do Responsável Legal</strong><br>
        ${data.organizationName || ''}
      </div>
    </div>
    <div style="margin-top: 50pt;">
      <div class="signature-line"></div>
      <div class="signature-label">
        <strong>Coordenador do Projeto</strong>
      </div>
    </div>
    <div style="margin-top: 30pt; text-align: center;">
      <p>Data: ___/___/______</p>
    </div>
  </div>

  <div class="footer">
    <p>Este documento foi gerado eletronicamente e constitui uma proposta formal para solicitação de recursos.</p>
  </div>
</body>
</html>`;
}
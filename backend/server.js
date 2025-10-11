import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'deepseek-r1:latest';

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ollama: OLLAMA_BASE_URL, model: OLLAMA_MODEL });
});

// Helper function to call Ollama with tool calling support
async function callOllamaWithTools(systemPrompt, userPrompt, tools = null) {
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const requestBody = {
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      format: 'json'
    };

    if (tools) {
      requestBody.tools = tools;
    }

    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      requestBody,
      { timeout: 120000 } // 2 minute timeout
    );

    return response.data;
  } catch (error) {
    console.error('Ollama API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw new Error(`Ollama communication failed: ${error.message}`);
  }
}

// Endpoint: POST /api/suggest-project
app.post('/api/suggest-project', async (req, res) => {
  try {
    const { editalUrl } = req.body;

    if (!editalUrl) {
      return res.status(400).json({ error: 'editalUrl is required' });
    }

    console.log('Processing suggest-project for:', editalUrl);

    const systemPrompt = `Você é um especialista em editais de financiamento público brasileiro e elaboração de propostas de projetos.
Analise cuidadosamente o edital fornecido e sugira uma proposta de projeto completa e competitiva.`;

    const userPrompt = `Analise o edital disponível em: ${editalUrl}

Gere uma sugestão completa de proposta de projeto com os seguintes campos:
- nomeProjeto: Nome do projeto (máximo 100 caracteres)
- resumo: Resumo executivo do projeto (2-3 parágrafos)
- justificativa: Justificativa detalhada do projeto (3-4 parágrafos)
- metodologia: Metodologia de execução (3-4 parágrafos)
- criteriosElegibilidade: Lista dos critérios de elegibilidade do edital
- orcamento: Proposta de orçamento detalhado

Responda APENAS com um objeto JSON válido contendo esses campos.`;

    const result = await callOllamaWithTools(systemPrompt, userPrompt);
    
    // Parse the response - Ollama returns the content as a message
    let suggestion;
    try {
      const content = result.message?.content || result.response;
      suggestion = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (parseError) {
      console.error('Failed to parse Ollama response:', result);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    res.json(suggestion);
  } catch (error) {
    console.error('Error in suggest-project:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Endpoint: POST /api/process-edital
app.post('/api/process-edital', async (req, res) => {
  try {
    const { editalUrl, projectInfo } = req.body;

    if (!editalUrl || !projectInfo) {
      return res.status(400).json({ error: 'editalUrl and projectInfo are required' });
    }

    console.log('Processing edital for:', projectInfo.name);

    const systemPrompt = `Você é um especialista em elaboração de propostas de projetos para editais públicos brasileiros.
Analise o edital e as informações do projeto fornecidas e gere uma proposta completa e bem estruturada.`;

    const userPrompt = `Edital: ${editalUrl}

Informações do Projeto:
- Nome: ${projectInfo.name}
- Descrição: ${projectInfo.description}
- Objetivos: ${projectInfo.goals}
- Orçamento: ${projectInfo.budget}

Gere uma proposta completa com os seguintes campos:
- titulo: Título da proposta
- resumo: Resumo executivo
- justificativa: Justificativa detalhada
- objetivos: Objetivos específicos
- metodologia: Metodologia de execução
- cronograma: Cronograma de atividades
- orcamento: Detalhamento do orçamento
- resultados: Resultados esperados

Responda APENAS com um objeto JSON válido contendo esses campos.`;

    const result = await callOllamaWithTools(systemPrompt, userPrompt);
    
    // Parse the response
    let proposal;
    try {
      const content = result.message?.content || result.response;
      proposal = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (parseError) {
      console.error('Failed to parse Ollama response:', result);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    res.json(proposal);
  } catch (error) {
    console.error('Error in process-edital:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Endpoint: POST /api/generate-proposal-pdf
app.post('/api/generate-proposal-pdf', async (req, res) => {
  try {
    const { projectData } = req.body;

    if (!projectData) {
      return res.status(400).json({ error: 'projectData is required' });
    }

    console.log('Generating PDF for:', projectData.nomeProjeto);

    // Simple PDF generation (you can replace this with a proper PDF library like pdfkit or puppeteer)
    const pdfContent = generateSimplePDF(projectData);
    const base64Pdf = Buffer.from(pdfContent).toString('base64');

    res.json({ pdf: base64Pdf });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Simple PDF generation function (placeholder - use a proper library in production)
function generateSimplePDF(data) {
  const pdfContent = `%PDF-1.4
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
/F1 18 Tf
50 750 Td
(PROPOSTA DE PROJETO) Tj
0 -30 Td
/F1 14 Tf
(${data.nomeProjeto || 'Sem título'}) Tj
0 -40 Td
/F1 12 Tf
(RESUMO EXECUTIVO) Tj
0 -20 Td
/F1 10 Tf
${wrapText(data.resumo || 'Sem resumo', 80)}
0 -40 Td
/F1 12 Tf
(JUSTIFICATIVA) Tj
0 -20 Td
/F1 10 Tf
${wrapText(data.justificativa || 'Sem justificativa', 80)}
0 -40 Td
/F1 12 Tf
(METODOLOGIA) Tj
0 -20 Td
/F1 10 Tf
${wrapText(data.metodologia || 'Sem metodologia', 80)}
ET
endstream
endobj
6 0 obj
${calculateStreamLength()}
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
0000000296 00000 n 
${calculateXrefOffset()}
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${calculateXrefOffset() + 20}
%%EOF`;
  
  return pdfContent;
}

function wrapText(text, maxLength) {
  if (!text) return '';
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      lines.push(`(${currentLine.trim()}) Tj\n0 -15 Td\n`);
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
    if (lines.length >= 5) break; // Limit lines
  }
  
  if (currentLine.trim()) {
    lines.push(`(${currentLine.trim()}) Tj`);
  }
  
  return lines.join('');
}

function calculateStreamLength() {
  return 500; // Placeholder
}

function calculateXrefOffset() {
  return '0000000400 00000 n';
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ EditAI Backend running on port ${PORT}`);
  console.log(`📡 Ollama: ${OLLAMA_BASE_URL}`);
  console.log(`🤖 Model: ${OLLAMA_MODEL}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
});

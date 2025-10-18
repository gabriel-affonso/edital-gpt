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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { editalUrl, projectInfo } = await req.json();
    
    // Validate input lengths
    if (!editalUrl || editalUrl.length > 2048) {
      return new Response(
        JSON.stringify({ error: 'Invalid edital URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!projectInfo?.name || projectInfo.name.length < 3 || projectInfo.name.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Invalid project name (must be 3-200 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!projectInfo?.description || projectInfo.description.length < 10 || projectInfo.description.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Invalid project description (must be 10-5000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!projectInfo?.goals || projectInfo.goals.length < 10 || projectInfo.goals.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Invalid project goals (must be 10-2000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Removed console.log for security

    // Fetch the edital content (in real scenario, would scrape or fetch the document)
    // For now, we'll simulate with a system prompt
    const systemPrompt = `Você é um especialista em preenchimento de editais de financiamento público no Brasil. 
Sua tarefa é analisar o edital fornecido e gerar uma proposta completa baseada nas informações do projeto.

Retorne um JSON com os seguintes campos preenchidos:
- titulo_projeto
- resumo_executivo
- justificativa
- objetivos_gerais
- objetivos_especificos
- metodologia
- cronograma
- orcamento_detalhado
- resultados_esperados
- equipe_tecnica
- contrapartidas

Seja detalhado, profissional e siga as melhores práticas para editais públicos brasileiros.`;

    const userPrompt = `Edital: ${editalUrl}

Informações do Projeto:
- Nome: ${projectInfo.name}
- Descrição: ${projectInfo.description}
- Objetivos: ${projectInfo.goals}
- Orçamento: ${projectInfo.budget}

Gere uma proposta completa para este edital.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_proposal',
              description: 'Generate a complete proposal for the funding call',
              parameters: {
                type: 'object',
                properties: {
                  titulo_projeto: { type: 'string' },
                  resumo_executivo: { type: 'string' },
                  justificativa: { type: 'string' },
                  objetivos_gerais: { type: 'string' },
                  objetivos_especificos: { type: 'string' },
                  metodologia: { type: 'string' },
                  cronograma: { type: 'string' },
                  orcamento_detalhado: { type: 'string' },
                  resultados_esperados: { type: 'string' },
                  equipe_tecnica: { type: 'string' },
                  contrapartidas: { type: 'string' },
                },
                required: [
                  'titulo_projeto',
                  'resumo_executivo',
                  'justificativa',
                  'objetivos_gerais',
                  'objetivos_especificos',
                  'metodologia',
                  'cronograma',
                  'orcamento_detalhado',
                  'resultados_esperados',
                  'equipe_tecnica',
                  'contrapartidas',
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'generate_proposal' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente mais tarde.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos ao seu workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Failed to process edital with AI');
    }

    const aiResponse = await response.json();

    // Extract the tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.error('No tool call in AI response');
      throw new Error('Failed to extract proposal data from AI response');
    }
    
    const filledFields = toolCall?.function?.arguments 
      ? JSON.parse(toolCall.function.arguments)
      : {};

    // Successfully generated proposal fields

    return new Response(
      JSON.stringify({ 
        filledFields,
        success: true,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in process-edital function:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

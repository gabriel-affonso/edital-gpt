import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { editalUrl } = await req.json();
    console.log('Processing edital URL for project suggestion:', editalUrl);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Você é um especialista em análise de editais de financiamento público no Brasil e criação de propostas de projetos.

Sua tarefa é analisar o edital fornecido e gerar uma sugestão completa de proposta de projeto que atenda aos requisitos do edital.

A sugestão deve incluir:
- Nome do Projeto: Criativo e alinhado com o edital
- Resumo Executivo: Breve visão geral do projeto (2-3 parágrafos)
- Justificativa: Por que o projeto é importante e necessário (3-4 parágrafos)
- Metodologia: Como o projeto será executado, etapas principais (4-5 parágrafos)
- Critérios de Elegibilidade: Liste os critérios principais do edital e explique como o projeto se enquadra
- Orçamento: Sugestão de orçamento detalhado com categorias e valores em Reais (R$)

Seja específico, profissional e técnico. Use linguagem adequada para propostas oficiais brasileiras.`;

    const userPrompt = `Analise o seguinte edital e gere uma sugestão completa de proposta de projeto:

URL do Edital: ${editalUrl}

Por favor, leia o conteúdo do edital nesta URL e gere uma proposta completa e profissional.`;

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
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_project_suggestion',
              description: 'Generate a complete project proposal suggestion based on the edital',
              parameters: {
                type: 'object',
                properties: {
                  nomeProjeto: {
                    type: 'string',
                    description: 'Nome criativo e alinhado para o projeto'
                  },
                  resumo: {
                    type: 'string',
                    description: 'Resumo executivo do projeto (2-3 parágrafos)'
                  },
                  justificativa: {
                    type: 'string',
                    description: 'Justificativa detalhada do projeto (3-4 parágrafos)'
                  },
                  metodologia: {
                    type: 'string',
                    description: 'Metodologia de execução do projeto (4-5 parágrafos)'
                  },
                  criteriosElegibilidade: {
                    type: 'string',
                    description: 'Critérios de elegibilidade do edital e como o projeto se enquadra'
                  },
                  orcamento: {
                    type: 'string',
                    description: 'Orçamento detalhado com categorias e valores em Reais'
                  }
                },
                required: ['nomeProjeto', 'resumo', 'justificativa', 'metodologia', 'criteriosElegibilidade', 'orcamento'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_project_suggestion' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Insufficient credits. Please add credits to your Lovable workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI Response received');

    const toolCall = aiResponse.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const suggestion = JSON.parse(toolCall.function.arguments);
    console.log('Project suggestion generated successfully');

    return new Response(
      JSON.stringify(suggestion),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-project function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

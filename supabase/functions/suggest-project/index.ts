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

    const { editalUrl, city, organizationName, organizationType } = await req.json();
    
    // Validate input
    if (!editalUrl || editalUrl.length > 2048) {
      return new Response(
        JSON.stringify({ error: 'Invalid edital URL (must be less than 2048 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!city || city.length < 2 || city.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid city (must be between 2 and 100 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!organizationName || organizationName.length < 3 || organizationName.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Invalid organization name (must be between 3 and 200 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const validOrgTypes = ['public_institution', 'public_university', 'ngo', 'cso'];
    if (!organizationType || !validOrgTypes.includes(organizationType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid organization type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('Processing edital URL for project suggestion:', editalUrl);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const orgTypeLabels: Record<string, string> = {
      public_institution: 'Instituição Pública',
      public_university: 'Universidade Pública',
      ngo: 'ONG',
      cso: 'OSC (Organização da Sociedade Civil)'
    };

    const systemPrompt = `Você é um especialista em análise de editais de financiamento público no Brasil e criação de propostas de projetos.

Sua tarefa é analisar o edital fornecido e gerar uma sugestão INICIAL de proposta de projeto que atenda aos requisitos do edital.

Esta é a PRIMEIRA ETAPA de um processo em duas fases. Nesta fase, você deve gerar uma estrutura básica que será expandida posteriormente.

A sugestão INICIAL deve incluir:
- Nome do Projeto: Criativo e alinhado com o edital
- Resumo Executivo: Visão geral concisa do projeto (1-2 parágrafos curtos)
- Justificativa: Breve explicação da importância (2-3 parágrafos curtos)
- Metodologia: Esboço das etapas principais (2-3 parágrafos curtos)
- Critérios de Elegibilidade: Lista breve dos critérios do edital e enquadramento
- Orçamento: Estrutura básica de orçamento com categorias principais e valores em Reais (R$)

Seja específico, profissional e técnico. Use linguagem adequada para propostas oficiais brasileiras.`;

    const userPrompt = `Analise o seguinte edital e gere uma sugestão INICIAL de proposta de projeto:

URL do Edital: ${editalUrl}

Informações da Organização Proponente:
- Nome: ${organizationName}
- Tipo: ${orgTypeLabels[organizationType]}
- Cidade de Implementação: ${city}

Por favor, leia o conteúdo do edital nesta URL e gere a estrutura INICIAL da proposta. Esta estrutura será expandida posteriormente, então mantenha as seções concisas nesta fase.`;

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

    const initialSuggestion = JSON.parse(toolCall.function.arguments);
    console.log('Initial project suggestion generated successfully');

    // PHASE 2: Expand each section to create detailed content (~15 pages total)
    console.log('Starting detailed expansion of sections...');

    const expandSection = async (sectionName: string, sectionContent: string, targetPages: number): Promise<string> => {
      const expansionSystemPrompt = `Você é um especialista em redação de propostas de projetos para editais públicos brasileiros.

Sua tarefa é EXPANDIR E DETALHAR profundamente uma seção de uma proposta de projeto, transformando-a em um texto acadêmico e profissional extremamente completo.

REQUISITOS CRÍTICOS:
- Expanda o conteúdo para aproximadamente ${targetPages} páginas (estimando ~500 palavras por página)
- Use parágrafos bem desenvolvidos com argumentação robusta
- Inclua referências teóricas, dados, estatísticas e exemplos concretos quando relevante
- Mantenha linguagem formal, técnica e acadêmica adequada para propostas oficiais
- Organize em subseções claras quando apropriado
- Seja MUITO detalhado e abrangente - cada ponto deve ser explorado em profundidade`;

      const expansionUserPrompt = `Por favor, expanda profundamente a seguinte seção "${sectionName}" da proposta de projeto:

Contexto do Projeto:
- Organização: ${organizationName} (${orgTypeLabels[organizationType]})
- Cidade: ${city}
- Edital: ${editalUrl}

Conteúdo Inicial a Expandir:
${sectionContent}

Transforme este conteúdo inicial em um texto extremamente detalhado e profundo de aproximadamente ${targetPages} páginas, mantendo a essência mas expandindo significativamente cada ponto com argumentação robusta, exemplos, dados e fundamentação teórica quando apropriado.`;

      const expansionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: expansionSystemPrompt },
            { role: 'user', content: expansionUserPrompt }
          ],
        }),
      });

      if (!expansionResponse.ok) {
        console.error(`Failed to expand ${sectionName}:`, expansionResponse.status);
        return sectionContent; // Return original if expansion fails
      }

      const expansionData = await expansionResponse.json();
      return expansionData.choices[0]?.message?.content || sectionContent;
    };

    // Expand each major section in parallel
    const [expandedResumo, expandedJustificativa, expandedMetodologia, expandedOrcamento] = await Promise.all([
      expandSection('Resumo Executivo', initialSuggestion.resumo, 2),
      expandSection('Justificativa', initialSuggestion.justificativa, 4),
      expandSection('Metodologia', initialSuggestion.metodologia, 6),
      expandSection('Orçamento', initialSuggestion.orcamento, 3),
    ]);

    console.log('All sections expanded successfully');

    const finalSuggestion = {
      ...initialSuggestion,
      resumo: expandedResumo,
      justificativa: expandedJustificativa,
      metodologia: expandedMetodologia,
      orcamento: expandedOrcamento,
      success: true
    };

    return new Response(
      JSON.stringify(finalSuggestion),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-project function:', error);
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

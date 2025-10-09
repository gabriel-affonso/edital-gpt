# EditAI - Preencha Editais com Inteligência Artificial

![EditAI](src/assets/hero-bg.jpg)

## 📋 Sobre o Projeto

EditAI é uma plataforma brasileira inovadora que utiliza Inteligência Artificial para simplificar e acelerar o processo de preenchimento de editais de financiamento público. Nossa solução automatiza a análise de editais e gera propostas completas e personalizadas, economizando tempo e aumentando as chances de aprovação.

## ✨ Funcionalidades

### 1. Geração Automática de Propostas
- **Upload do Edital**: Submeta o link do edital que deseja preencher
- **Análise Inteligente**: Nossa IA analisa todos os requisitos do edital
- **Preenchimento Automático**: Gera automaticamente todos os campos necessários
- **Download em PDF**: Baixe sua proposta completa em formato profissional

### 2. Sugestão de Projetos
- **Análise de Elegibilidade**: A IA identifica os critérios de elegibilidade do edital
- **Geração de Ideias**: Receba sugestões de projetos adequados ao edital
- **Campos Editáveis**: Customize todas as sugestões conforme suas necessidades
  - Nome do Projeto
  - Metodologia
  - Justificativa
  - Resumo Executivo
  - Critérios de Elegibilidade
  - Orçamento

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca UI moderna e reativa
- **TypeScript** - Tipagem estática para código mais seguro
- **Vite** - Build tool rápida e moderna
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI de alta qualidade
- **React Router** - Roteamento client-side
- **TanStack Query** - Gerenciamento de estado assíncrono

### Backend (Lovable Cloud)
- **Supabase** - Backend-as-a-Service
- **Edge Functions** - Funções serverless em Deno
- **Lovable AI Gateway** - Acesso a modelos de IA (Gemini 2.5 Flash)

### Inteligência Artificial
- **Google Gemini 2.5 Flash** - Modelo principal para análise e geração
- **Tool Calling** - Extração estruturada de dados
- **Prompts Especializados** - Expertise em editais brasileiros

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ e npm instalados - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Conta no Lovable Cloud (inclusa automaticamente)

### Passos de Instalação

1. **Clone o repositório**
```bash
git clone <YOUR_GIT_URL>
cd editai
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# As variáveis já estão configuradas no arquivo .env
# VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, etc.
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acesse a aplicação**
```
http://localhost:8080
```

## 🏗️ Estrutura do Projeto

```
editai/
├── src/
│   ├── assets/              # Imagens e recursos estáticos
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes shadcn/ui
│   │   ├── Header.tsx      # Cabeçalho do site
│   │   ├── Hero.tsx        # Seção hero
│   │   ├── HowItWorks.tsx  # Explicação do processo
│   │   ├── Benefits.tsx    # Vantagens da plataforma
│   │   ├── EditalForm.tsx  # Formulário de edital
│   │   ├── ProposalResult.tsx         # Resultado da proposta
│   │   ├── ProjectSuggestionForm.tsx  # Formulário de sugestão
│   │   └── ProjectSuggestionEditor.tsx # Editor de sugestões
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Integrações (Supabase)
│   ├── lib/                # Utilitários
│   ├── pages/              # Páginas da aplicação
│   │   ├── Index.tsx       # Página principal
│   │   └── NotFound.tsx    # Página 404
│   ├── App.tsx             # Componente raiz
│   └── main.tsx            # Entry point
├── supabase/
│   └── functions/          # Edge Functions
│       ├── process-edital/        # Processa edital completo
│       ├── suggest-project/       # Sugere projeto
│       └── generate-proposal-pdf/ # Gera PDF
├── index.html              # HTML principal
└── package.json            # Dependências do projeto
```

## 🔧 Edge Functions

### 1. process-edital
Processa o edital completo e gera todos os campos da proposta.

**Endpoint**: `/functions/v1/process-edital`

**Input**:
```typescript
{
  editalUrl: string;
  projectInfo: {
    instituicao: string;
    areaAtuacao: string;
    objetivos: string;
  }
}
```

### 2. suggest-project
Analisa o edital e sugere um projeto completo.

**Endpoint**: `/functions/v1/suggest-project`

**Input**:
```typescript
{
  editalUrl: string;
}
```

### 3. generate-proposal-pdf
Gera um PDF com a proposta completa.

**Endpoint**: `/functions/v1/generate-proposal-pdf`

**Input**:
```typescript
{
  projectData: {
    nomeProjeto: string;
    metodologia: string;
    justificativa: string;
    resumo: string;
    criteriosElegibilidade: string;
    orcamento: string;
  }
}
```

## 🎨 Design System

O projeto utiliza um design system consistente baseado em tokens CSS:

### Cores Principais
- **Primary**: Azul institucional brasileiro (#2563eb)
- **Secondary**: Verde (#10b981)
- **Accent**: Laranja (#f59e0b)

### Componentes
Todos os componentes seguem o padrão shadcn/ui e são totalmente customizáveis via Tailwind CSS.

## 📱 Responsividade

A aplicação é totalmente responsiva e otimizada para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🚀 Deploy

### Deploy via Lovable
1. Acesse seu projeto Lovable
2. Clique em **Share → Publish**
3. Seu site estará disponível em `*.lovable.app`

### Deploy Manual (Netlify/Vercel)
```bash
# Build do projeto
npm run build

# A pasta dist/ contém os arquivos estáticos para deploy
```

## 🔐 Segurança e Privacidade

- ✅ Todas as chamadas de IA são processadas via backend
- ✅ Nenhuma chave de API é exposta no frontend
- ✅ CORS configurado adequadamente
- ✅ Rate limiting implementado
- ✅ Validação de dados em todas as camadas

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para dúvidas, sugestões ou problemas:
- 📧 Email: suporte@editai.com.br
- 🌐 Website: https://editai.lovable.app
- 💬 Discord: [Lovable Community](https://discord.com/channels/1119885301872070706/1280461670979993613)

## 🙏 Agradecimentos

- [Lovable](https://lovable.dev) - Plataforma de desenvolvimento
- [Supabase](https://supabase.com) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) - Componentes UI
- [Google Gemini](https://ai.google.dev) - Modelo de IA

---

**Desenvolvido com ❤️ para simplificar o acesso a editais públicos no Brasil**

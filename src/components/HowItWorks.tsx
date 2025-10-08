import { LinkIcon, MessageSquare, FileCheck, Download } from "lucide-react";

const steps = [
  {
    icon: LinkIcon,
    title: "Cole o Link do Edital",
    description: "Insira o URL do edital de financiamento público que você deseja participar.",
  },
  {
    icon: MessageSquare,
    title: "Responda Perguntas",
    description: "Nossa IA fará perguntas personalizadas sobre seu projeto para entender suas necessidades.",
  },
  {
    icon: FileCheck,
    title: "IA Analisa e Preenche",
    description: "O modelo LLM processa o edital e gera todos os campos necessários de forma inteligente.",
  },
  {
    icon: Download,
    title: "Baixe a Proposta",
    description: "Receba um PDF completo com sua proposta formatada e pronta para submissão.",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Como Funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Um processo simples em 4 etapas para gerar sua proposta completa
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative bg-card p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-border"
            >
              <div className="absolute -top-4 left-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                {index + 1}
              </div>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mt-2">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

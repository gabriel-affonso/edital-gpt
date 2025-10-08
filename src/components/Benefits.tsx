import { Clock, Target, Shield, Zap } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Economia de Tempo",
    description: "Reduza horas de trabalho manual para minutos com processamento automatizado.",
  },
  {
    icon: Target,
    title: "Maior Precisão",
    description: "IA treinada para identificar e preencher todos os requisitos do edital corretamente.",
  },
  {
    icon: Shield,
    title: "Conformidade Garantida",
    description: "Propostas alinhadas às exigências específicas dos editais brasileiros.",
  },
  {
    icon: Zap,
    title: "Processo Ágil",
    description: "Interface intuitiva que torna a candidatura a editais rápida e descomplicada.",
  },
];

const Benefits = () => {
  return (
    <section id="vantagens" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Por Que Escolher o EditAI?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vantagens que fazem a diferença na sua candidatura
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex gap-4 p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
            >
              <div className="bg-gradient-to-br from-secondary to-secondary/80 p-3 rounded-lg h-fit">
                <benefit.icon className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;

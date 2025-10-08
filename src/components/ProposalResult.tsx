import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, CheckCircle } from "lucide-react";

interface ProposalResultProps {
  data: {
    filledFields: Record<string, string>;
    pdfUrl?: string;
  };
  onReset: () => void;
}

const ProposalResult = ({ data, onReset }: ProposalResultProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-secondary/20 p-3 rounded-full">
            <CheckCircle className="h-8 w-8 text-secondary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Proposta Gerada com Sucesso!
            </h2>
            <p className="text-muted-foreground">
              Revise os campos preenchidos abaixo
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">
            Campos Preenchidos
          </h3>
          
          {Object.entries(data.filledFields).map(([key, value]) => (
            <div key={key} className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2 capitalize">
                {key.replace(/_/g, ' ')}
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Button variant="hero" size="lg" className="flex-1">
            <Download className="h-5 w-5" />
            Baixar PDF da Proposta
          </Button>
          <Button variant="outline" size="lg" onClick={onReset}>
            Nova Proposta
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProposalResult;

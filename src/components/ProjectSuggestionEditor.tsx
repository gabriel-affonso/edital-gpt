import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectSuggestionEditorProps {
  initialData: {
    nomeProjeto: string;
    metodologia: string;
    justificativa: string;
    resumo: string;
    criteriosElegibilidade: string;
    orcamento: string;
  };
  onReset: () => void;
}

const ProjectSuggestionEditor = ({ initialData, onReset }: ProjectSuggestionEditorProps) => {
  const [formData, setFormData] = useState(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/generate-proposal-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectData: formData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const data = await response.json();

      // Create a download link for the PDF
      const blob = new Blob([Uint8Array.from(atob(data.pdf), c => c.charCodeAt(0))], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposta_${formData.nomeProjeto.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF Gerado!",
        description: "O download do PDF foi iniciado.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-8 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Edite Sua Proposta de Projeto
          </h2>
          <p className="text-muted-foreground">
            Revise e customize os campos gerados pela IA antes de gerar o PDF final.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nomeProjeto">Nome do Projeto</Label>
            <Input
              id="nomeProjeto"
              value={formData.nomeProjeto}
              onChange={(e) => handleChange('nomeProjeto', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resumo">Resumo Executivo</Label>
            <Textarea
              id="resumo"
              value={formData.resumo}
              onChange={(e) => handleChange('resumo', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificativa">Justificativa</Label>
            <Textarea
              id="justificativa"
              value={formData.justificativa}
              onChange={(e) => handleChange('justificativa', e.target.value)}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodologia">Metodologia</Label>
            <Textarea
              id="metodologia"
              value={formData.metodologia}
              onChange={(e) => handleChange('metodologia', e.target.value)}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="criteriosElegibilidade">Critérios de Elegibilidade</Label>
            <Textarea
              id="criteriosElegibilidade"
              value={formData.criteriosElegibilidade}
              onChange={(e) => handleChange('criteriosElegibilidade', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orcamento">Orçamento</Label>
            <Textarea
              id="orcamento"
              value={formData.orcamento}
              onChange={(e) => handleChange('orcamento', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button 
            variant="hero" 
            size="lg" 
            className="flex-1"
            onClick={handleGeneratePDF}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Gerar PDF da Proposta
              </>
            )}
          </Button>
          <Button variant="outline" size="lg" onClick={onReset}>
            Nova Análise
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProjectSuggestionEditor;

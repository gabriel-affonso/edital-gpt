import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { editalFormSchema, type EditalFormData } from "@/lib/validations";

interface EditalFormProps {
  onSubmitSuccess: (data: any) => void;
}

const EditalForm = ({ onSubmitSuccess }: EditalFormProps) => {
  const [editalUrl, setEditalUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectGoals, setProjectGoals] = useState("");
  const [budget, setBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validationResult = editalFormSchema.safeParse({
      editalUrl,
      projectName,
      projectDescription,
      projectGoals,
      budget,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Erro de validação",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-edital', {
        body: {
          editalUrl,
          projectInfo: {
            name: projectName,
            description: projectDescription,
            goals: projectGoals,
            budget,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data received from server');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to process edital');
      }

      toast({
        title: "Sucesso!",
        description: "Sua proposta foi gerada com sucesso.",
      });

      onSubmitSuccess(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível processar o edital. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        Preencha as Informações do Seu Projeto
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="editalUrl">Link do Edital *</Label>
          <Input
            id="editalUrl"
            type="url"
            placeholder="https://exemplo.gov.br/edital"
            value={editalUrl}
            onChange={(e) => setEditalUrl(e.target.value)}
            required
            maxLength={2048}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectName">Nome do Projeto *</Label>
          <Input
            id="projectName"
            placeholder="Digite o nome do seu projeto"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            minLength={3}
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectDescription">Descrição do Projeto *</Label>
          <Textarea
            id="projectDescription"
            placeholder="Descreva seu projeto em detalhes"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            required
            rows={4}
            minLength={10}
            maxLength={5000}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectGoals">Objetivos e Metas *</Label>
          <Textarea
            id="projectGoals"
            placeholder="Quais são os objetivos e metas do seu projeto?"
            value={projectGoals}
            onChange={(e) => setProjectGoals(e.target.value)}
            required
            rows={3}
            minLength={10}
            maxLength={2000}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Orçamento Estimado *</Label>
          <Input
            id="budget"
            placeholder="R$ 100.000,00"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Gerar Proposta
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default EditalForm;

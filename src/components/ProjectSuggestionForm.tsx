import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { projectSuggestionSchema } from "@/lib/validations";

interface ProjectSuggestionFormProps {
  onSuggestionReceived: (data: any) => void;
}

const ProjectSuggestionForm = ({ onSuggestionReceived }: ProjectSuggestionFormProps) => {
  const [editalUrl, setEditalUrl] = useState("");
  const [city, setCity] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validationResult = projectSuggestionSchema.safeParse({ 
      editalUrl, 
      city, 
      organizationName, 
      organizationType 
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
      const { data, error } = await supabase.functions.invoke('suggest-project', {
        body: { 
          editalUrl, 
          city, 
          organizationName, 
          organizationType 
        },
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data received from server');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Sugestão Gerada!",
        description: "Revise e edite os campos conforme necessário.",
      });

      onSuggestionReceived(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível gerar a sugestão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          Gere uma Sugestão de Projeto
        </h2>
        <p className="text-muted-foreground">
          Nosso modelo de IA irá analisar o edital e sugerir uma proposta completa para você.
        </p>
      </div>
      
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
          <p className="text-xs text-muted-foreground">
            Cole o link completo do edital que deseja analisar
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade de Implementação *</Label>
          <Input
            id="city"
            type="text"
            placeholder="São Paulo"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            Cidade onde o projeto será implementado
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationName">Nome da Organização Proponente *</Label>
          <Input
            id="organizationName"
            type="text"
            placeholder="Instituto de Pesquisa e Inovação"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
            minLength={3}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            Nome completo da organização que irá implementar o projeto
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationType">Tipo de Organização *</Label>
          <Select value={organizationType} onValueChange={setOrganizationType} required>
            <SelectTrigger id="organizationType">
              <SelectValue placeholder="Selecione o tipo de organização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public_institution">Instituição Pública</SelectItem>
              <SelectItem value="public_university">Universidade Pública</SelectItem>
              <SelectItem value="ngo">ONG</SelectItem>
              <SelectItem value="cso">OSC (Organização da Sociedade Civil)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Tipo da organização proponente
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          variant="hero"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analisando Edital e Gerando Proposta...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Gerar Sugestão de Projeto
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default ProjectSuggestionForm;

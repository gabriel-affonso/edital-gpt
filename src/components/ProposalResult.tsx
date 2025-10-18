import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, CheckCircle, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ProposalResultProps {
  data: {
    filledFields: Record<string, string>;
    pdfUrl?: string;
  };
  onReset: () => void;
}

const ProposalResult = ({ data, onReset }: ProposalResultProps) => {
  const { toast } = useToast();
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingWord, setIsDownloadingWord] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProposal = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para salvar a proposta.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("proposals").insert({
        user_id: user.id,
        project_name: data.filledFields.nome_projeto || "Sem título",
        project_summary: data.filledFields.resumo_projeto,
        justification: data.filledFields.justificativa,
        methodology: data.filledFields.metodologia,
        eligibility_criteria: data.filledFields.criterios_elegibilidade,
        estimated_budget: data.filledFields.orcamento_estimado,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Proposta salva com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data: result, error } = await supabase.functions.invoke('generate-proposal-pdf', {
        body: { projectData: data.filledFields },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      
      const base64Response = await fetch(`data:application/pdf;base64,${result.pdf}`);
      const blob = await base64Response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposta-${data.filledFields.nomeProjeto || 'projeto'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF gerado!",
        description: "Download iniciado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadWord = async () => {
    setIsDownloadingWord(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data: result, error } = await supabase.functions.invoke('generate-proposal-docx', {
        body: { projectData: data.filledFields },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      
      const htmlContent = atob(result.html);
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposta-${data.filledFields.nomeProjeto || 'projeto'}.doc`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Word gerado!",
        description: "Download iniciado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar Word",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDownloadingWord(false);
    }
  };

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

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="flex-1"
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
            >
              {isDownloadingPDF ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Baixar PDF
                </>
              )}
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              className="flex-1"
              onClick={handleDownloadWord}
              disabled={isDownloadingWord}
            >
              {isDownloadingWord ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando Word...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  Baixar Word
                </>
              )}
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="default" 
              size="lg"
              className="flex-1"
              onClick={handleSaveProposal}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Proposta"
              )}
            </Button>
            <Button variant="outline" size="lg" className="flex-1" onClick={onReset}>
              Nova Proposta
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProposalResult;

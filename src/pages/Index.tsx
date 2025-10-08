import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import EditalForm from "@/components/EditalForm";
import ProposalResult from "@/components/ProposalResult";
import ProjectSuggestionForm from "@/components/ProjectSuggestionForm";
import ProjectSuggestionEditor from "@/components/ProjectSuggestionEditor";

type ViewState = 'landing' | 'form' | 'result' | 'project-suggestion-form' | 'project-suggestion-editor';

const Index = () => {
  const [viewState, setViewState] = useState<ViewState>('landing');
  const [proposalData, setProposalData] = useState<any>(null);
  const [suggestionData, setSuggestionData] = useState<any>(null);

  useEffect(() => {
    const handleOpenProjectSuggestion = () => {
      setViewState('project-suggestion-form');
    };

    window.addEventListener('openProjectSuggestion', handleOpenProjectSuggestion);
    return () => window.removeEventListener('openProjectSuggestion', handleOpenProjectSuggestion);
  }, []);

  const handleGetStarted = () => {
    setViewState('form');
  };

  const handleSubmitSuccess = (data: any) => {
    setProposalData(data);
    setViewState('result');
  };

  const handleSuggestionReceived = (data: any) => {
    setSuggestionData(data);
    setViewState('project-suggestion-editor');
  };

  const handleReset = () => {
    setProposalData(null);
    setSuggestionData(null);
    setViewState('landing');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {viewState === 'landing' && (
        <>
          <Hero onGetStarted={handleGetStarted} />
          <HowItWorks />
          <Benefits />
        </>
      )}

      {viewState === 'form' && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <EditalForm onSubmitSuccess={handleSubmitSuccess} />
          </div>
        </section>
      )}

      {viewState === 'result' && proposalData && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <ProposalResult data={proposalData} onReset={handleReset} />
          </div>
        </section>
      )}

      {viewState === 'project-suggestion-form' && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <ProjectSuggestionForm onSuggestionReceived={handleSuggestionReceived} />
          </div>
        </section>
      )}

      {viewState === 'project-suggestion-editor' && suggestionData && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <ProjectSuggestionEditor initialData={suggestionData} onReset={handleReset} />
          </div>
        </section>
      )}

      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 EditAI - Editais Inteligentes. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

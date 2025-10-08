import { FileText } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">EditAI</h1>
            <p className="text-xs text-muted-foreground">Editais Inteligentes</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Como Funciona
          </a>
          <a href="#vantagens" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Vantagens
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;

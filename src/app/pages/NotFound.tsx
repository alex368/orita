import { Link } from "react-router";
import { Home } from "lucide-react";
import { Button } from "../components/ui/button";

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16">
      <div className="text-center px-4">
        <h1 className="text-6xl md:text-9xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Page non trouvée</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link to="/">
          <Button size="lg">
            <Home className="mr-2 h-5 w-5" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}

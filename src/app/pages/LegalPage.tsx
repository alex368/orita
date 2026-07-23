import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { getLegalPageBySlug, LegalPage as LegalPageModel } from "../lib/api";

const fallbackTitles: Record<string, string> = {
  "/mentions-legales": "Mentions légales",
  "/conditions-generales": "Conditions générales",
  "/confidentialite": "Politique de confidentialité",
};

export function LegalPage() {
  const { pathname } = useLocation();
  const slug = pathname.replace("/", "");
  const [page, setPage] = useState<LegalPageModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const paragraphs = useMemo(() => page?.content.split("\n").map((line) => line.trim()).filter(Boolean) ?? [], [page]);

  useEffect(() => {
    getLegalPageBySlug(slug)
      .then(setPage)
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return <div className="bg-[#fbfaf7] px-4 py-24 text-center text-stone-600">Chargement de la page...</div>;
  }

  return (
    <div className="bg-[#fbfaf7] py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link to="/" className="mb-8 inline-flex">
          <Button variant="ghost" className="rounded-md">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour accueil
          </Button>
        </Link>

        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
            <FileText className="h-4 w-4" />
            Page légale
          </div>
          <h1 className="text-4xl font-semibold text-stone-950 md:text-5xl">{page?.title ?? fallbackTitles[pathname]}</h1>
          {page?.updatedLabel && <p className="mt-3 text-sm text-stone-500">{page.updatedLabel}</p>}
        </div>

        <Card className="rounded-md border-stone-200 bg-white shadow-sm">
          <CardContent className="space-y-5 p-6 md:p-8">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={`${paragraph}-${index}`} className="text-base leading-8 text-stone-700">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-stone-600">Cette page sera bientôt renseignée depuis l’admin.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

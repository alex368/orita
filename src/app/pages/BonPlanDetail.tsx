import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Clock, MapPin, MessageCircle, ShieldCheck, Star } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { BonPlan, getBonPlan } from "../lib/api";

const categoryTips: Record<string, string[]> = {
  Restaurant: ["Réserver avant 19h30", "Demander les plats locaux du jour", "Prévoir du liquide"],
  Plage: ["Partir le matin", "Prévoir protection solaire", "Vérifier la marée avec le guide"],
  Shopping: ["Négocier avec respect", "Comparer deux ou trois boutiques", "Garder des petites coupures"],
  Activité: ["Confirmer les horaires", "Prévoir une tenue confortable", "Demander l'accompagnement si besoin"],
  Sortie: ["Privilégier le transport avec chauffeur", "Confirmer l'adresse exacte", "Éviter de rentrer seul tard"],
  Lieu: ["Y aller avec un guide local", "Prévoir appareil photo", "Respecter les règles du site"],
};

export function BonPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<BonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    getBonPlan(id)
      .then(setPlan)
      .catch(() => setPlan(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <div className="bg-[#fbfaf7] px-4 py-24 text-center text-stone-600">Chargement du bon plan...</div>;
  }

  if (!plan) {
    return (
      <div className="bg-[#fbfaf7] px-4 py-24 text-center">
        <h1 className="mb-4 text-2xl font-semibold text-stone-950">Bon plan non trouvé</h1>
        <Link to="/bons-plans">
          <Button>Retour aux bons plans</Button>
        </Link>
      </div>
    );
  }

  const tips = categoryTips[plan.category] ?? categoryTips.Lieu;

  return (
    <div className="bg-[#fbfaf7] pb-16">
      <section
        className="relative min-h-[430px] bg-cover bg-center text-white"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(12,10,9,0.82), rgba(12,10,9,0.16)), url('${plan.image}')` }}
      >
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fbfaf7] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-16 text-white hover:bg-white/10 hover:text-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="max-w-3xl">
            <Badge className="mb-4 rounded-md bg-emerald-700 px-3 py-1 text-white hover:bg-emerald-700">
              {plan.category}
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">{plan.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-100">{plan.description}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-6 grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-8 lg:col-span-2">
          <Card className="rounded-md border-stone-200 bg-white shadow-sm">
            <CardContent className="p-6 md:p-8">
              <h2 className="mb-4 text-2xl font-semibold text-stone-950">Détail du produit</h2>
              <p className="text-base leading-8 text-stone-700">{plan.description}</p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-md bg-[#fbfaf7] p-4">
                  <MapPin className="mb-3 h-5 w-5 text-emerald-800" />
                  <p className="text-sm font-semibold text-stone-950">Type</p>
                  <p className="mt-1 text-sm text-stone-600">{plan.category}</p>
                </div>
                <div className="rounded-md bg-[#fbfaf7] p-4">
                  <Clock className="mb-3 h-5 w-5 text-emerald-800" />
                  <p className="text-sm font-semibold text-stone-950">Moment conseillé</p>
                  <p className="mt-1 text-sm text-stone-600">Selon disponibilité locale</p>
                </div>
                <div className="rounded-md bg-[#fbfaf7] p-4">
                  <Star className="mb-3 h-5 w-5 text-emerald-800" />
                  <p className="text-sm font-semibold text-stone-950">Sélection</p>
                  <p className="mt-1 text-sm text-stone-600">Recommandé par l'équipe</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border-stone-200 bg-white shadow-sm">
            <CardContent className="p-6 md:p-8">
              <h2 className="mb-5 text-2xl font-semibold text-stone-950">Conseils avant d'y aller</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {tips.map((tip) => (
                  <div key={tip} className="flex items-start gap-3 rounded-md bg-emerald-50 p-4">
                    <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-800" />
                    <span className="text-sm leading-6 text-stone-700">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="lg:col-span-1">
          <Card className="sticky top-24 rounded-md border-stone-200 bg-white shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-stone-950">Besoin d'organiser ce bon plan ?</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Envoyez-nous le nom du bon plan et la date souhaitée. On peut l'intégrer à un parcours ou prévoir un chauffeur.
              </p>

              <Link to="/contact" className="mt-6 block">
                <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contacter l'équipe
                </Button>
              </Link>

              <Link to="/parcours" className="mt-3 block">
                <Button variant="outline" className="w-full rounded-md">
                  Voir les parcours
                </Button>
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Lightbulb, MapPin, Wallet } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { BonPlan, getPageHeroConfiguration, PageHeroConfiguration, PaginationMeta, searchBonsPlans } from "../lib/api";

const categories = ["Tous", "Restaurant", "Plage", "Shopping", "Activité", "Sortie", "Lieu"];
const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 6,
  totalItems: 0,
  totalPages: 1,
};

const DEFAULT_BONS_PLANS_HERO: PageHeroConfiguration = {
  pageKey: "bons-plans",
  eyebrow: "Carnet d’adresses",
  title: "Bons plans Bénin",
  subtitle: "Restaurants, plages, activités et lieux utiles pour compléter votre séjour avec des recommandations concrètes.",
  image: {
    id: 0,
    alt: "Restaurant local africain",
    url: "https://images.unsplash.com/photo-1763140556679-d2c9c10df590?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
  },
};

export function BonsPlans() {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [bonsPlans, setBonsPlans] = useState<BonPlan[]>([]);
  const [heroConfiguration, setHeroConfiguration] = useState<PageHeroConfiguration>(DEFAULT_BONS_PLANS_HERO);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      searchBonsPlans({ category: selectedCategory, page, limit: DEFAULT_PAGINATION.limit }),
      getPageHeroConfiguration("bons-plans"),
    ])
      .then(([response, loadedHeroConfiguration]) => {
        setBonsPlans(response.items);
        setPagination(response.pagination);
        setHeroConfiguration(loadedHeroConfiguration);
      })
      .finally(() => setIsLoading(false));
  }, [selectedCategory, page]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);
  const heroImageUrl = heroConfiguration.image?.url || bonsPlans[0]?.image || DEFAULT_BONS_PLANS_HERO.image?.url;

  return (
    <div className="bg-[#fbfaf7]">
      <section
        className="relative overflow-hidden border-b border-stone-200 bg-stone-950 bg-cover bg-center py-20 text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.88), rgba(15,23,42,0.64) 55%, rgba(15,23,42,0.28)), url('${heroImageUrl}')`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#d6a02a]">{heroConfiguration.eyebrow}</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">{heroConfiguration.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-100">
            {heroConfiguration.subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="mb-8 rounded-md border border-stone-200 bg-white p-6 text-center text-stone-600">
            Chargement des bons plans...
          </div>
        )}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-md ${selectedCategory === category ? "bg-emerald-900 hover:bg-emerald-800" : "bg-white"}`}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bonsPlans.map((plan) => (
            <Card key={plan.id} className="overflow-hidden rounded-md border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
              <div 
                className="h-56 bg-cover bg-center"
                style={{ backgroundImage: `url('${plan.image}')` }}
              />
              <CardContent className="p-6">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold text-stone-950">{plan.title}</h3>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0 bg-stone-100">
                    {plan.category}
                  </Badge>
                </div>
                <p className="text-sm leading-7 text-stone-600">
                  {plan.description}
                </p>
                <Link to={`/bons-plans/${plan.id}`} className="mt-5 block">
                  <Button variant="outline" className="w-full rounded-md border-emerald-900 text-emerald-900 hover:bg-emerald-50">
                    Voir le détail
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {bonsPlans.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun bon plan dans cette catégorie pour le moment.
          </div>
        )}

        {pagination.totalItems > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button variant="outline" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Précédent
            </Button>
            <span className="text-sm text-stone-600">{pagination.totalItems} bons plans · page {pagination.page} / {pagination.totalPages}</span>
            <Button variant="outline" disabled={page >= pagination.totalPages || isLoading} onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}>
              Suivant
            </Button>
          </div>
        )}

        <div className="mt-16 rounded-md bg-emerald-950 p-6 text-white md:p-8">
          <h2 className="mb-6 text-2xl font-semibold">Conseils pratiques</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <Wallet className="h-6 w-6 flex-shrink-0 text-emerald-300" />
              <div>
              <h3 className="mb-2 font-semibold">Budget</h3>
              <p className="text-sm leading-6 text-emerald-50">
                La monnaie est le FCFA. Les distributeurs sont disponibles dans les grandes villes. 
                Prévoyez du liquide pour les marchés et petits commerces.
              </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Lightbulb className="h-6 w-6 flex-shrink-0 text-emerald-300" />
              <div>
              <h3 className="mb-2 font-semibold">Climat</h3>
              <p className="text-sm leading-6 text-emerald-50">
                Climat tropical. Saison sèche de novembre à mars (idéale pour visiter). 
                Saison des pluies d'avril à octobre.
              </p>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin className="h-6 w-6 flex-shrink-0 text-emerald-300" />
              <div>
              <h3 className="mb-2 font-semibold">Gastronomie</h3>
              <p className="text-sm leading-6 text-emerald-50">
                Goûtez la pâte rouge, l'amiwo, l'akassa et le tchoucoutou. 
                Les restaurants locaux offrent les meilleurs prix.
              </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Lightbulb className="h-6 w-6 flex-shrink-0 text-emerald-300" />
              <div>
              <h3 className="mb-2 font-semibold">Langue</h3>
              <p className="text-sm leading-6 text-emerald-50">
                Le français est la langue officielle. Le fon, le yoruba et le bariba 
                sont aussi parlés. Quelques mots de fon sont toujours appréciés.
              </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

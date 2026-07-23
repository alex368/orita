import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CheckCircle, Filter, MapPinned, Timer } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { getPageHeroConfiguration, PageHeroConfiguration, PaginationMeta, searchTours, Tour } from "../lib/api";

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 6,
  totalItems: 0,
  totalPages: 1,
};

const DEFAULT_PARCOURS_HERO: PageHeroConfiguration = {
  pageKey: "parcours",
  eyebrow: "Parcours touristiques",
  title: "Des itinéraires prêts à réserver.",
  subtitle: "Comparez les durées, les temps forts et les inclus avant de choisir votre séjour au Bénin.",
  image: {
    id: 0,
    alt: "Maisons sur pilotis à Ganvié",
    url: "https://images.unsplash.com/photo-1753818268804-662cabaa63de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
  },
};

export function Parcours() {
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [tours, setTours] = useState<Tour[]>([]);
  const [heroConfiguration, setHeroConfiguration] = useState<PageHeroConfiguration>(DEFAULT_PARCOURS_HERO);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      searchTours({ page, limit: DEFAULT_PAGINATION.limit }),
      getPageHeroConfiguration("parcours"),
    ])
      .then(([response, loadedHeroConfiguration]) => {
        setTours(response.items);
        setPagination(response.pagination);
        setHeroConfiguration(loadedHeroConfiguration);
      })
      .finally(() => setIsLoading(false));
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [durationFilter]);

  const filteredTours = tours.filter((tour) => {
    if (durationFilter === "all") return true;
    const days = parseInt(durationFilter);
    return tour.durations.some((d) => d.days === days);
  });
  const heroImageUrl = heroConfiguration.image?.url || tours[3]?.image || tours[0]?.image || DEFAULT_PARCOURS_HERO.image?.url;

  return (
    <div className="bg-[#fbfaf7]">
      <section
        className="relative overflow-hidden bg-cover bg-center py-24 text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(12,10,9,0.78), rgba(12,10,9,0.36)), url('${heroImageUrl}')`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#d6a02a]">{heroConfiguration.eyebrow}</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">{heroConfiguration.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-100">
              {heroConfiguration.subtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="mb-8 rounded-md border border-stone-200 bg-white p-6 text-center text-stone-600">
            Chargement des parcours...
          </div>
        )}
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-md border border-stone-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
          <div className="flex items-center gap-3 text-stone-700">
            <Filter className="h-5 w-5 text-emerald-800" />
            <span className="font-medium">{pagination.totalItems} parcours disponibles · page {pagination.page} / {pagination.totalPages}</span>
          </div>
          <Select value={durationFilter} onValueChange={setDurationFilter}>
            <SelectTrigger className="w-full rounded-md bg-white sm:w-[220px]">
              <SelectValue placeholder="Durée" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les durées</SelectItem>
              <SelectItem value="1">1 journée</SelectItem>
              <SelectItem value="3">3 jours</SelectItem>
              <SelectItem value="8">8 jours</SelectItem>
              <SelectItem value="12">12 jours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden rounded-md border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
              <div className="flex flex-col md:flex-row">
                <div 
                  className="h-56 flex-shrink-0 bg-cover bg-center md:h-auto md:w-2/5"
                  style={{ backgroundImage: `url('${tour.image}')` }}
                />
                <CardContent className="p-6 flex-1">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold leading-snug text-stone-950">{tour.title}</h3>
                    {tour.popular && (
                      <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">Populaire</span>
                    )}
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {tour.durations.map((duration) => (
                      <span 
                        key={duration.days} 
                        className="inline-flex items-center gap-1 rounded bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800"
                      >
                        <Timer className="h-3.5 w-3.5" />
                        {duration.days} jour{duration.days > 1 ? "s" : ""}
                      </span>
                    ))}
                  </div>

                  <div className="mb-5 space-y-2">
                    {tour.highlights.slice(0, 3).map((highlight, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-stone-600">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-700" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-stone-200 pt-5">
                    <div>
                      <span className="text-sm text-stone-500">À partir de</span>
                      <p className="text-xl font-semibold text-emerald-800">
                        {tour.durations[0].priceEur.toLocaleString()} €
                      </p>
                      <p className="text-xs text-stone-500">{tour.durations[0].priceFcfa.toLocaleString()} FCFA</p>
                    </div>
                    <Link to={`/parcours/${tour.id}`}>
                      <Button className="rounded-md bg-stone-950 text-white hover:bg-stone-800">Voir détails</Button>
                    </Link>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {filteredTours.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun parcours trouvé avec ces critères.
          </div>
        )}

        {pagination.totalItems > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button variant="outline" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Précédent
            </Button>
            <span className="text-sm text-stone-600">{pagination.page} / {pagination.totalPages}</span>
            <Button variant="outline" disabled={page >= pagination.totalPages || isLoading} onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}>
              Suivant
            </Button>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            "Prise en charge aéroport possible",
            "Guides et transport coordonnés",
            "Devis ajusté selon budget",
          ].map((text) => (
            <div key={text} className="flex items-center gap-3 rounded-md border border-stone-200 bg-white p-4 text-sm font-medium text-stone-700">
              <MapPinned className="h-5 w-5 text-emerald-800" />
              {text}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

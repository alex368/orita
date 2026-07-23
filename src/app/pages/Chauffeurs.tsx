import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { CalendarCheck, Car, CheckCircle, MapPin, Phone, Search, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Driver, getDriver, getPageHeroConfiguration, PageHeroConfiguration, PaginationMeta, searchDrivers } from "../lib/api";
import { clientLoginPath, hasClientSession } from "../lib/clientSession";

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 6,
  totalItems: 0,
  totalPages: 1,
};

const DEFAULT_CHAUFFEURS_HERO: PageHeroConfiguration = {
  pageKey: "chauffeurs",
  eyebrow: "Chauffeurs privés",
  title: "Un véhicule fiable, avant même de sortir.",
  subtitle: "Réservez un chauffeur pour une journée ou un mois. Les zones, véhicules et disponibilités sont visibles avant le paiement.",
  image: {
    id: 0,
    alt: "Chauffeur privé au Bénin",
    url: "https://images.unsplash.com/photo-1762657478568-69c8fc06225e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
  },
};

export function Chauffeurs() {
  const { search: urlSearch } = useLocation();
  const highlightedDriverId = new URLSearchParams(urlSearch).get("driver");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [heroConfiguration, setHeroConfiguration] = useState<PageHeroConfiguration>(DEFAULT_CHAUFFEURS_HERO);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    getPageHeroConfiguration("chauffeurs").then(setHeroConfiguration).catch(() => setHeroConfiguration(DEFAULT_CHAUFFEURS_HERO));

    if (highlightedDriverId) {
      getDriver(highlightedDriverId)
        .then((driver) => {
          const canShowDriver = driver.validationStatus === "validated";
          setDrivers(canShowDriver ? [driver] : []);
          setPagination({ page: 1, limit: 1, totalItems: canShowDriver ? 1 : 0, totalPages: canShowDriver ? 1 : 0 });
          setPage(1);
        })
        .finally(() => setIsLoading(false));
      return;
    }

    searchDrivers({
      q: search,
      location,
      available: availability === "all" ? undefined : availability,
      page,
      limit: 6,
    })
      .then((response) => {
        setDrivers(response.items);
        setPagination(response.pagination);
      })
      .finally(() => setIsLoading(false));
  }, [availability, highlightedDriverId, location, page, search]);

  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setAvailability("all");
    setPage(1);
  };
  const heroImageUrl = heroConfiguration.image?.url || drivers[0]?.image || DEFAULT_CHAUFFEURS_HERO.image?.url;

  return (
    <div className="bg-[#fbfaf7]">
      <section
        className="relative overflow-hidden bg-stone-950 bg-cover bg-center py-20 text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.92), rgba(15,23,42,0.72) 55%, rgba(15,23,42,0.38)), url('${heroImageUrl}')`,
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:items-center lg:px-8">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#d6a02a]">{heroConfiguration.eyebrow}</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">{heroConfiguration.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
              {heroConfiguration.subtitle}
            </p>
            <Link to={hasClientSession() ? "/chauffeurs/reserver" : clientLoginPath("/chauffeurs/reserver")} className="mt-8 inline-flex">
              <Button size="lg" className="rounded-md bg-emerald-400 text-stone-950 hover:bg-emerald-300">
                Réserver un chauffeur
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["25 000", "FCFA / jour"],
              ["600 000", "FCFA / mois"],
              ["24h", "confirmation"],
              ["48h", "remboursement"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md border border-white/10 bg-white/5 p-5">
                <div className="text-2xl font-semibold text-emerald-300">{value}</div>
                <div className="mt-1 text-sm text-stone-300">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-md border border-stone-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_220px_auto] lg:items-end">
            <div>
              <Label htmlFor="driver-search">Recherche</Label>
              <div className="relative mt-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="driver-search"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                  placeholder="Nom, véhicule, zone"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="driver-location">Localisation</Label>
              <div className="relative mt-1">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="driver-location"
                  value={location}
                  onChange={(event) => { setLocation(event.target.value); setPage(1); }}
                  placeholder="Cotonou, Ouidah, Abomey..."
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label>Disponibilité</Label>
              <Select value={availability} onValueChange={(value) => { setAvailability(value); setPage(1); }}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="true">Disponibles</SelectItem>
                  <SelectItem value="false">Occupés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="button" variant="outline" className="rounded-md" onClick={resetFilters}>
              Réinitialiser
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
            <span>{pagination.totalItems} chauffeur{pagination.totalItems > 1 ? "s" : ""} trouvé{pagination.totalItems > 1 ? "s" : ""}</span>
            <span>Page {pagination.page} / {Math.max(1, pagination.totalPages)}</span>
          </div>
        </div>

        {isLoading && (
          <div className="mb-8 rounded-md border border-stone-200 bg-white p-6 text-center text-stone-600">
            Chargement des chauffeurs...
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {drivers.map((driver) => {
            const isHighlighted = highlightedDriverId === driver.id;
            return (
            <Card key={driver.id} className={`overflow-hidden rounded-md bg-white shadow-sm ${isHighlighted ? "border-2 border-emerald-800 ring-2 ring-emerald-100" : "border-stone-200"} ${!driver.available ? 'opacity-75' : ''}`}>
              <div 
                className="h-56 bg-cover bg-center"
                style={{ backgroundImage: `url('${driver.image}')` }}
              />
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold text-stone-950">{driver.name}</h3>
                  {isHighlighted && <Badge className="bg-emerald-900 text-white hover:bg-emerald-900">Sélection admin</Badge>}
                  {driver.available ? (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Disponible
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-stone-100 text-stone-700">
                      <XCircle className="mr-1 h-3 w-3" />
                      Occupé
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-emerald-800" />
                    <span>{driver.zone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Car className="h-4 w-4 flex-shrink-0 text-emerald-800" />
                    <span>{driver.vehicleType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Phone className="h-4 w-4 flex-shrink-0 text-emerald-800" />
                    <span>{driver.phone}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link to={hasClientSession() ? `/chauffeurs/reserver?driver=${driver.id}` : clientLoginPath(`/chauffeurs/reserver?driver=${driver.id}`)} className="block">
                    <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" size="sm">
                      <CalendarCheck className="mr-2 h-4 w-4" />
                      Réserver
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>

        {!isLoading && drivers.length === 0 && (
          <div className="rounded-md border border-stone-200 bg-white p-8 text-center text-stone-600">
            Aucun chauffeur ne correspond à cette localisation.
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-md"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Précédent
            </Button>
            <span className="text-sm font-medium text-stone-700">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              className="rounded-md"
              disabled={page >= pagination.totalPages || isLoading}
              onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
            >
              Suivant
            </Button>
          </div>
        )}

        <div className="mt-12 rounded-md bg-emerald-950 p-6 text-white md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-300" />
            <h2 className="text-2xl font-semibold">Comment ça marche ?</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <div className="mb-2 text-3xl font-semibold text-emerald-300">1</div>
              <h3 className="mb-2 font-semibold">Réservez en ligne</h3>
              <p className="text-sm leading-6 text-emerald-50">
                Choisissez la durée (1 jour ou 1 mois) et payez en ligne de manière sécurisée.
              </p>
            </div>
            <div>
              <div className="mb-2 text-3xl font-semibold text-emerald-300">2</div>
              <h3 className="mb-2 font-semibold">Confirmation</h3>
              <p className="text-sm leading-6 text-emerald-50">
                Disponibilité confirmée sous 24h. Vous recevez les coordonnées du chauffeur.
              </p>
            </div>
            <div>
              <div className="mb-2 text-3xl font-semibold text-emerald-300">3</div>
              <h3 className="mb-2 font-semibold">Service garanti</h3>
              <p className="text-sm leading-6 text-emerald-50">
                Si aucun chauffeur n'est disponible, vous êtes automatiquement remboursé.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

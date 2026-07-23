import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, CalendarCheck, Car, CheckCircle, Clock, MapPin, ShieldCheck, Star, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { BonPlan, getBonsPlans, getHomepageConfiguration, HomepageConfiguration, getTours, Tour } from "../lib/api";

const DEFAULT_HOMEPAGE_HERO: HomepageConfiguration = {
  heroEyebrow: "Cotonou, Ganvié, Ouidah, Pendjari",
  heroTitle: "ORITA",
  heroSubtitle: "Séjours organisés de A à Z, chauffeurs privés et adresses locales fiables pour découvrir le Bénin avec un accompagnement clair.",
  heroPrimaryLabel: "Voir les parcours",
  heroSecondaryLabel: "Réserver un chauffeur",
  heroImage: {
    id: 0,
    alt: "Maisons sur pilotis à Ganvié",
    url: "https://images.unsplash.com/photo-1753818268804-662cabaa63de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
  },
};

export function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [bonsPlans, setBonsPlans] = useState<BonPlan[]>([]);
  const [homepageConfiguration, setHomepageConfiguration] = useState<HomepageConfiguration>(DEFAULT_HOMEPAGE_HERO);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTours(), getBonsPlans(), getHomepageConfiguration()])
      .then(([loadedTours, loadedPlans, loadedHomepageConfiguration]) => {
        setTours(loadedTours);
        setBonsPlans(loadedPlans);
        setHomepageConfiguration(loadedHomepageConfiguration);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const popularTours = tours.filter(tour => tour.popular);
  const heroTour = popularTours[0] ?? tours[0];
  const featuredPlan = bonsPlans[0];
  const heroImageUrl = homepageConfiguration.heroImage?.url || heroTour?.image || DEFAULT_HOMEPAGE_HERO.heroImage?.url;

  if (isLoading) {
    return <div className="bg-[#fbfaf7] px-4 py-24 text-center text-stone-600">Chargement du catalogue...</div>;
  }

  return (
    <div className="flex flex-col bg-[#fbfaf7]">
      <section 
        className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(12,10,9,0.76), rgba(12,10,9,0.42) 50%, rgba(12,10,9,0.16)), url('${heroImageUrl}')`
        }}
      >
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fbfaf7] to-transparent" />
        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 text-sm font-medium backdrop-blur">
              <MapPin className="h-4 w-4 text-emerald-300" />
              {homepageConfiguration.heroEyebrow}
            </div>
            <h1 className="font-orita-wordmark max-w-3xl text-5xl leading-[1.02] text-[#d6a02a] drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] md:text-7xl">
              {homepageConfiguration.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-100 md:text-xl">
              {homepageConfiguration.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/parcours">
                <Button size="lg" className="w-full rounded-md bg-emerald-500 text-stone-950 hover:bg-emerald-400 sm:w-auto">
                  {homepageConfiguration.heroPrimaryLabel}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/chauffeurs">
                <Button size="lg" variant="outline" className="w-full rounded-md border-white/35 bg-white/10 text-white hover:bg-white hover:text-stone-950 sm:w-auto">
                  {homepageConfiguration.heroSecondaryLabel}
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/20 pt-6">
              {[
                ["5", "parcours"],
                ["24h", "confirmation"],
                ["A-Z", "prise en charge"],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="text-2xl font-semibold">{value}</div>
                  <div className="text-xs uppercase text-stone-200">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-18 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Organisation complète</p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight text-stone-950 md:text-5xl">
                Un voyage fluide, pensé avant votre arrivée.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-stone-600">
              Nous coordonnons les transferts, chauffeurs, guides, hébergements et étapes. Chaque page du site vous aide à choisir, comparer et réserver sans perdre le fil.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { icon: MapPin, title: "Accueil aéroport", text: "Coordination dès l’atterrissage à Cotonou." },
              { icon: Car, title: "Transport fiable", text: "Chauffeurs privés et véhicules adaptés." },
              { icon: CalendarCheck, title: "Parcours cadrés", text: "Durées, prix et inclus lisibles avant réservation." },
              { icon: ShieldCheck, title: "Suivi réservation", text: "Confirmation, paiement et contacts centralisés." },
            ].map((service) => (
              <Card key={service.title} className="rounded-md border-stone-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <service.icon className="mb-5 h-7 w-7 text-emerald-800" />
                  <h3 className="mb-2 text-lg font-semibold text-stone-950">{service.title}</h3>
                  <p className="text-sm leading-6 text-stone-600">{service.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-18 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Parcours populaires</p>
              <h2 className="mt-2 text-3xl font-semibold text-stone-950 md:text-5xl">Choisir son rythme</h2>
            </div>
            <Link to="/parcours">
              <Button variant="outline" className="rounded-md border-stone-300">
                Tous les parcours
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {popularTours.map((tour) => (
              <Card key={tour.id} className="overflow-hidden rounded-md border-stone-200 bg-[#fbfaf7] shadow-sm transition-shadow hover:shadow-lg">
                <div 
                  className="h-60 bg-cover bg-center"
                  style={{ backgroundImage: `url('${tour.image}')` }}
                />
                <CardContent className="p-6">
                  <h3 className="mb-3 text-xl font-semibold text-stone-950">{tour.title}</h3>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {tour.durations.slice(0, 2).map((duration) => (
                      <span key={duration.days} className="rounded bg-white px-2.5 py-1 text-sm font-medium text-stone-700">
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
                      <Button className="rounded-md bg-stone-950 text-white hover:bg-stone-800">Détails</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-18 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-md bg-emerald-950 p-8 text-white md:p-10">
            <Car className="mb-8 h-8 w-8 text-emerald-300" />
            <h2 className="text-3xl font-semibold md:text-4xl">Besoin d’un chauffeur privé ?</h2>
            <p className="mt-4 max-w-xl leading-7 text-emerald-50">
              Réservez pour une journée ou un mois. Le chauffeur est confirmé, ou la demande est remboursée si personne n’est disponible.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/chauffeurs/reserver">
                <Button className="rounded-md bg-emerald-400 text-stone-950 hover:bg-emerald-300">
                  Réserver
                </Button>
              </Link>
              <Link to="/chauffeurs">
                <Button variant="outline" className="rounded-md border-white bg-white text-stone-950 hover:bg-emerald-50 hover:text-stone-950">
                  Voir les chauffeurs
                </Button>
              </Link>
            </div>
          </div>
          {featuredPlan && <div className="overflow-hidden rounded-md bg-white shadow-sm">
            <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url('${featuredPlan.image}')` }} />
            <div className="p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Bon plan local</p>
              <h3 className="mt-2 text-2xl font-semibold text-stone-950">{featuredPlan.title}</h3>
              <p className="mt-3 leading-7 text-stone-600">{featuredPlan.description}</p>
              <Link to="/bons-plans" className="mt-6 inline-flex items-center text-sm font-semibold text-emerald-900">
                Découvrir les adresses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>}
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            { icon: Users, title: "Guides locaux", text: "Des contacts qui connaissent les villes et les usages." },
            { icon: Clock, title: "Programme lisible", text: "Des étapes préparées pour éviter les imprévus." },
            { icon: Star, title: "Adresses triées", text: "Restaurants, plages, sorties et activités utiles." },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 rounded-md border border-stone-200 p-5">
              <item.icon className="h-6 w-6 flex-shrink-0 text-emerald-800" />
              <div>
                <h3 className="font-semibold text-stone-950">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-stone-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

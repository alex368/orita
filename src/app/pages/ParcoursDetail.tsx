import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, CalendarCheck, CheckCircle, Info, MapPin, Route, ShieldCheck, Sparkles, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { getTour, Tour } from "../lib/api";
import { clientLoginPath, hasClientSession } from "../lib/clientSession";

export function ParcoursDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    getTour(id)
      .then(setTour)
      .catch(() => setTour(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <div className="bg-[#fbfaf7] px-4 py-24 text-center text-stone-600">Chargement du parcours...</div>;
  }

  if (!tour) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Parcours non trouvé</h1>
        <Link to="/parcours">
          <Button>Retour aux parcours</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfaf7] pb-16">
      <section
        className="relative min-h-[420px] bg-cover bg-center text-white"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(12,10,9,0.78), rgba(12,10,9,0.18)), url('${tour.image}')` }}
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 text-sm font-medium backdrop-blur">
              <MapPin className="h-4 w-4 text-emerald-300" />
              Parcours accompagné
            </div>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">{tour.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-100">
              {tour.summary || "Durées flexibles, étapes majeures et prise en charge complète selon le forfait choisi."}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card className="rounded-md border-stone-200 bg-white shadow-sm">
              <CardContent className="p-6 md:p-8">
                <h2 className="mb-5 text-2xl font-semibold text-stone-950">Durées disponibles</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {tour.durations.map((duration) => (
                    <div key={duration.days} className="rounded-md border border-emerald-100 bg-emerald-50 p-4">
                      <div className="text-lg font-semibold text-emerald-900">{duration.days} jour{duration.days > 1 ? 's' : ''}</div>
                      <div className="text-sm text-stone-600">{duration.priceEur.toLocaleString()} € / {duration.priceFcfa.toLocaleString()} FCFA</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {tour.itinerary.length > 0 && (
              <Card className="rounded-md border-stone-200 bg-white shadow-sm">
                <CardContent className="p-6 md:p-8">
                  <h2 className="mb-5 flex items-center gap-2 text-2xl font-semibold text-stone-950">
                    <Route className="h-6 w-6 text-emerald-800" />
                    Itinéraire détaillé
                  </h2>
                  <div className="space-y-4">
                    {tour.itinerary.map((step, index) => (
                      <div key={`${step}-${index}`} className="grid grid-cols-[44px_1fr] gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-900 text-sm font-semibold text-white">
                          {index + 1}
                        </div>
                        <div className="rounded-md border border-stone-200 bg-[#fbfaf7] p-4">
                          <p className="leading-7 text-stone-700">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-md border-stone-200 bg-white shadow-sm">
              <CardContent className="p-6 md:p-8">
                <h2 className="mb-5 text-2xl font-semibold text-stone-950">Points forts du parcours</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {tour.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-md bg-[#fbfaf7] p-4">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-700" />
                      <span className="text-stone-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {(tour.practicalInfo.length > 0 || tour.travelTips.length > 0) && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {tour.practicalInfo.length > 0 && (
                  <Card className="rounded-md border-stone-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-stone-950">
                        <Info className="h-5 w-5 text-emerald-700" />
                        Infos pratiques
                      </h2>
                      <ul className="space-y-3">
                        {tour.practicalInfo.map((item, index) => (
                          <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm leading-6 text-stone-700">
                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-700" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {tour.travelTips.length > 0 && (
                  <Card className="rounded-md border-stone-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-stone-950">
                        <Sparkles className="h-5 w-5 text-amber-700" />
                        Conseils voyage
                      </h2>
                      <ul className="space-y-3">
                        {tour.travelTips.map((item, index) => (
                          <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm leading-6 text-stone-700">
                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-700" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="rounded-md border-stone-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-stone-950">
                    <CheckCircle className="h-5 w-5 text-emerald-700" />
                    Inclus
                  </h2>
                  <ul className="space-y-3">
                    {tour.included.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm leading-6 text-stone-700">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-700" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="rounded-md border-stone-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-stone-950">
                    <X className="h-5 w-5 text-amber-700" />
                    Non inclus
                  </h2>
                  <ul className="space-y-3">
                    {tour.notIncluded.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm leading-6 text-stone-700">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-700" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-md border-stone-200 bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <CalendarCheck className="h-6 w-6 text-emerald-800" />
                  <h3 className="text-xl font-semibold text-stone-950">Réserver ce parcours</h3>
                </div>
                <p className="text-sm text-stone-500">À partir de</p>
                <p className="mt-1 text-3xl font-semibold text-emerald-800">
                  {tour.durations[0].priceEur.toLocaleString()} €
                </p>
                <p className="text-sm text-stone-500">{tour.durations[0].priceFcfa.toLocaleString()} FCFA</p>

                <Link to={hasClientSession() ? `/parcours/${tour.id}/reserver` : clientLoginPath(`/parcours/${tour.id}/reserver`)} className="mt-6 block">
                  <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" size="lg">
                    Réserver maintenant
                  </Button>
                </Link>

                <div className="mt-6 space-y-3 border-t border-stone-200 pt-6">
                  {["Prise en charge aéroport", "Transfert vers hôtel", "Accompagnement complet"].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-stone-600">
                      <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-700" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 rounded-md bg-stone-100 p-3 text-xs leading-5 text-stone-600">
                  Mode test sans paiement. Confirmation de réservation visible dans votre espace client.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

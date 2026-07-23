import { useEffect, useState } from "react";
import { ArrowLeft, CalendarCheck, Camera, CheckCircle, Home, KeyRound, MapPin, MessageCircle, Search, ShieldCheck, UserRound, XCircle } from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar as CalendarComponent } from "../components/ui/calendar";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { createRentalBooking, createStripeCheckout, getClientSession, getPageHeroConfiguration, getRentalBookings, PageHeroConfiguration, PaginationMeta, Rental, RentalBooking, searchRentals } from "../lib/api";
import { clearClientSessionToken, clientLoginPath, readClientSessionToken } from "../lib/clientSession";

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 6,
  totalItems: 0,
  totalPages: 1,
};

const DEFAULT_LOCATION_HERO: PageHeroConfiguration = {
  pageKey: "location",
  eyebrow: "Location",
  title: "Appartements et maisons à louer au Bénin.",
  subtitle: "Consultez les disponibilités gérées par les locataires partenaires : appartements meublés et maisons pour séjourner en autonomie.",
  image: {
    id: 0,
    alt: "Appartement meublé lumineux",
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
  },
};

export function Location() {
  const navigate = useNavigate();
  const { pathname, search: locationSearch } = useLocation();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [heroConfiguration, setHeroConfiguration] = useState<PageHeroConfiguration>(DEFAULT_LOCATION_HERO);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [availability, setAvailability] = useState("all");
  const [currency, setCurrency] = useState<"fcfa" | "eur">("fcfa");
  const [page, setPage] = useState(1);
  const [bookingRental, setBookingRental] = useState<Rental | null>(null);
  const [bookingRange, setBookingRange] = useState<DateRange | undefined>();
  const [bookingMessage, setBookingMessage] = useState("");
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>([]);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      searchRentals({
        q: search,
        category,
        available: availability === "all" ? undefined : availability,
        page,
        limit: 6,
      }),
      getPageHeroConfiguration("location"),
    ])
      .then(([response, loadedHeroConfiguration]) => {
        setRentals(response.items);
        setPagination(response.pagination);
        setHeroConfiguration(loadedHeroConfiguration);
      })
      .finally(() => setIsLoading(false));
  }, [availability, category, page, search]);

  const resetFilters = () => {
    setSearch("");
    setCategory("Tous");
    setAvailability("all");
    setPage(1);
  };
  const heroImageUrl = heroConfiguration.image?.url || rentals[0]?.image || DEFAULT_LOCATION_HERO.image?.url;

  const openBookingCalendar = async (rental: Rental) => {
    const token = readClientSessionToken();

    if (!token) {
      navigate(clientLoginPath(`${pathname}${locationSearch}`));
      return;
    }

    try {
      await getClientSession({ sessionToken: token });
      setRentalBookings(await getRentalBookings({ rentalId: rental.id }));
      setBookingRental(rental);
      setBookingRange(undefined);
      setBookingMessage("");
    } catch {
      clearClientSessionToken();
      navigate(clientLoginPath(`${pathname}${locationSearch}`));
    }
  };

  const closeBookingCalendar = () => {
    setBookingRental(null);
    setBookingRange(undefined);
    setBookingMessage("");
    setRentalBookings([]);
  };

  const confirmRentalBooking = async () => {
    if (!bookingRental || !bookingRange?.from || !bookingRange.to) return;
    if (hasRentalRangeConflict(bookingRange.from, bookingRange.to, rentalBookings)) {
      toast.error("Ces dates ne sont plus disponibles.");
      return;
    }

    const token = readClientSessionToken();
    if (!token) {
      navigate(clientLoginPath(`${pathname}${locationSearch}`));
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const booking = await createRentalBooking({
        sessionToken: token,
        rentalId: bookingRental.id,
        startDate: toIsoDate(bookingRange.from),
        endDate: toIsoDate(bookingRange.to),
        message: bookingMessage,
      });

      const estimate = rentalBookingEstimate(bookingRental, bookingRange.from, bookingRange.to, "eur");
      const checkout = await createStripeCheckout({
        name: `Location ORITA - ${bookingRental.title} #${booking.id}`,
        amountEur: estimate.total,
        successUrl: `${window.location.origin}/mon-espace/locations?payment=success&rentalBooking=${booking.id}`,
        cancelUrl: `${window.location.origin}/mon-espace/locations?payment=cancel&rentalBooking=${booking.id}`,
        rentalBookingId: booking.id,
        type: "rental",
        customerEmail: booking.customerEmail,
      });

      if (checkout.mode === "stripe" && checkout.url) {
        window.location.assign(checkout.url);
        return;
      }

      toast.success("Demande envoyée au propriétaire", {
        description: checkout.message ?? "Paiement Stripe en mode démo. La plateforme conserve le paiement jusqu'à validation de la prestation.",
      });
      closeBookingCalendar();
      navigate("/mon-espace/messages");
    } catch {
      toast.error("Impossible de créer la réservation", { description: "Vérifie les dates ou réessaie après actualisation." });
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const selectedRangeHasConflict = Boolean(bookingRange?.from && bookingRange.to && hasRentalRangeConflict(bookingRange.from, bookingRange.to, rentalBookings));

  return (
    <div className="bg-[#fbfaf7]">
      <section
        className="relative overflow-hidden bg-emerald-950 bg-cover bg-center py-20 text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.92), rgba(15,23,42,0.72) 55%, rgba(15,23,42,0.38)), url('${heroImageUrl}')`,
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:items-center lg:px-8">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#d6a02a]">{heroConfiguration.eyebrow}</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">{heroConfiguration.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50">
              {heroConfiguration.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["24h", "réponse locataire"],
              ["2", "types de biens"],
              ["FCFA", "prix lisibles"],
              ["PDF", "documents prêts"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md border border-white/10 bg-white/5 p-5">
                <div className="text-2xl font-semibold text-emerald-300">{value}</div>
                <div className="mt-1 text-sm text-emerald-50">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-md border border-stone-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
            <div>
              <Label htmlFor="rental-search">Recherche</Label>
              <div className="relative mt-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="rental-search"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                  placeholder="Cotonou, appartement, maison, plage..."
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label>Catégorie</Label>
              <Select value={category} onValueChange={(value) => { setCategory(value); setPage(1); }}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Tous", "Appartement", "Maison"].map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="false">Indisponibles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="button" variant="outline" className="rounded-md" onClick={resetFilters}>
              Réinitialiser
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
            <span>{pagination.totalItems} location{pagination.totalItems > 1 ? "s" : ""} trouvée{pagination.totalItems > 1 ? "s" : ""}</span>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-md bg-stone-100 p-1">
                {[
                  { value: "fcfa", label: "FCFA" },
                  { value: "eur", label: "€" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCurrency(option.value as "fcfa" | "eur")}
                    className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                      currency === option.value
                        ? "bg-emerald-900 text-white shadow-sm"
                        : "text-stone-600 hover:bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <span>Page {pagination.page} / {Math.max(1, pagination.totalPages)}</span>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="mb-8 rounded-md border border-stone-200 bg-white p-6 text-center text-stone-600">
            Chargement des locations...
          </div>
        )}

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rentals.map((rental) => (
            <Card
              key={rental.id}
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/location/${rental.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/location/${rental.id}`);
                }
              }}
              className={`flex h-full min-h-[760px] cursor-pointer overflow-hidden rounded-md bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${!rental.available ? "opacity-75" : ""}`}
            >
              <RentalPhotoGallery rental={rental} />
              <CardContent className="flex min-h-0 flex-1 flex-col p-6">
                <div className="mb-4 grid min-h-[136px] grid-cols-[1fr_auto] items-start gap-3">
                  <div>
                    <Badge className="mb-3 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{rental.category}</Badge>
                    <h3 className="line-clamp-3 text-xl font-semibold leading-snug text-stone-950">{rental.title}</h3>
                  </div>
                  {rental.available ? (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><CheckCircle className="mr-1 h-3 w-3" />Disponible</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-stone-100 text-stone-700"><XCircle className="mr-1 h-3 w-3" />Indisponible</Badge>
                  )}
                </div>

                <p className="mb-4 min-h-[72px] text-sm leading-6 text-stone-600 line-clamp-3">{rental.description}</p>

                <div className="mb-4 min-h-[88px] space-y-2 text-sm text-stone-600">
                  <div className="grid grid-cols-[16px_1fr] items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-emerald-800" /><span className="line-clamp-1">{rental.location}</span></div>
                  <div className="grid grid-cols-[16px_1fr] items-start gap-2"><Home className="mt-0.5 h-4 w-4 text-emerald-800" /><span className="line-clamp-1">{rental.amenities.slice(0, 3).join(" · ")}</span></div>
                  <div className="grid grid-cols-[16px_1fr] items-start gap-2"><KeyRound className="mt-0.5 h-4 w-4 text-emerald-800" /><span className="line-clamp-1">Locataire : {rental.tenant.fullName}</span></div>
                </div>

                <div className="mb-4 min-h-[104px] rounded-md bg-stone-50 p-3 text-sm">
                  <p className="font-semibold text-stone-950">Disponibilités locataire</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rental.tenant.availableSlots.map((slot) => (
                      <span key={slot} className="rounded bg-white px-2 py-1 text-xs text-stone-600 ring-1 ring-stone-200">{slot}</span>
                    ))}
                  </div>
                </div>

                <div className="mb-4 mt-auto grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md border border-stone-200 p-3">
                    <p className="text-stone-500">Jour</p>
                    <p className="font-semibold text-stone-950">{formatRentalPrice(rental, "daily", currency)}</p>
                  </div>
                  <div className="rounded-md border border-stone-200 p-3">
                    <p className="text-stone-500">Mois</p>
                    <p className="font-semibold text-stone-950">{formatRentalPrice(rental, "monthly", currency)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/location/${rental.id}`);
                    }}
                    className="rounded-md"
                  >
                    Voir le détail
                  </Button>
                  <Button
                    type="button"
                    disabled={!rental.available}
                    onClick={(event) => {
                      event.stopPropagation();
                      openBookingCalendar(rental);
                    }}
                    className="rounded-md bg-emerald-900 text-white hover:bg-emerald-800 disabled:bg-stone-300 disabled:text-stone-600"
                  >
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    Réserver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!isLoading && rentals.length === 0 && (
          <div className="rounded-md border border-stone-200 bg-white p-8 text-center text-stone-600">
            Aucune location ne correspond à vos filtres.
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Précédent</Button>
            <Button type="button" variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}>Suivant</Button>
          </div>
        )}
      </section>

      <Dialog open={bookingRental !== null} onOpenChange={(open) => !open && closeBookingCalendar()}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Réserver une location</DialogTitle>
            <DialogDescription>
              Choisissez une date de début et une date de fin pour envoyer votre demande au locataire.
            </DialogDescription>
          </DialogHeader>

          {bookingRental && (
            <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
              <div className="rounded-md border border-stone-200 bg-white p-3">
                <CalendarComponent
                  mode="range"
                  selected={bookingRange}
                  onSelect={setBookingRange}
                  disabled={(date) => date < startOfToday() || isRentalDateBlocked(date, rentalBookings)}
                  modifiers={{
                    unavailable: (date) => isRentalDateBlocked(date, rentalBookings),
                    available: (date) => date >= startOfToday() && !isRentalDateBlocked(date, rentalBookings),
                  }}
                  modifiersClassNames={{
                    unavailable: "bg-red-100 text-red-800 line-through hover:bg-red-100",
                    available: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
                  }}
                  locale={fr}
                  className="mx-auto"
                />
                <div className="mt-3 flex flex-wrap gap-3 px-2 text-xs text-stone-600">
                  <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-100 ring-1 ring-emerald-200" /> Disponible</span>
                  <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-100 ring-1 ring-red-200" /> Non disponible</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Badge className="mb-3 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{bookingRental.category}</Badge>
                  <h3 className="text-xl font-semibold text-stone-950">{bookingRental.title}</h3>
                  <p className="mt-2 text-sm text-stone-600">{bookingRental.location}</p>
                </div>

                <div className="rounded-md bg-stone-50 p-4">
                  <p className="font-semibold text-stone-950">Disponibilités locataire</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bookingRental.tenant.availableSlots.map((slot) => (
                      <span key={slot} className="rounded bg-white px-2 py-1 text-xs text-stone-600 ring-1 ring-stone-200">{slot}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md border border-stone-200 p-3">
                    <p className="text-stone-500">Jour</p>
                    <p className="font-semibold text-stone-950">{formatRentalPrice(bookingRental, "daily", currency)}</p>
                  </div>
                  <div className="rounded-md border border-stone-200 p-3">
                    <p className="text-stone-500">Mois</p>
                    <p className="font-semibold text-stone-950">{formatRentalPrice(bookingRental, "monthly", currency)}</p>
                  </div>
                </div>

                <div className="rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-950">
                  <p className="font-semibold">Période sélectionnée</p>
                  <p className="mt-1">Début : {bookingRange?.from ? format(bookingRange.from, "PPP", { locale: fr }) : "à choisir"}</p>
                  <p>Fin : {bookingRange?.to ? format(bookingRange.to, "PPP", { locale: fr }) : "à choisir"}</p>
                  {bookingRange?.from && bookingRange.to && (
                    <div className="mt-3 rounded bg-white p-3 ring-1 ring-emerald-100">
                      <p className="text-xs text-emerald-800">
                        Durée estimée : {rentalStayDuration(bookingRange.from, bookingRange.to)} nuit{rentalStayDuration(bookingRange.from, bookingRange.to) > 1 ? "s" : ""}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-emerald-950">
                        Total estimé : {formatRentalBookingTotal(bookingRental, bookingRange.from, bookingRange.to, currency)}
                      </p>
                      <p className="mt-1 text-xs text-emerald-800">
                        {rentalBookingBreakdown(bookingRental, bookingRange.from, bookingRange.to, currency)}
                      </p>
                    </div>
                  )}
                  {selectedRangeHasConflict && (
                    <p className="mt-2 rounded-md border border-red-100 bg-red-50 p-2 text-xs font-medium text-red-800">
                      Cette période croise une réservation déjà en attente ou acceptée.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="rental-message">Question au propriétaire</Label>
                  <Textarea
                    id="rental-message"
                    value={bookingMessage}
                    onChange={(event) => setBookingMessage(event.target.value)}
                    placeholder="Ex : heure d'arrivée, remise des clés, équipement nécessaire..."
                    className="mt-1 min-h-24"
                  />
                  <p className="mt-2 flex items-center gap-1 text-xs text-stone-500">
                    <MessageCircle className="h-3 w-3" />
                    Le message sera visible dans le suivi client et côté traitement propriétaire.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeBookingCalendar}>Annuler</Button>
            <Button type="button" disabled={!bookingRange?.from || !bookingRange.to || selectedRangeHasConflict || isSubmittingBooking} onClick={confirmRentalBooking} className="bg-emerald-900 text-white hover:bg-emerald-800">
              {isSubmittingBooking ? "Traitement..." : "Envoyer et payer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function LocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname, search: locationSearch } = useLocation();
  const [rental, setRental] = useState<Rental | null>(null);
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState<"fcfa" | "eur">("fcfa");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingRange, setBookingRange] = useState<DateRange | undefined>();
  const [bookingMessage, setBookingMessage] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    findRentalById(id)
      .then(async (foundRental) => {
        setRental(foundRental);
        if (foundRental) {
          setRentalBookings(await getRentalBookings({ rentalId: foundRental.id }));
        }
      })
      .catch(() => setRental(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const openBookingCalendar = async () => {
    if (!rental) return;

    const token = readClientSessionToken();
    if (!token) {
      navigate(clientLoginPath(`${pathname}${locationSearch}`));
      return;
    }

    try {
      await getClientSession({ sessionToken: token });
      setRentalBookings(await getRentalBookings({ rentalId: rental.id }));
      setBookingRange(undefined);
      setBookingMessage("");
      setBookingOpen(true);
    } catch {
      clearClientSessionToken();
      navigate(clientLoginPath(`${pathname}${locationSearch}`));
    }
  };

  const closeBookingCalendar = () => {
    setBookingOpen(false);
    setBookingRange(undefined);
    setBookingMessage("");
  };

  const confirmRentalBooking = async () => {
    if (!rental || !bookingRange?.from || !bookingRange.to) return;
    if (hasRentalRangeConflict(bookingRange.from, bookingRange.to, rentalBookings)) {
      toast.error("Ces dates ne sont plus disponibles.");
      return;
    }

    const token = readClientSessionToken();
    if (!token) {
      navigate(clientLoginPath(`${pathname}${locationSearch}`));
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const booking = await createRentalBooking({
        sessionToken: token,
        rentalId: rental.id,
        startDate: toIsoDate(bookingRange.from),
        endDate: toIsoDate(bookingRange.to),
        message: bookingMessage,
      });

      const estimate = rentalBookingEstimate(rental, bookingRange.from, bookingRange.to, "eur");
      const checkout = await createStripeCheckout({
        name: `Location ORITA - ${rental.title} #${booking.id}`,
        amountEur: estimate.total,
        successUrl: `${window.location.origin}/mon-espace/locations?payment=success&rentalBooking=${booking.id}`,
        cancelUrl: `${window.location.origin}/mon-espace/locations?payment=cancel&rentalBooking=${booking.id}`,
        rentalBookingId: booking.id,
        type: "rental",
        customerEmail: booking.customerEmail,
      });

      if (checkout.mode === "stripe" && checkout.url) {
        window.location.assign(checkout.url);
        return;
      }

      toast.success("Demande envoyée au propriétaire", {
        description: checkout.message ?? "Paiement Stripe en mode démo. La plateforme conserve le paiement jusqu'à validation de la prestation.",
      });
      closeBookingCalendar();
      navigate("/mon-espace/locations");
    } catch {
      toast.error("Impossible de créer la réservation", { description: "Vérifie les dates ou réessaie après actualisation." });
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  if (isLoading) {
    return <div className="bg-[#fbfaf7] px-4 py-24 text-center text-stone-600">Chargement de la location...</div>;
  }

  if (!rental) {
    return (
      <div className="bg-[#fbfaf7] px-4 py-24 text-center">
        <h1 className="mb-4 text-2xl font-semibold text-stone-950">Location non trouvée</h1>
        <Link to="/location">
          <Button>Retour aux locations</Button>
        </Link>
      </div>
    );
  }

  const selectedRangeHasConflict = Boolean(bookingRange?.from && bookingRange.to && hasRentalRangeConflict(bookingRange.from, bookingRange.to, rentalBookings));
  const availablePeriods = nextRentalAvailablePeriods(rentalBookings);

  return (
    <div className="bg-[#fbfaf7] pb-16">
      <section className="border-b border-stone-200 bg-white text-stone-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-8 text-stone-950 hover:bg-stone-100 hover:text-stone-950"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <Badge className="mb-4 rounded-md bg-[#d6a02a] text-black hover:bg-[#d6a02a]">{rental.category}</Badge>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">{rental.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">{rental.description}</p>
            </div>
            <div className="rounded-md border border-stone-200 bg-[#fbfaf7] p-5">
              <p className="text-sm text-stone-600">À partir de</p>
              <p className="mt-1 text-3xl font-semibold text-[#d6a02a]">{formatRentalPrice(rental, "daily", currency)}</p>
              <div className="mt-4 rounded-md bg-stone-100 p-1">
                {[
                  { value: "fcfa", label: "FCFA" },
                  { value: "eur", label: "EUR" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCurrency(option.value as "fcfa" | "eur")}
                    className={`w-1/2 rounded px-3 py-2 text-sm font-semibold transition ${
                      currency === option.value ? "bg-[#d6a02a] text-black" : "text-stone-700 hover:bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-4 grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <main className="space-y-8 lg:col-span-2">
          <Card className="rounded-md border-stone-200 bg-white shadow-sm">
            <CardContent className="p-4 md:p-6">
              <RentalDetailGallery rental={rental} />
            </CardContent>
          </Card>

          <Card className="rounded-md border-stone-200 bg-white shadow-sm">
            <CardContent className="p-6 md:p-8">
              <h2 className="mb-4 text-2xl font-semibold text-stone-950">Descriptif du logement</h2>
              <p className="text-base leading-8 text-stone-700">{rental.description}</p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-md bg-[#fbfaf7] p-4">
                  <MapPin className="mb-3 h-5 w-5 text-emerald-800" />
                  <p className="text-sm font-semibold text-stone-950">Localisation</p>
                  <p className="mt-1 text-sm text-stone-600">{rental.location}</p>
                </div>
                <div className="rounded-md bg-[#fbfaf7] p-4">
                  <Home className="mb-3 h-5 w-5 text-emerald-800" />
                  <p className="text-sm font-semibold text-stone-950">Type</p>
                  <p className="mt-1 text-sm text-stone-600">{rental.category}</p>
                </div>
                <div className="rounded-md bg-[#fbfaf7] p-4">
                  <ShieldCheck className="mb-3 h-5 w-5 text-emerald-800" />
                  <p className="text-sm font-semibold text-stone-950">Statut</p>
                  <p className="mt-1 text-sm text-stone-600">{rental.available ? "Disponible" : "Indisponible"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md border-stone-200 bg-white shadow-sm">
            <CardContent className="p-6 md:p-8">
              <h2 className="mb-5 text-2xl font-semibold text-stone-950">Équipements</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {rental.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-start gap-3 rounded-md bg-emerald-50 p-4">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-800" />
                    <span className="text-sm leading-6 text-stone-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>

        <aside className="lg:col-span-1">
          <Card className="sticky top-24 rounded-md border-stone-200 bg-white shadow-lg">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-stone-950">Réserver ce logement</h2>
                  <p className="mt-1 text-sm text-stone-600">Choisissez vos dates avant de payer.</p>
                </div>
                {rental.available ? (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><CheckCircle className="mr-1 h-3 w-3" />Disponible</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-stone-100 text-stone-700"><XCircle className="mr-1 h-3 w-3" />Indisponible</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md border border-stone-200 p-3">
                  <p className="text-stone-500">Jour</p>
                  <p className="font-semibold text-stone-950">{formatRentalPrice(rental, "daily", currency)}</p>
                </div>
                <div className="rounded-md border border-stone-200 p-3">
                  <p className="text-stone-500">Mois</p>
                  <p className="font-semibold text-stone-950">{formatRentalPrice(rental, "monthly", currency)}</p>
                </div>
              </div>

              <div className="rounded-md bg-stone-50 p-4">
                <p className="font-semibold text-stone-950">Disponibilités locataire</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {rental.tenant.availableSlots.map((slot) => (
                    <span key={slot} className="rounded bg-white px-2 py-1 text-xs text-stone-600 ring-1 ring-stone-200">{slot}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-stone-200 p-4">
                <p className="flex items-center gap-2 font-semibold text-stone-950"><UserRound className="h-4 w-4 text-emerald-800" />Locataire</p>
                <p className="mt-2 text-sm text-stone-700">{rental.tenant.fullName}</p>
                <p className="text-xs text-stone-500">{rental.tenant.location}</p>
                <p className="mt-3 text-xs leading-5 text-stone-500">Les coordonnées complètes sont affichées après acceptation de la demande.</p>
              </div>

              {availablePeriods.length > 0 && (
                <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4 text-sm">
                  <p className="font-semibold text-emerald-950">Périodes disponibles</p>
                  <div className="mt-3 space-y-2">
                    {availablePeriods.map((period) => (
                      <p key={`${period.start}-${period.end}`} className="text-emerald-900">
                        Du {formatDisplayDate(period.start)} au {formatDisplayDate(period.end)}
                      </p>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-emerald-800">
                    Les jours rouges du calendrier restent indisponibles.
                  </p>
                </div>
              )}

              <Button
                type="button"
                disabled={!rental.available}
                onClick={openBookingCalendar}
                className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800 disabled:bg-stone-300 disabled:text-stone-600"
                size="lg"
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                Réserver
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Dialog open={bookingOpen} onOpenChange={(open) => !open && closeBookingCalendar()}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Réserver une location</DialogTitle>
            <DialogDescription>
              Choisissez une date de début et une date de fin pour envoyer votre demande au locataire.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
            <div className="rounded-md border border-stone-200 bg-white p-3">
              <CalendarComponent
                mode="range"
                selected={bookingRange}
                onSelect={setBookingRange}
                disabled={(date) => date < startOfToday() || isRentalDateBlocked(date, rentalBookings)}
                modifiers={{
                  unavailable: (date) => isRentalDateBlocked(date, rentalBookings),
                  available: (date) => date >= startOfToday() && !isRentalDateBlocked(date, rentalBookings),
                }}
                modifiersClassNames={{
                  unavailable: "bg-red-100 text-red-800 line-through hover:bg-red-100",
                  available: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
                }}
                locale={fr}
                className="mx-auto"
              />
              <div className="mt-3 flex flex-wrap gap-3 px-2 text-xs text-stone-600">
                <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-100 ring-1 ring-emerald-200" /> Disponible</span>
                <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-100 ring-1 ring-red-200" /> Non disponible</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Badge className="mb-3 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{rental.category}</Badge>
                <h3 className="text-xl font-semibold text-stone-950">{rental.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{rental.location}</p>
              </div>

              <div className="rounded-md bg-stone-50 p-4">
                <p className="font-semibold text-stone-950">Disponibilités locataire</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {rental.tenant.availableSlots.map((slot) => (
                    <span key={slot} className="rounded bg-white px-2 py-1 text-xs text-stone-600 ring-1 ring-stone-200">{slot}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-950">
                <p className="font-semibold">Période sélectionnée</p>
                <p className="mt-1">Début : {bookingRange?.from ? format(bookingRange.from, "PPP", { locale: fr }) : "à choisir"}</p>
                <p>Fin : {bookingRange?.to ? format(bookingRange.to, "PPP", { locale: fr }) : "à choisir"}</p>
                {bookingRange?.from && bookingRange.to && (
                  <div className="mt-3 rounded bg-white p-3 ring-1 ring-emerald-100">
                    <p className="text-xs text-emerald-800">
                      Durée estimée : {rentalStayDuration(bookingRange.from, bookingRange.to)} nuit{rentalStayDuration(bookingRange.from, bookingRange.to) > 1 ? "s" : ""}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-emerald-950">
                      Total estimé : {formatRentalBookingTotal(rental, bookingRange.from, bookingRange.to, currency)}
                    </p>
                    <p className="mt-1 text-xs text-emerald-800">
                      {rentalBookingBreakdown(rental, bookingRange.from, bookingRange.to, currency)}
                    </p>
                  </div>
                )}
                {selectedRangeHasConflict && (
                  <p className="mt-2 rounded-md border border-red-100 bg-red-50 p-2 text-xs font-medium text-red-800">
                    Cette période croise une réservation déjà en attente ou acceptée.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="rental-detail-message">Question au propriétaire</Label>
                <Textarea
                  id="rental-detail-message"
                  value={bookingMessage}
                  onChange={(event) => setBookingMessage(event.target.value)}
                  placeholder="Ex : heure d'arrivée, remise des clés, équipement nécessaire..."
                  className="mt-1 min-h-24"
                />
                <p className="mt-2 flex items-center gap-1 text-xs text-stone-500">
                  <MessageCircle className="h-3 w-3" />
                  Le message sera visible dans le suivi client et côté traitement propriétaire.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeBookingCalendar}>Annuler</Button>
            <Button type="button" disabled={!bookingRange?.from || !bookingRange.to || selectedRangeHasConflict || isSubmittingBooking} onClick={confirmRentalBooking} className="bg-emerald-900 text-white hover:bg-emerald-800">
              {isSubmittingBooking ? "Traitement..." : "Envoyer et payer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RentalPhotoGallery({ rental }: { rental: Rental }) {
  const photos = rental.images.length ? rental.images : [{ id: Number(rental.id), url: rental.image, alt: rental.imageAlt }];
  const [activePhotoUrl, setActivePhotoUrl] = useState(photos[0]?.url ?? rental.image);
  const activePhoto = photos.find((photo) => photo.url === activePhotoUrl) ?? photos[0];

  return (
    <div className="shrink-0">
      <div
        className="relative h-56 bg-cover bg-center"
        role="img"
        aria-label={activePhoto?.alt || rental.title}
        style={{ backgroundImage: `url('${activePhoto?.url ?? rental.image}')` }}
      >
        {photos.length > 1 && (
          <div className="absolute right-3 top-3 rounded bg-stone-950/75 px-2 py-1 text-xs font-medium text-white">
            {photos.length} photos
          </div>
        )}
      </div>
      {photos.length > 1 && (
        <div className="grid h-16 grid-cols-4 gap-2 border-b border-stone-200 bg-stone-50 p-2">
          {photos.slice(0, 4).map((photo) => (
            <button
              key={`${rental.id}-${photo.id}-${photo.url}`}
              type="button"
              aria-label={`Afficher ${photo.alt || rental.title}`}
              onClick={(event) => {
                event.stopPropagation();
                setActivePhotoUrl(photo.url);
              }}
              className={`h-12 rounded border bg-cover bg-center transition ${activePhoto?.url === photo.url ? "border-emerald-800 ring-2 ring-emerald-100" : "border-stone-200 hover:border-stone-400"}`}
              style={{ backgroundImage: `url('${photo.url}')` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RentalDetailGallery({ rental }: { rental: Rental }) {
  const photos = rental.images.length ? rental.images : [{ id: Number(rental.id), url: rental.image, alt: rental.imageAlt }];
  const [activePhotoUrl, setActivePhotoUrl] = useState(photos[0]?.url ?? rental.image);
  const activePhoto = photos.find((photo) => photo.url === activePhotoUrl) ?? photos[0];

  return (
    <div className="space-y-3">
      <div
        className="relative min-h-[360px] rounded-md bg-cover bg-center md:min-h-[500px]"
        role="img"
        aria-label={activePhoto?.alt || rental.title}
        style={{ backgroundImage: `url('${activePhoto?.url ?? rental.image}')` }}
      >
        <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-md bg-stone-950/80 px-3 py-2 text-sm font-medium text-white">
          <Camera className="h-4 w-4" />
          {photos.length} photo{photos.length > 1 ? "s" : ""}
        </div>
      </div>

      {photos.length > 1 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.slice(0, 8).map((photo) => (
            <button
              key={`${rental.id}-detail-${photo.id}-${photo.url}`}
              type="button"
              aria-label={`Afficher ${photo.alt || rental.title}`}
              onClick={() => setActivePhotoUrl(photo.url)}
              className={`h-24 rounded-md border bg-cover bg-center transition ${activePhoto?.url === photo.url ? "border-[#d6a02a] ring-2 ring-[#d6a02a]/25" : "border-stone-200 hover:border-stone-400"}`}
              style={{ backgroundImage: `url('${photo.url}')` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

async function findRentalById(id: string) {
  const response = await searchRentals({ page: 1, limit: 100 });
  return response.items.find((rental) => rental.id === id) ?? null;
}

function formatRentalPrice(rental: Rental, period: "daily" | "monthly", currency: "fcfa" | "eur") {
  if (currency === "eur") {
    const value = period === "daily" ? rental.dailyPriceEur : rental.monthlyPriceEur;
    return `${value.toLocaleString("fr-FR")} €`;
  }

  const value = period === "daily" ? rental.dailyPriceFcfa : rental.monthlyPriceFcfa;
  return `${value.toLocaleString("fr-FR")} FCFA`;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function toIsoDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function isRentalDateBlocked(date: Date, bookings: RentalBooking[]) {
  const day = toIsoDate(date);

  return bookings.some((booking) => (
    ["pending", "accepted"].includes(booking.status) &&
    booking.startDate <= day &&
    booking.endDate > day
  ));
}

function hasRentalRangeConflict(startDate: Date, endDate: Date, bookings: RentalBooking[]) {
  const start = toIsoDate(startDate);
  const end = toIsoDate(endDate);

  return bookings.some((booking) => (
    ["pending", "accepted"].includes(booking.status) &&
    booking.startDate < end &&
    booking.endDate > start
  ));
}

function nextRentalAvailablePeriods(bookings: RentalBooking[]) {
  const today = startOfToday();
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + 90);

  const blockedRanges = bookings
    .filter((booking) => ["pending", "accepted"].includes(booking.status))
    .map((booking) => ({
      start: new Date(`${booking.startDate}T00:00:00`),
      end: new Date(`${booking.endDate}T00:00:00`),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const periods: { start: string; end: string }[] = [];
  let cursor = new Date(today);

  for (const range of blockedRanges) {
    if (range.end <= cursor) continue;

    if (range.start > cursor) {
      const availableEnd = new Date(range.start);
      periods.push({ start: toIsoDate(cursor), end: toIsoDate(availableEnd) });
      if (periods.length >= 3) return periods;
    }

    if (range.end > cursor) {
      cursor = new Date(range.end);
    }
  }

  if (cursor < horizon && periods.length < 3) {
    periods.push({ start: toIsoDate(cursor), end: toIsoDate(horizon) });
  }

  return periods;
}

function rentalStayDuration(startDate: Date, endDate: Date) {
  return Math.max(1, differenceInCalendarDays(endDate, startDate));
}

function formatRentalBookingTotal(rental: Rental, startDate: Date, endDate: Date, currency: "fcfa" | "eur") {
  const estimate = rentalBookingEstimate(rental, startDate, endDate, currency);
  return formatRentalMoney(estimate.total, currency);
}

function rentalBookingBreakdown(rental: Rental, startDate: Date, endDate: Date, currency: "fcfa" | "eur") {
  const estimate = rentalBookingEstimate(rental, startDate, endDate, currency);
  const dayLabel = estimate.remainingDays > 1 ? "nuits" : "nuit";

  if (estimate.months === 0) {
    return `${estimate.remainingDays} ${dayLabel} x ${formatRentalMoney(estimate.dailyPrice, currency)}`;
  }

  const monthLabel = estimate.months > 1 ? "mois" : "mois";
  const monthPart = `${estimate.months} ${monthLabel} x ${formatRentalMoney(estimate.monthlyPrice, currency)}`;

  if (estimate.remainingDays === 0) {
    return monthPart;
  }

  return `${monthPart} + ${estimate.remainingDays} ${dayLabel} x ${formatRentalMoney(estimate.dailyPrice, currency)}`;
}

function rentalBookingEstimate(rental: Rental, startDate: Date, endDate: Date, currency: "fcfa" | "eur") {
  const nights = rentalStayDuration(startDate, endDate);
  const dailyPrice = currency === "eur" ? rental.dailyPriceEur : rental.dailyPriceFcfa;
  const monthlyPrice = currency === "eur" ? rental.monthlyPriceEur : rental.monthlyPriceFcfa;
  const months = Math.floor(nights / 30);
  const remainingDays = nights % 30;
  const total = months > 0 ? months * monthlyPrice + remainingDays * dailyPrice : nights * dailyPrice;

  return {
    dailyPrice,
    monthlyPrice,
    months,
    remainingDays: months > 0 ? remainingDays : nights,
    total,
  };
}

function formatRentalMoney(value: number, currency: "fcfa" | "eur") {
  return currency === "eur"
    ? `${value.toLocaleString("fr-FR")} €`
    : `${value.toLocaleString("fr-FR")} FCFA`;
}

function formatDisplayDate(value: string) {
  return format(new Date(`${value}T00:00:00`), "dd/MM/yyyy", { locale: fr });
}

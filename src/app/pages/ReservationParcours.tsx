import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { Calendar, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Calendar as CalendarComponent } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createBooking, createStripeCheckout, getClientSession, getTour, Tour } from "../lib/api";
import { clearClientSessionToken, clientLoginPath, readClientSessionToken } from "../lib/clientSession";

export function ReservationParcours() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [date, setDate] = useState<Date>();
  const [duration, setDuration] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const token = readClientSessionToken();

    if (!token) {
      navigate(clientLoginPath(`${pathname}${search}`), { replace: true });
      return;
    }

    if (!id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    getClientSession({ sessionToken: token })
      .then(({ client }) => {
        setCustomerName(client.fullName || `${client.firstName} ${client.lastName}`.trim());
        setCustomerEmail(client.email);
        setCustomerPhone(`${client.phonePrefix} ${client.phone}`.trim());

        return getTour(id);
      })
      .then((loadedTour) => {
        if (!cancelled) setTour(loadedTour);
      })
      .catch(() => {
        clearClientSessionToken();
        if (!cancelled) navigate(clientLoginPath(`${pathname}${search}`), { replace: true });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, navigate, pathname, search]);

  if (isLoading) {
    return <div className="bg-[#fbfaf7] px-4 py-24 text-center text-stone-600">Chargement de la réservation...</div>;
  }

  if (!tour) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Parcours non trouvé</h1>
        <Button onClick={() => navigate("/parcours")}>Retour aux parcours</Button>
      </div>
    );
  }

  const selectedDuration = tour.durations.find((d) => d.days.toString() === duration);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !duration || !selectedDuration || !customerName || !customerEmail || !customerPhone) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsProcessing(true);

    try {
      const booking = await createBooking({
        type: 'tour',
        tour: `/api/tours/${tour.id}`,
        date: date.toISOString(),
        duration: parseInt(duration),
        price: selectedDuration?.priceFcfa || 0,
        status: 'pending',
        providerStatus: 'pending',
        paymentStatus: 'paid',
        refundAmount: 0,
        customerName,
        customerEmail,
        customerPhone
      });

      const checkout = await createStripeCheckout({
        name: `Parcours ORITA - ${tour.title} #${booking.id}`,
        amountEur: selectedDuration.priceEur,
        successUrl: `${window.location.origin}/mon-espace/suivi?payment=success&booking=${booking.id}`,
        cancelUrl: `${window.location.origin}/mon-espace/suivi?payment=cancel&booking=${booking.id}`,
        bookingId: booking.id,
        type: "tour",
        customerEmail,
      });

      if (checkout.mode === "stripe" && checkout.url) {
        window.location.assign(checkout.url);
        return;
      }

      setIsProcessing(false);
      toast.success(`Réservation enregistrée ! Numéro : ${booking.id}`, {
        description: checkout.message ?? "Paiement Stripe en mode démo. Le guide doit accepter la prestation avant les QR journaliers.",
      });
      setTimeout(() => navigate(`/mon-espace/suivi`), 2000);
    } catch {
      setIsProcessing(false);
      toast.error("Impossible d'enregistrer la réservation dans l'API");
    }
  };

  return (
    <div className="bg-[#fbfaf7] py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Réservation parcours</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950 md:text-5xl">{tour.title}</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="rounded-md border-stone-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Informations de réservation</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="date">Date de début *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="mt-1 w-full justify-start rounded-md text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: fr }) : "Choisir une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="duration">Durée du parcours *</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionnez une durée" />
                      </SelectTrigger>
                      <SelectContent>
                        {tour.durations.map((d) => (
                          <SelectItem key={d.days} value={d.days.toString()}>
                            {d.days} jour{d.days > 1 ? 's' : ''} - {d.priceEur.toLocaleString()} € / {d.priceFcfa.toLocaleString()} FCFA
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t border-stone-200 pt-6">
                    <h3 className="mb-4 font-semibold text-stone-950">Vos coordonnées</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nom complet *</Label>
                        <Input
                          id="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Jean Dupont"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="jean.dupont@email.com"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Téléphone / WhatsApp *</Label>
                        <Input
                          id="phone"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+229 97 12 34 56"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-6">
                    <div className="mb-4 rounded-md bg-emerald-50 p-4">
                      <p className="text-sm leading-6 text-emerald-900">
                        <strong>Paiement sécurisé :</strong> vous serez redirigé vers Stripe sandbox. ORITA conserve le paiement jusqu'à acceptation et validation du QR code de chaque jour.
                      </p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" 
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Traitement en cours..." : "Confirmer et payer"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-md border-stone-200 bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-stone-500">Parcours</p>
                    <p className="font-medium">{tour.title}</p>
                  </div>

                  {date && (
                    <div>
                      <p className="text-sm text-stone-500">Date de départ</p>
                      <p className="font-medium">{format(date, "PPP", { locale: fr })}</p>
                    </div>
                  )}

                  {duration && selectedDuration && (
                    <div>
                      <p className="text-sm text-stone-500">Durée</p>
                      <p className="font-medium">{selectedDuration.days} jour{selectedDuration.days > 1 ? 's' : ''}</p>
                    </div>
                  )}

                  <div className="border-t border-stone-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-semibold text-emerald-800">
                        {selectedDuration ? `${selectedDuration.priceEur.toLocaleString()} €` : '0 €'}
                      </span>
                    </div>
                    {selectedDuration && <p className="mt-1 text-right text-sm text-stone-500">{selectedDuration.priceFcfa.toLocaleString()} FCFA</p>}
                  </div>

                  <div className="rounded-md bg-emerald-50 p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-800" />
                      <div className="text-sm">
                        <p className="font-medium text-emerald-800">Service A à Z inclus</p>
                        <p className="text-emerald-700">Prise en charge complète</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

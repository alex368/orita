import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Calendar, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Calendar as CalendarComponent } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createBooking, createStripeCheckout, Driver, getClientSession, getDrivers } from "../lib/api";
import { clearClientSessionToken, clientLoginPath, readClientSessionToken } from "../lib/clientSession";

export function ReservationChauffeur() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const preferredDriverId = new URLSearchParams(search).get("driver");

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date>();
  const [durationType, setDurationType] = useState<"1" | "30">("1");
  const [selectedDriverId, setSelectedDriverId] = useState<string>(preferredDriverId ?? "auto");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const availableDrivers = drivers.filter(d => d.available);
  const selectedDriver = selectedDriverId === "auto"
    ? availableDrivers[0]
    : drivers.find(d => d.id === selectedDriverId);
  const pricingDriver = selectedDriver ?? availableDrivers[0] ?? drivers[0];
  const price = durationType === "1" ? (pricingDriver?.dailyPriceFcfa ?? 0) : (pricingDriver?.monthlyPriceFcfa ?? 0);
  const priceEur = durationType === "1" ? (pricingDriver?.dailyPriceEur ?? 0) : (pricingDriver?.monthlyPriceEur ?? 0);

  useEffect(() => {
    const token = readClientSessionToken();

    if (!token) {
      navigate(clientLoginPath(`${pathname}${search}`), { replace: true });
      return;
    }

    let cancelled = false;

    getClientSession({ sessionToken: token })
      .then(({ client }) => {
        setCustomerName(client.fullName || `${client.firstName} ${client.lastName}`.trim());
        setCustomerEmail(client.email);
        setCustomerPhone(`${client.phonePrefix} ${client.phone}`.trim());

        return getDrivers();
      })
      .then((loadedDrivers) => {
        if (cancelled) return;
        const publicDrivers = loadedDrivers.filter((driver) => driver.validationStatus === "validated");
        setDrivers(publicDrivers);
        if (preferredDriverId && publicDrivers.some((driver) => driver.id === preferredDriverId)) {
          setSelectedDriverId(preferredDriverId);
        }
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
  }, [navigate, pathname, preferredDriverId, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !customerName || !customerEmail || !customerPhone) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsProcessing(true);

    const driver = selectedDriver;
    const isAvailable = Boolean(driver?.available);

    try {
      const booking = await createBooking({
        type: 'driver',
        driver: driver ? `/api/drivers/${driver.id}` : undefined,
        date: date.toISOString(),
        duration: parseInt(durationType),
        price,
        status: isAvailable ? 'pending' : 'unavailable',
        providerStatus: 'pending',
        paymentStatus: isAvailable ? 'paid' : 'refunded',
        refundAmount: isAvailable ? 0 : price,
        customerName,
        customerEmail,
        customerPhone
      });

      if (isAvailable) {
        const checkout = await createStripeCheckout({
          name: `Chauffeur ORITA - ${driver?.name ?? "assignation automatique"} #${booking.id}`,
          amountEur: priceEur,
          successUrl: `${window.location.origin}/mon-espace/suivi?payment=success&booking=${booking.id}`,
          cancelUrl: `${window.location.origin}/mon-espace/suivi?payment=cancel&booking=${booking.id}`,
          bookingId: booking.id,
          type: "driver",
          customerEmail,
        });

        if (checkout.mode === "stripe" && checkout.url) {
          window.location.assign(checkout.url);
          return;
        }

        setIsProcessing(false);
        toast.success(`Réservation enregistrée ! Numéro : ${booking.id}`, {
          description: checkout.message ?? `${driver?.name ? `Le chauffeur ${driver.name} doit accepter la prise en charge.` : "Un chauffeur sera associé à la demande."}`
        });
        setTimeout(() => navigate("/mon-espace/suivi"), 2000);
      } else {
        setIsProcessing(false);
        toast.error("Chauffeur indisponible", {
          description: "Vous serez remboursé sous 48h. Désolé pour le désagrément."
        });

        setTimeout(() => {
          navigate("/chauffeurs");
        }, 3000);
      }
    } catch {
      setIsProcessing(false);
      toast.error("Impossible d'enregistrer la réservation dans l'API");
    }
  };

  if (isLoading) {
    return <div className="bg-[#fbfaf7] px-4 py-24 text-center text-stone-600">Chargement des chauffeurs...</div>;
  }

  return (
    <div className="bg-[#fbfaf7] py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Réservation chauffeur</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950 md:text-5xl">Réserver un chauffeur</h1>
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
                    <Label>Durée de location *</Label>
                    <RadioGroup value={durationType} onValueChange={(val) => setDurationType(val as "1" | "30")} className="mt-2">
                      <div className="flex items-center space-x-2 rounded-md border border-stone-200 p-4">
                        <RadioGroupItem value="1" id="day" />
                        <Label htmlFor="day" className="flex-1 cursor-pointer">
                          <div className="font-medium">1 journée</div>
                          <div className="text-sm text-stone-600">
                            {(pricingDriver?.dailyPriceEur ?? 0).toLocaleString()} € / {(pricingDriver?.dailyPriceFcfa ?? 0).toLocaleString()} FCFA
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-md border border-stone-200 p-4">
                        <RadioGroupItem value="30" id="month" />
                        <Label htmlFor="month" className="flex-1 cursor-pointer">
                          <div className="font-medium">1 mois (30 jours)</div>
                          <div className="text-sm text-stone-600">
                            {(pricingDriver?.monthlyPriceEur ?? 0).toLocaleString()} € / {(pricingDriver?.monthlyPriceFcfa ?? 0).toLocaleString()} FCFA
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

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
                    <Label htmlFor="driver">Chauffeur préféré (optionnel)</Label>
                    <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pas de préférence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Pas de préférence</SelectItem>
                        {availableDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name} - {driver.zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedDriverId === "auto" && (
                      <p className="mt-1 text-sm text-stone-500">
                        Un chauffeur disponible vous sera assigné automatiquement
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-3 rounded-md bg-blue-50 p-4">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Confirmation sous 24h</p>
                      <p>
                        Votre demande sera vérifiée. Si aucun chauffeur n'est disponible, 
                        vous serez remboursé automatiquement sous 48h.
                      </p>
                    </div>
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
                        <strong>Paiement sécurisé :</strong> vous serez redirigé vers Stripe sandbox. Le chauffeur ne sera payé qu'après acceptation et validation du QR code par le client.
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
                    <p className="text-sm text-stone-500">Service</p>
                    <p className="font-medium">Chauffeur privé</p>
                  </div>

                  <div>
                    <p className="text-sm text-stone-500">Durée</p>
                    <p className="font-medium">
                      {durationType === "1" ? "1 journée" : "1 mois (30 jours)"}
                    </p>
                  </div>

                  {date && (
                    <div>
                      <p className="text-sm text-gray-600">Date de début</p>
                      <p className="font-medium">{format(date, "PPP", { locale: fr })}</p>
                    </div>
                  )}

                  {selectedDriverId && selectedDriverId !== "auto" && (
                    <div>
                      <p className="text-sm text-gray-600">Chauffeur</p>
                      <p className="font-medium">
                        {drivers.find(d => d.id === selectedDriverId)?.name}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-stone-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-semibold text-emerald-800">
                        {priceEur.toLocaleString()} €
                      </span>
                    </div>
                    <p className="mt-1 text-right text-sm text-stone-500">{price.toLocaleString()} FCFA</p>
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

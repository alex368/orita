import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import {
  CalendarDays,
  Car,
  CheckCircle,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  Home,
  KeyRound,
  LogOut,
  MessageCircle,
  Phone,
  Search,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "../components/BrandLogo";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Booking, BookingDocumentKind, ClientAccount, ContactRequest, createContactRequest, downloadBookingDocument, Driver, getBookings, getClientSession, getContactRequestsForEmail, getDrivers, getRentalBookings, getTours, registerClientAccount, requestClientLoginCode, RentalBooking, sendBookingDocumentEmail, Tour, updateClientProfile, verifyClientCode } from "../lib/api";
import { clearClientSessionToken, readClientSessionToken, safeClientRedirect, writeClientSessionToken } from "../lib/clientSession";

type ClientSession = Pick<ClientAccount, "firstName" | "lastName" | "email" | "phonePrefix" | "phone"> & {
  guestBookingId?: number;
};

type ClientSection = "dashboard" | "reservations" | "tours" | "drivers" | "locations" | "documents" | "messages" | "profile";

const FCFA_PER_EUR = 655.957;
const bookingDocuments: { kind: BookingDocumentKind; label: string }[] = [
  { kind: "confirmation", label: "Confirmation" },
  { kind: "facture", label: "Facture" },
  { kind: "programme", label: "Programme" },
  { kind: "conditions", label: "Conditions" },
  { kind: "bon-echange", label: "Bon d'échange" },
];

const clientNav: { id: ClientSection; label: string; icon: LucideIcon; path: string }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: Home, path: "/mon-espace" },
  { id: "reservations", label: "Mes réservations", icon: CalendarDays, path: "/mon-espace/reservations" },
  { id: "tours", label: "Mes parcours", icon: FileText, path: "/mon-espace/parcours" },
  { id: "drivers", label: "Mes chauffeurs", icon: Car, path: "/mon-espace/chauffeurs" },
  { id: "locations", label: "Mes locations", icon: KeyRound, path: "/mon-espace/locations" },
  { id: "documents", label: "Mes documents", icon: Download, path: "/mon-espace/documents" },
  { id: "messages", label: "Mes messages", icon: MessageCircle, path: "/mon-espace/messages" },
  { id: "profile", label: "Mon profil", icon: User, path: "/mon-espace/profil" },
];

export function ClientSpace() {
  const { pathname } = useLocation();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<ClientSession | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = readClientSessionToken();
    if (!token) return;
    getClientSession({ sessionToken: token })
      .then((response) => setSession(toSession(response.client)))
      .catch(() => clearClientSessionToken());
  }, []);

  useEffect(() => {
    if (!session) return;
    setIsLoading(true);
    Promise.all([getBookings(), getRentalBookings({ email: session.email }), getTours(), getDrivers()])
      .then(([loadedBookings, loadedRentalBookings, loadedTours, loadedDrivers]) => {
        setBookings(loadedBookings);
        setRentalBookings(loadedRentalBookings);
        setTours(loadedTours);
        setDrivers(loadedDrivers);
      })
      .catch(() => toast.error("Impossible de charger vos réservations"))
      .finally(() => setIsLoading(false));
  }, [session]);

  if (pathname.endsWith("/inscription")) {
    return <RegisterPage onAuthenticated={setSession} />;
  }

  if (pathname.endsWith("/mot-de-passe-oublie")) {
    return <ForgotPasswordPage />;
  }

  if (pathname.endsWith("/suivi") && !session) {
    return <GuestTrackingPage onAuthenticated={setSession} />;
  }

  if (!session) {
    return <LoginPage onAuthenticated={setSession} />;
  }

  const clientBookings = bookings.filter((booking) => {
    if (session.guestBookingId) {
      return booking.id === session.guestBookingId && booking.customerEmail.toLowerCase() === session.email.toLowerCase();
    }
    return booking.customerEmail.toLowerCase() === session.email.toLowerCase();
  });

  const detailBooking = bookingId ? clientBookings.find((booking) => String(booking.id) === bookingId) : null;
  const activeSection = getSectionFromPath(pathname);

  const logout = () => {
    clearClientSessionToken();
    setSession(null);
    navigate("/mon-espace");
  };

  if (bookingId) {
    return (
      <ClientShell activeSection="reservations" session={session} onLogout={logout}>
        {detailBooking ? (
          <BookingDetail booking={detailBooking} tours={tours} drivers={drivers} />
        ) : (
          <EmptyState title="Réservation introuvable" text="Cette réservation n'est pas rattachée à votre accès client." />
        )}
      </ClientShell>
    );
  }

  return (
    <ClientShell activeSection={activeSection} session={session} onLogout={logout}>
      {isLoading && <div className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">Chargement de votre espace...</div>}
      {activeSection === "dashboard" && <ClientDashboard session={session} bookings={clientBookings} rentalBookings={rentalBookings} tours={tours} drivers={drivers} />}
      {activeSection === "reservations" && <ReservationsSection bookings={clientBookings} />}
      {activeSection === "tours" && <ClientToursSection bookings={clientBookings} tours={tours} />}
      {activeSection === "drivers" && <ClientDriversSection bookings={clientBookings} drivers={drivers} />}
      {activeSection === "locations" && <ClientLocationsSection rentalBookings={rentalBookings} />}
      {activeSection === "documents" && <DocumentsSection bookings={clientBookings} />}
      {activeSection === "messages" && <MessagesSection session={session} bookings={clientBookings} />}
      {activeSection === "profile" && <ProfileSection session={session} onUpdate={setSession} />}
    </ClientShell>
  );
}

function LoginPage({ onAuthenticated }: { onAuthenticated: (session: ClientSession) => void }) {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectTo = safeClientRedirect(new URLSearchParams(search).get("redirect"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingAccount, setPendingAccount] = useState<ClientAccount | null>(null);
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    requestClientLoginCode({ email, password })
      .then((response) => {
        if (response.sessionToken && response.client) {
          const session = toSession(response.client);
          if (remember) writeClientSessionToken(response.sessionToken);
          onAuthenticated(session);
          navigate(redirectTo);
          return;
        }
        setPendingAccount({ id: 0, firstName: "", lastName: "", email: response.email, phonePrefix: "", phone: "", marketing: false, verified: !!response.verified });
        setStep("code");
        toast.success("Code envoyé par email", { description: "Ouvre Mailpit pour récupérer le code de connexion." });
      })
      .catch(() => toast.error("Les identifiants renseignés sont incorrects."));
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!pendingAccount) return;
    try {
      const response = await verifyClientCode({ email: pendingAccount.email, code });
      const session = toSession(response.client);
      if (remember) writeClientSessionToken(response.sessionToken);
      onAuthenticated(session);
      navigate(redirectTo);
    } catch {
      toast.error("Code de vérification incorrect ou expiré.");
    }
  };

  return (
    <AuthLayout>
      {step === "credentials" ? (
        <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Adresse e-mail</Label>
          <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" placeholder="vous@email.com" />
        </div>
        <div>
          <Label>Mot de passe</Label>
          <div className="relative mt-1">
            <Input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" onClick={() => setShowPassword((value) => !value)} aria-label="Afficher ou masquer le mot de passe">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 text-stone-600"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Se souvenir de moi</label>
          <Link className="font-medium text-emerald-800" to="/mon-espace/mot-de-passe-oublie">Mot de passe oublié</Link>
        </div>
        <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800">Se connecter</Button>
        <div className="grid gap-2 text-center text-sm">
          <Link className="font-medium text-emerald-800" to={`/mon-espace/inscription?redirect=${encodeURIComponent(redirectTo)}`}>Créer un compte</Link>
          <Link className="font-medium text-stone-600" to="/mon-espace/suivi">Suivre une réservation sans compte</Link>
        </div>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-4">
          <div className="rounded-md bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
            Un code de vérification a été envoyé à {pendingAccount?.email}. Ouvre Mailpit pour récupérer le code.
          </div>
          <div>
            <Label>Code de vérification</Label>
            <Input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" inputMode="numeric" maxLength={6} className="mt-1 text-center text-lg tracking-[0.35em]" />
          </div>
          <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800">Valider et se connecter</Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => {
            setStep("credentials");
            setCode("");
            setPendingAccount(null);
          }}>
            Modifier mes identifiants
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

function RegisterPage({ onAuthenticated }: { onAuthenticated: (session: ClientSession) => void }) {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectTo = safeClientRedirect(new URLSearchParams(search).get("redirect"));
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phonePrefix: "+229", phone: "", password: "", confirm: "", terms: false, marketing: false });
  const [pendingAccount, setPendingAccount] = useState<ClientAccount | null>(null);
  const [code, setCode] = useState("");
  const strength = passwordStrength(form.password);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (strength.score < 5) {
      toast.error("Le mot de passe ne respecte pas les règles demandées.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("La confirmation du mot de passe ne correspond pas.");
      return;
    }
    if (!form.terms) {
      toast.error("Les conditions générales doivent être acceptées.");
      return;
    }
    registerClientAccount({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phonePrefix: form.phonePrefix,
      phone: form.phone,
      password: form.password,
      marketing: form.marketing,
    })
      .then((response) => {
        if (response.sessionToken && response.client) {
          const session = toSession(response.client);
          writeClientSessionToken(response.sessionToken);
          onAuthenticated(session);
          toast.success("Compte créé", { description: "Validation email désactivée pour les tests." });
          navigate(redirectTo);
          return;
        }
        setPendingAccount({ id: 0, firstName: form.firstName, lastName: form.lastName, email: response.email, phonePrefix: form.phonePrefix, phone: form.phone, marketing: form.marketing, verified: false });
        toast.success("Compte créé", { description: "Ouvre Mailpit pour récupérer le code de validation." });
      })
      .catch(() => toast.error("Un compte existe déjà avec cette adresse ou la création a échoué."));
  };

  const verifyRegistration = async (event: FormEvent) => {
    event.preventDefault();
    if (!pendingAccount) return;
    try {
      const response = await verifyClientCode({ email: pendingAccount.email, code });
      const session = toSession(response.client);
      writeClientSessionToken(response.sessionToken);
      onAuthenticated(session);
      toast.success("Compte validé", { description: "Les réservations avec la même adresse e-mail sont rattachées automatiquement." });
      navigate(redirectTo);
    } catch {
      toast.error("Code de validation incorrect ou expiré.");
    }
  };

  return (
    <AuthLayout title="Créer votre espace client" subtitle="Retrouvez vos réservations et le suivi de votre séjour.">
      {!pendingAccount ? (
        <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input required placeholder="Prénom" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input required placeholder="Nom" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
        <Input required type="email" placeholder="Adresse e-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <div className="grid grid-cols-[100px_1fr] gap-3">
          <Input required value={form.phonePrefix} onChange={(e) => setForm({ ...form, phonePrefix: e.target.value })} />
          <Input required placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <Input required type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div className="h-2 overflow-hidden rounded-full bg-stone-200"><div className="h-full bg-emerald-700" style={{ width: `${(strength.score / 5) * 100}%` }} /></div>
        <p className="text-xs text-stone-500">{strength.label}</p>
        <Input required type="password" placeholder="Confirmation du mot de passe" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        <label className="flex gap-2 text-sm text-stone-700"><input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} /> J'accepte les conditions générales.</label>
        <label className="flex gap-2 text-sm text-stone-700"><input type="checkbox" checked={form.marketing} onChange={(e) => setForm({ ...form, marketing: e.target.checked })} /> Recevoir les communications commerciales.</label>
        <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800">Créer le compte</Button>
        <Link className="block text-center text-sm font-medium text-emerald-800" to={`/mon-espace?redirect=${encodeURIComponent(redirectTo)}`}>Déjà un compte ? Se connecter</Link>
        </form>
      ) : (
        <form onSubmit={verifyRegistration} className="space-y-4">
          <div className="rounded-md bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
            Compte créé mais non validé. Un code a été envoyé à {pendingAccount.email}. Ouvre Mailpit pour le récupérer.
          </div>
          <div>
            <Label>Code reçu par email</Label>
            <Input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" inputMode="numeric" maxLength={6} className="mt-1 text-center text-lg tracking-[0.35em]" />
          </div>
          <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800">Valider mon compte</Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => requestClientLoginCode({ email: pendingAccount.email, password: form.password }).then(() => toast.success("Nouveau code envoyé"))}>Renvoyer le code</Button>
        </form>
      )}
    </AuthLayout>
  );
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  return (
    <AuthLayout title="Réinitialiser le mot de passe" subtitle="Un lien local de réinitialisation sera simulé.">
      <form onSubmit={(event) => {
        event.preventDefault();
        toast.success("Si un compte correspond à cette adresse, un e-mail de réinitialisation a été envoyé.");
      }} className="space-y-4">
        <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@email.com" />
        <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800">Recevoir un lien de réinitialisation</Button>
        <Link className="block text-center text-sm font-medium text-emerald-800" to="/mon-espace">Retour à la connexion</Link>
      </form>
    </AuthLayout>
  );
}

function GuestTrackingPage({ onAuthenticated }: { onAuthenticated: (session: ClientSession) => void }) {
  const navigate = useNavigate();
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!codeSent) {
      setCodeSent(true);
      toast.success("Code temporaire envoyé en mode local", { description: "Code de démonstration : 123456" });
      return;
    }
    if (code !== "123456") {
      toast.error("Code temporaire incorrect.");
      return;
    }
    const allBookings = await getBookings();
    const id = Number(reference.replace(/[^0-9]/g, ""));
    const booking = allBookings.find((item) => item.id === id && item.customerEmail.toLowerCase() === email.toLowerCase() && (!phone || item.customerPhone.includes(phone)));
    if (!booking) {
      toast.error("Aucune réservation ne correspond aux informations renseignées.");
      return;
    }
    const [firstName = "Client", ...lastNameParts] = booking.customerName.split(" ");
    const session: ClientSession = { firstName, lastName: lastNameParts.join(" "), email: booking.customerEmail, phonePrefix: "", phone: booking.customerPhone, guestBookingId: booking.id };
    onAuthenticated(session);
    navigate(`/mon-espace/reservations/${booking.id}`);
  };

  return (
    <AuthLayout title="Suivi sans compte" subtitle="Accédez uniquement à la réservation concernée.">
      <form onSubmit={submit} className="space-y-4">
        <Input required value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Référence, ex : #12" />
        <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Adresse e-mail utilisée" />
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone optionnel" />
        {codeSent && <Input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code temporaire 123456" inputMode="numeric" />}
        <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800">{codeSent ? "Vérifier et ouvrir" : "Recevoir le code"}</Button>
        <Link className="block text-center text-sm font-medium text-emerald-800" to="/mon-espace">Retour à la connexion</Link>
      </form>
    </AuthLayout>
  );
}

function ClientShell({ activeSection, session, onLogout, children }: { activeSection: ClientSection; session: ClientSession; onLogout: () => void; children: ReactNode }) {
  return (
    <div className="bg-[#f7f3eb]">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="h-fit rounded-md border border-stone-200 bg-white p-4 lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-900 font-semibold text-white">{session.firstName.slice(0, 1)}{session.lastName.slice(0, 1)}</div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{session.firstName} {session.lastName}</p>
              <p className="truncate text-xs text-stone-500">{session.email}</p>
            </div>
          </div>
          <nav className="mt-4 grid gap-1">
            {clientNav.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <Link key={item.id} to={item.path} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-emerald-900 text-white" : "text-stone-700 hover:bg-stone-100"}`}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Button variant="outline" className="mt-4 w-full justify-start" onClick={onLogout}><LogOut className="mr-2 h-4 w-4" />Déconnexion</Button>
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}

function ClientDashboard({ session, bookings, rentalBookings, tours, drivers }: { session: ClientSession; bookings: Booking[]; rentalBookings: RentalBooking[]; tours: Tour[]; drivers: Driver[] }) {
  const nextBooking = [...bookings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).find((booking) => new Date(booking.date) >= new Date()) ?? bookings[0];
  const pendingRentalBookings = rentalBookings.filter((booking) => booking.status === "pending");
  const totalPaid = bookings.reduce((sum, booking) => sum + paidAmount(booking), 0);
  const remaining = bookings.reduce((sum, booking) => sum + remainingAmount(booking), 0);

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-stone-200 bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Espace client</p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-950">Bonjour {session.firstName}, voici le suivi de votre prochain séjour.</h1>
      </div>

      {nextBooking ? <NextBookingCard booking={nextBooking} tours={tours} drivers={drivers} /> : <EmptyState title="Aucune réservation rattachée" text="Créez une réservation ou utilisez le suivi sans compte avec votre référence." />}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CalendarDays} label="À venir" value={String(bookings.filter((booking) => new Date(booking.date) >= new Date()).length)} />
        <Metric icon={CheckCircle} label="Terminés" value={String(bookings.filter((booking) => booking.status === "refunded").length)} />
        <Metric icon={KeyRound} label="Locations" value={String(rentalBookings.length)} />
        <Metric icon={Wallet} label="Payé" value={money(totalPaid)} />
        <Metric icon={CreditCard} label="Solde restant" value={money(remaining)} />
      </div>

      <Card className="rounded-md border-stone-200 bg-white">
        <CardHeader><CardTitle>Alertes</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <AlertItem icon={CreditCard} text="Paiement en attente ou solde à régler" count={bookings.filter((booking) => remainingAmount(booking) > 0).length} />
          <AlertItem icon={KeyRound} text="Locations en attente propriétaire" count={pendingRentalBookings.length} />
          <AlertItem icon={FileText} text="Documents disponibles" count={bookings.length * bookingDocuments.length} />
          <AlertItem icon={Car} text="Chauffeurs attribués" count={bookings.filter((booking) => booking.driver).length} />
          <AlertItem icon={MessageCircle} text="Messages non lus" count={bookings.length ? 1 : 0} />
        </CardContent>
      </Card>
    </div>
  );
}

function NextBookingCard({ booking, tours, drivers }: { booking: Booking; tours: Tour[]; drivers: Driver[] }) {
  const asset = booking.type === "tour" ? tours.find((tour) => tour.id === booking.tour?.id) : drivers.find((driver) => driver.id === booking.driver?.id);
  const daysBefore = Math.max(0, Math.ceil((new Date(booking.date).getTime() - Date.now()) / 86400000));
  return (
    <Card className="overflow-hidden rounded-md border-stone-200 bg-white">
      <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
        <div className="min-h-64 bg-cover bg-center" style={{ backgroundImage: `url('${asset?.image ?? "/assets/benin-placeholder.jpg"}')` }} />
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Badge className={statusClass(booking.status)}>{clientStatus(booking)}</Badge>
              <h2 className="mt-3 text-2xl font-semibold">{serviceName(booking)}</h2>
              <p className="mt-1 text-sm text-stone-600">Départ le {formatDate(booking.date)} · {booking.duration} jour{booking.duration > 1 ? "s" : ""} · #{booking.id}</p>
            </div>
            <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">{daysBefore} jour{daysBefore > 1 ? "s" : ""} avant départ</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Info label="Montant" value={money(booking.price)} />
            <Info label="Payé" value={money(paidAmount(booking))} />
            <Info label="Restant" value={money(remainingAmount(booking))} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/mon-espace/reservations/${booking.id}`}><Button className="rounded-md bg-emerald-900 text-white hover:bg-emerald-800">Voir le détail</Button></Link>
            <Button variant="outline" onClick={() => downloadDocument(booking, bookingDocuments[0])}>Télécharger la confirmation</Button>
            <Link to="/mon-espace/messages"><Button variant="outline">Contacter ORITA</Button></Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function ReservationsSection({ bookings }: { bookings: Booking[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const filtered = bookings.filter((booking) => {
    const matchQuery = [String(booking.id), serviceName(booking), booking.customerEmail, booking.status].some((value) => value.toLowerCase().includes(query.toLowerCase()));
    const matchStatus = status === "all" || booking.status === status;
    const matchType = type === "all" || booking.type === type;
    return matchQuery && matchStatus && matchType;
  });

  return (
    <SectionCard title="Mes réservations" description="Retrouvez les réservations à venir, en cours, terminées ou annulées.">
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" placeholder="Référence, prestation, statut..." /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-md border border-stone-200 bg-white px-3 text-sm"><option value="all">Tous statuts</option><option value="pending">En attente</option><option value="confirmed">Confirmée</option><option value="unavailable">Annulée</option><option value="refunded">Remboursée</option></select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-md border border-stone-200 bg-white px-3 text-sm"><option value="all">Toutes prestations</option><option value="tour">Parcours</option><option value="driver">Chauffeur</option></select>
      </div>
      <div className="grid gap-3">
        {filtered.map((booking) => <BookingRow key={booking.id} booking={booking} />)}
        {filtered.length === 0 && <EmptyState title="Aucune réservation" text="Aucun résultat ne correspond aux filtres." />}
      </div>
    </SectionCard>
  );
}

function BookingDetail({ booking, tours, drivers }: { booking: Booking; tours: Tour[]; drivers: Driver[] }) {
  const tour = booking.tour ? tours.find((item) => item.id === booking.tour?.id) : null;
  const driver = booking.driver ? drivers.find((item) => item.id === booking.driver?.id) : null;
  const [request, setRequest] = useState("");

  const payRemaining = () => {
    const remaining = remainingAmount(booking);
    if (remaining <= 0) {
      toast.success("Aucun solde à régler.");
      return;
    }
    toast.info("Paiement désactivé pour les tests", {
      description: "Le solde reste visible, mais aucun paiement Stripe n'est lancé.",
    });
  };

  return (
    <div className="space-y-6">
      <NextBookingCard booking={booking} tours={tours} drivers={drivers} />
      <SectionCard title="Frise de suivi" description="Les étapes importantes de votre réservation.">
        <div className="grid gap-3 md:grid-cols-3">
          {timelineSteps(booking).map((step) => <TimelineStep key={step.label} {...step} />)}
        </div>
      </SectionCard>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Informations de la prestation" description="Programme, inclus et recommandations.">
          {tour ? (
            <div className="space-y-4">
              <DetailList title="Programme" items={tour.itinerary.length ? tour.itinerary : ["Accueil", "Visite guidée", "Temps libre", "Retour"]} />
              <DetailList title="Inclus" items={tour.included} />
              <DetailList title="Non inclus" items={tour.notIncluded} />
              <DetailList title="Conseils voyage" items={tour.travelTips} />
            </div>
          ) : (
            <div className="space-y-3 text-sm text-stone-700">
              <p><strong>Chauffeur :</strong> {driver?.name ?? "Attribution en cours"}</p>
              <p><strong>Véhicule :</strong> {driver?.vehicleType ?? "À confirmer"}</p>
              <p><strong>Zone :</strong> {driver?.zone ?? "Bénin"}</p>
              <p><strong>Contact visible après confirmation :</strong> {booking.status === "confirmed" ? driver?.phone ?? booking.customerPhone : "En attente"}</p>
            </div>
          )}
        </SectionCard>
        <SectionCard title="Paiement et documents" description="Solde, reçus et documents téléchargeables.">
          <div className="space-y-3">
            <Info label="Montant total" value={money(booking.price)} />
            <Info label="Montant payé" value={money(paidAmount(booking))} />
            <Info label="Solde restant" value={money(remainingAmount(booking))} />
            <Button variant="outline" className="w-full rounded-md" onClick={payRemaining}>Paiement désactivé</Button>
            {bookingDocuments.map((doc) => (
              <div key={doc.kind} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Button variant="outline" className="justify-start" onClick={() => downloadDocument(booking, doc)}><Download className="mr-2 h-4 w-4" /> Télécharger {doc.label.toLowerCase()}</Button>
                <Button variant="outline" className="justify-start" onClick={() => emailDocument(booking, doc)}><MessageCircle className="mr-2 h-4 w-4" /> Envoyer</Button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Demande de modification ou annulation" description="La demande est envoyée à l'administration sans modifier automatiquement la réservation.">
        <form onSubmit={(event) => {
          event.preventDefault();
          setRequest("");
          toast.success("Demande de modification en attente", { description: "Elle est visible dans l'historique client local." });
        }} className="space-y-3">
          <Textarea required value={request} onChange={(e) => setRequest(e.target.value)} placeholder="Décrivez votre demande : changement de date, nombre de voyageurs, annulation..." />
          <Button className="rounded-md bg-emerald-900 text-white hover:bg-emerald-800">Envoyer la demande</Button>
        </form>
      </SectionCard>
    </div>
  );
}

function ClientToursSection({ bookings, tours }: { bookings: Booking[]; tours: Tour[] }) {
  const tourBookings = bookings.filter((booking) => booking.type === "tour");
  return (
    <SectionCard title="Mes parcours" description="Vue chronologique des parcours touristiques réservés.">
      <div className="grid gap-4">
        {tourBookings.map((booking) => {
          const tour = tours.find((item) => item.id === booking.tour?.id);
          return <div key={booking.id} className="rounded-md border border-stone-200 p-4"><h3 className="font-semibold">{serviceName(booking)}</h3><p className="text-sm text-stone-600">{formatDate(booking.date)} · {booking.duration} jour{booking.duration > 1 ? "s" : ""}</p><DetailList title="Étapes jour par jour" items={tour?.itinerary.length ? tour.itinerary : ["Jour 1 — Accueil et découverte", "Jour 2 — Visites et recommandations", "Jour 3 — Retour ou transfert"]} /></div>;
        })}
        {tourBookings.length === 0 && <EmptyState title="Aucun parcours" text="Vos parcours réservés apparaîtront ici." />}
      </div>
    </SectionCard>
  );
}

function ClientDriversSection({ bookings, drivers }: { bookings: Booking[]; drivers: Driver[] }) {
  const driverBookings = bookings.filter((booking) => booking.type === "driver" || booking.driver);
  return (
    <SectionCard title="Mes chauffeurs" description="Coordonnées et véhicule des chauffeurs associés à vos réservations confirmées.">
      <div className="grid gap-4 md:grid-cols-2">
        {driverBookings.map((booking) => {
          const driver = drivers.find((item) => item.id === booking.driver?.id);
          const contactVisible = booking.status === "confirmed";
          return (
            <div key={booking.id} className="rounded-md border border-stone-200 p-4">
              <div className="flex gap-3">
                <div className="h-16 w-16 rounded-md bg-cover bg-center" style={{ backgroundImage: `url('${driver?.image ?? ""}')` }} />
                <div><h3 className="font-semibold">{driver?.name ?? "Chauffeur en cours d'attribution"}</h3><p className="text-sm text-stone-600">{driver?.vehicleType ?? "Véhicule à confirmer"}</p></div>
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <p><strong>Zone :</strong> {driver?.zone ?? "À confirmer"}</p>
                <p><strong>Téléphone :</strong> {contactVisible ? driver?.phone ?? "À confirmer" : "Visible après confirmation"}</p>
                <p><strong>WhatsApp :</strong> {contactVisible ? driver?.whatsapp ?? "À confirmer" : "Visible après confirmation"}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" disabled={!contactVisible}><Phone className="mr-2 h-4 w-4" /> Appeler</Button><Button variant="outline"><MessageCircle className="mr-2 h-4 w-4" /> Assistance</Button></div>
            </div>
          );
        })}
        {driverBookings.length === 0 && <EmptyState title="Aucun chauffeur" text="Vos chauffeurs apparaîtront après attribution." />}
      </div>
    </SectionCard>
  );
}

function ClientLocationsSection({ rentalBookings }: { rentalBookings: RentalBooking[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RentalBooking["status"] | "all">("all");
  const [paymentStatus, setPaymentStatus] = useState<RentalBooking["paymentStatus"] | "all">("all");

  const filtered = rentalBookings.filter((booking) => {
    const matchQuery = [String(booking.id), booking.rental.title, booking.rental.location, booking.tenant.fullName, booking.status, booking.paymentStatus]
      .some((value) => value.toLowerCase().includes(query.toLowerCase()));
    const matchStatus = status === "all" || booking.status === status;
    const matchPayment = paymentStatus === "all" || booking.paymentStatus === paymentStatus;

    return matchQuery && matchStatus && matchPayment;
  });

  const paidTotal = filtered.reduce((sum, booking) => sum + (booking.paymentStatus === "paid" || booking.paymentStatus === "released" ? booking.totalPrice : 0), 0);
  const refundedTotal = filtered.reduce((sum, booking) => sum + (booking.paymentStatus === "refunded" ? booking.totalPrice : 0), 0);

  return (
    <SectionCard title="Mes locations" description="Suivez les demandes envoyées aux propriétaires, leur décision et le paiement sécurisé par ORITA.">
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <Info label="Demandes location" value={String(rentalBookings.length)} />
        <Info label="Paiements sécurisés" value={money(paidTotal)} />
        <Info label="Remboursements" value={money(refundedTotal)} />
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_190px_210px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Location, propriétaire, ville..." />
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value as RentalBooking["status"] | "all")} className="h-10 rounded-md border border-stone-200 bg-white px-3 text-sm">
          <option value="all">Tous statuts</option>
          <option value="pending">En attente</option>
          <option value="accepted">Acceptées</option>
          <option value="refused">Refusées</option>
          <option value="completed">Terminées</option>
          <option value="cancelled">Annulées</option>
        </select>
        <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as RentalBooking["paymentStatus"] | "all")} className="h-10 rounded-md border border-stone-200 bg-white px-3 text-sm">
          <option value="all">Tous paiements</option>
          <option value="paid">Sécurisés</option>
          <option value="pending">En attente</option>
          <option value="refunded">Remboursés</option>
          <option value="released">Payés au propriétaire</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filtered.map((booking) => (
          <div key={booking.id} className="rounded-md border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={rentalBookingStatusClass(booking.status)}>{rentalBookingStatusLabel(booking.status)}</Badge>
                  <Badge className={rentalPaymentStatusClass(booking.paymentStatus)}>{rentalPaymentStatusLabel(booking.paymentStatus)}</Badge>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-stone-950">Location #{booking.id} · {booking.rental.title}</h3>
                <p className="mt-1 text-sm text-stone-600">{booking.rental.location} · {formatDate(booking.startDate)} au {formatDate(booking.endDate)} · {booking.nights} nuit{booking.nights > 1 ? "s" : ""}</p>
              </div>
              <div className="rounded-md bg-stone-50 px-4 py-3 text-right">
                <p className="text-xs text-stone-500">Montant</p>
                <p className="font-semibold text-stone-950">{money(booking.totalPrice)}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <RentalStep label="Demande envoyée" done description={`Créée le ${formatDate(booking.createdAt)}`} />
              <RentalStep label="Décision propriétaire" done={booking.status !== "pending"} description={rentalOwnerDecisionDescription(booking)} />
              <RentalStep label="Paiement plateforme" done={booking.paymentStatus === "paid" || booking.paymentStatus === "released" || booking.paymentStatus === "refunded"} description={rentalPaymentDescription(booking.paymentStatus)} />
            </div>

            {booking.status === "accepted" || booking.status === "completed" ? (
              <div className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Informations disponibles après acceptation</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <Info label="Propriétaire" value={booking.tenant.fullName} />
                  <Info label="Téléphone" value={booking.tenant.phone || "Non renseigné"} />
                  <Info label="WhatsApp" value={booking.tenant.whatsapp || "Non renseigné"} />
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-stone-700">{booking.keyHandoverNotes || "Les consignes de remise des clés seront ajoutées par le propriétaire."}</p>
              </div>
            ) : booking.status === "refused" ? (
              <div className="mt-4 rounded-md border border-red-100 bg-red-50 p-4 text-sm text-red-900">
                Le propriétaire a refusé la demande. Le paiement est marqué comme remboursé côté plateforme.
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                La demande est en attente. Les coordonnées du propriétaire restent masquées jusqu'à acceptation.
              </div>
            )}

            {booking.messages.length > 0 && (
              <div className="mt-4 space-y-2">
                {booking.messages.slice(-2).map((item, index) => (
                  <div key={`${booking.id}-location-message-${index}`} className="rounded-md bg-stone-50 p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{item.author === "owner" ? "Propriétaire" : "Client"} · {formatDate(item.createdAt)}</p>
                    <p className="mt-1 whitespace-pre-line text-stone-700">{item.text}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/mon-espace/messages"><Button variant="outline"><MessageCircle className="mr-2 h-4 w-4" />Chat location</Button></Link>
              <Button variant="outline" onClick={() => toast.info("Paiement en mode test", { description: rentalPaymentDescription(booking.paymentStatus) })}>
                <CreditCard className="mr-2 h-4 w-4" />Voir paiement
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState title="Aucune demande de location" text="Vos demandes acceptées, refusées ou en attente apparaîtront ici après réservation d'un logement." />}
      </div>
    </SectionCard>
  );
}

function DocumentsSection({ bookings }: { bookings: Booking[] }) {
  const docs = bookings.flatMap((booking) => bookingDocuments.map((document) => ({ booking, document })));
  return (
    <SectionCard title="Mes documents" description="Confirmations, factures, reçus, programmes et conditions.">
      <div className="grid gap-3 md:grid-cols-2">
        {docs.map((doc) => <button key={`${doc.booking.id}-${doc.document.kind}`} className="flex items-center justify-between rounded-md border border-stone-200 p-4 text-left hover:bg-stone-50" onClick={() => downloadDocument(doc.booking, doc.document)}><span><strong className="block">{doc.document.label}</strong><span className="text-sm text-stone-500">Réservation #{doc.booking.id}</span></span><Download className="h-4 w-4 text-emerald-800" /></button>)}
        {docs.length === 0 && <EmptyState title="Aucun document" text="Les documents seront disponibles après réservation." />}
      </div>
    </SectionCard>
  );
}

function MessagesSection({ session, bookings }: { session: ClientSession; bookings: Booking[] }) {
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const [loadedRequests, loadedRentalBookings] = await Promise.all([
        getContactRequestsForEmail(session.email),
        getRentalBookings({ email: session.email }),
      ]);
      setRequests(loadedRequests);
      setRentalBookings(loadedRentalBookings);
    } catch {
      toast.error("Impossible de charger vos messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [session.email]);

  return (
    <SectionCard title="Mes messages" description="Messagerie simple entre le client et ORITA.">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {bookings.map((booking) => <div key={booking.id} className="rounded-md border border-stone-200 p-3"><p className="font-medium">Réservation #{booking.id}</p><p className="text-xs text-stone-500">Dernier message : suivi de votre demande</p></div>)}
          {rentalBookings.map((booking) => <div key={`rental-${booking.id}`} className="rounded-md border border-stone-200 p-3"><p className="font-medium">Location #{booking.id}</p><p className="text-xs text-stone-500">{booking.rental.title} · {rentalBookingStatusLabel(booking.status)}</p></div>)}
        </div>
        <form onSubmit={async (event) => {
          event.preventDefault();
          try {
            await createContactRequest({
              name: `${session.firstName} ${session.lastName}`.trim() || session.email,
              email: session.email,
              phone: `${session.phonePrefix} ${session.phone}`.trim(),
              subject: bookings[0] ? `Message client - réservation #${bookings[0].id}` : "Message client",
              message,
              status: "nouveau",
              internalNote: "",
            });
            setMessage("");
            await loadMessages();
            toast.success("Message envoyé à l'équipe ORITA");
          } catch {
            toast.error("Impossible d'envoyer le message");
          }
        }} className="space-y-3">
          <div className="space-y-3 rounded-md bg-stone-50 p-4 text-sm text-stone-700">
            <p>Bonjour, l'équipe ORITA reste disponible pour votre réservation, paiement, chauffeur ou parcours.</p>
            {isLoadingMessages && <p className="text-stone-500">Chargement des messages...</p>}
            {rentalBookings.map((booking) => (
              <div key={booking.id} className="rounded-md border border-stone-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-stone-950">Location #{booking.id} · {booking.rental.title}</p>
                    <p className="text-xs text-stone-500">{formatDate(booking.startDate)} au {formatDate(booking.endDate)} · {booking.nights} nuit{booking.nights > 1 ? "s" : ""}</p>
                  </div>
                  <Badge className={rentalBookingStatusClass(booking.status)}>{rentalBookingStatusLabel(booking.status)}</Badge>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Info label="Paiement plateforme" value={rentalPaymentStatusLabel(booking.paymentStatus)} />
                  <Info label="Montant sécurisé" value={money(booking.totalPrice)} />
                </div>
                {["accepted", "completed"].includes(booking.status) ? (
                  <div className="mt-3 rounded-md border border-emerald-100 bg-emerald-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Remise des clés</p>
                    <p className="mt-2 font-medium text-stone-950">{booking.tenant.fullName}</p>
                    <p className="text-sm text-stone-700">{booking.tenant.phone || "Téléphone non renseigné"} · {booking.tenant.whatsapp || "WhatsApp non renseigné"}</p>
                    <p className="mt-2 whitespace-pre-line text-sm text-stone-700">{booking.keyHandoverNotes || "Le propriétaire doit encore préciser les consignes de remise des clés."}</p>
                  </div>
                ) : (
                  <p className="mt-3 rounded-md border border-amber-100 bg-amber-50 p-3 text-xs text-amber-900">
                    Les coordonnées du propriétaire seront visibles après acceptation de la réservation.
                  </p>
                )}
                {booking.messages.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {booking.messages.map((item, index) => (
                      <div key={`${booking.id}-${index}`} className="rounded-md bg-stone-50 p-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{item.author === "owner" ? "Propriétaire" : "Client"} · {formatDate(item.createdAt)}</p>
                        <p className="mt-1 whitespace-pre-line text-stone-700">{item.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {requests.map((request) => (
              <div key={request.id} className="rounded-md border border-stone-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-stone-950">{request.subject}</p>
                  <Badge variant="secondary">{request.status}</Badge>
                </div>
                <p className="mt-2 whitespace-pre-line text-stone-600">{request.message}</p>
                {request.reply && (
                  <div className="mt-3 rounded-md border border-emerald-100 bg-emerald-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Réponse ORITA</p>
                    <p className="mt-2 whitespace-pre-line text-stone-700">{request.reply}</p>
                    {request.repliedAt && <p className="mt-2 text-xs text-stone-500">{formatDate(request.repliedAt)}</p>}
                  </div>
                )}
              </div>
            ))}
            {!isLoadingMessages && requests.length === 0 && rentalBookings.length === 0 && <p className="text-stone-500">Aucun message pour le moment.</p>}
          </div>
          <Textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Votre message..." />
          <Button className="rounded-md bg-emerald-900 text-white hover:bg-emerald-800">Envoyer</Button>
        </form>
      </div>
    </SectionCard>
  );
}

function ProfileSection({ session, onUpdate }: { session: ClientSession; onUpdate: (session: ClientSession) => void }) {
  const [form, setForm] = useState(session);
  const [isSaving, setIsSaving] = useState(false);
  return (
    <SectionCard title="Mon profil" description="Informations personnelles, préférences et sécurité.">
      <form onSubmit={async (event) => {
        event.preventDefault();
        const token = readClientSessionToken();
        if (!token) {
          toast.error("Session expirée");
          return;
        }
        setIsSaving(true);
        try {
          const response = await updateClientProfile({
            sessionToken: token,
            firstName: form.firstName,
            lastName: form.lastName,
            phonePrefix: form.phonePrefix,
            phone: form.phone,
          });
          const nextSession = toSession(response.client);
          setForm(nextSession);
          onUpdate(nextSession);
          toast.success("Profil mis à jour");
        } catch {
          toast.error("Impossible de mettre à jour le profil");
        } finally {
          setIsSaving(false);
        }
      }} className="grid gap-4 md:grid-cols-2">
        <Input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Prénom" />
        <Input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Nom" />
        <Input required type="email" value={form.email} disabled placeholder="Email" />
        <Input required value={form.phonePrefix} onChange={(e) => setForm({ ...form, phonePrefix: e.target.value })} placeholder="Indicatif" />
        <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone" />
        <div className="rounded-md border border-stone-200 p-4 md:col-span-2">
          <h3 className="font-semibold">Sécurité</h3>
          <p className="mt-2 text-sm text-stone-600">La double authentification, les sessions actives et l'export RGPD sont prévus comme actions de sécurité visibles.</p>
        </div>
        <Button className="w-fit rounded-md bg-emerald-900 text-white hover:bg-emerald-800" disabled={isSaving}>{isSaving ? "Enregistrement..." : "Enregistrer"}</Button>
      </form>
    </SectionCard>
  );
}

function AuthLayout({ title = "Connectez-vous à votre espace", subtitle = "Suivez vos réservations, documents, paiements et messages.", children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#f7f3eb] px-4 py-10">
      <Card className="w-full max-w-md rounded-md border-stone-200 bg-white shadow-xl">
        <CardHeader>
          <BrandLogo compact className="mb-3 h-12 w-12" />
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-stone-600">{subtitle}</p>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <Card className="rounded-md border-stone-200 bg-white"><CardHeader><CardTitle>{title}</CardTitle><p className="text-sm text-stone-600">{description}</p></CardHeader><CardContent>{children}</CardContent></Card>;
}

function BookingRow({ booking }: { booking: Booking }) {
  return (
    <div className="grid gap-3 rounded-md border border-stone-200 p-4 md:grid-cols-[1fr_160px_160px_120px] md:items-center">
      <div><p className="font-semibold">#{booking.id} · {serviceName(booking)}</p><p className="text-sm text-stone-500">{booking.type === "tour" ? "Parcours" : "Chauffeur"} · {formatDate(booking.date)} · {booking.duration} jour{booking.duration > 1 ? "s" : ""}</p></div>
      <div><p className="text-xs text-stone-500">Montant</p><p className="font-medium">{money(booking.price)}</p></div>
      <div><p className="text-xs text-stone-500">Paiement</p><p className="font-medium">{money(paidAmount(booking))} payé</p></div>
      <Link to={`/mon-espace/reservations/${booking.id}`}><Button variant="outline" className="w-full">Voir le détail</Button></Link>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="rounded-md border border-stone-200 bg-white p-4"><Icon className="h-5 w-5 text-emerald-800" /><p className="mt-3 text-sm text-stone-500">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>;
}

function AlertItem({ icon: Icon, text, count }: { icon: LucideIcon; text: string; count: number }) {
  return <div className="flex items-center justify-between rounded-md border border-stone-200 p-3"><span className="flex items-center gap-2 text-sm"><Icon className="h-4 w-4 text-amber-700" />{text}</span><Badge variant="secondary">{count}</Badge></div>;
}

function TimelineStep({ label, done, description }: { label: string; done: boolean; description: string }) {
  return <div className={`rounded-md border p-3 ${done ? "border-emerald-200 bg-emerald-50" : "border-stone-200 bg-white"}`}><div className="flex items-center gap-2"><CheckCircle className={`h-4 w-4 ${done ? "text-emerald-800" : "text-stone-300"}`} /><p className="font-medium">{label}</p></div><p className="mt-2 text-xs text-stone-600">{description}</p></div>;
}

function RentalStep({ label, done, description }: { label: string; done: boolean; description: string }) {
  return (
    <div className={`rounded-md border p-3 ${done ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
      <div className="flex items-center gap-2">
        <CheckCircle className={`h-4 w-4 ${done ? "text-emerald-800" : "text-amber-700"}`} />
        <p className="font-medium">{label}</p>
      </div>
      <p className="mt-2 text-xs text-stone-600">{description}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-stone-50 p-3"><p className="text-xs text-stone-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return <div><h3 className="mb-2 font-semibold">{title}</h3><ul className="space-y-1 text-sm text-stone-700">{(items.length ? items : ["À confirmer par l'équipe ORITA"]).map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-700" />{item}</li>)}</ul></div>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="rounded-md border border-dashed border-stone-300 bg-white p-6 text-center"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-stone-500">{text}</p></div>;
}

function getSectionFromPath(pathname: string): ClientSection {
  if (pathname.includes("/reservations")) return "reservations";
  if (pathname.includes("/parcours")) return "tours";
  if (pathname.includes("/chauffeurs")) return "drivers";
  if (pathname.includes("/locations")) return "locations";
  if (pathname.includes("/documents")) return "documents";
  if (pathname.includes("/messages")) return "messages";
  if (pathname.includes("/profil")) return "profile";
  return "dashboard";
}

function toSession(account: ClientAccount): ClientSession {
  return { firstName: account.firstName, lastName: account.lastName, email: account.email, phonePrefix: account.phonePrefix, phone: account.phone };
}

function passwordStrength(password: string) {
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  return { score, label: `${score}/5 critères validés : 8 caractères, majuscule, minuscule, chiffre et caractère spécial.` };
}

function serviceName(booking: Booking) {
  return booking.tour?.title ?? booking.driver?.name ?? (booking.type === "tour" ? "Parcours à confirmer" : "Chauffeur à confirmer");
}

function clientStatus(booking: Booking) {
  return {
    pending: "En attente de confirmation",
    confirmed: booking.driver ? "Chauffeur attribué" : "Confirmée",
    unavailable: "Annulée",
    refunded: "Remboursée",
  }[booking.status];
}

function statusClass(status: Booking["status"]) {
  return status === "confirmed" ? "bg-emerald-50 text-emerald-800" : status === "pending" ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-800";
}

function rentalBookingStatusLabel(status: RentalBooking["status"]) {
  return {
    pending: "En attente propriétaire",
    accepted: "Acceptée",
    refused: "Refusée",
    completed: "Terminée",
    cancelled: "Annulée",
  }[status];
}

function rentalBookingStatusClass(status: RentalBooking["status"]) {
  if (status === "accepted" || status === "completed") return "bg-emerald-50 text-emerald-800 hover:bg-emerald-50";
  if (status === "pending") return "bg-amber-50 text-amber-800 hover:bg-amber-50";
  return "bg-red-50 text-red-800 hover:bg-red-50";
}

function rentalPaymentStatusLabel(status: RentalBooking["paymentStatus"]) {
  return {
    paid: "Sécurisé par ORITA",
    pending: "En attente",
    refunded: "Remboursé",
    released: "Payé au propriétaire",
  }[status];
}

function rentalPaymentStatusClass(status: RentalBooking["paymentStatus"]) {
  if (status === "paid") return "bg-blue-50 text-blue-800 hover:bg-blue-50";
  if (status === "released") return "bg-emerald-50 text-emerald-800 hover:bg-emerald-50";
  if (status === "refunded") return "bg-red-50 text-red-800 hover:bg-red-50";
  return "bg-amber-50 text-amber-800 hover:bg-amber-50";
}

function rentalOwnerDecisionDescription(booking: RentalBooking) {
  if (booking.status === "accepted") return booking.ownerRespondedAt ? `Acceptée le ${formatDate(booking.ownerRespondedAt)}` : "Acceptée par le propriétaire";
  if (booking.status === "refused") return booking.ownerRespondedAt ? `Refusée le ${formatDate(booking.ownerRespondedAt)}` : "Refusée par le propriétaire";
  if (booking.status === "completed") return booking.completedAt ? `Terminée le ${formatDate(booking.completedAt)}` : "Prestation terminée";
  if (booking.status === "cancelled") return "Demande annulée";
  return "En attente de réponse";
}

function rentalPaymentDescription(status: RentalBooking["paymentStatus"]) {
  return {
    paid: "Le paiement est sécurisé par ORITA et n'est pas encore libéré au propriétaire.",
    pending: "Le paiement est en attente de validation plateforme.",
    refunded: "Le paiement a été remboursé au client.",
    released: "Le paiement a été libéré au propriétaire après fin de prestation.",
  }[status];
}

function paidAmount(booking: Booking) {
  if (booking.status === "confirmed") return booking.price;
  if (booking.status === "pending") return Math.round(booking.price * 0.3);
  return 0;
}

function remainingAmount(booking: Booking) {
  return Math.max(0, booking.price - paidAmount(booking));
}

function timelineSteps(booking: Booking) {
  const confirmed = booking.status === "confirmed";
  return [
    { label: "Demande envoyée", done: true, description: `Référence #${booking.id}` },
    { label: "Réservation reçue", done: true, description: "Votre demande est enregistrée." },
    { label: "Paiement reçu", done: paidAmount(booking) > 0, description: money(paidAmount(booking)) },
    { label: "Réservation confirmée", done: confirmed, description: confirmed ? "Votre séjour est confirmé." : "Confirmation en attente." },
    { label: "Chauffeur attribué", done: Boolean(booking.driver) && confirmed, description: booking.driver?.name ?? "Attribution en cours." },
    { label: "Documents disponibles", done: confirmed, description: "Confirmation, programme et conditions." },
    { label: "Départ prochain", done: new Date(booking.date).getTime() - Date.now() < 7 * 86400000, description: formatDate(booking.date) },
    { label: "Prestation en cours", done: false, description: "Sera mis à jour le jour du départ." },
    { label: "Prestation terminée", done: booking.status === "refunded", description: "Avis disponible après séjour." },
  ];
}

function money(value: number) {
  return `${Math.round(value).toLocaleString("fr-FR")} FCFA`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

async function downloadDocument(booking: Booking, document: { kind: BookingDocumentKind; label: string }) {
  try {
    const blob = await downloadBookingDocument(booking.id, document.kind);
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `benin-tours-${document.kind}-reservation-${booking.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    toast.error("Impossible de télécharger le document");
  }
}

async function emailDocument(booking: Booking, document: { kind: BookingDocumentKind; label: string }) {
  try {
    await sendBookingDocumentEmail(booking.id, document.kind);
    toast.success("Email envoyé", { description: `${document.label} envoyé à ${booking.customerEmail}.` });
  } catch {
    toast.error("Impossible d'envoyer l'email");
  }
}

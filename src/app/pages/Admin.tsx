import { ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  AlertTriangle,
  CalendarDays,
  Car,
  CheckCircle,
  CircleDollarSign,
  Eye,
  LayoutDashboard,
  Mail,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "../components/BrandLogo";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import {
  AdminClientProfile,
  AdminClientProfileInput,
  AiConfiguration,
  AiConfigurationInput,
  BonPlan,
  Booking,
  ClientAccount,
  ContactConfiguration,
  ContactRequest,
  createBonPlan,
  createAdminClientProfile,
  createBooking,
  createContactConfiguration,
  createDriver,
  createGuide,
  createImageAsset,
  createLegalPage,
  createTour,
  deleteBonPlan,
  deleteBooking,
  deleteDriver,
  deleteGuide,
  deleteLegalPage,
  deleteTour,
  decideRentalBooking,
  Driver,
  getGuides,
  getBookings,
  getAdminClientProfiles,
  getAdminSession,
  getAiConfiguration,
  getBonsPlans,
  getClientAccounts,
  getContactConfiguration,
  getDrivers,
  getHomepageConfiguration,
  getLegalPages,
  getPageHeroConfiguration,
  getRentalBookings,
  getRentals,
  getTenants,
  getTours,
  Guide,
  GuideInput,
  HomepageConfiguration,
  LegalPage,
  PageHeroConfiguration,
  PaginationMeta,
  Rental,
  RentalBooking,
  notifyBookingUpdate,
  replyToContactRequest,
  requestAdminLoginCode,
  searchAdminRentals,
  searchAdminClientProfiles,
  searchBookings,
  searchBonsPlans,
  searchContactRequests,
  searchDrivers,
  searchGuides,
  searchLegalPages,
  searchTenants,
  searchTours,
  Tenant,
  TenantInput,
  Tour,
  updateBonPlan,
  updateAdminClientProfile,
  updateAiConfiguration,
  updateBooking,
  updateContactConfiguration,
  updateContactRequest,
  updateDriver,
  updateGuide,
  updateHomepageConfiguration,
  updateLegalPage,
  updatePageHeroConfiguration,
  updateTenant,
  updateTour,
  uploadImageAsset,
  verifyAdminLoginCode,
} from "../lib/api";
import { AdminLayout, AdminNotification } from "./admin/partials/AdminLayout";
import { AdminSection, adminNavItems, adminPathForSection, adminSectionFromPath } from "./admin/adminNavigation";

type TourForm = {
  id?: string;
  title: string;
  summary: string;
  guideId: string;
  durations: string;
  highlights: string;
  included: string;
  notIncluded: string;
  itinerary: string;
  practicalInfo: string;
  travelTips: string;
  imageUrl: string;
  imageAlt: string;
  popular: boolean;
};

type GuideForm = {
  id?: string;
  firstName: string;
  lastName: string;
  location: string;
  guideZone: string;
  phone: string;
  description: string;
  offers: string;
  specialties: string;
  languages: string;
  validationStatus: "pending" | "validated" | "rejected" | "suspended";
  userId: string;
};

type DriverForm = {
  id?: string;
  name: string;
  userId: string;
  phone: string;
  whatsapp: string;
  zone: string;
  vehicleType: string;
  dailyPriceEur: string;
  monthlyPriceEur: string;
  available: boolean;
  validationStatus: "pending" | "validated" | "rejected" | "suspended";
  imageUrl: string;
  imageAlt: string;
};

type BonPlanForm = {
  id?: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

type LegalPageForm = {
  id?: string;
  slug: string;
  title: string;
  content: string;
  updatedLabel: string;
};

type BookingForm = {
  id?: number;
  type: "tour" | "driver";
  tourId: string;
  driverId: string;
  date: string;
  duration: string;
  price: string;
  status: "pending" | "confirmed" | "unavailable" | "refunded";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

type ClientForm = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  language: string;
  accountStatus: "non vérifié" | "actif" | "suspendu" | "bloqué" | "anonymisé";
  commercialStatus: "prospect" | "nouveau client" | "client actif" | "client fidèle" | "client inactif" | "client à risque" | "client VIP";
  notes: string;
};

type ContactConfigurationForm = {
  id?: number;
  address: string;
  cityCountry: string;
  phone: string;
  whatsapp: string;
  email: string;
  addresses: { label: string; address: string; cityCountry: string }[];
  phones: { label: string; number: string; whatsapp: string }[];
  emails: { label: string; email: string }[];
  openingHours: string;
  faq: { question: string; answer: string }[];
};

type HomepageConfigurationForm = {
  id?: number;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryLabel: string;
  heroSecondaryLabel: string;
  heroImageUrl: string;
  heroImageAlt: string;
};

type PageHeroConfigurationForm = {
  id?: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
};

type AiConfigurationForm = {
  enabled: boolean;
  model: string;
  systemPrompt: string;
  fallbackAnswer: string;
  knowledgeBase: { input: string; answer: string }[];
  temperature: string;
  maxTokens: string;
};

type DashboardCurrency = "EUR" | "FCFA";

const ADMIN_SESSION_COOKIE = "benintours_admin_session";
const ADMIN_LIST_PAGE_SIZE = 8;
const CLIENT_LIST_PAGE_SIZE = 10;
const ADMIN_MESSAGES_PAGE_SIZE = 5;
const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: ADMIN_LIST_PAGE_SIZE,
  totalItems: 0,
  totalPages: 1,
};

function readAdminSession(): string | null {
  return readCookie(ADMIN_SESSION_COOKIE);
}

function persistAdminSession(sessionToken: string) {
  writeCookie(ADMIN_SESSION_COOKIE, sessionToken, 60 * 60 * 12);
}

function clearAdminSession() {
  deleteCookie(ADMIN_SESSION_COOKIE);
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  return document.cookie.split(";").map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(prefix))?.slice(prefix.length) ?? null;
}

function writeCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

const emptyTour: TourForm = {
  title: "",
  summary: "",
  guideId: "",
  durations: "1:69\n3:183",
  highlights: "",
  included: "",
  notIncluded: "",
  itinerary: "",
  practicalInfo: "",
  travelTips: "",
  imageUrl: "",
  imageAlt: "",
  popular: false,
};

const emptyGuide: GuideForm = {
  firstName: "",
  lastName: "",
  location: "",
  guideZone: "",
  phone: "",
  description: "",
  offers: "",
  specialties: "",
  languages: "Français",
  validationStatus: "pending",
  userId: "",
};

const emptyDriver: DriverForm = {
  name: "",
  userId: "",
  phone: "",
  whatsapp: "",
  zone: "",
  vehicleType: "",
  dailyPriceEur: "38",
  monthlyPriceEur: "915",
  available: true,
  validationStatus: "pending",
  imageUrl: "",
  imageAlt: "",
};

const emptyBonPlan: BonPlanForm = {
  title: "",
  category: "",
  description: "",
  imageUrl: "",
  imageAlt: "",
};

const emptyLegalPage: LegalPageForm = {
  slug: "",
  title: "",
  content: "",
  updatedLabel: "Dernière mise à jour : juillet 2026",
};

const emptyBooking: BookingForm = {
  type: "driver",
  tourId: "",
  driverId: "",
  date: new Date().toISOString().slice(0, 10),
  duration: "1",
  price: "0",
  status: "confirmed",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
};

const emptyClient: ClientForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "Bénin",
  address: "",
  language: "Français",
  accountStatus: "actif",
  commercialStatus: "prospect",
  notes: "",
};

const emptyContactConfiguration: ContactConfigurationForm = {
  address: "Quartier Haie Vive",
  cityCountry: "Cotonou, Bénin",
  phone: "+229 97 12 34 56",
  whatsapp: "+229 97 12 34 56",
  email: "contact@benintours.com",
  addresses: [{ label: "Adresse principale", address: "Quartier Haie Vive", cityCountry: "Cotonou, Bénin" }],
  phones: [{ label: "Standard", number: "+229 97 12 34 56", whatsapp: "+229 97 12 34 56" }],
  emails: [{ label: "Contact", email: "contact@benintours.com" }],
  openingHours: "Lundi - Vendredi | 8h - 18h\nSamedi | 9h - 14h\nDimanche | Fermé",
  faq: [
    { question: "Comment réserver un parcours ?", answer: "Parcourez nos offres, choisissez votre parcours, sélectionnez la date et la durée, puis payez en ligne de manière sécurisée." },
    { question: "Puis-je annuler ma réservation ?", answer: "Oui, consultez nos conditions générales pour connaître la politique d'annulation selon le délai avant le départ." },
    { question: "Quels moyens de paiement acceptez-vous ?", answer: "Nous acceptons les cartes bancaires internationales et les paiements via Mobile Money pour plus de flexibilité." },
    { question: "Les chauffeurs parlent-ils français ?", answer: "Oui, tous nos chauffeurs parlent français. Certains parlent également anglais et les langues locales." },
  ],
};

const emptyHomepageConfiguration: HomepageConfigurationForm = {
  heroEyebrow: "Cotonou, Ganvié, Ouidah, Pendjari",
  heroTitle: "ORITA",
  heroSubtitle: "Séjours organisés de A à Z, chauffeurs privés et adresses locales fiables pour découvrir le Bénin avec un accompagnement clair.",
  heroPrimaryLabel: "Voir les parcours",
  heroSecondaryLabel: "Réserver un chauffeur",
  heroImageUrl: "https://images.unsplash.com/photo-1753818268804-662cabaa63de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
  heroImageAlt: "Maisons sur pilotis à Ganvié",
};

const emptyParcoursHeroConfiguration: PageHeroConfigurationForm = {
  eyebrow: "Parcours touristiques",
  title: "Des itinéraires prêts à réserver.",
  subtitle: "Comparez les durées, les temps forts et les inclus avant de choisir votre séjour au Bénin.",
  imageUrl: "https://images.unsplash.com/photo-1753818268804-662cabaa63de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
  imageAlt: "Maisons sur pilotis à Ganvié",
};

const emptyChauffeursHeroConfiguration: PageHeroConfigurationForm = {
  eyebrow: "Chauffeurs privés",
  title: "Un véhicule fiable, avant même de sortir.",
  subtitle: "Réservez un chauffeur pour une journée ou un mois. Les zones, véhicules et disponibilités sont visibles avant le paiement.",
  imageUrl: "https://images.unsplash.com/photo-1762657478568-69c8fc06225e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
  imageAlt: "Chauffeur privé au Bénin",
};

const emptyLocationHeroConfiguration: PageHeroConfigurationForm = {
  eyebrow: "Location",
  title: "Appartements et maisons à louer au Bénin.",
  subtitle: "Consultez les disponibilités gérées par les locataires partenaires : appartements meublés et maisons pour séjourner en autonomie.",
  imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
  imageAlt: "Appartement meublé lumineux",
};

const emptyBonsPlansHeroConfiguration: PageHeroConfigurationForm = {
  eyebrow: "Carnet d’adresses",
  title: "Bons plans Bénin",
  subtitle: "Restaurants, plages, activités et lieux utiles pour compléter votre séjour avec des recommandations concrètes.",
  imageUrl: "https://images.unsplash.com/photo-1763140556679-d2c9c10df590?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600",
  imageAlt: "Restaurant local africain",
};

const emptyContactHeroConfiguration: PageHeroConfigurationForm = {
  eyebrow: "Contact",
  title: "Préparer votre séjour",
  subtitle: "Une question ? Besoin d’aide pour organiser votre séjour ? Notre équipe est à votre écoute.",
  imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  imageAlt: "Accueil touristique au Bénin",
};

const emptyAiConfiguration: AiConfigurationForm = {
  enabled: true,
  model: "llama3.2:1b",
  systemPrompt: "Tu es Orita, l'assistant local du site ORITA. Réponds en français, simplement, en moins de 6 phrases. Aide sur les parcours, chauffeurs, locations, bons plans, réservations et contact. Si tu n'es pas sûr, propose de contacter l'équipe.",
  fallbackAnswer: "Je suis Orita. Je peux répondre aux questions simples sur le site, les réservations, les chauffeurs, les locations et les bons plans. Le moteur local est indisponible pour le moment, mais votre message est bien pris en compte.",
  knowledgeBase: [{ input: "", answer: "" }],
  temperature: "0.2",
  maxTokens: "220",
};

const EUR_TO_FCFA = 655.957;
const fcfa = (eur: number) => Math.round(eur * EUR_TO_FCFA);
const lines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);
const textList = (value: string) => lines(value);
const durationList = (value: string) => lines(value).map((line) => {
  const [days, priceEur] = line.split(":");
  const eur = Number(priceEur ?? 0);
  return { days: Number(days ?? 1), priceEur: eur, priceFcfa: fcfa(eur), price: fcfa(eur) };
});
const durationRowsFromText = (value: string) => {
  const rows = lines(value).map((line) => {
    const [days = "1", priceEur = "0"] = line.split(":");
    return { days, priceEur };
  });

  return rows.length > 0 ? rows : [{ days: "1", priceEur: "69" }];
};
const durationRowsToText = (rows: { days: string; priceEur: string }[]) => rows
  .map((row) => `${row.days}:${row.priceEur}`)
  .join("\n");

const formatMoney = (valueFcfa: number, currency: DashboardCurrency = "FCFA") => {
  if (currency === "EUR") {
    const valueEur = valueFcfa / EUR_TO_FCFA;
    return `${valueEur.toLocaleString("fr-FR", { maximumFractionDigits: valueEur >= 100 ? 0 : 2 })} €`;
  }

  return `${Math.round(valueFcfa).toLocaleString("fr-FR")} FCFA`;
};

const money = (value: number) => formatMoney(value, "FCFA");
const compactMoney = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M FCFA` : money(value);
const bookingRevenue = (booking: Booking) => ["confirmed", "pending"].includes(booking.status) ? booking.price : 0;
const dateOnly = (value: string) => new Date(value).toISOString().slice(0, 10);

function tourToForm(tour: Tour): TourForm {
  return {
    id: tour.id,
    title: tour.title,
    summary: tour.summary,
    guideId: tour.guide?.id ?? "",
    durations: tour.durations.map((duration) => `${duration.days}:${duration.priceEur}`).join("\n"),
    highlights: tour.highlights.join("\n"),
    included: tour.included.join("\n"),
    notIncluded: tour.notIncluded.join("\n"),
    itinerary: tour.itinerary.join("\n"),
    practicalInfo: tour.practicalInfo.join("\n"),
    travelTips: tour.travelTips.join("\n"),
    imageUrl: tour.image,
    imageAlt: tour.imageAlt,
    popular: tour.popular,
  };
}

function guideToForm(guide: Guide): GuideForm {
  return {
    id: guide.id,
    firstName: guide.firstName,
    lastName: guide.lastName,
    location: guide.location,
    guideZone: guide.guideZone,
    phone: guide.phone ?? "",
    description: guide.description ?? "",
    offers: (guide.offers ?? []).join("\n"),
    specialties: (guide.specialties ?? []).join("\n"),
    languages: (guide.languages ?? []).join("\n"),
    validationStatus: guide.validationStatus ?? "pending",
    userId: guide.user?.id ? String(guide.user.id) : "",
  };
}

function driverToForm(driver: Driver): DriverForm {
  return {
    id: driver.id,
    name: driver.name,
    userId: driver.user?.id ? String(driver.user.id) : "",
    phone: driver.phone,
    whatsapp: driver.whatsapp,
    zone: driver.zone,
    vehicleType: driver.vehicleType,
    dailyPriceEur: String(driver.dailyPriceEur),
    monthlyPriceEur: String(driver.monthlyPriceEur),
    available: driver.available,
    validationStatus: driver.validationStatus ?? "pending",
    imageUrl: driver.image,
    imageAlt: driver.imageAlt,
  };
}

function bonPlanToForm(plan: BonPlan): BonPlanForm {
  return {
    id: plan.id,
    title: plan.title,
    category: plan.category,
    description: plan.description,
    imageUrl: plan.image,
    imageAlt: plan.imageAlt,
  };
}

function legalPageToForm(page: LegalPage): LegalPageForm {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    content: page.content,
    updatedLabel: page.updatedLabel,
  };
}

function bookingToForm(booking: Booking): BookingForm {
  return {
    id: booking.id,
    type: booking.type,
    tourId: booking.tour?.id ?? "",
    driverId: booking.driver?.id ?? "",
    date: booking.date.slice(0, 10),
    duration: String(booking.duration),
    price: String(booking.price),
    status: booking.status,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
  };
}

function clientToForm(client: ClientRecord): ClientForm {
  return {
    id: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
    country: client.country,
    address: client.address,
    language: client.language,
    accountStatus: client.accountStatus,
    commercialStatus: client.commercialStatus,
    notes: client.notes,
  };
}

function contactConfigurationToForm(configuration: ContactConfiguration | null): ContactConfigurationForm {
  if (!configuration) return emptyContactConfiguration;
  const addresses = configuration.addresses?.length
    ? configuration.addresses
    : [{ label: "Adresse principale", address: configuration.address, cityCountry: configuration.cityCountry }];
  const phones = configuration.phones?.length
    ? configuration.phones.map((item) => ({ label: item.label, number: item.number, whatsapp: item.whatsapp ?? "" }))
    : [{ label: "Standard", number: configuration.phone, whatsapp: configuration.whatsapp }];
  const emails = configuration.emails?.length
    ? configuration.emails
    : [{ label: "Contact", email: configuration.email }];

  return {
    id: configuration.id,
    address: configuration.address,
    cityCountry: configuration.cityCountry,
    phone: configuration.phone,
    whatsapp: configuration.whatsapp,
    email: configuration.email,
    addresses,
    phones,
    emails,
    openingHours: configuration.openingHours.map((item) => `${item.label} | ${item.value}`).join("\n"),
    faq: configuration.faq.length > 0 ? configuration.faq : emptyContactConfiguration.faq,
  };
}

function contactConfigurationPayload(form: ContactConfigurationForm) {
  const addresses = form.addresses
    .map((item) => ({ label: item.label.trim(), address: item.address.trim(), cityCountry: item.cityCountry.trim() }))
    .filter((item) => item.label && item.address && item.cityCountry);
  const phones = form.phones
    .map((item) => ({ label: item.label.trim(), number: item.number.trim(), whatsapp: item.whatsapp.trim() }))
    .filter((item) => item.label && item.number);
  const emails = form.emails
    .map((item) => ({ label: item.label.trim(), email: item.email.trim() }))
    .filter((item) => item.label && item.email);

  return {
    address: addresses[0]?.address ?? form.address,
    cityCountry: addresses[0]?.cityCountry ?? form.cityCountry,
    phone: phones[0]?.number ?? form.phone,
    whatsapp: phones[0]?.whatsapp ?? form.whatsapp,
    email: emails[0]?.email ?? form.email,
    addresses,
    phones,
    emails,
    openingHours: lines(form.openingHours).map((line) => {
      const [label, ...valueParts] = line.split("|");
      return { label: label.trim(), value: valueParts.join("|").trim() };
    }).filter((item) => item.label && item.value),
    faq: form.faq
      .map((item) => ({ question: item.question.trim(), answer: item.answer.trim() }))
      .filter((item) => item.question && item.answer),
  };
}

function homepageConfigurationToForm(configuration: HomepageConfiguration | null): HomepageConfigurationForm {
  if (!configuration) return emptyHomepageConfiguration;

  return {
    id: configuration.id,
    heroEyebrow: configuration.heroEyebrow,
    heroTitle: configuration.heroTitle,
    heroSubtitle: configuration.heroSubtitle,
    heroPrimaryLabel: configuration.heroPrimaryLabel,
    heroSecondaryLabel: configuration.heroSecondaryLabel,
    heroImageUrl: configuration.heroImage?.url ?? "",
    heroImageAlt: configuration.heroImage?.alt ?? "",
  };
}

function homepageConfigurationPayload(form: HomepageConfigurationForm) {
  return {
    heroEyebrow: form.heroEyebrow,
    heroTitle: form.heroTitle,
    heroSubtitle: form.heroSubtitle,
    heroPrimaryLabel: form.heroPrimaryLabel,
    heroSecondaryLabel: form.heroSecondaryLabel,
    heroImageUrl: form.heroImageUrl,
    heroImageAlt: form.heroImageAlt,
  };
}

function pageHeroConfigurationToForm(configuration: PageHeroConfiguration | null, fallback: PageHeroConfigurationForm): PageHeroConfigurationForm {
  if (!configuration) return fallback;

  return {
    id: configuration.id,
    eyebrow: configuration.eyebrow,
    title: configuration.title,
    subtitle: configuration.subtitle,
    imageUrl: configuration.image?.url ?? fallback.imageUrl,
    imageAlt: configuration.image?.alt ?? fallback.imageAlt,
  };
}

function pageHeroConfigurationPayload(form: PageHeroConfigurationForm) {
  return {
    eyebrow: form.eyebrow,
    title: form.title,
    subtitle: form.subtitle,
    imageUrl: form.imageUrl,
    imageAlt: form.imageAlt,
  };
}

function aiConfigurationToForm(configuration: AiConfiguration | null): AiConfigurationForm {
  if (!configuration) return emptyAiConfiguration;

  return {
    enabled: configuration.enabled,
    model: configuration.model,
    systemPrompt: configuration.systemPrompt,
    fallbackAnswer: configuration.fallbackAnswer,
    knowledgeBase: configuration.knowledgeBase?.length ? configuration.knowledgeBase : [{ input: "", answer: "" }],
    temperature: String(configuration.temperature),
    maxTokens: String(configuration.maxTokens),
  };
}

function normalizeAiKnowledgeBase(rows: AiConfigurationForm["knowledgeBase"]) {
  return rows
    .map((row) => ({ input: row.input.trim(), answer: row.answer.trim() }))
    .filter((row) => row.input && row.answer);
}

function aiConfigurationPayload(form: AiConfigurationForm): AiConfigurationInput {
  const temperature = Number(form.temperature);
  const maxTokens = Number(form.maxTokens);

  return {
    enabled: form.enabled,
    model: form.model,
    systemPrompt: form.systemPrompt,
    fallbackAnswer: form.fallbackAnswer,
    knowledgeBase: normalizeAiKnowledgeBase(form.knowledgeBase),
    temperature: Number.isFinite(temperature) ? temperature : 0.2,
    maxTokens: Number.isFinite(maxTokens) ? maxTokens : 220,
  };
}

export function Admin() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginStep, setLoginStep] = useState<"credentials" | "code">("credentials");
  const [adminEmail, setAdminEmail] = useState("admin@benintours.local");
  const [password, setPassword] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loginEmailSentTo, setLoginEmailSentTo] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [section, setSection] = useState<AdminSection>(() => adminSectionFromPath(pathname));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [revenueRange, setRevenueRange] = useState("7");
  const [dashboardCurrency, setDashboardCurrency] = useState<DashboardCurrency>("EUR");
  const [isLoading, setIsLoading] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>([]);
  const [bonsPlans, setBonsPlans] = useState<BonPlan[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);
  const [listedTours, setListedTours] = useState<Tour[]>([]);
  const [listedGuides, setListedGuides] = useState<Guide[]>([]);
  const [listedDrivers, setListedDrivers] = useState<Driver[]>([]);
  const [listedTenants, setListedTenants] = useState<Tenant[]>([]);
  const [listedRentals, setListedRentals] = useState<Rental[]>([]);
  const [listedPlans, setListedPlans] = useState<BonPlan[]>([]);
  const [listedBookings, setListedBookings] = useState<Booking[]>([]);
  const [listedDriverBookings, setListedDriverBookings] = useState<Booking[]>([]);
  const [listedLegalPages, setListedLegalPages] = useState<LegalPage[]>([]);
  const [listedClientProfiles, setListedClientProfiles] = useState<ClientForm[]>([]);
  const [tourPagination, setTourPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [guidePagination, setGuidePagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [driverPagination, setDriverPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [tenantPagination, setTenantPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [rentalPagination, setRentalPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [planPagination, setPlanPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [bookingPagination, setBookingPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [driverBookingPagination, setDriverBookingPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [legalPagination, setLegalPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [clientPagination, setClientPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [tourPage, setTourPage] = useState(1);
  const [guidePage, setGuidePage] = useState(1);
  const [driverPage, setDriverPage] = useState(1);
  const [tenantPage, setTenantPage] = useState(1);
  const [rentalPage, setRentalPage] = useState(1);
  const [planPage, setPlanPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [driverBookingPage, setDriverBookingPage] = useState(1);
  const [legalPage, setLegalPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [activeContactRequests, setActiveContactRequests] = useState<ContactRequest[]>([]);
  const [archivedContactRequests, setArchivedContactRequests] = useState<ContactRequest[]>([]);
  const [activeContactPagination, setActiveContactPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [archivedContactPagination, setArchivedContactPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [activeContactPage, setActiveContactPage] = useState(1);
  const [archivedContactPage, setArchivedContactPage] = useState(1);
  const [contactConfiguration, setContactConfiguration] = useState<ContactConfiguration | null>(null);
  const [contactConfigurationForm, setContactConfigurationForm] = useState<ContactConfigurationForm>(emptyContactConfiguration);
  const [contactConfigurationOpen, setContactConfigurationOpen] = useState(false);
  const [homepageConfiguration, setHomepageConfiguration] = useState<HomepageConfiguration | null>(null);
  const [homepageConfigurationForm, setHomepageConfigurationForm] = useState<HomepageConfigurationForm>(emptyHomepageConfiguration);
  const [homepageConfigurationOpen, setHomepageConfigurationOpen] = useState(false);
  const [parcoursHeroConfiguration, setParcoursHeroConfiguration] = useState<PageHeroConfiguration | null>(null);
  const [parcoursHeroConfigurationForm, setParcoursHeroConfigurationForm] = useState<PageHeroConfigurationForm>(emptyParcoursHeroConfiguration);
  const [parcoursHeroConfigurationOpen, setParcoursHeroConfigurationOpen] = useState(false);
  const [chauffeursHeroConfiguration, setChauffeursHeroConfiguration] = useState<PageHeroConfiguration | null>(null);
  const [chauffeursHeroConfigurationForm, setChauffeursHeroConfigurationForm] = useState<PageHeroConfigurationForm>(emptyChauffeursHeroConfiguration);
  const [chauffeursHeroConfigurationOpen, setChauffeursHeroConfigurationOpen] = useState(false);
  const [locationHeroConfiguration, setLocationHeroConfiguration] = useState<PageHeroConfiguration | null>(null);
  const [locationHeroConfigurationForm, setLocationHeroConfigurationForm] = useState<PageHeroConfigurationForm>(emptyLocationHeroConfiguration);
  const [locationHeroConfigurationOpen, setLocationHeroConfigurationOpen] = useState(false);
  const [bonsPlansHeroConfiguration, setBonsPlansHeroConfiguration] = useState<PageHeroConfiguration | null>(null);
  const [bonsPlansHeroConfigurationForm, setBonsPlansHeroConfigurationForm] = useState<PageHeroConfigurationForm>(emptyBonsPlansHeroConfiguration);
  const [bonsPlansHeroConfigurationOpen, setBonsPlansHeroConfigurationOpen] = useState(false);
  const [contactHeroConfiguration, setContactHeroConfiguration] = useState<PageHeroConfiguration | null>(null);
  const [contactHeroConfigurationForm, setContactHeroConfigurationForm] = useState<PageHeroConfigurationForm>(emptyContactHeroConfiguration);
  const [contactHeroConfigurationOpen, setContactHeroConfigurationOpen] = useState(false);
  const [aiConfiguration, setAiConfiguration] = useState<AiConfiguration | null>(null);
  const [aiConfigurationForm, setAiConfigurationForm] = useState<AiConfigurationForm>(emptyAiConfiguration);
  const [storedClients, setStoredClients] = useState<ClientForm[]>([]);
  const [clientAccounts, setClientAccounts] = useState<ClientAccount[]>([]);
  const [clientForm, setClientForm] = useState<ClientForm>(emptyClient);
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [clientDetail, setClientDetail] = useState<ClientRecord | null>(null);
  const [clientMessageTarget, setClientMessageTarget] = useState<ClientRecord | null>(null);
  const [clientMessage, setClientMessage] = useState("");
  const [clientAnonymizeTarget, setClientAnonymizeTarget] = useState<ClientRecord | null>(null);
  const [contactReplyTarget, setContactReplyTarget] = useState<ContactRequest | null>(null);
  const [contactReply, setContactReply] = useState("");
  const [tourForm, setTourForm] = useState<TourForm>(emptyTour);
  const [tourFormOpen, setTourFormOpen] = useState(false);
  const [tourDeleteTarget, setTourDeleteTarget] = useState<Tour | null>(null);
  const [guideForm, setGuideForm] = useState<GuideForm>(emptyGuide);
  const [guideFormOpen, setGuideFormOpen] = useState(false);
  const [guideDeleteTarget, setGuideDeleteTarget] = useState<Guide | null>(null);
  const [driverForm, setDriverForm] = useState<DriverForm>(emptyDriver);
  const [driverFormOpen, setDriverFormOpen] = useState(false);
  const [driverDeleteTarget, setDriverDeleteTarget] = useState<Driver | null>(null);
  const [bonPlanForm, setBonPlanForm] = useState<BonPlanForm>(emptyBonPlan);
  const [bonPlanFormOpen, setBonPlanFormOpen] = useState(false);
  const [bonPlanDeleteTarget, setBonPlanDeleteTarget] = useState<BonPlan | null>(null);
  const [legalPageForm, setLegalPageForm] = useState<LegalPageForm>(emptyLegalPage);
  const [legalPageFormOpen, setLegalPageFormOpen] = useState(false);
  const [legalPageDeleteTarget, setLegalPageDeleteTarget] = useState<LegalPage | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>(emptyBooking);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [bookingDeleteTarget, setBookingDeleteTarget] = useState<Booking | null>(null);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);

  const activeNav = adminNavItems.find((item) => item.id === section) ?? adminNavItems[0];
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed");
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const cancelledBookings = bookings.filter((booking) => ["unavailable", "refunded"].includes(booking.status));
  const revenueTotal = bookings.reduce((sum, booking) => sum + bookingRevenue(booking), 0);
  const confirmedRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.price, 0);
  const pendingRevenue = pendingBookings.reduce((sum, booking) => sum + booking.price, 0);
  const refundedRevenue = bookings.filter((booking) => booking.status === "refunded").reduce((sum, booking) => sum + booking.price, 0);
  const averageBasket = bookings.length > 0 ? revenueTotal / bookings.length : 0;
  const monthRevenue = sumRevenueSince(bookings, 30);
  const weekRevenue = sumRevenueSince(bookings, 7);
  const previousMonthRevenue = sumRevenueBetween(bookings, 60, 30);
  const previousWeekRevenue = sumRevenueBetween(bookings, 14, 7);
  const homeProducts = useMemo(() => tours.filter((tour) => tour.popular), [tours]);
  const filteredBookings = useMemo(() => filterBookings(bookings, globalSearch), [bookings, globalSearch]);
  const filteredDriverBookings = useMemo(() => filteredBookings.filter((booking) => booking.type === "driver"), [filteredBookings]);
  const filteredTours = useMemo(() => filterTours(tours, globalSearch), [tours, globalSearch]);
  const filteredDrivers = useMemo(() => filterDrivers(drivers, globalSearch), [drivers, globalSearch]);
  const filteredPlans = useMemo(() => filterPlans(bonsPlans, globalSearch), [bonsPlans, globalSearch]);
  const clients = useMemo(() => buildClients(bookings, storedClients, clientAccounts), [bookings, storedClients, clientAccounts]);
  const filteredClients = useMemo(() => filterClients(clients, globalSearch), [clients, globalSearch]);
  const clientListPagination = useMemo<PaginationMeta>(() => {
    const totalItems = filteredClients.length;
    return {
      page: Math.min(clientPage, Math.max(1, Math.ceil(totalItems / CLIENT_LIST_PAGE_SIZE))),
      limit: CLIENT_LIST_PAGE_SIZE,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / CLIENT_LIST_PAGE_SIZE)),
    };
  }, [clientPage, filteredClients.length]);
  const listedClients = useMemo(() => {
    const page = Math.min(clientPage, Math.max(1, Math.ceil(filteredClients.length / CLIENT_LIST_PAGE_SIZE)));
    const start = (page - 1) * CLIENT_LIST_PAGE_SIZE;

    return filteredClients.slice(start, start + CLIENT_LIST_PAGE_SIZE);
  }, [clientPage, filteredClients]);
  const popularServices = useMemo(() => buildPopularServices(bookings), [bookings]);
  const revenueSeries = useMemo(() => buildRevenueSeries(bookings, Number(revenueRange)), [bookings, revenueRange]);
  const computedAdminNotifications = useMemo(
    () => buildAdminNotifications({
      pendingBookings,
      rentalBookings,
      activeContactRequests,
      clientAccounts,
      guides,
      drivers,
      tenants,
    }),
    [pendingBookings, rentalBookings, activeContactRequests, clientAccounts, guides, drivers, tenants],
  );
  const adminNotifications = useMemo(
    () => computedAdminNotifications.filter((notification) => !dismissedNotificationIds.includes(notification.id)),
    [computedAdminNotifications, dismissedNotificationIds],
  );

  const refresh = async () => {
    setIsLoading(true);
    try {
      const [
        loadedTours,
        loadedGuides,
        loadedDrivers,
        loadedTenants,
        loadedRentals,
        loadedRentalBookings,
        loadedPlans,
        loadedBookings,
        loadedLegalPages,
        loadedProfiles,
        loadedAccounts,
        loadedContactConfiguration,
        loadedHomepageConfiguration,
        loadedParcoursHeroConfiguration,
        loadedChauffeursHeroConfiguration,
        loadedLocationHeroConfiguration,
        loadedBonsPlansHeroConfiguration,
        loadedContactHeroConfiguration,
        loadedAiConfiguration,
        paginatedTours,
        paginatedGuides,
        paginatedDrivers,
        paginatedTenants,
        paginatedRentals,
        paginatedPlans,
        paginatedBookings,
        paginatedDriverBookings,
        paginatedLegalPages,
        paginatedClientProfiles,
        activeMessages,
        archivedMessages,
      ] = await Promise.all([
        getTours(),
        getGuides(),
        getDrivers(),
        getTenants(),
        getRentals(),
        getRentalBookings(),
        getBonsPlans(),
        getBookings(),
        getLegalPages(),
        getAdminClientProfiles(),
        getClientAccounts(),
        getContactConfiguration(),
        getHomepageConfiguration(),
        getPageHeroConfiguration("parcours"),
        getPageHeroConfiguration("chauffeurs"),
        getPageHeroConfiguration("location"),
        getPageHeroConfiguration("bons-plans"),
        getPageHeroConfiguration("contact"),
        getAiConfiguration(),
        searchTours({ q: globalSearch, page: tourPage, limit: ADMIN_LIST_PAGE_SIZE }),
        searchGuides({ q: globalSearch, page: guidePage, limit: ADMIN_LIST_PAGE_SIZE }),
        searchDrivers({ q: globalSearch, scope: "admin", page: driverPage, limit: ADMIN_LIST_PAGE_SIZE }),
        searchTenants({ q: globalSearch, status: "all", page: tenantPage, limit: ADMIN_LIST_PAGE_SIZE }),
        searchAdminRentals({ q: globalSearch, page: rentalPage, limit: ADMIN_LIST_PAGE_SIZE }),
        searchBonsPlans({ q: globalSearch, page: planPage, limit: ADMIN_LIST_PAGE_SIZE }),
        searchBookings({ q: globalSearch, page: bookingPage, limit: ADMIN_LIST_PAGE_SIZE }),
        searchBookings({ q: globalSearch, type: "driver", page: driverBookingPage, limit: ADMIN_LIST_PAGE_SIZE }),
        searchLegalPages({ q: globalSearch, page: legalPage, limit: ADMIN_LIST_PAGE_SIZE }),
        searchAdminClientProfiles({ q: globalSearch, page: clientPage, limit: ADMIN_LIST_PAGE_SIZE }),
        searchContactRequests({ queue: "active", q: globalSearch, page: activeContactPage, limit: ADMIN_MESSAGES_PAGE_SIZE }),
        searchContactRequests({ queue: "archived", q: globalSearch, page: archivedContactPage, limit: ADMIN_MESSAGES_PAGE_SIZE }),
      ]);
      setTours(loadedTours);
      setGuides(loadedGuides);
      setDrivers(loadedDrivers);
      setTenants(loadedTenants);
      setRentals(loadedRentals);
      setRentalBookings(loadedRentalBookings);
      setBonsPlans(loadedPlans);
      setBookings(loadedBookings);
      setLegalPages(loadedLegalPages);
      setStoredClients(loadedProfiles);
      setClientAccounts(loadedAccounts);
      setContactConfiguration(loadedContactConfiguration);
      setContactConfigurationForm(contactConfigurationToForm(loadedContactConfiguration));
      setHomepageConfiguration(loadedHomepageConfiguration);
      setHomepageConfigurationForm(homepageConfigurationToForm(loadedHomepageConfiguration));
      setParcoursHeroConfiguration(loadedParcoursHeroConfiguration);
      setParcoursHeroConfigurationForm(pageHeroConfigurationToForm(loadedParcoursHeroConfiguration, emptyParcoursHeroConfiguration));
      setChauffeursHeroConfiguration(loadedChauffeursHeroConfiguration);
      setChauffeursHeroConfigurationForm(pageHeroConfigurationToForm(loadedChauffeursHeroConfiguration, emptyChauffeursHeroConfiguration));
      setLocationHeroConfiguration(loadedLocationHeroConfiguration);
      setLocationHeroConfigurationForm(pageHeroConfigurationToForm(loadedLocationHeroConfiguration, emptyLocationHeroConfiguration));
      setBonsPlansHeroConfiguration(loadedBonsPlansHeroConfiguration);
      setBonsPlansHeroConfigurationForm(pageHeroConfigurationToForm(loadedBonsPlansHeroConfiguration, emptyBonsPlansHeroConfiguration));
      setContactHeroConfiguration(loadedContactHeroConfiguration);
      setContactHeroConfigurationForm(pageHeroConfigurationToForm(loadedContactHeroConfiguration, emptyContactHeroConfiguration));
      setAiConfiguration(loadedAiConfiguration);
      setAiConfigurationForm(aiConfigurationToForm(loadedAiConfiguration));
      setListedTours(paginatedTours.items);
      setTourPagination(paginatedTours.pagination);
      setListedGuides(paginatedGuides.items);
      setGuidePagination(paginatedGuides.pagination);
      setListedDrivers(paginatedDrivers.items);
      setDriverPagination(paginatedDrivers.pagination);
      setListedTenants(paginatedTenants.items);
      setTenantPagination(paginatedTenants.pagination);
      setListedRentals(paginatedRentals.items);
      setRentalPagination(paginatedRentals.pagination);
      setListedPlans(paginatedPlans.items);
      setPlanPagination(paginatedPlans.pagination);
      setListedBookings(paginatedBookings.items);
      setBookingPagination(paginatedBookings.pagination);
      setListedDriverBookings(paginatedDriverBookings.items);
      setDriverBookingPagination(paginatedDriverBookings.pagination);
      setListedLegalPages(paginatedLegalPages.items);
      setLegalPagination(paginatedLegalPages.pagination);
      setListedClientProfiles(paginatedClientProfiles.items);
      setClientPagination(paginatedClientProfiles.pagination);
      setActiveContactRequests(activeMessages.items);
      setActiveContactPagination(activeMessages.pagination);
      setArchivedContactRequests(archivedMessages.items);
      setArchivedContactPagination(archivedMessages.pagination);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = readAdminSession();
    if (!token) return;
    getAdminSession({ sessionToken: token })
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        clearAdminSession();
        setIsAuthenticated(false);
      });
  }, []);

  useEffect(() => {
    setSection(adminSectionFromPath(pathname));
  }, [pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setTourPage(1);
    setGuidePage(1);
    setDriverPage(1);
    setTenantPage(1);
    setRentalPage(1);
    setPlanPage(1);
    setBookingPage(1);
    setDriverBookingPage(1);
    setLegalPage(1);
    setClientPage(1);
    setActiveContactPage(1);
    setArchivedContactPage(1);
  }, [globalSearch]);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    }
  }, [tourPage, guidePage, driverPage, tenantPage, rentalPage, planPage, bookingPage, driverBookingPage, legalPage, clientPage, activeContactPage, archivedContactPage, globalSearch, section]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const response = await requestAdminLoginCode({ email: adminEmail, password });
      setLoginEmailSentTo(response.email);
      setLoginStep("code");
      toast.success("Code envoyé par email", {
        description: "Ouvre Mailpit pour récupérer le code de connexion.",
      });
    } catch {
      toast.error("Email ou mot de passe incorrect");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const response = await verifyAdminLoginCode({ email: adminEmail, code: loginCode });
      persistAdminSession(response.sessionToken);
      setIsAuthenticated(true);
      toast.success("Connexion réussie");
    } catch {
      toast.error("Code invalide ou expiré");
    } finally {
      setLoginLoading(false);
    }
  };

  const saveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    const image = await createImageAsset({ alt: tourForm.imageAlt || tourForm.title, url: tourForm.imageUrl });
    const payload = {
      title: tourForm.title,
      summary: tourForm.summary,
      durations: durationList(tourForm.durations),
      highlights: textList(tourForm.highlights),
      included: textList(tourForm.included),
      notIncluded: textList(tourForm.notIncluded),
      itinerary: textList(tourForm.itinerary),
      practicalInfo: textList(tourForm.practicalInfo),
      travelTips: textList(tourForm.travelTips),
      image: `/api/image_assets/${image.id}`,
      guide: tourForm.guideId ? `/api/guides/${tourForm.guideId}` : null,
      popular: tourForm.popular,
    };
    tourForm.id ? await updateTour(tourForm.id, payload) : await createTour(payload);
    setTourForm(emptyTour);
    setTourFormOpen(false);
    await refresh();
    toast.success("Parcours enregistré");
  };

  const saveGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: GuideInput = {
      firstName: guideForm.firstName,
      lastName: guideForm.lastName,
      location: guideForm.location,
      guideZone: guideForm.guideZone,
      phone: guideForm.phone,
      description: guideForm.description,
      offers: textList(guideForm.offers),
      specialties: textList(guideForm.specialties),
      languages: textList(guideForm.languages),
      validationStatus: guideForm.validationStatus,
      user: guideForm.userId ? `/api/client_accounts/${guideForm.userId}` : null,
    };
    guideForm.id ? await updateGuide(guideForm.id, payload) : await createGuide(payload);
    setGuideForm(emptyGuide);
    setGuideFormOpen(false);
    await refresh();
    toast.success("Guide enregistré");
  };

  const saveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    const image = await createImageAsset({ alt: driverForm.imageAlt || driverForm.name, url: driverForm.imageUrl });
    const payload = {
      name: driverForm.name,
      phone: driverForm.phone,
      whatsapp: driverForm.whatsapp,
      zone: driverForm.zone,
      vehicleType: driverForm.vehicleType,
      dailyPriceEur: Number(driverForm.dailyPriceEur),
      monthlyPriceEur: Number(driverForm.monthlyPriceEur),
      available: driverForm.available,
      validationStatus: driverForm.validationStatus,
      image: `/api/image_assets/${image.id}`,
      user: driverForm.userId ? `/api/client_accounts/${driverForm.userId}` : null,
    };
    driverForm.id ? await updateDriver(driverForm.id, payload) : await createDriver(payload);
    setDriverForm(emptyDriver);
    setDriverFormOpen(false);
    await refresh();
    toast.success("Chauffeur enregistré");
  };

  const updateTenantStatus = async (tenant: Tenant, status: Tenant["status"]) => {
    const payload: TenantInput = {
      fullName: tenant.fullName,
      location: tenant.location,
      phone: tenant.phone,
      whatsapp: tenant.whatsapp,
      availableSlots: tenant.availableSlots,
      status,
    };

    await updateTenant(tenant.id, payload);
    await refresh();
    toast.success(status === "validated" ? "Propriétaire validé" : "Statut propriétaire mis à jour");
  };

  const decideRental = async (booking: RentalBooking, decision: "accepted" | "refused" | "completed") => {
    await decideRentalBooking(booking.id, {
      decision,
      keyHandoverNotes: decision === "accepted" ? "Remise des clés à organiser avec le propriétaire. Ses coordonnées sont maintenant visibles côté client." : undefined,
      message: decision === "accepted"
        ? "Votre réservation est acceptée. Les informations du propriétaire sont maintenant disponibles."
        : decision === "refused"
          ? "Votre réservation est refusée. Le paiement sera remboursé par la plateforme."
          : "La prestation est terminée. Le paiement peut être libéré au propriétaire.",
    });
    await refresh();
    toast.success(decision === "accepted" ? "Location acceptée" : decision === "refused" ? "Location refusée" : "Location terminée");
  };

  const saveBonPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const image = await createImageAsset({ alt: bonPlanForm.imageAlt || bonPlanForm.title, url: bonPlanForm.imageUrl });
    const payload = {
      title: bonPlanForm.title,
      category: bonPlanForm.category,
      description: bonPlanForm.description,
      image: `/api/image_assets/${image.id}`,
    };
    bonPlanForm.id ? await updateBonPlan(bonPlanForm.id, payload) : await createBonPlan(payload);
    setBonPlanForm(emptyBonPlan);
    setBonPlanFormOpen(false);
    await refresh();
    toast.success("Bon plan enregistré");
  };

  const saveLegalPage = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      slug: legalPageForm.slug,
      title: legalPageForm.title,
      content: legalPageForm.content,
      updatedLabel: legalPageForm.updatedLabel,
    };
    legalPageForm.id ? await updateLegalPage(legalPageForm.id, payload) : await createLegalPage(payload);
    setLegalPageForm(emptyLegalPage);
    setLegalPageFormOpen(false);
    await refresh();
    toast.success("Page légale enregistrée");
  };

  const saveContactConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = contactConfigurationPayload(contactConfigurationForm);

    if (payload.openingHours.length === 0 || payload.faq.length === 0) {
      toast.error("Ajoute au moins un horaire et une question FAQ au format libellé | valeur");
      return;
    }

    contactConfigurationForm.id
      ? await updateContactConfiguration(contactConfigurationForm.id, payload)
      : await createContactConfiguration(payload);
    setContactConfigurationOpen(false);
    await refresh();
    toast.success("Configuration contact enregistrée");
  };

  const saveHomepageConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = homepageConfigurationPayload(homepageConfigurationForm);

    if (!payload.heroImageUrl.trim()) {
      toast.error("Ajoute une image pour l'accueil");
      return;
    }

    await updateHomepageConfiguration(payload);
    setHomepageConfigurationOpen(false);
    await refresh();
    toast.success("Accueil mis à jour");
  };

  const saveParcoursHeroConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = pageHeroConfigurationPayload(parcoursHeroConfigurationForm);

    if (!payload.imageUrl.trim()) {
      toast.error("Ajoute une image pour la page Parcours");
      return;
    }

    await updatePageHeroConfiguration("parcours", payload);
    setParcoursHeroConfigurationOpen(false);
    await refresh();
    toast.success("Hero Parcours mis à jour");
  };

  const saveChauffeursHeroConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = pageHeroConfigurationPayload(chauffeursHeroConfigurationForm);

    if (!payload.imageUrl.trim()) {
      toast.error("Ajoute une image pour la page Chauffeurs");
      return;
    }

    await updatePageHeroConfiguration("chauffeurs", payload);
    setChauffeursHeroConfigurationOpen(false);
    await refresh();
    toast.success("Hero Chauffeurs mis à jour");
  };

  const saveLocationHeroConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = pageHeroConfigurationPayload(locationHeroConfigurationForm);

    if (!payload.imageUrl.trim()) {
      toast.error("Ajoute une image pour la page Location");
      return;
    }

    await updatePageHeroConfiguration("location", payload);
    setLocationHeroConfigurationOpen(false);
    await refresh();
    toast.success("Hero Location mis à jour");
  };

  const saveBonsPlansHeroConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = pageHeroConfigurationPayload(bonsPlansHeroConfigurationForm);

    if (!payload.imageUrl.trim()) {
      toast.error("Ajoute une image pour la page Bons plans");
      return;
    }

    await updatePageHeroConfiguration("bons-plans", payload);
    setBonsPlansHeroConfigurationOpen(false);
    await refresh();
    toast.success("Hero Bons plans mis à jour");
  };

  const saveContactHeroConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = pageHeroConfigurationPayload(contactHeroConfigurationForm);

    if (!payload.imageUrl.trim()) {
      toast.error("Ajoute une image pour la page Contact");
      return;
    }

    await updatePageHeroConfiguration("contact", payload);
    setContactHeroConfigurationOpen(false);
    await refresh();
    toast.success("Hero Contact mis à jour");
  };

  const saveAiConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = aiConfigurationPayload(aiConfigurationForm);

    if (!payload.model.trim() || !payload.systemPrompt.trim()) {
      toast.error("Renseigne le modèle et le prompt système");
      return;
    }

    const hasIncompleteKnowledgeRow = aiConfigurationForm.knowledgeBase.some((row) => {
      const hasInput = row.input.trim() !== "";
      const hasAnswer = row.answer.trim() !== "";

      return hasInput !== hasAnswer;
    });
    if (hasIncompleteKnowledgeRow) {
      toast.error("Chaque connaissance IA doit avoir un input et une réponse");
      return;
    }

    const updatedConfiguration = await updateAiConfiguration(payload);
    setAiConfiguration(updatedConfiguration);
    setAiConfigurationForm(aiConfigurationToForm(updatedConfiguration));
    toast.success("Configuration IA enregistrée");
  };

  const saveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: bookingForm.type,
      tour: bookingForm.type === "tour" && bookingForm.tourId ? `/api/tours/${bookingForm.tourId}` : undefined,
      driver: bookingForm.type === "driver" && bookingForm.driverId ? `/api/drivers/${bookingForm.driverId}` : undefined,
      date: new Date(`${bookingForm.date}T09:00:00`).toISOString(),
      duration: Number(bookingForm.duration),
      price: Number(bookingForm.price),
      status: bookingForm.status,
      customerName: bookingForm.customerName,
      customerEmail: bookingForm.customerEmail,
      customerPhone: bookingForm.customerPhone,
    };
    if (bookingForm.id) {
      await updateBooking(bookingForm.id, payload);
      await notifyBookingUpdate(bookingForm.id);
    } else {
      await createBooking(payload);
    }
    setBookingForm(emptyBooking);
    setBookingFormOpen(false);
    await refresh();
    toast.success(bookingForm.id ? "Réservation enregistrée, client prévenu" : "Réservation enregistrée");
  };

  const saveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AdminClientProfileInput = {
      firstName: clientForm.firstName,
      lastName: clientForm.lastName,
      email: clientForm.email,
      phone: clientForm.phone,
      country: clientForm.country,
      address: clientForm.address,
      language: clientForm.language,
      accountStatus: clientForm.accountStatus,
      commercialStatus: clientForm.commercialStatus,
      notes: clientForm.notes,
    };
    const previous = clients.find((client) => client.id === clientForm.id);

    clientForm.id ? await updateAdminClientProfile(clientForm.id, payload) : await createAdminClientProfile(payload);

    if (previous?.email) {
      const linkedBookings = bookings.filter((booking) => booking.customerEmail.toLowerCase() === previous.email.toLowerCase());
      await Promise.all(linkedBookings.map((booking) => updateBooking(booking.id, {
        ...bookingPayloadFromExisting(booking, booking.status),
        customerName: `${nextClient.firstName} ${nextClient.lastName}`.trim(),
        customerEmail: nextClient.email,
        customerPhone: nextClient.phone,
      })));
      await refresh();
    } else {
      await refresh();
    }

    setClientForm(emptyClient);
    setClientFormOpen(false);
    toast.success("Client enregistré");
  };

  const anonymizeClient = async () => {
    if (!clientAnonymizeTarget) return;
    const anonymousEmail = `client-${clientAnonymizeTarget.id}@anonyme.local`;
    await Promise.all(clientAnonymizeTarget.bookings.map((booking) => updateBooking(booking.id, {
      ...bookingPayloadFromExisting(booking, booking.status),
      customerName: "Client anonymisé",
      customerEmail: anonymousEmail,
      customerPhone: "Anonymisé",
    })));
    const profile = storedClients.find((client) => client.email.toLowerCase() === clientAnonymizeTarget.email.toLowerCase());
    if (profile?.id) {
      await updateAdminClientProfile(profile.id, {
        firstName: "Client",
        lastName: "anonymisé",
        email: anonymousEmail,
        phone: "Anonymisé",
        country: profile.country,
        address: "",
        language: profile.language,
        accountStatus: "anonymisé",
        commercialStatus: profile.commercialStatus,
        notes: `${profile.notes}\nDonnées anonymisées depuis l'administration.`.trim(),
      });
    }
    setClientAnonymizeTarget(null);
    await refresh();
    toast.success("Données client anonymisées");
  };

  const selectSection = (nextSection: AdminSection) => {
    if (nextSection === "clients") {
      getClientAccounts().then(setClientAccounts).catch(() => toast.error("Impossible de charger les comptes clients"));
      getAdminClientProfiles().then(setStoredClients).catch(() => toast.error("Impossible de charger les profils clients"));
    }
    setSection(nextSection);
    setMobileMenuOpen(false);
    navigate(adminPathForSection(nextSection));
  };

  if (!isAuthenticated) {
    return (
      <div className="grid min-h-screen bg-[#f7f3eb] text-stone-950 lg:grid-cols-[minmax(360px,0.9fr)_minmax(480px,1.1fr)]">
        <section className="hidden min-h-screen flex-col justify-between bg-stone-950 p-10 text-white lg:flex">
          <BrandLogo invert className="h-14 w-52" />
          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">Back office</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">Pilotage commercial et opérationnel</h1>
            <p className="mt-5 text-base leading-7 text-stone-300">Réservations, clients, chauffeurs, guides, bons plans et suivi du chiffre d'affaires.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md border border-white/10 p-3">
              <p className="text-2xl font-semibold">{bookings.length}</p>
              <p className="mt-1 text-stone-400">Réservations</p>
            </div>
            <div className="rounded-md border border-white/10 p-3">
              <p className="text-2xl font-semibold">{drivers.length}</p>
              <p className="mt-1 text-stone-400">Chauffeurs</p>
            </div>
            <div className="rounded-md border border-white/10 p-3">
              <p className="text-2xl font-semibold">{guides.length}</p>
              <p className="mt-1 text-stone-400">Guides</p>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8">
          <Card className="w-full max-w-[520px] rounded-md border-stone-200 bg-white shadow-xl">
            <CardHeader className="space-y-4 p-6 sm:p-8">
              <div className="flex items-center gap-3 lg:hidden">
                <BrandLogo compact className="h-11 w-11" />
                <div>
                  <p className="font-semibold">ORITA</p>
                  <p className="text-xs text-stone-500">Administration</p>
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">Connexion Admin</CardTitle>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Accès protégé par email, mot de passe et code de vérification local.
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
              {loginStep === "credentials" ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <Label>Email administrateur</Label>
                    <div className="relative mt-2">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@benintours.local" className="h-11 pl-9" />
                    </div>
                  </div>
                  <div>
                    <Label>Mot de passe</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin123" className="mt-2 h-11" />
                  </div>
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                    Une alerte de connexion avec un code à 6 chiffres sera envoyée sur le service email local.
                  </div>
                  <Button type="submit" className="h-11 w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" disabled={loginLoading}>
                    {loginLoading ? "Envoi du code..." : "Recevoir le code"}
                  </Button>
                  <p className="text-xs text-stone-500">Démo locale : `admin@benintours.local` / `admin123`.</p>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                    Code envoyé à {loginEmailSentTo}. Ouvre Mailpit local pour le récupérer.
                  </div>
                  <div>
                    <Label>Code de vérification</Label>
                    <Input value={loginCode} onChange={(e) => setLoginCode(e.target.value)} placeholder="123456" inputMode="numeric" className="mt-2 h-12 text-center text-lg tracking-[0.35em]" maxLength={6} />
                  </div>
                  <Button type="submit" className="h-11 w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" disabled={loginLoading}>
                    {loginLoading ? "Vérification..." : "Valider le code"}
                  </Button>
                  <Button type="button" variant="outline" className="h-11 w-full" onClick={() => setLoginStep("credentials")}>
                    Modifier l'email
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div>
      <AdminLayout
        activeSection={section}
        activeLabel={activeNav.label}
        collapsed={sidebarCollapsed}
        isMobileOpen={mobileMenuOpen}
        globalSearch={globalSearch}
        notifications={adminNotifications}
        onSearchChange={setGlobalSearch}
        onDismissNotification={(id) => setDismissedNotificationIds((current) => Array.from(new Set([...current, id])))}
        onDismissAllNotifications={() => setDismissedNotificationIds((current) => Array.from(new Set([...current, ...adminNotifications.map((notification) => notification.id)])))}
        onCollapse={() => setSidebarCollapsed((value) => !value)}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenMobile={() => setMobileMenuOpen(true)}
        onSelect={selectSection}
        onLogout={() => {
          clearAdminSession();
          setIsAuthenticated(false);
          setLoginStep("credentials");
          setPassword("");
          setLoginCode("");
        }}
      >
          {isLoading && <div className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">Chargement des données...</div>}

          {section === "dashboard" && (
            <DashboardSection
              revenueTotal={revenueTotal}
              confirmedRevenue={confirmedRevenue}
              pendingRevenue={pendingRevenue}
              refundedRevenue={refundedRevenue}
              monthRevenue={monthRevenue}
              weekRevenue={weekRevenue}
              previousMonthRevenue={previousMonthRevenue}
              previousWeekRevenue={previousWeekRevenue}
              averageBasket={averageBasket}
              bookings={bookings}
              confirmedBookings={confirmedBookings}
              pendingBookings={pendingBookings}
              cancelledBookings={cancelledBookings}
              drivers={drivers}
              tours={tours}
              bonsPlans={bonsPlans}
              popularServices={popularServices}
              revenueSeries={revenueSeries}
              revenueRange={revenueRange}
              setRevenueRange={setRevenueRange}
              currency={dashboardCurrency}
              setCurrency={setDashboardCurrency}
              onOpenBooking={(booking) => {
                setBookingForm(bookingToForm(booking));
                setSection("bookings");
              }}
              onConfirmBooking={async (booking) => {
                await updateBooking(booking.id, bookingPayloadFromExisting(booking, "confirmed"));
                await refresh();
                toast.success("Réservation confirmée");
              }}
            />
          )}

          {section === "clients" && (
            <ListManagementSection
              title="Gestion des clients"
              description="CRM centralisé : comptes, réservations, CA, statuts, paiements, notes et actions relationnelles."
              addLabel="Ajouter un client"
              onAdd={() => {
                setClientForm(emptyClient);
                setClientFormOpen(true);
              }}
            >
              <ClientsSection
                clients={listedClients}
                pagination={clientListPagination}
                currency={dashboardCurrency}
                setCurrency={setDashboardCurrency}
                onPageChange={setClientPage}
                onView={setClientDetail}
                onEdit={(client) => {
                  setClientForm(clientToForm(client));
                  setClientFormOpen(true);
                }}
                onBookings={(client) => {
                  setGlobalSearch(client.email);
                  setSection("bookings");
                }}
                onMessage={(client) => {
                  setClientMessageTarget(client);
                  setClientMessage("");
                }}
                onCreateBooking={(client) => {
                  setBookingForm({
                    ...emptyBooking,
                    customerName: `${client.firstName} ${client.lastName}`.trim(),
                    customerEmail: client.email,
                    customerPhone: client.phone,
                  });
                  setBookingFormOpen(true);
                }}
                onAnonymize={setClientAnonymizeTarget}
              />
            </ListManagementSection>
          )}

          {section === "tours" && (
            <ListManagementSection
              title="Gestion des parcours"
              description="Création, publication, mise en avant et suivi des parcours touristiques."
              addLabel="Ajouter un parcours"
              onAdd={() => {
                setTourForm(emptyTour);
                setTourFormOpen(true);
              }}
            >
              <ToursTable
                tours={listedTours}
                bookings={bookings}
                onView={(tour) => navigate(`/parcours/${tour.id}`)}
                onEdit={(tour) => {
                  setTourForm(tourToForm(tour));
                  setTourFormOpen(true);
                }}
                onDelete={(tour) => setTourDeleteTarget(tour)}
              />
              <PaginationControls pagination={tourPagination} onPageChange={setTourPage} label="parcours" />
            </ListManagementSection>
          )}

          {section === "guides" && (
            <ListManagementSection
              title="Gestion des guides"
              description="Guides locaux assignables aux parcours touristiques."
              addLabel="Ajouter un guide"
              onAdd={() => {
                setGuideForm(emptyGuide);
                setGuideFormOpen(true);
              }}
            >
              <GuidesTable
                guides={listedGuides}
                tours={tours}
                onEdit={(guide) => {
                  setGuideForm(guideToForm(guide));
                  setGuideFormOpen(true);
                }}
                onDelete={(guide) => setGuideDeleteTarget(guide)}
              />
              <PaginationControls pagination={guidePagination} onPageChange={setGuidePage} label="guides" />
            </ListManagementSection>
          )}

          {section === "drivers" && (
            <ListManagementSection
              title="Gestion des chauffeurs"
              description="Disponibilités, zones couvertes, tarifs et suivi des réservations chauffeur."
              addLabel="Ajouter un chauffeur"
              onAdd={() => {
                setDriverForm(emptyDriver);
                setDriverFormOpen(true);
              }}
            >
              <DriversTable
                drivers={listedDrivers}
                bookings={bookings}
                onView={(driver) => navigate(`/chauffeurs?driver=${driver.id}`)}
                onEdit={(driver) => {
                  setDriverForm(driverToForm(driver));
                  setDriverFormOpen(true);
                }}
                onDelete={(driver) => setDriverDeleteTarget(driver)}
              />
              <PaginationControls pagination={driverPagination} onPageChange={setDriverPage} label="chauffeurs" />
            </ListManagementSection>
          )}

          {section === "rentals" && (
            <ListManagementSection
              title="Gestion des locations"
              description="Demandes de réservation et contrôle des appartements ou maisons publiables."
            >
              <RentalsAdminSection
                rentals={listedRentals}
                allRentals={rentals}
                rentalBookings={rentalBookings}
                rentalPagination={rentalPagination}
                onRentalPageChange={setRentalPage}
                onRentalDecision={decideRental}
              />
            </ListManagementSection>
          )}

          {section === "tenants" && (
            <ListManagementSection
              title="Gestion des propriétaires"
              description="Validation admin des propriétaires avant publication de leurs biens en location."
            >
              <TenantsAdminSection
                tenants={listedTenants}
                allRentals={rentals}
                tenantPagination={tenantPagination}
                onTenantPageChange={setTenantPage}
                onTenantStatusChange={updateTenantStatus}
              />
            </ListManagementSection>
          )}

          {section === "plans" && (
            <ListManagementSection
              title="Gestion des bons plans"
              description="Restaurants, plages, activités et recommandations locales."
              addLabel="Ajouter un bon plan"
              onAdd={() => {
                setBonPlanForm(emptyBonPlan);
                setBonPlanFormOpen(true);
              }}
            >
              <PlansTable
                plans={listedPlans}
                onView={(plan) => navigate(`/bons-plans/${plan.id}`)}
                onEdit={(plan) => {
                  setBonPlanForm(bonPlanToForm(plan));
                  setBonPlanFormOpen(true);
                }}
                onDelete={(plan) => setBonPlanDeleteTarget(plan)}
              />
              <PaginationControls pagination={planPagination} onPageChange={setPlanPage} label="bons plans" />
            </ListManagementSection>
          )}

          {section === "bookings" && (
            <ListManagementSection
              title="Gestion des réservations"
              description="Suivi opérationnel, statut, client, montant et affectation de prestation."
              addLabel="Ajouter une réservation"
              onAdd={() => {
                setBookingForm(emptyBooking);
                setBookingFormOpen(true);
              }}
            >
              <BookingsTable
                bookings={listedBookings}
                onEdit={(booking) => {
                  setBookingForm(bookingToForm(booking));
                  setBookingFormOpen(true);
                }}
                onConfirm={async (booking) => {
                  await updateBooking(booking.id, bookingPayloadFromExisting(booking, "confirmed"));
                  await refresh();
                  toast.success("Réservation confirmée");
                }}
                onCancel={async (booking) => {
                  await updateBooking(booking.id, bookingPayloadFromExisting(booking, "refunded"));
                  await refresh();
                  toast.success("Réservation annulée");
                }}
                onDelete={(booking) => setBookingDeleteTarget(booking)}
              />
              <PaginationControls pagination={bookingPagination} onPageChange={setBookingPage} label="réservations" />
            </ListManagementSection>
          )}

          {section === "driverBookings" && (
            <ListManagementSection
              title="Réservations de chauffeurs"
              description="Suivi des demandes chauffeur, affectation, disponibilité, confirmation et annulation."
              addLabel="Ajouter une réservation chauffeur"
              onAdd={() => {
                setBookingForm({ ...emptyBooking, type: "driver", tourId: "" });
                setBookingFormOpen(true);
              }}
            >
              <DriverBookingsSection
                bookings={listedDriverBookings}
                drivers={drivers}
                onEdit={(booking) => {
                  setBookingForm(bookingToForm(booking));
                  setBookingFormOpen(true);
                }}
                onConfirm={async (booking) => {
                  await updateBooking(booking.id, bookingPayloadFromExisting(booking, "confirmed"));
                  await refresh();
                  toast.success("Réservation chauffeur confirmée");
                }}
                onCancel={async (booking) => {
                  await updateBooking(booking.id, bookingPayloadFromExisting(booking, "refunded"));
                  await refresh();
                  toast.success("Réservation chauffeur annulée");
                }}
                onDelete={(booking) => setBookingDeleteTarget(booking)}
              />
              <PaginationControls pagination={driverBookingPagination} onPageChange={setDriverBookingPage} label="réservations chauffeur" />
            </ListManagementSection>
          )}

          {section === "messages" && (
            <MessagesAdminSection clients={filteredClients} activeRequests={activeContactRequests} archivedRequests={archivedContactRequests} activePagination={activeContactPagination} archivedPagination={archivedContactPagination} onActivePageChange={setActiveContactPage} onArchivedPageChange={setArchivedContactPage} onMessage={(client) => {
              setClientMessageTarget(client);
              setClientMessage("");
            }} onReplyContact={(request) => {
              setContactReplyTarget(request);
              setContactReply("");
            }} onResolveContact={async (request) => {
              if (!request.id) return;
              await updateContactRequest(request.id, { status: "archivé" });
              await refresh();
              toast.success("Message archivé");
            }} />
          )}

          {section === "ai" && (
            <ListManagementSection
              title="Configuration IA"
              description="Agent local Orita basé sur Ollama pour répondre aux questions simples du site."
            >
              <AiConfigurationSection
                configuration={aiConfiguration}
                form={aiConfigurationForm}
                setForm={setAiConfigurationForm}
                onSubmit={saveAiConfiguration}
              />
            </ListManagementSection>
          )}

          {section === "legal" && (
            <ListManagementSection
              title="Gestion des pages légales"
              description="Mentions légales, confidentialité, CGV et futures pages juridiques."
              addLabel="Ajouter une page"
              onAdd={() => {
                setLegalPageForm(emptyLegalPage);
                setLegalPageFormOpen(true);
              }}
            >
              <LegalTable
                pages={listedLegalPages}
                onView={(page) => navigate(`/${page.slug}`)}
                onEdit={(page) => {
                  setLegalPageForm(legalPageToForm(page));
                  setLegalPageFormOpen(true);
                }}
                onDelete={(page) => setLegalPageDeleteTarget(page)}
              />
              <PaginationControls pagination={legalPagination} onPageChange={setLegalPage} label="pages légales" />
            </ListManagementSection>
          )}

          {section === "settings" && (
            <SettingsSection
              contactConfiguration={contactConfiguration}
              homepageConfiguration={homepageConfiguration}
              parcoursHeroConfiguration={parcoursHeroConfiguration}
              chauffeursHeroConfiguration={chauffeursHeroConfiguration}
              locationHeroConfiguration={locationHeroConfiguration}
              bonsPlansHeroConfiguration={bonsPlansHeroConfiguration}
              contactHeroConfiguration={contactHeroConfiguration}
              onEditHomepage={() => {
                setHomepageConfigurationForm(homepageConfigurationToForm(homepageConfiguration));
                setHomepageConfigurationOpen(true);
              }}
              onEditParcoursHero={() => {
                setParcoursHeroConfigurationForm(pageHeroConfigurationToForm(parcoursHeroConfiguration, emptyParcoursHeroConfiguration));
                setParcoursHeroConfigurationOpen(true);
              }}
              onEditChauffeursHero={() => {
                setChauffeursHeroConfigurationForm(pageHeroConfigurationToForm(chauffeursHeroConfiguration, emptyChauffeursHeroConfiguration));
                setChauffeursHeroConfigurationOpen(true);
              }}
              onEditLocationHero={() => {
                setLocationHeroConfigurationForm(pageHeroConfigurationToForm(locationHeroConfiguration, emptyLocationHeroConfiguration));
                setLocationHeroConfigurationOpen(true);
              }}
              onEditBonsPlansHero={() => {
                setBonsPlansHeroConfigurationForm(pageHeroConfigurationToForm(bonsPlansHeroConfiguration, emptyBonsPlansHeroConfiguration));
                setBonsPlansHeroConfigurationOpen(true);
              }}
              onEditContactHero={() => {
                setContactHeroConfigurationForm(pageHeroConfigurationToForm(contactHeroConfiguration, emptyContactHeroConfiguration));
                setContactHeroConfigurationOpen(true);
              }}
              onEditContact={() => {
                setContactConfigurationForm(contactConfigurationToForm(contactConfiguration));
                setContactConfigurationOpen(true);
              }}
            />
          )}
      </AdminLayout>

      <Dialog open={tourFormOpen} onOpenChange={setTourFormOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{tourForm.id ? "Modifier le parcours" : "Ajouter un parcours"}</DialogTitle>
            <DialogDescription>
              Renseigne les informations commerciales, le programme, les prix et la publication du parcours.
            </DialogDescription>
          </DialogHeader>
          <TourFormView form={tourForm} guides={guides} setForm={setTourForm} onSubmit={saveTour} />
        </DialogContent>
      </Dialog>

      <Dialog open={guideFormOpen} onOpenChange={setGuideFormOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{guideForm.id ? "Modifier le guide" : "Ajouter un guide"}</DialogTitle>
            <DialogDescription>Renseigne l'identité, la localisation et la zone couverte par le guide.</DialogDescription>
          </DialogHeader>
          <GuideFormView form={guideForm} clientAccounts={clientAccounts} setForm={setGuideForm} onSubmit={saveGuide} />
        </DialogContent>
      </Dialog>

      <Dialog open={clientFormOpen} onOpenChange={setClientFormOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{clientForm.id ? "Modifier le client" : "Ajouter un client"}</DialogTitle>
            <DialogDescription>
              Gère les informations CRM du client. Le mot de passe client n'est jamais visible dans l'administration.
            </DialogDescription>
          </DialogHeader>
          <ClientFormView form={clientForm} setForm={setClientForm} onSubmit={saveClient} />
        </DialogContent>
      </Dialog>

      <Dialog open={clientDetail !== null} onOpenChange={(open) => !open && setClientDetail(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Fiche client complète</DialogTitle>
            <DialogDescription>Profil, indicateurs, réservations, paiements, documents, consentements et historique.</DialogDescription>
          </DialogHeader>
          {clientDetail && <ClientDetailView client={clientDetail} currency={dashboardCurrency} />}
        </DialogContent>
      </Dialog>

      <Dialog open={clientMessageTarget !== null} onOpenChange={(open) => !open && setClientMessageTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un message</DialogTitle>
            <DialogDescription>Message relation client associé au dossier de {clientMessageTarget?.name ?? "ce client"}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => {
            event.preventDefault();
            setClientMessageTarget(null);
            setClientMessage("");
            toast.success("Message client enregistré", { description: "En mode local, il est simulé dans l'administration." });
          }} className="space-y-4">
            <select className="h-9 w-full rounded-md border bg-white px-3 text-sm">
              <option>Question sur la réservation</option>
              <option>Paiement</option>
              <option>Modification</option>
              <option>Annulation</option>
              <option>Chauffeur</option>
              <option>Réclamation</option>
            </select>
            <Textarea required className="min-h-32" value={clientMessage} onChange={(e) => setClientMessage(e.target.value)} placeholder="Votre message ou note interne..." />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setClientMessageTarget(null)}>Annuler</Button>
              <Button className="bg-emerald-900 text-white hover:bg-emerald-800">Envoyer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={contactReplyTarget !== null} onOpenChange={(open) => !open && setContactReplyTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Répondre au message</DialogTitle>
            <DialogDescription>
              Réponse envoyée par email à {contactReplyTarget?.name ?? "ce client"} ({contactReplyTarget?.email ?? ""}).
            </DialogDescription>
          </DialogHeader>
          {contactReplyTarget && (
            <div className="rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
              <p className="font-medium">{contactReplyTarget.subject}</p>
              <p className="mt-1 whitespace-pre-line">{contactReplyTarget.message}</p>
            </div>
          )}
          <form onSubmit={async (event) => {
            event.preventDefault();
            if (!contactReplyTarget?.id) return;
            await replyToContactRequest(contactReplyTarget.id, contactReply);
            setContactReplyTarget(null);
            setContactReply("");
            await refresh();
            toast.success("Réponse envoyée", { description: "Le mail est visible dans Mailpit." });
          }} className="space-y-4">
            <Textarea required className="min-h-36" value={contactReply} onChange={(event) => setContactReply(event.target.value)} placeholder="Votre réponse au client..." />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setContactReplyTarget(null)}>Annuler</Button>
              <Button className="bg-emerald-900 text-white hover:bg-emerald-800">Envoyer la réponse</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={clientAnonymizeTarget !== null}
        title="Anonymiser ce client ?"
        description={`Les coordonnées de “${clientAnonymizeTarget?.name ?? ""}” seront remplacées sur ses réservations. Les données comptables restent conservées.`}
        onCancel={() => setClientAnonymizeTarget(null)}
        onConfirm={anonymizeClient}
      />

      <Dialog open={tourDeleteTarget !== null} onOpenChange={(open) => !open && setTourDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce parcours ?</DialogTitle>
            <DialogDescription>
              Cette action supprimera définitivement “{tourDeleteTarget?.title}”. Les réservations liées peuvent empêcher la suppression si elles existent en base.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTourDeleteTarget(null)}>Annuler</Button>
            <Button
              type="button"
              className="bg-red-700 text-white hover:bg-red-800"
              onClick={async () => {
                if (!tourDeleteTarget) return;
                await deleteTour(tourDeleteTarget.id);
                setTourDeleteTarget(null);
                await refresh();
                toast.success("Parcours supprimé");
              }}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={guideDeleteTarget !== null}
        title="Supprimer ce guide ?"
        description={`Cette action supprimera définitivement “${guideDeleteTarget?.fullName ?? ""}”. Retire son assignation des parcours avant suppression si nécessaire.`}
        onCancel={() => setGuideDeleteTarget(null)}
        onConfirm={async () => {
          if (!guideDeleteTarget) return;
          await deleteGuide(guideDeleteTarget.id);
          setGuideDeleteTarget(null);
          await refresh();
          toast.success("Guide supprimé");
        }}
      />

      <Dialog open={driverFormOpen} onOpenChange={setDriverFormOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{driverForm.id ? "Modifier le chauffeur" : "Ajouter un chauffeur"}</DialogTitle>
            <DialogDescription>Gère le profil, les zones, le véhicule, les tarifs et la disponibilité.</DialogDescription>
          </DialogHeader>
          <DriverFormView form={driverForm} clientAccounts={clientAccounts} setForm={setDriverForm} onSubmit={saveDriver} />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={driverDeleteTarget !== null}
        title="Supprimer ce chauffeur ?"
        description={`Cette action supprimera définitivement “${driverDeleteTarget?.name ?? ""}”.`}
        onCancel={() => setDriverDeleteTarget(null)}
        onConfirm={async () => {
          if (!driverDeleteTarget) return;
          await deleteDriver(driverDeleteTarget.id);
          setDriverDeleteTarget(null);
          await refresh();
          toast.success("Chauffeur supprimé");
        }}
      />

      <Dialog open={bonPlanFormOpen} onOpenChange={setBonPlanFormOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{bonPlanForm.id ? "Modifier le bon plan" : "Ajouter un bon plan"}</DialogTitle>
            <DialogDescription>Ajoute ou modifie une recommandation locale affichée sur le site.</DialogDescription>
          </DialogHeader>
          <BonPlanFormView form={bonPlanForm} setForm={setBonPlanForm} onSubmit={saveBonPlan} />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={bonPlanDeleteTarget !== null}
        title="Supprimer ce bon plan ?"
        description={`Cette action supprimera définitivement “${bonPlanDeleteTarget?.title ?? ""}”.`}
        onCancel={() => setBonPlanDeleteTarget(null)}
        onConfirm={async () => {
          if (!bonPlanDeleteTarget) return;
          await deleteBonPlan(bonPlanDeleteTarget.id);
          setBonPlanDeleteTarget(null);
          await refresh();
          toast.success("Bon plan supprimé");
        }}
      />

      <Dialog open={bookingFormOpen} onOpenChange={setBookingFormOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{bookingForm.id ? "Modifier la réservation" : "Ajouter une réservation"}</DialogTitle>
            <DialogDescription>Gère le client, la prestation, le montant et le statut opérationnel.</DialogDescription>
          </DialogHeader>
          <BookingFormView form={bookingForm} setForm={setBookingForm} drivers={drivers} tours={tours} onSubmit={saveBooking} />
        </DialogContent>
      </Dialog>

      <Dialog open={contactConfigurationOpen} onOpenChange={setContactConfigurationOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configuration contact</DialogTitle>
            <DialogDescription>Modifie les coordonnées publiques, les horaires d'ouverture et la FAQ de la page Contact.</DialogDescription>
          </DialogHeader>
          <ContactConfigurationFormView form={contactConfigurationForm} setForm={setContactConfigurationForm} onSubmit={saveContactConfiguration} />
        </DialogContent>
      </Dialog>

      <Dialog open={homepageConfigurationOpen} onOpenChange={setHomepageConfigurationOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configuration de l'accueil</DialogTitle>
            <DialogDescription>Modifie l'image principale, le titre et les textes du bloc hero affiché sur la page d'accueil.</DialogDescription>
          </DialogHeader>
          <HomepageConfigurationFormView form={homepageConfigurationForm} setForm={setHomepageConfigurationForm} onSubmit={saveHomepageConfiguration} />
        </DialogContent>
      </Dialog>

      <Dialog open={parcoursHeroConfigurationOpen} onOpenChange={setParcoursHeroConfigurationOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Hero de la page Parcours</DialogTitle>
            <DialogDescription>Modifie l'image, le surtitre, le titre et le texte d'introduction de la page publique Parcours.</DialogDescription>
          </DialogHeader>
          <PageHeroConfigurationFormView
            form={parcoursHeroConfigurationForm}
            setForm={setParcoursHeroConfigurationForm}
            onSubmit={saveParcoursHeroConfiguration}
            submitLabel="Enregistrer le hero Parcours"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={chauffeursHeroConfigurationOpen} onOpenChange={setChauffeursHeroConfigurationOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Hero de la page Chauffeurs</DialogTitle>
            <DialogDescription>Modifie le design du bandeau, l'image de fond et les textes de la page publique Chauffeurs.</DialogDescription>
          </DialogHeader>
          <PageHeroConfigurationFormView
            form={chauffeursHeroConfigurationForm}
            setForm={setChauffeursHeroConfigurationForm}
            onSubmit={saveChauffeursHeroConfiguration}
            submitLabel="Enregistrer le hero Chauffeurs"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={locationHeroConfigurationOpen} onOpenChange={setLocationHeroConfigurationOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Hero de la page Location</DialogTitle>
            <DialogDescription>Modifie l'image de fond et les textes de la page publique Location.</DialogDescription>
          </DialogHeader>
          <PageHeroConfigurationFormView
            form={locationHeroConfigurationForm}
            setForm={setLocationHeroConfigurationForm}
            onSubmit={saveLocationHeroConfiguration}
            submitLabel="Enregistrer le hero Location"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={bonsPlansHeroConfigurationOpen} onOpenChange={setBonsPlansHeroConfigurationOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Hero de la page Bons plans</DialogTitle>
            <DialogDescription>Modifie l'image de fond et les textes de la page publique Bons plans.</DialogDescription>
          </DialogHeader>
          <PageHeroConfigurationFormView
            form={bonsPlansHeroConfigurationForm}
            setForm={setBonsPlansHeroConfigurationForm}
            onSubmit={saveBonsPlansHeroConfiguration}
            submitLabel="Enregistrer le hero Bons plans"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={contactHeroConfigurationOpen} onOpenChange={setContactHeroConfigurationOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Hero de la page Contact</DialogTitle>
            <DialogDescription>Modifie l'image de fond et les textes du bandeau de la page publique Contact.</DialogDescription>
          </DialogHeader>
          <PageHeroConfigurationFormView
            form={contactHeroConfigurationForm}
            setForm={setContactHeroConfigurationForm}
            onSubmit={saveContactHeroConfiguration}
            submitLabel="Enregistrer le hero Contact"
          />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={bookingDeleteTarget !== null}
        title="Supprimer cette réservation ?"
        description={`Cette action supprimera définitivement la réservation #${bookingDeleteTarget?.id ?? ""}.`}
        onCancel={() => setBookingDeleteTarget(null)}
        onConfirm={async () => {
          if (!bookingDeleteTarget) return;
          await deleteBooking(bookingDeleteTarget.id);
          setBookingDeleteTarget(null);
          await refresh();
          toast.success("Réservation supprimée");
        }}
      />

      <Dialog open={legalPageFormOpen} onOpenChange={setLegalPageFormOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{legalPageForm.id ? "Modifier la page légale" : "Ajouter une page légale"}</DialogTitle>
            <DialogDescription>Modifie le titre, le slug, le contenu et le libellé de mise à jour.</DialogDescription>
          </DialogHeader>
          <LegalPageFormView form={legalPageForm} setForm={setLegalPageForm} onSubmit={saveLegalPage} />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={legalPageDeleteTarget !== null}
        title="Supprimer cette page légale ?"
        description={`Cette action supprimera définitivement “${legalPageDeleteTarget?.title ?? ""}”.`}
        onCancel={() => setLegalPageDeleteTarget(null)}
        onConfirm={async () => {
          if (!legalPageDeleteTarget) return;
          await deleteLegalPage(legalPageDeleteTarget.id);
          setLegalPageDeleteTarget(null);
          await refresh();
          toast.success("Page légale supprimée");
        }}
      />
    </div>
  );
}

function DashboardSection({ revenueTotal, confirmedRevenue, pendingRevenue, refundedRevenue, monthRevenue, weekRevenue, previousMonthRevenue, previousWeekRevenue, averageBasket, bookings, confirmedBookings, pendingBookings, cancelledBookings, drivers, tours, bonsPlans, popularServices, revenueSeries, revenueRange, setRevenueRange, currency, setCurrency, onOpenBooking, onConfirmBooking }: {
  revenueTotal: number;
  confirmedRevenue: number;
  pendingRevenue: number;
  refundedRevenue: number;
  monthRevenue: number;
  weekRevenue: number;
  previousMonthRevenue: number;
  previousWeekRevenue: number;
  averageBasket: number;
  bookings: Booking[];
  confirmedBookings: Booking[];
  pendingBookings: Booking[];
  cancelledBookings: Booking[];
  drivers: Driver[];
  tours: Tour[];
  bonsPlans: BonPlan[];
  popularServices: PopularService[];
  revenueSeries: RevenuePoint[];
  revenueRange: string;
  setRevenueRange: (value: string) => void;
  currency: DashboardCurrency;
  setCurrency: (value: DashboardCurrency) => void;
  onOpenBooking: (booking: Booking) => void;
  onConfirmBooking: (booking: Booking) => void;
}) {
  const availableDrivers = drivers.filter((driver) => driver.available);
  const tourRevenue = bookings.filter((booking) => booking.type === "tour").reduce((sum, booking) => sum + bookingRevenue(booking), 0);
  const driverRevenue = bookings.filter((booking) => booking.type === "driver").reduce((sum, booking) => sum + bookingRevenue(booking), 0);
  const monthlyGoal = 2_500_000;
  const progress = Math.min(100, Math.round((monthRevenue / monthlyGoal) * 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-md border border-stone-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-stone-950">Devise du tableau de bord</p>
          <p className="mt-1 text-xs text-stone-500">Les montants sont enregistrés en FCFA et affichés ici en euros par défaut.</p>
        </div>
        <div className="inline-flex w-fit rounded-md border border-stone-200 bg-[#fbfaf7] p-1">
          {(["EUR", "FCFA"] as DashboardCurrency[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCurrency(option)}
              className={`rounded px-4 py-2 text-sm font-medium transition ${currency === option ? "bg-emerald-900 text-white shadow-sm" : "text-stone-600 hover:bg-white"}`}
              aria-pressed={currency === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CircleDollarSign} label="CA total" value={formatMoney(revenueTotal, currency)} evolution={growthLabel(monthRevenue, previousMonthRevenue)} tone="emerald" />
        <MetricCard icon={TrendingUp} label="CA du mois" value={formatMoney(monthRevenue, currency)} evolution={growthLabel(monthRevenue, previousMonthRevenue)} tone="blue" />
        <MetricCard icon={CalendarDays} label="CA semaine" value={formatMoney(weekRevenue, currency)} evolution={growthLabel(weekRevenue, previousWeekRevenue)} tone="amber" />
        <MetricCard icon={ShoppingBag} label="Panier moyen" value={formatMoney(averageBasket, currency)} evolution={`${bookings.length} réservation${bookings.length > 1 ? "s" : ""}`} tone="stone" />
        <MetricCard icon={LayoutDashboard} label="Réservations" value={String(bookings.length)} evolution={`${pendingBookings.length} en attente`} tone="blue" />
        <MetricCard icon={CheckCircle} label="Confirmées" value={String(confirmedBookings.length)} evolution={formatMoney(confirmedRevenue, currency)} tone="emerald" />
        <MetricCard icon={AlertTriangle} label="Annulées / remboursées" value={String(cancelledBookings.length)} evolution={formatMoney(refundedRevenue, currency)} tone="red" />
        <MetricCard icon={Car} label="Chauffeurs actifs" value={String(availableDrivers.length)} evolution={`${drivers.length} total`} tone="emerald" />
        <MetricCard icon={CalendarDays} label="Parcours publiés" value={String(tours.length)} evolution={`${tours.filter((tour) => tour.popular).length} en accueil`} tone="stone" />
        <MetricCard icon={ShoppingBag} label="Bons plans publiés" value={String(bonsPlans.length)} evolution="Catalogue local" tone="stone" />
        <MetricCard icon={CircleDollarSign} label="CA encaissé" value={formatMoney(confirmedRevenue, currency)} evolution="Confirmé" tone="emerald" />
        <MetricCard icon={AlertTriangle} label="CA en attente" value={formatMoney(pendingRevenue, currency)} evolution="À traiter" tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-md border-stone-200 bg-white">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Suivi du chiffre d'affaires</CardTitle>
              <p className="mt-1 text-sm text-stone-600">CA journalier, nombre de réservations et panier moyen.</p>
            </div>
            <select value={revenueRange} onChange={(e) => setRevenueRange(e.target.value)} className="h-9 rounded-md border border-stone-200 bg-white px-3 text-sm">
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">Trimestre</option>
              <option value="365">Année en cours</option>
            </select>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueSeries} currency={currency} />
          </CardContent>
        </Card>

        <Card className="rounded-md border-stone-200 bg-white">
          <CardHeader>
            <CardTitle>Répartition du CA</CardTitle>
            <p className="mt-1 text-sm text-stone-600">Par type de prestation.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <RevenueSplit label="Parcours touristiques" value={tourRevenue} total={revenueTotal} currency={currency} />
            <RevenueSplit label="Chauffeurs privés" value={driverRevenue} total={revenueTotal} currency={currency} />
            <div className="rounded-md bg-[#fbfaf7] p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Objectif mensuel</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                <div className="h-full bg-emerald-700" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-stone-500">{formatMoney(monthRevenue, currency)} réalisés sur {formatMoney(monthlyGoal, currency)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="rounded-md border-stone-200 bg-white">
          <CardHeader>
            <CardTitle>Dernières réservations</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingsTable bookings={bookings.slice(0, 6)} compact currency={currency} onEdit={onOpenBooking} onConfirm={onConfirmBooking} />
          </CardContent>
        </Card>

        <Card className="rounded-md border-stone-200 bg-white">
          <CardHeader>
            <CardTitle>Alertes à traiter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertRow icon={AlertTriangle} label="Réservations en attente" value={pendingBookings.length} tone="amber" />
            <AlertRow icon={Car} label="Chauffeurs indisponibles" value={drivers.filter((driver) => !driver.available).length} tone="red" />
            <AlertRow icon={Users} label="Réservations sans affectation" value={bookings.filter((booking) => !booking.driver && !booking.tour).length} tone="blue" />
            <AlertRow icon={CircleDollarSign} label="Paiements à suivre" value={pendingBookings.length} tone="amber" />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-md border-stone-200 bg-white">
        <CardHeader>
          <CardTitle>Prestations les plus populaires</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {popularServices.length > 0 ? popularServices.map((service) => (
            <div key={service.name} className="rounded-md border border-stone-200 p-4">
              <p className="font-medium">{service.name}</p>
              <div className="mt-3 flex items-center justify-between text-sm text-stone-600">
                <span>{service.count} réservation{service.count > 1 ? "s" : ""}</span>
                <span>{formatMoney(service.revenue, currency)}</span>
              </div>
              <p className="mt-2 text-xs text-stone-500">Taux de conversion estimé : {Math.min(100, service.count * 8)}%</p>
            </div>
          )) : <p className="text-sm text-stone-500">Aucune réservation enregistrée pour le moment.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function ManagementSection({ title, description, form, children }: { title: string; description: string; form: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="rounded-md border border-stone-200 bg-white p-5">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-stone-600">{description}</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <Card className="rounded-md border-stone-200 bg-white">
          <CardHeader>
            <CardTitle><Plus className="mr-2 inline h-5 w-5" />Formulaire</CardTitle>
          </CardHeader>
          <CardContent>{form}</CardContent>
        </Card>
        <Card className="rounded-md border-stone-200 bg-white">
          <CardHeader>
            <CardTitle>Liste et actions</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}

function ListManagementSection({
  title,
  description,
  addLabel,
  onAdd,
  secondaryLabel,
  onSecondary,
  children,
}: {
  title: string;
  description: string;
  addLabel?: string;
  onAdd?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-md border border-stone-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-stone-600">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {secondaryLabel && onSecondary && (
            <Button variant="outline" className="rounded-md border-stone-300 bg-white" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
          {addLabel && onAdd && (
            <Button className="rounded-md bg-emerald-900 text-white hover:bg-emerald-800" onClick={onAdd}>
              <Plus className="h-4 w-4" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>
      <Card className="min-w-0 rounded-md border-stone-200 bg-white">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Liste et actions</CardTitle>
          <p className="text-sm text-stone-500">Consulter, modifier et traiter les actions depuis la liste.</p>
        </CardHeader>
        <CardContent className="min-w-0">{children}</CardContent>
      </Card>
    </div>
  );
}

function ConfirmDeleteDialog({ open, title, description, onCancel, onConfirm }: { open: boolean; title: string; description: string; onCancel: () => void; onConfirm: () => void | Promise<void> }) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
          <Button type="button" className="bg-red-700 text-white hover:bg-red-800" onClick={onConfirm}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({ icon: Icon, label, value, evolution, tone }: { icon: LucideIcon; label: string; value: string; evolution: string; tone: "emerald" | "blue" | "amber" | "red" | "stone" }) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-800",
    blue: "bg-blue-50 text-blue-800",
    amber: "bg-amber-50 text-amber-800",
    red: "bg-red-50 text-red-800",
    stone: "bg-stone-100 text-stone-700",
  }[tone];
  const isDown = evolution.includes("-");

  return (
    <Card className="rounded-md border-stone-200 bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-stone-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p>
          </div>
          <div className={`rounded-md p-2 ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs text-stone-500">
          {isDown ? <TrendingDown className="h-3.5 w-3.5 text-red-600" /> : <TrendingUp className="h-3.5 w-3.5 text-emerald-700" />}
          {evolution}
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueChart({ data, currency }: { data: RevenuePoint[]; currency: DashboardCurrency }) {
  const maxRevenue = Math.max(...data.map((point) => point.revenue), 1);
  const maxBookings = Math.max(...data.map((point) => point.bookings), 1);

  return (
    <div className="space-y-4">
      <div className="flex h-72 items-end gap-2 rounded-md bg-[#fbfaf7] p-4">
        {data.map((point) => (
          <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-56 w-full items-end justify-center gap-1">
              <div title={formatMoney(point.revenue, currency)} className="w-3 rounded-t bg-emerald-700" style={{ height: `${Math.max(5, (point.revenue / maxRevenue) * 100)}%` }} />
              <div title={`${point.bookings} réservation(s)`} className="w-3 rounded-t bg-amber-500" style={{ height: `${Math.max(5, (point.bookings / maxBookings) * 100)}%` }} />
            </div>
            <span className="w-full truncate text-center text-[10px] text-stone-500">{point.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-stone-600">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-emerald-700" /> CA journalier</span>
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-amber-500" /> Réservations</span>
      </div>
    </div>
  );
}

function RevenueSplit({ label, value, total, currency }: { label: string; value: number; total: number; currency: DashboardCurrency }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span>{formatMoney(value, currency)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-200">
        <div className="h-full bg-emerald-700" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-stone-500">{percent}% du CA</p>
    </div>
  );
}

function AlertRow({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: number; tone: "amber" | "red" | "blue" }) {
  const toneClass = {
    amber: "bg-amber-50 text-amber-800",
    red: "bg-red-50 text-red-800",
    blue: "bg-blue-50 text-blue-800",
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-md border border-stone-200 p-3">
      <div className="flex items-center gap-3">
        <div className={`rounded-md p-2 ${toneClass}`}><Icon className="h-4 w-4" /></div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <Badge variant="secondary">{value}</Badge>
    </div>
  );
}

function ClientsSection({ clients, pagination, currency, setCurrency, onPageChange, onView, onEdit, onBookings, onMessage, onCreateBooking, onAnonymize }: {
  clients: ClientRecord[];
  pagination: PaginationMeta;
  currency: DashboardCurrency;
  setCurrency: (value: DashboardCurrency) => void;
  onPageChange: (page: number) => void;
  onView: (client: ClientRecord) => void;
  onEdit: (client: ClientRecord) => void;
  onBookings: (client: ClientRecord) => void;
  onMessage: (client: ClientRecord) => void;
  onCreateBooking: (client: ClientRecord) => void;
  onAnonymize: (client: ClientRecord) => void;
}) {
  const totalRevenue = clients.reduce((sum, client) => sum + client.totalSpent, 0);
  const activeClients = clients.filter((client) => client.accountStatus === "actif").length;
  const unpaidClients = clients.filter((client) => client.remainingDue > 0).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-md border border-stone-200 bg-white p-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="font-semibold text-stone-950">Devise des montants clients</p>
          <p className="text-sm text-stone-500">Basculer le CA, les dépenses et les soldes entre euros et FCFA.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
          <ClientInlinePagination pagination={pagination} onPageChange={onPageChange} />
          <div className="inline-flex w-fit rounded-md border border-stone-200 bg-stone-50 p-1">
            {(["EUR", "FCFA"] as DashboardCurrency[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCurrency(option)}
                className={`rounded px-4 py-2 text-sm font-medium transition ${currency === option ? "bg-emerald-900 text-white shadow-sm" : "text-stone-600 hover:bg-white"}`}
                aria-pressed={currency === option}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ClientMetric label="Clients" value={String(pagination.totalItems)} />
        <ClientMetric label="Actifs" value={String(activeClients)} />
        <ClientMetric label="CA généré" value={formatMoney(totalRevenue, currency)} />
        <ClientMetric label="Impayés" value={String(unpaidClients)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_180px_180px_180px]">
        <Input className="sm:col-span-2 xl:col-span-1" placeholder="Recherche globale déjà disponible dans l'en-tête" disabled />
        <select className="h-10 min-w-0 rounded-md border border-stone-200 bg-white px-3 text-sm">
          <option>Tout statut compte</option>
          <option>Actif</option>
          <option>Suspendu</option>
          <option>Bloqué</option>
          <option>Anonymisé</option>
        </select>
        <select className="h-10 min-w-0 rounded-md border border-stone-200 bg-white px-3 text-sm">
          <option>Tout statut commercial</option>
          <option>VIP</option>
          <option>Fidèle</option>
          <option>À risque</option>
        </select>
        <select className="h-10 min-w-0 rounded-md border border-stone-200 bg-white px-3 text-sm">
          <option>Tous segments</option>
          <option>Solde impayé</option>
          <option>Départ 7 jours</option>
          <option>Sans réservation</option>
        </select>
      </div>
      <PaginationControls pagination={pagination} onPageChange={onPageChange} label="clients" />
      <div className="space-y-3">
        {clients.map((client) => (
          <div key={client.id} className="grid min-w-0 gap-4 rounded-md border border-stone-200 bg-white p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.9fr)_minmax(210px,0.55fr)] xl:items-center">
            <div className="min-w-0 lg:col-span-2 xl:col-span-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="min-w-0 break-words font-semibold text-stone-950">{client.name}</p>
                <StatusBadge value={client.accountStatus} />
                <StatusBadge value={client.commercialStatus} />
              </div>
              <p className="mt-1 break-all text-sm text-stone-500">{client.email}</p>
              <p className="break-words text-sm text-stone-500">{client.phone} · {client.country}</p>
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4">
              <ClientInlineStat label="Réservations" value={String(client.bookingCount)} />
              <ClientInlineStat label="Dépensé" value={formatMoney(client.totalSpent, currency)} />
              <ClientInlineStat label="Prochaine" value={client.nextBooking ? dateOnly(client.nextBooking.date) : "-"} />
              <ClientInlineStat label="Activité" value={client.lastActivity} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
              <Button variant="outline" size="sm" className="min-w-0 px-2" onClick={() => onView(client)}><Eye className="h-4 w-4" /><span className="sr-only">Voir</span></Button>
              <Button variant="outline" size="sm" className="min-w-0 px-2" onClick={() => onEdit(client)}>Modifier</Button>
              <Button variant="outline" size="sm" className="min-w-0 px-2" onClick={() => onBookings(client)}>Résas</Button>
              <Button variant="outline" size="sm" className="min-w-0 px-2" onClick={() => onMessage(client)}>Message</Button>
              <Button variant="outline" size="sm" className="min-w-0 px-2" onClick={() => onCreateBooking(client)}>Créer</Button>
              <Button variant="outline" size="sm" className="min-w-0 border-red-200 px-2 text-red-700 hover:bg-red-50" onClick={() => onAnonymize(client)}>Supprimer</Button>
            </div>
          </div>
        ))}
        {clients.length === 0 && <div className="rounded-md border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">Aucun client pour le moment.</div>}
      </div>
      <PaginationControls pagination={pagination} onPageChange={onPageChange} label="clients" />
    </div>
  );
}

function ClientMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-stone-200 bg-[#fbfaf7] p-4">
      <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold text-stone-950">{value}</p>
    </div>
  );
}

function ClientInlinePagination({ pagination, onPageChange }: { pagination: PaginationMeta; onPageChange: (page: number) => void }) {
  if (pagination.totalItems === 0) return null;

  return (
    <div className="flex w-fit items-center gap-2 rounded-md border border-stone-200 bg-[#fbfaf7] p-1 text-sm text-stone-600">
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-3"
        disabled={pagination.page <= 1}
        onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
      >
        Précédent
      </Button>
      <span className="whitespace-nowrap px-2 text-xs font-medium">
        {pagination.totalItems} clients · {pagination.page}/{pagination.totalPages}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-3"
        disabled={pagination.page >= pagination.totalPages}
        onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
      >
        Suivant
      </Button>
    </div>
  );
}

function ClientInlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-stone-50 p-3 text-sm">
      <p className="truncate text-stone-500">{label}</p>
      <p className="mt-1 truncate font-semibold text-stone-900" title={value}>{value}</p>
    </div>
  );
}

function ClientDetailView({ client, currency }: { client: ClientRecord; currency: DashboardCurrency }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <ClientMetric label="Réservations" value={String(client.bookingCount)} />
        <ClientMetric label="CA généré" value={formatMoney(client.totalSpent, currency)} />
        <ClientMetric label="Panier moyen" value={formatMoney(client.averageBasket, currency)} />
        <ClientMetric label="Solde restant" value={formatMoney(client.remainingDue, currency)} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <ClientPanel title="Informations générales">
          <InfoLine label="Nom" value={client.name} />
          <InfoLine label="Email" value={client.email} />
          <InfoLine label="Téléphone" value={client.phone} />
          <InfoLine label="Pays" value={client.country} />
          <InfoLine label="Adresse" value={client.address || "Non renseignée"} />
          <InfoLine label="Langue" value={client.language} />
          <InfoLine label="Création" value={client.createdAt} />
          <InfoLine label="Dernière connexion" value={client.lastLogin} />
        </ClientPanel>
        <ClientPanel title="Statuts et conformité">
          <InfoLine label="Statut compte" value={client.accountStatus} />
          <InfoLine label="Statut commercial" value={client.commercialStatus} />
          <InfoLine label="CGV" value="Acceptées - version locale" />
          <InfoLine label="Confidentialité" value="Acceptée - version locale" />
          <InfoLine label="Marketing" value="À confirmer" />
          <InfoLine label="WhatsApp/SMS" value="À confirmer" />
        </ClientPanel>
      </div>
      <ClientPanel title="Historique des réservations et paiements">
        <div className="space-y-2">
          {client.bookings.map((booking) => (
            <div key={booking.id} className="grid gap-2 rounded-md border border-stone-200 p-3 md:grid-cols-[1fr_120px_140px_120px]">
              <div><p className="font-medium">#{booking.id} · {booking.tour?.title ?? booking.driver?.name ?? "Non affecté"}</p><p className="text-xs text-stone-500">{booking.type === "tour" ? "Parcours" : "Chauffeur"} · {dateOnly(booking.date)}</p></div>
              <StatusBadge value={booking.status} />
              <span className="text-sm font-medium">{formatMoney(booking.price, currency)}</span>
              <span className="text-sm text-stone-500">Paiement {booking.status === "confirmed" ? "payé" : "à suivre"}</span>
            </div>
          ))}
          {client.bookings.length === 0 && <p className="text-sm text-stone-500">Aucune réservation rattachée.</p>}
        </div>
      </ClientPanel>
      <div className="grid gap-5 lg:grid-cols-3">
        <ClientPanel title="Voyageurs"><p className="text-sm text-stone-600">Titulaire, payeur, voyageurs et contact d'urgence à compléter depuis les réservations.</p></ClientPanel>
        <ClientPanel title="Documents"><p className="text-sm text-stone-600">Confirmations, factures, reçus, programmes, bons d'échange et documents transmis.</p></ClientPanel>
        <ClientPanel title="Notes internes"><p className="text-sm text-stone-600">{client.notes || "Aucune note interne."}</p></ClientPanel>
      </div>
      <ClientPanel title="Historique des actions sensibles">
        <ul className="space-y-1 text-sm text-stone-600">
          <li>Création ou détection du dossier client.</li>
          <li>Rattachement automatique des réservations par adresse email.</li>
          <li>Exports, suppressions et remboursements à réserver aux rôles autorisés.</li>
        </ul>
      </ClientPanel>
    </div>
  );
}

function ClientPanel({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-md border border-stone-200 p-4"><h3 className="mb-3 font-semibold">{title}</h3>{children}</div>;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return <div className="mb-2 flex justify-between gap-3 text-sm"><span className="text-stone-500">{label}</span><span className="text-right font-medium text-stone-800">{value}</span></div>;
}

function MessagesAdminSection({ clients, activeRequests, archivedRequests, activePagination, archivedPagination, onActivePageChange, onArchivedPageChange, onMessage, onReplyContact, onResolveContact }: {
  clients: ClientRecord[];
  activeRequests: ContactRequest[];
  archivedRequests: ContactRequest[];
  activePagination: PaginationMeta;
  archivedPagination: PaginationMeta;
  onActivePageChange: (page: number) => void;
  onArchivedPageChange: (page: number) => void;
  onMessage: (client: ClientRecord) => void;
  onReplyContact: (request: ContactRequest) => void;
  onResolveContact: (request: ContactRequest) => void;
}) {
  const conversations = clients.filter((client) => client.bookingCount > 0);
  return (
    <ListManagementSection
      title="Messages clients"
      description="Centre de traitement des conversations, demandes, notes internes et relances client."
      addLabel="Nouveau message"
      onAdd={() => conversations[0] && onMessage(conversations[0])}
    >
      <div className="grid gap-6">
        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-semibold text-stone-950">Messages à traiter</h3>
              <p className="text-sm text-stone-500">{activeRequests.length + conversations.length} conversation(s) active(s)</p>
            </div>
          </div>
          <div className="grid gap-3">
            {activeRequests.map((request) => (
              <ContactRequestRow key={`contact-${request.id}`} request={request} onReply={onReplyContact} onArchive={onResolveContact} />
            ))}
            {conversations.map((client) => (
              <div key={client.id} className="flex flex-col gap-3 rounded-md border border-stone-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{client.name}</p>
                  <p className="text-sm text-stone-500">Réservation #{client.bookings[0]?.id ?? "-"} · Dernier message : suivi de dossier · {client.lastActivity}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge value={client.remainingDue > 0 ? "Urgent" : "Traité"} />
                  <Button variant="outline" size="sm" onClick={() => onMessage(client)}>Répondre</Button>
                </div>
              </div>
            ))}
            {conversations.length === 0 && activeRequests.length === 0 && <div className="rounded-md border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">Aucun message actif.</div>}
          </div>
          <PaginationControls pagination={activePagination} onPageChange={onActivePageChange} label="messages actifs" />
        </section>

        <section className="space-y-3">
          <div>
            <h3 className="font-semibold text-stone-950">Archives</h3>
            <p className="text-sm text-stone-500">{archivedRequests.length} message(s) archivé(s)</p>
          </div>
          <div className="grid gap-3">
            {archivedRequests.map((request) => (
              <ContactRequestRow key={`archive-${request.id}`} request={request} onReply={onReplyContact} archived />
            ))}
            {archivedRequests.length === 0 && <div className="rounded-md border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">Aucun message archivé.</div>}
          </div>
          <PaginationControls pagination={archivedPagination} onPageChange={onArchivedPageChange} label="archives" />
        </section>
      </div>
    </ListManagementSection>
  );
}

function PaginationControls({ pagination, onPageChange, label }: { pagination: PaginationMeta; onPageChange: (page: number) => void; label: string }) {
  if (pagination.totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-stone-200 bg-white p-3 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        {pagination.totalItems} {label} · page {pagination.page} / {pagination.totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}

function ContactRequestRow({ request, archived = false, onReply, onArchive }: { request: ContactRequest; archived?: boolean; onReply: (request: ContactRequest) => void; onArchive?: (request: ContactRequest) => void }) {
  return (
    <div className={`flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-center md:justify-between ${archived ? "border-stone-200 bg-stone-50" : "border-emerald-100 bg-emerald-50/50"}`}>
      <div>
        <p className="font-semibold">{request.name}</p>
        <p className="text-sm text-stone-600">{request.subject} · {request.email}</p>
        <p className="mt-1 line-clamp-2 text-sm text-stone-500">{request.message}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <StatusBadge value={request.status} />
        <Button variant="outline" size="sm" onClick={() => onReply(request)}>Répondre</Button>
        {!archived && onArchive && <Button variant="outline" size="sm" onClick={() => onArchive(request)}>Archiver</Button>}
      </div>
    </div>
  );
}

function ToursTable({ tours, bookings, onView, onEdit, onDelete }: { tours: Tour[]; bookings: Booking[]; onView: (tour: Tour) => void; onEdit: (tour: Tour) => void; onDelete: (tour: Tour) => void }) {
  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-[64px_minmax(160px,1.2fr)_minmax(100px,0.7fr)_64px_minmax(120px,0.75fr)_76px_104px_250px] gap-2 px-4 text-sm font-medium text-stone-500 xl:grid">
        <span>Image</span>
        <span>Parcours</span>
        <span>Guide</span>
        <span>Durées</span>
        <span>Prix</span>
        <span>Réservations</span>
        <span>Statut</span>
        <span>Actions</span>
      </div>
      {tours.map((tour) => {
        const count = bookings.filter((booking) => booking.tour?.id === tour.id).length;
        return (
          <div key={tour.id} className="grid min-w-0 grid-cols-1 gap-4 rounded-md border border-stone-200 bg-white p-4 xl:grid-cols-[64px_minmax(160px,1.2fr)_minmax(100px,0.7fr)_64px_minmax(120px,0.75fr)_76px_104px_250px] xl:items-center xl:gap-2">
            <div className="h-16 w-24 rounded-md bg-cover bg-center xl:h-12 xl:w-16" style={{ backgroundImage: `url('${tour.image}')` }} />
            <div className="min-w-0">
              <p className="break-words font-medium text-stone-950">{tour.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-stone-500">{tour.summary || "Aucune description courte"}</p>
            </div>
            <div className="min-w-0 text-sm text-stone-700">
              <span className="font-medium xl:hidden">Guide : </span>
              <span className="break-words">{tour.guide?.fullName || "Non assigné"}</span>
            </div>
            <div className="min-w-0 text-sm text-stone-700">
              <span className="font-medium xl:hidden">Durées : </span>
              {tour.durations.map((duration) => `${duration.days}j`).join(", ")}
            </div>
            <div className="min-w-0 text-sm text-stone-700">
              <span className="font-medium xl:hidden">Prix : </span>
              <span className="break-words">{tour.durations[0] ? `${tour.durations[0].priceEur} € / ${tour.durations[0].priceFcfa.toLocaleString()} FCFA` : "-"}</span>
            </div>
            <div className="min-w-0 text-sm text-stone-700">
              <span className="font-medium xl:hidden">Réservations : </span>
              {count}
            </div>
            <div className="min-w-0"><StatusBadge value={tour.popular ? "Publié accueil" : "Publié"} /></div>
            <div className="min-w-0"><RowActions onView={() => onView(tour)} onEdit={() => onEdit(tour)} onDelete={() => onDelete(tour)} /></div>
          </div>
        );
      })}
    </div>
  );
}

function GuidesTable({ guides, tours, onEdit, onDelete }: { guides: Guide[]; tours: Tour[]; onEdit: (guide: Guide) => void; onDelete: (guide: Guide) => void }) {
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Guide</TableHead><TableHead>Utilisateur</TableHead><TableHead>Validation admin</TableHead><TableHead>Localisation</TableHead><TableHead>Zone de guide</TableHead><TableHead>Parcours assignés</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
      <TableBody>
        {guides.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="py-8 text-center text-sm text-stone-500">Aucun guide pour le moment.</TableCell>
          </TableRow>
        )}
        {guides.map((guide) => (
          <TableRow key={guide.id}>
            <TableCell><p className="font-medium">{guide.fullName}</p><p className="text-xs text-stone-500">#{guide.id}</p></TableCell>
            <TableCell><p className="font-medium">{guide.user?.fullName || "Non assigné"}</p><p className="text-xs text-stone-500">{guide.user?.email ?? "Aucun compte utilisateur"}</p></TableCell>
            <TableCell><StatusBadge value={providerValidationLabel(guide.validationStatus)} /></TableCell>
            <TableCell>{guide.location}</TableCell>
            <TableCell><p>{guide.guideZone}</p><p className="text-xs text-stone-500">{guide.languages?.join(", ") || "Langues à renseigner"}</p></TableCell>
            <TableCell>{tours.filter((tour) => tour.guide?.id === guide.id).length}</TableCell>
            <TableCell><RowActions onEdit={() => onEdit(guide)} onDelete={() => onDelete(guide)} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DriversTable({ drivers, bookings, onView, onEdit, onDelete }: { drivers: Driver[]; bookings: Booking[]; onView: (driver: Driver) => void; onEdit: (driver: Driver) => void; onDelete: (driver: Driver) => void }) {
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Photo</TableHead><TableHead>Chauffeur</TableHead><TableHead>Utilisateur</TableHead><TableHead>Validation admin</TableHead><TableHead>Zone</TableHead><TableHead>Véhicule</TableHead><TableHead>Tarifs</TableHead><TableHead>Réservations</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
      <TableBody>
        {drivers.map((driver) => (
          <TableRow key={driver.id}>
            <TableCell><div className="h-12 w-12 rounded-md bg-cover bg-center" style={{ backgroundImage: `url('${driver.image}')` }} /></TableCell>
            <TableCell><p className="font-medium">{driver.name}</p><p className="text-xs text-stone-500">{driver.phone}</p></TableCell>
            <TableCell><p className="font-medium">{driver.user?.fullName || "Non assigné"}</p><p className="text-xs text-stone-500">{driver.user?.email ?? "Aucun compte utilisateur"}</p></TableCell>
            <TableCell><StatusBadge value={providerValidationLabel(driver.validationStatus)} /></TableCell>
            <TableCell>{driver.zone}</TableCell>
            <TableCell>{driver.vehicleType}</TableCell>
            <TableCell><p>{driver.dailyPriceEur} € / {driver.dailyPriceFcfa.toLocaleString()} FCFA</p><p className="text-xs text-stone-500">{driver.monthlyPriceEur} € / mois</p></TableCell>
            <TableCell>{bookings.filter((booking) => booking.driver?.id === driver.id).length}</TableCell>
            <TableCell><StatusBadge value={driver.available ? "Disponible" : "Indisponible"} /></TableCell>
            <TableCell><RowActions onView={() => onView(driver)} onEdit={() => onEdit(driver)} onDelete={() => onDelete(driver)} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RentalsAdminSection({ rentals, allRentals, rentalBookings, rentalPagination, onRentalPageChange, onRentalDecision }: {
  rentals: Rental[];
  allRentals: Rental[];
  rentalBookings: RentalBooking[];
  rentalPagination: PaginationMeta;
  onRentalPageChange: (page: number) => void;
  onRentalDecision: (booking: RentalBooking, decision: "accepted" | "refused" | "completed") => void | Promise<void>;
}) {
  const publishableRentals = allRentals.filter((rental) => rental.available && rental.tenant.status === "validated").length;
  const pendingRentalBookings = rentalBookings.filter((booking) => booking.status === "pending").length;
  const acceptedRentalBookings = rentalBookings.filter((booking) => booking.status === "accepted").length;
  const refusedRentalBookings = rentalBookings.filter((booking) => booking.status === "refused").length;
  const securedRentalRevenue = rentalBookings
    .filter((booking) => booking.paymentStatus === "paid" || booking.paymentStatus === "released")
    .reduce((sum, booking) => sum + booking.totalPrice, 0);
  const displayedRentalBookings = [...rentalBookings].sort((a, b) => {
    const priority = { pending: 0, accepted: 1, refused: 2, completed: 3, cancelled: 4 };
    return priority[a.status] - priority[b.status] || b.id - a.id;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        <ClientMetric label="Locations publiables" value={String(publishableRentals)} />
        <ClientMetric label="Demandes en attente" value={String(pendingRentalBookings)} />
        <ClientMetric label="Acceptées / refusées" value={`${acceptedRentalBookings} / ${refusedRentalBookings}`} />
        <ClientMetric label="Paiement sécurisé" value={`${securedRentalRevenue.toLocaleString("fr-FR")} FCFA`} />
      </div>

      {pendingRentalBookings > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">{pendingRentalBookings} demande{pendingRentalBookings > 1 ? "s" : ""} de location à traiter</p>
          <p className="mt-1">Accepte ou refuse la demande depuis le tableau. Si elle est refusée, le paiement passe en remboursement. Si elle est acceptée, les coordonnées du propriétaire deviennent visibles côté client.</p>
        </div>
      )}

      <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-stone-950">Demandes de réservation</h3>
          <p className="text-sm text-stone-500">Le propriétaire accepte ou refuse. Le paiement reste géré par la plateforme jusqu'à la fin de la prestation.</p>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Location</TableHead><TableHead>Période</TableHead><TableHead>Montant</TableHead><TableHead>Statuts</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {rentalBookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-stone-500">Aucune demande de location pour le moment.</TableCell>
              </TableRow>
            )}
            {displayedRentalBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell><p className="font-medium">#{booking.id} · {booking.customerName}</p><p className="text-xs text-stone-500">{booking.customerEmail}</p><p className="text-xs text-stone-500">{booking.customerPhone}</p></TableCell>
                <TableCell><p className="font-medium">{booking.rental.title}</p><p className="text-xs text-stone-500">{booking.rental.location}</p></TableCell>
                <TableCell><p>{dateOnly(booking.startDate)} → {dateOnly(booking.endDate)}</p><p className="text-xs text-stone-500">{booking.nights} nuit{booking.nights > 1 ? "s" : ""}</p></TableCell>
                <TableCell><p className="font-medium">{booking.totalPrice.toLocaleString("fr-FR")} FCFA</p><p className="text-xs text-stone-500">{rentalPaymentTrackingLabel(booking.paymentStatus)}</p></TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2"><StatusBadge value={rentalBookingAdminStatusLabel(booking.status)} /><StatusBadge value={rentalPaymentAdminStatusLabel(booking.paymentStatus)} /></div>
                    <p className="text-xs text-stone-500">{rentalAdminDecisionTrail(booking)}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {booking.status === "pending" && <Button variant="outline" size="sm" onClick={() => onRentalDecision(booking, "accepted")}>Accepter</Button>}
                    {booking.status === "pending" && <Button variant="outline" size="sm" onClick={() => onRentalDecision(booking, "refused")}>Refuser</Button>}
                    {booking.status === "accepted" && <Button variant="outline" size="sm" onClick={() => onRentalDecision(booking, "completed")}>Terminer</Button>}
                    {booking.messages.length > 0 && <Button variant="outline" size="sm" onClick={() => toast.info("Dernier message location", { description: booking.messages.at(-1)?.text ?? "Aucun message." })}>Message</Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-stone-950">Locations</h3>
          <p className="text-sm text-stone-500">Les locations liées à un propriétaire suspendu, archivé ou en attente restent masquées côté public.</p>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Bien</TableHead><TableHead>Propriétaire</TableHead><TableHead>Tarifs</TableHead><TableHead>Disponibilité</TableHead><TableHead>Publication</TableHead></TableRow></TableHeader>
          <TableBody>
            {rentals.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-stone-500">Aucune location pour le moment.</TableCell>
              </TableRow>
            )}
            {rentals.map((rental) => (
              <TableRow key={rental.id}>
                <TableCell><p className="font-medium">{rental.title}</p><p className="text-xs text-stone-500">{rental.category} · {rental.location}</p></TableCell>
                <TableCell><p>{rental.tenant.fullName}</p><p className="text-xs text-stone-500">{tenantStatusLabel(rental.tenant.status)}</p></TableCell>
                <TableCell><p>{rental.dailyPriceEur} € / {rental.dailyPriceFcfa.toLocaleString()} FCFA jour</p><p className="text-xs text-stone-500">{rental.monthlyPriceEur} € / {rental.monthlyPriceFcfa.toLocaleString()} FCFA mois</p></TableCell>
                <TableCell><StatusBadge value={rental.available ? "Disponible" : "Indisponible"} /></TableCell>
                <TableCell><StatusBadge value={rental.available && rental.tenant.status === "validated" ? "Publié" : "Masqué"} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationControls pagination={rentalPagination} onPageChange={onRentalPageChange} label="locations" />
      </section>
    </div>
  );
}

function TenantsAdminSection({ tenants, allRentals, tenantPagination, onTenantPageChange, onTenantStatusChange }: {
  tenants: Tenant[];
  allRentals: Rental[];
  tenantPagination: PaginationMeta;
  onTenantPageChange: (page: number) => void;
  onTenantStatusChange: (tenant: Tenant, status: Tenant["status"]) => void | Promise<void>;
}) {
  const pendingTenants = tenants.filter((tenant) => tenant.status === "pending").length;
  const validatedTenants = tenants.filter((tenant) => tenant.status === "validated").length;
  const suspendedTenants = tenants.filter((tenant) => tenant.status === "suspended").length;
  const linkedRentals = allRentals.filter((rental) => tenants.some((tenant) => tenant.id === rental.tenant.id)).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        <ClientMetric label="À valider" value={String(pendingTenants)} />
        <ClientMetric label="Validés" value={String(validatedTenants)} />
        <ClientMetric label="Suspendus" value={String(suspendedTenants)} />
        <ClientMetric label="Biens liés" value={String(linkedRentals)} />
      </div>

      <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-stone-950">Propriétaires</h3>
          <p className="text-sm text-stone-500">Un bien n'est publié dans Location que si son propriétaire est validé par l'admin.</p>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Propriétaire</TableHead><TableHead>Contact</TableHead><TableHead>Disponibilités</TableHead><TableHead>Biens</TableHead><TableHead>Validation admin</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {tenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-stone-500">Aucun propriétaire pour le moment.</TableCell>
              </TableRow>
            )}
            {tenants.map((tenant) => {
              const tenantRentals = allRentals.filter((rental) => rental.tenant.id === tenant.id);
              return (
                <TableRow key={tenant.id}>
                  <TableCell><p className="font-medium">{tenant.fullName}</p><p className="text-xs text-stone-500">{tenant.location}</p></TableCell>
                  <TableCell><p>{tenant.phone}</p><p className="text-xs text-stone-500">{tenant.whatsapp}</p></TableCell>
                  <TableCell className="max-w-xs text-sm text-stone-600">{tenant.availableSlots.join(", ") || "Non renseigné"}</TableCell>
                  <TableCell>{tenantRentals.length}</TableCell>
                  <TableCell><StatusBadge value={tenantStatusLabel(tenant.status)} /></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {tenant.status !== "validated" && <Button variant="outline" size="sm" onClick={() => onTenantStatusChange(tenant, "validated")}>Valider</Button>}
                      {tenant.status !== "suspended" && <Button variant="outline" size="sm" onClick={() => onTenantStatusChange(tenant, "suspended")}>Suspendre</Button>}
                      {tenant.status !== "archived" && <Button variant="outline" size="sm" onClick={() => onTenantStatusChange(tenant, "archived")}>Archiver</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <PaginationControls pagination={tenantPagination} onPageChange={onTenantPageChange} label="propriétaires" />
      </section>
    </div>
  );
}

function PlansTable({ plans, onView, onEdit, onDelete }: { plans: BonPlan[]; onView: (plan: BonPlan) => void; onEdit: (plan: BonPlan) => void; onDelete: (plan: BonPlan) => void }) {
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Image</TableHead><TableHead>Nom</TableHead><TableHead>Catégorie</TableHead><TableHead>Description</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={plan.id}>
            <TableCell><div className="h-12 w-16 rounded-md bg-cover bg-center" style={{ backgroundImage: `url('${plan.image}')` }} /></TableCell>
            <TableCell className="font-medium">{plan.title}</TableCell>
            <TableCell>{plan.category}</TableCell>
            <TableCell className="max-w-sm truncate">{plan.description}</TableCell>
            <TableCell><StatusBadge value="Publié" /></TableCell>
            <TableCell><RowActions onView={() => onView(plan)} onEdit={() => onEdit(plan)} onDelete={() => onDelete(plan)} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BookingsTable({ bookings, compact = false, currency = "FCFA", onEdit, onConfirm, onCancel, onDelete }: { bookings: Booking[]; compact?: boolean; currency?: DashboardCurrency; onEdit?: (booking: Booking) => void; onConfirm?: (booking: Booking) => void; onCancel?: (booking: Booking) => void; onDelete?: (booking: Booking) => void }) {
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Réf.</TableHead><TableHead>Client</TableHead><TableHead>Prestation</TableHead><TableHead>Date</TableHead><TableHead>Montant</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>#{booking.id}</TableCell>
            <TableCell><p className="font-medium">{booking.customerName}</p><p className="text-xs text-stone-500">{booking.customerEmail}</p>{!compact && <p className="text-xs text-stone-500">{booking.customerPhone}</p>}</TableCell>
            <TableCell><p>{booking.type === "tour" ? "Parcours" : "Chauffeur"}</p><p className="text-xs text-stone-500">{booking.tour?.title ?? booking.driver?.name ?? "Non affecté"}</p></TableCell>
            <TableCell>{dateOnly(booking.date)}</TableCell>
            <TableCell>{formatMoney(booking.price, currency)}</TableCell>
            <TableCell><StatusBadge value={booking.status} /></TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                {onEdit && <Button variant="outline" size="sm" onClick={() => onEdit(booking)}>Modifier</Button>}
                {onConfirm && booking.status !== "confirmed" && <Button variant="outline" size="sm" onClick={() => onConfirm(booking)}>Confirmer</Button>}
                {onCancel && <Button variant="outline" size="sm" onClick={() => onCancel(booking)}>Annuler</Button>}
                {onDelete && <Button variant="outline" size="sm" onClick={() => onDelete(booking)}><Trash2 className="h-4 w-4 text-red-600" /></Button>}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DriverBookingsSection({ bookings, drivers, onEdit, onConfirm, onCancel, onDelete }: {
  bookings: Booking[];
  drivers: Driver[];
  onEdit: (booking: Booking) => void;
  onConfirm: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}) {
  const confirmed = bookings.filter((booking) => booking.status === "confirmed").length;
  const pending = bookings.filter((booking) => booking.status === "pending").length;
  const assigned = bookings.filter((booking) => Boolean(booking.driver)).length;
  const availableDrivers = drivers.filter((driver) => driver.available).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <ClientMetric label="Réservations chauffeur" value={String(bookings.length)} />
        <ClientMetric label="Confirmées" value={String(confirmed)} />
        <ClientMetric label="En attente" value={String(pending)} />
        <ClientMetric label="Chauffeurs disponibles" value={String(availableDrivers)} />
      </div>
      <div className="rounded-md border border-stone-200 bg-white p-4">
        <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="font-semibold">Liste des réservations chauffeur</h3>
            <p className="text-sm text-stone-500">{assigned} réservation(s) avec chauffeur affecté.</p>
          </div>
        </div>
        {bookings.length > 0 ? (
          <BookingsTable bookings={bookings} onEdit={onEdit} onConfirm={onConfirm} onCancel={onCancel} onDelete={onDelete} />
        ) : (
          <div className="rounded-md border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">Aucune réservation chauffeur pour le moment.</div>
        )}
      </div>
    </div>
  );
}

function LegalTable({ pages, onView, onEdit, onDelete }: { pages: LegalPage[]; onView: (page: LegalPage) => void; onEdit: (page: LegalPage) => void; onDelete: (page: LegalPage) => void }) {
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Page</TableHead><TableHead>URL</TableHead><TableHead>Mise à jour</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
      <TableBody>
        {pages.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="py-8 text-center text-sm text-stone-500">
              Aucune page légale
            </TableCell>
          </TableRow>
        )}
        {pages.map((page) => (
          <TableRow key={page.id}>
            <TableCell className="font-medium">{page.title}</TableCell>
            <TableCell>/{page.slug}</TableCell>
            <TableCell>{page.updatedLabel}</TableCell>
            <TableCell><RowActions onView={() => onView(page)} onEdit={() => onEdit(page)} onDelete={() => onDelete(page)} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RowActions({ onView, onEdit, onDelete }: { onView?: () => void; onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="flex flex-wrap gap-2 xl:flex-nowrap xl:items-center">
      {onView && <Button variant="outline" size="sm" onClick={onView}><Eye className="h-4 w-4" /></Button>}
      {onEdit && <Button variant="outline" size="sm" onClick={onEdit}>Modifier</Button>}
      {onDelete && <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50" onClick={onDelete}><Trash2 className="h-4 w-4" /> Supprimer</Button>}
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const lower = value.toLowerCase();
  const className = lower.includes("confirm") || lower.includes("disponible") || lower.includes("publié") || lower.includes("validé") || lower.includes("accept") || lower.includes("sécurisé") || lower.includes("paye") || lower.includes("payé") || lower.includes("termin")
    ? "bg-emerald-50 text-emerald-800"
    : lower.includes("pending") || lower.includes("attente")
      ? "bg-amber-50 text-amber-800"
      : lower.includes("refund") || lower.includes("rembours") || lower.includes("annul") || lower.includes("indisponible") || lower.includes("refus") || lower.includes("suspendu")
        ? "bg-red-50 text-red-800"
        : "bg-stone-100 text-stone-700";

  return <Badge variant="secondary" className={className}>{statusLabel(value)}</Badge>;
}

function providerValidationLabel(value?: "pending" | "validated" | "rejected" | "suspended") {
  return {
    pending: "En attente admin",
    validated: "Validé admin",
    rejected: "Refusé admin",
    suspended: "Suspendu admin",
  }[value ?? "pending"];
}

function tenantStatusLabel(value: Tenant["status"]) {
  return {
    pending: "En attente admin",
    validated: "Validé admin",
    suspended: "Suspendu admin",
    archived: "Archivé",
  }[value];
}

function rentalBookingAdminStatusLabel(value: RentalBooking["status"]) {
  return {
    pending: "En attente propriétaire",
    accepted: "Acceptée",
    refused: "Refusée",
    completed: "Terminée",
    cancelled: "Annulée",
  }[value];
}

function rentalPaymentAdminStatusLabel(value: RentalBooking["paymentStatus"]) {
  return {
    paid: "Paiement sécurisé",
    pending: "Paiement en attente",
    refunded: "Remboursé",
    released: "Payé propriétaire",
  }[value];
}

function rentalPaymentTrackingLabel(value: RentalBooking["paymentStatus"]) {
  return {
    paid: "Argent conservé par ORITA jusqu'à la fin du séjour.",
    pending: "Paiement non sécurisé.",
    refunded: "Client remboursé après refus ou annulation.",
    released: "Paiement libéré au propriétaire.",
  }[value];
}

function rentalAdminDecisionTrail(booking: RentalBooking) {
  if (booking.status === "pending") return "Le propriétaire doit accepter ou refuser.";
  if (booking.status === "accepted") return booking.ownerRespondedAt ? `Acceptée le ${dateOnly(booking.ownerRespondedAt)}` : "Acceptée par le propriétaire.";
  if (booking.status === "refused") return booking.ownerRespondedAt ? `Refusée le ${dateOnly(booking.ownerRespondedAt)}` : "Refusée par le propriétaire.";
  if (booking.status === "completed") return booking.completedAt ? `Terminée le ${dateOnly(booking.completedAt)}` : "Séjour terminé.";
  return "Demande annulée.";
}

function ProviderValidationField({ value, onChange }: { value: "pending" | "validated" | "rejected" | "suspended"; onChange: (value: "pending" | "validated" | "rejected" | "suspended") => void }) {
  return (
    <FormSection title="Validation administrateur">
      <select required className="h-9 w-full rounded-md border bg-white px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value as "pending" | "validated" | "rejected" | "suspended")}>
        <option value="pending">En attente de validation</option>
        <option value="validated">Validé - accès mobile autorisé</option>
        <option value="rejected">Refusé - accès mobile bloqué</option>
        <option value="suspended">Suspendu - accès mobile bloqué</option>
      </select>
      <p className="text-xs text-stone-500">Le compte prestataire ne peut accéder au dashboard mobile et aux missions que si ce statut est validé.</p>
    </FormSection>
  );
}

function ClientFormView({ form, setForm, onSubmit }: { form: ClientForm; setForm: (form: ClientForm) => void; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormSection title="Identité">
        <div className="grid gap-3 md:grid-cols-2">
          <Input required placeholder="Prénom" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input required placeholder="Nom" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input required type="email" placeholder="Adresse e-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input required placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </FormSection>
      <FormSection title="Profil">
        <Input placeholder="Adresse" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Pays" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <Input placeholder="Langue préférée" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
        </div>
      </FormSection>
      <FormSection title="Statuts">
        <div className="grid gap-3 md:grid-cols-2">
          <select className="h-9 rounded-md border bg-white px-3 text-sm" value={form.accountStatus} onChange={(e) => setForm({ ...form, accountStatus: e.target.value as ClientForm["accountStatus"] })}>
            <option value="non vérifié">Non vérifié</option>
            <option value="actif">Actif</option>
            <option value="suspendu">Suspendu</option>
            <option value="bloqué">Bloqué</option>
            <option value="anonymisé">Anonymisé</option>
          </select>
          <select className="h-9 rounded-md border bg-white px-3 text-sm" value={form.commercialStatus} onChange={(e) => setForm({ ...form, commercialStatus: e.target.value as ClientForm["commercialStatus"] })}>
            <option value="prospect">Prospect</option>
            <option value="nouveau client">Nouveau client</option>
            <option value="client actif">Client actif</option>
            <option value="client fidèle">Client fidèle</option>
            <option value="client inactif">Client inactif</option>
            <option value="client à risque">Client à risque</option>
            <option value="client VIP">Client VIP</option>
          </select>
        </div>
      </FormSection>
      <FormSection title="Notes internes">
        <Textarea placeholder="Préférences, contraintes, incidents, gestes commerciaux..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </FormSection>
      <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="submit">{form.id ? "Mettre à jour le client" : "Créer le client"}</Button>
    </form>
  );
}

function TourFormView({ form, guides, setForm, onSubmit }: { form: TourForm; guides: Guide[]; setForm: (form: TourForm) => void; onSubmit: (e: React.FormEvent) => void }) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const asset = await uploadImageAsset({ file, alt: form.imageAlt || form.title || file.name });
      setForm({
        ...form,
        imageUrl: asset.url,
        imageAlt: form.imageAlt || asset.alt,
      });
      toast.success("Image ajoutée depuis le stockage");
    } catch {
      toast.error("Impossible d'ajouter cette image");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormSection title="Identité"><Input required placeholder="Nom du parcours" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><Textarea placeholder="Description courte" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></FormSection>
      <FormSection title="Guide assigné">
        <select className="h-9 w-full rounded-md border bg-white px-3 text-sm" value={form.guideId} onChange={(e) => setForm({ ...form, guideId: e.target.value })}>
          <option value="">Aucun guide assigné</option>
          {guides.map((guide) => <option key={guide.id} value={guide.id}>{guide.fullName} - {guide.guideZone} ({providerValidationLabel(guide.validationStatus)})</option>)}
        </select>
        <p className="text-xs text-stone-500">Le guide doit être validé par l'admin pour accéder à la mission mobile et aux QR codes journaliers.</p>
      </FormSection>
      <FormSection title="Tarifs et programme">
        <TourDurationFields value={form.durations} onChange={(durations) => setForm({ ...form, durations })} />
        <Textarea placeholder="Programme détaillé, une étape par ligne" value={form.itinerary} onChange={(e) => setForm({ ...form, itinerary: e.target.value })} />
      </FormSection>
      <FormSection title="Contenu"><Textarea placeholder="Points forts, un par ligne" value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} /><Textarea placeholder="Informations pratiques, une par ligne" value={form.practicalInfo} onChange={(e) => setForm({ ...form, practicalInfo: e.target.value })} /><Textarea placeholder="Conseils voyage, un par ligne" value={form.travelTips} onChange={(e) => setForm({ ...form, travelTips: e.target.value })} /><Textarea placeholder="Inclus, un par ligne" value={form.included} onChange={(e) => setForm({ ...form, included: e.target.value })} /><Textarea placeholder="Non inclus, un par ligne" value={form.notIncluded} onChange={(e) => setForm({ ...form, notIncluded: e.target.value })} /></FormSection>
      <FormSection title="Publication">
        <div className="space-y-3 rounded-md border border-stone-200 bg-stone-50 p-3">
          <div>
            <Label>Image depuis mon stockage</Label>
            <Input type="file" accept="image/*" className="mt-1 bg-white" onChange={handleImageFile} disabled={isUploadingImage} />
            <p className="mt-1 text-xs text-stone-500">{isUploadingImage ? "Upload de l'image..." : "Choisis une image depuis ton ordinateur. L'URL sera remplie automatiquement."}</p>
          </div>
          {form.imageUrl && (
            <div className="grid gap-3 sm:grid-cols-[120px_1fr] sm:items-center">
              <div className="h-20 rounded-md border border-stone-200 bg-cover bg-center" style={{ backgroundImage: `url('${form.imageUrl}')` }} />
              <p className="break-all text-xs text-stone-500">{form.imageUrl}</p>
            </div>
          )}
        </div>
        <Input required placeholder="URL image principale" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <Input placeholder="Texte alternatif image" value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} /> Mettre en avant sur la page d’accueil</label>
      </FormSection>
      <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="submit">{form.id ? "Mettre à jour le parcours" : "Créer le parcours"}</Button>
    </form>
  );
}

function TourDurationFields({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const rows = durationRowsFromText(value);

  const updateRow = (index: number, field: "days" | "priceEur", nextValue: string) => {
    const nextRows = rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: nextValue } : row);
    onChange(durationRowsToText(nextRows));
  };

  const addRow = () => {
    onChange(durationRowsToText([...rows, { days: "1", priceEur: "69" }]));
  };

  const removeRow = (index: number) => {
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    onChange(durationRowsToText(nextRows.length > 0 ? nextRows : [{ days: "1", priceEur: "69" }]));
  };

  return (
    <div className="space-y-3 rounded-md border border-stone-200 bg-stone-50 p-3">
      <div className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <span>Durée</span>
        <span>Prix euros</span>
        <span>Conversion FCFA</span>
        <span className="sr-only">Action</span>
      </div>
      {rows.map((row, index) => {
        const eur = Number(row.priceEur) || 0;
        return (
          <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
            <Input
              required
              type="number"
              min="1"
              placeholder="Jours"
              value={row.days}
              onChange={(event) => updateRow(index, "days", event.target.value)}
            />
            <Input
              required
              type="number"
              min="0"
              placeholder="Prix en euros"
              value={row.priceEur}
              onChange={(event) => updateRow(index, "priceEur", event.target.value)}
            />
            <div className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700">
              {fcfa(eur).toLocaleString("fr-FR")} FCFA
            </div>
            <Button type="button" variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => removeRow(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="h-4 w-4" />
        Ajouter une durée
      </Button>
    </div>
  );
}

function GuideFormView({ form, clientAccounts, setForm, onSubmit }: { form: GuideForm; clientAccounts: ClientAccount[]; setForm: (form: GuideForm) => void; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormSection title="Utilisateur assigné">
        <select required className="h-9 w-full rounded-md border bg-white px-3 text-sm" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
          <option value="">Choisir un utilisateur client</option>
          {clientAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {(account.fullName || `${account.firstName} ${account.lastName}`.trim() || account.email)} - {account.email}
            </option>
          ))}
        </select>
        {clientAccounts.length === 0 && <p className="text-xs text-red-600">Aucun compte client disponible. Crée un utilisateur client avant d'assigner un guide.</p>}
      </FormSection>
      <ProviderValidationField value={form.validationStatus} onChange={(validationStatus) => setForm({ ...form, validationStatus })} />
      <FormSection title="Identité">
        <div className="grid gap-3 md:grid-cols-2">
          <Input required placeholder="Prénom" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input required placeholder="Nom" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
      </FormSection>
      <FormSection title="Localisation">
        <Input required placeholder="Localisation" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <Input required placeholder="Zone de guide" value={form.guideZone} onChange={(e) => setForm({ ...form, guideZone: e.target.value })} />
        <Input placeholder="Téléphone guide" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </FormSection>
      <FormSection title="Profil et prestations">
        <Textarea placeholder="Présentation du guide" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Textarea placeholder="Ce qu'il propose, une prestation par ligne" value={form.offers} onChange={(e) => setForm({ ...form, offers: e.target.value })} />
        <Textarea placeholder="Ce qu'il fait / spécialités, une par ligne" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
        <Textarea placeholder="Langues parlées, une par ligne" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
      </FormSection>
      <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="submit">{form.id ? "Mettre à jour le guide" : "Créer le guide"}</Button>
    </form>
  );
}

function DriverFormView({ form, clientAccounts, setForm, onSubmit }: { form: DriverForm; clientAccounts: ClientAccount[]; setForm: (form: DriverForm) => void; onSubmit: (e: React.FormEvent) => void }) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const asset = await uploadImageAsset({ file, alt: form.imageAlt || form.name || file.name });
      setForm({ ...form, imageUrl: asset.url, imageAlt: form.imageAlt || asset.alt });
      toast.success("Photo chauffeur importée depuis le stockage");
    } catch {
      toast.error("Impossible d'importer cette photo");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormSection title="Utilisateur assigné">
        <select required className="h-9 w-full rounded-md border bg-white px-3 text-sm" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
          <option value="">Choisir un utilisateur client</option>
          {clientAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {(account.fullName || `${account.firstName} ${account.lastName}`.trim() || account.email)} - {account.email}
            </option>
          ))}
        </select>
        {clientAccounts.length === 0 && <p className="text-xs text-red-600">Aucun compte client disponible. Crée un utilisateur client avant d'assigner un chauffeur.</p>}
      </FormSection>
      <ProviderValidationField value={form.validationStatus} onChange={(validationStatus) => setForm({ ...form, validationStatus })} />
      <FormSection title="Profil"><Input required placeholder="Nom complet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Input required placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /><Input required placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></FormSection>
      <FormSection title="Véhicule et zones"><Input required placeholder="Zones desservies" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} /><Input required placeholder="Véhicule" value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} /></FormSection>
      <FormSection title="Tarifs"><Input required type="number" placeholder="Prix jour (€)" value={form.dailyPriceEur} onChange={(e) => setForm({ ...form, dailyPriceEur: e.target.value })} /><Input required type="number" placeholder="Prix mois (€)" value={form.monthlyPriceEur} onChange={(e) => setForm({ ...form, monthlyPriceEur: e.target.value })} /></FormSection>
      <FormSection title="Publication">
        <div className="space-y-3 rounded-md border border-stone-200 bg-stone-50 p-3">
          <div>
            <Label>Photo depuis mon stockage</Label>
            <Input type="file" accept="image/*" className="mt-1 bg-white" onChange={handleImageFile} disabled={isUploadingImage} />
            <p className="mt-1 text-xs text-stone-500">
              {isUploadingImage ? "Import de la photo..." : "Choisis une photo depuis ton ordinateur. L'URL sera remplie automatiquement."}
            </p>
          </div>
          {form.imageUrl && (
            <div className="overflow-hidden rounded-md border border-stone-200 bg-white">
              <img src={form.imageUrl} alt={form.imageAlt || form.name || "Photo chauffeur"} className="h-36 w-full object-cover" />
            </div>
          )}
        </div>
        <Input required placeholder="URL photo" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <Input placeholder="Alt image" value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} /> Disponible</label>
      </FormSection>
      <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="submit">{form.id ? "Mettre à jour le chauffeur" : "Créer le chauffeur"}</Button>
    </form>
  );
}

function BonPlanFormView({ form, setForm, onSubmit }: { form: BonPlanForm; setForm: (form: BonPlanForm) => void; onSubmit: (e: React.FormEvent) => void }) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const asset = await uploadImageAsset({ file, alt: form.imageAlt || form.title || file.name });
      setForm({ ...form, imageUrl: asset.url, imageAlt: form.imageAlt || asset.alt });
      toast.success("Image du bon plan importée depuis le stockage");
    } catch {
      toast.error("Impossible d'importer cette image");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormSection title="Contenu"><Input required placeholder="Nom du bon plan" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><Input required placeholder="Catégorie" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /><Textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormSection>
      <FormSection title="Image">
        <div className="space-y-3 rounded-md border border-stone-200 bg-stone-50 p-3">
          <div>
            <Label>Image depuis mon stockage</Label>
            <Input type="file" accept="image/*" className="mt-1 bg-white" onChange={handleImageFile} disabled={isUploadingImage} />
            <p className="mt-1 text-xs text-stone-500">
              {isUploadingImage ? "Import de l'image..." : "Choisis une image depuis ton ordinateur. L'URL sera remplie automatiquement."}
            </p>
          </div>
          {form.imageUrl && (
            <div className="overflow-hidden rounded-md border border-stone-200 bg-white">
              <img src={form.imageUrl} alt={form.imageAlt || form.title || "Image du bon plan"} className="h-36 w-full object-cover" />
            </div>
          )}
        </div>
        <Input required placeholder="URL image" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <Input placeholder="Alt image" value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} />
      </FormSection>
      <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="submit">{form.id ? "Mettre à jour le bon plan" : "Créer le bon plan"}</Button>
    </form>
  );
}

function LegalPageFormView({ form, setForm, onSubmit }: { form: LegalPageForm; setForm: (form: LegalPageForm) => void; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormSection title="Page"><Input required placeholder="Slug, ex: mentions-legales" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /><Input required placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><Input required placeholder="Libellé de mise à jour" value={form.updatedLabel} onChange={(e) => setForm({ ...form, updatedLabel: e.target.value })} /></FormSection>
      <FormSection title="Contenu"><Textarea required className="min-h-56" placeholder="Contenu, séparer les paragraphes par une ligne" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></FormSection>
      <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="submit">{form.id ? "Mettre à jour la page" : "Créer la page"}</Button>
    </form>
  );
}

function BookingFormView({ form, setForm, drivers, tours, onSubmit }: { form: BookingForm; setForm: (form: BookingForm) => void; drivers: Driver[]; tours: Tour[]; onSubmit: (e: React.FormEvent) => void }) {
  const selectedDriver = drivers.find((driver) => driver.id === form.driverId);
  const selectedTour = tours.find((tour) => tour.id === form.tourId);

  const fillPrice = () => {
    if (form.type === "driver" && selectedDriver) {
      setForm({ ...form, price: String(form.duration === "30" ? selectedDriver.monthlyPriceFcfa : selectedDriver.dailyPriceFcfa) });
      return;
    }

    const duration = selectedTour?.durations.find((item) => String(item.days) === form.duration) ?? selectedTour?.durations[0];
    if (duration) {
      setForm({ ...form, duration: String(duration.days), price: String(duration.priceFcfa) });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormSection title="Prestation">
        <select className="h-9 w-full rounded-md border bg-white px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "tour" | "driver" })}>
          <option value="driver">Chauffeur</option>
          <option value="tour">Parcours</option>
        </select>
        {form.type === "driver" ? (
          <select className="h-9 w-full rounded-md border bg-white px-3 text-sm" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
            <option value="">Choisir un chauffeur</option>
            {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name} - {driver.zone}</option>)}
          </select>
        ) : (
          <select className="h-9 w-full rounded-md border bg-white px-3 text-sm" value={form.tourId} onChange={(e) => setForm({ ...form, tourId: e.target.value })}>
            <option value="">Choisir un parcours</option>
            {tours.map((tour) => <option key={tour.id} value={tour.id}>{tour.title}</option>)}
          </select>
        )}
      </FormSection>
      <FormSection title="Planning et montant">
        <Input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Input required type="number" placeholder="Durée en jours" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Input required type="number" placeholder="Prix FCFA" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Button type="button" variant="outline" onClick={fillPrice}>Prix</Button>
        </div>
        <select className="h-9 w-full rounded-md border bg-white px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as BookingForm["status"] })}>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmée</option>
          <option value="unavailable">Indisponible</option>
          <option value="refunded">Remboursée</option>
        </select>
      </FormSection>
      <FormSection title="Client">
        <Input required placeholder="Nom client" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
        <Input required type="email" placeholder="Email client" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
        <Input required placeholder="Téléphone client" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
      </FormSection>
      <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="submit">{form.id ? "Mettre à jour la réservation" : "Créer la réservation"}</Button>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-md border border-stone-200 p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-stone-500">{title}</legend>
      {children}
    </fieldset>
  );
}

function PageHeroPreviewCard({ title, form, onEdit }: { title: string; form: PageHeroConfigurationForm; onEdit: () => void }) {
  return (
    <div className="overflow-hidden rounded-md border border-stone-200 bg-white">
      <div
        className="min-h-52 bg-cover bg-center p-5 text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(12,10,9,0.78), rgba(12,10,9,0.42)), url('${form.imageUrl}')`,
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[#d6a02a]">{form.eyebrow}</p>
        <h3 className="mt-8 max-w-lg text-3xl font-semibold leading-tight">{form.title}</h3>
        <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-6 text-stone-100">{form.subtitle}</p>
      </div>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-stone-950">{title}</p>
          <p className="mt-1 truncate text-xs text-stone-500">{form.imageAlt || form.imageUrl}</p>
        </div>
        <Button className="w-fit rounded-md bg-emerald-900 text-white hover:bg-emerald-800" onClick={onEdit}>
          Modifier
        </Button>
      </div>
    </div>
  );
}

function SettingsSection({
  contactConfiguration,
  homepageConfiguration,
  parcoursHeroConfiguration,
  chauffeursHeroConfiguration,
  locationHeroConfiguration,
  bonsPlansHeroConfiguration,
  contactHeroConfiguration,
  onEditContact,
  onEditParcoursHero,
  onEditChauffeursHero,
  onEditLocationHero,
  onEditBonsPlansHero,
  onEditContactHero,
  onEditHomepage,
}: {
  contactConfiguration: ContactConfiguration | null;
  homepageConfiguration: HomepageConfiguration | null;
  parcoursHeroConfiguration: PageHeroConfiguration | null;
  chauffeursHeroConfiguration: PageHeroConfiguration | null;
  locationHeroConfiguration: PageHeroConfiguration | null;
  bonsPlansHeroConfiguration: PageHeroConfiguration | null;
  contactHeroConfiguration: PageHeroConfiguration | null;
  onEditContact: () => void;
  onEditParcoursHero: () => void;
  onEditChauffeursHero: () => void;
  onEditLocationHero: () => void;
  onEditBonsPlansHero: () => void;
  onEditContactHero: () => void;
  onEditHomepage: () => void;
}) {
  const configuration = contactConfigurationToForm(contactConfiguration);
  const homepage = homepageConfigurationToForm(homepageConfiguration);
  const parcoursHero = pageHeroConfigurationToForm(parcoursHeroConfiguration, emptyParcoursHeroConfiguration);
  const chauffeursHero = pageHeroConfigurationToForm(chauffeursHeroConfiguration, emptyChauffeursHeroConfiguration);
  const locationHero = pageHeroConfigurationToForm(locationHeroConfiguration, emptyLocationHeroConfiguration);
  const bonsPlansHero = pageHeroConfigurationToForm(bonsPlansHeroConfiguration, emptyBonsPlansHeroConfiguration);
  const contactHero = pageHeroConfigurationToForm(contactHeroConfiguration, emptyContactHeroConfiguration);
  const addresses = configuration.addresses.length ? configuration.addresses : emptyContactConfiguration.addresses;
  const phones = configuration.phones.length ? configuration.phones : emptyContactConfiguration.phones;
  const emails = configuration.emails.length ? configuration.emails : emptyContactConfiguration.emails;

  return (
    <div className="space-y-4">
      <Card className="rounded-md border-stone-200 bg-white">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Accueil du site</CardTitle>
            <p className="mt-1 text-sm text-stone-600">Image principale, titre et textes du premier écran public.</p>
          </div>
          <Button className="w-fit rounded-md bg-emerald-900 text-white hover:bg-emerald-800" onClick={onEditHomepage}>Modifier</Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div
            className="min-h-64 rounded-md bg-cover bg-center p-6 text-white"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(12,10,9,0.78), rgba(12,10,9,0.38)), url('${homepage.heroImageUrl}')`,
            }}
          >
            <div className="inline-flex rounded-md bg-white/15 px-3 py-2 text-sm font-medium">{homepage.heroEyebrow}</div>
            <h3 className="font-orita-wordmark mt-8 text-5xl text-[#d6a02a]">{homepage.heroTitle}</h3>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-100">{homepage.heroSubtitle}</p>
          </div>
          <div className="rounded-md border border-stone-200 p-4">
            <h3 className="font-semibold">Actions affichées</h3>
            <div className="mt-3 space-y-2 text-sm text-stone-600">
              <p>Bouton principal : {homepage.heroPrimaryLabel}</p>
              <p>Bouton secondaire : {homepage.heroSecondaryLabel}</p>
              <p className="break-all text-xs text-stone-500">{homepage.heroImageUrl}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md border-stone-200 bg-white">
        <CardHeader>
          <CardTitle>Configuration des pages publiques</CardTitle>
          <p className="mt-1 text-sm text-stone-600">Tous les bandeaux modifiables du site sont regroupés ici.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <PageHeroPreviewCard title="Page Parcours" form={parcoursHero} onEdit={onEditParcoursHero} />
          <PageHeroPreviewCard title="Page Chauffeurs" form={chauffeursHero} onEdit={onEditChauffeursHero} />
          <PageHeroPreviewCard title="Page Location" form={locationHero} onEdit={onEditLocationHero} />
          <PageHeroPreviewCard title="Page Bons plans" form={bonsPlansHero} onEdit={onEditBonsPlansHero} />
          <PageHeroPreviewCard title="Page Contact" form={contactHero} onEdit={onEditContactHero} />
        </CardContent>
      </Card>

      <Card className="rounded-md border-stone-200 bg-white">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Configuration contact</CardTitle>
            <p className="mt-1 text-sm text-stone-600">Coordonnées, horaires d'ouverture et FAQ affichés sur la page Contact et dans le footer.</p>
          </div>
          <Button className="w-fit rounded-md bg-emerald-900 text-white hover:bg-emerald-800" onClick={onEditContact}>Modifier</Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-stone-200 p-4">
            <h3 className="font-semibold">Coordonnées</h3>
            <div className="mt-3 space-y-2 text-sm text-stone-600">
              {addresses.map((item, index) => (
                <p key={`address-${index}`}>
                  <span className="font-medium text-stone-800">{item.label}</span> : {item.address}, {item.cityCountry}
                </p>
              ))}
              {phones.map((item, index) => (
                <p key={`phone-${index}`}>
                  <span className="font-medium text-stone-800">{item.label}</span> : {item.number}{item.whatsapp ? ` · WhatsApp ${item.whatsapp}` : ""}
                </p>
              ))}
              {emails.map((item, index) => (
                <p key={`email-${index}`}>
                  <span className="font-medium text-stone-800">{item.label}</span> : {item.email}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-stone-200 p-4">
            <h3 className="font-semibold">Horaires</h3>
            <div className="mt-3 whitespace-pre-line text-sm leading-6 text-stone-600">{configuration.openingHours}</div>
          </div>
          <div className="rounded-md border border-stone-200 p-4">
            <h3 className="font-semibold">FAQ</h3>
            <p className="mt-3 text-sm leading-6 text-stone-600">{configuration.faq.length} question(s) configurée(s)</p>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-md border-stone-200 bg-white">
        <CardHeader>
          <CardTitle>Paramètres techniques</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-md border border-stone-200 p-4">
            <h3 className="font-semibold">Sécurité</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">Le mot de passe `admin123` reste un accès de démonstration. La prochaine étape est une authentification serveur avec rôles, sessions et limitation des tentatives.</p>
          </div>
          <div className="rounded-md border border-stone-200 p-4">
            <h3 className="font-semibold">Notifications</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">Les alertes du dashboard sont calculées depuis les réservations. Elles pourront ensuite être persistées et envoyées par email.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AiConfigurationSection({ configuration, form, setForm, onSubmit }: {
  configuration: AiConfiguration | null;
  form: AiConfigurationForm;
  setForm: (form: AiConfigurationForm) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        <ClientMetric label="Statut" value={form.enabled ? "Activé" : "Désactivé"} />
        <ClientMetric label="Fournisseur" value={configuration?.provider ?? "ollama"} />
        <ClientMetric label="Modèle" value={form.model || "Non configuré"} />
        <ClientMetric label="URL Ollama" value={configuration?.ollamaBaseUrl ?? "http://ollama:11434"} />
      </div>

      <Card className="rounded-md border-stone-200 bg-white">
        <CardHeader>
          <CardTitle>Agent local Orita</CardTitle>
          <p className="mt-1 text-sm text-stone-600">
            L'agent répond via Ollama. Si Ollama ou le modèle est indisponible, le message de secours est renvoyé au client.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="flex items-center gap-3 rounded-md border border-stone-200 p-4 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) => setForm({ ...form, enabled: event.target.checked })}
              className="h-4 w-4 accent-[#d6a02a]"
            />
            Activer l'agent IA sur le chatbot public
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Modèle Ollama</Label>
              <Input
                className="mt-2"
                value={form.model}
                onChange={(event) => setForm({ ...form, model: event.target.value })}
                placeholder="llama3.2:1b"
              />
              <p className="mt-2 text-xs text-stone-500">Petit modèle recommandé : `llama3.2:1b`.</p>
            </div>
            <div>
              <Label>Température</Label>
              <Input
                className="mt-2"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={form.temperature}
                onChange={(event) => setForm({ ...form, temperature: event.target.value })}
              />
            </div>
            <div>
              <Label>Longueur max</Label>
              <Input
                className="mt-2"
                type="number"
                min="80"
                max="800"
                value={form.maxTokens}
                onChange={(event) => setForm({ ...form, maxTokens: event.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Prompt système</Label>
            <Textarea
              className="mt-2 min-h-36"
              value={form.systemPrompt}
              onChange={(event) => setForm({ ...form, systemPrompt: event.target.value })}
            />
          </div>

          <div>
            <Label>Message de secours</Label>
            <Textarea
              className="mt-2 min-h-28"
              value={form.fallbackAnswer}
              onChange={(event) => setForm({ ...form, fallbackAnswer: event.target.value })}
            />
          </div>

          <div className="space-y-3 rounded-md border border-stone-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Label>Base de connaissances locale</Label>
                <p className="mt-1 text-xs text-stone-500">
                  Ajoute plusieurs réponses prioritaires. Un input correspond à une réponse.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-md"
                onClick={() => setForm({ ...form, knowledgeBase: [...form.knowledgeBase, { input: "", answer: "" }] })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une réponse
              </Button>
            </div>

            <div className="space-y-3">
              {form.knowledgeBase.map((item, index) => (
                <div key={index} className="grid gap-3 rounded-md border border-stone-200 bg-stone-50 p-3 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]">
                  <div className="min-w-0">
                    <Label>Input {index + 1}</Label>
                    <Input
                      className="mt-2"
                      value={item.input}
                      onChange={(event) => {
                        const knowledgeBase = form.knowledgeBase.map((row, rowIndex) => rowIndex === index ? { ...row, input: event.target.value } : row);
                        setForm({ ...form, knowledgeBase });
                      }}
                      placeholder="Ex : comment réserver ?"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label>Réponse</Label>
                    <Textarea
                      className="mt-2 min-h-24"
                      value={item.answer}
                      onChange={(event) => {
                        const knowledgeBase = form.knowledgeBase.map((row, rowIndex) => rowIndex === index ? { ...row, answer: event.target.value } : row);
                        setForm({ ...form, knowledgeBase });
                      }}
                      placeholder="Réponse envoyée automatiquement par Orita."
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-md border-red-200 text-red-700 hover:bg-red-50 lg:w-auto"
                      onClick={() => {
                        const knowledgeBase = form.knowledgeBase.filter((_, rowIndex) => rowIndex !== index);
                        setForm({ ...form, knowledgeBase: knowledgeBase.length ? knowledgeBase : [{ input: "", answer: "" }] });
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Commande locale utile</p>
            <p className="mt-1 font-mono text-xs">docker compose exec ollama ollama pull {form.model || "llama3.2:1b"}</p>
          </div>

          <Button type="submit" className="rounded-md bg-black text-white hover:bg-stone-800">
            Enregistrer la configuration IA
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

function ContactConfigurationFormView({ form, setForm, onSubmit }: { form: ContactConfigurationForm; setForm: (form: ContactConfigurationForm) => void; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormSection title="Adresses">
        <div className="space-y-3">
          {form.addresses.map((item, index) => (
            <div key={index} className="space-y-2 rounded-md border border-stone-200 bg-stone-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Adresse {index + 1}</Label>
                {form.addresses.length > 1 && (
                  <Button type="button" variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => setForm({ ...form, addresses: form.addresses.filter((_, itemIndex) => itemIndex !== index) })}>
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                )}
              </div>
              <Input
                required
                placeholder="Libellé, ex: Bureau Cotonou"
                value={item.label}
                onChange={(e) => {
                  const nextAddresses = form.addresses.map((addressItem, itemIndex) => itemIndex === index ? { ...addressItem, label: e.target.value } : addressItem);
                  setForm({ ...form, addresses: nextAddresses });
                }}
              />
              <Input
                required
                placeholder="Adresse"
                value={item.address}
                onChange={(e) => {
                  const nextAddresses = form.addresses.map((addressItem, itemIndex) => itemIndex === index ? { ...addressItem, address: e.target.value } : addressItem);
                  setForm({ ...form, addresses: nextAddresses });
                }}
              />
              <Input
                required
                placeholder="Ville, pays"
                value={item.cityCountry}
                onChange={(e) => {
                  const nextAddresses = form.addresses.map((addressItem, itemIndex) => itemIndex === index ? { ...addressItem, cityCountry: e.target.value } : addressItem);
                  setForm({ ...form, addresses: nextAddresses });
                }}
              />
            </div>
          ))}
          <Button type="button" variant="outline" className="w-full rounded-md border-dashed" onClick={() => setForm({ ...form, addresses: [...form.addresses, { label: "", address: "", cityCountry: "" }] })}>
            <Plus className="h-4 w-4" />
            Ajouter une adresse
          </Button>
        </div>
      </FormSection>

      <FormSection title="Téléphones et WhatsApp">
        <div className="space-y-3">
          {form.phones.map((item, index) => (
            <div key={index} className="space-y-2 rounded-md border border-stone-200 bg-stone-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Numéro {index + 1}</Label>
                {form.phones.length > 1 && (
                  <Button type="button" variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => setForm({ ...form, phones: form.phones.filter((_, itemIndex) => itemIndex !== index) })}>
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                )}
              </div>
              <Input
                required
                placeholder="Libellé, ex: Réservations"
                value={item.label}
                onChange={(e) => {
                  const nextPhones = form.phones.map((phoneItem, itemIndex) => itemIndex === index ? { ...phoneItem, label: e.target.value } : phoneItem);
                  setForm({ ...form, phones: nextPhones });
                }}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  required
                  placeholder="Téléphone"
                  value={item.number}
                  onChange={(e) => {
                    const nextPhones = form.phones.map((phoneItem, itemIndex) => itemIndex === index ? { ...phoneItem, number: e.target.value } : phoneItem);
                    setForm({ ...form, phones: nextPhones });
                  }}
                />
                <Input
                  placeholder="WhatsApp"
                  value={item.whatsapp}
                  onChange={(e) => {
                    const nextPhones = form.phones.map((phoneItem, itemIndex) => itemIndex === index ? { ...phoneItem, whatsapp: e.target.value } : phoneItem);
                    setForm({ ...form, phones: nextPhones });
                  }}
                />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" className="w-full rounded-md border-dashed" onClick={() => setForm({ ...form, phones: [...form.phones, { label: "", number: "", whatsapp: "" }] })}>
            <Plus className="h-4 w-4" />
            Ajouter un numéro
          </Button>
        </div>
      </FormSection>

      <FormSection title="Emails">
        <div className="space-y-3">
          {form.emails.map((item, index) => (
            <div key={index} className="space-y-2 rounded-md border border-stone-200 bg-stone-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Email {index + 1}</Label>
                {form.emails.length > 1 && (
                  <Button type="button" variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => setForm({ ...form, emails: form.emails.filter((_, itemIndex) => itemIndex !== index) })}>
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                )}
              </div>
              <Input
                required
                placeholder="Libellé, ex: Support"
                value={item.label}
                onChange={(e) => {
                  const nextEmails = form.emails.map((emailItem, itemIndex) => itemIndex === index ? { ...emailItem, label: e.target.value } : emailItem);
                  setForm({ ...form, emails: nextEmails });
                }}
              />
              <Input
                required
                type="email"
                placeholder="Email"
                value={item.email}
                onChange={(e) => {
                  const nextEmails = form.emails.map((emailItem, itemIndex) => itemIndex === index ? { ...emailItem, email: e.target.value } : emailItem);
                  setForm({ ...form, emails: nextEmails });
                }}
              />
            </div>
          ))}
          <Button type="button" variant="outline" className="w-full rounded-md border-dashed" onClick={() => setForm({ ...form, emails: [...form.emails, { label: "", email: "" }] })}>
            <Plus className="h-4 w-4" />
            Ajouter un email
          </Button>
        </div>
      </FormSection>
      <FormSection title="Horaires">
        <Textarea
          required
          className="min-h-28"
          value={form.openingHours}
          onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
          placeholder="Lundi - Vendredi | 8h - 18h"
        />
        <p className="text-xs text-stone-500">Une ligne par horaire, au format : Jour ou période | horaire</p>
      </FormSection>
      <FormSection title="FAQ">
        <div className="space-y-3">
          {form.faq.map((item, index) => (
            <div key={index} className="space-y-2 rounded-md border border-stone-200 bg-stone-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Question {index + 1}</Label>
                {form.faq.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => setForm({ ...form, faq: form.faq.filter((_, itemIndex) => itemIndex !== index) })}
                  >
                    Supprimer
                  </Button>
                )}
              </div>
              <Input
                required
                placeholder="Question affichée"
                value={item.question}
                onChange={(e) => {
                  const nextFaq = form.faq.map((faqItem, itemIndex) => itemIndex === index ? { ...faqItem, question: e.target.value } : faqItem);
                  setForm({ ...form, faq: nextFaq });
                }}
              />
              <Textarea
                required
                className="min-h-24"
                placeholder="Réponse affichée dans le dropdown"
                value={item.answer}
                onChange={(e) => {
                  const nextFaq = form.faq.map((faqItem, itemIndex) => itemIndex === index ? { ...faqItem, answer: e.target.value } : faqItem);
                  setForm({ ...form, faq: nextFaq });
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-md border-dashed"
            onClick={() => setForm({ ...form, faq: [...form.faq, { question: "", answer: "" }] })}
          >
            <Plus className="h-4 w-4" />
            Ajouter une question
          </Button>
        </div>
      </FormSection>
      <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="submit">Enregistrer la configuration</Button>
    </form>
  );
}

function HomepageConfigurationFormView({ form, setForm, onSubmit }: { form: HomepageConfigurationForm; setForm: (form: HomepageConfigurationForm) => void; onSubmit: (e: React.FormEvent) => void }) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const asset = await uploadImageAsset({ file, alt: form.heroImageAlt || form.heroTitle || file.name });
      setForm({
        ...form,
        heroImageUrl: asset.url,
        heroImageAlt: form.heroImageAlt || asset.alt,
      });
      toast.success("Image d'accueil ajoutée");
    } catch {
      toast.error("Impossible d'ajouter cette image");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div
        className="min-h-72 rounded-md bg-cover bg-center p-6 text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(12,10,9,0.78), rgba(12,10,9,0.38)), url('${form.heroImageUrl}')`,
        }}
      >
        <div className="inline-flex rounded-md bg-white/15 px-3 py-2 text-sm font-medium">{form.heroEyebrow || "Zone affichée"}</div>
        <h3 className="font-orita-wordmark mt-8 text-5xl text-[#d6a02a]">{form.heroTitle || "ORITA"}</h3>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-100">{form.heroSubtitle || "Texte de présentation de l'accueil."}</p>
      </div>
      <FormSection title="Image d'accueil">
        <div className="space-y-4 rounded-md border border-stone-200 bg-stone-50 p-4">
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#d6a02a]/70 bg-white px-4 py-6 text-center transition-colors hover:bg-[#fff8e6]">
            <Upload className="mb-3 h-8 w-8 text-[#d6a02a]" />
            <span className="text-sm font-semibold text-stone-950">
              {isUploadingImage ? "Import de l'image..." : "Importer une image depuis mon ordinateur"}
            </span>
            <span className="mt-1 text-xs text-stone-500">JPG, PNG ou WebP. Elle remplacera l'image principale de l'accueil.</span>
            <input type="file" accept="image/*" className="sr-only" onChange={handleImageFile} disabled={isUploadingImage} />
          </label>
          {form.heroImageUrl && (
            <div className="grid gap-3 sm:grid-cols-[120px_1fr] sm:items-center">
              <div className="h-20 rounded-md border border-stone-200 bg-cover bg-center" style={{ backgroundImage: `url('${form.heroImageUrl}')` }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Image actuelle</p>
                <p className="mt-1 break-all text-xs text-stone-500">{form.heroImageUrl}</p>
              </div>
            </div>
          )}
          <details className="rounded-md border border-stone-200 bg-white p-3 text-sm">
            <summary className="cursor-pointer font-medium text-stone-800">Option avancée : utiliser une URL d'image</summary>
            <Input required className="mt-3" placeholder="URL de l'image d'accueil" value={form.heroImageUrl} onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })} />
          </details>
        </div>
        <Input placeholder="Texte alternatif de l'image" value={form.heroImageAlt} onChange={(e) => setForm({ ...form, heroImageAlt: e.target.value })} />
      </FormSection>
      <FormSection title="Textes">
        <Input required placeholder="Localisations affichées" value={form.heroEyebrow} onChange={(e) => setForm({ ...form, heroEyebrow: e.target.value })} />
        <Input required placeholder="Titre principal" value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} />
        <Textarea required className="min-h-28" placeholder="Texte de présentation" value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} />
        <div className="grid gap-3 md:grid-cols-2">
          <Input required placeholder="Bouton principal" value={form.heroPrimaryLabel} onChange={(e) => setForm({ ...form, heroPrimaryLabel: e.target.value })} />
          <Input required placeholder="Bouton secondaire" value={form.heroSecondaryLabel} onChange={(e) => setForm({ ...form, heroSecondaryLabel: e.target.value })} />
        </div>
      </FormSection>
      <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="submit">Enregistrer l'accueil</Button>
    </form>
  );
}

function PageHeroConfigurationFormView({
  form,
  setForm,
  onSubmit,
  submitLabel,
}: {
  form: PageHeroConfigurationForm;
  setForm: (form: PageHeroConfigurationForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
}) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const asset = await uploadImageAsset({ file, alt: form.imageAlt || form.title || file.name });
      setForm({
        ...form,
        imageUrl: asset.url,
        imageAlt: form.imageAlt || asset.alt,
      });
      toast.success("Image ajoutée");
    } catch {
      toast.error("Impossible d'ajouter cette image");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div
        className="min-h-72 rounded-md bg-cover bg-center p-6 text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(12,10,9,0.78), rgba(12,10,9,0.38)), url('${form.imageUrl}')`,
        }}
      >
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#d6a02a]">{form.eyebrow || "Surtitre"}</p>
        <h3 className="max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">{form.title || "Titre de la page"}</h3>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-stone-100">{form.subtitle || "Texte d'introduction de la page."}</p>
      </div>
      <FormSection title="Image">
        <div className="space-y-4 rounded-md border border-stone-200 bg-stone-50 p-4">
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#d6a02a]/70 bg-white px-4 py-6 text-center transition-colors hover:bg-[#fff8e6]">
            <Upload className="mb-3 h-8 w-8 text-[#d6a02a]" />
            <span className="text-sm font-semibold text-stone-950">
              {isUploadingImage ? "Import de l'image..." : "Importer une image depuis mon ordinateur"}
            </span>
            <span className="mt-1 text-xs text-stone-500">JPG, PNG ou WebP. L'image remplacera le fond de ce bandeau.</span>
            <input type="file" accept="image/*" className="sr-only" onChange={handleImageFile} disabled={isUploadingImage} />
          </label>
          {form.imageUrl && (
            <div className="grid gap-3 sm:grid-cols-[120px_1fr] sm:items-center">
              <div className="h-20 rounded-md border border-stone-200 bg-cover bg-center" style={{ backgroundImage: `url('${form.imageUrl}')` }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Image actuelle</p>
                <p className="mt-1 break-all text-xs text-stone-500">{form.imageUrl}</p>
              </div>
            </div>
          )}
          <details className="rounded-md border border-stone-200 bg-white p-3 text-sm">
            <summary className="cursor-pointer font-medium text-stone-800">Option avancée : utiliser une URL d'image</summary>
            <Input required className="mt-3" placeholder="URL de l'image" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </details>
        </div>
        <Input placeholder="Texte alternatif de l'image" value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} />
      </FormSection>
      <FormSection title="Textes">
        <Input required placeholder="Surtitre" value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />
        <Input required placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Textarea required className="min-h-28" placeholder="Texte d'introduction" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
      </FormSection>
      <Button className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="submit">{submitLabel}</Button>
    </form>
  );
}

type RevenuePoint = { label: string; revenue: number; bookings: number; average: number };
type PopularService = { name: string; count: number; revenue: number };
type ClientRecord = ClientForm & {
  id: string;
  name: string;
  bookingCount: number;
  bookings: Booking[];
  totalSpent: number;
  averageBasket: number;
  remainingDue: number;
  nextBooking: Booking | null;
  lastActivity: string;
  createdAt: string;
  lastLogin: string;
};

function sumRevenueSince(bookings: Booking[], days: number) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  return bookings.filter((booking) => new Date(booking.date) >= threshold).reduce((sum, booking) => sum + bookingRevenue(booking), 0);
}

function sumRevenueBetween(bookings: Booking[], fromDaysAgo: number, toDaysAgo: number) {
  const from = new Date();
  from.setDate(from.getDate() - fromDaysAgo);
  const to = new Date();
  to.setDate(to.getDate() - toDaysAgo);
  return bookings.filter((booking) => {
    const date = new Date(booking.date);
    return date >= from && date < to;
  }).reduce((sum, booking) => sum + bookingRevenue(booking), 0);
}

function growthLabel(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? "+100% vs période précédente" : "Stable";
  }
  const growth = Math.round(((current - previous) / previous) * 100);
  return `${growth >= 0 ? "+" : ""}${growth}% vs période précédente`;
}

function buildRevenueSeries(bookings: Booking[], days: number): RevenuePoint[] {
  return Array.from({ length: Math.min(days, 30) }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (Math.min(days, 30) - index - 1));
    const key = date.toISOString().slice(0, 10);
    const dayBookings = bookings.filter((booking) => dateOnly(booking.date) === key);
    const revenue = dayBookings.reduce((sum, booking) => sum + bookingRevenue(booking), 0);
    return {
      label: `${date.getDate()}/${date.getMonth() + 1}`,
      revenue,
      bookings: dayBookings.length,
      average: dayBookings.length ? revenue / dayBookings.length : 0,
    };
  });
}

function buildPopularServices(bookings: Booking[]): PopularService[] {
  const map = new Map<string, PopularService>();
  bookings.forEach((booking) => {
    const name = booking.tour?.title ?? booking.driver?.name ?? "Non affecté";
    const current = map.get(name) ?? { name, count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += bookingRevenue(booking);
    map.set(name, current);
  });
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
}

function buildClients(bookings: Booking[], storedClients: ClientForm[], clientAccounts: ClientAccount[]): ClientRecord[] {
  const map = new Map<string, ClientRecord>();

  clientAccounts.forEach((account) => {
    const phone = `${account.phonePrefix} ${account.phone}`.trim();
    const client: ClientForm = {
      id: `account-${account.email.toLowerCase()}`,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      phone,
      country: account.phonePrefix === "+229" ? "Bénin" : "",
      address: "",
      language: "Français",
      accountStatus: account.verified ? "actif" : "non vérifié",
      commercialStatus: "prospect",
      notes: account.marketing ? "Consentement marketing accepté depuis l'espace client." : "Compte créé depuis l'espace client.",
    };
    map.set(account.email.toLowerCase(), toClientRecord(client as ClientForm & { id: string }, []));
  });

  storedClients.forEach((client) => {
    const id = client.id ?? client.email.toLowerCase();
    const existing = map.get(client.email.toLowerCase());
    map.set(client.email.toLowerCase(), toClientRecord({ ...existing, ...client, id } as ClientForm & { id: string }, existing?.bookings ?? []));
  });

  bookings.forEach((booking) => {
    const key = booking.customerEmail.toLowerCase();
    const existing = map.get(key);
    const [firstName, ...lastNameParts] = booking.customerName.split(" ");
    const base: ClientForm = existing ?? {
      id: `email-${key}`,
      firstName: firstName || booking.customerName,
      lastName: lastNameParts.join(" "),
      email: booking.customerEmail,
      phone: booking.customerPhone,
      country: "Bénin",
      address: "",
      language: "Français",
      accountStatus: "actif",
      commercialStatus: "nouveau client",
      notes: "",
    };
    const nextBookings = [...(existing?.bookings ?? []), booking];
    map.set(key, toClientRecord(base, nextBookings));
  });

  return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

function toClientRecord(client: ClientForm & { id: string }, clientBookings: Booking[]): ClientRecord {
  const totalSpent = clientBookings.reduce((sum, booking) => sum + bookingRevenue(booking), 0);
  const remainingDue = clientBookings.filter((booking) => booking.status === "pending").reduce((sum, booking) => sum + Math.round(booking.price * 0.7), 0);
  const nextBooking = [...clientBookings].filter((booking) => new Date(booking.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;
  const lastBooking = [...clientBookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const commercialStatus = client.commercialStatus === "prospect" && clientBookings.length > 0
    ? computedCommercialStatus(clientBookings.length, totalSpent, lastBooking?.date)
    : client.commercialStatus;

  return {
    ...client,
    commercialStatus,
    name: `${client.firstName} ${client.lastName}`.trim() || client.email,
    bookingCount: clientBookings.length,
    bookings: clientBookings,
    totalSpent,
    averageBasket: clientBookings.length ? totalSpent / clientBookings.length : 0,
    remainingDue,
    nextBooking,
    lastActivity: lastBooking ? dateOnly(lastBooking.date) : "Compte créé",
    createdAt: "Dossier local",
    lastLogin: "Non disponible",
  };
}

function computedCommercialStatus(count: number, revenue: number, lastDate?: string): ClientForm["commercialStatus"] {
  if (revenue >= 2_000_000 || count >= 5) return "client VIP";
  if (count >= 3) return "client fidèle";
  if (count >= 1) return "client actif";
  if (lastDate) {
    const date = new Date(lastDate);
    const inactive = Date.now() - date.getTime() > 180 * 86400000;
    if (inactive) return "client inactif";
  }
  return "prospect";
}

function bookingPayloadFromExisting(booking: Booking, status: Booking["status"]) {
  return {
    type: booking.type,
    tour: booking.tour ? `/api/tours/${booking.tour.id}` : undefined,
    driver: booking.driver ? `/api/drivers/${booking.driver.id}` : undefined,
    date: booking.date,
    duration: booking.duration,
    price: booking.price,
    status,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
  };
}

function filterBookings(bookings: Booking[], query: string) {
  const lower = query.toLowerCase();
  if (!lower) return bookings;
  return bookings.filter((booking) => [booking.customerName, booking.customerEmail, booking.customerPhone, booking.tour?.title, booking.driver?.name, booking.status].some((value) => value?.toLowerCase().includes(lower)));
}

function filterClients(clients: ClientRecord[], query: string) {
  const lower = query.toLowerCase();
  if (!lower) return clients;
  return clients.filter((client) => [
    client.name,
    client.email,
    client.phone,
    client.country,
    client.accountStatus,
    client.commercialStatus,
    client.nextBooking?.tour?.title,
    client.nextBooking?.driver?.name,
  ].some((value) => value?.toLowerCase().includes(lower)));
}

function filterTours(tours: Tour[], query: string) {
  const lower = query.toLowerCase();
  if (!lower) return tours;
  return tours.filter((tour) => [tour.title, tour.summary, ...tour.highlights].some((value) => value.toLowerCase().includes(lower)));
}

function filterDrivers(drivers: Driver[], query: string) {
  const lower = query.toLowerCase();
  if (!lower) return drivers;
  return drivers.filter((driver) => [driver.name, driver.zone, driver.vehicleType, driver.phone].some((value) => value.toLowerCase().includes(lower)));
}

function filterPlans(plans: BonPlan[], query: string) {
  const lower = query.toLowerCase();
  if (!lower) return plans;
  return plans.filter((plan) => [plan.title, plan.category, plan.description].some((value) => value.toLowerCase().includes(lower)));
}

function buildAdminNotifications({ pendingBookings, rentalBookings, activeContactRequests, clientAccounts, guides, drivers, tenants }: {
  pendingBookings: Booking[];
  rentalBookings: RentalBooking[];
  activeContactRequests: ContactRequest[];
  clientAccounts: ClientAccount[];
  guides: Guide[];
  drivers: Driver[];
  tenants: Tenant[];
}): AdminNotification[] {
  const notifications: AdminNotification[] = [];
  const pendingGuides = guides.filter((guide) => guide.validationStatus === "pending");
  const pendingDrivers = drivers.filter((driver) => driver.validationStatus === "pending");
  const pendingTenants = tenants.filter((tenant) => tenant.status === "pending");
  const pendingRentalBookings = rentalBookings.filter((booking) => booking.status === "pending");
  const unavailableDrivers = drivers.filter((driver) => !driver.available);
  const unverifiedClients = clientAccounts.filter((client) => !client.verified);
  const newContactRequests = activeContactRequests.filter((request) => request.status === "nouveau");

  if (pendingBookings.length > 0) {
    notifications.push({
      id: "pending-bookings",
      title: `${pendingBookings.length} réservation${pendingBookings.length > 1 ? "s" : ""} en attente`,
      description: "Des commandes doivent être confirmées, modifiées ou annulées.",
      section: "bookings",
      tone: "amber",
    });
  }

  if (newContactRequests.length > 0) {
    notifications.push({
      id: "new-contact-requests",
      title: `${newContactRequests.length} message${newContactRequests.length > 1 ? "s" : ""} client à traiter`,
      description: "De nouvelles demandes attendent une réponse dans les messages.",
      section: "messages",
      tone: "blue",
    });
  }

  if (unverifiedClients.length > 0) {
    notifications.push({
      id: "unverified-clients",
      title: `${unverifiedClients.length} compte${unverifiedClients.length > 1 ? "s" : ""} client non vérifié${unverifiedClients.length > 1 ? "s" : ""}`,
      description: "Des clients ont créé un compte mais doivent encore valider leur email.",
      section: "clients",
      tone: "stone",
    });
  }

  if (pendingGuides.length > 0) {
    notifications.push({
      id: "pending-guides",
      title: `${pendingGuides.length} guide${pendingGuides.length > 1 ? "s" : ""} à valider`,
      description: "Un administrateur doit valider ces guides avant l'accès mobile.",
      section: "guides",
      tone: "amber",
    });
  }

  if (pendingDrivers.length > 0) {
    notifications.push({
      id: "pending-drivers",
      title: `${pendingDrivers.length} chauffeur${pendingDrivers.length > 1 ? "s" : ""} à valider`,
      description: "Un administrateur doit valider ces chauffeurs avant l'accès mobile.",
      section: "drivers",
      tone: "amber",
    });
  }

  if (pendingTenants.length > 0) {
    notifications.push({
      id: "pending-tenants",
      title: `${pendingTenants.length} propriétaire${pendingTenants.length > 1 ? "s" : ""} à valider`,
      description: "Une location ne sera publiée qu'après validation du propriétaire.",
      section: "rentals",
      tone: "amber",
    });
  }

  if (pendingRentalBookings.length > 0) {
    notifications.push({
      id: "pending-rental-bookings",
      title: `${pendingRentalBookings.length} demande${pendingRentalBookings.length > 1 ? "s" : ""} de location en attente`,
      description: "Des clients attendent une acceptation ou un refus du propriétaire. Le paiement reste géré par ORITA.",
      section: "rentals",
      tone: "blue",
    });
  }

  if (unavailableDrivers.length > 0) {
    notifications.push({
      id: "unavailable-drivers",
      title: `${unavailableDrivers.length} chauffeur${unavailableDrivers.length > 1 ? "s" : ""} indisponible${unavailableDrivers.length > 1 ? "s" : ""}`,
      description: "Vérifie les disponibilités et les réservations chauffeur.",
      section: "drivers",
      tone: "red",
    });
  }

  return notifications;
}

function statusLabel(value: string) {
  return {
    pending: "En attente",
    confirmed: "Confirmée",
    unavailable: "Indisponible",
    refunded: "Remboursée",
  }[value] ?? value;
}

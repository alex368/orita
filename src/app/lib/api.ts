export interface ImageAsset {
  id: number;
  alt: string;
  url: string;
}

export interface Tour {
  id: string;
  title: string;
  summary: string;
  durations: { days: number; priceEur: number; priceFcfa: number; price: number }[];
  highlights: string[];
  included: string[];
  notIncluded: string[];
  itinerary: string[];
  practicalInfo: string[];
  travelTips: string[];
  image: string;
  imageAlt: string;
  popular: boolean;
  guide?: Guide | null;
}

export interface Guide {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  location: string;
  guideZone: string;
  phone: string;
  description: string;
  offers: string[];
  specialties: string[];
  languages: string[];
  validationStatus: "pending" | "validated" | "rejected" | "suspended";
  user?: Pick<ClientAccount, "id" | "firstName" | "lastName" | "fullName" | "email"> | null;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  zone: string;
  vehicleType: string;
  available: boolean;
  validationStatus: "pending" | "validated" | "rejected" | "suspended";
  dailyPriceEur: number;
  dailyPriceFcfa: number;
  monthlyPriceEur: number;
  monthlyPriceFcfa: number;
  image: string;
  imageAlt: string;
  user?: Pick<ClientAccount, "id" | "firstName" | "lastName" | "fullName" | "email"> | null;
}

export interface Tenant {
  id: string;
  fullName: string;
  location: string;
  phone: string;
  whatsapp: string;
  availableSlots: string[];
  status: "pending" | "validated" | "suspended" | "archived";
}

export interface Rental {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  dailyPriceEur: number;
  dailyPriceFcfa: number;
  monthlyPriceEur: number;
  monthlyPriceFcfa: number;
  available: boolean;
  amenities: string[];
  tenant: Tenant;
  image: string;
  imageAlt: string;
  images: ImageAsset[];
}

export interface RentalBooking {
  id: number;
  rental: Pick<Rental, "id" | "title" | "location">;
  tenant: Pick<Tenant, "id" | "fullName" | "location"> & {
    phone: string | null;
    whatsapp: string | null;
  };
  startDate: string;
  endDate: string;
  nights: number;
  totalPrice: number;
  status: "pending" | "accepted" | "refused" | "completed" | "cancelled";
  paymentStatus: "paid" | "pending" | "refunded" | "released";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  keyHandoverNotes: string;
  messages: { author: string; text: string; createdAt: string }[];
  createdAt: string;
  ownerRespondedAt?: string | null;
  completedAt?: string | null;
}

export interface BonPlan {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
}

export interface BookingPayload {
  type: "tour" | "driver";
  tour?: string;
  driver?: string;
  date: string;
  duration: number;
  price: number;
  status: "pending" | "confirmed" | "unavailable" | "refunded";
  providerStatus?: "pending" | "confirmed" | "refused" | "completed";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded" | "partial_refund";
  refundAmount?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export type BookingInput = BookingPayload;

export interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedLabel: string;
}

export interface ClientAccount {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phonePrefix: string;
  phone: string;
  marketing: boolean;
  verified: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
}

export interface AdminClientProfile {
  id: string;
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
}

export interface PageChatMessage {
  id?: number;
  pagePath: string;
  role: "assistant" | "user";
  text: string;
}

export interface AiConfiguration {
  id?: number;
  enabled: boolean;
  provider: "ollama" | string;
  model: string;
  systemPrompt: string;
  fallbackAnswer: string;
  knowledgeBase: { input: string; answer: string }[];
  temperature: number;
  maxTokens: number;
  ollamaBaseUrl?: string;
  updatedAt?: string;
}

export interface AiChatResponse {
  answer: string;
  source: "ollama" | "fallback" | "knowledge";
  model: string;
  error?: string;
}

export interface ContactRequest {
  id?: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "nouveau" | "lu" | "traité" | "archivé";
  internalNote: string;
  reply?: string;
  repliedAt?: string | null;
  createdAt?: string;
}

export interface ContactConfiguration {
  id?: number;
  address: string;
  cityCountry: string;
  phone: string;
  whatsapp: string;
  email: string;
  addresses?: { label: string; address: string; cityCountry: string }[];
  phones?: { label: string; number: string; whatsapp?: string }[];
  emails?: { label: string; email: string }[];
  openingHours: { label: string; value: string }[];
  faq: { question: string; answer: string }[];
}

export interface HomepageConfiguration {
  id?: number;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryLabel: string;
  heroSecondaryLabel: string;
  heroImage: ImageAsset | null;
  updatedAt?: string;
}

export interface PageHeroConfiguration {
  id?: number;
  pageKey: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: ImageAsset | null;
  updatedAt?: string;
}

export type TourInput = Omit<Tour, "id" | "image" | "imageAlt" | "guide"> & { image: string; guide?: string | null };
export type GuideInput = Omit<Guide, "id" | "fullName" | "user"> & { user?: string | null };
export type DriverInput = Omit<Driver, "id" | "image" | "imageAlt" | "dailyPriceFcfa" | "monthlyPriceFcfa" | "user"> & { image: string; user?: string | null };
export type TenantInput = Omit<Tenant, "id">;
export type BonPlanInput = Omit<BonPlan, "id" | "image" | "imageAlt"> & { image: string };
export type LegalPageInput = Omit<LegalPage, "id">;
export type AdminClientProfileInput = Omit<AdminClientProfile, "id">;
export type ContactRequestInput = Omit<ContactRequest, "id" | "createdAt">;
export type ContactConfigurationInput = Omit<ContactConfiguration, "id">;
export type AiConfigurationInput = Omit<AiConfiguration, "id" | "provider" | "ollamaBaseUrl" | "updatedAt">;
export type HomepageConfigurationInput = Omit<HomepageConfiguration, "id" | "heroImage" | "updatedAt"> & {
  heroImageId?: number;
  heroImageUrl: string;
  heroImageAlt: string;
};
export type PageHeroConfigurationInput = Omit<PageHeroConfiguration, "id" | "pageKey" | "image" | "updatedAt"> & {
  imageId?: number;
  imageUrl: string;
  imageAlt: string;
};

export interface Booking {
  id: number;
  type: "tour" | "driver";
  tour?: Pick<Tour, "id" | "title"> | null;
  driver?: Pick<Driver, "id" | "name"> | null;
  date: string;
  duration: number;
  price: number;
  status: "pending" | "confirmed" | "unavailable" | "refunded";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedDrivers {
  items: Driver[];
  pagination: PaginationMeta;
}

export interface PaginatedRentals {
  items: Rental[];
  pagination: PaginationMeta;
}

export interface PaginatedTenants {
  items: Tenant[];
  pagination: PaginationMeta;
}

export interface PaginatedContactRequests {
  items: ContactRequest[];
  pagination: PaginationMeta;
}

export interface PaginatedTours {
  items: Tour[];
  pagination: PaginationMeta;
}

export interface PaginatedBonPlans {
  items: BonPlan[];
  pagination: PaginationMeta;
}

export interface PaginatedBookings {
  items: Booking[];
  pagination: PaginationMeta;
}

export interface PaginatedLegalPages {
  items: LegalPage[];
  pagination: PaginationMeta;
}

export interface PaginatedAdminClientProfiles {
  items: AdminClientProfile[];
  pagination: PaginationMeta;
}

export interface PaginatedGuides {
  items: Guide[];
  pagination: PaginationMeta;
}

interface ApiTour extends Omit<Tour, "id" | "image" | "imageAlt"> {
  id: number;
  image: ImageAsset;
}

interface ApiGuide extends Omit<Guide, "id"> {
  id: number;
}

interface ApiDriver extends Omit<Driver, "id" | "image" | "imageAlt"> {
  id: number;
  image: ImageAsset;
}

interface ApiTenant extends Omit<Tenant, "id"> {
  id: number;
}

interface ApiRental extends Omit<Rental, "id" | "image" | "imageAlt" | "images" | "tenant"> {
  id: number;
  image: ImageAsset;
  images?: ImageAsset[];
  tenant: ApiTenant;
}

interface ApiRentalBooking extends Omit<RentalBooking, "rental" | "tenant"> {
  rental: Pick<Rental, "title" | "location"> & { id: number | string };
  tenant: Pick<Tenant, "fullName" | "location"> & { id: number | string; phone: string | null; whatsapp: string | null };
}

interface ApiBonPlan extends Omit<BonPlan, "id" | "image" | "imageAlt"> {
  id: number;
  image: ImageAsset;
}

interface ApiLegalPage extends Omit<LegalPage, "id"> {
  id: number;
}

interface ApiAdminClientProfile extends Omit<AdminClientProfile, "id"> {
  id: number;
}

type ApiCollection<T> = T[] | { member?: T[]; "hydra:member"?: T[] };

export const API_URL = import.meta.env.VITE_API_URL ?? "/api";
const API_BEARER_TOKEN = import.meta.env.VITE_API_BEARER_TOKEN ?? "dev-benintours-token";
export type BookingDocumentKind = "confirmation" | "facture" | "programme" | "conditions" | "bon-echange";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

async function publicApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

async function apiFetchOptional<T>(path: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json() as Promise<T>;
}

function normalizeTour(tour: ApiTour): Tour {
  return {
    ...tour,
    id: String(tour.id),
    image: tour.image.url,
    imageAlt: tour.image.alt,
    guide: tour.guide ? normalizeGuide(tour.guide as ApiGuide) : null,
  };
}

function normalizeGuide(guide: ApiGuide): Guide {
  return { ...guide, id: String(guide.id) };
}

function normalizeDriver(driver: ApiDriver): Driver {
  return {
    ...driver,
    id: String(driver.id),
    image: driver.image.url,
    imageAlt: driver.image.alt,
  };
}

function normalizeTenant(tenant: ApiTenant): Tenant {
  return { ...tenant, id: String(tenant.id) };
}

function normalizeRental(rental: ApiRental): Rental {
  const images = rental.images?.length ? rental.images : [rental.image];

  return {
    ...rental,
    id: String(rental.id),
    tenant: normalizeTenant(rental.tenant),
    image: rental.image.url,
    imageAlt: rental.image.alt,
    images,
  };
}

function normalizeRentalBooking(booking: ApiRentalBooking): RentalBooking {
  return {
    ...booking,
    rental: { ...booking.rental, id: String(booking.rental.id) },
    tenant: { ...booking.tenant, id: String(booking.tenant.id) },
  };
}

function normalizeBonPlan(plan: ApiBonPlan): BonPlan {
  return {
    ...plan,
    id: String(plan.id),
    image: plan.image.url,
    imageAlt: plan.image.alt,
  };
}

function normalizeLegalPage(page: ApiLegalPage): LegalPage {
  return {
    ...page,
    id: String(page.id),
  };
}

function apiItems<T>(collection: ApiCollection<T>): T[] {
  if (Array.isArray(collection)) return collection;
  return collection.member ?? collection["hydra:member"] ?? [];
}

export async function getTours(): Promise<Tour[]> {
  const response = await apiFetch<{ items: ApiTour[] }>(`/tour-search?limit=30`);
  return response.items.map(normalizeTour);
}

export async function searchTours(params: { q?: string; page?: number; limit?: number }): Promise<PaginatedTours> {
  const searchParams = toSearchParams(params);
  const response = await apiFetch<{ items: ApiTour[]; pagination: PaginationMeta }>(`/tour-search?${searchParams.toString()}`);

  return {
    items: response.items.map(normalizeTour),
    pagination: response.pagination,
  };
}

export async function getTour(id: string): Promise<Tour> {
  return normalizeTour(await apiFetch<ApiTour>(`/tours/${id}`));
}

export async function getGuides(): Promise<Guide[]> {
  const guides = await apiFetch<ApiCollection<ApiGuide>>("/guides");
  return apiItems(guides).map(normalizeGuide);
}

export async function searchGuides(params: { q?: string; page?: number; limit?: number }): Promise<PaginatedGuides> {
  const searchParams = toSearchParams(params);
  const response = await apiFetch<{ items: ApiGuide[]; pagination: PaginationMeta }>(`/guide-search?${searchParams.toString()}`);

  return {
    items: response.items.map(normalizeGuide),
    pagination: response.pagination,
  };
}

export async function getDrivers(): Promise<Driver[]> {
  const drivers = await apiFetch<ApiCollection<ApiDriver>>("/drivers");
  return apiItems(drivers).map(normalizeDriver);
}

export async function getDriver(id: string): Promise<Driver> {
  return normalizeDriver(await apiFetch<ApiDriver>(`/drivers/${id}`));
}

export async function searchDrivers(params: { q?: string; location?: string; available?: string; scope?: "admin"; page?: number; limit?: number }): Promise<PaginatedDrivers> {
  const searchParams = toSearchParams(params);

  const response = await apiFetch<{ items: ApiDriver[]; pagination: PaginationMeta }>(`/driver-search?${searchParams.toString()}`);

  return {
    items: response.items.map(normalizeDriver),
    pagination: response.pagination,
  };
}

export async function searchRentals(params: { q?: string; category?: string; available?: string; page?: number; limit?: number }): Promise<PaginatedRentals> {
  const searchParams = toSearchParams(params);
  const response = await apiFetch<{ items: ApiRental[]; pagination: PaginationMeta }>(`/rental-search?${searchParams.toString()}`);

  return {
    items: response.items.map(normalizeRental),
    pagination: response.pagination,
  };
}

export async function getRentals(): Promise<Rental[]> {
  const rentals = await apiFetch<ApiCollection<ApiRental>>("/rentals");
  return apiItems(rentals).map(normalizeRental);
}

export async function getRentalBookings(params: { rentalId?: string; email?: string } = {}): Promise<RentalBooking[]> {
  const searchParams = toSearchParams(params);
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";

  return (await apiFetch<ApiRentalBooking[]>(`/rental-bookings${suffix}`)).map(normalizeRentalBooking);
}

export async function createRentalBooking(input: { sessionToken: string; rentalId: string; startDate: string; endDate: string; message?: string }): Promise<RentalBooking> {
  return normalizeRentalBooking(await apiFetch<ApiRentalBooking>("/rental-bookings", {
    method: "POST",
    body: JSON.stringify(input),
  }));
}

export async function decideRentalBooking(id: number, input: { decision: "accepted" | "refused" | "completed"; keyHandoverNotes?: string; message?: string }): Promise<RentalBooking> {
  return normalizeRentalBooking(await apiFetch<ApiRentalBooking>(`/rental-bookings/${id}/decision`, {
    method: "POST",
    body: JSON.stringify(input),
  }));
}

export async function searchAdminRentals(params: { q?: string; category?: string; available?: string; page?: number; limit?: number }): Promise<PaginatedRentals> {
  const searchParams = toSearchParams({ ...params, scope: "admin" });
  const response = await apiFetch<{ items: ApiRental[]; pagination: PaginationMeta }>(`/rental-search?${searchParams.toString()}`);

  return {
    items: response.items.map(normalizeRental),
    pagination: response.pagination,
  };
}

export async function getTenants(): Promise<Tenant[]> {
  const tenants = await apiFetch<ApiCollection<ApiTenant>>("/tenants");
  return apiItems(tenants).map(normalizeTenant);
}

export async function searchTenants(params: { q?: string; status?: Tenant["status"] | "all"; page?: number; limit?: number }): Promise<PaginatedTenants> {
  const searchParams = toSearchParams({ ...params, status: params.status === "all" ? undefined : params.status });
  const response = await apiFetch<{ items: ApiTenant[]; pagination: PaginationMeta }>(`/tenant-search?${searchParams.toString()}`);

  return {
    items: response.items.map(normalizeTenant),
    pagination: response.pagination,
  };
}

export async function updateTenant(id: string, input: TenantInput): Promise<Tenant> {
  return normalizeTenant(await apiFetch<ApiTenant>(`/tenants/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify(input),
  }));
}

export async function getBonsPlans(): Promise<BonPlan[]> {
  const plans = await apiFetch<ApiCollection<ApiBonPlan>>("/bon_plans");
  return apiItems(plans).map(normalizeBonPlan);
}

export async function searchBonsPlans(params: { q?: string; category?: string; page?: number; limit?: number }): Promise<PaginatedBonPlans> {
  const searchParams = toSearchParams(params);
  const response = await apiFetch<{ items: ApiBonPlan[]; pagination: PaginationMeta }>(`/bon-plan-search?${searchParams.toString()}`);

  return {
    items: response.items.map(normalizeBonPlan),
    pagination: response.pagination,
  };
}

export async function getBonPlan(id: string): Promise<BonPlan> {
  return normalizeBonPlan(await apiFetch<ApiBonPlan>(`/bon_plans/${id}`));
}

export async function createBooking(payload: BookingPayload): Promise<{ id: number }> {
  return apiFetch<{ id: number }>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getBookings(): Promise<Booking[]> {
  return apiItems(await apiFetch<ApiCollection<Booking>>("/bookings"));
}

export async function downloadBookingDocument(id: number, kind: BookingDocumentKind): Promise<Blob> {
  const response = await fetch(`${API_URL}/bookings/${id}/documents/${encodeURIComponent(kind)}`, {
    headers: {
      Accept: "application/pdf",
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Document request failed: ${response.status} ${response.statusText}`);
  }

  return response.blob();
}

export async function sendBookingDocumentEmail(id: number, kind: BookingDocumentKind): Promise<{ message: string; email: string; document: string }> {
  return apiFetch(`/bookings/${id}/emails/${encodeURIComponent(kind)}`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function searchBookings(params: { q?: string; type?: "tour" | "driver"; page?: number; limit?: number }): Promise<PaginatedBookings> {
  const searchParams = toSearchParams(params);
  return apiFetch<PaginatedBookings>(`/booking-search?${searchParams.toString()}`);
}

export async function updateBooking(id: number, payload: BookingInput): Promise<Booking> {
  return apiFetch<Booking>(`/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify(payload),
  });
}

export async function notifyBookingUpdate(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/bookings/${id}/notify-update`, { method: "POST" });
}

export async function validateDriverBookingQr(input: { bookingId: number; sessionToken: string; qrCodeToken: string; day?: number }): Promise<{ id: number; status: string; providerStatus: string; paymentStatus: string; completedAt: string | null; guideCompletedDays?: number[]; message: string }> {
  return apiFetch(`/client-bookings/${input.bookingId}/validate-qr`, {
    method: "POST",
    body: JSON.stringify({ sessionToken: input.sessionToken, qrCodeToken: input.qrCodeToken, day: input.day }),
  });
}

export async function deleteBooking(id: number): Promise<void> {
  await apiFetchOptional(`/bookings/${id}`, { method: "DELETE" });
}

export async function createImageAsset(input: { alt: string; url: string }): Promise<ImageAsset> {
  return apiFetch<ImageAsset>("/image_assets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function uploadImageAsset(input: { file: File; alt: string }): Promise<ImageAsset> {
  const formData = new FormData();
  formData.append("image", input.file);
  formData.append("alt", input.alt);

  const response = await fetch(`${API_URL}/image-upload`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Image upload failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<ImageAsset>;
}


export async function createTour(input: TourInput): Promise<Tour> {
  return normalizeTour(await apiFetch<ApiTour>("/tours", {
    method: "POST",
    body: JSON.stringify(input),
  }));
}

export async function updateTour(id: string, input: TourInput): Promise<Tour> {
  return normalizeTour(await apiFetch<ApiTour>(`/tours/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify(input),
  }));
}

export async function deleteTour(id: string): Promise<void> {
  await apiFetchOptional(`/tours/${id}`, { method: "DELETE" });
}

export async function createGuide(input: GuideInput): Promise<Guide> {
  return normalizeGuide(await apiFetch<ApiGuide>("/guides", {
    method: "POST",
    body: JSON.stringify(input),
  }));
}

export async function updateGuide(id: string, input: GuideInput): Promise<Guide> {
  return normalizeGuide(await apiFetch<ApiGuide>(`/guides/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify(input),
  }));
}

export async function deleteGuide(id: string): Promise<void> {
  await apiFetchOptional(`/guides/${id}`, { method: "DELETE" });
}

export async function createDriver(input: DriverInput): Promise<Driver> {
  return normalizeDriver(await apiFetch<ApiDriver>("/drivers", {
    method: "POST",
    body: JSON.stringify(input),
  }));
}

export async function updateDriver(id: string, input: DriverInput): Promise<Driver> {
  return normalizeDriver(await apiFetch<ApiDriver>(`/drivers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify(input),
  }));
}

export async function deleteDriver(id: string): Promise<void> {
  await apiFetchOptional(`/drivers/${id}`, { method: "DELETE" });
}

export async function createBonPlan(input: BonPlanInput): Promise<BonPlan> {
  return normalizeBonPlan(await apiFetch<ApiBonPlan>("/bon_plans", {
    method: "POST",
    body: JSON.stringify(input),
  }));
}

export async function updateBonPlan(id: string, input: BonPlanInput): Promise<BonPlan> {
  return normalizeBonPlan(await apiFetch<ApiBonPlan>(`/bon_plans/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify(input),
  }));
}

export async function deleteBonPlan(id: string): Promise<void> {
  await apiFetchOptional(`/bon_plans/${id}`, { method: "DELETE" });
}

export async function getLegalPages(): Promise<LegalPage[]> {
  const pages = await apiFetch<ApiCollection<ApiLegalPage>>("/legal_pages");
  return apiItems(pages).map(normalizeLegalPage);
}

export async function searchLegalPages(params: { q?: string; page?: number; limit?: number }): Promise<PaginatedLegalPages> {
  const searchParams = toSearchParams(params);
  const response = await apiFetch<{ items: ApiLegalPage[]; pagination: PaginationMeta }>(`/legal-page-search?${searchParams.toString()}`);

  return {
    items: response.items.map(normalizeLegalPage),
    pagination: response.pagination,
  };
}

export async function getLegalPageBySlug(slug: string): Promise<LegalPage | null> {
  const pages = await getLegalPages();
  return pages.find((page) => page.slug === slug) ?? null;
}

export async function createLegalPage(input: LegalPageInput): Promise<LegalPage> {
  return normalizeLegalPage(await apiFetch<ApiLegalPage>("/legal_pages", {
    method: "POST",
    body: JSON.stringify(input),
  }));
}

export async function updateLegalPage(id: string, input: LegalPageInput): Promise<LegalPage> {
  return normalizeLegalPage(await apiFetch<ApiLegalPage>(`/legal_pages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify(input),
  }));
}

export async function deleteLegalPage(id: string): Promise<void> {
  await apiFetchOptional(`/legal_pages/${id}`, { method: "DELETE" });
}

function normalizeAdminClientProfile(client: ApiAdminClientProfile): AdminClientProfile {
  return { ...client, id: String(client.id) };
}

export async function getAdminClientProfiles(): Promise<AdminClientProfile[]> {
  const clients = await apiFetch<ApiCollection<ApiAdminClientProfile>>("/admin_client_profiles");
  return apiItems(clients).map(normalizeAdminClientProfile);
}

export async function searchAdminClientProfiles(params: { q?: string; page?: number; limit?: number }): Promise<PaginatedAdminClientProfiles> {
  const searchParams = toSearchParams(params);
  const response = await apiFetch<{ items: ApiAdminClientProfile[]; pagination: PaginationMeta }>(`/admin-client-profile-search?${searchParams.toString()}`);

  return {
    items: response.items.map(normalizeAdminClientProfile),
    pagination: response.pagination,
  };
}

export async function createAdminClientProfile(input: AdminClientProfileInput): Promise<AdminClientProfile> {
  return normalizeAdminClientProfile(await apiFetch<ApiAdminClientProfile>("/admin_client_profiles", {
    method: "POST",
    body: JSON.stringify(input),
  }));
}

export async function updateAdminClientProfile(id: string, input: AdminClientProfileInput): Promise<AdminClientProfile> {
  return normalizeAdminClientProfile(await apiFetch<ApiAdminClientProfile>(`/admin_client_profiles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify(input),
  }));
}

export async function getClientAccounts(): Promise<ClientAccount[]> {
  return apiFetch<ClientAccount[]>("/admin/client-accounts");
}

export async function registerClientAccount(input: { firstName: string; lastName: string; email: string; phonePrefix: string; phone: string; password: string; marketing: boolean }): Promise<{ message: string; email: string }> {
  return publicApiFetch("/client-auth/register", { method: "POST", body: JSON.stringify(input) });
}

export async function requestClientLoginCode(input: { email: string; password: string }): Promise<{ message: string; email: string; verified: boolean }> {
  return publicApiFetch("/client-auth/request-login-code", { method: "POST", body: JSON.stringify(input) });
}

export async function verifyClientCode(input: { email: string; code: string }): Promise<{ sessionToken: string; client: ClientAccount }> {
  return publicApiFetch("/client-auth/verify-code", { method: "POST", body: JSON.stringify(input) });
}

export async function getClientSession(input: { sessionToken: string }): Promise<{ client: ClientAccount }> {
  return publicApiFetch("/client-auth/session", { method: "POST", body: JSON.stringify(input) });
}

export async function updateClientProfile(input: { sessionToken: string; firstName: string; lastName: string; phonePrefix: string; phone: string }): Promise<{ client: ClientAccount }> {
  return publicApiFetch("/client-auth/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify(input),
  });
}

export async function getAdminSession(input: { sessionToken: string }): Promise<{ email: string }> {
  return publicApiFetch("/admin-auth/session", { method: "POST", body: JSON.stringify(input) });
}

export async function getChatMessages(pagePath: string): Promise<PageChatMessage[]> {
  return apiItems(await apiFetch<ApiCollection<PageChatMessage>>(`/page_chat_messages?pagePath=${encodeURIComponent(pagePath)}`));
}

export async function createChatMessage(input: PageChatMessage): Promise<PageChatMessage> {
  return apiFetch<PageChatMessage>("/page_chat_messages", { method: "POST", body: JSON.stringify(input) });
}

export async function askOrita(input: { pagePath: string; pageLabel: string; message: string; history: { role: "assistant" | "user"; text: string }[] }): Promise<AiChatResponse> {
  return apiFetch<AiChatResponse>("/ai-chat", { method: "POST", body: JSON.stringify(input) });
}

export async function getAiConfiguration(): Promise<AiConfiguration> {
  return apiFetch<AiConfiguration>("/ai-configuration");
}

export async function updateAiConfiguration(input: AiConfigurationInput): Promise<AiConfiguration> {
  return apiFetch<AiConfiguration>("/ai-configuration", {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify(input),
  });
}

export async function createCookieConsent(input: { choice: "accepted" | "declined"; visitorKey: string }): Promise<{ id: number }> {
  return apiFetch("/cookie_consent_records", { method: "POST", body: JSON.stringify(input) });
}

export async function getContactRequests(): Promise<ContactRequest[]> {
  return apiItems(await apiFetch<ApiCollection<ContactRequest>>("/contact_requests"));
}

export async function searchContactRequests(params: { queue?: "active" | "archived"; q?: string; page?: number; limit?: number }): Promise<PaginatedContactRequests> {
  const searchParams = toSearchParams(params);

  return apiFetch<PaginatedContactRequests>(`/contact-request-search?${searchParams.toString()}`);
}

function toSearchParams(params: Record<string, string | number | boolean | undefined>): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}

export async function getContactRequestsForEmail(email: string): Promise<ContactRequest[]> {
  const requests = await getContactRequests();
  return requests.filter((request) => request.email.toLowerCase() === email.toLowerCase());
}

export async function createContactRequest(input: ContactRequestInput): Promise<ContactRequest> {
  return apiFetch<ContactRequest>("/contact_requests", { method: "POST", body: JSON.stringify(input) });
}

export async function updateContactRequest(id: number, input: Partial<ContactRequestInput>): Promise<ContactRequest> {
  return apiFetch<ContactRequest>(`/contact_requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify(input),
  });
}

export async function replyToContactRequest(id: number, reply: string): Promise<{ message: string; status: string }> {
  return apiFetch(`/contact-requests/${id}/reply`, {
    method: "POST",
    body: JSON.stringify({ reply }),
  });
}

export async function getContactConfigurations(): Promise<ContactConfiguration[]> {
  return apiItems(await apiFetch<ApiCollection<ContactConfiguration>>("/contact_configurations"));
}

export async function getContactConfiguration(): Promise<ContactConfiguration | null> {
  const configurations = await getContactConfigurations();
  return configurations[0] ?? null;
}

export async function createContactConfiguration(input: ContactConfigurationInput): Promise<ContactConfiguration> {
  return apiFetch<ContactConfiguration>("/contact_configurations", { method: "POST", body: JSON.stringify(input) });
}

export async function updateContactConfiguration(id: number, input: ContactConfigurationInput): Promise<ContactConfiguration> {
  return apiFetch<ContactConfiguration>(`/contact_configurations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify(input),
  });
}

export async function getHomepageConfiguration(): Promise<HomepageConfiguration> {
  return apiFetch<HomepageConfiguration>("/homepage-configuration");
}

export async function updateHomepageConfiguration(input: HomepageConfigurationInput): Promise<HomepageConfiguration> {
  return apiFetch<HomepageConfiguration>("/homepage-configuration", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function getPageHeroConfiguration(pageKey: string): Promise<PageHeroConfiguration> {
  return apiFetch<PageHeroConfiguration>(`/page-heroes/${encodeURIComponent(pageKey)}`);
}

export async function updatePageHeroConfiguration(pageKey: string, input: PageHeroConfigurationInput): Promise<PageHeroConfiguration> {
  return apiFetch<PageHeroConfiguration>(`/page-heroes/${encodeURIComponent(pageKey)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function createStripeCheckout(input: {
  name: string;
  amountEur: number;
  successUrl: string;
  cancelUrl: string;
  bookingId?: number;
  rentalBookingId?: number;
  type?: "tour" | "driver" | "rental";
  customerEmail?: string;
}): Promise<{ mode: "demo" | "stripe"; url: string | null; message?: string }> {
  return apiFetch("/stripe/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function requestAdminLoginCode(input: { email: string; password: string }): Promise<{ message: string; email: string }> {
  return publicApiFetch("/admin-auth/request-code", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyAdminLoginCode(input: { email: string; code: string }): Promise<{ sessionToken: string; email: string }> {
  return publicApiFetch("/admin-auth/verify-code", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

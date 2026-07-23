import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Parcours } from "./pages/Parcours";
import { ParcoursDetail } from "./pages/ParcoursDetail";
import { ReservationParcours } from "./pages/ReservationParcours";
import { Chauffeurs } from "./pages/Chauffeurs";
import { ReservationChauffeur } from "./pages/ReservationChauffeur";
import { Location, LocationDetail } from "./pages/Location";
import { BonsPlans } from "./pages/BonsPlans";
import { BonPlanDetail } from "./pages/BonPlanDetail";
import { Contact } from "./pages/Contact";
import { LegalPage } from "./pages/LegalPage";
import { Admin } from "./pages/Admin";
import { ClientSpace } from "./pages/ClientSpace";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "parcours", Component: Parcours },
      { path: "parcours/:id", Component: ParcoursDetail },
      { path: "parcours/:id/reserver", Component: ReservationParcours },
      { path: "chauffeurs", Component: Chauffeurs },
      { path: "chauffeurs/reserver", Component: ReservationChauffeur },
      { path: "location", Component: Location },
      { path: "location/:id", Component: LocationDetail },
      { path: "bons-plans", Component: BonsPlans },
      { path: "bons-plans/:id", Component: BonPlanDetail },
      { path: "contact", Component: Contact },
      { path: "mentions-legales", Component: LegalPage },
      { path: "conditions-generales", Component: LegalPage },
      { path: "confidentialite", Component: LegalPage },
      { path: "mon-espace", Component: ClientSpace },
      { path: "mon-espace/inscription", Component: ClientSpace },
      { path: "mon-espace/mot-de-passe-oublie", Component: ClientSpace },
      { path: "mon-espace/suivi", Component: ClientSpace },
      { path: "mon-espace/reservations", Component: ClientSpace },
      { path: "mon-espace/reservations/:bookingId", Component: ClientSpace },
      { path: "mon-espace/parcours", Component: ClientSpace },
      { path: "mon-espace/chauffeurs", Component: ClientSpace },
      { path: "mon-espace/locations", Component: ClientSpace },
      { path: "mon-espace/documents", Component: ClientSpace },
      { path: "mon-espace/messages", Component: ClientSpace },
      { path: "mon-espace/profil", Component: ClientSpace },
      { path: "admin", Component: Admin },
      { path: "admin/clients", Component: Admin },
      { path: "admin/parcours", Component: Admin },
      { path: "admin/guides", Component: Admin },
      { path: "admin/chauffeurs", Component: Admin },
      { path: "admin/location", Component: Admin },
      { path: "admin/proprietaires", Component: Admin },
      { path: "admin/bons-plans", Component: Admin },
      { path: "admin/reservations", Component: Admin },
      { path: "admin/reservations-chauffeurs", Component: Admin },
      { path: "admin/messages", Component: Admin },
      { path: "admin/configuration-ia", Component: Admin },
      { path: "admin/pages-legales", Component: Admin },
      { path: "admin/parametres", Component: Admin },
      { path: "*", Component: NotFound },
    ],
  },
]);

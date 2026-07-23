import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { ContactConfiguration, getContactConfiguration, getLegalPages, LegalPage } from "../lib/api";

const fallbackContact: ContactConfiguration = {
  address: "Quartier Haie Vive",
  cityCountry: "Cotonou, Bénin",
  phone: "+229 97 12 34 56",
  whatsapp: "+229 97 12 34 56",
  email: "contact@benintours.com",
  addresses: [{ label: "Adresse principale", address: "Quartier Haie Vive", cityCountry: "Cotonou, Bénin" }],
  phones: [{ label: "Standard", number: "+229 97 12 34 56", whatsapp: "+229 97 12 34 56" }],
  emails: [{ label: "Contact", email: "contact@benintours.com" }],
  openingHours: [],
  faq: [],
};

const fallbackLegalPages: LegalPage[] = [
  { id: "mentions-legales", slug: "mentions-legales", title: "Mentions légales", content: "", updatedLabel: "" },
  { id: "conditions-generales", slug: "conditions-generales", title: "CGV", content: "", updatedLabel: "" },
  { id: "confidentialite", slug: "confidentialite", title: "Confidentialité", content: "", updatedLabel: "" },
];

export function Footer() {
  const [contact, setContact] = useState<ContactConfiguration>(fallbackContact);
  const [legalPages, setLegalPages] = useState<LegalPage[]>(fallbackLegalPages);

  useEffect(() => {
    Promise.all([getContactConfiguration(), getLegalPages()])
      .then(([loadedContact, loadedLegalPages]) => {
        if (loadedContact) {
          setContact(loadedContact);
        }
        if (loadedLegalPages.length > 0) {
          setLegalPages(loadedLegalPages);
        }
      })
      .catch(() => undefined);
  }, []);

  const addresses = contact.addresses?.length
    ? contact.addresses
    : [{ label: "Adresse principale", address: contact.address, cityCountry: contact.cityCountry }];
  const phones = contact.phones?.length
    ? contact.phones
    : [{ label: "Standard", number: contact.phone, whatsapp: contact.whatsapp }];
  const emails = contact.emails?.length
    ? contact.emails
    : [{ label: "Contact", email: contact.email }];

  return (
    <footer className="mt-auto bg-stone-950 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_0.9fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <BrandLogo invert className="h-12 w-44" />
            </div>
            <p className="max-w-sm text-sm leading-6 text-stone-400">
              Parcours touristiques, chauffeurs privés et bonnes adresses locales pour préparer un séjour clair, confortable et accompagné.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-stone-300">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Paiement sécurisé et confirmation suivie
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/parcours" className="text-sm transition-colors hover:text-emerald-300">
                  Nos parcours
                </Link>
              </li>
              <li>
                <Link to="/chauffeurs" className="text-sm transition-colors hover:text-emerald-300">
                  Chauffeurs
                </Link>
              </li>
              <li>
                <Link to="/location" className="text-sm transition-colors hover:text-emerald-300">
                  Location
                </Link>
              </li>
              <li>
                <Link to="/bons-plans" className="text-sm transition-colors hover:text-emerald-300">
                  Bons plans
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm transition-colors hover:text-emerald-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Pages légales</h3>
            <ul className="space-y-2">
              {legalPages.map((page) => (
                <li key={page.slug}>
                  <Link to={`/${page.slug}`} className="text-sm transition-colors hover:text-[#d6a02a]">
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Contact</h3>
            <ul className="space-y-3">
              {addresses.map((item, index) => (
                <li key={`address-${index}`} className="flex items-start gap-3 text-sm">
                  <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-[#d6a02a]" />
                  <span>{item.address}, {item.cityCountry}</span>
                </li>
              ))}
              {phones.map((item, index) => (
                <li key={`phone-${index}`} className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 flex-shrink-0 text-[#d6a02a]" />
                  <a href={`tel:${item.number.replace(/\s/g, "")}`} className="transition-colors hover:text-[#d6a02a]">
                    {item.number}
                  </a>
                </li>
              ))}
              {emails.map((item, index) => (
                <li key={`email-${index}`} className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 flex-shrink-0 text-[#d6a02a]" />
                  <a href={`mailto:${item.email}`} className="transition-colors hover:text-[#d6a02a]">
                    {item.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
            <p>&copy; 2026 ORITA. Tous droits réservés.</p>
            <div className="flex flex-wrap justify-center gap-4">
              {legalPages.slice(0, 4).map((page) => (
                <Link key={page.slug} to={`/${page.slug}`} className="transition-colors hover:text-[#d6a02a]">
                  {page.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

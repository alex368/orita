import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { ContactConfiguration, createContactRequest, getContactConfiguration, getPageHeroConfiguration, PageHeroConfiguration } from "../lib/api";

const defaultContactConfiguration: ContactConfiguration = {
  address: "Quartier Haie Vive",
  cityCountry: "Cotonou, Bénin",
  phone: "+229 97 12 34 56",
  whatsapp: "+229 97 12 34 56",
  email: "contact@benintours.com",
  addresses: [{ label: "Adresse principale", address: "Quartier Haie Vive", cityCountry: "Cotonou, Bénin" }],
  phones: [{ label: "Standard", number: "+229 97 12 34 56", whatsapp: "+229 97 12 34 56" }],
  emails: [{ label: "Contact", email: "contact@benintours.com" }],
  openingHours: [
    { label: "Lundi - Vendredi", value: "8h - 18h" },
    { label: "Samedi", value: "9h - 14h" },
    { label: "Dimanche", value: "Fermé" },
  ],
  faq: [
    { question: "Comment réserver un parcours ?", answer: "Parcourez nos offres, choisissez votre parcours, sélectionnez la date et la durée, puis payez en ligne de manière sécurisée." },
    { question: "Puis-je annuler ma réservation ?", answer: "Oui, consultez nos conditions générales pour connaître la politique d'annulation selon le délai avant le départ." },
    { question: "Quels moyens de paiement acceptez-vous ?", answer: "Nous acceptons les cartes bancaires internationales et les paiements via Mobile Money pour plus de flexibilité." },
    { question: "Les chauffeurs parlent-ils français ?", answer: "Oui, tous nos chauffeurs parlent français. Certains parlent également anglais et les langues locales." },
  ],
};

const defaultContactHeroConfiguration: PageHeroConfiguration = {
  pageKey: "contact",
  eyebrow: "Contact",
  title: "Préparer votre séjour",
  subtitle: "Une question ? Besoin d’aide pour organiser votre séjour ? Notre équipe est à votre écoute.",
  image: {
    id: 0,
    alt: "Accueil touristique au Bénin",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  },
};

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [configuration, setConfiguration] = useState<ContactConfiguration>(defaultContactConfiguration);
  const [heroConfiguration, setHeroConfiguration] = useState<PageHeroConfiguration>(defaultContactHeroConfiguration);

  useEffect(() => {
    Promise.all([
      getContactConfiguration(),
      getPageHeroConfiguration("contact"),
    ])
      .then(([loadedConfiguration, loadedHeroConfiguration]) => {
        if (loadedConfiguration) {
          setConfiguration(loadedConfiguration);
        }
        setHeroConfiguration(loadedHeroConfiguration);
      })
      .catch(() => undefined);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !subject || !message) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsSubmitting(true);

    try {
      await createContactRequest({
        name,
        email,
        phone: "",
        subject,
        message,
        status: "nouveau",
        internalNote: "",
      });
      toast.success("Message envoyé avec succès !", {
        description: "Nous vous répondrons dans les plus brefs délais."
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Impossible d'envoyer le message", {
        description: "Vérifiez la connexion à l'API puis réessayez."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addresses = configuration.addresses?.length
    ? configuration.addresses
    : [{ label: "Adresse principale", address: configuration.address, cityCountry: configuration.cityCountry }];
  const phones = configuration.phones?.length
    ? configuration.phones
    : [{ label: "Standard", number: configuration.phone, whatsapp: configuration.whatsapp }];
  const emails = configuration.emails?.length
    ? configuration.emails
    : [{ label: "Contact", email: configuration.email }];

  return (
    <div className="bg-[#fbfaf7]">
      <section
        className="relative overflow-hidden bg-stone-950 bg-cover bg-center py-20 text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.9), rgba(15,23,42,0.66) 58%, rgba(15,23,42,0.35)), url('${heroConfiguration.image?.url || defaultContactHeroConfiguration.image?.url}')`,
        }}
      >
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#d6a02a]">{heroConfiguration.eyebrow}</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">{heroConfiguration.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-100">
            {heroConfiguration.subtitle}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <Card className="rounded-md border-stone-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <h2 className="mb-5 text-xl font-semibold text-stone-950">Nos coordonnées</h2>
                
                <div className="space-y-4">
                  {addresses.map((item, index) => (
                    <div key={`address-${index}`} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50">
                        <MapPin className="h-5 w-5 text-emerald-800" />
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-stone-600">
                          {item.address}<br />
                          {item.cityCountry}
                        </p>
                      </div>
                    </div>
                  ))}

                  {phones.map((item, index) => (
                    <div key={`phone-${index}`} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50">
                        <Phone className="h-5 w-5 text-emerald-800" />
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <a
                          href={`tel:${item.number.replace(/\s/g, "")}`}
                          className="text-sm text-emerald-600 hover:underline"
                        >
                          {item.number}
                        </a>
                        {item.whatsapp && (
                          <p className="mt-1 text-xs text-gray-500">
                            WhatsApp : {item.whatsapp}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {emails.map((item, index) => (
                    <div key={`email-${index}`} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50">
                        <Mail className="h-5 w-5 text-emerald-800" />
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <a
                          href={`mailto:${item.email}`}
                          className="text-sm text-emerald-600 hover:underline"
                        >
                          {item.email}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-md border-emerald-100 bg-emerald-50">
              <CardContent className="p-6">
                <h3 className="mb-3 font-semibold">Horaires d'ouverture</h3>
                <div className="space-y-1 text-sm">
                  {configuration.openingHours.map((item) => (
                    <p key={`${item.label}-${item.value}`} className="flex justify-between gap-4">
                      <span className="text-stone-600">{item.label}</span>
                      <span className="text-right font-medium">{item.value}</span>
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="rounded-md border-stone-200 bg-white shadow-sm">
              <CardContent className="p-6 md:p-8">
                <h2 className="mb-6 text-2xl font-semibold text-stone-950">Envoyez-nous un message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jean.dupont@email.com"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Demande d'information sur un parcours"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Décrivez votre demande en détail..."
                      rows={6}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full rounded-md bg-emerald-900 text-white hover:bg-emerald-800 md:w-auto"
                    disabled={isSubmitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="mb-8 text-center text-2xl font-semibold text-stone-950">Questions fréquentes</h2>
          <Accordion type="single" collapsible className="mx-auto grid max-w-4xl grid-cols-1 gap-3">
            {configuration.faq.map((item, index) => (
              <AccordionItem key={`${item.question}-${index}`} value={`faq-${index}`} className="rounded-md border border-stone-200 bg-white px-5 shadow-sm">
                <AccordionTrigger className="text-left text-base font-semibold text-stone-950 hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-6 text-stone-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Cookie, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { createCookieConsent } from "../lib/api";

const COOKIE_KEY = "benintours-cookie-consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

type ConsentChoice = "accepted" | "declined";

function persistConsent(choice: ConsentChoice) {
  try {
    document.cookie = `${COOKIE_KEY}=${choice}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
  } catch {
    // Keep the UI usable even when cookies are blocked.
  }
}

function hasStoredConsent() {
  try {
    return document.cookie
      .split(";")
      .some((cookie) => cookie.trim().startsWith(`${COOKIE_KEY}=`));
  } catch {
    return false;
  }
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!hasStoredConsent());
  }, []);

  const handleChoice = (choice: ConsentChoice) => {
    persistConsent(choice);
    createCookieConsent({ choice, visitorKey: getVisitorKey() }).catch(() => undefined);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-5xl rounded-md border border-stone-200 bg-white p-4 shadow-2xl md:p-5">
      <div className="grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-900">
          <Cookie className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-stone-950">Gestion des cookies</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Nous utilisons des cookies pour mémoriser vos préférences, améliorer la navigation et mesurer l’utilisation du site.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
          <Button type="button" variant="outline" className="rounded-md" onClick={() => handleChoice("declined")}>
            Refuser
          </Button>
          <Button type="button" className="rounded-md bg-emerald-900 text-white hover:bg-emerald-800" onClick={() => handleChoice("accepted")}>
            <Settings className="h-4 w-4" />
            Accepter
          </Button>
        </div>
      </div>
    </section>
  );
}

function getVisitorKey() {
  const existing = document.cookie.split(";").map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith("benintours_visitor="))?.split("=")[1];
  if (existing) return existing;
  const next = crypto.randomUUID();
  document.cookie = `benintours_visitor=${next}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
  return next;
}

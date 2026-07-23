import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { askOrita } from "../lib/api";

interface ChatMessage {
  role: "assistant" | "user";
  text: string;
}

const pageLabels: Record<string, string> = {
  "/": "accueil",
  "/parcours": "parcours",
  "/chauffeurs": "chauffeurs",
  "/bons-plans": "bons plans",
  "/contact": "contact",
  "/admin": "admin",
  "/reservation/chauffeur": "réservation chauffeur",
  "/mentions-legales": "mentions légales",
  "/conditions-generales": "conditions générales",
  "/confidentialite": "confidentialité",
};

function getPageLabel(pathname: string): string {
  if (pathname.includes("/reserver")) {
    return "réservation parcours";
  }

  return pageLabels[pathname] ?? (pathname.replace("/", "") || "page");
}

export function PageChat() {
  const { pathname } = useLocation();
  const pageLabel = getPageLabel(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const initialMessage = useMemo<ChatMessage>(() => ({
    role: "assistant",
    text: `Bonjour, je suis Orita. Je peux vous aider sur la page ${pageLabel}.`,
  }), [pageLabel]);

  useEffect(() => {
    setMessages([initialMessage]);
    setInput("");
    setIsThinking(false);
  }, [initialMessage, pathname]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const text = input.trim();
    if (!text) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setIsThinking(true);

    try {
      const response = await askOrita({
        pagePath: pathname,
        pageLabel,
        message: text,
        history: messages,
      });
      const answer: ChatMessage = { role: "assistant", text: response.answer };
      setMessages((current) => [...current, answer]);
    } catch {
      const answer: ChatMessage = {
        role: "assistant",
        text: "Je suis Orita. Le service IA local ne répond pas pour le moment, mais votre message est bien pris en compte.",
      };
      setMessages((current) => [...current, answer]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <section className="mb-3 flex h-[420px] w-[min(360px,calc(100vw-40px))] flex-col rounded-md border border-stone-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-stone-950">Orita</p>
              <p className="text-xs text-stone-500">Contexte séparé par page</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Fermer le chat">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[86%] rounded-md px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-emerald-900 text-white"
                    : "bg-stone-100 text-stone-800"
                }`}
              >
                {message.text}
              </div>
            ))}
            {isThinking && (
              <div className="max-w-[86%] rounded-md bg-stone-100 px-3 py-2 text-sm text-stone-600">
                Orita prépare une réponse...
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-stone-200 p-3">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Votre message"
              className="h-10"
            />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-md bg-[#d6a02a] text-black hover:bg-[#c08f24]" aria-label="Envoyer le message">
              <Send className="h-5 w-5" aria-hidden="true" />
            </Button>
          </form>
        </section>
      )}

      <Button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="h-12 w-12 rounded-full bg-[#d6a02a] text-black shadow-xl hover:bg-[#c08f24]"
        aria-label="Ouvrir Orita"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    </div>
  );
}

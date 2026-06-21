import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Send, Sparkles, RotateCw } from "lucide-react";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const API_URL = import.meta.env.VITE_API_URL || "";

const SUGGESTIONS = {
  fr: [
    "Quelque chose de végé ?",
    "Vous recommandez quoi ?",
    "Vous êtes ouverts ce soir ?",
  ],
  en: [
    "Something vegetarian?",
    "What do you recommend?",
    "Are you open tonight?",
  ],
};

const GREETING = {
  fr: "Salut ! 👋 Dites-moi ce que vous avez envie de manger — épicé, végé, petit budget — et je vous conseille un plat du menu.",
  en: "Hi! 👋 Tell me what you're craving — spicy, veggie, budget-friendly — and I'll recommend a dish.",
};

export default function ChatPanel({ open, onClose }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("en") ? "en" : "fr";

  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING[lang] }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // auto-grow the textarea up to a max height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    setErrored(false);
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setErrored(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            lang === "en"
              ? "Sorry, I can't respond right now. Please try again in a moment."
              : "Désolé, je n'arrive pas à répondre pour le moment. Réessayez dans un instant.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const retryLast = () => {
    // remove the last error message and the user message before it, then resend
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    setMessages((prev) => prev.filter((m) => !m.isError));
    sendMessage(lastUserMsg.content);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showSuggestions = messages.length === 1; // only before the user has sent anything

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-[80vh] sm:h-[560px] bg-char-soft z-50 shadow-2xl rounded-t-2xl sm:rounded-2xl transition-transform duration-300 flex flex-col ${
          open ? "translate-y-0" : "translate-y-full sm:translate-y-[110%]"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream/10">
          <div className="flex items-center gap-2">
            <Sparkles size={17} className="text-marigold" />
            <h2 className="font-display text-lg font-semibold text-cream">
              {lang === "en" ? "Menu advisor" : "Conseiller du menu"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream/10"
            aria-label="Fermer l'assistant"
          >
            <X size={18} className="text-cream" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-snug ${
                m.role === "user"
                  ? "ml-auto bg-marigold text-char rounded-br-sm"
                  : m.isError
                  ? "bg-chili/15 text-mute border border-chili/30 rounded-bl-sm"
                  : "bg-char text-mute rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          ))}

          {loading && (
            <div className="bg-char text-mute/60 max-w-[60%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-sm">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-mute/50 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-mute/50 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-mute/50 animate-bounce" />
              </span>
            </div>
          )}

          {errored && !loading && (
            <button
              onClick={retryLast}
              className="flex items-center gap-1.5 text-xs text-marigold hover:text-marigold-light"
            >
              <RotateCw size={12} /> {lang === "en" ? "Try again" : "Réessayer"}
            </button>
          )}

          {showSuggestions && !loading && (
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTIONS[lang].map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-char hover:bg-char/70 text-mute border border-cream/10 rounded-full px-3 py-1.5 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-cream/10 p-3 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              lang === "en"
                ? "E.g. I'd like something vegetarian and cheap"
                : "Ex: je voudrais quelque chose de végé et pas cher"
            }
            className="flex-1 resize-none bg-char rounded-xl px-3 py-2.5 text-sm text-cream placeholder:text-mute/40 focus:outline-none focus:ring-2 focus:ring-marigold/50 max-h-[120px]"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 shrink-0 rounded-full bg-chili hover:bg-chili-dark disabled:bg-cream/10 disabled:text-mute/30 text-cream flex items-center justify-center transition active:scale-95"
            aria-label="Envoyer"
          >
            <Send size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
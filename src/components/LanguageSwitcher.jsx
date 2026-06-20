import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const switchTo = (lng) => {
    i18n.changeLanguage(lng); // persists to localStorage via the language detector cache
  };

  return (
    <div className="flex items-center bg-char-soft rounded-full p-1 text-xs font-semibold">
      <button
        onClick={() => switchTo("fr")}
        className={`px-2.5 py-1 rounded-full transition ${
          i18n.language === "fr" ? "bg-marigold text-char" : "text-mute hover:text-cream"
        }`}
      >
        FR
      </button>
      <button
        onClick={() => switchTo("en")}
        className={`px-2.5 py-1 rounded-full transition ${
          i18n.language === "en" ? "bg-marigold text-char" : "text-mute hover:text-cream"
        }`}
      >
        EN
      </button>
    </div>
  );
}
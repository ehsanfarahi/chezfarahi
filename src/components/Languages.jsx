import { useTranslation } from "react-i18next";

export default function Languages({ language, dispatch }) {
    return <div className="flex items-center gap-2 mr-3">
    <Language language={language} dispatch={dispatch}>FR</Language>
    <span>|</span>
    <Language language={language} dispatch={dispatch}>EN</Language>
    </div>
}

function Language({children, language, dispatch}) {
    const { i18n } = useTranslation();

    function handleLanguage() {
        const code = children === "FR" ? "fr" : "en";
        i18n.changeLanguage(code); // persists to localStorage via the language detector cache
        dispatch({ type: "lang/language", payload: children });
    }

    return <p onClick={handleLanguage} className={`hover:text-marigold cursor-pointer ${language === children ? "text-marigold" : "text-cream/50"
    }`} >{children}</p>
} 
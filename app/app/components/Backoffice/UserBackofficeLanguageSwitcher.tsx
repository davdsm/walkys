import { useLanguage, type Language } from "~/contexts";

export function UserBackofficeLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const langs: { code: Language; label: string }[] = [
    { code: "pt", label: "PT" },
    { code: "en", label: "EN" },
  ];
  return (
    <div
      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white p-0.5 shadow-sm"
      role="group"
      aria-label="Idioma / Language"
    >
      {langs.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setLanguage(lang.code)}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            language === lang.code
              ? "bg-slate-800 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

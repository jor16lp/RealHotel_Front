import React from "react";

export default function LanguageSelector({ lang, setLang, t }) {
  return (
    <div className="language-selector">
      <button
        className={`lang-btn ${lang === "es" ? "active" : ""}`}
        onClick={() => setLang("es")}
        title="Español"
      >
        🇪🇸
      </button>

      <button
        className={`lang-btn ${lang === "en" ? "active" : ""}`}
        onClick={() => setLang("en")}
        title="English"
      >
        🇬🇧
      </button>
    </div>
  );
}

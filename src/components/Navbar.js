import React from "react";
import { Link } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";

function Navbar({ t, user, onLogout, lang, setLang }) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">{t("home")}</Link>
        <Link to="/map">{t("map")}</Link>
        {user && (
          <Link to="/recommendations">{t("recommendations")}</Link>
        )}
      </div>

      <div className="nav-right">
        <LanguageSelector lang={lang} setLang={setLang} t={t} />
        {!user ? (
          <>
            <Link to="/login">{t("login")}</Link>
            <Link to="/register">{t("register")}</Link>
          </>
        ) : (
          <div className="user-info">
            <span>{user.name} {user.surname}</span>
            <button onClick={onLogout} className="btn-link">
              {t("logout")}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

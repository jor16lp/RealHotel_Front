import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HotelInfoModal from "./components/HotelInfoModal";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { translations } from "./utils/translations";
import "./App.css";

function App() {
  const [lang, setLang] = useState("es");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [selectedHotel, setSelectedHotel] = useState(null);
  const t = (key) => translations[lang][key];

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <Router>
      <Navbar t={t} user={user} onLogout={handleLogout} lang={lang} setLang={setLang} />
      <Routes>
        <Route path="/" element={<HomePage t={t} user={user} />} />
        <Route path="/map" element={<MapPage t={t} user={user} />} />
        <Route path="/recommendations" element={<RecommendationsPage t={t} user={user} />} />
        <Route path="/login" element={<LoginPage t={t} onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage t={t} onRegister={handleLogin} />} />
      </Routes>
      {selectedHotel && (
        <HotelInfoModal hotel={selectedHotel} onClose={() => setSelectedHotel(null)} t={t} />
      )}
    </Router>
  );
}

export default App;

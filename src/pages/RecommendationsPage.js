import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getHotelImage } from "../utils/hotelImages";

export default function RecommendationsPage({ t, user }) {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [searchedCity, setSearchedCity] = useState("");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recommendationSystem, setRecommendationSystem] = useState("");

  useEffect(() => {
    if (!user?.email) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      setError("");
      setHotels([]);

      try {
        const res = await fetch(
          `http://localhost:3001/api/recommendations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-email": user.email,
            },
            body: JSON.stringify({
              userEmail: user.email,
              baseHotelName: null,
              city: null,
              limit: 10
            }),
          }
        );

        const data = await res.json();
        // console.log(data)

        if (!res.ok) {
          throw new Error(data.message || "Error al obtener recomendaciones");
        }

        setHotels(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [user?.email]);

  if (!user) { return <Navigate to="/login" />; }

  const fetchAIRecommendations = async () => {
    if (!city.trim()) return;
    setSearchedCity(city);

    setLoading(true);
    setError("");
    setHotels([]);

    try {
      const res = await fetch(
        `http://localhost:3001/api/ai/${user.email}/${city}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user.email,
          },
        }
      );

      const data = await res.json();
      // console.log(data)
      console.log(data.source)

      if (!res.ok) {
        throw new Error(data.message || "Error al obtener recomendaciones");
      }

      setRecommendationSystem(data.source);
      setHotels(data.recommendations);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-page">
      {/* BUSCADOR */}
      <div className="recommendations-search">
        <input
          type="text"
          placeholder={t("city")}
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchAIRecommendations} disabled={loading}>
          {loading ? t("loading") : t("searchRecommendations")}
        </button>
      </div>

      {!loading && hotels.length > 0 && recommendationSystem !== "NO CIUDAD" && (
        <p className="results-count">
          {hotels.length === 1
            ? t("oneRecommendationFound")
            : `${hotels.length} ${t("recommendationsFound")}`}
        </p>
      )}

      {!loading && !error && recommendationSystem === "NO CIUDAD" && (
        <p className="results-count">
          {t("noHotelsFoundInCity")} {searchedCity}
        </p>
      )}

      {error && <p className="error-text">{error}</p>}

      {/* 📊 RESULTADOS */}
      <div className="recommendations-list">
        {hotels.map((hotel) => (
          // <div key={hotel.id} className="recommendation-card">
            
          //   {/* IZQUIERDA */}
          //   <div className="card-main">
          //     <h3>{hotel.name} {"⭐".repeat(hotel.stars)}</h3>

          //     <p className="location">
          //       {hotel.city}, {hotel.community}
          //     </p>

          //     <p className="address">
          //       📍 {hotel.address}
          //     </p>

          //     {hotel.phoneNumber && (
          //       <p className="phone">
          //         📞 {hotel.phoneNumber}
          //       </p>
          //     )}
          //   </div>

          //   {/* DERECHA */}
          //   <div className="card-extra">
          //     <p>
          //       <strong>{t("averagePrice")}:</strong> {hotel.averagePrice} €
          //     </p>

          //     <p>
          //       <strong>{t("capacity")}:</strong> {hotel.capacity}
          //     </p>

          //     {hotel.diningRoomCapacity ? (
          //       <p>
          //         <strong>{t("diningRoomCapacity")}:</strong> {hotel.diningRoomCapacity}
          //       </p>
          //     ) : (
          //       <p className="no-dining">
          //         <strong>{t("noDiningRoom")}</strong>
          //       </p>
          //     )}

          //     <button
          //       className="details-btn"
          //       onClick={() =>
          //         navigate("/map", { state: { hotel } })
          //       }
          //     >
          //       {t("showOnMap")}
          //     </button>
          //   </div>

          // </div>
          <div className="recommendation-card">
            {/* IZQUIERDA */}
            <div className="card-main">
              {/* Imagen del hotel */}
              <img
                src={getHotelImage(hotel.name)}
                alt={hotel.name}
                className="hotel-image"
              />

              <h3>{hotel.name} {"⭐".repeat(hotel.stars)}</h3>

              <p className="location">
                {hotel.city}, {hotel.community}
              </p>

              <p className="address">
                📍 {hotel.address}
              </p>

              {hotel.phoneNumber && (
                <p className="phone">
                  📞 {hotel.phoneNumber}
                </p>
              )}
            </div>

            {/* DERECHA */}
            <div className="card-extra">
              <p>
                <strong>{t("averagePrice")}:</strong> {hotel.averagePrice} €
              </p>

              <p>
                <strong>{t("capacity")}:</strong> {hotel.capacity}
              </p>

              {hotel.diningRoomCapacity ? (
                <p>
                  <strong>{t("diningRoomCapacity")}:</strong> {hotel.diningRoomCapacity}
                </p>
              ) : (
                <p className="no-dining">
                  <strong>{t("noDiningRoom")}</strong>
                </p>
              )}

              <button
                className="details-btn"
                onClick={() =>
                  navigate("/map", { state: { hotel } })
                }
              >
                {t("showOnMap")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import React from "react";
import HotelCard from "./HotelCard";

export default function Section({ t, title, hotels, onShowOnMap }) {
  if (!hotels || hotels.length === 0) return null;

  return (
    <section className="map-section">
      <h2>{title}</h2>

      <div className="hotels-grid">
        {hotels.map((hotel) => (
          <HotelCard
            t={t}
            key={hotel.id}
            hotel={hotel}
            onShowOnMap={onShowOnMap} // Pasamos la función
          />
        ))}
      </div>
    </section>
  );
}

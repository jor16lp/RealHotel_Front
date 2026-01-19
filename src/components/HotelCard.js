import React from "react";
import { getHotelImage } from "../utils/hotelImages";

export default function HotelCard({ hotel }) {
  if (!hotel) return null;

  const imageUrl = getHotelImage(hotel.name);

  return (
    <div className="hotel-card">
      {/* IMAGEN */}
      <div className="hotel-card-image">
        <img src={imageUrl} alt={hotel.name} />
      </div>

      {/* CONTENIDO */}
      <h3>{hotel.name}</h3>

      <p className="location">
        {hotel.city}, {hotel.community}
      </p>
      
      <p className="stars">
        {"⭐".repeat(hotel.stars)}
      </p>

      <p className="address">
        📍 {hotel.address}
      </p>

      {hotel.phoneNumber && (
        <p className="phone">
          📞 {hotel.phoneNumber}
        </p>
      )}

      <div className="hotel-card-extra">
        <p>
          <strong>Precio medio:</strong> {hotel.averagePrice} €
        </p>

        <p>
          <strong>Capacidad:</strong> {hotel.capacity}
        </p>

        {hotel.diningRoomCapacity ? (
          <p>
            <strong>Capacidad comedor:</strong> {hotel.diningRoomCapacity}
          </p>
        ) : (
          <p className="no-dining">
            <strong>Sin comedor</strong>
          </p>
        )}
      </div>
    </div>
  );
}

import React from "react";

function HotelInfoModal({ hotel, onClose, t }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{t("hotelInfo")}</h2>
        <h3>{hotel.name}</h3>
        <p>{hotel.description}</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

export default HotelInfoModal;

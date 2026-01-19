import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Section from "../components/Section";
import { getHotelImage } from "../utils/hotelImages";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapPage({ t, user }) {
  const mapRef = useRef(null);
  const location = useLocation();
  const initialHotel = location.state?.hotel || null;

  const [hotels, setHotels] = useState([]);

  const [selectedHotel, setSelectedHotel] = useState(null);

  const [userRecommendations, setUserRecommendations] = useState([]);
  const [nearbyHotels, setNearbyHotels] = useState([]);
  const [cityRecommendations, setCityRecommendations] = useState([]);
  const [recommendedHotels, setRecommendedHotels] = useState([]);

  const [userLocation, setUserLocation] = useState(null);

  // const userLocationIcon = new L.Icon({
  //   iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  //   iconSize: [32, 32],
  //   iconAnchor: [16, 32],
  //   popupAnchor: [0, -32],
  // });
  const userLocationIcon = new L.DivIcon({
    className: "user-location-marker", 
    html: `<div class="user-marker-circle"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  useEffect(() => {
    if (location.state?.hotel) {
      const hotel = location.state.hotel;

      setSelectedHotel(hotel);
    }
  }, [location.state]);

  function RecenterToHotel({ hotel }) {
    const map = useMap();

    useEffect(() => {
      if (!hotel) return;

      const lat = Number(hotel.latitude);
      const lng = Number(hotel.longitude);

      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      map.flyTo([lat, lng], 14, { duration: 1.2 });
    }, [hotel, map]);

    return null;
  }

  function RecenterOnce({ userLocation, disabled }) {
    const map = useMap();
    const hasCentered = useRef(false);

    useEffect(() => {
      if (disabled) return;

      if (userLocation && !hasCentered.current) {
        map.setView(
          [userLocation.latitude, userLocation.longitude],
          map.getZoom(),
          { animate: true }
        );
        hasCentered.current = true;
      }
    }, [userLocation, disabled, map]);

    return null;
  }

  /* ===========================
     CARGAR HOTELES
  =========================== */
  useEffect(() => {
    fetch("http://localhost:3001/api/hotels")
      .then(res => res.json())
      .then(setHotels)
      .catch(console.error);
  }, []);

  /* ===========================
     MAP CENTER
  =========================== */
  useEffect(() => {
    if (initialHotel) {
    } else {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation(pos.coords);
        },
        () => {}
      );
    }
  }, [initialHotel]);

  /* ===========================
     RECOMENDACIONES INICIALES
  =========================== */
  useEffect(() => {
    if (!user) return;

    fetch("http://localhost:3001/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": user.email,
      },
      body: JSON.stringify({
        userEmail: user.email,
        baseHotelName: null,
        city: null,
        limit: 6,
      }),
    })
      .then(res => res.json())
      .then(setUserRecommendations)
      .catch(console.error);
  }, [user]);

  /* ===========================
     HOTELES CERCANOS + CIUDAD
  =========================== */
  useEffect(() => {
    if (!user || !userLocation || hotels.length === 0) return;

    // Cercanos
    const nearby = hotels
      .map(h => ({
        ...h,
        distance: getDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          h.latitude,
          h.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);

    setNearbyHotels(nearby);

    // Recomendados misma ciudad (calidad + cercanía)
    const city = nearby[0]?.city;
    if (!city) return;

    fetch("http://localhost:3001/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": user.email,
      },
      body: JSON.stringify({
        userEmail: user.email,
        baseHotelName: null,
        city: city,
        limit: 6,
      }),
    })
      .then(res => res.json())
      .then(setCityRecommendations)
      .catch(console.error);

  }, [user, userLocation, hotels]);

  /* ===========================
     CLICK EN MARCADOR
  =========================== */
  useEffect(() => {
    if (!selectedHotel || !user) return;

    fetch("http://localhost:3001/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": user.email,
      },
      body: JSON.stringify({
        userEmail: null,
        baseHotelName: selectedHotel.name,
        city: null,
        limit: 6,
      }),
    })
      .then(res => res.json())
      .then(setRecommendedHotels)
      .catch(console.error);

  }, [selectedHotel, user]);

  function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  

  return (
    <div className="map-page">
      {/* MAPA */}
      <div className="map-container">
        <MapContainer center={[40.4168, -3.7038]} zoom={13} style={{ height: "500px" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <RecenterToHotel hotel={selectedHotel || initialHotel} />

          {userLocation && (<RecenterOnce userLocation={userLocation} disabled={!!initialHotel} /> )}

          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userLocationIcon}
            >
              <Popup>
                <strong>{t("yourLocation")}</strong>
              </Popup>
            </Marker>
          )}

          {hotels.map(hotel => {
            // Marcador con precio medio
            const priceIcon = new L.DivIcon({
              html: `<div class="price-marker">${hotel.averagePrice}€</div>`,
              className: "custom-marker",
              iconSize: [50, 30],
              iconAnchor: [25, 15],
            });

            return (
              <Marker
                key={hotel.id}
                position={[hotel.latitude, hotel.longitude]}
                icon={priceIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedHotel(hotel);
                    if (mapRef.current) {
                      mapRef.current.setView([hotel.latitude, hotel.longitude], 13, { animate: true });
                    }
                  },
                }}
              >
                <Popup>
                  <strong>{hotel.name} {"⭐".repeat(hotel.stars)}</strong><br />
                  📍 {hotel.address}<br />
                  📞 {hotel.phoneNumber}<br />
                  ~{hotel.averagePrice}€
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {user && (
        <div className="map-results">

          {selectedHotel && (
            <>
              <h2>{t("selectedHotel")}</h2>

              <div key={selectedHotel.id} className="recommendation-card selected-hotel-card">

                {/* IMAGEN */}
                <div className="selected-hotel-image">
                  <img
                    src={getHotelImage(selectedHotel.name)}
                    alt={selectedHotel.name}
                  />
                </div>

                {/* CONTENIDO */}
                <div className="selected-hotel-content">

                  {/* IZQUIERDA */}
                  <div className="card-main">
                    <h3>{selectedHotel.name} {"⭐".repeat(selectedHotel.stars)}</h3>

                    <p className="location">
                      {selectedHotel.city}, {selectedHotel.community}
                    </p>

                    <p className="address">
                      📍 {selectedHotel.address}
                    </p>

                    {selectedHotel.phoneNumber && (
                      <p className="phone">
                        📞 {selectedHotel.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* DERECHA */}
                  <div className="card-extra">
                    <p>
                      <strong>{t("averagePrice")}:</strong> {selectedHotel.averagePrice} €
                    </p>

                    <p>
                      <strong>{t("capacity")}:</strong> {selectedHotel.capacity}
                    </p>

                    {selectedHotel.diningRoomCapacity ? (
                      <p>
                        <strong>{t("diningRoomCapacity")}:</strong> {selectedHotel.diningRoomCapacity}
                      </p>
                    ) : (
                      <p className="no-dining">
                        <strong>{t("noDiningRoom")}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* <HotelCard hotel={selectedHotel}/> */}

              <br></br>
              <br></br>

              <Section
                title={t("otherRecommendedHotels")}
                hotels={recommendedHotels}
              />
            </>
          )}

          <Section title={t("recommendedForYou")} hotels={userRecommendations} />
        </div>
      )}
      <div className="map-results map-results-ubication">
        <Section title={t("nearYou")} hotels={nearbyHotels} />
        <Section title={t("bestInYourCity")} hotels={cityRecommendations} />
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage({ t, user }) {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [searchName, setSearchName] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchStars, setSearchStars] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 30;

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hotelRatings, setHotelRatings] = useState([]);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingHotel, setRatingHotel] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingError, setRatingError] = useState("");

  const [userRatings, setUserRatings] = useState({});

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:3001/api/ratings/user/${user.email}`)
      .then(res => res.json())
      .then(data => {
        const map = {};
        data.forEach(r => {
          map[r.hotelName] = r;
        });
        setUserRatings(map);
      })
      .catch(() => setUserRatings({}));
  }, [user]);

  const openRatingModal = (hotel) => {
    setRatingHotel(hotel);
    setRatingError("");

    const existing = userRatings[hotel.name];

    if (existing) {
      setRatingValue(existing.rating);
      setRatingComment(existing.comment);
    } else {
      setRatingValue(5);
      setRatingComment("");
    }

    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!ratingComment.trim()) {
      setRatingError(t("commentRequired"));
      return;
    }

    const existingRating = userRatings[ratingHotel.name];
    const method = existingRating ? "PUT" : "POST";
    console.log(method)
    const url = existingRating
      ? `http://localhost:3001/api/ratings/${existingRating.id}`
      : "http://localhost:3001/api/ratings";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          hotelName: ratingHotel.name,
          rating: ratingValue,
          comment: ratingComment,
        }),
      });


      if (!res.ok) throw new Error("Error al guardar");

      const savedRating = await res.json();

      setUserRatings(prev => ({
        ...prev,
        [ratingHotel.name]: {
          ...existingRating,
          id: savedRating.id,
          rating: ratingValue,
          comment: ratingComment
        }
      }));

      setShowRatingModal(false);

    } catch (err) {
      setRatingError(err.message);
    }
  };

  const openHotelModal = async (hotel) => {
    setSelectedHotel(hotel);
    setShowModal(true);

    // Llamada al backend para ratings del hotel
    try {
      const res = await fetch(
        `http://localhost:3001/api/ratings/hotel/${hotel.name}`
      );
      const data = await res.json();
      setHotelRatings(data);
    } catch (err) {
      console.error("Error cargando ratings", err);
      setHotelRatings([]);
    }
  };

  const totalResults = filteredHotels.length;

  const totalPages = Math.ceil(totalResults / PAGE_SIZE);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedHotels = filteredHotels.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const renderStars = (stars) => {
    return "⭐".repeat(stars);
  };

  // Al cambiar los filtros, se resetea la página
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, searchCity]);

  // Cargar hoteles al inicio
  useEffect(() => {
    fetch("http://localhost:3001/api/hotels/") // ajusta puerto si es necesario
      .then(res => res.json())
      .then(data => {
        setHotels(data);
        setFilteredHotels(data);
      })
      .catch(err => console.error("Error cargando hoteles:", err));
  }, []);

  // Filtrar cuando cambian los inputs
  useEffect(() => {
    let result = hotels;

    if (searchName) {
      result = result.filter(h =>
        h.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchCity) {
      result = result.filter(h =>
        h.city.toLowerCase().includes(searchCity.toLowerCase())
      );
    }

    if (searchStars !== "") {
      result = result.filter(h =>
        h.stars === Number(searchStars)
      );
    }

    if (maxPrice) {
      result = result.filter(h =>
        Number(h.averagePrice) <= Number(maxPrice)
      );
    }
    
    setCurrentPage(1);

    setFilteredHotels(result);
  }, [searchName, searchCity, searchStars, maxPrice, hotels]);

  useEffect(() => {
    let result = [...hotels];

    if (searchName) {
      result = result.filter(h =>
        h.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchCity) {
      result = result.filter(h =>
        h.city.toLowerCase().includes(searchCity.toLowerCase())
      );
    }

    if (searchStars !== "") {
      result = result.filter(h =>
        h.stars === Number(searchStars)
      );
    }

    if (maxPrice) {
      result = result.filter(h =>
        Number(h.averagePrice) <= Number(maxPrice)
      );
    }

    /* 🔽 ORDENACIÓN */
    if (sortField) {
      result.sort((a, b) => {
        let valueA, valueB;

        switch (sortField) {
          case "stars":
            valueA = a.stars;
            valueB = b.stars;
            break;
          case "price":
            valueA = a.averagePrice;
            valueB = b.averagePrice;
            break;
          case "city":
            valueA = a.city.toLowerCase();
            valueB = b.city.toLowerCase();
            break;
          default:
            return 0;
        }

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    setCurrentPage(1);
    setFilteredHotels(result);

  }, [
    searchName,
    searchCity,
    searchStars,
    maxPrice,
    sortField,
    sortOrder,
    hotels
  ]);

  return (
    <div className="home-container">
      <h1>{t("home")}</h1>
      <p>{t("homeText")}</p>

      {/* BUSCADOR */}
      <div className="search-bar">
        <p>{t("findBy")}:</p>

        <input
          type="text"
          placeholder={t("searchHotel")}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />

        <input
          type="text"
          placeholder={t("searchCity")}
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
        />

        <select
          value={searchStars}
          onChange={(e) => setSearchStars(e.target.value)}>
          <option value="">{t("allStars")}</option>
          <option value="1">⭐</option>
          <option value="2">⭐⭐</option>
          <option value="3">⭐⭐⭐</option>
          <option value="4">⭐⭐⭐⭐</option>
          <option value="5">⭐⭐⭐⭐⭐</option>
        </select>

        <input
          type="number"
          placeholder={t("maxPrice")}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      {/* SORTER */}
      <div className="sort-bar">
        <p>{t("sortBy")}:</p>
        
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="">{t("noSort")}</option>
          <option value="stars">{t("stars")}</option>
          <option value="price">{t("averagePrice")}</option>
          <option value="city">{t("city")}</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          disabled={!sortField}
        >
          <option value="asc">{t("ascending")}</option>
          <option value="desc">{t("descending")}</option>
        </select>
      </div>

      <p className="results-count">
        {totalResults} {t("hotelsFound")}
      </p>

      {/* TARJETAS */}
      <div className="hotels-grid">
        {paginatedHotels.length === 0 && (
          <p>{t("noResults")}</p>
        )}

        {paginatedHotels.map(hotel => (
          <div key={hotel.id} className="hotel-card">
            <h3>{hotel.name}</h3>
            <p>{hotel.city}</p>
            <p className="stars">
              {renderStars(hotel.stars)}
            </p>
            <p>{hotel.averagePrice} € / noche</p>
            <div className="card-actions">
              <button
                className="details-btn"
                onClick={() => openHotelModal(hotel)}
              >
                {t("showDetails")}
              </button>

              {user && (
                <button
                  className="details-btn secondary"
                  onClick={() => openRatingModal(hotel)}
                >
                  {userRatings[hotel.name]
                    ? t("editRating")
                    : t("rateHotel")}
                </button>
              )}

              <button
                className="details-btn map-btn"
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

      <div className="pagination">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}>
          ⏮ {t("first")}
        </button>

        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}>
          ◀ {t("prev")}
        </button>

        <span className="page-info">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}>
          {t("next")} ▶
        </button>

        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}>
          {t("last")} ⏭
        </button>
      </div>

      {showModal && selectedHotel && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedHotel.name}</h2>

            <p><strong>{t("city")}:</strong> {selectedHotel.city}, {selectedHotel.community}</p>
            <p><strong>{t("address")}:</strong> {selectedHotel.address}</p>
            <p><strong>{t("phoneNumber")}:</strong> {selectedHotel.phoneNumber}</p>
            <p><strong>{t("capacity")}:</strong> {selectedHotel.capacity}</p>
            <p>
              <strong>{t("diningRoomCapacity")}:</strong>{" "}
              {selectedHotel.diningRoomCapacity
                ? selectedHotel.diningRoomCapacity
                : "Sin comedor"}
            </p>
            <p><strong>{t("stars")}:</strong> {"⭐".repeat(selectedHotel.stars)}</p>
            <p><strong>{t("averagePrice")}:</strong> {selectedHotel.averagePrice} €</p>

            <hr />

            <h3>{t("ratings")}</h3>

            {hotelRatings.length === 0 ? (
              <p>{t("noRatings")}</p>
            ) : (
              <>
                <p>
                  ⭐ {t("average")}:{" "}
                  {(
                    hotelRatings.reduce((s, r) => s + r.rating, 0) /
                    hotelRatings.length
                  ).toFixed(1)}
                  /5
                  <span className="comment-detail">
                    ({hotelRatings.length} {t("reviews")})
                  </span>
                </p>

                <div className="ratings-container">
                  <ul className="ratings-list">
                    {hotelRatings.map((r, i) => (
                      <li key={i}>
                        <strong>{r.name + " " + r.surname}</strong> – {"⭐".repeat(r.rating)}
                        <br />
                        {r.comment}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <button className="details-btn" onClick={() => setShowModal(false)}>{t("close")}</button>
          </div>
        </div>
      )}
      {showRatingModal && ratingHotel && (
        <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {t("rateHotel")} – {ratingHotel.name}
            </h2>

            <label>
              {t("rating")}
              <select
                value={ratingValue}
                onChange={(e) => setRatingValue(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>
                    {n} ⭐
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t("comment")}
              <textarea
                rows="4"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />
            </label>

            {ratingError && (
              <p className="error-text">{ratingError}</p>
            )}

            <div className="card-actions">
              <button
                className="details-btn"
                onClick={submitRating}
              >
                {t("submit")}
              </button>

              <button
                className="details-btn secondary"
                onClick={() => setShowRatingModal(false)}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

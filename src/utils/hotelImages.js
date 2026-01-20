const hotelImages = Array.from(
  { length: 30 },
  (_, i) => `/hotels/${i + 1}.jpg`
);

export function getHotelImage(hotelName) {
  if (!hotelName) return hotelImages[0];

  const hash = hotelName
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  return hotelImages[hash % hotelImages.length];
}

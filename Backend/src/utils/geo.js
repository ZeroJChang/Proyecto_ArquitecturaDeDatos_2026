const EARTH_RADIUS_KM = 6371;

export function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

export function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function toDegrees(value) {
  return (value * 180) / Math.PI;
}

export function distanceKm(pointA, pointB) {
  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function movePoint(point, distanceKmValue, bearingDegrees) {
  const bearing = toRadians(bearingDegrees);
  const lat1 = toRadians(point.lat);
  const lng1 = toRadians(point.lng);
  const angularDistance = distanceKmValue / EARTH_RADIUS_KM;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );

  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: Number(toDegrees(lat2).toFixed(6)),
    lng: Number(toDegrees(lng2).toFixed(6)),
  };
}

export function generatePointNear(center, radiusKm) {
  const distance = Math.sqrt(Math.random()) * radiusKm;
  const bearing = randomBetween(0, 360);
  return movePoint(center, distance, bearing);
}

/** WKT POLYGON 문자열에서 중심점(centroid) 추출 */
export function parseWKTPolygonCentroid(wkt: string): { lng: number; lat: number } | null {
  const match = wkt.match(/POLYGON\s*\(\((.+)\)\)/i);
  if (!match?.[1]) return null;

  const coords = match[1].split(",").map((pair) => {
    const [lng, lat] = pair.trim().split(/\s+/).map(Number);
    return { lng: lng!, lat: lat! };
  });

  if (coords.length === 0) return null;

  const ring =
    coords.length > 1 &&
    coords[0]!.lng === coords[coords.length - 1]!.lng &&
    coords[0]!.lat === coords[coords.length - 1]!.lat
      ? coords.slice(0, -1)
      : coords;

  if (ring.length === 0) return null;

  const sum = ring.reduce((acc, c) => ({ lng: acc.lng + c.lng, lat: acc.lat + c.lat }), {
    lng: 0,
    lat: 0,
  });
  return { lng: sum.lng / ring.length, lat: sum.lat / ring.length };
}

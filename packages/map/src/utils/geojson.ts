import type { GeoJsonFeatureCollection } from "../types/geojson";

/**
 * 폴리곤 좌표의 중심점 계산 (외곽 링 꼭짓점 산술 평균)
 * @param coordinates GeoJSON Polygon coordinates (number[][][])
 * @returns { longitude, latitude }
 */
export function calculatePolygonCenter(coordinates: number[][][]): {
  longitude: number;
  latitude: number;
} {
  const outerRing = coordinates[0];
  if (!outerRing || outerRing.length === 0) {
    return { longitude: 0, latitude: 0 };
  }

  // Exclude last vertex if it duplicates the first (GeoJSON spec)
  const ring =
    outerRing.length > 1 &&
    outerRing[0]![0] === outerRing[outerRing.length - 1]![0] &&
    outerRing[0]![1] === outerRing[outerRing.length - 1]![1]
      ? outerRing.slice(0, -1)
      : outerRing;

  let lngSum = 0;
  let latSum = 0;
  for (const coord of ring) {
    lngSum += coord[0] ?? 0;
    latSum += coord[1] ?? 0;
  }

  return {
    longitude: lngSum / ring.length,
    latitude: latSum / ring.length,
  };
}

/**
 * Douglas-Peucker 알고리즘으로 GeoJSON 좌표 단순화
 * @param featureCollection 원본 FeatureCollection
 * @param tolerance 허용 오차 (도 단위, 예: 0.0001 ≈ 11m)
 * @returns 단순화된 새 FeatureCollection
 */
export function simplifyGeoJSON(
  featureCollection: GeoJsonFeatureCollection,
  tolerance: number
): GeoJsonFeatureCollection {
  return {
    type: "FeatureCollection",
    features: featureCollection.features.map((feature) => {
      if (feature.geometry.type === "Polygon") {
        return {
          ...feature,
          geometry: {
            type: "Polygon" as const,
            coordinates: feature.geometry.coordinates.map((ring) =>
              douglasPeucker(ring, tolerance)
            ),
          },
        };
      }
      return {
        ...feature,
        geometry: {
          type: "MultiPolygon" as const,
          coordinates: feature.geometry.coordinates.map((polygon) =>
            polygon.map((ring) => douglasPeucker(ring, tolerance))
          ),
        },
      };
    }),
  };
}

/** Douglas-Peucker line simplification */
function douglasPeucker(points: number[][], tolerance: number): number[][] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIndex = 0;
  const first = points[0]!;
  const last = points[points.length - 1]!;

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i]!, first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  if (maxDist > tolerance) {
    const left = douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
    const right = douglasPeucker(points.slice(maxIndex), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

/** Point-to-line perpendicular distance */
function perpendicularDistance(point: number[], lineStart: number[], lineEnd: number[]): number {
  const [px, py] = [point[0] ?? 0, point[1] ?? 0];
  const [x1, y1] = [lineStart[0] ?? 0, lineStart[1] ?? 0];
  const [x2, y2] = [lineEnd[0] ?? 0, lineEnd[1] ?? 0];

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  return Math.abs(dy * px - dx * py + x2 * y1 - y2 * x1) / Math.sqrt(dx * dx + dy * dy);
}

/**
 * Shoelace 공식으로 작은 폴리곤 필터링
 * @param featureCollection 원본 FeatureCollection
 * @param minArea 최소 면적 (제곱도 단위)
 * @returns 필터링된 새 FeatureCollection
 */
export function removeSmallIslands(
  featureCollection: GeoJsonFeatureCollection,
  minArea: number
): GeoJsonFeatureCollection {
  return {
    type: "FeatureCollection",
    features: featureCollection.features.filter((feature) => {
      const coords =
        feature.geometry.type === "Polygon"
          ? [feature.geometry.coordinates]
          : feature.geometry.coordinates;

      const totalArea = coords.reduce((sum, polygon) => {
        const outerRing = polygon[0];
        return sum + (outerRing ? Math.abs(shoelaceArea(outerRing)) : 0);
      }, 0);

      return totalArea >= minArea;
    }),
  };
}

/** Shoelace formula for polygon area */
function shoelaceArea(ring: number[][]): number {
  let area = 0;
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = ring[i]![0] ?? 0;
    const yi = ring[i]![1] ?? 0;
    const xj = ring[j]![0] ?? 0;
    const yj = ring[j]![1] ?? 0;
    area += xi * yj - xj * yi;
  }
  return area / 2;
}

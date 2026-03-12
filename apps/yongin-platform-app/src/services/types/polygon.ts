export interface PolygonFeature {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export interface PolygonFeatureCollection {
  type: "FeatureCollection";
  features: PolygonFeature[];
}

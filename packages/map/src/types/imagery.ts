export type ImageryProviderType = "ion" | "osm" | "bing" | "arcgis" | "vworld";

export type VWorldLayer = "Base" | "Satellite" | "Hybrid" | "white" | "midnight";

export interface ImageryProps {
  provider: ImageryProviderType;
  assetId?: number;
  apiKey?: string;
  vworldLayer?: VWorldLayer;
}

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

export const MAP_STYLES = {
  day: import.meta.env.VITE_MAPBOX_STYLE_DAY as string,
  mono: import.meta.env.VITE_MAPBOX_STYLE_MONO as string,
  night: import.meta.env.VITE_MAPBOX_STYLE_NIGHT as string,
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

export const CLIP_OUTLINE_COLOR: Record<MapStyleKey, string> = {
  day: "rgba(255, 0, 0, 0.9)",
  mono: "rgba(255, 0, 0, 0.9)",
  night: "rgba(255, 230, 0, 1)",
};

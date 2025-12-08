import { useViewerStore } from "../viewer/store.ts";

export function removeMarker(id: string): void {
  useViewerStore.getState().removeMarker(id);
}

export function removeAllMarkers(): void {
  const { markers } = useViewerStore.getState();
  const markerIds = Array.from(markers.keys());
  markerIds.forEach((id) => removeMarker(id));
}

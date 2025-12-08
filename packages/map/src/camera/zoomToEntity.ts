import { Viewer, Entity, HeadingPitchRange } from "cesium";

export function zoomToEntity(
  viewer: Viewer,
  entity: Entity,
  offset?: { heading?: number; pitch?: number; range?: number }
): void {
  const headingPitchRange = new HeadingPitchRange(
    offset?.heading ?? 0,
    offset?.pitch ?? -90,
    offset?.range ?? 1000
  );

  viewer.zoomTo(entity, headingPitchRange);
}

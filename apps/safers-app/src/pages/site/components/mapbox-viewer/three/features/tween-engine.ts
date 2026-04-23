import { easeCubicInOut } from "d3-ease";
import type { FeaturePosition } from "../../types";
import type { SceneContext } from "../core/types";
import { gpsToScenePosition } from "../core/geo-utils";

export interface PositionTween {
  featureId: string;
  from: FeaturePosition;
  to: FeaturePosition;
  startTime: number;
  durationMs: number;
  autoHeading?: boolean;
  onComplete?: () => void;
}

export interface PathTween {
  featureId: string;
  path: FeaturePosition[];
  cumulativeRatios: number[];
  startTime: number;
  durationMs: number;
  linear?: boolean;
  onComplete?: () => void;
}

export function createTweenEngine(ctx: SceneContext) {
  const activeTweens: PositionTween[] = [];
  const activePathTweens: PathTween[] = [];
  const patrolStates = new Map<string, { active: boolean }>();

  function cancelTweensForFeature(id: string) {
    for (let i = activeTweens.length - 1; i >= 0; i--) {
      if (activeTweens[i]!.featureId === id) activeTweens.splice(i, 1);
    }
    for (let i = activePathTweens.length - 1; i >= 0; i--) {
      if (activePathTweens[i]!.featureId === id) activePathTweens.splice(i, 1);
    }
  }

  function doMoveAlongPath(
    id: string,
    path: FeaturePosition[],
    durationMs: number,
    onComplete?: () => void,
    linear?: boolean
  ) {
    if (path.length < 2) return;
    const entry = ctx.features.get(id);
    if (!entry) return;

    cancelTweensForFeature(id);

    const distances: number[] = [];
    let totalDist = 0;
    for (let s = 0; s < path.length - 1; s++) {
      const a = path[s]!;
      const b = path[s + 1]!;
      const dlng = (b.lng - a.lng) * 111320 * Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
      const dlat = (b.lat - a.lat) * 111320;
      const dalt = b.altitude - a.altitude;
      const dist = Math.sqrt(dlng * dlng + dlat * dlat + dalt * dalt);
      distances.push(dist);
      totalDist += dist;
    }

    const cumulativeRatios: number[] = [];
    let cumDist = 0;
    for (const d of distances) {
      cumDist += d;
      cumulativeRatios.push(totalDist > 0 ? cumDist / totalDist : 1);
    }

    activePathTweens.push({
      featureId: id,
      path,
      cumulativeRatios,
      startTime: performance.now(),
      durationMs,
      linear,
      onComplete,
    });

    ctx.requestRepaint();
  }

  function moveFeatureTo(
    id: string,
    target: FeaturePosition,
    durationMs: number,
    onComplete?: () => void
  ) {
    const entry = ctx.features.get(id);
    if (!entry) return;

    cancelTweensForFeature(id);

    activeTweens.push({
      featureId: id,
      from: { ...entry.position },
      to: target,
      startTime: performance.now(),
      durationMs,
      autoHeading: true,
      onComplete,
    });

    ctx.requestRepaint();
  }

  function moveFeatureAlongPath(
    id: string,
    path: FeaturePosition[],
    durationMs: number,
    onComplete?: () => void
  ) {
    doMoveAlongPath(id, path, durationMs, onComplete);
  }

  function startPatrol(id: string, path: FeaturePosition[], durationMs: number) {
    const existing = patrolStates.get(id);
    if (existing) existing.active = false;

    const state = { active: true };
    patrolStates.set(id, state);

    const doLoop = () => {
      if (!state.active) return;
      doMoveAlongPath(id, path, durationMs, doLoop, true);
    };
    doLoop();
  }

  function stopPatrol(id: string) {
    const state = patrolStates.get(id);
    if (state) state.active = false;
    patrolStates.delete(id);

    for (let i = activePathTweens.length - 1; i >= 0; i--) {
      if (activePathTweens[i]!.featureId === id) activePathTweens.splice(i, 1);
    }
  }

  /** Called per-frame in render loop. Returns true if there are active tweens. */
  function update(now: number) {
    const transform = ctx.getTransform();

    for (let i = activeTweens.length - 1; i >= 0; i--) {
      const tw = activeTweens[i]!;
      const elapsed = now - tw.startTime;
      const progress = Math.min(elapsed / tw.durationMs, 1);
      const t = easeCubicInOut(progress);

      const lerpPos: FeaturePosition = {
        lng: tw.from.lng + (tw.to.lng - tw.from.lng) * t,
        lat: tw.from.lat + (tw.to.lat - tw.from.lat) * t,
        altitude: tw.from.altitude + (tw.to.altitude - tw.from.altitude) * t,
      };

      const entry = ctx.features.get(tw.featureId);
      if (entry) {
        const pos = gpsToScenePosition(lerpPos, transform);

        if (tw.autoHeading) {
          const fromScene = gpsToScenePosition(tw.from, transform);
          const toScene = gpsToScenePosition(tw.to, transform);
          const dx = toScene.x - fromScene.x;
          const dy = toScene.y - fromScene.y;
          if (dx * dx + dy * dy > 1e-10) {
            entry.group.rotation.y = Math.atan2(dx, -dy);
          }
        }

        entry.group.position.copy(pos);
        entry.position = lerpPos;
      }

      if (progress >= 1) {
        activeTweens.splice(i, 1);
        tw.onComplete?.();
      }
    }

    for (let i = activePathTweens.length - 1; i >= 0; i--) {
      const pt = activePathTweens[i]!;
      const elapsed = now - pt.startTime;
      const progress = Math.min(elapsed / pt.durationMs, 1);
      const t = pt.linear ? progress : easeCubicInOut(progress);

      let segIdx = 0;
      for (let s = 0; s < pt.cumulativeRatios.length; s++) {
        if (t <= pt.cumulativeRatios[s]!) break;
        segIdx = s + 1;
      }
      segIdx = Math.min(segIdx, pt.path.length - 2);

      const segStart = segIdx === 0 ? 0 : pt.cumulativeRatios[segIdx - 1]!;
      const segEnd = pt.cumulativeRatios[segIdx]!;
      const segLen = segEnd - segStart;
      const localT = segLen > 0 ? (t - segStart) / segLen : 1;

      const from = pt.path[segIdx]!;
      const to = pt.path[segIdx + 1]!;

      const lerpPos: FeaturePosition = {
        lng: from.lng + (to.lng - from.lng) * localT,
        lat: from.lat + (to.lat - from.lat) * localT,
        altitude: from.altitude + (to.altitude - from.altitude) * localT,
      };

      const entry = ctx.features.get(pt.featureId);
      if (entry) {
        const pos = gpsToScenePosition(lerpPos, transform);

        const fromScene = gpsToScenePosition(from, transform);
        const toScene = gpsToScenePosition(to, transform);
        const dx = toScene.x - fromScene.x;
        const dy = toScene.y - fromScene.y;
        if (dx * dx + dy * dy > 1e-10) {
          entry.group.rotation.y = Math.atan2(dx, -dy);
        }

        entry.group.position.copy(pos);
        entry.position = lerpPos;
      }

      if (progress >= 1) {
        activePathTweens.splice(i, 1);
        pt.onComplete?.();
      }
    }
  }

  function hasActiveTweens(): boolean {
    return activeTweens.length > 0 || activePathTweens.length > 0;
  }

  function dispose() {
    activeTweens.length = 0;
    activePathTweens.length = 0;
    for (const state of patrolStates.values()) state.active = false;
    patrolStates.clear();
  }

  return {
    activeTweens,
    activePathTweens,
    cancelTweensForFeature,
    moveFeatureTo,
    moveFeatureAlongPath,
    startPatrol,
    stopPatrol,
    update,
    hasActiveTweens,
    dispose,
  };
}

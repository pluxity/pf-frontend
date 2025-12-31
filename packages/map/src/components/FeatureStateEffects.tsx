import { useEffect, useRef } from "react";
import {
  CallbackProperty,
  ConstantProperty,
  Color,
  HeightReference,
  PointGraphics,
  type Entity,
  type CustomDataSource,
} from "cesium";
import { useMapStore } from "../store/mapStore";
import { useFeatureStore } from "../store/featureStore";
import type { FeatureStateEffectsProps, StateEffect, RippleEffect } from "../types/featureState";

/**
 * Feature 상태별 시각 효과를 자동 적용하는 컴포넌트
 *
 * @example
 * ```tsx
 * <MapViewer>
 *   <Imagery provider="osm" />
 *   <FeatureStateEffects
 *     selected={{ type: "silhouette", color: Color.YELLOW, size: 2 }}
 *     warning={{ type: "ripple", color: Color.ORANGE }}
 *     critical={{ type: "ripple", color: Color.RED, period: 800 }}
 *   />
 * </MapViewer>
 * ```
 */
export function FeatureStateEffects(props: FeatureStateEffectsProps) {
  const viewer = useMapStore((state) => state.viewer);
  const dataSource = useMapStore((state) => state.dataSource);
  const featureStates = useFeatureStore((state) => state.featureStates);
  const getFeature = useFeatureStore((state) => state.getFeature);

  // 효과 Entity 관리 (featureId -> effect Entity)
  const effectEntitiesRef = useRef<Map<string, Entity>>(new Map());

  useEffect(() => {
    if (!viewer || viewer.isDestroyed() || !dataSource) return;

    const currentDataSource = dataSource;
    const effectEntities = effectEntitiesRef.current;

    // 모든 Feature의 상태 확인 및 효과 적용
    featureStates.forEach((state, featureId) => {
      const entity = getFeature(featureId);
      if (!entity) return;

      const effect = props[state];
      if (!effect) {
        // 효과 정의가 없으면 기존 효과 제거
        removeEffect(featureId, entity, effectEntities, currentDataSource);
        return;
      }

      // 효과 적용
      applyEffect(featureId, entity, effect, effectEntities, currentDataSource);
    });

    // 상태가 제거된 Feature의 효과 제거
    effectEntities.forEach((_, featureId) => {
      if (!featureStates.has(featureId)) {
        const entity = getFeature(featureId);
        if (entity) {
          removeEffect(featureId, entity, effectEntities, currentDataSource);
        }
      }
    });

    viewer.scene.requestRender();
  }, [viewer, dataSource, featureStates, getFeature, props]);

  // Cleanup
  useEffect(() => {
    const currentDataSource = dataSource;
    const effectEntities = effectEntitiesRef.current;

    return () => {
      if (!viewer || viewer.isDestroyed() || !currentDataSource) return;

      effectEntities.forEach((effectEntity) => {
        currentDataSource.entities.remove(effectEntity);
      });
      effectEntities.clear();
    };
  }, [viewer, dataSource]);

  return null;
}

// ============================================================================
// Effect Application Helpers
// ============================================================================

function applyEffect(
  featureId: string,
  entity: Entity,
  effect: StateEffect,
  effectEntities: Map<string, Entity>,
  dataSource: CustomDataSource
) {
  // 기존 효과 제거
  const existingEffect = effectEntities.get(featureId);
  if (existingEffect) {
    dataSource.entities.remove(existingEffect);
    effectEntities.delete(featureId);
  }

  switch (effect.type) {
    case "silhouette":
      applySilhouette(entity, effect.color, effect.size ?? 2);
      break;

    case "ripple":
      applyRipple(featureId, entity, effect, effectEntities, dataSource);
      break;

    case "glow":
      applyGlow(entity, effect.color, effect.intensity ?? 0.8);
      break;

    case "outline":
      applyOutline(entity, effect.color, effect.width ?? 3);
      break;
  }
}

function removeEffect(
  featureId: string,
  entity: Entity,
  effectEntities: Map<string, Entity>,
  dataSource: CustomDataSource
) {
  // Ripple 효과 Entity 제거
  const effectEntity = effectEntities.get(featureId);
  if (effectEntity) {
    dataSource.entities.remove(effectEntity);
    effectEntities.delete(featureId);
  }

  // Entity 속성 초기화
  if (entity.model) {
    entity.model.silhouetteColor = undefined;
    entity.model.silhouetteSize = undefined;
  }

  if (entity.billboard) {
    entity.billboard.color = new ConstantProperty(Color.WHITE);
  }

  if (entity.point) {
    entity.point.color = new ConstantProperty(Color.WHITE);
    entity.point.outlineColor = undefined;
    entity.point.outlineWidth = undefined;
  }
}

// ============================================================================
// Individual Effect Implementations
// ============================================================================

function applySilhouette(entity: Entity, color: Color, size: number) {
  if (entity.model) {
    entity.model.silhouetteColor = new ConstantProperty(color);
    entity.model.silhouetteSize = new ConstantProperty(size);
  }
}

function applyRipple(
  featureId: string,
  entity: Entity,
  effect: RippleEffect,
  effectEntities: Map<string, Entity>,
  dataSource: CustomDataSource
) {
  const position = entity.position;
  if (!position) return;

  const period = effect.period ?? 1200;
  const maxSize = effect.maxSize ?? 50;
  const baseSize = effect.baseSize ?? 6;
  const rippleColor = effect.color;

  const start = Date.now();

  const size = new CallbackProperty(() => {
    const t = ((Date.now() - start) % period) / period;
    return baseSize + t * maxSize;
  }, false);

  const alphaColor = new CallbackProperty(() => {
    const t = ((Date.now() - start) % period) / period;
    return rippleColor.withAlpha(1 - t);
  }, false);

  const rippleEntity = dataSource.entities.add({
    id: `${featureId}-ripple`,
    position,
    point: new PointGraphics({
      pixelSize: size,
      color: alphaColor,
      outlineColor: new ConstantProperty(rippleColor.withAlpha(0.2)),
      outlineWidth: new ConstantProperty(2),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      heightReference: HeightReference.CLAMP_TO_GROUND,
    }),
  });

  effectEntities.set(featureId, rippleEntity);
}

function applyGlow(entity: Entity, color: Color, intensity: number) {
  const start = Date.now();
  const period = 1000;

  const glowColor = new CallbackProperty(() => {
    const t = Math.abs(Math.sin(((Date.now() - start) / period) * Math.PI));
    const alpha = 0.5 + t * intensity * 0.5;
    return color.withAlpha(alpha);
  }, false);

  if (entity.billboard) {
    entity.billboard.color = glowColor;
  }

  if (entity.point) {
    entity.point.color = glowColor;
  }
}

function applyOutline(entity: Entity, color: Color, width: number) {
  // Outline은 Point에만 적용 가능 (Billboard는 outline 미지원)
  if (entity.point) {
    entity.point.outlineColor = new ConstantProperty(color);
    entity.point.outlineWidth = new ConstantProperty(width);
  }
}

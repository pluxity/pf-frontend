import { useEffect } from "react";
import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartographic,
  Cartesian3,
  Math as CesiumMath,
  type Viewer,
  type Entity,
  ConstantPositionProperty,
} from "cesium";
import type { Position } from "../types";

interface UseModelDragProps {
  viewer: Viewer | null;
  featureId: string | null;
  positionRef: { current: Position };
  setPosition: (position: Position | ((prev: Position) => Position)) => void;
  enabled?: boolean;
}

export function useModelDrag({
  viewer,
  featureId,
  positionRef,
  setPosition,
  enabled = true,
}: UseModelDragProps) {
  useEffect(() => {
    if (!viewer || viewer.isDestroyed() || !featureId || !enabled) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    let isDragging = false;
    let pickedEntity: Entity | null = null;

    // 초기 상태 저장
    const controller = viewer.scene.screenSpaceCameraController;
    const originalEnableRotate = controller.enableRotate;
    const originalEnableTranslate = controller.enableTranslate;
    const originalEnableZoom = controller.enableZoom;
    const originalCursor = viewer.canvas.style.cursor;

    // 드래그 중 상태 저장
    let savedEnableRotate: boolean | undefined;
    let savedEnableTranslate: boolean | undefined;
    let savedEnableZoom: boolean | undefined;
    let savedCursor: string | undefined;

    const restoreState = () => {
      controller.enableRotate = savedEnableRotate ?? originalEnableRotate;
      controller.enableTranslate = savedEnableTranslate ?? originalEnableTranslate;
      controller.enableZoom = savedEnableZoom ?? originalEnableZoom;
      viewer.canvas.style.cursor = savedCursor ?? originalCursor;
    };

    // LEFT_DOWN 모델 선택
    handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
      const picked = viewer.scene.pick(movement.position);
      if (picked && picked.id?.id === featureId) {
        pickedEntity = picked.id;
        isDragging = true;

        savedEnableRotate = controller.enableRotate;
        savedEnableTranslate = controller.enableTranslate;
        savedEnableZoom = controller.enableZoom;
        savedCursor = viewer.canvas.style.cursor;

        // 드래그 중 카메라 이동 비활성화
        controller.enableRotate = false;
        controller.enableTranslate = false;
        controller.enableZoom = false;
        viewer.canvas.style.cursor = "pointer";
      }
    }, ScreenSpaceEventType.LEFT_DOWN);

    // 드래그 중 위치 업데이트
    handler.setInputAction((movement: ScreenSpaceEventHandler.MotionEvent) => {
      if (!isDragging || !pickedEntity) return;

      // 마우스 위치를 지구 좌표로 변환
      const cartesian = viewer.camera.pickEllipsoid(
        movement.endPosition,
        viewer.scene.globe.ellipsoid
      );

      if (!cartesian) return;

      const cartographic = Cartographic.fromCartesian(cartesian);
      const longitude = CesiumMath.toDegrees(cartographic.longitude);
      const latitude = CesiumMath.toDegrees(cartographic.latitude);
      const height = positionRef.current.height;

      // 모델 위치 업데이트
      const newPosition = Cartesian3.fromDegrees(longitude, latitude, height);
      if (pickedEntity.position) pickedEntity.position = new ConstantPositionProperty(newPosition);

      setPosition((prev) => ({
        ...prev,
        longitude,
        latitude,
      }));
    }, ScreenSpaceEventType.MOUSE_MOVE);

    // LEFT_UP 드래그 종료
    handler.setInputAction(() => {
      if (isDragging) {
        isDragging = false;
        pickedEntity = null;
        restoreState();
      }
    }, ScreenSpaceEventType.LEFT_UP);

    return () => {
      if (!handler.isDestroyed()) {
        handler.destroy();
      }
      if (!viewer.isDestroyed()) {
        if (isDragging && savedEnableRotate !== undefined) {
          controller.enableRotate = savedEnableRotate ?? originalEnableRotate;
          controller.enableTranslate = savedEnableTranslate ?? originalEnableTranslate;
          controller.enableZoom = savedEnableZoom ?? originalEnableZoom;
          viewer.canvas.style.cursor = savedCursor ?? originalCursor;
        } else {
          controller.enableRotate = originalEnableRotate;
          controller.enableTranslate = originalEnableTranslate;
          controller.enableZoom = originalEnableZoom;
          viewer.canvas.style.cursor = originalCursor;
        }
      }
    };
  }, [viewer, featureId, positionRef, setPosition, enabled]);
}

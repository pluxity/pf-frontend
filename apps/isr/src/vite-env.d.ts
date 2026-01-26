/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// potree-core 타입 선언
declare module "potree-core" {
  import * as THREE from "three";

  export enum PointColorType {
    RGB = 0,
    COLOR = 1,
    DEPTH = 2,
    HEIGHT = 3,
    INTENSITY = 4,
    INTENSITY_GRADIENT = 5,
    LOD = 6,
    POINT_INDEX = 7,
    CLASSIFICATION = 8,
    RETURN_NUMBER = 9,
    SOURCE = 10,
    NORMAL = 11,
    PHONG = 12,
    RGB_HEIGHT = 13,
  }

  export enum PointShape {
    SQUARE = 0,
    CIRCLE = 1,
    PARABOLOID = 2,
  }

  export class PointCloudOctree extends THREE.Object3D {
    material: THREE.PointsMaterial & {
      size: number;
      opacity: number;
      pointColorType?: PointColorType;
      shape?: PointShape;
      inputColorEncoding?: number;
      outputColorEncoding?: number;
    };
    boundingBox: THREE.Box3 | null;
    numVisiblePoints: number;
  }

  export class Potree {
    pointBudget: number;

    loadPointCloud(url: string, baseUrl: string): Promise<PointCloudOctree>;

    updatePointClouds(
      pointClouds: PointCloudOctree[],
      camera: THREE.Camera,
      renderer: THREE.WebGLRenderer
    ): void;
  }
}

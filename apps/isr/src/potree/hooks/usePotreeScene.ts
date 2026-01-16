import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Potree, PointCloudOctree, PointColorType, PointShape } from "potree-core";
import { DEFAULT_BACKGROUND_COLOR, POINT_CLOUD, CAMERA, CONTROLS, RAYCASTER } from "../constants";
import { calculateOffset } from "../utils/coordinate";

interface UsePotreeSceneOptions {
  pointCloudUrl: string;
  onPointCloudLoaded?: (offset: THREE.Vector3, maxDim: number) => void;
  onHoverCoordChange?: (coord: { x: number; y: number; z: number } | null) => void;
  onPointCountChange?: (count: number) => void;
  onError?: (error: Error) => void;
}

export function usePotreeScene({
  pointCloudUrl,
  onPointCloudLoaded,
  onHoverCoordChange,
  onPointCountChange,
  onError,
}: UsePotreeSceneOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const potreeRef = useRef<Potree | null>(null);
  const pointCloudRef = useRef<PointCloudOctree | null>(null);
  const offsetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const animationIdRef = useRef<number | null>(null);

  const initScene = useCallback((container: HTMLDivElement) => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(DEFAULT_BACKGROUND_COLOR);
    sceneRef.current = scene;

    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight1.position.set(100, 100, 100);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight2.position.set(-100, 100, -100);
    scene.add(dirLight2);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));

    const camera = new THREE.PerspectiveCamera(CAMERA.FOV, width / height, CAMERA.NEAR, CAMERA.FAR);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = CONTROLS.DAMPING_FACTOR;
    controls.rotateSpeed = CONTROLS.ROTATE_SPEED;
    controls.panSpeed = CONTROLS.PAN_SPEED;
    controls.screenSpacePanning = true;
    controls.minDistance = CONTROLS.MIN_DISTANCE;
    controls.maxDistance = CONTROLS.MAX_DISTANCE;
    controls.enableZoom = false;
    controlsRef.current = controls;

    const potree = new Potree();
    potree.pointBudget = POINT_CLOUD.BUDGET;
    potreeRef.current = potree;

    return { scene, camera, renderer, controls, potree };
  }, []);

  const loadPointCloud = useCallback(async () => {
    const potree = potreeRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!potree || !scene || !camera || !controls) return;

    try {
      const urlParts = pointCloudUrl.split("/");
      const fileName = urlParts.pop() || "cloud.js";
      const baseUrl = urlParts.join("/");

      const pointCloud = await potree.loadPointCloud(fileName, `${baseUrl}/`);
      pointCloudRef.current = pointCloud;

      const material = pointCloud.material as THREE.PointsMaterial & {
        pointColorType?: number;
        shape?: number;
        inputColorEncoding?: number;
        outputColorEncoding?: number;
      };
      material.size = POINT_CLOUD.SIZE;
      material.pointColorType = PointColorType.RGB;
      material.shape = PointShape.CIRCLE;
      material.inputColorEncoding = 1;
      material.outputColorEncoding = 1;

      const box = pointCloud.boundingBox;
      if (box) {
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);

        const potreePosition = pointCloud.position.clone();
        offsetRef.current = calculateOffset(potreePosition, center);

        pointCloud.position.set(-center.x, -center.y, -center.z);
        pointCloud.rotation.x = -Math.PI / 2;

        scene.add(pointCloud);

        camera.position.set(maxDim * 0.5, maxDim * 0.5, maxDim * 0.5);
        controls.target.set(0, 0, 0);
        controls.update();

        onPointCloudLoaded?.(offsetRef.current, maxDim);
      } else {
        scene.add(pointCloud);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load point cloud");
      onError?.(error);
    }
  }, [pointCloudUrl, onPointCloudLoaded, onError]);

  const setupEventHandlers = useCallback(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!renderer || !camera || !controls) return () => {};

    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: RAYCASTER.POINT_THRESHOLD };
    const mouse = new THREE.Vector2();

    const getMousePosition = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      return mouse;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!pointCloudRef.current) return;

      getMousePosition(event);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(pointCloudRef.current, true);

      if (intersects[0]) {
        const p = intersects[0].point;
        const offset = offsetRef.current;
        onHoverCoordChange?.({
          x: p.x + offset.x,
          y: -p.z + offset.y,
          z: p.y + offset.z,
        });
      } else {
        onHoverCoordChange?.(null);
      }
    };

    const handleDoubleClick = (event: MouseEvent) => {
      if (!pointCloudRef.current) return;

      getMousePosition(event);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(pointCloudRef.current, true);

      if (intersects[0]) {
        controls.target.copy(intersects[0].point);
        controls.update();
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      getMousePosition(event);
      raycaster.setFromCamera(mouse, camera);

      const direction = raycaster.ray.direction.clone();
      const distance = camera.position.distanceTo(controls.target);
      const zoomAmount = distance * CONTROLS.ZOOM_SPEED * (event.deltaY > 0 ? 1 : -1);
      const move = direction.multiplyScalar(zoomAmount);

      camera.position.add(move);
      controls.target.add(move);
      controls.update();
    };

    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("dblclick", handleDoubleClick);
    renderer.domElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("dblclick", handleDoubleClick);
      renderer.domElement.removeEventListener("wheel", handleWheel);
    };
  }, [onHoverCoordChange]);

  const startAnimation = useCallback(() => {
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const pointCloud = pointCloudRef.current;
      const potree = potreeRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const controls = controlsRef.current;
      const scene = sceneRef.current;

      if (!camera || !renderer || !controls || !scene) return;

      if (pointCloud && potree) {
        potree.updatePointClouds([pointCloud], camera, renderer);
        onPointCountChange?.(pointCloud.numVisiblePoints || 0);
      }

      renderer.resetState();

      controls.update();
      renderer.render(scene, camera);
    };

    animate();
  }, [onPointCountChange]);

  const handleResize = useCallback(() => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    if (!container || !camera || !renderer) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }, []);

  const addToScene = useCallback((object: THREE.Object3D) => {
    sceneRef.current?.add(object);
  }, []);

  const getOffset = useCallback(() => offsetRef.current, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    initScene(container);
    loadPointCloud();

    const cleanupEvents = setupEventHandlers();
    startAnimation();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cleanupEvents();

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        container.removeChild(rendererRef.current.domElement);
      }

      controlsRef.current?.dispose();
    };
  }, [initScene, loadPointCloud, setupEventHandlers, startAnimation, handleResize]);

  const getScene = useCallback(() => sceneRef.current, []);

  return {
    containerRef,
    addToScene,
    getOffset,
    getScene,
  };
}

import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { PostProcess } from "@babylonjs/core/PostProcesses/postProcess";
import { ColorCurves } from "@babylonjs/core/Materials/colorCurves";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Effect } from "@babylonjs/core/Materials/effect";
import type { Scene } from "@babylonjs/core/scene";
import type { Camera } from "@babylonjs/core/Cameras/camera";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { ViewMode } from "../types";

// Side-effect imports for post-processing
import "@babylonjs/core/PostProcesses/RenderPipeline/postProcessRenderPipelineManagerSceneComponent";
import "@babylonjs/core/PostProcesses/bloomEffect";
import "@babylonjs/core/PostProcesses/grainPostProcess";
import "@babylonjs/core/PostProcesses/imageProcessingPostProcess";
import "@babylonjs/core/PostProcesses/chromaticAberrationPostProcess";

// --- Thermal shader ---
const THERMAL_FRAGMENT = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D textureSampler;

  void main(void) {
    vec4 tex = texture2D(textureSampler, vUV);
    float luminance = dot(tex.rgb, vec3(0.299, 0.587, 0.114));

    vec3 cold = vec3(0.0, 0.0, 0.8);
    vec3 warm = vec3(0.0, 0.8, 0.0);
    vec3 hot  = vec3(1.0, 0.8, 0.0);
    vec3 vhot = vec3(1.0, 0.0, 0.0);

    vec3 color = mix(cold, warm, smoothstep(0.0, 0.33, luminance));
    color = mix(color, hot, smoothstep(0.33, 0.66, luminance));
    color = mix(color, vhot, smoothstep(0.66, 1.0, luminance));

    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface ViewModeManager {
  setMode(mode: ViewMode): void;
  getMode(): ViewMode;
  dispose(): void;
}

export function createViewModeManager(scene: Scene, cameras: Camera[]): ViewModeManager {
  let currentMode: ViewMode = "default";
  let pipeline: DefaultRenderingPipeline | null = null;
  let thermalPost: PostProcess | null = null;
  let alertObserver: Observer<Scene> | null = null;

  // Register thermal shader once
  Effect.ShadersStore["thermalFragmentShader"] = THERMAL_FRAGMENT;

  function ensurePipeline(): DefaultRenderingPipeline {
    if (!pipeline) {
      pipeline = new DefaultRenderingPipeline("viewModePipeline", true, scene, cameras);
    }
    return pipeline;
  }

  function resetPipeline(): void {
    // Remove thermal post-process
    if (thermalPost) {
      thermalPost.dispose();
      thermalPost = null;
    }

    // Remove alert observer
    if (alertObserver) {
      scene.onBeforeRenderObservable.remove(alertObserver);
      alertObserver = null;
    }

    if (!pipeline) return;

    // Reset image processing
    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.exposure = 1;
    pipeline.imageProcessing.contrast = 1;
    pipeline.imageProcessing.colorCurvesEnabled = false;
    pipeline.imageProcessing.colorCurves = new ColorCurves();

    // Reset bloom
    pipeline.bloomEnabled = false;
    pipeline.bloomThreshold = 0.9;
    pipeline.bloomWeight = 0.15;

    // Reset vignette
    pipeline.imageProcessing.vignetteEnabled = false;
    pipeline.imageProcessing.vignetteWeight = 0;

    // Reset grain
    pipeline.grainEnabled = false;

    // Reset chromatic aberration
    pipeline.chromaticAberrationEnabled = false;
  }

  function applyNightMode(): void {
    const p = ensurePipeline();

    // Exposure & contrast
    p.imageProcessingEnabled = true;
    p.imageProcessing.exposure = 0.5;
    p.imageProcessing.contrast = 1.3;

    // Blue shift color curves
    p.imageProcessing.colorCurvesEnabled = true;
    const curves = new ColorCurves();
    curves.globalHue = 220; // Blue hue
    curves.globalSaturation = 40; // Moderate saturation boost
    curves.globalDensity = 40;
    curves.highlightsHue = 210;
    curves.highlightsSaturation = 30;
    p.imageProcessing.colorCurves = curves;

    // Bloom
    p.bloomEnabled = true;
    p.bloomThreshold = 0.3;
    p.bloomWeight = 0.6;

    // Vignette
    p.imageProcessing.vignetteEnabled = true;
    p.imageProcessing.vignetteWeight = 3;
    p.imageProcessing.vignetteColor = new Color4(0, 0, 0.05, 0);

    // Film grain
    p.grainEnabled = true;
    p.grain.intensity = 15;
  }

  function applyThermalMode(): void {
    // Use a custom post-process for thermal false-color mapping
    const camera = cameras[0];
    if (!camera) return;

    thermalPost = new PostProcess("thermal", "thermal", [], null, 1.0, camera);
  }

  function applyAlertMode(): void {
    const p = ensurePipeline();

    // High contrast
    p.imageProcessingEnabled = true;
    p.imageProcessing.contrast = 1.5;

    // Red vignette
    p.imageProcessing.vignetteEnabled = true;
    p.imageProcessing.vignetteWeight = 5;
    p.imageProcessing.vignetteColor = new Color4(0.3, 0, 0, 0);

    // Chromatic aberration
    p.chromaticAberrationEnabled = true;
    p.chromaticAberration.aberrationAmount = 30;

    // Pulsing vignette effect
    alertObserver = scene.onBeforeRenderObservable.add(() => {
      if (!pipeline) return;
      const time = performance.now() / 1000;
      const pulse = 3 + 2 * Math.sin(time * 4);
      pipeline.imageProcessing.vignetteWeight = pulse;
    });
  }

  function setMode(mode: ViewMode): void {
    if (mode === currentMode) return;

    resetPipeline();
    currentMode = mode;

    switch (mode) {
      case "night":
        applyNightMode();
        break;
      case "thermal":
        applyThermalMode();
        break;
      case "alert":
        applyAlertMode();
        break;
      case "default":
        // resetPipeline already handled this
        break;
    }
  }

  function getMode(): ViewMode {
    return currentMode;
  }

  function dispose(): void {
    resetPipeline();
    if (pipeline) {
      pipeline.dispose();
      pipeline = null;
    }
  }

  return { setMode, getMode, dispose };
}

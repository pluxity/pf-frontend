import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { PostProcess } from "@babylonjs/core/PostProcesses/postProcess";
import { ColorCurves } from "@babylonjs/core/Materials/colorCurves";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Effect } from "@babylonjs/core/Materials/effect";
import type { Scene } from "@babylonjs/core/scene";
import type { Camera } from "@babylonjs/core/Cameras/camera";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { ViewMode } from "../types";

import "@babylonjs/core/PostProcesses/RenderPipeline/postProcessRenderPipelineManagerSceneComponent";
import "@babylonjs/core/PostProcesses/bloomEffect";
import "@babylonjs/core/PostProcesses/grainPostProcess";
import "@babylonjs/core/PostProcesses/imageProcessingPostProcess";
import "@babylonjs/core/PostProcesses/chromaticAberrationPostProcess";

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

/**
 * IFC view mode manager — reuses the same post-processing approach
 * as the factory scene view-mode-manager (default/night/thermal/alert).
 */
export function createIFCViewModeManager(scene: Scene, cameras: Camera[]) {
  let currentMode: ViewMode = "default";
  let pipeline: DefaultRenderingPipeline | null = null;
  let thermalPost: PostProcess | null = null;
  let alertObserver: Observer<Scene> | null = null;

  Effect.ShadersStore["ifcThermalFragmentShader"] = THERMAL_FRAGMENT;

  function ensurePipeline(): DefaultRenderingPipeline {
    if (!pipeline) {
      pipeline = new DefaultRenderingPipeline("ifcViewModePipeline", true, scene, cameras);
    }
    return pipeline;
  }

  function resetPipeline(): void {
    if (thermalPost) {
      thermalPost.dispose();
      thermalPost = null;
    }
    if (alertObserver) {
      scene.onBeforeRenderObservable.remove(alertObserver);
      alertObserver = null;
    }
    if (!pipeline) return;

    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.exposure = 1;
    pipeline.imageProcessing.contrast = 1;
    pipeline.imageProcessing.colorCurvesEnabled = false;
    pipeline.imageProcessing.colorCurves = new ColorCurves();
    pipeline.bloomEnabled = false;
    pipeline.bloomThreshold = 0.9;
    pipeline.bloomWeight = 0.15;
    pipeline.imageProcessing.vignetteEnabled = false;
    pipeline.imageProcessing.vignetteWeight = 0;
    pipeline.grainEnabled = false;
    pipeline.chromaticAberrationEnabled = false;
  }

  function applyNightMode(): void {
    const p = ensurePipeline();
    p.imageProcessingEnabled = true;
    p.imageProcessing.exposure = 0.5;
    p.imageProcessing.contrast = 1.3;

    p.imageProcessing.colorCurvesEnabled = true;
    const curves = new ColorCurves();
    curves.globalHue = 220;
    curves.globalSaturation = 40;
    curves.globalDensity = 40;
    curves.highlightsHue = 210;
    curves.highlightsSaturation = 30;
    p.imageProcessing.colorCurves = curves;

    p.bloomEnabled = true;
    p.bloomThreshold = 0.3;
    p.bloomWeight = 0.6;

    p.imageProcessing.vignetteEnabled = true;
    p.imageProcessing.vignetteWeight = 3;
    p.imageProcessing.vignetteColor = new Color4(0, 0, 0.05, 0);

    p.grainEnabled = true;
    p.grain.intensity = 15;
  }

  function applyThermalMode(): void {
    const camera = cameras[0];
    if (!camera) return;
    thermalPost = new PostProcess("ifcThermal", "ifcThermal", [], null, 1.0, camera);
  }

  function applyAlertMode(): void {
    const p = ensurePipeline();
    p.imageProcessingEnabled = true;
    p.imageProcessing.contrast = 1.5;

    p.imageProcessing.vignetteEnabled = true;
    p.imageProcessing.vignetteWeight = 5;
    p.imageProcessing.vignetteColor = new Color4(0.3, 0, 0, 0);

    p.chromaticAberrationEnabled = true;
    p.chromaticAberration.aberrationAmount = 30;

    alertObserver = scene.onBeforeRenderObservable.add(() => {
      if (!pipeline) return;
      const t = performance.now() / 1000;
      const pulse = 3 + 2 * Math.sin(t * 4);
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

import { create } from "zustand";
import type { FeatureState, FeatureActions, Feature } from "../types/feature";
import { useAssetStore } from "./assetStore";

function validateAsset(assetId: string, featureId: string): boolean {
  const asset = useAssetStore.getState().assets.get(assetId);

  if (!asset) {
    console.warn(`[Feature] Asset not found. Skipping feature.`, { assetId, featureId });
    return false;
  }

  if (!asset.object) {
    console.warn(`[Feature] Asset not loaded yet. Skipping feature.`, { assetId, featureId });
    return false;
  }

  return true;
}

export const useFeatureStore = create<FeatureState & FeatureActions>((set, get) => ({
  features: new Map(),
  featuresByAsset: new Map(),

  addFeature: (feature) => {
    const currentFeatures = get().features;
    if (currentFeatures.has(feature.id)) return;

    if (!validateAsset(feature.assetId, feature.id)) return;

    const features = new Map(currentFeatures);
    const featuresByAsset = new Map(get().featuresByAsset);

    features.set(feature.id, feature);

    if (!featuresByAsset.has(feature.assetId)) {
      featuresByAsset.set(feature.assetId, new Set());
    }
    featuresByAsset.get(feature.assetId)!.add(feature.id);

    set({ features, featuresByAsset });
  },

  addFeatures: (newFeatures) => {
    const currentFeatures = get().features;
    const features = new Map(currentFeatures);
    const featuresByAsset = new Map(get().featuresByAsset);

    let hasChanges = false;

    newFeatures.forEach((feature) => {
      if (currentFeatures.has(feature.id)) return;

      if (!validateAsset(feature.assetId, feature.id)) return;

      hasChanges = true;
      features.set(feature.id, feature);

      if (!featuresByAsset.has(feature.assetId)) {
        featuresByAsset.set(feature.assetId, new Set());
      }
      featuresByAsset.get(feature.assetId)!.add(feature.id);
    });

    if (hasChanges) {
      set({ features, featuresByAsset });
    }
  },

  getFeature: (id) => {
    return get().features.get(id) ?? null;
  },

  removeFeature: (id) => {
    const features = new Map(get().features);
    const featuresByAsset = new Map(get().featuresByAsset);
    const feature = features.get(id);

    if (feature) {
      features.delete(id);
      const assetFeatures = featuresByAsset.get(feature.assetId);
      if (assetFeatures) {
        assetFeatures.delete(id);
        if (assetFeatures.size === 0) {
          featuresByAsset.delete(feature.assetId);
        }
      }
    }

    set({ features, featuresByAsset });
  },

  updateFeature: (id, updates) => {
    const features = new Map(get().features);
    const feature = features.get(id);
    if (feature) {
      features.set(id, { ...feature, ...updates });
      set({ features });
    }
  },

  getFeaturesByAsset: (assetId) => {
    const featureIds = get().featuresByAsset.get(assetId);
    if (!featureIds) return [];

    const features = get().features;
    return Array.from(featureIds)
      .map((id) => features.get(id))
      .filter((f): f is Feature => f !== undefined);
  },

  getAllFeatures: () => {
    return Array.from(get().features.values());
  },

  clearAll: () => {
    set({ features: new Map(), featuresByAsset: new Map() });
  },
}));

export const featureStore = useFeatureStore;

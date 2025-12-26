import type { Asset, Feature, Facility } from "./types";
import { useAssetStore } from "./store/assetStore";
import { useFeatureStore } from "./store/featureStore";
import { useFacilityStore } from "./store/facilityStore";

export interface InitializeOptions {
  facility?: Promise<Omit<Facility, "loadedAt">>;
  assets: Promise<Asset[]>;
  features: Promise<Feature[]>;
}

export async function initializeScene({
  facility,
  assets,
  features,
}: InitializeOptions): Promise<void> {
  const [assetsData, featuresData, facilityData] = await Promise.all([
    assets,
    features,
    facility?.catch(() => undefined),
  ]);

  if (facilityData) {
    useFacilityStore.getState().addFacility(facilityData);
  }

  await useAssetStore.getState().addAssets(assetsData);

  useFeatureStore.getState().addFeatures(featuresData);
}

"use client";

import { getAssetOverview } from "@/app/dashboard/inventory/locations/actions";

type AssetOverviewResult = Awaited<ReturnType<typeof getAssetOverview>>;
type AssetOverviewCache = {
  promise?: Promise<AssetOverviewResult>;
  result?: AssetOverviewResult;
  loadedAt?: number;
};

declare global {
  interface Window {
    __camaAssetOverviewCache?: AssetOverviewCache;
  }
}

const CACHE_TTL = 60_000;

function cache() {
  return (window.__camaAssetOverviewCache ||= {});
}

function warmFirstThumbnails(result: AssetOverviewResult) {
  if (!result.success || !("assets" in result)) return;
  const urls = Array.from(new Set((result.assets || []).map((asset: any) => asset.image_url).filter(Boolean))).slice(0, 12) as string[];
  urls.forEach(url => {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
  });
}

export function getAssetOverviewCached() {
  const state = cache();
  if (state.result && state.loadedAt && Date.now() - state.loadedAt < CACHE_TTL) {
    return Promise.resolve(state.result);
  }
  if (state.promise) return state.promise;

  state.promise = getAssetOverview()
    .then(result => {
      state.result = result;
      state.loadedAt = Date.now();
      warmFirstThumbnails(result);
      return result;
    })
    .finally(() => {
      state.promise = undefined;
    });
  return state.promise;
}

export function prefetchAssetOverview() {
  void getAssetOverviewCached().catch(() => undefined);
}

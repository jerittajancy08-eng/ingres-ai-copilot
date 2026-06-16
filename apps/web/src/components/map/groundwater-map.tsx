"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { MapAsset } from "@/types/api";

const fallback: MapAsset[] = [
  { id: "well-1", name: "Kolar Observation Well", latitude: 13.13, longitude: 78.13, status: "critical" },
  { id: "well-2", name: "Mandya Recharge Site", latitude: 12.52, longitude: 76.9, status: "normal" },
  { id: "well-3", name: "Mysuru Piezometer", latitude: 12.29, longitude: 76.64, status: "watch" },
];

export function GroundwaterMap() {
  const [assets, setAssets] = useState(fallback);

  useEffect(() => {
    api.mapAssets().then(setAssets).catch(() => setAssets(fallback));
  }, []);

  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] gap-4 p-4 md:grid-cols-[1fr_360px] md:p-6">
      <div className="relative overflow-hidden rounded-lg border bg-[#dfeee8]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,94,89,0.08)_1px,transparent_1px),linear-gradient(rgba(18,94,89,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
        {assets.map((asset, index) => (
          <div
            key={asset.id}
            className="absolute"
            style={{ left: `${26 + index * 22}%`, top: `${32 + (index % 2) * 24}%` }}
            title={`${asset.name}: ${asset.status}`}
          >
            <div className={pinColor(asset.status)}>
              <MapPin className="size-5" />
            </div>
          </div>
        ))}
      </div>
      <Card className="p-4">
        <h1 className="text-lg font-semibold">Interactive Groundwater Map</h1>
        <div className="mt-4 space-y-3">
          {assets.map((asset) => (
            <div key={asset.id} className="rounded-md border p-3">
              <p className="text-sm font-medium">{asset.name}</p>
              <p className="text-xs text-muted-foreground">
                {asset.latitude}, {asset.longitude} - {asset.status}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function pinColor(status: MapAsset["status"]) {
  if (status === "critical") return "rounded-full bg-red-600 p-2 text-white shadow";
  if (status === "watch") return "rounded-full bg-amber-500 p-2 text-white shadow";
  return "rounded-full bg-emerald-600 p-2 text-white shadow";
}

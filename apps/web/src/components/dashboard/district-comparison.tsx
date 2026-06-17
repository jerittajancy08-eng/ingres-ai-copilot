import { ArrowUp, ArrowDown } from "lucide-react";

interface DistrictMetric {
  metric: string;
  kolar: { value: string; status: "good" | "warning" | "critical" };
  mysuru: { value: string; status: "good" | "warning" | "critical" };
}

const COMPARISON_METRICS: DistrictMetric[] = [
  {
    metric: "Water Level Trend",
    kolar: { value: "↓ Declining", status: "critical" },
    mysuru: { value: "→ Stable", status: "warning" },
  },
  {
    metric: "Risk Level",
    kolar: { value: "High", status: "critical" },
    mysuru: { value: "Medium", status: "warning" },
  },
  {
    metric: "Recharge Rate",
    kolar: { value: "Low (12%)", status: "critical" },
    mysuru: { value: "Good (68%)", status: "good" },
  },
  {
    metric: "Borewell Density",
    kolar: { value: "Very High", status: "critical" },
    mysuru: { value: "High", status: "warning" },
  },
  {
    metric: "Water Quality",
    kolar: { value: "Fair", status: "warning" },
    mysuru: { value: "Good", status: "good" },
  },
];

function getStatusBgColor(status: "good" | "warning" | "critical"): string {
  switch (status) {
    case "good":
      return "bg-emerald-50 border-emerald-200 text-emerald-900";
    case "warning":
      return "bg-amber-50 border-amber-200 text-amber-900";
    case "critical":
      return "bg-red-50 border-red-200 text-red-900";
  }
}

export function DistrictComparison({ district1 = "Kolar", district2 = "Mysuru" } = {}) {
  return (
    <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">District Comparison</h2>
        <p className="mt-1 text-sm text-slate-600">
          {district1} vs {district2}
        </p>
      </div>

      {/* District Headers */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div />
        <div className="rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 p-3 text-center">
          <p className="text-sm font-semibold text-teal-900">{district1}</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-3 text-center">
          <p className="text-sm font-semibold text-blue-900">{district2}</p>
        </div>
      </div>

      {/* Comparison Rows */}
      <div className="space-y-3">
        {COMPARISON_METRICS.map((row) => (
          <div key={row.metric} className="grid grid-cols-3 gap-4">
            {/* Metric Label */}
            <div className="rounded-lg border border-slate-200/50 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-900">{row.metric}</p>
            </div>

            {/* Kolar Value */}
            <div className={`rounded-lg border p-3 ${getStatusBgColor(row.kolar.status)}`}>
              <p className="text-sm font-semibold">{row.kolar.value}</p>
            </div>

            {/* Mysuru Value */}
            <div className={`rounded-lg border p-3 ${getStatusBgColor(row.mysuru.status)}`}>
              <p className="text-sm font-semibold">{row.mysuru.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-lg border border-slate-200/50 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-900 mb-2">Summary</p>
        <p className="text-sm text-slate-700 leading-6">
          <span className="font-semibold text-teal-600">{district1}</span> shows critical groundwater stress with high depletion risk,
          while <span className="font-semibold text-blue-600">{district2}</span> maintains moderate water levels with better recharge conditions. Recommend prioritizing{" "}
          <span className="font-semibold">{district1}</span> for immediate intervention.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3">
        <button className="flex-1 rounded-lg border border-slate-200/50 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Switch Districts
        </button>
        <button className="flex-1 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2 text-sm font-medium text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all">
          Generate Comparison Report
        </button>
      </div>
    </div>
  );
}

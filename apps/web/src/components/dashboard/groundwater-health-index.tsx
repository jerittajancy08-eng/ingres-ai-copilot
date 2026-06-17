import { TrendingDown, AlertTriangle } from "lucide-react";

interface HealthMetric {
  label: string;
  value: number;
  unit: string;
  status: "good" | "watch" | "critical";
}

const HEALTH_METRICS: HealthMetric[] = [
  { label: "Water Level Trend", value: -8, unit: "%", status: "watch" },
  { label: "Recharge Efficiency", value: 72, unit: "%", status: "good" },
  { label: "Risk Level", value: 6, unit: "/10", status: "watch" },
  { label: "Sustainability Score", value: 68, unit: "%", status: "watch" },
];

function getStatusColor(status: "good" | "watch" | "critical"): string {
  switch (status) {
    case "good":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "watch":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "critical":
      return "text-red-600 bg-red-50 border-red-200";
  }
}

function getGaugeColor(value: number): string {
  if (value >= 70) return "from-emerald-500 to-emerald-600";
  if (value >= 50) return "from-amber-500 to-amber-600";
  return "from-red-500 to-red-600";
}

export function GroundwaterHealthIndex() {
  const healthScore = 78;
  const status = "WATCH";

  return (
    <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Groundwater Health Index</h2>
        <p className="mt-1 text-sm text-slate-600">Regional assessment for today</p>
      </div>

      {/* Main Score */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-slate-900">{healthScore}</span>
            <span className="text-lg font-semibold text-slate-600">/100</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-600">Status: {status}</span>
          </div>
        </div>

        {/* Gauge Circle */}
        <div className="relative h-32 w-32">
          <svg className="h-full w-full" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={healthScore >= 70 ? "#10b981" : healthScore >= 50 ? "#f59e0b" : "#ef4444"}
              strokeWidth="8"
              strokeDasharray={`${(healthScore / 100) * 314} 314`}
              strokeLinecap="round"
              className="transition-all"
              style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
            />
            {/* Center text */}
            <text x="60" y="65" textAnchor="middle" className="fill-slate-900 text-sm font-bold">
              {healthScore}%
            </text>
          </svg>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-3 border-t border-slate-200/50 pt-6">
        {HEALTH_METRICS.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between rounded-lg border border-slate-200/50 p-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{metric.label}</p>
            </div>
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${getStatusColor(metric.status)}`}>
              {metric.value < 0 && <TrendingDown className="h-3.5 w-3.5" />}
              <span>
                {metric.value}
                {metric.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button className="mt-6 w-full rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all">
        View Detailed Health Report
      </button>
    </div>
  );
}

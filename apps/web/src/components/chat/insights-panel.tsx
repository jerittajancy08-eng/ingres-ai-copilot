import { TrendingDown, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

type InsightType = "warning" | "positive" | "neutral" | "critical";

interface Insight {
  id: string;
  trend: "up" | "down" | "neutral";
  text: string;
  type: InsightType;
  value?: string;
}

const SAMPLE_INSIGHTS: Insight[] = [
  {
    id: "1",
    trend: "down",
    text: "Kolar groundwater down 12% from last month",
    type: "warning",
    value: "-12%"
  },
  {
    id: "2",
    trend: "up",
    text: "Recharge improved in Mandya due to monsoon",
    type: "positive",
    value: "+8%"
  },
  {
    id: "3",
    trend: "neutral",
    text: "Borewell depletion risk increasing in Mysuru",
    type: "critical",
    value: "High"
  },
  {
    id: "4",
    trend: "up",
    text: "Safe recharge conditions in Hassan",
    type: "positive",
    value: "Optimal"
  }
];

export function InsightsPanel() {
  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const getIconByType = (type: InsightType) => {
    if (type === "critical" || type === "warning") {
      return <AlertCircle className="h-5 w-5 text-amber-600" />;
    }
    return <CheckCircle className="h-5 w-5 text-emerald-600" />;
  };

  const getBgByType = (type: InsightType) => {
    switch (type) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "positive":
        return "bg-emerald-50 border-emerald-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200/50">
        <h2 className="text-sm font-semibold text-slate-900">Today&apos;s Groundwater Insights</h2>
        <p className="text-xs text-slate-500 mt-1">Real-time monitoring dashboard</p>
      </div>

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {SAMPLE_INSIGHTS.map((insight) => (
          <div
            key={insight.id}
            className={`rounded-lg border p-4 transition-all hover:shadow-md cursor-pointer ${getBgByType(insight.type)}`}
          >
            <div className="flex gap-3">
              {getIconByType(insight.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 font-medium">{insight.text}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-600">Last updated: Today</p>
                  {insight.value && (
                    <div className="flex items-center gap-1">
                      {getTrendIcon(insight.trend)}
                      <span className="text-xs font-semibold text-slate-900">{insight.value}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-200/50">
        <button className="w-full rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors">
          View Full Dashboard
        </button>
      </div>
    </div>
  );
}

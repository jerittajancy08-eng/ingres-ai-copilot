import { BarChart3, Map, FileText, TrendingUp, FileSearch } from "lucide-react";

interface AIActionButtonsProps {
  onAnalyzeRisk?: () => void;
  onViewMap?: () => void;
  onGenerateReport?: () => void;
  onCompareDistricts?: () => void;
  onShowSources?: () => void;
}

export function AIActionButtons({
  onAnalyzeRisk,
  onViewMap,
  onGenerateReport,
  onCompareDistricts,
  onShowSources,
}: AIActionButtonsProps) {
  const actions = [
    {
      icon: <AlertTriangleIcon className="h-4 w-4" />,
      label: "Analyze Risk",
      onClick: onAnalyzeRisk,
      color: "text-red-600 hover:bg-red-50",
    },
    {
      icon: <Map className="h-4 w-4" />,
      label: "View on Map",
      onClick: onViewMap,
      color: "text-blue-600 hover:bg-blue-50",
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Generate Report",
      onClick: onGenerateReport,
      color: "text-emerald-600 hover:bg-emerald-50",
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: "Compare Districts",
      onClick: onCompareDistricts,
      color: "text-purple-600 hover:bg-purple-50",
    },
    {
      icon: <FileSearch className="h-4 w-4" />,
      label: "Show Sources",
      onClick: onShowSources,
      color: "text-teal-600 hover:bg-teal-50",
    },
  ];

  return (
    <div className="mt-4 space-y-2 border-t border-slate-200/50 pt-4">
      <p className="text-xs font-medium text-slate-600 px-1">AI Actions</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`flex flex-col items-center gap-1.5 rounded-lg border border-slate-200/50 px-2 py-2 text-xs font-medium transition-all hover:border-current hover:shadow-sm ${action.color}`}
          >
            {action.icon}
            <span className="text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AlertTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

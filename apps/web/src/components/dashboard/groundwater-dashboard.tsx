"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, Brain, Droplets, Gauge, Leaf, MapPin, Search, ShieldAlert, Sprout, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { DistrictGroundwaterStatus, GroundwaterSummary } from "@/types/api";
import { DocumentUpload } from "@/components/dashboard/document-upload";

const fallback: GroundwaterSummary = {
  average_level_m: 18.4,
  recharge_index: 72,
  alert_count: 9,
  critical_blocks: 14,
  monitored_wells: 284,
  districts: [
    {
      name: "Bengaluru Rural",
      state: "Karnataka",
      level_m: 21.2,
      trend: "falling",
      stress: "high",
      recharge_index: 58,
      rainfall_mm: 612,
      extraction_mcm: 284,
      latitude: 13.28,
      longitude: 77.54,
      monthly_levels: [
        { month: "Jan", level_m: 17.8, recharge_index: 68 },
        { month: "Feb", level_m: 18.5, recharge_index: 64 },
        { month: "Mar", level_m: 19.2, recharge_index: 61 },
        { month: "Apr", level_m: 20.4, recharge_index: 59 },
        { month: "May", level_m: 21.2, recharge_index: 58 },
      ],
      recommendation: "Prioritize recharge shafts near public tanks and restrict new high-capacity borewells until post-monsoon recovery is confirmed.",
      recharge_recommendations: [
        "Install recharge shafts around public tanks and storm-water drains.",
        "Restore feeder channels before the southwest monsoon window.",
        "Route rooftop runoff from public buildings into filtered recharge pits.",
      ],
      conservation_recommendations: [
        "Pause new high-capacity irrigation borewells in stressed blocks.",
        "Shift peri-urban layouts to metered, dual-source supply.",
        "Promote drip conversion for borewell-fed horticulture clusters.",
      ],
      ai_insights: [
        "Falling levels with moderate rainfall indicate extraction pressure is outpacing recharge.",
        "Recharge structures should be placed near tank cascades where runoff concentration is highest.",
      ],
    },
    {
      name: "Mandya",
      state: "Karnataka",
      level_m: 13.8,
      trend: "stable",
      stress: "moderate",
      recharge_index: 74,
      rainfall_mm: 721,
      extraction_mcm: 196,
      latitude: 12.52,
      longitude: 76.9,
      monthly_levels: [
        { month: "Jan", level_m: 13.2, recharge_index: 76 },
        { month: "Feb", level_m: 13.4, recharge_index: 75 },
        { month: "Mar", level_m: 13.7, recharge_index: 74 },
        { month: "Apr", level_m: 13.9, recharge_index: 73 },
        { month: "May", level_m: 13.8, recharge_index: 74 },
      ],
      recommendation: "Maintain canal conjunctive-use monitoring and promote micro-irrigation for sugarcane clusters.",
      recharge_recommendations: [
        "Use canal rotation periods to recharge shallow aquifers through managed percolation ponds.",
        "Desilt village tanks connected to command-area drainage.",
        "Create recharge trenches along field bunds in tail-end villages.",
      ],
      conservation_recommendations: [
        "Expand micro-irrigation for sugarcane and paddy transition plots.",
        "Track conjunctive use so canal releases reduce borewell pumping.",
        "Prioritize water budgeting for high-duty crop clusters.",
      ],
      ai_insights: [
        "Stable water levels suggest current recharge is holding, but extraction remains sensitive to crop choice.",
        "Command-area monitoring can prevent localized stress from being hidden by district averages.",
      ],
    },
    {
      name: "Kolar",
      state: "Karnataka",
      level_m: 28.1,
      trend: "falling",
      stress: "critical",
      recharge_index: 42,
      rainfall_mm: 438,
      extraction_mcm: 318,
      latitude: 13.13,
      longitude: 78.13,
      monthly_levels: [
        { month: "Jan", level_m: 23.6, recharge_index: 51 },
        { month: "Feb", level_m: 24.9, recharge_index: 48 },
        { month: "Mar", level_m: 26.0, recharge_index: 45 },
        { month: "Apr", level_m: 27.3, recharge_index: 43 },
        { month: "May", level_m: 28.1, recharge_index: 42 },
      ],
      recommendation: "Declare priority watch blocks, accelerate treated-water recharge pilots, and audit irrigation borewell abstraction.",
      recharge_recommendations: [
        "Scale treated-water recharge pilots with monthly quality checks.",
        "Build check dams and recharge wells in hard-rock fracture zones.",
        "Map abandoned borewells for safe conversion into recharge structures.",
      ],
      conservation_recommendations: [
        "Audit irrigation borewell abstraction in critical gram panchayats.",
        "Move high-water crops to protected cultivation or lower-duty alternatives.",
        "Introduce block-level extraction caps until post-monsoon recovery improves.",
      ],
      ai_insights: [
        "Critical stress, low rainfall, and high extraction point to structural aquifer depletion.",
        "Recharge alone will be insufficient unless abstraction controls are paired with demand reduction.",
      ],
    },
    {
      name: "Mysuru",
      state: "Karnataka",
      level_m: 11.6,
      trend: "rising",
      stress: "low",
      recharge_index: 86,
      rainfall_mm: 824,
      extraction_mcm: 148,
      latitude: 12.29,
      longitude: 76.64,
      monthly_levels: [
        { month: "Jan", level_m: 13.1, recharge_index: 78 },
        { month: "Feb", level_m: 12.8, recharge_index: 80 },
        { month: "Mar", level_m: 12.3, recharge_index: 83 },
        { month: "Apr", level_m: 11.9, recharge_index: 85 },
        { month: "May", level_m: 11.6, recharge_index: 86 },
      ],
      recommendation: "Continue watershed maintenance and preserve recharge zones from urban encroachment.",
      recharge_recommendations: [
        "Protect upstream watershed treatment structures from siltation.",
        "Maintain percolation tanks in forest-edge and foothill catchments.",
        "Use urban lakes as monitored recharge buffers after inlet filtration.",
      ],
      conservation_recommendations: [
        "Preserve mapped recharge zones in new urban development approvals.",
        "Keep municipal leakage reduction tied to ward-level groundwater trends.",
        "Encourage reuse for parks and institutions to avoid shallow aquifer drawdown.",
      ],
      ai_insights: [
        "Rising levels and strong recharge index show current watershed practices are working.",
        "The main risk is land-use change reducing infiltration faster than monitoring detects.",
      ],
    },
  ],
};

export function GroundwaterDashboard() {
  const [summary, setSummary] = useState(fallback);
  const [districtQuery, setDistrictQuery] = useState("");
  const [stateQuery, setStateQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictGroundwaterStatus>(fallback.districts[0]);
  const [aiRecommendation, setAiRecommendation] = useState(fallback.districts[0].recommendation);

  useEffect(() => {
    api.groundwater().then((data) => {
      setSummary(data);
      setSelectedDistrict(data.districts[0] ?? fallback.districts[0]);
      setAiRecommendation(data.districts[0]?.recommendation ?? fallback.districts[0].recommendation);
    }).catch(() => setSummary(fallback));
  }, []);

  const filteredDistricts = useMemo(() => {
    const districtTerm = districtQuery.trim().toLowerCase();
    const stateTerm = stateQuery.trim().toLowerCase();
    return summary.districts.filter((district) => {
      const matchesDistrict = !districtTerm || district.name.toLowerCase().includes(districtTerm);
      const matchesState = !stateTerm || district.state.toLowerCase().includes(stateTerm);
      return matchesDistrict && matchesState;
    });
  }, [districtQuery, stateQuery, summary.districts]);

  const availableStates = useMemo(() => Array.from(new Set(summary.districts.map((district) => district.state))), [summary.districts]);

  async function selectDistrict(district: DistrictGroundwaterStatus) {
    setSelectedDistrict(district);
    setAiRecommendation(district.recommendation);
    try {
      const result = await api.groundwaterQuery("Recommend groundwater actions based on stress, recharge, and extraction", district.name);
      setAiRecommendation(result.answer === "Retrieved groundwater context is available for this query. Use /chat for full Gemini-powered reasoning." ? district.recommendation : result.answer);
    } catch {
      setAiRecommendation(district.recommendation);
    }
  }

  return (
    <section className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Groundwater Intelligence Dashboard</h1>
          <p className="text-sm text-muted-foreground">District-level aquifer status, water stress, trends, and AI-assisted action planning.</p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[520px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search district" value={districtQuery} onChange={(event) => setDistrictQuery(event.target.value)} />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search state" value={stateQuery} onChange={(event) => setStateQuery(event.target.value)} />
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric title="Average Water Level" value={`${summary.average_level_m} m`} detail="below ground level" icon={<Gauge className="size-5" />} />
        <Metric title="Recharge Index" value={`${summary.recharge_index}/100`} icon={<TrendingUp className="size-5" />} />
        <Metric title="Active Alerts" value={summary.alert_count.toString()} icon={<AlertTriangle className="size-5" />} />
        <Metric title="Critical Blocks" value={(summary.critical_blocks ?? 0).toString()} icon={<ShieldAlert className="size-5" />} />
        <Metric title="Monitored Wells" value={(summary.monitored_wells ?? 0).toString()} icon={<Droplets className="size-5" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Districts</h2>
            <span className="text-xs text-muted-foreground">{availableStates.join(", ")}</span>
          </div>
          <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {filteredDistricts.map((district) => (
              <button
                key={district.name}
                className={`w-full rounded-md border p-3 text-left transition hover:bg-muted ${selectedDistrict.name === district.name ? "border-primary bg-muted" : "bg-card"}`}
                onClick={() => void selectDistrict(district)}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{district.name}</p>
                  <span className={stressBadge(district.stress)}>{district.stress}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{district.state} - {district.level_m} m depth - {district.trend}</p>
              </button>
            ))}
            {filteredDistricts.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No districts match the current district and state search.</div>
            ) : null}
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card className="relative min-h-[420px] overflow-hidden bg-[#dfeee8]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,94,89,0.08)_1px,transparent_1px),linear-gradient(rgba(18,94,89,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
            {summary.districts.map((district, index) => (
              <button
                key={district.name}
                className="absolute"
                style={{ left: `${18 + index * 21}%`, top: `${26 + (index % 2) * 31}%` }}
                onClick={() => void selectDistrict(district)}
                aria-label={`Select ${district.name}`}
              >
                <span className={mapPin(district.stress)}>
                  <MapPin className="size-5" />
                </span>
              </button>
            ))}
            <div className="absolute bottom-4 left-4 rounded-md border bg-card/95 p-3 shadow-sm">
              <p className="text-sm font-semibold">{selectedDistrict.name}</p>
              <p className="text-xs text-muted-foreground">{selectedDistrict.latitude}, {selectedDistrict.longitude}</p>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold">Water Stress Indicators</h2>
            <div className="mt-4 space-y-4">
              <Indicator label="Current depth" value={selectedDistrict.level_m} unit="m" max={35} />
              <Indicator label="Recharge index" value={selectedDistrict.recharge_index} unit="/100" max={100} inverse />
              <Indicator label="Rainfall" value={selectedDistrict.rainfall_mm} unit="mm" max={900} inverse />
              <Indicator label="Extraction" value={selectedDistrict.extraction_mcm} unit="MCM" max={360} />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecommendationCard
          title="Groundwater Status"
          icon={<Droplets className="size-5" />}
          items={[
            `${selectedDistrict.name}, ${selectedDistrict.state} is classified as ${selectedDistrict.stress} stress.`,
            `Water table is ${selectedDistrict.level_m} m below ground level and ${selectedDistrict.trend}.`,
            `Extraction is ${selectedDistrict.extraction_mcm} MCM against ${selectedDistrict.rainfall_mm} mm rainfall.`,
          ]}
        />
        <RecommendationCard title="Recharge Recommendations" icon={<Sprout className="size-5" />} items={selectedDistrict.recharge_recommendations} />
        <RecommendationCard title="Conservation Recommendations" icon={<Leaf className="size-5" />} items={selectedDistrict.conservation_recommendations} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold">District Water Table Depth</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.districts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="level_m" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold">{selectedDistrict.name} Trend</h2>
          <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selectedDistrict.monthly_levels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="level_m" stroke="#0f766e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="recharge_index" stroke="#d97706" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Brain className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">AI-Generated Insights</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{aiRecommendation}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {selectedDistrict.ai_insights.map((insight) => (
                <li key={insight} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
      <DocumentUpload />
    </section>
  );
}

function RecommendationCard({ title, icon, items }: { title: string; icon: ReactNode; items: string[] }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2 leading-6">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Metric({ title, value, icon, detail }: { title: string; value: string; icon: ReactNode; detail?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <p className="text-sm">{title}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
    </Card>
  );
}

function Indicator({ label, value, unit, max, inverse = false }: { label: string; value: number; unit: string; max: number; inverse?: boolean }) {
  const width = Math.min(100, Math.round((value / max) * 100));
  const color = inverse ? "bg-emerald-600" : width > 75 ? "bg-red-600" : width > 55 ? "bg-amber-500" : "bg-emerald-600";
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span>{value}{unit}</span>
      </div>
      <div className="h-2 rounded bg-muted">
        <div className={`h-2 rounded ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function stressBadge(stress: DistrictGroundwaterStatus["stress"]) {
  const base = "rounded px-2 py-1 text-xs font-medium capitalize";
  if (stress === "critical") return `${base} bg-red-100 text-red-700`;
  if (stress === "high") return `${base} bg-orange-100 text-orange-700`;
  if (stress === "moderate") return `${base} bg-amber-100 text-amber-700`;
  return `${base} bg-emerald-100 text-emerald-700`;
}

function mapPin(stress: DistrictGroundwaterStatus["stress"]) {
  if (stress === "critical") return "flex rounded-full bg-red-600 p-2 text-white shadow";
  if (stress === "high") return "flex rounded-full bg-orange-600 p-2 text-white shadow";
  if (stress === "moderate") return "flex rounded-full bg-amber-500 p-2 text-white shadow";
  return "flex rounded-full bg-emerald-600 p-2 text-white shadow";
}

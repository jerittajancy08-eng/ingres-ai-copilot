export type Citation = {
  title: string;
  source: string;
  excerpt: string;
  chunk_index: number;
  score?: number | null;
};

export type ChatResponse = {
  conversation_id?: string | null;
  answer: string;
  language: string;
  citations: Citation[];
};

export type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

export type GroundwaterSummary = {
  average_level_m: number;
  recharge_index: number;
  alert_count: number;
  critical_blocks?: number;
  monitored_wells?: number;
  districts: DistrictGroundwaterStatus[];
};

export type DistrictGroundwaterStatus = {
  name: string;
  state: string;
  level_m: number;
  trend: "rising" | "stable" | "falling";
  stress: "low" | "moderate" | "high" | "critical";
  recharge_index: number;
  rainfall_mm: number;
  extraction_mcm: number;
  latitude: number;
  longitude: number;
  monthly_levels: Array<{ month: string; level_m: number; recharge_index: number }>;
  recommendation: string;
  recharge_recommendations: string[];
  conservation_recommendations: string[];
  ai_insights: string[];
};

export type MapAsset = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: "normal" | "watch" | "critical";
};

export type Analytics = {
  total_users: number;
  admin_count: number;
  regular_user_count: number;
  total_conversations: number;
  total_documents: number;
};

export type User = {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
};

export type UserRole = "user" | "admin";

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type DocumentRecord = {
  id: string;
  title: string;
  source: string;
  content_type: string;
  chunk_count: number;
  created_at: string;
};

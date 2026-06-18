import { getToken } from "@/lib/auth";
import type { Analytics, ChatResponse, Conversation, DocumentRecord, GroundwaterSummary, MapAsset, TokenResponse, User, UserRole } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, init?: RequestInit, withJson = true): Promise<T> {
  const token = typeof window !== "undefined" ? getToken() : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(withJson ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = `API request failed: ${response.status}`;
    try {
      const payload = (await response.json()) as { detail?: string };
      detail = payload.detail ?? detail;
    } catch {
      // Keep the status-only message when the response is not JSON.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string) =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>("/auth/me"),
  logout: () => request<{ status: string }>("/auth/logout", { method: "POST" }),
  chat: (message: string, language: string, conversationId?: string, topK = 4) =>
    request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, language, conversation_id: conversationId, top_k: topK }),
    }),
  query: (query: string, language: string, topK = 4) =>
    request<ChatResponse>("/chat/query", {
      method: "POST",
      body: JSON.stringify({ query, language, top_k: topK }),
    }),
  conversations: () => request<Conversation[]>("/conversations"),
  groundwater: () => request<GroundwaterSummary>("/groundwater/summary"),
  groundwaterQuery: (query: string, district?: string, language = "en") =>
    request<{ answer: string; citations: Array<{ title: string; source: string; excerpt: string }> }>("/groundwater/query", {
      method: "POST",
      body: JSON.stringify({ query, district, language }),
    }),
  mapAssets: () => request<MapAsset[]>("/map/assets"),
  analytics: () => request<Analytics>("/admin/analytics"),
  documents: () => request<DocumentRecord[]>("/documents/list"),
  uploadDocument: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<DocumentRecord>("/documents/upload", { method: "POST", body: form }, false);
  },
  deleteDocument: (documentId: string) => request<{ status: string }>(`/documents/${documentId}`, { method: "DELETE" }),
  reindexDocument: (documentId: string) => request<{ status: string }>(`/documents/${documentId}/reindex`, { method: "POST" }),
  users: () => request<User[]>("/users"),
  createUser: (email: string, password: string, role: UserRole) =>
    request<User>("/users", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }),
  changeUserRole: (userId: string, role: UserRole) =>
    request<User>(`/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
};

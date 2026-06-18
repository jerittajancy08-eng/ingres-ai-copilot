"use client";

import { useEffect, useState } from "react";
import { FileSearch, Send, Volume2, Menu, X, Droplet, Plus, MessageSquare, MapPin, FileText, Settings, BarChart3, LogOut, ChevronDown, MoreVertical, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { InsightsPanel } from "./insights-panel";
import type { Citation } from "@/types/api";

type Message = { role: "user" | "assistant"; content: string; citations?: Citation[] };

type SmartAction = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
};

// Helper function to detect context-aware smart actions
function getSmartActions(
  content: string,
  citations: Citation[] | undefined,
  onViewMap: () => void,
  onGenerateReport: () => void,
  onCompareDistricts: () => void,
  onShowSources: () => void
): SmartAction[] {
  const actions: SmartAction[] = [];
  const lowerContent = content.toLowerCase();

  // Risk analysis keywords
  if (
    lowerContent.includes("risk") ||
    lowerContent.includes("contamination") ||
    lowerContent.includes("danger") ||
    lowerContent.includes("unsafe") ||
    lowerContent.includes("vulnerable")
  ) {
    actions.push({
      id: "analyze-risk",
      label: "Analyze Risk",
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      onClick: onViewMap, // Could be custom analysis
    });
  }

  // Map/location keywords - REMOVED (non-functional feature)
  // if (
  //   lowerContent.includes("district") ||
  //   lowerContent.includes("location") ||
  //   lowerContent.includes("map") ||
  //   lowerContent.includes("area") ||
  //   lowerContent.includes("region") ||
  //   lowerContent.includes("zone")
  // ) {
  //   actions.push({
  //     id: "view-map",
  //     label: "View on Map",
  //     icon: <MapPin className="h-3.5 w-3.5" />,
  //     onClick: onViewMap,
  //   });
  // }

  // Comparison keywords
  if (
    lowerContent.includes("compare") ||
    lowerContent.includes("difference") ||
    lowerContent.includes("versus") ||
    lowerContent.includes("vs.") ||
    (lowerContent.includes("district") && lowerContent.includes("better"))
  ) {
    actions.push({
      id: "compare-districts",
      label: "Compare Districts",
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      onClick: onCompareDistricts,
    });
  }

  // Report/export keywords
  if (
    lowerContent.includes("report") ||
    lowerContent.includes("summary") ||
    lowerContent.includes("findings") ||
    lowerContent.includes("export") ||
    lowerContent.includes("analysis")
  ) {
    actions.push({
      id: "generate-report",
      label: "Generate Report",
      icon: <FileText className="h-3.5 w-3.5" />,
      onClick: onGenerateReport,
    });
  }

  // Sources/citations
  if (citations && citations.length > 0) {
    actions.push({
      id: "show-sources",
      label: "Show Sources",
      icon: <FileSearch className="h-3.5 w-3.5" />,
      onClick: onShowSources,
    });
  }

  // Limit to max 3 actions
  return actions.slice(0, 3);
}

export function ChatWorkspace() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [input, setInput] = useState("");
  const [language] = useState("en");
  const [conversationId, setConversationId] = useState<string>();
  const [topK, setTopK] = useState(4);
  const [selectedCitation, setSelectedCitation] = useState<Citation>();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ask about groundwater levels, recharge, borewell safety, schemes, or district-level alerts." },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; title: string; updated_at: string }>>([]);
  const [canSpeak, setCanSpeak] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sourceViewerOpen, setSourceViewerOpen] = useState(false);
  const [insightsPanelOpen, setInsightsPanelOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);

  useEffect(() => {
    api.conversations().then(setHistory).catch(() => setHistory([]));
    setCanSpeak("speechSynthesis" in window);
  }, []);

  async function submit() {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setMessages((current) => [...current, { role: "user", content: userMessage }]);

    try {
      const response = await api.chat(userMessage, language, conversationId, topK);
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
      if (response.citations?.length) {
        setSelectedCitation(response.citations[0]);
        setSourceViewerOpen(true);
      }
      setMessages((current) => [...current, { role: "assistant", content: response.answer, citations: response.citations }]);
      api.conversations().then(setHistory).catch(() => undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[CHAT ERROR]", errorMessage);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `❌ API Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function speak(text: string) {
    if (!canSpeak || typeof window === "undefined") return;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  function groupHistoryByDate(items: Array<{ id: string; title: string; updated_at: string }>) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: Record<string, Array<{ id: string; title: string; updated_at: string }>> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    items.forEach((item) => {
      const itemDate = new Date(item.updated_at);
      const itemDayStart = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

      if (itemDayStart.getTime() === today.getTime()) {
        groups.Today.push(item);
      } else if (itemDayStart.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(item);
      } else {
        groups.Earlier.push(item);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-50 w-64 h-screen bg-white border-r border-slate-200/50 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200/50">
          <Link href="/" className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
              <Droplet className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">INGRES AI</div>
              <div className="text-xs text-slate-500">Copilot</div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </Link>
        </div>

        {/* New Chat Button */}
        <div className="px-4 py-3 border-b border-slate-200/50">
          <button
            onClick={() => {
              setConversationId(undefined);
              setMessages([{ role: "assistant", content: "Ask about groundwater levels, recharge, borewell safety, schemes, or district-level alerts." }]);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 border-b border-slate-200/50">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Main</h3>
          <div className="space-y-2">
            <Link
              href="/chat"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors bg-slate-100"
            >
              <MessageSquare className="h-4 w-4" />
              Copilot
            </Link>
          </div>
        </nav>

        {/* Admin Navigation */}
        {user?.role === "admin" && (
          <nav className="px-4 py-6 border-b border-slate-200/50">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Admin</h3>
            <div className="space-y-2">
              <Link
                href="/documents"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Documents
              </Link>
              <Link
                href="/analytics"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Settings className="h-4 w-4" />
                User Management
              </Link>
            </div>
          </nav>
        )}

        {/* Conversation History */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-4 border-b border-slate-200/50">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">History</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-3">
            {history.length ? (
              <div className="space-y-4">
                {groupHistoryByDate(history).map(([period, items]) => (
                  <div key={period}>
                    <h4 className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{period}</h4>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setConversationId(item.id);
                            setSidebarOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors truncate"
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-3 py-8 text-sm text-slate-500 text-center">No conversations yet</p>
            )}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">
              <p className="font-medium text-slate-900">{user?.email}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 bg-white">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6 text-slate-600" />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setInsightsPanelOpen(!insightsPanelOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors items-center gap-1 flex"
            title="Toggle insights panel"
          >
            <span className="text-xs font-medium text-slate-600">Insights</span>
            <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform ${insightsPanelOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Messages Area - Scroll Container */}
        <div className="flex-1 overflow-y-auto">
          {/* Conversation List - Content-sized, anchored to top */}
          <div className="flex flex-col items-start gap-5 w-full max-w-4xl mx-auto px-4 py-8">
            {messages.length === 1 && messages[0].role === "assistant" ? (
              // Empty State
              <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="mb-8">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-100 to-cyan-100">
                  <Droplet className="h-10 w-10 text-teal-600" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-3 max-w-2xl">Ask anything about groundwater</h2>
              <p className="text-lg text-slate-600 max-w-md mb-12">
                Get instant AI-powered answers about groundwater levels, recharge cycles, borewell safety, government schemes, and more.
              </p>

              {/* Example Prompts */}
              <div className="grid gap-3 w-full max-w-2xl">
                {[
                  "What are the current groundwater levels in my district?",
                  "Summarize the key findings from the uploaded reports",
                  "How does groundwater recharge work in dry seasons?",
                  "What are the recommendations for borewell safety?",
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(example);
                    }}
                    className="rounded-lg border border-slate-200/50 bg-white/50 backdrop-blur p-4 text-left text-sm text-slate-700 hover:border-teal-500/50 hover:bg-white transition-all hover:shadow-md group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-teal-500 flex-shrink-0 group-hover:scale-125 transition-transform" />
                      <span>{example}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} items-start w-full`}
                  onMouseEnter={() => message.role === "assistant" && setHoveredMessageIndex(index)}
                  onMouseLeave={() => setHoveredMessageIndex(null)}
                >
                  <div className={`${message.role === "user" ? "w-full max-w-2xl" : "w-auto max-w-2xl"}`}>
                    {/* User Message */}
                    {message.role === "user" && (
                      <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-3">
                        <p className="text-sm leading-6">{message.content}</p>
                      </div>
                    )}

                    {/* Assistant Message */}
                    {message.role === "assistant" && (
                      <div className="w-auto flex flex-col gap-2">
                        <div className="flex gap-3 items-start">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                            <Droplet className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex flex-col gap-2 w-auto min-w-0">
                            {/* Message Bubble */}
                            <div className="rounded-2xl rounded-tl-sm bg-white border border-slate-200/50 px-4 py-3 shadow-sm w-auto max-w-2xl">
                              <p className="text-sm leading-6 text-slate-900 whitespace-pre-wrap">{message.content}</p>
                            </div>

                            {/* Message Toolbar - Hidden by default, shown on hover */}
                            <div className={`${hoveredMessageIndex === index ? "opacity-100" : "opacity-0"} transition-opacity duration-150 flex gap-2 items-center mt-1`}>
                              {/* Copy Button */}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(message.content);
                                }}
                                className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                                title="Copy response"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>

                              {/* Read Aloud Button */}
                              <button
                                onClick={() => speak(message.content)}
                                className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                                title="Read response aloud"
                              >
                                <Volume2 className="h-3.5 w-3.5" />
                              </button>

                              {/* Like Button */}
                              <button
                                onClick={() => console.log("Liked message")}
                                className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                                title="Like this response"
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </button>

                              {/* Dislike Button */}
                              <button
                                onClick={() => console.log("Disliked message")}
                                className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                                title="Dislike this response"
                              >
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Smart Actions - Context-aware and only when relevant */}
                            {(() => {
                              const smartActions = getSmartActions(
                                message.content,
                                message.citations,
                                () => router.push("/map"),
                                () => console.log("Generate Report"),
                                () => console.log("Compare Districts"),
                                () => setSourceViewerOpen(true)
                              );
                              return smartActions.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {smartActions.map((action) => (
                                    <button
                                      key={action.id}
                                      onClick={action.onClick}
                                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:text-slate-900"
                                      title={action.label}
                                    >
                                      {action.icon}
                                      <span>{action.label}</span>
                                    </button>
                                  ))}
                                </div>
                              ) : null;
                            })()}

                            {/* Citations */}
                            {message.citations?.length > 0 && (
                              <div className="flex flex-col gap-2 mt-2">
                                <p className="text-xs font-medium text-slate-600 px-1">Sources:</p>
                                <div className="flex flex-wrap gap-2">
                                  {message.citations.map((citation, citationIndex) => (
                                    <button
                                      key={`${citation.source}-${citation.chunk_index}-${citationIndex}`}
                                      onClick={() => {
                                        setSelectedCitation(citation);
                                        setSourceViewerOpen(true);
                                      }}
                                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors"
                                    >
                                      <FileSearch className="h-3 w-3" />
                                      <span>[{citationIndex + 1}]</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start items-start w-full">
                  <div className="flex gap-3 items-start">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                      <Droplet className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0s" }} />
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-slate-200/50 bg-white px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <textarea
                className="flex-1 min-h-10 max-h-32 rounded-lg border border-slate-200/50 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                placeholder="Ask the groundwater copilot..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void submit();
                  }
                }}
              />

              <button
                onClick={() => void submit()}
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Drawer - Slide-over Panel */}
      {insightsPanelOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setInsightsPanelOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto z-50 border-l border-slate-200/50 flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200/50 px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Insights</h2>
              <button
                onClick={() => setInsightsPanelOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <InsightsPanel />
            </div>
          </div>
        </>
      )}

      {/* Source Viewer Drawer */}
      {sourceViewerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSourceViewerOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200/50 px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Source Details</h2>
              <button
                onClick={() => setSourceViewerOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* Content */}
            {selectedCitation && (
              <div className="p-6 space-y-6">
                {/* Source Info */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{selectedCitation.title}</h3>
                  <p className="text-sm text-slate-600 break-all">{selectedCitation.source}</p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200/50 p-3">
                    <p className="text-xs font-medium text-slate-500">Chunk</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedCitation.chunk_index}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200/50 p-3">
                    <p className="text-xs font-medium text-slate-500">Relevance</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {typeof selectedCitation.score === "number"
                        ? Math.max(0, selectedCitation.score).toFixed(2)
                        : "n/a"}
                    </p>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-3">Content</h4>
                  <div className="rounded-lg bg-slate-50 border border-slate-200/50 p-4">
                    <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">
                      {selectedCitation.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { FileSearch, Mic, Send, SlidersHorizontal, Volume2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Citation } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Message = { role: "user" | "assistant"; content: string; citations?: Citation[] };

export function ChatWorkspace() {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [conversationId, setConversationId] = useState<string>();
  const [topK, setTopK] = useState(4);
  const [selectedCitation, setSelectedCitation] = useState<Citation>();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ask about groundwater levels, recharge, borewell safety, schemes, or district-level alerts." },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; title: string; updated_at: string }>>([]);
  const [canSpeak, setCanSpeak] = useState(false);

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
      setSelectedCitation(response.citations[0]);
      setMessages((current) => [...current, { role: "assistant", content: response.answer, citations: response.citations }]);
      api.conversations().then(setHistory).catch(() => undefined);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I could not reach the API, but the interface is ready. Start the FastAPI service to enable Gemini-powered RAG answers.",
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

  return (
    <section className="grid h-[calc(100vh-3.5rem)] lg:grid-cols-[1fr_360px]">
      <div className="flex min-w-0">
      <div className="hidden w-80 border-r bg-card p-4 xl:block">
        <h2 className="text-sm font-semibold">Conversation History</h2>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          {history.length ? history.map((item) => (
            <button key={item.id} className="block w-full rounded-md px-2 py-2 text-left hover:bg-muted" onClick={() => setConversationId(item.id)}>
              {item.title}
            </button>
          )) : <p>No saved conversations yet</p>}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
          {messages.map((message, index) => (
            <div key={index} className={message.role === "user" ? "ml-auto max-w-3xl" : "mr-auto max-w-3xl"}>
              <Card className={message.role === "user" ? "bg-primary p-4 text-primary-foreground" : "p-4"}>
                <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                {message.citations?.length ? (
                  <div className="mt-4 space-y-2 border-t pt-3">
                    {message.citations.map((citation, citationIndex) => (
                      <button
                        key={`${citation.source}-${citation.chunk_index}-${citationIndex}`}
                        className="block w-full rounded-md border bg-background p-3 text-left text-xs text-muted-foreground hover:bg-muted"
                        onClick={() => setSelectedCitation(citation)}
                      >
                        <span className="flex items-center gap-2 font-semibold text-foreground">
                          <FileSearch className="size-3.5 text-primary" />
                          [{citationIndex + 1}] {citation.title}
                        </span>
                        <span className="mt-1 block">
                          Chunk {citation.chunk_index}
                          {typeof citation.score === "number" ? ` - relevance ${Math.max(0, citation.score).toFixed(2)}` : ""}
                        </span>
                        <span className="mt-2 line-clamp-2 block">{citation.excerpt}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                {message.role === "assistant" && (
                  <Button className="mt-3 h-8 px-2" variant="ghost" onClick={() => speak(message.content)} aria-label="Read response aloud">
                    <Volume2 className="size-4" />
                  </Button>
                )}
              </Card>
            </div>
          ))}
        </div>
        <div className="border-t bg-card p-3">
          <div className="mx-auto flex max-w-4xl gap-2">
            <select className="rounded-md border bg-card px-3 text-sm" value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="kn">Kannada</option>
            </select>
            <Button variant="secondary" aria-label="Voice input">
              <Mic className="size-4" />
            </Button>
            <label className="hidden items-center gap-2 rounded-md border bg-card px-3 text-sm md:flex">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <span className="sr-only">Top K</span>
              <select className="bg-card outline-none" value={topK} onChange={(event) => setTopK(Number(event.target.value))}>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={8}>8</option>
              </select>
            </label>
            <textarea
              className="min-h-10 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ask the groundwater copilot..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit();
                }
              }}
            />
            <Button onClick={() => void submit()} disabled={isLoading} aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
      </div>
      <aside className="hidden border-l bg-card p-4 lg:block">
        <h2 className="text-sm font-semibold">Source Viewer</h2>
        {selectedCitation ? (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-semibold">{selectedCitation.title}</p>
              <p className="mt-1 break-all text-xs text-muted-foreground">{selectedCitation.source}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Chunk</p>
                <p className="mt-1 font-semibold">{selectedCitation.chunk_index}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Relevance</p>
                <p className="mt-1 font-semibold">
                  {typeof selectedCitation.score === "number" ? Math.max(0, selectedCitation.score).toFixed(2) : "n/a"}
                </p>
              </div>
            </div>
            <div className="max-h-[calc(100vh-17rem)] overflow-y-auto rounded-md border bg-background p-3">
              <p className="whitespace-pre-wrap text-sm leading-6">{selectedCitation.excerpt}</p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Run a query and select a citation to inspect the retrieved source chunk.</p>
        )}
      </aside>
    </section>
  );
}

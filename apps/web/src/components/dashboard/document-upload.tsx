"use client";

import { useEffect, useState } from "react";
import { FileText, RefreshCw, Upload } from "lucide-react";
import { api } from "@/lib/api";
import type { DocumentRecord } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DocumentUpload() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>();
  const [selected, setSelected] = useState<DocumentRecord>();

  useEffect(() => {
    void loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const rows = await api.documents();
      setDocuments(rows);
      setSelected((current) => current ?? rows[0]);
    } catch {
      setDocuments([]);
    }
  }

  async function upload(file?: File) {
    if (!file) return;
    setIsUploading(true);
    setError(undefined);
    try {
      const created = await api.uploadDocument(file);
      setDocuments((current) => [created, ...current]);
      setSelected(created);
    } catch {
      setError("Upload failed. Please use a PDF, DOCX, or TXT file with extractable text.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] gap-4 p-4 lg:grid-cols-[420px_1fr]">
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-base font-semibold">Documents</h1>
              <p className="text-sm text-muted-foreground">Upload PDF, DOCX, and TXT files for grounded RAG answers.</p>
            </div>
            <Button variant="secondary" onClick={() => void loadDocuments()} aria-label="Refresh documents">
              <RefreshCw className="size-4" />
            </Button>
          </div>
          <label className="mt-4 block rounded-md border border-dashed bg-background p-5 text-center">
            <input
              className="sr-only"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={(event) => void upload(event.target.files?.[0])}
            />
            <span className="inline-flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Upload className="size-5" />
            </span>
            <span className="mt-3 block text-sm font-medium">{isUploading ? "Indexing document" : "Choose a document"}</span>
            <span className="mt-1 block text-xs text-muted-foreground">Text is extracted, chunked, embedded, and stored in ChromaDB.</span>
          </label>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </Card>
        <div className="space-y-2">
          {documents.map((document) => (
            <button
              key={document.id}
              className="w-full rounded-md border bg-card p-3 text-left text-sm transition hover:bg-muted"
              onClick={() => setSelected(document)}
            >
              <span className="flex items-center gap-2 font-medium">
                <FileText className="size-4 text-primary" />
                {document.title}
              </span>
              <span className="mt-2 block text-xs text-muted-foreground">
                {document.chunk_count} chunks indexed - {document.content_type}
              </span>
            </button>
          ))}
          {!documents.length ? <p className="text-sm text-muted-foreground">No documents indexed yet.</p> : null}
        </div>
      </div>
      <Card className="p-5">
        <div>
          <h2 className="text-sm font-semibold">Source Viewer</h2>
          {selected ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-lg font-semibold">{selected.title}</p>
                <p className="mt-1 break-all text-sm text-muted-foreground">{selected.source}</p>
              </div>
              <dl className="grid gap-3 text-sm md:grid-cols-3">
                <div className="rounded-md border p-3">
                  <dt className="text-xs text-muted-foreground">Chunks</dt>
                  <dd className="mt-1 font-semibold">{selected.chunk_count}</dd>
                </div>
                <div className="rounded-md border p-3">
                  <dt className="text-xs text-muted-foreground">Type</dt>
                  <dd className="mt-1 font-semibold">{selected.content_type}</dd>
                </div>
                <div className="rounded-md border p-3">
                  <dt className="text-xs text-muted-foreground">Indexed</dt>
                  <dd className="mt-1 font-semibold">{new Date(selected.created_at).toLocaleDateString()}</dd>
                </div>
              </dl>
              <p className="rounded-md bg-muted p-4 text-sm leading-6 text-muted-foreground">
                Ask a question in Copilot to retrieve exact chunks from this source. Citations open with the retrieved text used to ground the answer.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Select an indexed document to inspect its metadata.</p>
          )}
        </div>
      </Card>
    </section>
  );
}

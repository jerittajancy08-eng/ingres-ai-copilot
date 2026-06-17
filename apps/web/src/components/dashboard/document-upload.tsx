"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, RefreshCw, Trash2, Upload, AlertTriangle, TrendingDown, FileUp, MessageSquare, Zap } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { DocumentRecord } from "@/types/api";
import { useAuth } from "@/lib/auth-context";

export function DocumentUpload() {
  const { user } = useAuth();
  const canUpload = user?.role !== "viewer";
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<string>();
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
    setStatus("Analyzing document and extracting insights...");
    try {
      const created = await api.uploadDocument(file);
      setDocuments((current) => [created, ...current]);
      setSelected(created);
      setStatus(`✓ Indexed ${created.chunk_count} chunks. Document is now available to Copilot.`);
      setTimeout(() => setStatus(undefined), 3000);
    } catch (error) {
      setStatus(undefined);
      setError(error instanceof Error ? error.message : "Upload failed. Please use PDF, DOCX, or XLSX files.");
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteDocument(document: DocumentRecord) {
    setError(undefined);
    setStatus(undefined);
    try {
      await api.deleteDocument(document.id);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      setSelected((current) => current?.id === document.id ? undefined : current);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Delete failed.");
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void upload(file);
    }
  };

  // Sample analysis data for selected document
  const sampleAnalysis = {
    summary: "This document contains comprehensive groundwater assessment data for Karnataka region with focus on recharge patterns and well management.",
    findings: [
      "Average water table depth increased by 2.3 meters in past year",
      "Recharge success rate estimated at 68% during monsoon",
      "Critical fluoride contamination in 3 districts"
    ],
    risks: [
      { level: "High", text: "Water depletion risk in Kolar district" },
      { level: "Medium", text: "Seasonal recharge uncertainty" },
      { level: "Low", text: "Minor contamination in monitoring zones" }
    ],
    districts: ["Kolar", "Mysuru", "Mandya", "Hassan"],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <div className="border-b border-slate-200/50 bg-white px-6 py-6">
        <h1 className="text-2xl font-bold text-slate-900">Document Intelligence</h1>
        <p className="mt-1 text-slate-600">Upload and analyze groundwater reports, studies, and technical documents</p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 p-6 lg:grid-cols-[400px_1fr]">
        {/* Upload Section */}
        <div className="space-y-6">
          {/* Upload Card */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              dragActive
                ? "border-teal-500 bg-teal-50/50"
                : "border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/30"
            }`}
          >
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100">
              <FileUp className="h-7 w-7 text-teal-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Upload Documents</h2>
            <p className="mt-1 text-sm text-slate-600">Drag and drop or click to upload</p>
            <p className="mt-2 text-xs text-slate-500">Supported: PDF, DOCX, XLSX</p>

            <label className="mt-4 block">
              <input
                className="sr-only"
                type="file"
                accept=".pdf,.docx,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(event) => void upload(event.target.files?.[0])}
                disabled={isUploading}
              />
              <button
                disabled={isUploading}
                className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 transition-all"
              >
                {isUploading ? "Analyzing..." : "Select Document"}
              </button>
            </label>

            {status && (
              <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                <p className="text-sm text-emerald-900">{status}</p>
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}
          </div>

          {/* Documents List */}
          <div className="rounded-2xl border border-slate-200/50 bg-white p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Recent Documents ({documents.length})</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {documents.length ? (
                documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelected(doc)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      selected?.id === doc.id
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-200/50 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{doc.filename}</p>
                        <p className="text-xs text-slate-500">{doc.chunk_count} chunks</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No documents yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        {selected ? (
          <div className="space-y-6">
            {/* Document Header */}
            <div className="rounded-2xl border border-slate-200/50 bg-white p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selected.filename}</h2>
                  <p className="mt-1 text-sm text-slate-600">{selected.chunk_count} indexed chunks · Available to Copilot</p>
                </div>
                <button
                  onClick={() => deleteDocument(selected)}
                  className="rounded-lg p-2 hover:bg-red-50 text-red-600 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-slate-200/50 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Summary</h3>
              <p className="text-sm leading-6 text-slate-700">{sampleAnalysis.summary}</p>
            </div>

            {/* Key Findings */}
            <div className="rounded-2xl border border-slate-200/50 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Key Findings</h3>
              <div className="space-y-3">
                {sampleAnalysis.findings.map((finding, idx) => (
                  <div key={idx} className="flex gap-3 rounded-lg border border-slate-200/50 bg-slate-50 p-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-900">{finding}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="rounded-2xl border border-slate-200/50 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Critical Risks</h3>
              <div className="space-y-3">
                {sampleAnalysis.risks.map((risk, idx) => {
                  const bgColor = risk.level === "High" ? "bg-red-50 border-red-200" : risk.level === "Medium" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200";
                  const textColor = risk.level === "High" ? "text-red-900" : risk.level === "Medium" ? "text-amber-900" : "text-emerald-900";
                  const icon = risk.level === "High" ? "text-red-600" : risk.level === "Medium" ? "text-amber-600" : "text-emerald-600";
                  return (
                    <div key={idx} className={`flex gap-3 rounded-lg border p-3 ${bgColor}`}>
                      <AlertTriangle className={`h-5 w-5 ${icon} flex-shrink-0 mt-0.5`} />
                      <div>
                        <p className={`text-xs font-semibold ${textColor}`}>{risk.level} Risk</p>
                        <p className={`text-sm mt-0.5 ${textColor}`}>{risk.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Districts Mentioned */}
            <div className="rounded-2xl border border-slate-200/50 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Districts Mentioned</h3>
              <div className="flex flex-wrap gap-2">
                {sampleAnalysis.districts.map((district) => (
                  <span key={district} className="inline-flex items-center gap-1 rounded-full bg-teal-100 border border-teal-200 px-3 py-1.5 text-sm font-medium text-teal-900">
                    <Zap className="h-3 w-3" />
                    {district}
                  </span>
                ))}
              </div>
            </div>

            {/* Chat Section */}
            <div className="rounded-2xl border border-slate-200/50 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Chat with Document</h3>
              <p className="text-sm text-slate-600 mb-4">Ask questions about this document and get AI-powered answers</p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                Open Chat
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4 opacity-50" />
            <p className="text-slate-600 font-medium">No document selected</p>
            <p className="text-sm text-slate-500">Upload a document to view analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}

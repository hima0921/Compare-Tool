"use client"

import { useState, useRef } from "react"

export type DocumentSlot = {
  id: string
  label: string
  mode: "paste" | "upload"
  text: string
  fileName?: string
}

let nextId = 3

function makeSlot(index: number): DocumentSlot {
  return { id: `doc-${index}-${Date.now()}`, label: `Document ${index}`, mode: "paste", text: "" }
}

export function DocumentInput({
  onCompare,
}: {
  onCompare: (docs: DocumentSlot[]) => void
}) {
  const [docs, setDocs] = useState<DocumentSlot[]>([makeSlot(1), makeSlot(2)])
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function updateDoc(id: string, patch: Partial<DocumentSlot>) {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  function addDoc() {
    nextId += 1
    setDocs((prev) => [...prev, makeSlot(nextId)])
  }

  function removeDoc(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id))
  }

  async function handleFile(id: string, file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    updateDoc(id, { fileName: file.name, mode: "upload", text: "Extracting text…" })

    try {
      let text = ""
      if (["docx"].includes(ext)) {
        const mammoth = await import("mammoth")
        const buf = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer: buf })
        text = result.value
      } else if (ext === "pdf") {
        const buf = await file.arrayBuffer()
        const res = await fetch("/api/extract-pdf", { method: "POST", body: buf })
        const data = await res.json()
        text = data.text ?? ""
      } else {
        // Plain text-like files: txt, json, tex, md, code files, etc.
        text = await file.text()
      }
      updateDoc(id, { text })
    } catch (err) {
      updateDoc(id, { text: `⚠ Could not extract text from this file (${(err as Error).message}).` })
    }
  }

  const readyCount = docs.filter((d) => d.text.trim().length > 0).length
  const canCompare = readyCount >= 2

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-pen-red mb-2">
          Manuscript Collation
        </p>
        <h1 className="font-display text-4xl font-semibold text-ink mb-3">
          Compare any set of documents
        </h1>
        <p className="text-ink-soft max-w-xl leading-relaxed">
          Paste text or upload files below. We&apos;ll mark every word-for-word change like a red
          editing pen, then read across all of them for what&apos;s missing, added, or in conflict.
        </p>
      </header>

      <div className="space-y-5">
        {docs.map((doc, idx) => (
          <div
            key={doc.id}
            className="rounded-sm border border-rule bg-paper-raised shadow-[0_1px_0_0_var(--rule)] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <input
                value={doc.label}
                onChange={(e) => updateDoc(doc.id, { label: e.target.value })}
                className="font-mono text-sm font-medium text-ink bg-transparent border-b border-transparent hover:border-rule focus:border-pen-blue outline-none px-0.5"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateDoc(doc.id, { mode: "paste", fileName: undefined })}
                  className={`text-xs font-mono px-2 py-1 rounded-sm ${
                    doc.mode === "paste" ? "bg-pen-blue-bg text-pen-blue" : "text-ink-soft"
                  }`}
                >
                  Paste
                </button>
                <button
                  onClick={() => fileInputRefs.current[doc.id]?.click()}
                  className={`text-xs font-mono px-2 py-1 rounded-sm ${
                    doc.mode === "upload" ? "bg-pen-blue-bg text-pen-blue" : "text-ink-soft"
                  }`}
                >
                  Upload
                </button>
                <input
                  ref={(el) => {
                    fileInputRefs.current[doc.id] = el
                  }}
                  type="file"
                  className="hidden"
                  accept=".txt,.json,.tex,.md,.docx,.pdf,.js,.jsx,.ts,.tsx,.py,.html,.css,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(doc.id, file)
                  }}
                />
                {docs.length > 2 && (
                  <button
                    onClick={() => removeDoc(doc.id)}
                    className="text-xs font-mono text-pen-red/70 hover:text-pen-red px-1"
                    aria-label={`Remove ${doc.label}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {doc.mode === "paste" ? (
              <textarea
                value={doc.text}
                onChange={(e) => updateDoc(doc.id, { text: e.target.value })}
                placeholder="Paste text here…"
                rows={5}
                className="w-full resize-y font-mono text-sm text-ink bg-paper border border-rule rounded-sm p-3 outline-none focus:border-pen-blue placeholder:text-ink-soft/60"
              />
            ) : (
              <div className="w-full font-mono text-sm text-ink-soft bg-paper border border-dashed border-rule rounded-sm p-3 min-h-[3rem]">
                {doc.fileName ? (
                  <>
                    <span className="text-ink">{doc.fileName}</span>
                    <div className="mt-2 text-xs text-ink-soft line-clamp-3 whitespace-pre-wrap">
                      {doc.text.slice(0, 220)}
                      {doc.text.length > 220 ? "…" : ""}
                    </div>
                  </>
                ) : (
                  "No file selected yet — click Upload above."
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={addDoc}
          className="font-mono text-sm text-pen-blue hover:underline underline-offset-4"
        >
          + Add another document
        </button>
        <span className="font-mono text-xs text-ink-soft">
          {readyCount} of {docs.length} ready
        </span>
      </div>

      <button
        disabled={!canCompare}
        onClick={() => onCompare(docs.filter((d) => d.text.trim().length > 0))}
        className="mt-8 w-full font-mono text-sm font-medium py-3 rounded-sm transition-colors
          disabled:bg-rule disabled:text-ink-soft disabled:cursor-not-allowed
          bg-pen-red text-paper-raised hover:bg-[#8c2f25]"
      >
        Compare All
      </button>
    </div>
  )
}

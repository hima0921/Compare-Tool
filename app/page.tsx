"use client"

import { DocumentInput, type DocumentSlot } from "@/components/document-input"

export default function Home() {
  function handleCompare(docs: DocumentSlot[]) {
    console.log("Ready to compare:", docs)
    // Diff + meaning-review logic gets wired in here on Day 3/4.
  }

  return (
    <main className="min-h-screen bg-paper">
      <DocumentInput onCompare={handleCompare} />
    </main>
  )
}

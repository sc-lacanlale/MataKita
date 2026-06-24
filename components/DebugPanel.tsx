"use client";

import { useEffect, useState } from "react";
import {
  clearDebug,
  getDebugEntries,
  subscribeDebug,
  type DebugEntry,
} from "@/lib/debugLog";

function fmt(t: number): string {
  const d = new Date(t);
  return d.toLocaleTimeString([], { hour12: false }) + "." + String(d.getMilliseconds()).padStart(3, "0");
}

export default function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<DebugEntry[]>([]);

  useEffect(() => {
    const update = () => setEntries([...getDebugEntries()]);
    update();
    return subscribeDebug(update);
  }, []);

  if (!open) {
    return (
      <button className="debug-toggle" onClick={() => setOpen(true)} aria-label="Show debug transcript">
        Debug
      </button>
    );
  }

  return (
    <div className="debug-panel">
      <div className="debug-head">
        <strong>Transcript</strong>
        <span>
          <button className="debug-btn" onClick={() => clearDebug()}>Clear</button>
          <button className="debug-btn" onClick={() => setOpen(false)}>Hide</button>
        </span>
      </div>
      <div className="debug-body">
        {entries.length === 0 && <div className="debug-empty">No events yet. Speak or tap.</div>}
        {[...entries].reverse().map((e) => (
          <div className="debug-row" key={e.id}>
            <span className="debug-time">{fmt(e.t)}</span>
            <span className={`debug-tag debug-tag-${e.tag.replace(/[^a-z]/gi, "")}`}>{e.tag}</span>
            <span className="debug-text">{e.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CameraPreview from "./CameraPreview";
import type { ModeDefinition } from "@/lib/modes";
import { startSession, type GeminiSession, type SessionStatus } from "@/lib/services/geminiService";
import { speak } from "@/lib/voice";
import { onDescribeRequested } from "@/lib/commandBus";

interface ModeShellProps {
  mode: ModeDefinition;
}

export default function ModeShell({ mode }: ModeShellProps) {
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [message, setMessage] = useState<string>(mode.description);
  const [showDetection, setShowDetection] = useState(true);
  const sessionRef = useRef<GeminiSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function startAssistant() {
    sessionRef.current?.stop();
    sessionRef.current = startSession({
      mode,
      getStream: () => streamRef.current,
      onStatus: (s) => {
        setStatus(s);
        if (s === "live") {
          setMessage((m) =>
            m === mode.description || m === "Assistant stopped."
              ? 'Handa na. Sabihin: "Hey Kita, tingin" o magtanong.'
              : m
          );
        }
        if (s === "error") setMessage("Assistant error. Check network or API key.");
      },
      onMessage: (text) => {
        setMessage(text);
        speak(text);
      },
    });
  }

  function stopAssistant() {
    sessionRef.current?.stop();
    sessionRef.current = null;
    setStatus("idle");
    setMessage("Assistant stopped.");
  }

  function describe(query?: string) {
    if (!sessionRef.current) {
      startAssistant();
      setMessage("Sandali, naghahanda pa...");
      return;
    }
    setMessage(query ? `Tinitingnan: ${query}` : "Sandali, tinitingnan...");
    sessionRef.current.describe(query);
  }

  // Auto-connect the assistant on entry so describe-on-command is instant.
  useEffect(() => {
    startAssistant();
    const off = onDescribeRequested((payload) => describe(payload));
    return () => {
      off();
      sessionRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLive = status === "live" || status === "connecting";

  return (
    <main className="screen">
      <header className="screen-header">
        <Link href="/" className="btn btn-small btn-ghost" style={{ width: "auto" }} aria-label="Back to home">
          Back
        </Link>
        <div>
          <h1 className="screen-title">{mode.label}</h1>
          <p className="screen-subtitle">{mode.focus}</p>
        </div>
      </header>

      <CameraPreview
        autoStart
        showDetection={showDetection}
        onStream={(s) => {
          streamRef.current = s;
        }}
      />

      <div className="toggle-row">
        <span>Show object boxes (visual only)</span>
        <button
          className={`btn btn-small ${showDetection ? "btn-accent" : "btn-ghost"}`}
          style={{ width: "auto" }}
          aria-pressed={showDetection}
          onClick={() => setShowDetection((v) => !v)}
        >
          {showDetection ? "On" : "Off"}
        </button>
      </div>

      <div className="card">
        <p className="muted" style={{ marginTop: 0 }}>Priorities</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {mode.priorities.map((p) => (
            <span className="pill" key={p}>{p}</span>
          ))}
          <span className="pill">~{mode.targetFps} fps</span>
        </div>
      </div>

      <div className="status-line" role="status" aria-live="polite">
        {message}
      </div>

      <div className="spacer" />

      <button className="btn btn-accent" onClick={() => describe()} aria-label="Describe what is in front of me">
        Ano ang nasa harap ko?
      </button>

      <div className="row">
        {!isLive ? (
          <button className="btn btn-small btn-ghost" onClick={startAssistant}>
            Reconnect
          </button>
        ) : (
          <button className="btn btn-small btn-ghost" onClick={stopAssistant}>
            Stop assistant
          </button>
        )}
      </div>
    </main>
  );
}

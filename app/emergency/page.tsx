"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  startHandoff,
  type HandoffSession,
  type HandoffTarget,
} from "@/lib/services/webrtcService";
import { triggerPanic } from "@/lib/services/hazardService";
import { speak } from "@/lib/voice";

export default function EmergencyPage() {
  const [steps, setSteps] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [active, setActive] = useState(false);
  const sessionRef = useRef<HandoffSession | null>(null);

  function begin(target: HandoffTarget) {
    sessionRef.current?.cancel();
    setSteps([]);
    setConnected(false);
    setActive(true);
    triggerPanic("button");
    speak("Emergency fallback activated. Connecting you now.");
    sessionRef.current = startHandoff({
      target,
      contextSummary: "User triggered emergency fallback from the app.",
      onStep: (step) => setSteps((prev) => [...prev, step.label]),
      onConnected: () => setConnected(true),
    });
  }

  function cancel() {
    sessionRef.current?.cancel();
    sessionRef.current = null;
    setActive(false);
    setConnected(false);
    setSteps([]);
  }

  return (
    <main className="screen">
      <header className="screen-header">
        <Link href="/" className="btn btn-small btn-ghost" style={{ width: "auto" }} aria-label="Back to home">
          Back
        </Link>
        <div>
          <h1 className="screen-title">Emergency</h1>
          <p className="screen-subtitle">Drop the AI layer and reach a human.</p>
        </div>
      </header>

      {!active ? (
        <div className="grid">
          <button className="btn btn-danger" onClick={() => begin("volunteer")}>
            Call a volunteer
          </button>
          <button className="btn" onClick={() => begin("emergency-contact")}>
            Call emergency contact
          </button>
          <button className="btn" onClick={() => begin("emergency-services")}>
            Call emergency services
          </button>
        </div>
      ) : (
        <section className="card">
          <h2 style={{ marginTop: 0 }}>
            {connected ? "Connected" : "Connecting..."}
          </h2>
          <ul className="steps">
            {steps.map((s, i) => (
              <li key={i}>
                <span className="check" aria-hidden="true">OK</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <div className="status-line" role="status" aria-live="assertive" style={{ marginTop: 14 }}>
            {connected
              ? "Live stream and GPS shared with your responder."
              : "Setting up live stream and location..."}
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={cancel}>
            Cancel
          </button>
        </section>
      )}
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icons";
import {
  startHandoff,
  type HandoffSession,
  type HandoffTarget,
} from "@/lib/services/webrtcService";
import { triggerPanic } from "@/lib/services/hazardService";
import { speak } from "@/lib/voice";

export default function VideoCallScreen() {
  const [connected, setConnected] = useState(false);
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fall, setFall] = useState(false);
  const sessionRef = useRef<HandoffSession | null>(null);
  const autoStartedRef = useRef(false);

  // Fall-detection routes here with ?fall=1 (only after the countdown finishes
  // or the user taps "Get help now"), so we auto-start the emergency call.
  // The normal Video Call tab does NOT auto-start; the user taps to call.
  useEffect(() => {
    const isFall = new URLSearchParams(window.location.search).get("fall") === "1";
    setFall(isFall);
    if (isFall && !autoStartedRef.current) {
      autoStartedRef.current = true;
      begin("emergency-services");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function begin(target: HandoffTarget) {
    sessionRef.current?.cancel();
    setConnected(false);
    setActive(true);
    if (target === "volunteer") {
      speak("Kumokonekta sa isang volunteer.");
    } else {
      triggerPanic("button");
      speak("Tumatawag ng tulong.");
    }
    sessionRef.current = startHandoff({
      target,
      contextSummary:
        target === "volunteer"
          ? "User started a video call from the app."
          : "Fall detected: contacting emergency help.",
      onStep: () => {},
      onConnected: () => setConnected(true),
    });
  }

  function end() {
    sessionRef.current?.cancel();
    sessionRef.current = null;
    setActive(false);
    setConnected(false);
    setMuted(false);
  }

  return (
    <main className="call-screen">
      <div className="app-bar">
        <BrandLogo tone="dark" />
        <div className="status-dots" aria-hidden="true">
          <span />
          <span />
        </div>
      </div>

      <div className="call-stage">
        {active ? (
          <>
            <div className="cam-placeholder">
              {connected ? "Naka-connect" : "Kumokonekta..."}
            </div>
            <div className="call-self" aria-hidden="true" />
            <p className="call-status" role="status" aria-live="polite">
              {fall
                ? connected
                  ? "Naka-connect sa emergency services. Live ang video at lokasyon."
                  : "Tumatawag sa emergency services..."
                : connected
                  ? "Live na ang video at lokasyon sa kausap mo."
                  : "Inaayos ang live stream at lokasyon..."}
            </p>
          </>
        ) : (
          <div className="call-precard">
            <div className="call-avatar" aria-hidden="true">
              <Icon name="video" size={42} />
            </div>
            <h2>Video Call</h2>
            <p>Kumonekta sa isang volunteer para sa tulong.</p>
            <button className="btn btn-accent" onClick={() => begin("volunteer")}>
              Tumawag sa volunteer
            </button>
          </div>
        )}
      </div>

      {active && (
        <div className="call-controls">
          <button type="button" className="call-round" aria-label="Camera" onClick={() => {}}>
            <Icon name="camera" size={30} />
          </button>
          <button
            type="button"
            className="call-round is-end"
            aria-label="Tapusin ang tawag"
            onClick={end}
          >
            <Icon name="phone" size={30} style={{ transform: "rotate(135deg)" }} />
          </button>
          <button
            type="button"
            className="call-round"
            aria-pressed={muted}
            aria-label={muted ? "I-unmute" : "I-mute"}
            onClick={() => setMuted((m) => !m)}
          >
            <Icon name={muted ? "micOff" : "mic"} size={30} />
          </button>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

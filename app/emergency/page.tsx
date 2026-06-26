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
import { ensureCameraPermission } from "@/lib/permissions";
import { speak } from "@/lib/voice";

export default function VideoCallScreen() {
  const [connected, setConnected] = useState(false);
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fall, setFall] = useState(false);
  const [target, setTarget] = useState<HandoffTarget | null>(null);
  const sessionRef = useRef<HandoffSession | null>(null);
  const autoStartedRef = useRef(false);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const selfStreamRef = useRef<MediaStream | null>(null);

  // Fall-detection routes here with ?fall=1 (only after the countdown finishes
  // or the user taps "Get help now"), so we auto-start the emergency call.
  useEffect(() => {
    const isFall = new URLSearchParams(window.location.search).get("fall") === "1";
    setFall(isFall);
    if (isFall && !autoStartedRef.current) {
      autoStartedRef.current = true;
      begin("emergency-services");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start the user's live camera as soon as a call begins (shown while ringing).
  useEffect(() => {
    if (!active) return;
    void startSelfCamera();
    return () => stopSelfCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Play the volunteer video only once the call has actually "connected".
  useEffect(() => {
    if (active && connected && target === "volunteer") {
      remoteVideoRef.current?.play().catch(() => {});
    }
  }, [active, connected, target]);

  // Keep the muted state in sync with the volunteer video element.
  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.muted = muted;
  }, [muted]);

  async function startSelfCamera() {
    if (selfStreamRef.current) return;
    const permission = await ensureCameraPermission();
    if (permission === "denied") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      selfStreamRef.current = stream;
      if (selfVideoRef.current) {
        selfVideoRef.current.srcObject = stream;
        await selfVideoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn("[call] self camera failed:", err);
    }
  }

  function stopSelfCamera() {
    selfStreamRef.current?.getTracks().forEach((t) => t.stop());
    selfStreamRef.current = null;
    if (selfVideoRef.current) selfVideoRef.current.srcObject = null;
  }

  function begin(t: HandoffTarget) {
    sessionRef.current?.cancel();
    setConnected(false);
    setActive(true);
    setTarget(t);
    if (t === "volunteer") {
      speak("Kumokonekta sa isang volunteer.");
    } else {
      triggerPanic("button");
      speak("Tumatawag ng tulong.");
    }
    sessionRef.current = startHandoff({
      target: t,
      contextSummary:
        t === "volunteer"
          ? "User started a video call from the app."
          : "Fall detected: contacting emergency help.",
      onStep: () => {},
      onConnected: () => setConnected(true),
    });
  }

  function end() {
    sessionRef.current?.cancel();
    sessionRef.current = null;
    stopSelfCamera();
    setActive(false);
    setConnected(false);
    setMuted(false);
    setTarget(null);
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
            {connected ? (
              target === "volunteer" ? (
                <video
                  ref={remoteVideoRef}
                  className="call-remote"
                  src="/videocall.mp4"
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <div className="cam-placeholder">Naka-connect</div>
              )
            ) : (
              <div className="call-connecting" role="status" aria-live="polite">
                <div className="call-avatar call-avatar-ring" aria-hidden="true">
                  <Icon name="video" size={42} />
                </div>
                <p>
                  {fall
                    ? "Tumatawag sa emergency services..."
                    : "Kumokonekta sa volunteer..."}
                </p>
              </div>
            )}

            <div className="call-self">
              <video ref={selfVideoRef} playsInline muted autoPlay />
            </div>
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

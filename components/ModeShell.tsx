"use client";

import { useEffect, useRef, useState } from "react";
import CameraPreview from "./CameraPreview";
import BrandLogo from "./BrandLogo";
import BottomNav from "./BottomNav";
import Icon from "./Icons";
import type { ModeDefinition } from "@/lib/modes";
import { startSession, type GeminiSession } from "@/lib/services/geminiService";
import { speak } from "@/lib/voice";
import {
  onDescribeRequested,
  onEnrollRequested,
  onVoiceListening,
  requestVoiceToggle,
} from "@/lib/commandBus";
import { setLastMode } from "@/lib/lastMode";
import {
  loadFaceModels,
  enrollFromStream,
  identifyFromStream,
} from "@/lib/services/faceService";

interface ModeShellProps {
  mode: ModeDefinition;
}

type Facing = "environment" | "user";

export default function ModeShell({ mode }: ModeShellProps) {
  const [message, setMessage] = useState<string>("Sandali, naghahanda...");
  const [busy, setBusy] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [facing, setFacing] = useState<Facing>("environment");
  const sessionRef = useRef<GeminiSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognizedRef = useRef<string | null>(null);

  function startAssistant() {
    sessionRef.current?.stop();
    sessionRef.current = startSession({
      mode,
      getStream: () => streamRef.current,
      onStatus: (s) => {
        if (s === "live") {
          setMessage((m) => (m === "Sandali, naghahanda..." ? "" : m));
        }
        if (s === "error") setMessage("May problema sa assistant. I-check ang network o API key.");
      },
      onMessage: (text) => {
        setBusy(false);
        const name = recognizedRef.current;
        recognizedRef.current = null;
        const full = name ? `Si ${name} ang nasa harap mo. ${text}` : text;
        setMessage(full);
        speak(full);
      },
    });
  }

  async function describe(query?: string) {
    if (!sessionRef.current) {
      startAssistant();
      setMessage("Sandali, naghahanda pa...");
      return;
    }
    setBusy(true);
    setMessage(query ? `Tinitingnan: ${query}` : "Sandali, tinitingnan...");
    // Local, on-device face check before the cloud description so we can say
    // "Si Nanay ang nasa harap mo" when a saved person is recognized.
    recognizedRef.current = await identifyFromStream(streamRef.current);
    sessionRef.current.describe(query);
  }

  async function enroll(label: string) {
    setBusy(true);
    setMessage(`Tinitingnan si ${label}...`);
    const result = await enrollFromStream(streamRef.current, label);
    setBusy(false);
    if (result === "ok") {
      const msg = `Naitala ko si ${label}. Sasabihin ko kapag nakita ko ulit.`;
      setMessage(msg);
      speak(msg);
    } else if (result === "no-face") {
      const msg = "Walang nakitang mukha. Itutok ang camera sa tao at subukan ulit.";
      setMessage(msg);
      speak(msg);
    } else {
      const msg = "Hindi pa handa ang face recognition. Subukan ulit mamaya.";
      setMessage(msg);
      speak(msg);
    }
  }

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks?.()[0];
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: next }],
      } as unknown as MediaTrackConstraints);
      setTorchOn(next);
    } catch {
      setMessage("Walang flashlight ang camera na ito.");
    }
  }

  function flipCamera() {
    setTorchOn(false);
    setFacing((f) => (f === "environment" ? "user" : "environment"));
  }

  // Auto-connect the assistant on entry so describe-on-command is instant.
  useEffect(() => {
    setLastMode(mode.id);
    startAssistant();
    void loadFaceModels();
    const offDescribe = onDescribeRequested((payload) => void describe(payload));
    const offEnroll = onEnrollRequested((label) => void enroll(label));
    const offMic = onVoiceListening(setMicOn);
    return () => {
      offDescribe();
      offEnroll();
      offMic();
      sessionRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode.id]);

  return (
    <main className="view-screen">
      <CameraPreview
        variant="fill"
        autoStart
        facingMode={facing}
        showDetection
        onStream={(s) => {
          streamRef.current = s;
        }}
      />

      <div className="view-topbar">
        <BrandLogo tone="blue" />
        <div className="status-dots on-dark" aria-hidden="true">
          <span />
          <span />
        </div>
      </div>

      <div className="mode-pill" style={{ background: mode.color }}>
        <span className="mode-pill-label">{mode.label}</span>
        <Icon name={mode.icon} size={34} />
      </div>

      <button
        type="button"
        className={`circle-btn flash-btn ${torchOn ? "is-on" : ""}`}
        onClick={toggleTorch}
        aria-pressed={torchOn}
        aria-label={torchOn ? "I-off ang flashlight" : "I-on ang flashlight"}
      >
        <Icon name="flash" size={30} />
      </button>

      {message && (
        <div className="view-caption" role="status" aria-live="polite">
          {message}
        </div>
      )}

      <div className="view-controls">
        <button
          type="button"
          className="circle-btn control-btn"
          onClick={() => requestVoiceToggle()}
          aria-pressed={micOn}
          aria-label={micOn ? "I-off ang voice" : "I-on ang voice"}
        >
          <Icon name={micOn ? "mic" : "micOff"} size={32} />
        </button>

        <button
          type="button"
          className={`shutter-btn ${busy ? "is-busy" : ""}`}
          onClick={() => describe()}
          aria-label="Ano ang nasa harap ko?"
        />

        <button
          type="button"
          className="circle-btn control-btn"
          onClick={flipCamera}
          aria-label="I-flip ang camera"
        >
          <Icon name="flipCamera" size={32} />
        </button>
      </div>

      <BottomNav />
    </main>
  );
}

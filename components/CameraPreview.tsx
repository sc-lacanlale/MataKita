"use client";

import { useEffect, useRef, useState } from "react";
import DetectionOverlay from "./DetectionOverlay";
import { ensureCameraPermission } from "@/lib/permissions";

interface CameraPreviewProps {
  /** Show the visual-only bounding-box detection overlay. */
  showDetection?: boolean;
  /** Notify parent when the live MediaStream becomes available / clears. */
  onStream?: (stream: MediaStream | null) => void;
  /** Automatically turn the camera on when mounted (no button needed). */
  autoStart?: boolean;
  /** "card" = framed preview with start/stop buttons; "fill" = full-bleed background. */
  variant?: "card" | "fill";
  /** Bump this value to force a camera restart. */
  restartKey?: number;
  /** Which camera to use; changing it restarts the stream (flip camera). */
  facingMode?: "environment" | "user";
}

type CamStatus = "idle" | "requesting" | "live" | "denied" | "unsupported";

export default function CameraPreview({
  showDetection = false,
  onStream,
  autoStart = false,
  variant = "card",
  restartKey = 0,
  facingMode = "environment",
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CamStatus>("idle");

  async function start() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    const permission = await ensureCameraPermission();
    if (permission === "denied") {
      setStatus("denied");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setStatus("live");
      onStream?.(stream);
    } catch (err) {
      console.warn("[CameraPreview] getUserMedia failed:", err);
      setStatus("denied");
    }
  }

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    onStream?.(null);
  }

  // Auto-start on mount and whenever restartKey / facingMode changes.
  useEffect(() => {
    if (!autoStart) return;
    stop();
    void start();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, restartKey, facingMode]);

  const isLive = status === "live";

  const placeholder = (
    <>
      {status === "idle" && "Camera is off."}
      {status === "requesting" && "Binubuksan ang camera..."}
      {status === "denied" && "Walang access sa camera. I-check ang permissions."}
      {status === "unsupported" && "Hindi suportado ang camera sa device na ito."}
    </>
  );

  if (variant === "fill") {
    return (
      <div className="cam-fill">
        <video ref={videoRef} playsInline muted />
        {showDetection && isLive && (
          <DetectionOverlay videoRef={videoRef} active={isLive} />
        )}
        {!isLive && <div className="cam-placeholder">{placeholder}</div>}
      </div>
    );
  }

  return (
    <div>
      <div className="preview-wrap">
        <video ref={videoRef} playsInline muted />
        {showDetection && isLive && (
          <DetectionOverlay videoRef={videoRef} active={isLive} />
        )}
        {!isLive && <div className="preview-placeholder">{placeholder}</div>}
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        {!isLive ? (
          <button className="btn btn-small btn-accent" onClick={start}>
            Start camera
          </button>
        ) : (
          <button className="btn btn-small btn-ghost" onClick={stop}>
            Stop camera
          </button>
        )}
      </div>
    </div>
  );
}

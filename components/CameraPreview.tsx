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
}

type CamStatus = "idle" | "requesting" | "live" | "denied" | "unsupported";

export default function CameraPreview({
  showDetection = false,
  onStream,
  autoStart = false,
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CamStatus>("idle");
  const startedRef = useRef(false);

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
        video: { facingMode: "environment" },
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

  useEffect(() => {
    if (autoStart && !startedRef.current) {
      startedRef.current = true;
      void start();
    }
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const isLive = status === "live";

  return (
    <div>
      <div className="preview-wrap">
        <video ref={videoRef} playsInline muted />
        {showDetection && isLive && (
          <DetectionOverlay videoRef={videoRef} active={isLive} />
        )}
        {!isLive && (
          <div className="preview-placeholder">
            {status === "idle" && "Camera is off. Tap Start camera."}
            {status === "requesting" && "Requesting camera access..."}
            {status === "denied" && "Camera permission denied. Check app permissions."}
            {status === "unsupported" && "Camera not supported on this device."}
          </div>
        )}
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

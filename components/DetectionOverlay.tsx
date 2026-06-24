"use client";

import { useEffect, useRef } from "react";

/**
 * DetectionOverlay - VISUAL ONLY.
 *
 * Runs on-device object detection (TensorFlow.js + COCO-SSD) against the given
 * <video> element and draws bounding boxes + labels onto its own transparent
 * <canvas>. It is deliberately isolated:
 *   - it only READS video frames and WRITES to its own canvas,
 *   - it never emits detections upward, touches app state, or calls any service.
 * Removing/disabling it cannot change any other behavior.
 */

type Detection = {
  bbox: [number, number, number, number];
  class: string;
  score: number;
};

type CocoModel = {
  detect: (input: HTMLVideoElement) => Promise<Detection[]>;
};

interface DetectionOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  active: boolean;
  /** Throttle inference to limit heat/battery. */
  fps?: number;
}

export default function DetectionOverlay({
  videoRef,
  active,
  fps = 6,
}: DetectionOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<CocoModel | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRunRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function loadModel() {
      try {
        const tf = await import("@tensorflow/tfjs");
        await tf.ready();
        const cocoSsd = await import("@tensorflow-models/coco-ssd");
        const model = (await cocoSsd.load({
          base: "lite_mobilenet_v2",
        })) as unknown as CocoModel;
        if (!cancelled) {
          modelRef.current = model;
        }
      } catch (err) {
        console.warn("[DetectionOverlay] model load failed:", err);
      }
    }

    loadModel();

    const interval = 1000 / fps;

    const loop = async (t: number) => {
      rafRef.current = requestAnimationFrame(loop);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const model = modelRef.current;
      if (!video || !canvas || !model) return;
      if (video.readyState < 2 || video.videoWidth === 0) return;
      if (t - lastRunRef.current < interval) return;
      lastRunRef.current = t;

      if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
      if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

      let predictions: Detection[] = [];
      try {
        predictions = await model.detect(video);
      } catch {
        return;
      }
      if (cancelled) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = Math.max(2, canvas.width / 240);
      ctx.font = `${Math.max(14, canvas.width / 32)}px system-ui, sans-serif`;
      ctx.textBaseline = "top";

      for (const p of predictions) {
        const [x, y, w, h] = p.bbox;
        const color = p.class === "person" ? "#4f8cff" : "#2ecc71";
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, w, h);

        const label = `${p.class} ${Math.round(p.score * 100)}%`;
        const padding = 4;
        const textW = ctx.measureText(label).width;
        const textH = parseInt(ctx.font, 10);
        ctx.fillStyle = color;
        ctx.fillRect(x, Math.max(0, y - textH - padding * 2), textW + padding * 2, textH + padding * 2);
        ctx.fillStyle = "#0b0b0f";
        ctx.fillText(label, x + padding, Math.max(0, y - textH - padding));
      }
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, fps, videoRef]);

  return <canvas ref={canvasRef} className="preview-overlay" aria-hidden="true" />;
}

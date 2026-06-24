"use client";

/**
 * Hazard Override Framework - fall detection + panic trigger.
 *
 * Reads the accelerometer (via @capacitor/motion on device, DeviceMotion on the
 * web) and flags a likely fall using a simple free-fall -> impact state machine.
 * The panic trigger drops the AI layer and routes the user to a human; the
 * actual routing/WebRTC is handled by webrtcService / the Emergency screen.
 */

export type HazardEvent =
  | { type: "fall-detected"; magnitude: number }
  | { type: "panic"; source: "voice" | "button" };

export interface HazardMonitor {
  stop: () => void;
}

export interface StartMonitorOptions {
  onHazard: (event: HazardEvent) => void;
  /** Impact magnitude (m/s^2) that counts as a hard hit. Default 28. */
  impactThreshold?: number;
  /** Magnitude below which we consider near free-fall. Default 4. */
  freeFallThreshold?: number;
}

type Accel = { x: number; y: number; z: number };

function magnitude(a: Accel): number {
  return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
}

export function startMonitoring(options: StartMonitorOptions): HazardMonitor {
  const {
    onHazard,
    impactThreshold = 28,
    freeFallThreshold = 4,
  } = options;

  let lastFreeFallAt = 0;
  let lastFireAt = 0;
  let removeNative: (() => void) | null = null;
  let webHandler: ((e: DeviceMotionEvent) => void) | null = null;
  let stopped = false;

  const handleSample = (a: Accel | null | undefined) => {
    if (!a) return;
    const mag = magnitude(a);
    const now = Date.now();

    if (mag < freeFallThreshold) {
      lastFreeFallAt = now;
    }

    const recentFreeFall = now - lastFreeFallAt < 1200;
    const hardImpact = mag > impactThreshold;
    // A fall is free-fall quickly followed by a hard impact; a very hard impact
    // alone (e.g. >1.4x threshold) also counts.
    const isFall = (recentFreeFall && hardImpact) || mag > impactThreshold * 1.4;

    if (isFall && now - lastFireAt > 3000) {
      lastFireAt = now;
      onHazard({ type: "fall-detected", magnitude: Math.round(mag) });
    }
  };

  (async () => {
    try {
      const { Motion } = await import("@capacitor/motion");
      const handle = await Motion.addListener("accel", (event) => {
        handleSample(
          event.accelerationIncludingGravity ?? event.acceleration ?? null
        );
      });
      if (stopped) {
        handle.remove();
        return;
      }
      removeNative = () => handle.remove();
      console.log("[hazardService] monitoring via @capacitor/motion");
    } catch (err) {
      // Web fallback.
      if (typeof window !== "undefined" && "DeviceMotionEvent" in window) {
        webHandler = (e: DeviceMotionEvent) => {
          const g = e.accelerationIncludingGravity;
          if (g) handleSample({ x: g.x ?? 0, y: g.y ?? 0, z: g.z ?? 0 });
        };
        window.addEventListener("devicemotion", webHandler);
        console.log("[hazardService] monitoring via DeviceMotion (web)");
      } else {
        console.warn("[hazardService] no motion sensor available:", err);
      }
    }
  })();

  return {
    stop: () => {
      stopped = true;
      removeNative?.();
      if (webHandler) window.removeEventListener("devicemotion", webHandler);
      removeNative = null;
      webHandler = null;
      console.log("[hazardService] monitoring stopped");
    },
  };
}

/** Universal panic trigger - drops AI processing and routes to a human. */
export function triggerPanic(source: "voice" | "button"): HazardEvent {
  const event: HazardEvent = { type: "panic", source };
  console.log("[hazardService] PANIC triggered", event);
  return event;
}

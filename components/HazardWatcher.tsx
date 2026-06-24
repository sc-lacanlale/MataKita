"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { startMonitoring, type HazardMonitor } from "@/lib/services/hazardService";
import { speak } from "@/lib/voice";

const COUNTDOWN_SECONDS = 15;

async function vibrate(pattern: number) {
  try {
    const { Haptics } = await import("@capacitor/haptics");
    await Haptics.vibrate({ duration: pattern });
  } catch {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }
}

/**
 * Global hazard watcher. Always listening for hard falls; on detection it
 * vibrates, asks "Are you OK?", and counts down before auto-routing to the
 * Emergency flow unless the user cancels.
 */
export default function HazardWatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [alerting, setAlerting] = useState(false);
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const monitorRef = useRef<HazardMonitor | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearCountdown() {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
  }

  function dismiss() {
    clearCountdown();
    setAlerting(false);
    setSeconds(COUNTDOWN_SECONDS);
  }

  function goToHelp() {
    dismiss();
    router.push("/emergency");
  }

  useEffect(() => {
    // Don't double-alert while already on the emergency screen.
    monitorRef.current = startMonitoring({
      onHazard: (event) => {
        if (event.type !== "fall-detected") return;
        if (pathname === "/emergency") return;
        setAlerting((already) => {
          if (already) return already;
          void vibrate(800);
          speak("I detected a possible fall. Are you okay? I will call for help soon.");
          return true;
        });
      },
    });
    return () => {
      monitorRef.current?.stop();
      clearCountdown();
    };
    // pathname intentionally captured fresh via closure each render is not needed;
    // we restart monitor only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!alerting) return;
    setSeconds(COUNTDOWN_SECONDS);
    tickRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearCountdown();
          router.push("/emergency");
          setAlerting(false);
          return COUNTDOWN_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return clearCountdown;
  }, [alerting, router]);

  if (!alerting) return null;

  return (
    <div className="hazard-overlay" role="alertdialog" aria-live="assertive">
      <div className="hazard-card">
        <h2 className="hazard-title">Possible fall detected</h2>
        <p className="hazard-sub">
          Calling for help in <strong>{seconds}</strong> seconds.
        </p>
        <button className="btn btn-accent" onClick={dismiss}>
          I&apos;m OK
        </button>
        <button className="btn btn-danger" onClick={goToHelp}>
          Get help now
        </button>
      </div>
    </div>
  );
}

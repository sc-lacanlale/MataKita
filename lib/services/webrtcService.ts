/**
 * Smart Community Handoff / WebRTC streaming - STUB.
 *
 * The real implementation will negotiate a WebRTC connection to a human
 * volunteer or emergency contact, stream camera + audio + GPS, and deliver an
 * AI-generated context payload (last ~30s summary). For now we simulate the
 * handoff steps so the Emergency screen can show the flow.
 */

export type HandoffTarget = "volunteer" | "emergency-contact" | "emergency-services";

export interface HandoffStep {
  label: string;
  done: boolean;
}

export interface HandoffSession {
  target: HandoffTarget;
  cancel: () => void;
}

export interface StartHandoffOptions {
  target: HandoffTarget;
  contextSummary?: string;
  onStep?: (step: HandoffStep) => void;
  onConnected?: () => void;
}

export function startHandoff(options: StartHandoffOptions): HandoffSession {
  const { target, contextSummary, onStep, onConnected } = options;
  console.log(`[webrtcService] (stub) starting handoff to ${target}`, {
    contextSummary,
  });

  const steps = [
    "Capturing last 30 seconds of context",
    "Locating GPS coordinates",
    `Dialing ${target.replace("-", " ")}`,
    "Opening camera + audio stream",
  ];

  const timers: ReturnType<typeof setTimeout>[] = [];
  steps.forEach((label, i) => {
    timers.push(
      setTimeout(() => {
        onStep?.({ label, done: true });
        if (i === steps.length - 1) onConnected?.();
      }, 900 * (i + 1))
    );
  });

  return {
    target,
    cancel: () => {
      timers.forEach(clearTimeout);
      console.log("[webrtcService] (stub) handoff cancelled");
    },
  };
}

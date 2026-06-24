"use client";

import type { ModeDefinition } from "@/lib/modes";
import { createFrameGrabber, type FrameGrabber } from "@/lib/frameCapture";
import { logDebug } from "@/lib/debugLog";

/**
 * Gemini vision integration.
 *
 * "Describe what's in front of me" is implemented as a single-shot multimodal
 * generateContent call: grab the current camera frame, send it with a
 * mode-specific instruction, speak the text reply. This is far more robust than
 * the bidirectional Live API (which, on most keys, only streams audio) and works
 * with any standard vision model.
 *
 * Falls back to a stub when no API key is configured.
 */

export type SessionStatus = "idle" | "connecting" | "live" | "error";

export interface GeminiSession {
  status: SessionStatus;
  stop: () => void;
  describe: (prompt?: string) => void;
}

export interface StartSessionOptions {
  mode: ModeDefinition;
  stream?: MediaStream | null;
  getStream?: () => MediaStream | null;
  onStatus?: (status: SessionStatus) => void;
  onMessage?: (text: string) => void;
}

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";

/** Tried in order; if one is overloaded (503) we fall back to the next. */
const MODEL_CHAIN = [MODEL, "gemini-2.5-flash-lite", "gemini-flash-latest"].filter(
  (m, i, a) => a.indexOf(m) === i
);

function systemInstructionFor(mode: ModeDefinition): string {
  return [
    "Ikaw si KitaKita, isang AI vision assistant para sa taong bulag o may kapansanan sa paningin.",
    "Sumagot nang maikli, malinaw, at deretso (1 hanggang 3 pangungusap). Unahin ang anumang delikado o mapanganib.",
    "Huwag mag-imbento ng detalyeng hindi mo nakikita sa larawan.",
    "Sumagot sa wikang Filipino bilang default. Kung ang tanong ng user ay nasa Ingles, sumagot sa Ingles.",
    `Mode ngayon: ${mode.label}. Focus: ${mode.focus}.`,
    `Bigyang-pansin: ${mode.priorities.join("; ")}.`,
  ].join(" ");
}

const DESCRIBE_PROMPT =
  "Ano ang nasa harap ko ngayon? Ilarawan nang maikli at unahin ang anumang delikado.";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function startStubSession(options: StartSessionOptions): GeminiSession {
  const { mode, onStatus, onMessage } = options;
  onStatus?.("connecting");
  setTimeout(() => {
    onStatus?.("live");
    onMessage?.(
      `${mode.label} ready (demo mode - add a Gemini API key for live descriptions).`
    );
  }, 400);
  return {
    status: "live",
    stop: () => onStatus?.("idle"),
    describe: () =>
      onMessage?.("Demo mode: add a Gemini API key to describe what's in view."),
  };
}

function startLiveSession(options: StartSessionOptions): GeminiSession {
  const { mode, stream, getStream, onStatus, onMessage } = options;

  let grabber: FrameGrabber | null = null;
  let grabberStream: MediaStream | null = null;
  let busy = false;
  let stopped = false;
  let aiClient: unknown = null;

  const resolveStream = (): MediaStream | null => getStream?.() ?? stream ?? null;

  const session: GeminiSession = {
    status: "live",
    stop: () => {
      stopped = true;
      grabber?.dispose();
      grabber = null;
      onStatus?.("idle");
    },
    describe: (prompt?: string) => void runDescribe(prompt),
  };

  // No persistent socket; we're "live" as soon as the camera is available.
  onStatus?.("live");

  async function captureFrame(): Promise<string | null> {
    const s = resolveStream();
    if (!s) return null;
    if (!grabber || grabberStream !== s) {
      grabber?.dispose();
      grabber = createFrameGrabber(s, { maxEdge: 768, quality: 0.6 });
      grabberStream = s;
    }
    for (let i = 0; i < 12 && !stopped; i++) {
      const data = grabber.capture();
      if (data) return data;
      await sleep(150);
    }
    return null;
  }

  async function getClient() {
    if (aiClient) return aiClient;
    const { GoogleGenAI } = await import("@google/genai");
    aiClient = new GoogleGenAI({ apiKey: API_KEY as string });
    return aiClient;
  }

  const isTransient = (msg: string) =>
    msg.includes("503") ||
    msg.toUpperCase().includes("UNAVAILABLE") ||
    msg.includes("429") ||
    msg.toLowerCase().includes("overloaded") ||
    msg.toLowerCase().includes("high demand");

  async function generateWithFallback(parts: unknown[]): Promise<string> {
    const ai = (await getClient()) as {
      models: { generateContent: (req: unknown) => Promise<{ text?: string }> };
    };
    let lastMsg = "";
    for (const model of MODEL_CHAIN) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await ai.models.generateContent({
            model,
            config: { systemInstruction: systemInstructionFor(mode) },
            contents: [{ role: "user", parts }],
          });
          return (res.text || "").trim();
        } catch (err) {
          lastMsg = String((err as { message?: string })?.message ?? err);
          console.warn(`[geminiService] ${model} attempt ${attempt} failed:`, lastMsg);
          if (isTransient(lastMsg)) {
            await sleep(700 * (attempt + 1));
            continue; // retry / next model
          }
          throw err; // non-transient: stop
        }
      }
    }
    throw new Error(lastMsg || "All models unavailable");
  }

  async function runDescribe(prompt?: string) {
    if (busy) return;
    busy = true;
    try {
      const data = await captureFrame();
      if (!data) {
        logDebug("error", "no camera frame");
        onMessage?.("Camera is not ready yet. Try again in a moment.");
        return;
      }
      const usedPrompt = prompt || DESCRIBE_PROMPT;
      logDebug("gemini-in", usedPrompt);
      const text = await generateWithFallback([
        { text: usedPrompt },
        { inlineData: { mimeType: "image/jpeg", data } },
      ]);
      logDebug("gemini-out", text || "(empty)");
      onMessage?.(text || "I couldn't make out the scene clearly.");
    } catch (err) {
      console.warn("[geminiService] describe failed:", err);
      const msg = String((err as { message?: string })?.message ?? err);
      logDebug("error", msg.slice(0, 160));
      if (isTransient(msg)) {
        onMessage?.("The assistant is busy right now. Please try again in a few seconds.");
      } else {
        onStatus?.("error");
        onMessage?.("Could not reach the assistant. Check your connection or API key.");
      }
    } finally {
      busy = false;
    }
  }

  return session;
}

export function startSession(options: StartSessionOptions): GeminiSession {
  if (!API_KEY) return startStubSession(options);
  return startLiveSession(options);
}

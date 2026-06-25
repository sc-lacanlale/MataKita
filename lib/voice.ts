"use client";

import { Capacitor } from "@capacitor/core";

/**
 * Voice-first helpers.
 *
 * speak(): native Text-to-Speech on device (@capacitor-community/text-to-speech),
 *   falling back to the Web Speech API in a browser.
 * startListening(): continuous speech recognition. On device it uses the native
 *   speech-recognition plugin (the Android WebView has no Web Speech API); in a
 *   browser it falls back to webkitSpeechRecognition. The callback receives
 *   recognized phrases (lowercased) which callers match against commands.
 */

/** Recognition language. fil-PH handles Filipino and Taglish (English loanwords). */
export const RECOG_LANG = "fil-PH";

const FILIPINO_HINT =
  /\b(ang|ng|sa|mga|may|meron|wala|walang|ay|na|po|ito|iyan|iyon|dito|diyan|doon|kulay|babae|lalaki|harap|likod|kanan|kaliwa|mo|ko|niya|natin|namin|hindi|oo|opo|salamat|ingat|delikado|mainit|sasakyan|tao|pinto|mesa|gamot)\b/i;

/** Pick a TTS language from the text so Filipino replies sound right. */
export function detectLang(text: string): string {
  return FILIPINO_HINT.test(text) ? "fil-PH" : "en-US";
}

/**
 * Self-hearing guard. While the app is speaking (and for a short grace period
 * afterwards) we mark `speaking = true` so the speech recognizer can ignore its
 * own TTS output instead of looping on it.
 */
let speaking = false;
let speakingTimer: ReturnType<typeof setTimeout> | null = null;

export function isSpeaking(): boolean {
  return speaking;
}

function beginSpeaking() {
  speaking = true;
  if (speakingTimer) {
    clearTimeout(speakingTimer);
    speakingTimer = null;
  }
}

function endSpeakingSoon() {
  if (speakingTimer) clearTimeout(speakingTimer);
  // Grace period for trailing audio / mic latency before listening again.
  speakingTimer = setTimeout(() => {
    speaking = false;
    speakingTimer = null;
  }, 800);
}

export async function speak(text: string, lang?: string): Promise<void> {
  if (typeof window === "undefined" || !text) return;
  const language = lang || detectLang(text);

  if (Capacitor.isNativePlatform()) {
    try {
      const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
      await TextToSpeech.stop().catch(() => {});
      beginSpeaking();
      try {
        await TextToSpeech.speak({ text, lang: language, rate: 1.0 });
      } catch {
        // Device may lack the Filipino voice; fall back to English voice.
        await TextToSpeech.speak({ text, lang: "en-US", rate: 1.0 });
      }
      endSpeakingSoon();
      return;
    } catch (err) {
      endSpeakingSoon();
      console.warn("[voice] native TTS failed, falling back:", err);
    }
  }

  const synth = window.speechSynthesis;
  if (!synth) {
    console.warn("[voice] no speech synthesis; would say:", text);
    return;
  }
  try {
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language;
    beginSpeaking();
    utter.onend = endSpeakingSoon;
    utter.onerror = endSpeakingSoon;
    synth.speak(utter);
  } catch (err) {
    endSpeakingSoon();
    console.warn("[voice] speak failed:", err);
  }
}

export interface Listener {
  stop: () => void;
}

export async function startListening(
  onPhrase: (phrase: string) => void
): Promise<Listener> {
  if (Capacitor.isNativePlatform()) {
    return startNativeListening(onPhrase);
  }
  return startWebListening(onPhrase);
}

async function startNativeListening(
  onPhrase: (phrase: string) => void
): Promise<Listener> {
  let stopped = false;
  try {
    const { SpeechRecognition } = await import(
      "@capacitor-community/speech-recognition"
    );
    await SpeechRecognition.requestPermissions();

    const isListening = async (): Promise<boolean> => {
      try {
        const r = (await SpeechRecognition.isListening()) as
          | boolean
          | { listening?: boolean }
          | { value?: boolean };
        if (typeof r === "boolean") return r;
        return Boolean(
          (r as { listening?: boolean }).listening ??
            (r as { value?: boolean }).value
        );
      } catch {
        return false;
      }
    };

    const begin = async () => {
      if (stopped) return;
      if (await isListening()) return;
      try {
        await SpeechRecognition.start({
          language: RECOG_LANG,
          maxResults: 3,
          partialResults: true,
          popup: false,
        });
      } catch {
        // "already started" or transient busy - the watchdog will retry.
      }
    };

    const partial = await SpeechRecognition.addListener(
      "partialResults",
      (data: { matches?: string[] }) => {
        const phrase = data?.matches?.[0];
        if (phrase) onPhrase(phrase.toLowerCase());
      }
    );

    const state = await SpeechRecognition.addListener(
      "listeningState",
      (data: { status: "started" | "stopped" }) => {
        if (data?.status === "stopped" && !stopped) setTimeout(begin, 300);
      }
    );

    // Watchdog: the Android recognizer stops on silence/error/after TTS and
    // doesn't always emit a stop event, so poll and restart if it's not running.
    const watchdog = setInterval(() => {
      void begin();
    }, 2500);

    await begin();

    return {
      stop: () => {
        stopped = true;
        clearInterval(watchdog);
        partial.remove();
        state.remove();
        SpeechRecognition.stop().catch(() => {});
      },
    };
  } catch (err) {
    console.warn("[voice] native speech recognition unavailable:", err);
    return { stop: () => {} };
  }
}

type SpeechRecognitionCtor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function startWebListening(onPhrase: (phrase: string) => void): Listener {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) {
    console.warn("[voice] no SpeechRecognition in this browser");
    return { stop: () => {} };
  }

  let stopped = false;
  const rec = new Ctor();
  rec.lang = RECOG_LANG;
  rec.continuous = true;
  rec.interimResults = true;
  rec.onresult = (event) => {
    const results = event.results;
    const last = results[results.length - 1];
    const phrase = last?.[0]?.transcript;
    if (phrase) onPhrase(phrase.toLowerCase());
  };
  rec.onerror = () => {};
  rec.onend = () => {
    if (!stopped) {
      try {
        rec.start();
      } catch {
        /* ignore */
      }
    }
  };
  try {
    rec.start();
  } catch {
    /* ignore */
  }

  return {
    stop: () => {
      stopped = true;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    },
  };
}

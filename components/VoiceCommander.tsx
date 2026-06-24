"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { speak, startListening, type Listener } from "@/lib/voice";
import { requestDescribe } from "@/lib/commandBus";
import { logDebug } from "@/lib/debugLog";

type NavCommand = { match: (p: string) => boolean; path: string; say: string };

const NAV_COMMANDS: NavCommand[] = [
  { match: (p) => /\b(outdoor|outside|labas|kalsada|street)\b/.test(p), path: "/outdoor", say: "Outdoor mode" },
  { match: (p) => /\b(cooking|kitchen|cook|luto|kusina)\b/.test(p), path: "/cooking", say: "Cooking mode" },
  { match: (p) => /\b(study|reading|read|basa|aral)\b/.test(p), path: "/study", say: "Study mode" },
  { match: (p) => /\b(teach|my world|register|ituro)\b/.test(p), path: "/teach", say: "Teach my world" },
  { match: (p) => /\b(emergency|help me|panic|tulong|saklolo)\b/.test(p), path: "/emergency", say: "Emergency" },
  { match: (p) => /\b(home|main menu|menu|umuwi|bahay)\b/.test(p), path: "/", say: "Home" },
];

// Trigger word + common mis-hears of "kita" from the Filipino recognizer.
const TRIGGER_WORD_RE =
  /\b(kita|keta|kyta|keeta|quita|kitta|kital|vita|kuta|kida|kit)\b/;
// Quick-describe shortcut words after the trigger.
const LOOK_RE = /^(look|see|tingin|tignan|tingnan|titignan|tumingin|silip|tingnan mo)\b/;

function parseTrigger(phrase: string): { hit: boolean; query: string } {
  const m = phrase.match(TRIGGER_WORD_RE);
  if (!m || m.index == null) return { hit: false, query: "" };
  const idx = m.index + m[0].length;
  const query = phrase
    .slice(idx)
    .replace(/^[\s,.:;!?]+/, "")
    .trim();
  return { hit: true, query };
}

export default function VoiceCommander() {
  const router = useRouter();
  const pathname = usePathname();
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const listenerRef = useRef<Listener | null>(null);
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  const navCooldownRef = useRef(0);
  const queryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryFireRef = useRef(0);

  function navigate(cmd: NavCommand) {
    if (pathRef.current === cmd.path) return;
    logDebug("nav", cmd.path);
    speak(cmd.say);
    router.push(cmd.path);
  }

  function fireDescribe(query: string) {
    const now = Date.now();
    if (now - lastQueryFireRef.current < 2500) return;
    lastQueryFireRef.current = now;
    const isLook = query === "" || LOOK_RE.test(query);
    if (isLook) {
      logDebug("trigger", "look -> describe");
      if (!requestDescribe()) speak("Pumili muna ng mode.");
    } else {
      logDebug("trigger", `query -> "${query}"`);
      if (!requestDescribe(query)) speak("Pumili muna ng mode.");
    }
  }

  function handlePhrase(phrase: string) {
    setHeard(phrase);
    logDebug("heard", phrase);
    const trig = parseTrigger(phrase);

    if (trig.hit) {
      // Open question / shortcut. Debounce so we capture the full sentence
      // instead of an early partial result.
      if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
      const query = trig.query;
      queryDebounceRef.current = setTimeout(() => fireDescribe(query), 1100);
      return;
    }

    // No trigger word: only navigation commands act (never a Gemini call).
    const now = Date.now();
    if (now - navCooldownRef.current < 3000) return;
    for (const cmd of NAV_COMMANDS) {
      if (cmd.match(phrase)) {
        navCooldownRef.current = now;
        navigate(cmd);
        return;
      }
    }
  }

  async function start() {
    if (listenerRef.current) return;
    listenerRef.current = await startListening(handlePhrase);
    setListening(true);
  }

  function stop() {
    listenerRef.current?.stop();
    listenerRef.current = null;
    if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
    setListening(false);
  }

  useEffect(() => {
    void start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      className={`voice-fab ${listening ? "voice-fab-on" : ""}`}
      onClick={() => (listening ? stop() : void start())}
      aria-label={
        listening
          ? "Voice on. Say Hey Kita to ask. Tap to turn off."
          : "Voice off. Tap to turn on."
      }
      title={heard ? `Heard: ${heard}` : "Say: Hey Kita look"}
    >
      {listening ? "Mic on" : "Mic off"}
    </button>
  );
}

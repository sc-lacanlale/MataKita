"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { speak, startListening, isSpeaking, type Listener } from "@/lib/voice";
import {
  requestDescribe,
  requestEnroll,
  onVoiceToggle,
  setVoiceListening,
} from "@/lib/commandBus";
import { logDebug } from "@/lib/debugLog";
import { VOICE } from "@/lib/modes";

// "I don't know the modes" / "what are the modes" -> read them all aloud.
const LIST_MODES_RE =
  /\b(what (are|is).*mode|which mode|list.*mode|all.*mode|the modes|modes?|choices|options|mga mode|anong mode|ano.*mode|hindi ko alam|hindi alam|wala akong alam|don'?t know|do not know|help me choose|tulungan mo ako|pagpipilian)\b/;

type Destination = {
  path: string;
  say: string;
  /** Higher tiers win ties. Modes + Video Call are tier 2; Home/Teach tier 1. */
  priority: number;
  /** Intent keywords (English + Filipino/Taglish), matched anywhere in the phrase. */
  keywords: RegExp;
};

// Order matters within a tier: earlier entries win ties (modes first).
const DESTINATIONS: Destination[] = [
  {
    path: "/outdoor",
    say: "Outdoor mode",
    priority: 2,
    keywords:
      /\b(outdoor|outside|out\s?side|going out|go out|walk|walking|jog|jogging|run|running|commut\w*|travel|trip|street|road|sidewalk|labas|lalabas|maglalakad|maglakad|naglalakad|lakad|kalsada|kalye|daan|biyahe|lalakad)\b/,
  },
  {
    path: "/indoor",
    say: "Indoor mode",
    priority: 2,
    keywords:
      /\b(indoor|inside|in\s?side|room|bedroom|living room|hallway|sa loob|loob|kwarto|kuwarto|silid|sala|pasilyo)\b/,
  },
  {
    path: "/social",
    say: "Social mode",
    priority: 2,
    keywords:
      /\b(social|socialize|socializing|people|person|someone|friend|friends|talk|talking|chat|conversation|meeting|meet|guest|guests|visitor|tao|mga tao|kausap|kakausap|kausapin|kaibigan|bisita|kaharap|harap)\b/,
  },
  {
    path: "/study",
    say: "Study mode",
    priority: 2,
    keywords:
      /\b(study|studying|read|reading|book|books|learn|learning|review|reviewing|homework|school|class|basa|magbasa|babasa|nagbabasa|aral|mag-?aral|nag-?aaral|libro|eskwela|paaralan|takdang aralin|leksyon)\b/,
  },
  {
    path: "/cooking",
    say: "Cooking mode",
    priority: 2,
    keywords:
      /\b(cook|cooking|kitchen|recipe|bake|baking|fry|frying|eat|eating|meal|food|prepare food|luto|magluluto|magluto|nagluluto|niluluto|kakain|kumain|kusina|pagkain|ulam|hapunan|tanghalian|almusal|magtimpla)\b/,
  },
  {
    path: "/emergency",
    say: "Video call",
    priority: 2,
    keywords:
      /\b(video call|videocall|video|call|caller|volunteer|emergency|help|assist|assistance|tawag|tumawag|tawagan|tumatawag|magpatulong|tulong|saklolo)\b/,
  },
  {
    path: "/",
    say: "Home",
    priority: 1,
    keywords:
      /\b(home|home screen|main menu|main|menu|go back|back|umuwi|uwi|bumalik|balik|tahanan)\b/,
  },
  {
    path: "/teach",
    say: "Teach my world",
    priority: 1,
    keywords: /\b(teach|teaching|my world|register|remember this|ituro|turuan|tandaan)\b/,
  },
];

/** Pick the best destination for a phrase, prioritizing modes over Home/Teach. */
function matchDestination(query: string): Destination | null {
  let best: Destination | null = null;
  for (const d of DESTINATIONS) {
    if (d.keywords.test(query) && (!best || d.priority > best.priority)) {
      best = d;
    }
  }
  return best;
}

// Trigger word + common mis-hears of "kita" from the Filipino recognizer.
const TRIGGER_WORD_RE =
  /\b(kita|keta|kyta|keeta|quita|kitta|kital|vita|kuta|kida|kit)\b/;
// Quick-describe shortcut words after the trigger.
const LOOK_RE = /^(look|see|tingin|tignan|tingnan|titignan|tumingin|silip|tingnan mo)\b/;

// Strip leading filler words from a captured name ("my mom" -> "mom").
const ENROLL_STOPWORDS = /^(my|a|an|the|named|si|ang|yung|isang)\s+/;

function cleanName(raw: string): string {
  let s = raw.replace(/[.?!,;:]+$/, "").trim();
  s = s.split(/\s+/).slice(0, 4).join(" ");
  for (let i = 0; i < 3; i++) {
    const n = s.replace(ENROLL_STOPWORDS, "");
    if (n === s) break;
    s = n;
  }
  s = s.trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

// "this is my mom" / "ito si nanay" / "remember this as bob" -> "Mom" / "Nanay" / "Bob".
function parseEnroll(q: string): string | null {
  const m =
    q.match(/\bthis (?:is|person is)\s+(.+)/) ||
    q.match(/\b(?:remember|save)\s+(?:this\s+(?:as|is)\s+)?(.+)/) ||
    q.match(/\bito\s+(?:ay\s+)?si\s+(.+)/) ||
    q.match(/\bsi\s+(.+?)\s+(?:ito|iyan|yan)\b/) ||
    q.match(/\b(?:siya|kilala ko|tandaan(?:\s+mo)?)\s+si\s+(.+)/);
  if (!m) return null;
  const name = cleanName(m[1]);
  return name || null;
}

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
  const lastListRef = useRef(0);
  const lastEnrollRef = useRef(0);

  function navigate(dest: Destination) {
    if (pathRef.current === dest.path) return;
    logDebug("nav", dest.path);
    speak(dest.say);
    router.push(dest.path);
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
    // Ignore anything heard while the app itself is talking (prevents the
    // recognizer from looping on its own TTS, e.g. the fall announcement).
    if (isSpeaking()) return;

    setHeard(phrase);
    logDebug("heard", phrase);

    // Everything requires the "Hey Kita" trigger word - navigation included.
    const trig = parseTrigger(phrase);
    if (!trig.hit) return;
    const query = trig.query;

    // Enroll a person ("Hey Kita, this is my mom" / "ito si Nanay").
    const enrollName = parseEnroll(query);
    if (enrollName) {
      const t = Date.now();
      if (t - lastEnrollRef.current < 3500) return;
      lastEnrollRef.current = t;
      if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
      logDebug("trigger", `enroll -> ${enrollName}`);
      if (!requestEnroll(enrollName)) speak("Pumunta muna sa isang mode na may camera.");
      return;
    }

    // Navigation after the trigger, context-aware ("Hey Kita, I'm going to cook").
    const now = Date.now();
    const dest = matchDestination(query);
    if (dest) {
      if (now - navCooldownRef.current < 3000) return;
      navCooldownRef.current = now;
      if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
      navigate(dest);
      return;
    }

    // "What are the modes?" / "I don't know" -> read all modes aloud.
    if (LIST_MODES_RE.test(query)) {
      if (now - lastListRef.current < 4000) return;
      lastListRef.current = now;
      if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
      logDebug("trigger", "list modes");
      void speak(VOICE.modesList());
      return;
    }

    // Otherwise it's an open question / describe shortcut. Debounce so we
    // capture the full sentence instead of an early partial result.
    if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
    queryDebounceRef.current = setTimeout(() => fireDescribe(query), 1100);
  }

  async function start() {
    if (listenerRef.current) return;
    listenerRef.current = await startListening(handlePhrase);
    setListening(true);
    setVoiceListening(true);
  }

  function stop() {
    listenerRef.current?.stop();
    listenerRef.current = null;
    if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
    setListening(false);
    setVoiceListening(false);
  }

  useEffect(() => {
    void start();
    const offToggle = onVoiceToggle(() => {
      if (listenerRef.current) stop();
      else void start();
    });
    return () => {
      offToggle();
      stop();
    };
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

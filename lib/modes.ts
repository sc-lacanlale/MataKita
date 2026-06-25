import type { IconName } from "@/components/Icons";

export type ModeId = "outdoor" | "indoor" | "social" | "study" | "cooking";

export interface ModeDefinition {
  id: ModeId;
  label: string;
  /** Short description spoken / shown to the user. */
  description: string;
  /** Primary spatial/contextual focus per agent.md. */
  focus: string;
  /** Detection priorities the AI layer should weight. */
  priorities: string[];
  /** Target capture frame rate; outdoor is high-fps for safety, study is trigger/low-fps. */
  targetFps: number;
  /** Card / pill background colour (from the KitaKita design). */
  color: string;
  /** Glyph shown on the home card and the in-view mode pill. */
  icon: IconName;
  /** Short Filipino purpose spoken when listing the modes aloud. */
  voicePurpose: string;
}

export const MODES: Record<ModeId, ModeDefinition> = {
  outdoor: {
    id: "outdoor",
    label: "Outdoor",
    description: "Low-latency awareness while moving.",
    focus: "Low-latency, high-contrast moving object detection",
    priorities: [
      "Traffic movement",
      "Pedestrian flow",
      "Reading signage (bus stops, street names)",
    ],
    targetFps: 20,
    color: "#FFE374",
    icon: "sun",
    voicePurpose: "para sa paglalakad o pagbiyahe sa labas",
  },
  indoor: {
    id: "indoor",
    label: "Indoor",
    description: "Navigate rooms and find things at home.",
    focus: "Indoor layout, doorways, furniture and obstacles",
    priorities: [
      "Doorways and walkways",
      "Furniture and obstacles",
      "Finding everyday objects",
    ],
    targetFps: 12,
    color: "#ffb27a",
    icon: "house",
    voicePurpose: "para sa loob ng bahay at paghahanap ng gamit",
  },
  social: {
    id: "social",
    label: "Social",
    description: "Read people and social cues around you.",
    focus: "People, expressions and social context",
    priorities: [
      "Who is nearby",
      "Facial expressions and gestures",
      "Where people are facing",
    ],
    targetFps: 8,
    color: "#c9e57c",
    icon: "users",
    voicePurpose: "para sa mga tao at usapan sa paligid",
  },
  study: {
    id: "study",
    label: "Study",
    description: "Read and summarize text.",
    focus: "High-resolution OCR and knowledge extraction",
    priorities: [
      "Real-time reading",
      "Summarizing text",
      "Saving concepts to RAG for later querying",
    ],
    targetFps: 1,
    color: "#87e1dd",
    icon: "book",
    voicePurpose: "para sa pagbabasa at teksto",
  },
  cooking: {
    id: "cooking",
    label: "Cooking",
    description: "Close-range help around the kitchen.",
    focus: "1-meter radius spatial reasoning",
    priorities: [
      "Sharp edge tracking (knives)",
      "Heat / hazard indicators (boiling water, steam)",
      "Ingredient identification",
    ],
    targetFps: 8,
    color: "#b7bdff",
    icon: "cutlery",
    voicePurpose: "para sa kusina at pagluluto",
  },
};

export const MODE_LIST: ModeDefinition[] = [
  MODES.outdoor,
  MODES.indoor,
  MODES.social,
  MODES.study,
  MODES.cooking,
];

export function getMode(id: ModeId): ModeDefinition {
  return MODES[id];
}

/** Spoken copy for the boot welcome + "what are the modes" announcement. */
export const VOICE = {
  welcome:
    "Maligayang pagdating sa KitaKita. Anong mode ang gusto mong gamitin? " +
    "Kung hindi mo alam ang mga mode, sabihin: Hey Kita, anong mga mode.",
  modesList(): string {
    const items = MODE_LIST.map((m) => `${m.label}, ${m.voicePurpose}`);
    return (
      "Ito ang mga mode. " +
      items.join(". ") +
      ". At Video Call, para tumawag ng volunteer o tulong. " +
      "Pumili ng isa. Sabihin: Hey Kita, at ang pangalan ng mode."
    );
  },
};

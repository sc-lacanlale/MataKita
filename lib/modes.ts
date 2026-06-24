export type ModeId = "cooking" | "outdoor" | "study";

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
}

export const MODES: Record<ModeId, ModeDefinition> = {
  cooking: {
    id: "cooking",
    label: "Cooking Mode",
    description: "Close-range help around the kitchen.",
    focus: "1-meter radius spatial reasoning",
    priorities: [
      "Sharp edge tracking (knives)",
      "Heat / hazard indicators (boiling water, steam)",
      "Ingredient identification",
    ],
    targetFps: 8,
  },
  outdoor: {
    id: "outdoor",
    label: "Outdoor Mode",
    description: "Low-latency awareness while moving.",
    focus: "Low-latency, high-contrast moving object detection",
    priorities: [
      "Traffic movement",
      "Pedestrian flow",
      "Reading signage (bus stops, street names)",
    ],
    targetFps: 20,
  },
  study: {
    id: "study",
    label: "Study & Reading Mode",
    description: "Read and summarize text.",
    focus: "High-resolution OCR and knowledge extraction",
    priorities: [
      "Real-time reading",
      "Summarizing text",
      "Saving concepts to RAG for later querying",
    ],
    targetFps: 1,
  },
};

export const MODE_LIST: ModeDefinition[] = Object.values(MODES);

export function getMode(id: ModeId): ModeDefinition {
  return MODES[id];
}

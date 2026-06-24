/**
 * Study & Reading RAG pipeline - STUB.
 *
 * The real implementation will embed extracted concepts and support semantic
 * retrieval (e.g. "What did the textbook say about X?"). For now we keep a
 * simple local list with naive keyword search.
 */

export interface SavedConcept {
  id: string;
  text: string;
  source?: string;
  createdAt: number;
}

const KEY = "kitakita.concepts";

function read(): SavedConcept[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as SavedConcept[];
  } catch {
    return [];
  }
}

function write(value: SavedConcept[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(value));
}

export function saveConcept(text: string, source?: string): SavedConcept {
  const concept: SavedConcept = {
    id: `concept_${Date.now()}`,
    text,
    source,
    createdAt: Date.now(),
  };
  const all = read();
  all.push(concept);
  write(all);
  console.log("[ragService] (stub) saved concept:", concept);
  return concept;
}

export function query(q: string): SavedConcept[] {
  const needle = q.toLowerCase().trim();
  if (!needle) return [];
  return read().filter((c) => c.text.toLowerCase().includes(needle));
}

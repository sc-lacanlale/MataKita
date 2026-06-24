/**
 * "Teach My World" - Spatial & Object Memory - STUB.
 *
 * Registered items / spatial anchors are kept locally (localStorage for now) to
 * honor the privacy requirement that visual signatures stay on-device. The real
 * version will store encrypted visual embeddings in an isolated personal vector
 * store.
 */

export interface RegisteredObject {
  id: string;
  name: string;
  note?: string;
  createdAt: number;
}

export interface SpatialAnchor {
  id: string;
  label: string;
  relation: string; // e.g. "12 o'clock from the kitchen island"
  createdAt: number;
}

const OBJECTS_KEY = "kitakita.objects";
const ANCHORS_KEY = "kitakita.anchors";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function listObjects(): RegisteredObject[] {
  return read<RegisteredObject>(OBJECTS_KEY);
}

export function registerObject(name: string, note?: string): RegisteredObject {
  const obj: RegisteredObject = {
    id: `obj_${Date.now()}`,
    name,
    note,
    createdAt: Date.now(),
  };
  const all = listObjects();
  all.push(obj);
  write(OBJECTS_KEY, all);
  console.log("[memoryService] (stub) registered object:", obj);
  return obj;
}

export function listAnchors(): SpatialAnchor[] {
  return read<SpatialAnchor>(ANCHORS_KEY);
}

export function addAnchor(label: string, relation: string): SpatialAnchor {
  const anchor: SpatialAnchor = {
    id: `anchor_${Date.now()}`,
    label,
    relation,
    createdAt: Date.now(),
  };
  const all = listAnchors();
  all.push(anchor);
  write(ANCHORS_KEY, all);
  console.log("[memoryService] (stub) added spatial anchor:", anchor);
  return anchor;
}

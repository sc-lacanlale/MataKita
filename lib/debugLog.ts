"use client";

/**
 * Tiny in-memory debug log with pub/sub, surfaced by DebugPanel so we can see
 * on-device what the recognizer hears and what is sent to / returned by Gemini.
 */

export interface DebugEntry {
  id: number;
  t: number;
  tag: string;
  text: string;
}

const MAX = 50;
let counter = 0;
const entries: DebugEntry[] = [];
const subscribers = new Set<() => void>();

export function logDebug(tag: string, text: string): void {
  entries.push({ id: ++counter, t: Date.now(), tag, text });
  while (entries.length > MAX) entries.shift();
  subscribers.forEach((fn) => fn());
}

export function getDebugEntries(): DebugEntry[] {
  return entries;
}

export function clearDebug(): void {
  entries.length = 0;
  subscribers.forEach((fn) => fn());
}

export function subscribeDebug(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

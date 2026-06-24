"use client";

/**
 * Tiny in-app event bus so the global VoiceCommander can trigger actions on the
 * currently mounted mode screen (e.g. "what's in front of me" -> describe).
 */

type Handler = (payload?: string) => void;

const describeHandlers = new Set<Handler>();

export function onDescribeRequested(handler: Handler): () => void {
  describeHandlers.add(handler);
  return () => describeHandlers.delete(handler);
}

export function requestDescribe(payload?: string): boolean {
  if (describeHandlers.size === 0) return false;
  describeHandlers.forEach((h) => h(payload));
  return true;
}

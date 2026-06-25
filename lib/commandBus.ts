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

/* ---------- Enroll a person ("this is my mom") ---------- */

type LabelHandler = (label: string) => void;

const enrollHandlers = new Set<LabelHandler>();

export function onEnrollRequested(handler: LabelHandler): () => void {
  enrollHandlers.add(handler);
  return () => enrollHandlers.delete(handler);
}

/** Returns false if no camera screen is mounted to capture a face. */
export function requestEnroll(label: string): boolean {
  if (enrollHandlers.size === 0) return false;
  enrollHandlers.forEach((h) => h(label));
  return true;
}

/* ---------- Global voice listening toggle + state ---------- */

type VoidHandler = () => void;
type BoolHandler = (listening: boolean) => void;

const voiceToggleHandlers = new Set<VoidHandler>();
const voiceStateHandlers = new Set<BoolHandler>();
let voiceListening = false;

/** Registered by VoiceCommander; toggles the mic on/off. */
export function onVoiceToggle(handler: VoidHandler): () => void {
  voiceToggleHandlers.add(handler);
  return () => voiceToggleHandlers.delete(handler);
}

/** Called by UI (e.g. the View mic button) to flip the global mic. */
export function requestVoiceToggle(): void {
  voiceToggleHandlers.forEach((h) => h());
}

/** Subscribe to mic listening-state changes. Fires immediately with current value. */
export function onVoiceListening(handler: BoolHandler): () => void {
  voiceStateHandlers.add(handler);
  handler(voiceListening);
  return () => voiceStateHandlers.delete(handler);
}

/** Published by VoiceCommander whenever listening starts/stops. */
export function setVoiceListening(listening: boolean): void {
  voiceListening = listening;
  voiceStateHandlers.forEach((h) => h(listening));
}

export function getVoiceListening(): boolean {
  return voiceListening;
}

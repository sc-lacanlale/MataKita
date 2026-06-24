"use client";

import { Capacitor } from "@capacitor/core";

/**
 * Runtime camera permission handling.
 *
 * On the web, getUserMedia triggers its own permission prompt, so we just report
 * "granted" optimistically and let the browser handle it. On Android (Capacitor),
 * the native CAMERA runtime permission must be granted before the WebView will
 * allow getUserMedia, so we request it via the Camera plugin first.
 */

export type PermissionState = "granted" | "denied" | "prompt" | "unsupported";

export async function ensureCameraPermission(): Promise<PermissionState> {
  if (!Capacitor.isNativePlatform()) {
    // Browser: getUserMedia will prompt on its own.
    return "granted";
  }

  try {
    const { Camera } = await import("@capacitor/camera");

    const current = await Camera.checkPermissions();
    if (current.camera === "granted") return "granted";

    const requested = await Camera.requestPermissions({ permissions: ["camera"] });
    if (requested.camera === "granted") return "granted";
    if (requested.camera === "denied") return "denied";
    return "prompt";
  } catch (err) {
    console.warn("[permissions] camera permission request failed:", err);
    // Fall back to letting getUserMedia try anyway.
    return "prompt";
  }
}

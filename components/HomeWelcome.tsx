"use client";

import { useEffect } from "react";
import { speak } from "@/lib/voice";
import { VOICE } from "@/lib/modes";

// Module-level flag so the welcome only plays once per app launch, not every
// time the user returns to the Home screen.
let welcomed = false;

export default function HomeWelcome() {
  useEffect(() => {
    if (welcomed) return;
    welcomed = true;
    // Wait for the splash screen to finish before greeting the user.
    const t = setTimeout(() => {
      void speak(VOICE.welcome);
    }, 2600);
    return () => clearTimeout(t);
  }, []);

  return null;
}

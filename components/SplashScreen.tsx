"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Module-level flag so the splash only plays once per app launch (cold boot),
// not every time the user navigates back Home.
let shownThisSession = false;

export default function SplashScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(!shownThisSession);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (shownThisSession) return;
    shownThisSession = true;

    // On cold boot, make sure the splash hands off to the Home screen.
    if (pathname !== "/") router.replace("/");

    const fade = setTimeout(() => setLeaving(true), 1900);
    const done = setTimeout(() => setVisible(false), 2300);
    return () => {
      clearTimeout(fade);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div className={`splash ${leaving ? "splash-leaving" : ""}`} aria-label="KitaKita" role="img">
      <div className="splash-dots" aria-hidden="true">
        <span />
        <span />
      </div>

      <div className="splash-bubble-dark" aria-hidden="true">
        <div className="splash-bubble-dark-head" />
        <span className="splash-eyes">
          <i />
          <i />
        </span>
      </div>

      <div className="splash-bubble-light" aria-hidden="true">
        <div className="splash-bubble-light-head" />
        <div className="splash-logo">
          <span>Kita</span>
          <span>Kita</span>
        </div>
        <span className="splash-bubble-dots">
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}

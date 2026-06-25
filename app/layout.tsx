import type { Metadata, Viewport } from "next";
import "./globals.css";
import HazardWatcher from "@/components/HazardWatcher";
import VoiceCommander from "@/components/VoiceCommander";
import DebugPanel from "@/components/DebugPanel";
import SplashScreen from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: "KitaKita",
  description:
    "AI vision assistant giving visually impaired users real-time spatial and contextual understanding of their environment.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#42b7ff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=ABeeZee:ital@0;1&family=Baloo+2:wght@500;700;800&family=Tilt+Warp&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div id="app-root">{children}</div>
        <SplashScreen />
        <HazardWatcher />
        <VoiceCommander />
        <DebugPanel />
      </body>
    </html>
  );
}

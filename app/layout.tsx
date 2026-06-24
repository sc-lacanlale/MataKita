import type { Metadata, Viewport } from "next";
import "./globals.css";
import HazardWatcher from "@/components/HazardWatcher";
import VoiceCommander from "@/components/VoiceCommander";
import DebugPanel from "@/components/DebugPanel";

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
  themeColor: "#0b0b0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="app-root">{children}</div>
        <HazardWatcher />
        <VoiceCommander />
        <DebugPanel />
      </body>
    </html>
  );
}

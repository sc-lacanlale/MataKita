import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kitakita.app",
  appName: "KitaKita",
  webDir: "out",
  android: {
    allowMixedContent: true,
  },
};

export default config;

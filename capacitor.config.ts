import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kitakita.app",
  appName: "KitaKita",
  webDir: "out",
  android: {
    allowMixedContent: true,
  },
  // Development server - for live reload
  // server: {
  //   url: "http://192.168.254.117:3000",
  //   cleartext: true,
  // },
};

export default config;

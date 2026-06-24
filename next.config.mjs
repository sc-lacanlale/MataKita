/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Capacitor serves files over a custom scheme; relative assets keep paths valid.
  trailingSlash: true,
};

export default nextConfig;

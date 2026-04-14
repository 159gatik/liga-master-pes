import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // <--- ESTA ES LA CLAVE
  },
};

export default nextConfig;
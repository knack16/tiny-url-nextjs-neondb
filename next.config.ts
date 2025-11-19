import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Ensure Prisma stays external from the server bundle to avoid engine/module resolution issues
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;

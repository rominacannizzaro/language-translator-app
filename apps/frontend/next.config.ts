import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Next.js to build the website  as a static site.
  // This is useful for hosting on static file servers or CDNs like GitHub Pages, S3, or Netlify.
  output: "export",
  // Changes the default build output directory from '.next' to 'dist'.
  // This is helpful for monorepos or deployments where "dist" is a convention.
  distDir: "dist",
};

export default nextConfig;

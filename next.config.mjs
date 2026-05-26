/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    /* App router is GA in 15, no flag needed. */
  },
  /* Allow API routes to receive larger audio uploads (Whisper) up to 25 MB. */
  serverRuntimeConfig: { maxBodyBytes: 25 * 1024 * 1024 },
};

export default nextConfig;

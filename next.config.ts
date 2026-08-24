/** @type {import('next').NextConfig} */

const hostname = process.env.SITE_DOMAIN || 'anamstarter.local';

module.exports = {
  // isomorphic-dompurify pulls in jsdom -> html-encoding-sniffer -> @exodus/bytes,
  // which ships ESM-only. Left as a server external (the default), Vercel's
  // serverless functions try to require() it at runtime and crash with
  // ERR_REQUIRE_ESM. Bundling it at build time lets the bundler handle the
  // ESM/CJS interop instead.
  bundlePagesRouterDependencies: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: hostname,
      },
      {
        protocol: 'http',
        hostname: hostname,
      },
    ],
    // Only bypass optimization locally; production must get resized/re-encoded images.
    unoptimized: process.env.NODE_ENV !== 'production',
  },
};

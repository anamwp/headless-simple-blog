/** @type {import('next').NextConfig} */

const hostname = process.env.SITE_DOMAIN || 'anamstarter.local';

module.exports = {
  // Without this, the Pages Router leaves node_modules dependencies (e.g.
  // sanitize-html -> htmlparser2, which ships an ESM-only build) as runtime
  // externals in Vercel's serverless functions, where Node's require() can't
  // load them and throws ERR_REQUIRE_ESM. Bundling at build time avoids that.
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

/** @type {import('next').NextConfig} */

const hostname = process.env.SITE_DOMAIN || 'anamstarter.local';

module.exports = {
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  // Without this, the Pages Router leaves node_modules dependencies (e.g.
  // sanitize-html -> htmlparser2, which ships an ESM-only build) as runtime
  // externals in Vercel's serverless functions, where Node's require() can't
  // load them and throws ERR_REQUIRE_ESM. Bundling at build time avoids that.
  bundlePagesRouterDependencies: true,
  images: {
    dangerouslyAllowLocalIP: process.env.ALLOW_LOCAL_IMAGE_IP === 'true',
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

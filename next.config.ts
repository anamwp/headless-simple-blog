/** @type {import('next').NextConfig} */

const hostname = process.env.SITE_DOMAIN || 'anamstarter.local';

module.exports = {
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

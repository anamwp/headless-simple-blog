// import type { NextConfig } from "next";

// const nextConfig:  = {

//   /* config options here */
//   images: {
//     domains: ['anamstarter.local'], // Replace with your domain
//   },
// };

// export default nextConfig;


// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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
    unoptimized: true, // Bypass image optimization for local development
  },
};
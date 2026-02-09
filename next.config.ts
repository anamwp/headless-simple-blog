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

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https', // Use 'https' if your WordPress is served over HTTPS
        hostname: process.env.SITE_DOMAIN, // Replace with your WordPress domain
        port: '', // Specify the port if your WordPress runs on a non-standard port
        pathname: '/wp-content/uploads/**', // Match the path for uploaded media
      },
    ],
  },
};
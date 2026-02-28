/** @type {import('next').NextConfig} */
const nextConfig = {
    // PWA disabled for now — next-pwa causes service worker errors on Vercel
    // Re-enable when ready to properly configure PWA
    turbopack: {}
};

module.exports = nextConfig;

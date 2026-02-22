/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
    // Silence Turbopack warning since PWA is disabled in dev anyway
    turbopack: {}
};

module.exports = withPWA(nextConfig);

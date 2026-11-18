/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mongoose soll nicht gebündelt, sondern zur Laufzeit aus node_modules geladen werden.
  serverExternalPackages: ['mongoose'],
  images: {
    // Nur Profilbilder von Clerk zulassen. Vorher war jeder Host ("*") erlaubt,
    // damit hätte jeder den Bild-Optimierer als offenen Proxy missbrauchen können.
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'images.clerk.dev' },
    ],
  },
};

export default nextConfig;

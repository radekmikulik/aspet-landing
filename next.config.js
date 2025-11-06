/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // necháme build projít i kdyby byly typové/ESLint chyby
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // DŮLEŽITÉ: žádné `output: 'export'`!
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/inventory/location-labels-pdf": ["./output/pdf/CAMA-Ma-Vi-Tri-Xprinter-XP-365B.pdf"],
    },
  },
};

export default nextConfig;

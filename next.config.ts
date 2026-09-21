import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'Yovela-Dental-Clinic';

const nextConfig: NextConfig = {
  output: 'export', // Wajib untuk menghasilkan file statis di folder /out
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  images: {
    unoptimized: true, // Wajib agar gambar/icon tidak bermasalah di GitHub Pages
  },
  trailingSlash: true, // Mencegah error 404 saat membuka rute halaman seperti /pasien, /antrean, dll.
};

export default nextConfig;
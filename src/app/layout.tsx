import './globals.css';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="bg-[#f8fafc] text-slate-900 antialiased m-0 p-0">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
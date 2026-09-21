'use client';

import './globals.css';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../context/AuthContext';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  
  // Sidebar otomatis tertutup di mobile, terbuka di layar besar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasLocalSession, setHasLocalSession] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkSession = () => {
      const saved = localStorage.getItem('yovela_auth_session') || localStorage.getItem('yovela_current_user');
      setHasLocalSession(!!saved);
    };
    checkSession();
    window.addEventListener('storage', checkSession);
    return () => window.removeEventListener('storage', checkSession);
  }, []);

  const isAuthenticated = !!(currentUser || hasLocalSession);
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isAuthenticated && !isLoginPage) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoginPage, router]);

  // Jika di halaman login, tampilkan layar penuh tanpa sidebar
  if (isLoginPage || !isAuthenticated) {
    return <main className="min-h-screen bg-slate-950 w-full">{children}</main>;
  }

  const menuList = [
    { href: '/', label: 'Pemeriksaan (Poli)', icon: 'fa-tooth' },
    { href: '/satusehat', label: 'Bridging SATUSEHAT', icon: 'fa-hospital' },
    { href: '/pasien', label: 'Pendaftaran Pasien', icon: 'fa-user-plus' },
    { href: '/antrean', label: 'Antrean Hari Ini', icon: 'fa-clock-rotate-left' },
    { href: '/display-antrean', label: 'Display TV Monitor', icon: 'fa-tv', isExternal: true },
    { href: '/kasir', label: 'Kasir & Billing', icon: 'fa-receipt' },
    { href: '/laporan', label: 'Laporan Keuangan', icon: 'fa-chart-pie' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-['Poppins',sans-serif] flex antialiased relative">
      
      {/* Overlay gelap khusus tampilan mobile saat sidebar dibuka */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR RESPONSIF (Flyout di Mobile, Statis di Desktop) */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 bg-[#0d1527] text-white flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none w-64 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-2xl bg-[#26d4a5]/15 text-[#26d4a5] flex items-center justify-center font-bold text-base shrink-0">
                <svg viewBox="0 0 512 512" className="w-5 h-5 fill-[#26d4a5]">
                  <path d="M416 112c-35.3 0-64 28.7-64 64v51.2c0 23.4-12.2 44.9-32.3 56.8L272 312.6l-47.7-28.6c-20.1-12-32.3-33.5-32.3-56.8V176c0-35.3-28.7-64-64-64S64 140.7 64 176c0 86.8 52.3 162.7 128 193.3V432c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V369.3c75.7-30.6 128-106.5 128-193.3c0-35.3-28.7-64-64-64z" />
                </svg>
              </div>
              <div className="truncate">
                <h2 className="font-extrabold text-sm text-white tracking-tight leading-none">Yovela Dental</h2>
                <span className="text-[10px] text-slate-400 font-medium">Klinik Gigi Modern</span>
              </div>
            </div>

            {/* Tombol tutup khusus layar kecil */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer text-xs md:hidden"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <nav className="p-3 space-y-1.5 text-xs font-semibold">
            {menuList.map((m) => {
              const isActive = pathname === m.href;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition cursor-pointer ${
                    isActive
                      ? 'bg-[#26d4a5] text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid ${m.icon} text-sm w-4 text-center shrink-0`} />
                    <span className="truncate">{m.label}</span>
                  </div>
                  {m.isExternal && (
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-500 text-center font-medium">
          <p>v2.6 • SIM-RME Terakreditasi</p>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Tombol Hamburger Khusus Muncul di Tampilan Mobile/Smartphone */}
        <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center gap-3 md:hidden sticky top-0 z-30 shadow-2xs">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            <i className="fa-solid fa-bars text-sm" />
          </button>
          <span className="text-xs font-bold text-slate-700 tracking-tight">Menu Navigasi Mobile</span>
        </div>

        {children}
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="bg-[#f8fafc] text-slate-900 antialiased m-0 p-0">
        <AuthProvider>
          <DashboardShell>{children}</DashboardShell>
        </AuthProvider>
      </body>
    </html>
  );
}
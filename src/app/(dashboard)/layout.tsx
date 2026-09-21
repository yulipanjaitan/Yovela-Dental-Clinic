'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, accounts, updateAccounts } = useAuth();
  
  const pathname = usePathname();
  const router = useRouter();
  
  const isTVDisplay = pathname?.includes('/display-antrean');

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchSidebarQuery, setSearchSidebarQuery] = useState('');
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [accountFormData, setAccountFormData] = useState<Record<string, any>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [hasSession, setHasSession] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const sessionFlag = localStorage.getItem('yovela_auth_session');
    const userFlag = localStorage.getItem('yovela_current_user');
    return !!(sessionFlag || userFlag);
  });

  useEffect(() => {
    const checkSession = () => {
      if (typeof window === 'undefined') return;
      const savedAuth = localStorage.getItem('yovela_auth_session');
      const savedUser = localStorage.getItem('yovela_current_user');
      
      if (savedAuth || savedUser || currentUser) {
        setHasSession(true);
        if (!savedAuth) localStorage.setItem('yovela_auth_session', 'true');
      } else {
        setHasSession(false);
      }
    };
    checkSession();
  }, [currentUser]);

  useEffect(() => {
    if (!isTVDisplay && !hasSession && typeof window !== 'undefined' && pathname !== '/login') {
      router.push('/login');
    }
  }, [hasSession, pathname, router, isTVDisplay]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSettingsModal && accounts) {
      setAccountFormData(JSON.parse(JSON.stringify(accounts)));
      setSaveSuccessMsg('');
    }
  }, [showSettingsModal, accounts]);

  if (isTVDisplay) {
    return <main className="min-h-screen bg-slate-950 w-full">{children}</main>;
  }

  if (!hasSession) {
    return <main className="min-h-screen bg-slate-950 w-full">{children}</main>;
  }

  const activeDoctorName = currentUser?.name || 'drg. Yuli Kartilla Panjaitan';
  const activeDoctorLabel = currentUser?.roleLabel || 'Dokter Gigi Umum';

  const menuList = [
    { href: '/', label: 'Dasbor Utama', icon: 'fa-house-chimney' },
    { href: '/poli', label: 'Pemeriksaan (Poli)', icon: 'fa-tooth' },
    { href: '/satusehat', label: 'Bridging SATUSEHAT', icon: 'fa-hospital' },
    { href: '/pasien', label: 'Pendaftaran Pasien', icon: 'fa-user-plus' },
    { href: '/antrean', label: 'Antrean Hari Ini', icon: 'fa-clock-rotate-left' },
    { href: '/display-antrean', label: 'Display TV Monitor', icon: 'fa-tv', isExternal: true },
    { href: '/kasir', label: 'Kasir & Billing', icon: 'fa-receipt' },
    { href: '/laporan', label: 'Laporan Keuangan', icon: 'fa-chart-pie' },
  ];

  const filteredMenuList = menuList.filter((m) =>
    m.label.toLowerCase().includes(searchSidebarQuery.toLowerCase())
  );

  const handleFullLogout = () => {
    localStorage.removeItem('yovela_auth_session');
    localStorage.removeItem('yovela_current_user');
    setHasSession(false);
    if (typeof logout === 'function') logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-['Poppins',sans-serif] flex antialiased relative w-full">
      
      {/* SIDEBAR */}
      <aside
        className={`bg-[#0d1527] text-white flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out relative z-40 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* HEADER LOGO (KLIK UNTUK TOGGLE BUKA/TUTUP SIDEBAR) */}
          <div 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-4 border-b border-slate-800/80 flex items-center justify-between cursor-pointer group hover:bg-slate-800/40 transition"
            title={isCollapsed ? "Klik untuk memperluas sidebar" : "Klik untuk menyembunyikan sidebar"}
          >
            <div className={`flex items-center gap-3 overflow-hidden w-full ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-9 h-9 rounded-2xl bg-[#26d4a5]/15 text-[#26d4a5] flex items-center justify-center font-bold text-base shrink-0 shadow-xs group-hover:scale-105 transition">
                <svg viewBox="0 0 512 512" className="w-5 h-5 fill-[#26d4a5]">
                  <path d="M416 112c-35.3 0-64 28.7-64 64v51.2c0 23.4-12.2 44.9-32.3 56.8L272 312.6l-47.7-28.6c-20.1-12-32.3-33.5-32.3-56.8V176c0-35.3-28.7-64-64-64S64 140.7 64 176c0 86.8 52.3 162.7 128 193.3V432c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V369.3c75.7-30.6 128-106.5 128-193.3c0-35.3-28.7-64-64-64z" />
                </svg>
              </div>
              {!isCollapsed && (
                <div className="truncate leading-tight">
                  <h2 className="font-extrabold text-sm text-white tracking-tight">Yovela Dental</h2>
                  <span className="text-[10px] text-slate-400 font-medium block">Klinik Gigi Modern</span>
                </div>
              )}
            </div>
          </div>

          {!isCollapsed && (
            <div className="p-3 pb-1">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">
                  <i className="fa-solid fa-magnifying-glass" />
                </span>
                <input
                  type="text"
                  value={searchSidebarQuery}
                  onChange={(e) => setSearchSidebarQuery(e.target.value)}
                  placeholder="Cari menu..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#26d4a5] transition"
                />
              </div>
            </div>
          )}

          <nav className="p-3 space-y-1.5 text-xs font-semibold">
            <p className={`px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 ${isCollapsed ? 'text-center' : ''}`}>
              {!isCollapsed ? 'MAIN MENU' : '•••'}
            </p>
            {filteredMenuList.map((m) => {
              const isActive = pathname === m.href;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  target={m.isExternal ? '_blank' : '_self'}
                  rel={m.isExternal ? 'noopener noreferrer' : undefined}
                  title={m.label} // Tooltip otomatis muncul saat kursor diarahkan dalam mode ciut
                  className={`w-full flex items-center px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                    isActive
                      ? 'bg-[#26d4a5] text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white font-bold'
                  } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid ${m.icon} text-sm w-5 text-center shrink-0`} />
                    {!isCollapsed && <span className="truncate">{m.label}</span>}
                  </div>
                  {m.isExternal && !isCollapsed && (
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80 text-center">
          {!isCollapsed ? (
            <p className="text-[10px] text-slate-500 font-medium">v2.6 • SIM-RME Terakreditasi</p>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-mono font-bold" title="v2.6 SIM-RME">
              v2.6
            </div>
          )}
        </div>
      </aside>

      {/* KONTEN UTAMA & HEADER STICKY */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 shadow-2xs sticky top-0 z-30 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#26d4a5]/20 text-[#26d4a5] flex items-center justify-center font-bold text-xs">
              <i className="fa-solid fa-tooth" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight">Yovela Dental Clinic Workspace</span>
          </div>

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#26d4a5] animate-pulse" />
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-800 block leading-tight">{activeDoctorName}</span>
                <span className="text-[9px] text-[#0fa882] font-semibold block">{activeDoctorLabel}</span>
              </div>
              <i className={`fa-solid fa-chevron-down text-slate-400 text-[10px] ml-1 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{activeDoctorName}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">SIP: 503/449/DRG/2026</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <i className="fa-solid fa-users-gear text-slate-400 text-xs w-4" />
                  <span>Pengaturan User & Password</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={handleFullLogout}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer font-medium"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket text-xs w-4" />
                  <span>Keluar dari Sesi (Logout)</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {children}

        <footer className="text-center text-[11px] text-slate-400 font-medium py-6 mt-auto border-t border-slate-200/60 print:hidden">
          © {new Date().getFullYear()} Yovela Dental Clinic. All Rights Reserved.
        </footer>
      </div>

      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Pengaturan Pengguna & Kata Sandi Staf</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>
            {saveSuccessMsg && <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-bold">{saveSuccessMsg}</div>}
            <form onSubmit={(e) => {
              e.preventDefault();
              updateAccounts(accountFormData);
              setSaveSuccessMsg('Pengaturan berhasil disimpan.');
              setTimeout(() => setSaveSuccessMsg(''), 3000);
            }} className="space-y-4 text-xs">
              {Object.keys(accountFormData).map((k) => (
                <div key={k} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-bold uppercase text-[11px] text-slate-700">Role: {accountFormData[k].role}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={accountFormData[k].name}
                      onChange={(e) => setAccountFormData({...accountFormData, [k]: {...accountFormData[k], name: e.target.value}})}
                      className="p-2 border rounded-xl bg-white"
                      placeholder="Nama"
                    />
                    <input
                      type="text"
                      value={accountFormData[k].username}
                      onChange={(e) => setAccountFormData({...accountFormData, [k]: {...accountFormData[k], username: e.target.value}})}
                      className="p-2 border rounded-xl bg-white"
                      placeholder="Username"
                    />
                    <input
                      type="text"
                      value={accountFormData[k].pass}
                      onChange={(e) => setAccountFormData({...accountFormData, [k]: {...accountFormData[k], pass: e.target.value}})}
                      className="p-2 border rounded-xl bg-white"
                      placeholder="Password"
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSettingsModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 bg-[#26d4a5] text-slate-950 font-bold rounded-xl">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
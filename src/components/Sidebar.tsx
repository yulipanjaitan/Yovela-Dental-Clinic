'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, UserRole } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

interface MenuItem {
  name: string;
  href: string;
  faIcon: string;
  allowedRoles: UserRole[];
  openInNewTab?: boolean;
}

const allMenus: MenuItem[] = [
  { name: 'Pemeriksaan (Poli)', href: '/', faIcon: 'fa-solid fa-tooth', allowedRoles: ['DOKTER'] },
  { name: 'Bridging SATUSEHAT', href: '/satusehat', faIcon: 'fa-solid fa-hospital', allowedRoles: ['DOKTER'] },
  { name: 'Pendaftaran Pasien', href: '/pasien', faIcon: 'fa-solid fa-user-plus', allowedRoles: ['DOKTER', 'PENDAFTARAN'] },
  { name: 'Antrean Hari Ini', href: '/antrean', faIcon: 'fa-solid fa-clock-rotate-left', allowedRoles: ['DOKTER', 'PENDAFTARAN'] },
  { name: 'Display TV Monitor', href: '/display-antrean', faIcon: 'fa-solid fa-tv', allowedRoles: ['DOKTER', 'PENDAFTARAN'], openInNewTab: true },
  { name: 'Kasir & Billing', href: '/kasir', faIcon: 'fa-solid fa-receipt', allowedRoles: ['DOKTER', 'KASIR'] },
  { name: 'Laporan Keuangan', href: '/laporan', faIcon: 'fa-solid fa-chart-pie', allowedRoles: ['DOKTER', 'KASIR'] },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  if (pathname === '/display-antrean' || pathname === '/login') {
    return null;
  }

  const visibleMenus = allMenus.filter(
    (menu) => currentUser && menu.allowedRoles.includes(currentUser.role)
  );

  return (
    <aside 
      className={`bg-[#0f172a] text-white min-h-screen flex flex-col justify-between print:hidden shrink-0 z-30 transition-all duration-300 relative border-r border-slate-800 font-['Poppins'] ${
        isCollapsed ? 'w-20 min-w-[5rem]' : 'w-64 min-w-[16rem]'
      }`}
      style={{
        width: isCollapsed ? '5rem' : '16rem',
        minWidth: isCollapsed ? '5rem' : '16rem',
        flexShrink: 0,
      }}
    >
      <button
        onClick={toggleSidebar}
        title={isCollapsed ? 'Perluas Sidebar' : 'Sembunyikan Sidebar'}
        className="absolute -right-3 top-6 z-40 w-6 h-6 bg-[#26d4a5] hover:bg-[#20b88f] text-slate-950 rounded-full flex items-center justify-center shadow-md border-2 border-[#0f172a] transition-transform text-xs cursor-pointer"
      >
        <i className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`} />
      </button>

      <div>
        <Link 
          href="/" 
          className="p-4 flex items-center gap-3 border-b border-slate-800/80 hover:bg-slate-800/40 transition group cursor-pointer"
          title="Kembali ke Beranda"
        >
          <div className="w-10 h-10 rounded-xl bg-[#26d4a5]/10 border border-[#26d4a5]/30 flex items-center justify-center p-2 group-hover:scale-105 transition shadow-sm shrink-0">
            <svg viewBox="0 0 512 512" className="w-full h-full fill-[#26d4a5]">
              <path d="M416 112c-35.3 0-64 28.7-64 64v51.2c0 23.4-12.2 44.9-32.3 56.8L272 312.6l-47.7-28.6c-20.1-12-32.3-33.5-32.3-56.8V176c0-35.3-28.7-64-64-64S64 140.7 64 176c0 86.8 52.3 162.7 128 193.3V432c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V369.3c75.7-30.6 128-106.5 128-193.3c0-35.3-28.7-64-64-64z" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm tracking-tight text-white group-hover:text-[#26d4a5] transition truncate">
                Yovela Dental
              </h1>
              <p className="text-[10px] text-slate-400 truncate">Klinik Gigi Modern</p>
            </div>
          )}
        </Link>

        {/* Daftar Menu Bersih */}
        <nav className="p-3 space-y-1.5 mt-2">
          {visibleMenus.map((menu) => {
            const isActive = pathname === menu.href;
            return (
              <Link
                key={menu.href}
                href={menu.href}
                target={menu.openInNewTab ? '_blank' : undefined}
                rel={menu.openInNewTab ? 'noopener noreferrer' : undefined}
                title={isCollapsed ? menu.name : undefined}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#26d4a5] text-slate-950 font-bold shadow-md shadow-[#26d4a5]/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <i className={`${menu.faIcon} text-sm w-4 text-center shrink-0`} />
                {!isCollapsed && (
                  <span className="truncate flex-1 flex items-center justify-between">
                    <span>{menu.name}</span>
                    {menu.openInNewTab && (
                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px] opacity-60 ml-2" />
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bagian Bawah Bersih / Status Mini */}
      <div className="p-3 border-t border-slate-800/60 text-[10px] text-slate-500 text-center">
        {!isCollapsed ? <span>v2.6 • SIM-RME Terakreditasi</span> : <span>v2.6</span>}
      </div>
    </aside>
  );
};
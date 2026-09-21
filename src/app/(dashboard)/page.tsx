'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredPatients, PatientRecord } from '../../data/patientDatabase';
import { useAuth } from '../../context/AuthContext';

export default function DashboardOverviewPage() {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Muat data pasien & transaksi dari localStorage
    const list = getStoredPatients();
    setPatients(list);

    const savedTrx = localStorage.getItem('yovela_clinic_transactions');
    if (savedTrx) {
      try {
        setTransactions(JSON.parse(savedTrx));
      } catch {}
    }
  }, []);

  // Hitung statistik kilat
  const totalPatientsToday = patients.length;
  const waitingCount = patients.filter((p) => p.statusKunjungan === 'Menunggu').length;
  const inProgressCount = patients.filter((p) => p.statusKunjungan === 'Sedang Diperiksa').length;
  const pendingPaymentCount = patients.filter((p) => p.statusKunjungan === 'Menunggu Pembayaran').length;
  const finishedCount = patients.filter((p) => p.statusKunjungan === 'Selesai').length;

  const totalOmsetToday = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const activeStaffName = currentUser?.name || 'Staf / Dokter Klinik';
  const activeRoleLabel = currentUser?.roleLabel || currentUser?.role || 'Administrator';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-['Poppins',sans-serif] flex flex-col antialiased pb-12 w-full">
      
      {/* 1. KONTEN UTAMA DASBOR */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        
        {/* BANNER SELAMAT DATANG */}
        <div className="bg-gradient-to-r from-[#0d1527] to-[#16223b] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-[#26d4a5]/10 pointer-events-none blur-2xl" />
          
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#26d4a5]/20 text-[#26d4a5] text-xs font-bold border border-[#26d4a5]/30">
              <span className="w-2 h-2 rounded-full bg-[#26d4a5] animate-pulse" />
              <span>Sistem Informasi Manajemen Klinik Gigi (SIM-RME)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Selamat Datang, {activeStaffName}! 👋
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Anda masuk sebagai <strong className="text-[#26d4a5]">{activeRoleLabel}</strong>. Seluruh data rekam medis, antrean poli, dan kasir sinkron secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-end">
            <Link
              href="/poli"
              className="px-5 py-3 rounded-2xl bg-[#26d4a5] hover:bg-[#20b88f] text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-tooth text-xs" />
              <span>Buka Ruang Pemeriksaan Poli</span>
            </Link>
          </div>
        </div>

        {/* KARTU STATISTIK UTAMA (GRID) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Pasien */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pasien Terdaftar</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs shadow-2xs">
                <i className="fa-solid fa-users" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black font-mono text-slate-900">{totalPatientsToday}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Pasien aktif dalam database klinik</p>
            </div>
          </div>

          {/* Card 2: Antrean Menunggu */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Antrean Menunggu Poli</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xs shadow-2xs">
                <i className="fa-solid fa-clock-rotate-left" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black font-mono text-amber-600">{waitingCount + inProgressCount}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{waitingCount} antrean baru, {inProgressCount} sedang diperiksa</p>
            </div>
          </div>

          {/* Card 3: Menunggu Pembayaran */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billing Kasir (Pending)</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xs shadow-2xs">
                <i className="fa-solid fa-cash-register" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black font-mono text-purple-600">{pendingPaymentCount}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Pasien selesai diperiksa butuh pembayaran</p>
            </div>
          </div>

          {/* Card 4: Omset Pendapatan Hari Ini */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Omset Hari Ini</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0fa882] flex items-center justify-center text-xs shadow-2xs">
                <i className="fa-solid fa-wallet" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black font-mono text-[#0fa882]">Rp {totalOmsetToday.toLocaleString('id-ID')}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{transactions.length} transaksi kasir tercatat</p>
            </div>
          </div>

        </div>

        {/* PUSAT PINTASAN MODUL (QUICK ACCESS) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pusat Pintasan Modul Klinik</h2>
              <p className="text-[11px] text-slate-400">Akses cepat menuju seluruh modul operasional harian</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <Link
              href="/pasien"
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-[#26d4a5] transition group flex items-center gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0fa882] flex items-center justify-center text-lg group-hover:scale-105 transition shadow-2xs">
                <i className="fa-solid fa-user-plus" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#0fa882] transition">Pendaftaran Pasien</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Registrasi pasien baru & terbitkan tiket antrean</p>
              </div>
            </Link>

            <Link
              href="/poli"
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-[#26d4a5] transition group flex items-center gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-lg group-hover:scale-105 transition shadow-2xs">
                <i className="fa-solid fa-tooth" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">Pemeriksaan Poli Gigi</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Odontogram digital, SOAP medis, & resep obat</p>
              </div>
            </Link>

            <Link
              href="/kasir"
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-[#26d4a5] transition group flex items-center gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center text-lg group-hover:scale-105 transition shadow-2xs">
                <i className="fa-solid fa-receipt" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition">Kasir & Billing</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Pembayaran tindakan, QRIS, tunai, & struk termal</p>
              </div>
            </Link>

            <Link
              href="/antrean"
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-[#26d4a5] transition group flex items-center gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-lg group-hover:scale-105 transition shadow-2xs">
                <i className="fa-solid fa-clock-rotate-left" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition">Antrean Hari Ini</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Monitor status kunjungan pasien secara langsung</p>
              </div>
            </Link>

            <Link
              href="/display-antrean"
              target="_blank"
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-[#26d4a5] transition group flex items-center gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 text-[#26d4a5] flex items-center justify-center text-lg group-hover:scale-105 transition shadow-2xs">
                <i className="fa-solid fa-tv" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#0fa882] transition flex items-center gap-1.5">
                  <span>Display TV Monitor</span>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-400" />
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Buka layar ruang tunggu pasien di tab baru</p>
              </div>
            </Link>

            <Link
              href="/laporan"
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-[#26d4a5] transition group flex items-center gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-lg group-hover:scale-105 transition shadow-2xs">
                <i className="fa-solid fa-chart-pie" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition">Laporan Keuangan</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Rekapitulasi omset, ekspor CSV, & cetak PDF</p>
              </div>
            </Link>

          </div>
        </div>

      </main>
    </div>
  );
}
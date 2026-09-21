'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

interface TransactionItem {
  id: string;
  invoiceNo: string;
  date: string;
  patientName: string;
  rmNumber: string;
  doctorName: string;
  cashierName?: string;
  treatments: string[];
  paymentMethod: 'Tunai' | 'QRIS' | 'Debit/Transfer';
  amount: number;
}

export default function LaporanKeuanganPage() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<'ALL' | 'Tunai' | 'QRIS' | 'Debit/Transfer'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const clinicDoctor = 'drg. Yuli Kartilla Panjaitan';
  const activeUser = currentUser?.name || 'Administrator Keuangan';

  useEffect(() => {
    const savedTrx = localStorage.getItem('yovela_clinic_transactions');
    if (savedTrx) {
      try {
        setTransactions(JSON.parse(savedTrx));
      } catch {
        setTransactions([]);
      }
    }
  }, []);

  const filteredData = useMemo(() => {
    return transactions.filter((trx) => {
      const matchSearch =
        trx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trx.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trx.rmNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchMethod = filterMethod === 'ALL' || trx.paymentMethod === filterMethod;

      let matchDate = true;
      if (startDate) {
        matchDate = matchDate && trx.date.slice(0, 10) >= startDate;
      }
      if (endDate) {
        matchDate = matchDate && trx.date.slice(0, 10) <= endDate;
      }

      return matchSearch && matchMethod && matchDate;
    });
  }, [transactions, searchQuery, filterMethod, startDate, endDate]);

  const summary = useMemo(() => {
    const totalOmset = filteredData.reduce((acc, curr) => acc + curr.amount, 0);
    const qrisTotal = filteredData.filter((t) => t.paymentMethod === 'QRIS').reduce((a, b) => a + b.amount, 0);
    const cashTotal = filteredData.filter((t) => t.paymentMethod === 'Tunai').reduce((a, b) => a + b.amount, 0);
    const transferTotal = filteredData.filter((t) => t.paymentMethod === 'Debit/Transfer').reduce((a, b) => a + b.amount, 0);

    return { totalOmset, qrisTotal, cashTotal, transferTotal, count: filteredData.length };
  }, [filteredData]);

  const exportCSV = () => {
    const headers = ['No Invoice', 'Tanggal & Waktu', 'Nama Pasien', 'No RM', 'Dokter', 'Tindakan', 'Metode Bayar', 'Jumlah (Rp)'];
    const rows = filteredData.map((t) => [
      t.invoiceNo,
      t.date,
      `"${t.patientName}"`,
      t.rmNumber,
      `"${t.doctorName}"`,
      `"${t.treatments.join('; ')}"`,
      t.paymentMethod,
      t.amount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_Yovela_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-['Poppins',sans-serif] flex flex-col antialiased pb-12">
      {/* =========================================================================
          1. TOP NAVIGATION HEADER (PRINT: HIDDEN)
         ========================================================================= */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 xl:px-10 py-3 shadow-xs print:hidden">
        <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer" title="Kembali ke Pemeriksaan Poli">
              <div className="w-9 h-9 rounded-xl bg-[#26d4a5]/15 border border-[#26d4a5]/30 flex items-center justify-center p-2 group-hover:scale-105 transition duration-200 shadow-2xs">
                <svg viewBox="0 0 512 512" className="w-full h-full fill-[#26d4a5]">
                  <path d="M416 112c-35.3 0-64 28.7-64 64v51.2c0 23.4-12.2 44.9-32.3 56.8L272 312.6l-47.7-28.6c-20.1-12-32.3-33.5-32.3-56.8V176c0-35.3-28.7-64-64-64S64 140.7 64 176c0 86.8 52.3 162.7 128 193.3V432c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V369.3c75.7-30.6 128-106.5 128-193.3c0-35.3-28.7-64-64-64z" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-slate-900 group-hover:text-[#20b88f] transition">
                  Yovela Dental Clinic
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">Laporan Keuangan, Omset & Rekapitulasi Kasir</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={exportCSV}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <i className="fa-solid fa-file-excel text-emerald-600" />
              <span>Ekspor CSV</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-1.5 rounded-xl bg-[#26d4a5] hover:bg-[#20b88f] text-slate-950 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <i className="fa-solid fa-print text-xs" />
              <span>Cetak Laporan PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. KARTU STATISTIK & FILTER (PRINT: HIDDEN)
         ========================================================================= */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 xl:px-10 py-4 shadow-2xs print:hidden">
        <div className="max-w-[1440px] w-full mx-auto space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Total Omset Pendapatan</span>
              <h3 className="text-2xl font-black font-mono text-emerald-700 mt-1">
                Rp {summary.totalOmset.toLocaleString('id-ID')}
              </h3>
              <p className="text-[10px] text-emerald-600 mt-0.5">{summary.count} Transaksi Berhasil</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Metode QRIS</span>
              <h3 className="text-xl font-bold font-mono text-slate-800 mt-1">
                Rp {summary.qrisTotal.toLocaleString('id-ID')}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Non-Tunai QRIS Dinamis</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Metode Tunai (Cash)</span>
              <h3 className="text-xl font-bold font-mono text-slate-800 mt-1">
                Rp {summary.cashTotal.toLocaleString('id-ID')}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Fisik di Kasir</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Debit / Transfer</span>
              <h3 className="text-xl font-bold font-mono text-slate-800 mt-1">
                Rp {summary.transferTotal.toLocaleString('id-ID')}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Bank / EDC</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari Pasien, Invoice, No RM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#26d4a5] focus:bg-white transition"
                />
                <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs absolute left-2.5 top-2.5" />
              </div>

              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#26d4a5] cursor-pointer"
              >
                <option value="ALL">Semua Pembayaran</option>
                <option value="QRIS">QRIS</option>
                <option value="Tunai">Tunai</option>
                <option value="Debit/Transfer">Debit/Transfer</option>
              </select>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 outline-none focus:border-[#26d4a5]"
                />
                <span>s/d</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 outline-none focus:border-[#26d4a5]"
                />
              </div>
            </div>

            {(startDate || endDate || searchQuery || filterMethod !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSearchQuery('');
                  setFilterMethod('ALL');
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. TABEL DATA TAMPILAN SCREEN (PRINT: HIDDEN)
         ========================================================================= */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 flex-1 print:hidden">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daftar Transaksi Keuangan ({filteredData.length} Data)
            </h2>
            <span className="text-[11px] text-slate-400">Menampilkan mutasi kasir yang sah</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">No. Invoice</th>
                  <th className="py-3 px-4">Tanggal & Waktu</th>
                  <th className="py-3 px-4">Pasien</th>
                  <th className="py-3 px-4">No. RM</th>
                  <th className="py-3 px-4">Tindakan Klinis</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4 text-right">Total Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                      Tidak ditemukan transaksi dalam periode atau filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#0fa882]">{trx.invoiceNo}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{trx.date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{trx.patientName}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{trx.rmNumber}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{trx.treatments.join(', ')}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#26d4a5]/15 text-[#0fa882]">
                          {trx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        Rp {trx.amount.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* =========================================================================
          4. DOKUMEN CETAK LAPORAN KEUANGAN RESMI (HANYA AKTIF SAAT WINDOW.PRINT)
         ========================================================================= */}
      <section className="hidden print:block fixed inset-0 m-0 p-8 bg-white text-black font-sans text-xs z-[99999]">
        {/* KOP RESMI KLINIK */}
        <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-black">Yovela Dental Clinic</h1>
            <p className="text-xs text-gray-700">Instalasi Pelayanan Medis Gigi & Bedah Mulut Modern</p>
            <p className="text-[11px] text-gray-600">Jl. Pemuda No. 45, Semarang • Telp: (024) 8765-4321</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold uppercase tracking-wide">Laporan Keuangan & Mutasi Kasir</h2>
            <p className="text-[11px] text-gray-600">
              Periode: {startDate ? startDate : 'Awal'} s/d {endDate ? endDate : 'Sekarang'}
            </p>
            <p className="text-[10px] text-gray-500">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* RINGKASAN PEMBAYARAN */}
        <div className="grid grid-cols-4 gap-3 mb-4 p-3 border border-black rounded text-[11px]">
          <div>
            <span className="block text-gray-600 uppercase text-[9px]">Total Omset</span>
            <strong className="text-sm font-mono">Rp {summary.totalOmset.toLocaleString('id-ID')}</strong>
          </div>
          <div>
            <span className="block text-gray-600 uppercase text-[9px]">QRIS</span>
            <strong className="text-sm font-mono">Rp {summary.qrisTotal.toLocaleString('id-ID')}</strong>
          </div>
          <div>
            <span className="block text-gray-600 uppercase text-[9px]">Tunai (Cash)</span>
            <strong className="text-sm font-mono">Rp {summary.cashTotal.toLocaleString('id-ID')}</strong>
          </div>
          <div>
            <span className="block text-gray-600 uppercase text-[9px]">Debit/Transfer</span>
            <strong className="text-sm font-mono">Rp {summary.transferTotal.toLocaleString('id-ID')}</strong>
          </div>
        </div>

        {/* TABEL MUTASI RESMI UNTUK CETAK */}
        <table className="w-full border-collapse border border-black text-[10px] mb-6">
          <thead>
            <tr className="bg-gray-100 border-b border-black text-left">
              <th className="border border-black p-1.5 w-8 text-center">No</th>
              <th className="border border-black p-1.5">No Invoice</th>
              <th className="border border-black p-1.5">Waktu</th>
              <th className="border border-black p-1.5">Pasien</th>
              <th className="border border-black p-1.5">No RM</th>
              <th className="border border-black p-1.5">Tindakan</th>
              <th className="border border-black p-1.5">Metode</th>
              <th className="border border-black p-1.5 text-right">Jumlah (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((trx, idx) => (
              <tr key={trx.id} className="border-b border-gray-300">
                <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                <td className="border border-black p-1.5 font-mono">{trx.invoiceNo}</td>
                <td className="border border-black p-1.5 font-mono">{trx.date}</td>
                <td className="border border-black p-1.5 font-semibold">{trx.patientName}</td>
                <td className="border border-black p-1.5 font-mono">{trx.rmNumber}</td>
                <td className="border border-black p-1.5">{trx.treatments.join(', ')}</td>
                <td className="border border-black p-1.5">{trx.paymentMethod}</td>
                <td className="border border-black p-1.5 text-right font-mono font-bold">
                  Rp {trx.amount.toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-100 border-t-2 border-black">
              <td colSpan={7} className="border border-black p-2 text-right uppercase">
                TOTAL KESELURUHAN ({filteredData.length} TRANSAKSI):
              </td>
              <td className="border border-black p-2 text-right font-mono text-xs">
                Rp {summary.totalOmset.toLocaleString('id-ID')}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* KOLOM TANDA TANGAN FORMAL */}
        <div className="flex justify-between items-start pt-6 text-[11px] break-inside-avoid">
          <div className="text-center w-52">
            <p className="mb-14">Petugas Kasir / Keuangan,</p>
            <p className="font-bold underline">{activeUser}</p>
            <p className="text-[10px] text-gray-500">Staf Administrasi Klinik</p>
          </div>

          <div className="text-center w-52">
            <p className="mb-14">Penanggung Jawab Medis,</p>
            <p className="font-bold underline">{clinicDoctor}</p>
            <p className="text-[10px] text-gray-500">SIP: 503/449/DRG/2026</p>
          </div>
        </div>
      </section>
    </div>
  );
}
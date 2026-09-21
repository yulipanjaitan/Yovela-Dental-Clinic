'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  getStoredPatients, 
  saveStoredPatients, 
  PatientRecord 
} from '../../../data/patientDatabase';
import { TREATMENTS, Treatment } from '../../../data/mockData';
import { InvoiceReceipt } from '../../../components/InvoiceReceipt';
import { useAuth } from '../../../context/AuthContext';

interface TransactionItem {
  id: string;
  invoiceNo: string;
  date: string;
  patientName: string;
  rmNumber: string;
  doctorName: string;
  cashierName: string;
  treatments: string[];
  paymentMethod: 'Tunai' | 'QRIS' | 'Debit/Transfer';
  amount: number;
  cashGiven?: number;
  change?: number;
}

export default function KasirBillingPage() {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'billing' | 'riwayat'>('billing');
  const [toastMessage, setToastMessage] = useState('');

  // Identitas Petugas Kasir Aktif
  const activeCashierName = currentUser?.name 
    ? `${currentUser.name} (${currentUser.roleLabel || currentUser.role})` 
    : 'Siti Rahma, S.E. (Kasir)';

  const activeDoctorName = 'drg. Yuli Kartilla Panjaitan';

  // Form Pembayaran
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'QRIS' | 'Debit/Transfer'>('QRIS');
  const [cashGiven, setCashGiven] = useState<number | ''>('');
  const [completedInvoice, setCompletedInvoice] = useState<{
    invoiceNo: string;
    patientName: string;
    rmNumber: string;
    doctorName: string;
    treatments: Treatment[];
    total: number;
  } | null>(null);

  // Muat data pasien dan riwayat transaksi
  useEffect(() => {
    const list = getStoredPatients();
    setPatients(list);

    // Cari pasien pertama yang butuh pembayaran
    const pendingPatient = list.find((p) => p.statusKunjungan === 'Menunggu Pembayaran');
    if (pendingPatient) {
      setSelectedPatientId(pendingPatient.id);
    } else if (list.length > 0) {
      setSelectedPatientId(list[0].id);
    }

    // Muat riwayat transaksi tersimpan
    const savedTrx = localStorage.getItem('yovela_clinic_transactions');
    if (savedTrx) {
      try {
        setTransactions(JSON.parse(savedTrx));
      } catch {}
    }
  }, []);

  // Pasien yang sedang dipilih di kasir
  const activePatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // Rincian Tindakan Pasien Terpilih
  const patientTreatments = useMemo<Treatment[]>(() => {
    if (!activePatient || !activePatient.lastSoap?.suggestedTreatments) {
      return [TREATMENTS[0]];
    }
    const matched = TREATMENTS.filter((t) => 
      activePatient.lastSoap?.suggestedTreatments?.includes(t.id)
    );
    return matched.length > 0 ? matched : [TREATMENTS[0]];
  }, [activePatient]);

  // Total Tagihan
  const totalAmount = useMemo(() => {
    return patientTreatments.reduce((acc, curr) => acc + curr.price, 0);
  }, [patientTreatments]);

  // Kembalian Tunai
  const changeAmount = useMemo(() => {
    if (paymentMethod !== 'Tunai' || typeof cashGiven !== 'number') return 0;
    return cashGiven - totalAmount >= 0 ? cashGiven - totalAmount : 0;
  }, [paymentMethod, cashGiven, totalAmount]);

  // Pasien yang berstatus menunggu pembayaran
  const pendingPatients = useMemo(() => {
    return patients.filter((p) => p.statusKunjungan === 'Menunggu Pembayaran');
  }, [patients]);

  // Proses Transaksi Pembayaran
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    if (paymentMethod === 'Tunai' && (typeof cashGiven !== 'number' || cashGiven < totalAmount)) {
      setToastMessage('Nominal uang tunai kurang dari total tagihan!');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const now = new Date();
    const invoiceNo = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${activePatient.queueNumber}`;

    const newTransaction: TransactionItem = {
      id: `TRX-${Date.now()}`,
      invoiceNo,
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      patientName: activePatient.name,
      rmNumber: activePatient.rmNumber,
      doctorName: activeDoctorName,
      cashierName: activeCashierName,
      treatments: patientTreatments.map((t) => t.name),
      paymentMethod,
      amount: totalAmount,
      cashGiven: paymentMethod === 'Tunai' && typeof cashGiven === 'number' ? cashGiven : totalAmount,
      change: changeAmount,
    };

    // 1. Simpan Transaksi Kasir
    const updatedTrx = [newTransaction, ...transactions];
    setTransactions(updatedTrx);
    localStorage.setItem('yovela_clinic_transactions', JSON.stringify(updatedTrx));

    // 2. Perbarui Status Pasien Menjadi Selesai
    const updatedPatients = patients.map((p) => 
      p.id === activePatient.id ? { ...p, statusKunjungan: 'Selesai' as const } : p
    );
    setPatients(updatedPatients);
    saveStoredPatients(updatedPatients);

    // 3. Siapkan Data Struk Cetak
    setCompletedInvoice({
      invoiceNo,
      patientName: activePatient.name,
      rmNumber: activePatient.rmNumber,
      doctorName: activeDoctorName,
      treatments: patientTreatments,
      total: totalAmount,
    });

    setToastMessage(`Pembayaran ${invoiceNo} berhasil diproses!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-['Poppins',sans-serif] flex flex-col antialiased pb-12 w-full">
      
      {/* TOAST NOTIFIKASI */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700 text-xs font-semibold">
          <div className="w-6 h-6 rounded-full bg-[#26d4a5] text-slate-950 flex items-center justify-center text-xs">
            <i className="fa-solid fa-receipt" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. SUB-BANNER TABS & STATISTIK KASIR */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 xl:px-10 py-3.5 shadow-2xs print:hidden">
        <div className="max-w-[1440px] w-full mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'billing'
                  ? 'bg-[#26d4a5] text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-cash-register text-xs" />
              <span>Loket Pembayaran Pasien</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('riwayat')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'riwayat'
                  ? 'bg-[#26d4a5] text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-receipt text-xs" />
              <span>Riwayat Transaksi ({transactions.length})</span>
            </button>
          </div>

          {/* Indikator Pendapatan Hari Ini */}
          <div className="flex items-center gap-3 text-xs">
            <div className="bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#26d4a5]" />
              <span className="text-emerald-900 font-semibold text-[11px]">
                Omset Hari Ini: <strong className="font-mono text-emerald-700">Rp {transactions.reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID')}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WORKSPACE KONTEN UTAMA */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 flex-1 print:hidden">
        {activeTab === 'billing' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* KOLOM KIRI (7 Kolom): Rincian Pasien & Katalog Tagihan */}
            <div className="lg:col-span-7 space-y-4">
              {/* Pemilih Pasien yang Menunggu Pembayaran */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#26d4a5]/15 text-[#20b88f] flex items-center justify-center text-xs">
                      <i className="fa-solid fa-user-tag" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Pilih Pasien di Antrean Kasir</h3>
                      <p className="text-[10px] text-slate-400">Pasien yang telah selesai diperiksa oleh dokter gigi</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {pendingPatients.length} Menunggu Pembayaran
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={selectedPatientId}
                    onChange={(e) => {
                      setSelectedPatientId(e.target.value);
                      setCompletedInvoice(null);
                      setCashGiven('');
                    }}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#26d4a5] cursor-pointer appearance-none transition shadow-2xs"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.queueNumber}] {p.name} ({p.rmNumber}) — Status: {p.statusKunjungan}
                      </option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down text-slate-400 text-xs absolute right-3.5 top-3.5 pointer-events-none" />
                </div>

                {/* Metadata Pasien Terpilih */}
                {activePatient && (
                  <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{activePatient.name} ({activePatient.age} th)</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">NIK: {activePatient.nik} • HP: {activePatient.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        activePatient.statusKunjungan === 'Menunggu Pembayaran'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : activePatient.statusKunjungan === 'Selesai'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {activePatient.statusKunjungan}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rincian Item Tindakan Medis */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <i className="fa-solid fa-tooth text-[#20b88f]" />
                    Rincian Tindakan & Obat (Poli Gigi 01)
                  </h3>
                  <span className="text-[11px] text-slate-400">{patientTreatments.length} Layanan</span>
                </div>

                <div className="space-y-2">
                  {patientTreatments.map((treatment, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{treatment.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ICD-9-CM: {treatment.icd9cm}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-800">
                        Rp {treatment.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Ringkasan Subtotal */}
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Biaya Administrasi & Pendaftaran:</span>
                  <span className="font-mono font-bold text-emerald-700">GRATIS</span>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN (5 Kolom): Formulir Pembayaran & Kasir */}
            <div className="lg:col-span-5 space-y-4">
              <form onSubmit={handleProcessPayment} className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#26d4a5]/15 text-[#20b88f] flex items-center justify-center text-xs">
                      <i className="fa-solid fa-money-check-dollar" />
                    </div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Rincian Pembayaran</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Poli Gigi</span>
                </div>

                {/* Display Total Biaya */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Total Yang Harus Dibayar
                  </span>
                  <h2 className="text-3xl font-black font-mono text-[#0fa882]">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </h2>
                </div>

                {/* Pilihan Metode Bayar */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Pilih Metode Pembayaran:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'QRIS', label: 'QRIS', icon: 'fa-qrcode' },
                      { id: 'Tunai', label: 'Tunai', icon: 'fa-money-bill-wave' },
                      { id: 'Debit/Transfer', label: 'Transfer', icon: 'fa-credit-card' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(m.id as any);
                          if (m.id !== 'Tunai') setCashGiven('');
                        }}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer border ${
                          paymentMethod === m.id
                            ? 'bg-[#26d4a5] border-[#20b88f] text-slate-950 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <i className={`fa-solid ${m.icon} text-sm`} />
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Tunai & Pecahan Cepat */}
                {paymentMethod === 'Tunai' && (
                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 animate-in fade-in duration-150 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Uang Diterima dari Pasien (Rp):</label>
                      <input
                        type="number"
                        min={totalAmount}
                        placeholder={`Minimal Rp ${totalAmount.toLocaleString('id-ID')}`}
                        value={cashGiven}
                        onChange={(e) => setCashGiven(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-[#26d4a5]"
                      />
                    </div>

                    {/* Tombol Pecahan Uang Cepat */}
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set([totalAmount, 50000, 100000, 200000, 500000]))
                        .filter((nom) => nom > 0)
                        .map((nominal, idx) => (
                          <button
                            key={`cash-preset-${idx}-${nominal}`}
                            type="button"
                            onClick={() => setCashGiven(nominal)}
                            className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 hover:border-[#26d4a5] hover:text-[#0fa882] cursor-pointer transition shadow-2xs"
                          >
                            {nominal === totalAmount ? 'Uang Pas' : `Rp ${nominal.toLocaleString('id-ID')}`}
                          </button>
                        ))}
                    </div>

                    {/* Hitungan Kembalian */}
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="text-slate-600 font-semibold">Uang Kembalian:</span>
                      <span className="font-mono font-black text-base text-emerald-700">
                        Rp {changeAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tombol Proses Pembayaran */}
                {!completedInvoice ? (
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-[#26d4a5] hover:bg-[#20b88f] text-slate-950 font-bold text-xs shadow-md shadow-[#26d4a5]/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <i className="fa-solid fa-circle-check" />
                    <span>Konfirmasi Pembayaran & Cetak Struk</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-center">
                      <i className="fa-solid fa-check text-emerald-600 mr-1.5" /> Pembayaran Berhasil Diproses!
                    </div>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <i className="fa-solid fa-print text-[#26d4a5]" />
                      <span>Cetak Struk Kasir Termal 80mm</span>
                    </button>
                  </div>
                )}
              </form>
            </div>

          </div>
        ) : (
          /* TAB RIWAYAT TRANSAKSI */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Riwayat Pembayaran Kasir</h2>
                <p className="text-[11px] text-slate-400">Seluruh struk transaksi tersimpan di database lokal klinik</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold block">Total Transaksi Selesai</span>
                <strong className="text-sm font-mono text-[#0fa882]">{transactions.length} Kwitansi</strong>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                  <i className="fa-solid fa-receipt text-3xl text-slate-300 block mb-1" />
                  <p>Belum ada transaksi pembayaran yang tercatat hari ini.</p>
                </div>
              ) : (
                transactions.map((trx) => (
                  <div
                    key={trx.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-[#0fa882] shadow-2xs">
                        <i className="fa-solid fa-file-invoice" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-slate-900">{trx.patientName}</strong>
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">{trx.rmNumber}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#26d4a5]/15 text-[#0fa882]">
                            {trx.paymentMethod}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {trx.invoiceNo} • {trx.date} • Kasir: {trx.cashierName}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-0.5 truncate max-w-md">
                          Layanan: {trx.treatments.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">Total Biaya</span>
                        <strong className="text-sm font-mono text-slate-900">
                          Rp {trx.amount.toLocaleString('id-ID')}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCompletedInvoice({
                            invoiceNo: trx.invoiceNo,
                            patientName: trx.patientName,
                            rmNumber: trx.rmNumber,
                            doctorName: trx.doctorName,
                            treatments: TREATMENTS.filter((t) => trx.treatments.includes(t.name)),
                            total: trx.amount,
                          });
                          setTimeout(() => window.print(), 100);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#26d4a5] bg-white text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                        title="Cetak ulang struk"
                      >
                        <i className="fa-solid fa-print text-[11px]" />
                        <span>Cetak</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. STRUK KASIR CETAK TERMAL 80MM (HANYA AKTIF SAAT WINDOW.PRINT) */}
      {completedInvoice && (
        <InvoiceReceipt invoiceData={completedInvoice} />
      )}
    </div>
  );
}
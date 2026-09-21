'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  getStoredPatients, 
  saveStoredPatients, 
  setActivePatient, 
  PatientRecord 
} from '../../data/patientDatabase';
import { useAuth } from '../../context/AuthContext';

export default function PendaftaranPasienPage() {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'baru' | 'lama'>('baru');
  const [toastMessage, setToastMessage] = useState('');
  const [ticketModalData, setTicketModalData] = useState<PatientRecord | null>(null);

  // Profil Petugas Login
  const activeStaffName = currentUser?.name 
    ? `${currentUser.name} (${currentUser.roleLabel || currentUser.role})` 
    : 'Budi Santoso, A.Md.Kes (Front Office)';

  // Form State Pasien Baru
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Perempuan');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState('Tidak Ada');
  const [hasAllergy, setHasAllergy] = useState(false);
  const [complaint, setComplaint] = useState('');

  // Auto Generate No Antrean & No RM
  const [nextQueueNumber, setNextQueueNumber] = useState('A-01');
  const [nextRmNumber, setNextRmNumber] = useState('RM-20260001');

  // Muat data saat halaman dibuka
  useEffect(() => {
    const list = getStoredPatients();
    setPatients(list);
    calculateNextNumbers(list);
  }, []);

  const calculateNextNumbers = (list: PatientRecord[]) => {
    const total = list.length + 1;
    const qNum = `A-${String(total).padStart(2, '0')}`;
    const rmNum = `RM-2026${String(total).padStart(4, '0')}`;
    setNextQueueNumber(qNum);
    setNextRmNumber(rmNum);
  };

  // Kalkulasi usia otomatis dari tanggal lahir
  const handleBirthDateChange = (val: string) => {
    setBirthDate(val);
    if (!val) return;
    const birth = new Date(val);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    setAge(String(calculatedAge >= 0 ? calculatedAge : 0));
  };

  // Simpan Pasien Baru ke Database
  const handleRegisterNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedAge = parseInt(age, 10);
    const finalAllergies = hasAllergy && allergies.trim() !== '' ? allergies.trim() : 'Tidak Ada';

    const newRecord: PatientRecord = {
      id: `P-${Date.now()}`,
      queueNumber: nextQueueNumber,
      name: name.trim(),
      rmNumber: nextRmNumber,
      nik: nik.trim() || '3301000000000000',
      birthDate: birthDate || '2000-01-01',
      age: isNaN(parsedAge) ? 25 : parsedAge,
      gender,
      phone: phone.trim() || '0812-0000-0000',
      address: address.trim() || 'Jl. Pemuda No. 1, Semarang',
      allergies: finalAllergies,
      registrationDate: new Date().toISOString().split('T')[0],
      statusKunjungan: 'Menunggu',
      registeredBy: activeStaffName,
      initialOdontogram: {},
      lastSoap: {
        subjective: complaint.trim() || 'Pemeriksaan rutin kesehatan gigi & mulut.',
        objective: 'Pemeriksaan intraoral awal saat registrasi.',
        diagnosisIcd10: 'K02.1',
        suggestedTreatments: ['TRX-01'],
      },
    };

    const updated = [newRecord, ...patients];
    setPatients(updated);
    saveStoredPatients(updated);
    setActivePatient(newRecord);

    // Tampilkan Modal Tiket & Notifikasi
    setTicketModalData(newRecord);
    setToastMessage(`Pasien ${newRecord.name} berhasil terdaftar dengan antrean ${newRecord.queueNumber}`);
    setTimeout(() => setToastMessage(''), 4000);

    // Reset Form
    setName('');
    setNik('');
    setBirthDate('');
    setAge('');
    setPhone('');
    setAddress('');
    setAllergies('Tidak Ada');
    setHasAllergy(false);
    setComplaint('');
    calculateNextNumbers(updated);
  };

  // Daftarkan Ulang Pasien Lama
  const handleRequeueExistingPatient = (patient: PatientRecord) => {
    const updatedPatient: PatientRecord = {
      ...patient,
      queueNumber: nextQueueNumber,
      statusKunjungan: 'Menunggu',
      registrationDate: new Date().toISOString().split('T')[0],
      registeredBy: activeStaffName,
    };

    const updated = patients.map((p) => p.id === patient.id ? updatedPatient : p);
    setPatients(updated);
    saveStoredPatients(updated);
    setActivePatient(updatedPatient);

    setTicketModalData(updatedPatient);
    setToastMessage(`Antrean ${nextQueueNumber} diterbitkan untuk ${patient.name}`);
    setTimeout(() => setToastMessage(''), 4000);
    calculateNextNumbers(updated);
  };

  // Filter Pasien Terdaftar
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rmNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nik.includes(searchQuery)
    );
  }, [patients, searchQuery]);

  // Statistik Cepat Hari Ini
  const waitingCount = patients.filter((p) => p.statusKunjungan === 'Menunggu').length;
  const inProgressCount = patients.filter((p) => p.statusKunjungan === 'Sedang Diperiksa').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-['Poppins',sans-serif] flex flex-col antialiased pb-12">
      {/* 1. TOP HEADER BRANDED */}
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
                <p className="text-[10px] text-slate-400 font-medium">Front Office • Modul Pendaftaran & Rekam Medis</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/antrean"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#26d4a5] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <i className="fa-solid fa-clock-rotate-left text-[#0fa882]" />
              <span>Antrean Poli</span>
              <span className="bg-[#26d4a5]/20 text-[#0fa882] px-2 py-0.5 rounded-full text-[10px] font-black">
                {waitingCount}
              </span>
            </Link>

            {/* Profil Staf Login */}
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/90 px-3.5 py-1.5 rounded-full shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#26d4a5] animate-pulse" />
              <div className="text-left hidden sm:block">
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  {currentUser?.name || 'Petugas Front Office'}
                </span>
                <span className="text-[9px] text-[#0fa882] font-semibold block leading-none">
                  {currentUser?.roleLabel || 'Pendaftaran'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* TOAST SUKSES MENGAMBANG */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700 text-xs font-semibold">
          <div className="w-6 h-6 rounded-full bg-[#26d4a5] text-slate-950 flex items-center justify-center text-xs">
            <i className="fa-solid fa-check" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. SUB-BANNER STATISTIK & PILIHAN MODE */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 xl:px-10 py-3 shadow-2xs print:hidden">
        <div className="max-w-[1440px] w-full mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Mode Switcher Interaktif */}
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setMode('baru')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'baru'
                  ? 'bg-[#26d4a5] text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-user-plus text-xs" />
              <span>Registrasi Pasien Baru</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('lama')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'lama'
                  ? 'bg-[#26d4a5] text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-magnifying-glass text-xs" />
              <span>Cari Pasien Terdaftar ({patients.length})</span>
            </button>
          </div>

          {/* Kartu Ringkasan Status */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-amber-800 font-semibold text-[11px]">
                Antrean Menunggu: <strong>{waitingCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-[#26d4a5]" />
              <span className="text-emerald-900 font-semibold text-[11px]">
                Sedang Diperiksa: <strong>{inProgressCount}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WORKSPACE KONTEN UTAMA */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 flex-1 print:hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* =========================================================================
              KOLOM KIRI (7 Kolom): FORMULIR PASIEN BARU / DAFTAR PASIEN DATABASE
             ========================================================================= */}
          <div className="lg:col-span-7 space-y-4">
            {mode === 'baru' ? (
              <form onSubmit={handleRegisterNewPatient} className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5 animate-in fade-in duration-150">
                {/* Header Formulir */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#26d4a5]/15 text-[#20b88f] flex items-center justify-center text-xs shadow-2xs">
                      <i className="fa-solid fa-address-card" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Formulir Rekam Medis Pasien Baru</h2>
                      <p className="text-[11px] text-slate-400">Data otomatis tersinkronisasi ke rekam medis odontogram dokter</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-right">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">No. RM Terbit</span>
                    <span className="font-mono font-black text-xs text-[#0fa882]">{nextRmNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Nama Pasien */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Lengkap Pasien <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ny. Rina Anggraini, S.Kom."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-[#26d4a5] focus:bg-white transition"
                    />
                  </div>

                  {/* NIK Pasien */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nomor Induk Kependudukan (NIK 16 Digit)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={16}
                        placeholder="Contoh: 3301012345670001"
                        value={nik}
                        onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono focus:outline-none focus:border-[#26d4a5] focus:bg-white transition"
                      />
                      {nik.length === 16 && (
                        <i className="fa-solid fa-circle-check text-emerald-500 absolute right-3 top-3 text-xs" />
                      )}
                    </div>
                  </div>

                  {/* No WhatsApp */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      No. WhatsApp / HP <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0812-3456-7890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#26d4a5] focus:bg-white transition"
                    />
                  </div>

                  {/* Tanggal Lahir */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-[#26d4a5] focus:bg-white transition cursor-pointer"
                    />
                  </div>

                  {/* Usia & Jenis Kelamin */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Usia (Tahun) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        placeholder="Thn"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-[#26d4a5] focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Jenis Kelamin
                      </label>
                      <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                        <button
                          type="button"
                          onClick={() => setGender('Perempuan')}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                            gender === 'Perempuan'
                              ? 'bg-white text-rose-600 font-bold shadow-2xs'
                              : 'text-slate-500'
                          }`}
                        >
                          P
                        </button>
                        <button
                          type="button"
                          onClick={() => setGender('Laki-laki')}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                            gender === 'Laki-laki'
                              ? 'bg-white text-blue-600 font-bold shadow-2xs'
                              : 'text-slate-500'
                          }`}
                        >
                          L
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Alamat Tempat Tinggal */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Alamat Tempat Tinggal
                    </label>
                    <input
                      type="text"
                      placeholder="Nama jalan, perumahan, kelurahan / kecamatan..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#26d4a5] focus:bg-white transition"
                    />
                  </div>

                  {/* Riwayat Alergi Interaktif */}
                  <div className="sm:col-span-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <i className="fa-solid fa-triangle-exclamation text-amber-500" />
                        Apakah Pasien Memiliki Riwayat Alergi Obat?
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setHasAllergy(!hasAllergy);
                          if (hasAllergy) setAllergies('Tidak Ada');
                        }}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                          hasAllergy
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {hasAllergy ? 'Ya, Ada Alergi' : 'Tidak Ada Alergi'}
                      </button>
                    </div>

                    {hasAllergy && (
                      <input
                        type="text"
                        required
                        placeholder="Sebutkan jenis obat yang memicu alergi (cth: Amoxicillin, Asam Mefenamat)..."
                        value={allergies === 'Tidak Ada' ? '' : allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-rose-700 font-semibold focus:outline-none focus:border-rose-500 transition animate-in fade-in duration-100"
                      />
                    )}
                  </div>

                  {/* Keluhan Pasien Saat Mendaftar */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Keluhan Utama Pasien (Anamnesis Awal):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Gigi belakang kanan bawah ngilu berdenyut sejak 2 hari yang lalu..."
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-[#26d4a5] focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Footer Submit */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <i className="fa-solid fa-user-check text-[#0fa882]" />
                    <span>Petugas Pendaftar: <strong className="text-slate-800">{activeStaffName}</strong></span>
                  </span>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-[#26d4a5] hover:bg-[#20b88f] text-slate-950 font-bold text-xs shadow-md shadow-[#26d4a5]/20 transition cursor-pointer flex items-center gap-2 active:scale-98"
                  >
                    <i className="fa-solid fa-ticket text-xs" />
                    <span>Daftarkan Pasien & Terbitkan Tiket</span>
                  </button>
                </div>
              </form>
            ) : (
              /* TAB PENCARIAN PASIEN LAMA DARI DATABASE */
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4 animate-in fade-in duration-150">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Database Pasien Terdaftar</h2>
                    <p className="text-[11px] text-slate-400">Pilih pasien kontrol/lama untuk dimasukkan ke antrean hari ini</p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Cari Nama, No RM, atau NIK..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#26d4a5] focus:bg-white transition"
                    />
                    <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                  {filteredPatients.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Tidak ditemukan pasien dengan kata kunci &quot;{searchQuery}&quot;.
                    </div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-[#26d4a5]/70 transition duration-150 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center font-mono font-bold text-xs text-[#0fa882] shadow-2xs">
                            <span className="text-[8px] text-slate-400">NO</span>
                            <span>{patient.queueNumber}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-xs font-bold text-slate-900">{patient.name}</strong>
                              <span className="text-[10px] font-semibold text-slate-500">
                                ({patient.age} th, {patient.gender === 'Laki-laki' ? 'L' : 'P'})
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                patient.allergies !== 'Tidak Ada'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                Alergi: {patient.allergies}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {patient.rmNumber} • NIK: {patient.nik} • {patient.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRequeueExistingPatient(patient)}
                            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#26d4a5] hover:text-[#0fa882] text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                          >
                            <i className="fa-solid fa-clock-rotate-left text-[11px]" />
                            <span>Terbitkan Antrean Hari Ini</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              KOLOM KANAN (5 Kolom): TIKET PRATINJAU DINAMIS & PANDUAN PETUGAS
             ========================================================================= */}
          <div className="lg:col-span-5 space-y-4">
            {/* KARTU TIKET ANTREAN INTERAKTIF */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#26d4a5]/10 pointer-events-none" />

              <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#26d4a5]/15 text-[#20b88f] flex items-center justify-center text-xs">
                    <i className="fa-solid fa-ticket" />
                  </div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Tiket Pendaftaran Poli</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#26d4a5]/15 text-[#0fa882]">
                  {ticketModalData ? 'TERBIT HARI INI' : 'CALON ANTREAN'}
                </span>
              </div>

              {/* Tampilan Nomor Antrean Beranimasi */}
              <div className="text-center py-4 bg-gradient-to-b from-slate-50 to-slate-100/70 rounded-2xl border border-slate-200/90 my-2 shadow-inner">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Nomor Panggilan Pasien
                </span>
                <h2 className="text-5xl font-black font-mono text-[#0fa882] tracking-tight">
                  {ticketModalData?.queueNumber || nextQueueNumber}
                </h2>
                <p className="text-xs font-bold text-slate-800 mt-2 truncate px-3">
                  {name.trim() || ticketModalData?.name || 'Calon Pasien Baru'}
                </p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {ticketModalData?.rmNumber || nextRmNumber}
                </p>
              </div>

              {/* Rincian Poli & Dokter */}
              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Instalasi / Poli:</span>
                  <span className="font-semibold text-slate-800">Ruang Tindakan 01</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Dokter Penanggung Jawab:</span>
                  <span className="font-semibold text-slate-800">drg. Yuli Kartilla Panjaitan</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Petugas Pendaftar:</span>
                  <span className="font-semibold text-[#0fa882] truncate max-w-[180px]">
                    {ticketModalData?.registeredBy || activeStaffName}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Estimasi Pelayanan:</span>
                  <span className="font-semibold text-slate-800">± 10 – 15 Menit</span>
                </div>
              </div>

              {/* Tombol Cetak / Navigasi Display TV */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (!ticketModalData) {
                      setToastMessage('Silakan simpan pendaftaran pasien terlebih dahulu!');
                      setTimeout(() => setToastMessage(''), 3000);
                      return;
                    }
                    window.print();
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <i className="fa-solid fa-print text-xs" />
                  <span>Cetak Tiket Antrean</span>
                </button>
                <Link
                  href="/display-antrean"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <i className="fa-solid fa-tv text-xs text-[#26d4a5]" />
                  <span>Display TV</span>
                </Link>
              </div>
            </div>

            {/* Panduan RME & SATUSEHAT */}
            <div className="bg-[#26d4a5]/10 border border-[#26d4a5]/30 rounded-3xl p-4 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#26d4a5]/20 text-[#0fa882] flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-2xs">
                <i className="fa-solid fa-cloud-arrow-up" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-800">Sinkronisasi SATUSEHAT Kemenkes</h4>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                  Data NIK dan nomor kontak pasien otomatis tersimpan dan siap divalidasi ke server platform SATUSEHAT saat pemeriksaan poli selesai.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* =========================================================================
          4. STRUK CETAK TIKET ANTREAN 80MM (HANYA AKTIF SAAT WINDOW.PRINT)
         ========================================================================= */}
      {ticketModalData && (
        <aside
          aria-label="Tiket Antrean Pasien"
          className="hidden print:block fixed inset-0 m-0 p-4 bg-white text-black font-mono text-[11px] leading-tight z-[9999]"
          style={{ width: '80mm', maxWidth: '80mm' }}
        >
          <div className="text-center pb-2 border-b border-dashed border-black">
            <h2 className="text-sm font-bold uppercase tracking-wider">Yovela Dental Clinic</h2>
            <p className="text-[10px]">Jl. Pemuda No. 45, Semarang</p>
            <p className="text-[10px]">Telp: (024) 8765-4321</p>
          </div>

          <div className="text-center py-4 border-b border-dashed border-black">
            <span className="text-[10px] block uppercase">NOMOR ANTREAN POLI</span>
            <h1 className="text-4xl font-black my-1">{ticketModalData.queueNumber}</h1>
            <p className="text-xs font-bold">{ticketModalData.name}</p>
            <p className="text-[10px]">No. RM: {ticketModalData.rmNumber}</p>
          </div>

          <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{ticketModalData.registrationDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Poli Tujuan:</span>
              <span>Ruang Tindakan 01</span>
            </div>
            <div className="flex justify-between">
              <span>Dokter:</span>
              <span>drg. Yuli Kartilla P.</span>
            </div>
            <div className="flex justify-between">
              <span>Petugas:</span>
              <span className="truncate max-w-[120px]">{ticketModalData.registeredBy || 'Front Office'}</span>
            </div>
          </div>

          <div className="pt-3 text-center text-[9px] space-y-0.5">
            <p>Silakan menunggu hingga nomor Anda dipanggil.</p>
            <p className="font-bold">Semoga lekas sehat kembali!</p>
          </div>
        </aside>
      )}
    </div>
  );
}
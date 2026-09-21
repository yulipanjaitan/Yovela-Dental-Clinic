'use client';

import React, { useState, useEffect } from 'react';
import { getStoredPatients, PatientRecord } from '../../../data/patientDatabase';

export default function DisplayAntreanPage() {
  const [currentCall, setCurrentCall] = useState({
    queueNumber: 'A-01',
    patientName: 'Ny. Amanda Pratama',
    roomName: 'Ruang Tindakan 01',
    doctorName: 'drg. Yuli Kartilla Panjaitan (Dokter Gigi Umum)',
  });

  const [patientsQueue, setPatientsQueue] = useState<PatientRecord[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // 1. Waktu & Tanggal Digital Real-Time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      );
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Muat Data Pasien dari Folder Database
  useEffect(() => {
    const list = getStoredPatients();
    setPatientsQueue(list);

    const savedCall = localStorage.getItem('yovela_calling_queue');
    if (savedCall) {
      try {
        setCurrentCall(JSON.parse(savedCall));
      } catch (e) {
        console.error(e);
      }
    } else if (list.length > 0) {
      setCurrentCall({
        queueNumber: list[0].queueNumber,
        patientName: list[0].name,
        roomName: 'Ruang Tindakan 01',
        doctorName: 'drg. Yuli Kartilla Panjaitan (Dokter Gigi Umum)',
      });
    }
  }, []);

  // 3. Audio Panggilan Suara Otomatis Bahasa Indonesia
  const speakQueueCall = (queue: string, patientName: string, room: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Nomor antrean ${queue}. Atas nama ${patientName}. Silakan menuju ${room}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.88;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 4. Sinkronisasi Real-Time Saat Tombol Panggil Ditekan di Tab Lain
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'yovela_calling_queue' && event.newValue) {
        try {
          const newCall = JSON.parse(event.newValue);
          setCurrentCall(newCall);
          speakQueueCall(newCall.queueNumber, newCall.patientName, newCall.roomName);
        } catch (e) {
          console.error(e);
        }
      }

      if (event.key === 'yovela_patients_list' && event.newValue) {
        try {
          setPatientsQueue(JSON.parse(event.newValue));
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col justify-between p-6 md:p-8 font-['Poppins',sans-serif] select-none">
      {/* HEADER: Khas Tema Yovela Dental Mint */}
      <header className="bg-white rounded-3xl border border-slate-200/80 shadow-xs px-8 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#26d4a5]/15 border border-[#26d4a5]/30 flex items-center justify-center p-2.5 shadow-xs">
            <svg viewBox="0 0 512 512" className="w-full h-full fill-[#26d4a5]">
              <path d="M416 112c-35.3 0-64 28.7-64 64v51.2c0 23.4-12.2 44.9-32.3 56.8L272 312.6l-47.7-28.6c-20.1-12-32.3-33.5-32.3-56.8V176c0-35.3-28.7-64-64-64S64 140.7 64 176c0 86.8 52.3 162.7 128 193.3V432c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V369.3c75.7-30.6 128-106.5 128-193.3c0-35.3-28.7-64-64-64z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Yovela Dental Clinic
            </h1>
            <p className="text-xs text-slate-500 font-normal flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#26d4a5] animate-ping" />
              <span>Display Antrean Ruang Tunggu Poli Gigi</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Tombol Pengaktif Suara Peramban */}
          <button
            type="button"
            onClick={() => {
              setIsAudioEnabled(true);
              speakQueueCall(currentCall.queueNumber, currentCall.patientName, currentCall.roomName);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition cursor-pointer ${
              isAudioEnabled 
                ? 'bg-[#26d4a5]/10 border-[#26d4a5]/40 text-[#0fa882]' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Aktifkan panggilan audio otomatis"
          >
            <i className={`fa-solid ${isAudioEnabled ? 'fa-volume-high text-[#0fa882]' : 'fa-volume-xmark text-slate-400'}`} />
            <span>{isAudioEnabled ? 'Audio Panggilan Aktif' : 'Aktifkan Audio'}</span>
          </button>

          {/* Jam Digital Minimalis */}
          <div className="text-right bg-slate-50 border border-slate-200/80 px-5 py-2 rounded-2xl">
            <span className="block text-2xl font-black font-mono text-[#0fa882] tracking-wide">
              {currentTime || '00:00:00'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase">{currentDate}</span>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA: Dua Kolom Bertema Klinik */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-5">
        {/* PANEL KIRI (7 Kolom): Panggilan Antrean Utama */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden">
          {/* Badge Status Panggilan */}
          <div className="px-4 py-1.5 rounded-full bg-[#26d4a5]/15 border border-[#26d4a5]/40 text-[#0fa882] text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <i className="fa-solid fa-bell animate-bounce text-xs" />
            <span>SEDANG DIPANGGIL</span>
          </div>

          {/* Nomor Antrean Utama Mint Glow */}
          <div className="my-1">
            <h2 className="text-8xl md:text-9xl font-black font-mono text-[#0fa882] tracking-tight drop-shadow-sm">
              {currentCall.queueNumber}
            </h2>
          </div>

          {/* Nama Pasien Terpanggil */}
          <p className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight truncate max-w-full px-4 mt-2">
            {currentCall.patientName}
          </p>

          {/* Rincian Ruangan & Dokter */}
          <div className="mt-8 pt-6 border-t border-slate-100 w-full grid grid-cols-2 gap-4 text-left">
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Tujuan Ruangan</span>
              <strong className="text-base md:text-lg text-slate-800 font-bold flex items-center gap-2">
                <i className="fa-solid fa-door-open text-[#20b88f]" />
                {currentCall.roomName}
              </strong>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Dokter Pemeriksa</span>
              <strong className="text-base md:text-lg text-slate-800 font-bold truncate block">
                {currentCall.doctorName}
              </strong>
            </div>
          </div>
        </div>

        {/* PANEL KANAN (5 Kolom): Daftar Pasien Antrean Berikutnya */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-md flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <i className="fa-solid fa-list-ol text-[#20b88f]" />
                <span>Urutan Antrean Berikutnya</span>
              </h3>
              <span className="text-xs text-[#0fa882] font-bold bg-[#26d4a5]/15 px-2.5 py-0.5 rounded-full">
                {patientsQueue.length} Pasien Terdata
              </span>
            </div>

            {/* List Pasien Menunggu */}
            <div className="space-y-2.5 overflow-y-auto max-h-[350px] pr-1">
              {patientsQueue.slice(0, 6).map((patient) => {
                const isCurrent = patient.queueNumber === currentCall.queueNumber;
                return (
                  <div
                    key={patient.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                      isCurrent
                        ? 'bg-[#26d4a5]/10 border-[#26d4a5] shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-black text-sm ${
                        isCurrent
                          ? 'bg-[#26d4a5] text-slate-950 shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-800'
                      }`}>
                        {patient.queueNumber}
                      </div>
                      <div>
                        <p className={`text-xs font-bold truncate max-w-[200px] ${
                          isCurrent ? 'text-[#0fa882]' : 'text-slate-900'
                        }`}>
                          {patient.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {patient.rmNumber} • {patient.age} Thn
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                      isCurrent
                        ? 'bg-[#26d4a5]/20 text-[#0fa882] border-[#26d4a5]/30 animate-pulse'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}>
                      {isCurrent ? 'Diperiksa' : 'Menunggu'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Banner Informasi & Etika Ruang Tunggu */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#26d4a5]/15 border border-[#26d4a5]/30 text-[#20b88f] flex items-center justify-center text-sm shrink-0">
              <i className="fa-solid fa-circle-info" />
            </div>
            <div className="text-xs">
              <h4 className="font-bold text-slate-800">Petunjuk Pasien</h4>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Saat nomor Anda dipanggil, silakan langsung memasuki Ruang Tindakan 01.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER: Teks Berjalan Pengumuman (Bebas Error Marquee) */}
      <footer className="bg-white border border-slate-200 rounded-2xl px-6 py-3 shadow-xs">
        <div className="flex items-center text-xs font-medium text-slate-600 overflow-hidden">
          <span className="text-[#0fa882] font-bold mr-4 flex items-center gap-1.5 shrink-0 z-10 bg-white pr-2">
            <i className="fa-solid fa-bullhorn" /> Pengumuman:
          </span>
          <div className="whitespace-nowrap overflow-hidden w-full">
            <p className="inline-block animate-marquee pl-[100%] text-slate-600">
              Selamat Datang di Yovela Dental Clinic • Pelayanan Spesialis Konservasi, Ortodonti, dan Bedah Mulut Modern • Dokter Penanggung Jawab: drg. Yuli Kartilla Panjaitan (Dokter Gigi Umum) • Jagalah Kebersihan Gigi & Mulut Anda Secara Teratur Setiap 6 Bulan Sekali • Terima Kasih Atas Kepercayaan Anda.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
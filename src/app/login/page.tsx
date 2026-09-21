'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials } = useAuth();

  const [username, setUsername] = useState('yulipanjaitan');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = loginWithCredentials(username, password);
    if (res.success) {
      router.push('/');
    } else {
      setErrorMsg(res.message || 'Login gagal');
    }
  };

  const fillQuickAccount = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-['Poppins',sans-serif]">
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#26d4a5]/15 border border-[#26d4a5]/30 flex items-center justify-center p-3 mb-4 shadow-lg">
            <svg viewBox="0 0 512 512" className="w-full h-full fill-[#26d4a5]">
              <path d="M416 112c-35.3 0-64 28.7-64 64v51.2c0 23.4-12.2 44.9-32.3 56.8L272 312.6l-47.7-28.6c-20.1-12-32.3-33.5-32.3-56.8V176c0-35.3-28.7-64-64-64S64 140.7 64 176c0 86.8 52.3 162.7 128 193.3V432c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V369.3c75.7-30.6 128-106.5 128-193.3c0-35.3-28.7-64-64-64z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Yovela Dental Clinic</h1>
          <p className="text-xs text-slate-400 mt-1">Masuk ke Sistem Informasi Rekam Medis & Kasir</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username Petugas / Dokter</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 text-xs">
                <i className="fa-solid fa-user" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#26d4a5] transition"
                placeholder="Masukkan username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 text-xs">
                <i className="fa-solid fa-lock" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#26d4a5] transition"
                placeholder="Masukkan kata sandi"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#26d4a5] hover:bg-[#20b88f] text-slate-950 font-bold py-3 rounded-xl text-xs transition duration-150 shadow-lg shadow-[#26d4a5]/20 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <span>Masuk ke Dashboard</span>
            <i className="fa-solid fa-arrow-right text-xs" />
          </button>
        </form>

        {/* Akses Cepat Pilihan Akun Default */}
        <div className="mt-8 pt-6 border-t border-slate-700/60">
          <p className="text-[11px] font-semibold text-slate-400 text-center mb-3">Klik untuk isi otomatis akun default:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuickAccount('yulipanjaitan', 'admin123')}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-[#26d4a5] text-left transition text-[10px]"
            >
              <div className="font-bold text-white truncate">drg. Yuli</div>
              <div className="text-[#26d4a5]">admin123</div>
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('pendaftaran', 'fo123')}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-[#26d4a5] text-left transition text-[10px]"
            >
              <div className="font-bold text-white truncate">Pendaftaran</div>
              <div className="text-slate-400">fo123</div>
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('kasir', 'kasir123')}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-[#26d4a5] text-left transition text-[10px]"
            >
              <div className="font-bold text-white truncate">Kasir</div>
              <div className="text-slate-400">kasir123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
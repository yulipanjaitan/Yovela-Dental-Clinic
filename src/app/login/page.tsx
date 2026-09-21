'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'DOKTER' | 'REKAM_MEDIS' | 'KASIR'>('DOKTER');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (activeTab === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi tidak cocok.');
        return;
      }
      // Simulasi pendaftaran akun baru dengan role yang dipilih
      setSuccessMsg(`Pendaftaran akun ${selectedRole} berhasil! Silakan masuk via Sign In.`);
      setPassword('');
      setConfirmPassword('');
      return;
    }

    // Proses Sign In
    const res = loginWithCredentials(username, password);
    if (res.success) {
      router.push('/');
    } else {
      setErrorMsg(res.message || 'Login gagal');
    }
  };

  const handleTabChange = (tab: 'signin' | 'register') => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between items-center p-4 font-['Poppins',sans-serif]">
      <div className="flex-1 flex items-center justify-center w-full">
        {/* Kotak Login Gelap */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#26d4a5]/15 border border-[#26d4a5]/30 flex items-center justify-center p-3 mb-3 shadow-lg">
              <svg viewBox="0 0 512 512" className="w-full h-full fill-[#26d4a5]">
                <path d="M416 112c-35.3 0-64 28.7-64 64v51.2c0 23.4-12.2 44.9-32.3 56.8L272 312.6l-47.7-28.6c-20.1-12-32.3-33.5-32.3-56.8V176c0-35.3-28.7-64-64-64S64 140.7 64 176c0 86.8 52.3 162.7 128 193.3V432c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V369.3c75.7-30.6 128-106.5 128-193.3c0-35.3-28.7-64-64-64z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Yovela Dental Clinic</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Sistem Informasi Rekam Medis & Kasir</p>
          </div>

          {/* Switch Tab (Sign In / Register) */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleTabChange('signin')}
              className={`flex-1 py-2 rounded-xl transition cursor-pointer text-center ${
                activeTab === 'signin'
                  ? 'bg-[#26d4a5] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-2 rounded-xl transition cursor-pointer text-center ${
                activeTab === 'register'
                  ? 'bg-[#26d4a5] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {activeTab === 'register' && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Pilih Role Akses</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('DOKTER')}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition cursor-pointer text-center ${
                      selectedRole === 'DOKTER'
                        ? 'bg-[#26d4a5]/20 border-[#26d4a5] text-[#26d4a5]'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Dokter
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('REKAM_MEDIS')}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition cursor-pointer text-center ${
                      selectedRole === 'REKAM_MEDIS'
                        ? 'bg-[#26d4a5]/20 border-[#26d4a5] text-[#26d4a5]'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Rekam Medis
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('KASIR')}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition cursor-pointer text-center ${
                      selectedRole === 'KASIR'
                        ? 'bg-[#26d4a5]/20 border-[#26d4a5] text-[#26d4a5]'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Kasir
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Username Petugas / Dokter</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500">
                  <i className="fa-solid fa-user" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#26d4a5] transition"
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500">
                  <i className="fa-solid fa-lock" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#26d4a5] transition"
                  autoComplete="off"
                />
              </div>
            </div>

            {activeTab === 'register' && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Ulangi Kata Sandi</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-500">
                    <i className="fa-solid fa-lock" />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#26d4a5] transition"
                    autoComplete="off"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#26d4a5] hover:bg-[#20b88f] text-slate-950 font-bold py-3 rounded-xl transition duration-150 shadow-lg shadow-[#26d4a5]/20 flex items-center justify-center gap-2 mt-3 cursor-pointer text-xs"
            >
              <span>{activeTab === 'register' ? 'Daftar Akun Baru' : 'Sign In'}</span>
              <i className="fa-solid fa-arrow-right text-xs" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer All Rights Reserved */}
      <footer className="text-center text-[11px] text-slate-500 font-medium py-4">
        © {new Date().getFullYear()} Yovela Dental Clinic. All Rights Reserved.
      </footer>
    </div>
  );
}
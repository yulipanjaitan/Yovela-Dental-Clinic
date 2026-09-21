'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  Tooth, 
  ToothSurface, 
  GeneralToothCondition, 
  ToothData 
} from '../components/Odontogram';
import { InvoiceReceipt } from '../components/InvoiceReceipt';
import { TREATMENTS, DIAGNOSES, Treatment } from '../data/mockData';
import { 
  PatientRecord, 
  getStoredPatients, 
  saveStoredPatients, 
  getActivePatient, 
  setActivePatient 
} from '../data/patientDatabase';
import { useAuth, AccountData } from '../context/AuthContext';

export default function DentalClinicDashboard() {
  const { currentUser, logout, accounts, updateAccounts } = useAuth();

  const activeDoctorName = currentUser?.role === 'DOKTER' 
    ? currentUser.name 
    : 'drg. Yuli Kartilla Panjaitan';
  
  const activeDoctorLabel = currentUser?.role === 'DOKTER'
    ? currentUser.roleLabel
    : 'Dokter Gigi Umum';

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [accountFormData, setAccountFormData] = useState<Record<string, AccountData>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [patientList, setPatientList] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'soap' | 'billing' | 'history'>('soap');

  const q1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const q2 = [21, 22, 23, 24, 25, 26, 27, 28];
  const q4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const q3 = [31, 32, 33, 34, 35, 36, 37, 38];

  const q5 = [55, 54, 53, 52, 51];
  const q6 = [61, 62, 63, 64, 65];
  const q8 = [85, 84, 83, 82, 81];
  const q7 = [71, 72, 73, 74, 75];

  const [dentitionView, setDentitionView] = useState<'adult' | 'deciduous' | 'mixed'>('adult');
  const [selectedSurfaceColor, setSelectedSurfaceColor] = useState<string>('caries');
  const [selectedGeneralCondition, setSelectedGeneralCondition] = useState<GeneralToothCondition>('normal');

  const [activeToothModal, setActiveToothModal] = useState<number | null>(null);
  const [toothNoteInput, setToothNoteInput] = useState<string>('');

  const [odontogram, setOdontogram] = useState<Record<number, ToothData>>({});
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [diagnosis, setDiagnosis] = useState('K02.1');
  const [selectedTreatments, setSelectedTreatments] = useState<Treatment[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('Asam Mefenamat 500mg (3x1 sesudah makan, bila nyeri)');

  const [isCompleted, setIsCompleted] = useState(false);
  const [isCallingTV, setIsCallingTV] = useState(false);

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

  useEffect(() => {
    const list = getStoredPatients();
    setPatientList(list);
    const active = getActivePatient();
    loadPatientData(active);
  }, []);

  const loadPatientData = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setActivePatient(patient);
    setOdontogram(patient.initialOdontogram || {});
    setSubjective(patient.lastSoap?.subjective || '');
    setObjective(patient.lastSoap?.objective || '');
    setDiagnosis(patient.lastSoap?.diagnosisIcd10 || 'K02.1');

    const matched = TREATMENTS.filter((t) => patient.lastSoap?.suggestedTreatments?.includes(t.id));
    setSelectedTreatments(matched.length > 0 ? matched : [TREATMENTS[0]]);
    setIsCompleted(false);

    if (patient.age <= 12) setDentitionView('mixed');
    else setDentitionView('adult');
  };

  const handleSelectPatient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosen = patientList.find((p) => p.id === e.target.value);
    if (chosen) loadPatientData(chosen);
  };

  const handleAccountFieldChange = (key: string, field: keyof AccountData, value: string) => {
    setAccountFormData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSaveAccounts = (e: React.FormEvent) => {
    e.preventDefault();
    updateAccounts(accountFormData);
    setSaveSuccessMsg('Pengaturan akun pengguna dan kata sandi berhasil diperbarui.');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Sinkronisasi otomatis Odontogram -> SOAP Objective
  const syncOdontogramToSoap = (currentOdonto: Record<number, ToothData>) => {
    const findings: string[] = [];
    let detectedDiagnosis = diagnosis;

    Object.entries(currentOdonto).forEach(([toothNum, data]) => {
      if (data.generalCondition === 'missing') {
        findings.push(`Gigi ${toothNum} missing`);
      } else if (data.generalCondition === 'radix') {
        findings.push(`Gigi ${toothNum} sisa akar (radix)`);
        detectedDiagnosis = 'K04.1';
      } else if (data.generalCondition === 'impacted') {
        findings.push(`Gigi ${toothNum} impaksi`);
        detectedDiagnosis = 'K01.1';
      } else if (data.generalCondition === 'rct') {
        findings.push(`Gigi ${toothNum} pasca PSA`);
      }

      const cariesSurfaces = Object.entries(data.surfaces)
        .filter(([_, val]) => val === 'caries')
        .map(([surf]) => surf);

      const fillingSurfaces = Object.entries(data.surfaces)
        .filter(([_, val]) => val === 'composite' || val === 'amalgam' || val === 'gic' || val === 'temporary')
        .map(([surf, val]) => `${surf} (${val})`);

      if (cariesSurfaces.length > 0) {
        findings.push(`Gigi ${toothNum} karies permukaan ${cariesSurfaces.join(', ')}`);
        if (detectedDiagnosis === 'K02.1' || !detectedDiagnosis) {
          detectedDiagnosis = 'K02.1';
        }
      }

      if (fillingSurfaces.length > 0) {
        findings.push(`Gigi ${toothNum} tumpatan ${fillingSurfaces.join(', ')}`);
      }

      if (data.notes && data.notes.trim() !== '') {
        findings.push(`Catatan gigi ${toothNum}: ${data.notes}`);
      }
    });

    if (findings.length > 0) {
      setObjective(findings.join('. ') + '.');
      setDiagnosis(detectedDiagnosis);
    } else {
      setObjective('Pemeriksaan intraoral dalam batas normal, tidak ditemukan karies aktif.');
    }
  };

  const totalBilling = selectedTreatments.reduce((acc, curr) => acc + curr.price, 0);

  const dmftScore = useMemo(() => {
    let d = 0, m = 0, f = 0;
    Object.entries(odontogram).forEach(([_, data]) => {
      if (data.generalCondition === 'missing') m++;
      const hasCaries = Object.values(data.surfaces).some((v) => v === 'caries');
      const hasFilling = Object.values(data.surfaces).some((v) => v === 'composite' || v === 'amalgam' || v === 'gic' || v === 'temporary');
      if (hasCaries) d++;
      if (hasFilling && !hasCaries) f++;
    });
    return { d, m, f, total: d + m + f };
  }, [odontogram]);

  // TOGGLE KLIK WARNA: Jika warna sama diklik kembali, otomatis kembali normal (null)
  const handleSurfaceClick = (tooth: number, surface: ToothSurface) => {
    setOdontogram((prev) => {
      const current = prev[tooth] || {
        generalCondition: 'normal',
        surfaces: { occlusal: null, mesial: null, distal: null, buccal: null, lingual: null },
      };

      const existingColor = current.surfaces[surface];
      const nextColor = selectedSurfaceColor === 'clear' || existingColor === selectedSurfaceColor 
        ? null 
        : selectedSurfaceColor;

      const updatedTooth: ToothData = {
        ...current,
        surfaces: {
          ...current.surfaces,
          [surface]: nextColor,
        },
      };

      const nextOdontogram = {
        ...prev,
        [tooth]: updatedTooth,
      };

      syncOdontogramToSoap(nextOdontogram);
      return nextOdontogram;
    });
  };

  const handleToothConditionClick = (tooth: number) => {
    setActiveToothModal(tooth);
    setSelectedGeneralCondition(odontogram[tooth]?.generalCondition || 'normal');
    setToothNoteInput(odontogram[tooth]?.notes || '');
  };

  const saveToothModal = () => {
    if (activeToothModal === null) return;
    setOdontogram((prev) => {
      const current = prev[activeToothModal] || {
        generalCondition: 'normal',
        surfaces: { occlusal: null, mesial: null, distal: null, buccal: null, lingual: null },
      };

      const updatedTooth: ToothData = {
        ...current,
        generalCondition: selectedGeneralCondition,
        notes: toothNoteInput,
      };

      const nextOdontogram = {
        ...prev,
        [activeToothModal]: updatedTooth,
      };

      syncOdontogramToSoap(nextOdontogram);
      return nextOdontogram;
    });
    setActiveToothModal(null);
  };

  const toggleTreatment = (treatment: Treatment) => {
    if (selectedTreatments.some((t) => t.id === treatment.id)) {
      setSelectedTreatments(selectedTreatments.filter((t) => t.id !== treatment.id));
    } else {
      setSelectedTreatments([...selectedTreatments, treatment]);
    }
  };

  const triggerCallToTV = () => {
    if (!selectedPatient) return;
    setIsCallingTV(true);
    const payload = {
      queueNumber: selectedPatient.queueNumber,
      patientName: selectedPatient.name,
      roomName: 'Ruang Tindakan 01',
      doctorName: activeDoctorName,
      timestamp: Date.now(),
    };
    localStorage.setItem('yovela_calling_queue', JSON.stringify(payload));
    setTimeout(() => setIsCallingTV(false), 2200);
  };

  const handleSaveMedicalRecord = () => {
    if (!selectedPatient) return;

    const updatedPatient: PatientRecord = {
      ...selectedPatient,
      statusKunjungan: 'Menunggu Pembayaran',
      initialOdontogram: odontogram,
      lastSoap: {
        subjective,
        objective,
        diagnosisIcd10: diagnosis,
        suggestedTreatments: selectedTreatments.map((t) => t.id),
      },
    };

    const updatedList = patientList.map((p) => p.id === updatedPatient.id ? updatedPatient : p);
    setPatientList(updatedList);
    setSelectedPatient(updatedPatient);
    saveStoredPatients(updatedList);
    setActivePatient(updatedPatient);

    const savedTrx = localStorage.getItem('yovela_clinic_transactions');
    let currentTrx = [];
    if (savedTrx) {
      try { currentTrx = JSON.parse(savedTrx); } catch {}
    }

    const now = new Date();
    const invoiceNo = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;

    const newInvoice = {
      id: `TRX-${Date.now()}`,
      invoiceNo,
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      patientName: selectedPatient.name,
      rmNumber: selectedPatient.rmNumber,
      doctorName: activeDoctorName,
      treatments: selectedTreatments.map((t) => t.name),
      paymentMethod: 'QRIS',
      amount: totalBilling,
    };

    localStorage.setItem('yovela_clinic_transactions', JSON.stringify([newInvoice, ...currentTrx]));
    setIsCompleted(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-['Poppins',sans-serif] flex flex-col antialiased pb-12">
      {/* 1. TOP HEADER */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 shadow-xs z-40 print:hidden">
        <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer" title="Beranda Utama">
              <div className="w-8 h-8 rounded-xl bg-[#26d4a5]/15 border border-[#26d4a5]/30 flex items-center justify-center p-1.5 group-hover:scale-105 transition duration-200 shadow-2xs">
                <svg viewBox="0 0 512 512" className="w-full h-full fill-[#26d4a5]">
                  <path d="M416 112c-35.3 0-64 28.7-64 64v51.2c0 23.4-12.2 44.9-32.3 56.8L272 312.6l-47.7-28.6c-20.1-12-32.3-33.5-32.3-56.8V176c0-35.3-28.7-64-64-64S64 140.7 64 176c0 86.8 52.3 162.7 128 193.3V432c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V369.3c75.7-30.6 128-106.5 128-193.3c0-35.3-28.7-64-64-64z" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-slate-900 group-hover:text-[#20b88f] transition">
                  Yovela Dental Clinic
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">Instalasi Rekam Medis Odontologi • Poli 01</p>
              </div>
            </Link>
          </div>

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 px-3 py-1.5 rounded-full transition duration-150 cursor-pointer shadow-2xs"
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
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer font-medium"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket text-xs w-4" />
                  <span>Keluar dari Sesi (Logout)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BANNER PASIEN STICKY */}
      <section className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 shadow-xs print:hidden">
        <div className="max-w-[1440px] w-full mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#26d4a5]/25 to-[#26d4a5]/10 border border-[#26d4a5]/40 flex items-center justify-center text-[#0fa882] font-black text-xs font-mono shrink-0 shadow-2xs">
              {selectedPatient?.queueNumber || 'A-01'}
            </div>

            <div className="relative min-w-[260px]">
              <select
                value={selectedPatient?.id || ''}
                onChange={handleSelectPatient}
                className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#26d4a5] cursor-pointer appearance-none transition shadow-2xs truncate"
              >
                {patientList.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.queueNumber}] {p.name} ({p.age} th) - {p.rmNumber}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down text-slate-400 text-[10px] absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {selectedPatient && (
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
                <span>NIK: <strong className="font-mono text-slate-700">{selectedPatient.nik}</strong></span>
                <span className="text-slate-300">•</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  selectedPatient.allergies !== 'Tidak Ada'
                    ? 'text-rose-600 bg-rose-50 border-rose-200'
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                }`}>
                  Alergi: {selectedPatient.allergies}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={triggerCallToTV}
              disabled={isCallingTV}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition duration-150 cursor-pointer shadow-2xs ${
                isCallingTV
                  ? 'bg-amber-500 border-amber-600 text-white animate-pulse'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-[#26d4a5]'
              }`}
            >
              <i className={`fa-solid ${isCallingTV ? 'fa-volume-high' : 'fa-bullhorn'} text-[#0fa882] text-[11px]`} />
              <span className="hidden sm:inline">{isCallingTV ? 'Memanggil...' : 'Panggil TV'}</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 text-xs font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400">DMF-T:</span>
              <strong className="text-[#0fa882] font-black text-sm">{dmftScore.total}</strong>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] text-rose-600 font-bold">D:{dmftScore.d}</span>
              <span className="text-[10px] text-slate-700 font-bold">M:{dmftScore.m}</span>
              <span className="text-[10px] text-[#0fa882] font-bold">F:{dmftScore.f}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DUAL WORKSPACE: TINGGI OTOMATIS FIT (BEBAS RUANG KOSONG) */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 flex-1 print:hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* KOLOM KIRI (7 Kolom): Odontogram Digital */}
          <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 flex flex-col">
            
            {/* Header Odontogram, Palet & Legenda Simbol */}
            <div className="pb-3 border-b border-slate-100 bg-white space-y-2.5">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#26d4a5]/15 text-[#20b88f] flex items-center justify-center text-xs shadow-2xs">
                    <i className="fa-solid fa-tooth" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs leading-tight">Papan Odontogram Digital FDI</h3>
                    <p className="text-[10px] text-slate-400">Inspeksi anatomi gigi & kondisi patologis</p>
                  </div>
                </div>

                <div className="flex bg-slate-100 p-0.5 rounded-xl text-[10px] font-semibold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setDentitionView('adult')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      dentitionView === 'adult' ? 'bg-white text-[#0fa882] font-bold shadow-2xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Dewasa (32)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDentitionView('deciduous')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      dentitionView === 'deciduous' ? 'bg-white text-[#0fa882] font-bold shadow-2xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Gigi Susu (20)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDentitionView('mixed')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      dentitionView === 'mixed' ? 'bg-white text-[#0fa882] font-bold shadow-2xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Campuran
                  </button>
                </div>
              </div>

              {/* Palet Tool Tambalan: Grid 6 Kolom Simetris */}
              <div className="bg-slate-50/90 p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs grid grid-cols-6 gap-1.5">
                {[
                  { id: 'caries', label: 'Karies', color: 'bg-rose-500 text-white hover:bg-rose-600' },
                  { id: 'composite', label: 'Komposit', color: 'bg-[#26d4a5] text-slate-950 font-bold hover:bg-[#20b88f]' },
                  { id: 'amalgam', label: 'Amalgam', color: 'bg-slate-600 text-white hover:bg-slate-700' },
                  { id: 'gic', label: 'GIC / Sealant', color: 'bg-emerald-600 text-white hover:bg-emerald-700' },
                  { id: 'temporary', label: 'Sementara', color: 'bg-amber-500 text-white hover:bg-amber-600' },
                  { id: 'clear', label: 'Bersihkan', color: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100' },
                ].map((tool) => {
                  const isSelected = selectedSurfaceColor === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => setSelectedSurfaceColor(tool.id)}
                      className={`w-full py-1 text-[10px] font-semibold rounded-xl text-center whitespace-nowrap cursor-pointer transition-all duration-150 flex items-center justify-center gap-1 ${
                        tool.color
                      } ${
                        isSelected
                          ? 'ring-2 ring-[#26d4a5] ring-offset-1 scale-105 shadow-sm font-bold'
                          : 'opacity-90 hover:opacity-100 hover:-translate-y-0.5'
                      }`}
                    >
                      {tool.id === 'clear' && <i className="fa-solid fa-eraser text-[9px]" />}
                      <span>{tool.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Legenda Simbol di Atas */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-slate-500 pt-0.5">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-xs" /> Karies</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#26d4a5] rounded-xs" /> Komposit</span>
                  <span className="flex items-center gap-1"><strong className="text-rose-600 font-bold">X</strong> Missing</span>
                  <span className="flex items-center gap-1"><strong className="text-amber-600 font-bold">R</strong> Radix</span>
                  <span className="flex items-center gap-1"><strong className="text-blue-600 font-bold">|</strong> PSA/Endo</span>
                </div>
                <span className="text-[#0fa882] font-semibold text-[9px]">*Klik nomor gigi untuk catatan</span>
              </div>
            </div>

            {/* Papan Gigi FDI: Rapat ke Bawah Tanpa Ruang Kosong */}
            <div className="overflow-x-auto p-4 bg-slate-50/60 rounded-2xl border border-slate-200 shadow-inner mt-3">
              <div className="min-w-[580px] space-y-4">
                {(dentitionView === 'adult' || dentitionView === 'mixed') && (
                  <div>
                    <p className="text-center text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                      RAHANG ATAS PERMANEN (MAXILLA)
                    </p>
                    <div className="flex justify-center border-b border-dashed border-slate-200 pb-3">
                      <div className="flex flex-row-reverse border-r border-slate-300 pr-2">
                        {q1.map((num) => (
                          <Tooth key={num} toothNumber={num} data={odontogram[num]} onSurfaceClick={handleSurfaceClick} onToothConditionClick={handleToothConditionClick} />
                        ))}
                      </div>
                      <div className="flex pl-2">
                        {q2.map((num) => (
                          <Tooth key={num} toothNumber={num} data={odontogram[num]} onSurfaceClick={handleSurfaceClick} onToothConditionClick={handleToothConditionClick} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(dentitionView === 'deciduous' || dentitionView === 'mixed') && (
                  <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200/60 space-y-2.5">
                    <p className="text-center text-[10px] font-bold text-amber-800 tracking-wider uppercase">DENTISI GIGI SUSU (DECIDUOUS)</p>
                    <div className="flex justify-center border-b border-amber-200 pb-2">
                      <div className="flex flex-row-reverse border-r border-amber-300 pr-2">
                        {q5.map((num) => (
                          <Tooth key={num} toothNumber={num} isDeciduous data={odontogram[num]} onSurfaceClick={handleSurfaceClick} onToothConditionClick={handleToothConditionClick} />
                        ))}
                      </div>
                      <div className="flex pl-2">
                        {q6.map((num) => (
                          <Tooth key={num} toothNumber={num} isDeciduous data={odontogram[num]} onSurfaceClick={handleSurfaceClick} onToothConditionClick={handleToothConditionClick} />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center pt-1">
                      <div className="flex flex-row-reverse border-r border-amber-300 pr-2">
                        {q8.map((num) => (
                          <Tooth key={num} toothNumber={num} isDeciduous data={odontogram[num]} onSurfaceClick={handleSurfaceClick} onToothConditionClick={handleToothConditionClick} />
                        ))}
                      </div>
                      <div className="flex pl-2">
                        {q7.map((num) => (
                          <Tooth key={num} toothNumber={num} isDeciduous data={odontogram[num]} onSurfaceClick={handleSurfaceClick} onToothConditionClick={handleToothConditionClick} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(dentitionView === 'adult' || dentitionView === 'mixed') && (
                  <div>
                    <div className="flex justify-center pt-2">
                      <div className="flex flex-row-reverse border-r border-slate-300 pr-2">
                        {q4.map((num) => (
                          <Tooth key={num} toothNumber={num} data={odontogram[num]} onSurfaceClick={handleSurfaceClick} onToothConditionClick={handleToothConditionClick} />
                        ))}
                      </div>
                      <div className="flex pl-2">
                        {q3.map((num) => (
                          <Tooth key={num} toothNumber={num} data={odontogram[num]} onSurfaceClick={handleSurfaceClick} onToothConditionClick={handleToothConditionClick} />
                        ))}
                      </div>
                    </div>
                    <p className="text-center text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-2">
                      RAHANG BAWAH PERMANEN (MANDIBULA)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* KOLOM KANAN (5 Kolom): SOAP & Tindakan */}
          <section className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 flex flex-col">
            
            {/* Header Tab SOAP */}
            <div className="pb-3 border-b border-slate-100 bg-white">
              <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('soap')}
                  className={`flex-1 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'soap' ? 'bg-white text-[#0fa882] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <i className="fa-solid fa-notes-medical text-[11px]" />
                  <span>SOAP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('billing')}
                  className={`flex-1 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'billing' ? 'bg-white text-[#0fa882] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <i className="fa-solid fa-receipt text-[11px]" />
                  <span>Tindakan ({selectedTreatments.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'history' ? 'bg-white text-[#0fa882] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <i className="fa-solid fa-pills text-[11px]" />
                  <span>E-Resep</span>
                </button>
              </div>
            </div>

            {/* Area Isi Form */}
            <div className="py-3 space-y-3.5 text-xs">
              {activeTab === 'soap' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subjective (Keluhan Pasien):</label>
                    <textarea
                      value={subjective}
                      onChange={(e) => setSubjective(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl p-2.5 bg-slate-50 text-slate-800 outline-none focus:border-[#26d4a5] focus:bg-white transition leading-relaxed"
                      rows={3}
                      placeholder="Anamnesis keluhan utama..."
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Objective (Pemeriksaan Fisik - Sinkron Otomatis):
                    </label>
                    <textarea
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl p-2.5 bg-slate-50 text-slate-800 outline-none focus:border-[#26d4a5] focus:bg-white transition leading-relaxed"
                      rows={4}
                      placeholder="Klik permukaan gigi untuk mengisi otomatis..."
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Assessment (Diagnosis ICD-10):</label>
                    <div className="relative">
                      <select
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl p-2.5 bg-slate-50 text-slate-800 font-semibold outline-none focus:border-[#26d4a5] focus:bg-white transition cursor-pointer appearance-none pr-8"
                      >
                        {DIAGNOSES.map((d) => (
                          <option key={d.code} value={d.code}>[{d.code}] {d.name}</option>
                        ))}
                      </select>
                      <i className="fa-solid fa-chevron-down text-slate-400 text-xs absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Katalog Prosedur Medis (ICD-9-CM):</span>
                    <span className="text-[10px] font-bold text-[#0fa882]">{selectedTreatments.length} Dipilih</span>
                  </div>
                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                    {TREATMENTS.map((treatment) => {
                      const isChecked = selectedTreatments.some((t) => t.id === treatment.id);
                      return (
                        <div
                          key={treatment.id}
                          onClick={() => toggleTreatment(treatment)}
                          className={`flex justify-between items-center p-2.5 rounded-2xl cursor-pointer transition border text-xs ${
                            isChecked
                              ? 'bg-[#26d4a5]/15 border-[#26d4a5] text-slate-900 font-bold shadow-2xs'
                              : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <p>{treatment.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono">ICD-9: {treatment.icd9cm}</p>
                          </div>
                          <span className="font-mono font-bold text-slate-800 shrink-0 ml-2">
                            Rp {treatment.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">R/ Instruksi & E-Resep Obat:</label>
                    <textarea
                      value={prescriptionNotes}
                      onChange={(e) => setPrescriptionNotes(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl p-2.5 bg-slate-50 text-slate-800 outline-none focus:border-[#26d4a5] focus:bg-white font-mono leading-relaxed"
                      rows={6}
                    />
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-800 text-[10px] flex items-center gap-2">
                    <i className="fa-solid fa-triangle-exclamation text-amber-600" />
                    <span>Periksa alergi obat pasien sebelum meresepkan analgesik atau antibiotik.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Total Billing & Tombol Aksi */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5 bg-white">
              <div className="flex justify-between items-baseline bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-600">Total Tagihan:</span>
                <span className="text-lg font-black font-mono text-[#0fa882]">
                  Rp {totalBilling.toLocaleString('id-ID')}
                </span>
              </div>

              {!isCompleted ? (
                <button
                  type="button"
                  onClick={handleSaveMedicalRecord}
                  className="w-full bg-[#26d4a5] hover:bg-[#20b88f] text-slate-950 font-bold py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition text-xs cursor-pointer active:scale-98"
                >
                  <i className="fa-solid fa-floppy-disk" /> Simpan Rekam Medis Pasien
                </button>
              ) : (
                <div className="space-y-1.5">
                  <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center">
                    <i className="fa-solid fa-check text-emerald-600 mr-1" /> Rekam Medis Selesai & Terkirim ke Kasir
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 text-xs cursor-pointer shadow-sm"
                  >
                    <i className="fa-solid fa-print" /> Cetak Struk Kasir Termal 80mm
                  </button>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>

      {/* 4. MODAL SETTINGS USER/PASSWORD */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#26d4a5]/15 text-[#20b88f] flex items-center justify-center text-sm">
                  <i className="fa-solid fa-users-gear" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Pengaturan Pengguna & Kata Sandi Seluruh Staf
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Kelola nama, username, dan kata sandi seluruh peran (Dokter, Pendaftaran, Kasir)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveAccounts} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              {Object.keys(accountFormData).map((key) => {
                const acc = accountFormData[key];
                return (
                  <div key={key} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          acc.role === 'DOKTER' ? 'bg-[#26d4a5]' : acc.role === 'KASIR' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                          Role: {acc.role} ({acc.roleLabel})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">{acc.id}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Nama Lengkap / Petugas:
                        </label>
                        <input
                          type="text"
                          required
                          value={acc.name}
                          onChange={(e) => handleAccountFieldChange(key, 'name', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:border-[#26d4a5] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Username Login:
                        </label>
                        <input
                          type="text"
                          required
                          value={acc.username}
                          onChange={(e) => handleAccountFieldChange(key, 'username', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-medium focus:outline-none focus:border-[#26d4a5] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Kata Sandi (Password):
                        </label>
                        <input
                          type="text"
                          required
                          value={acc.pass}
                          onChange={(e) => handleAccountFieldChange(key, 'pass', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-[#26d4a5] transition"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end gap-2 pt-2 shrink-0 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#26d4a5] hover:bg-[#20b88f] text-slate-950 transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-floppy-disk" />
                  <span>Simpan Perubahan Akun</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL ANOTASI GIGI */}
      {activeToothModal !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i className="fa-solid fa-tooth text-[#20b88f]" />
                Kondisi Gigi #{activeToothModal}
              </h3>
              <button 
                type="button"
                onClick={() => setActiveToothModal(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'normal', label: 'Normal / Erupsi' },
                  { id: 'missing', label: 'Missing / Hilang (X)' },
                  { id: 'radix', label: 'Radix / Sisa Akar (R)' },
                  { id: 'impacted', label: 'Impaksi / Tertanam' },
                  { id: 'rct', label: 'PSA / Endodontik' },
                  { id: 'full_crown', label: 'Mahkota / Crown' },
                ].map((cond) => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setSelectedGeneralCondition(cond.id as GeneralToothCondition)}
                    className={`p-2 rounded-xl border text-left font-semibold transition cursor-pointer ${
                      selectedGeneralCondition === cond.id ? 'border-[#26d4a5] bg-[#26d4a5]/15 font-bold' : 'border-slate-200'
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan Gigi #{activeToothModal}:</label>
                <textarea
                  value={toothNoteInput}
                  onChange={(e) => setToothNoteInput(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 outline-none focus:border-[#26d4a5]"
                  rows={3}
                  placeholder="Contoh: Sondasi ngilu, perkusi (+)..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button 
                type="button"
                onClick={() => setActiveToothModal(null)} 
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={saveToothModal} 
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#26d4a5] hover:bg-[#20b88f] text-slate-950 cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. STRUK KASIR CETAK TERMAL 80MM */}
      {selectedPatient && (
        <InvoiceReceipt
          invoiceData={{
            invoiceNo: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${selectedPatient.queueNumber}`,
            patientName: selectedPatient.name,
            rmNumber: selectedPatient.rmNumber,
            doctorName: `${activeDoctorName} (${activeDoctorLabel})`,
            treatments: selectedTreatments,
            total: totalBilling,
          }}
        />
      )}
    </div>
  );
}
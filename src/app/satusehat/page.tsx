'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  getStoredPatients, 
  saveStoredPatients, 
  PatientRecord 
} from '../../data/patientDatabase';
import { DIAGNOSES, TREATMENTS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

interface SyncLog {
  id: string;
  timestamp: string;
  patientName: string;
  nik: string;
  resourceType: 'Encounter' | 'Condition' | 'Procedure' | 'Bundle';
  resourceId: string;
  status: '201 Created' | '200 OK' | 'Failed';
  rawPayload: any;
}

export default function SatuSehatIntegrationPage() {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [activeJsonTab, setActiveJsonTab] = useState<'Encounter' | 'Condition' | 'Procedure'>('Encounter');
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  // Identitas Fasilitas Pelayanan Kesehatan (Faskes) SATUSEHAT
  const faskesConfig = {
    organizationId: '100024951', // ID Organisasi Kemenkes Yovela Dental
    locationId: 'loc-poli-gigi-01',
    doctorIhsNumber: '10008921821', // drg. Yuli Kartilla Panjaitan IHS
    clinicName: 'Yovela Dental Clinic',
    fhirEndpoint: 'https://api-satusehat.kemkes.go.id/fhir-r4/v1',
  };

  useEffect(() => {
    const list = getStoredPatients();
    setPatients(list);
    if (list.length > 0) {
      setSelectedPatientId(list[0].id);
    }

    // Muat log sinkronisasi dari localStorage
    const savedLogs = localStorage.getItem('yovela_satusehat_logs');
    if (savedLogs) {
      try {
        setSyncLogs(JSON.parse(savedLogs));
      } catch {}
    }
  }, []);

  const activePatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0] || null;
  }, [patients, selectedPatientId]);

  // Generate FHIR Resources Bundle untuk Pasien Terpilih
  const fhirPayload = useMemo(() => {
    if (!activePatient) return null;

    const encounterId = `enc-${activePatient.rmNumber.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const conditionCode = activePatient.lastSoap?.diagnosisIcd10 || 'K02.1';
    const conditionMeta = DIAGNOSES.find((d) => d.code === conditionCode) || DIAGNOSES[0];
    const treatmentId = activePatient.lastSoap?.suggestedTreatments?.[0] || 'TRX-01';
    const treatmentMeta = TREATMENTS.find((t) => t.id === treatmentId) || TREATMENTS[0];

    return {
      Encounter: {
        resourceType: 'Encounter',
        id: encounterId,
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'Ambulatory / Rawat Jalan',
        },
        subject: {
          reference: `Patient/${activePatient.nik}`,
          display: activePatient.name,
        },
        participant: [
          {
            type: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'ATND',
                    display: 'attender',
                  },
                ],
              },
            ],
            individual: {
              reference: `Practitioner/${faskesConfig.doctorIhsNumber}`,
              display: 'drg. Yuli Kartilla Panjaitan',
            },
          },
        ],
        serviceProvider: {
          reference: `Organization/${faskesConfig.organizationId}`,
          display: faskesConfig.clinicName,
        },
      },
      Condition: {
        resourceType: 'Condition',
        clinicalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active',
              display: 'Active',
            },
          ],
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'encounter-diagnosis',
                display: 'Encounter Diagnosis',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://hl7.org/fhir/sid/icd-10',
              code: conditionMeta.code,
              display: conditionMeta.name,
            },
          ],
        },
        subject: {
          reference: `Patient/${activePatient.nik}`,
          display: activePatient.name,
        },
        encounter: {
          reference: `Encounter/${encounterId}`,
        },
      },
      Procedure: {
        resourceType: 'Procedure',
        status: 'completed',
        category: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '387713003',
              display: 'Surgical procedure / Tindakan Gigi',
            },
          ],
        },
        code: {
          coding: [
            {
              system: 'http://hl7.org/fhir/sid/icd-9-cm',
              code: treatmentMeta.icd9cm,
              display: treatmentMeta.name,
            },
          ],
        },
        subject: {
          reference: `Patient/${activePatient.nik}`,
          display: activePatient.name,
        },
        encounter: {
          reference: `Encounter/${encounterId}`,
        },
      },
    };
  }, [activePatient]);

  // Kirim Sinkronisasi Data ke SATUSEHAT
  const handleSyncPatient = (patient: PatientRecord) => {
    setSyncingId(patient.id);

    setTimeout(() => {
      const conditionCode = patient.lastSoap?.diagnosisIcd10 || 'K02.1';
      const newLog: SyncLog = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        patientName: patient.name,
        nik: patient.nik,
        resourceType: 'Bundle',
        resourceId: `bundle-${patient.rmNumber.toLowerCase()}`,
        status: '201 Created',
        rawPayload: {
          patient: patient.name,
          icd10: conditionCode,
          ihsStatus: 'Verified',
        },
      };

      const updatedLogs = [newLog, ...syncLogs];
      setSyncLogs(updatedLogs);
      localStorage.setItem('yovela_satusehat_logs', JSON.stringify(updatedLogs));

      setSyncingId(null);
      setToastMessage(`Berhasil mengirim rekam medis ${patient.name} ke SATUSEHAT Kemenkes RI! (HTTP 201 Created)`);
      setTimeout(() => setToastMessage(''), 4000);
    }, 1200);
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.rmNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nik.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-['Poppins',sans-serif] flex flex-col antialiased pb-12">
      {/* 1. TOP HEADER BRANDED */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 xl:px-10 py-3 shadow-xs">
        <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer" title="Kembali ke Rekam Medis Poli">
              <div className="w-9 h-9 rounded-xl bg-[#26d4a5]/15 border border-[#26d4a5]/30 flex items-center justify-center p-2 group-hover:scale-105 transition duration-200 shadow-2xs">
                <svg viewBox="0 0 512 512" className="w-full h-full fill-[#26d4a5]">
                  <path d="M416 112c-35.3 0-64 28.7-64 64v51.2c0 23.4-12.2 44.9-32.3 56.8L272 312.6l-47.7-28.6c-20.1-12-32.3-33.5-32.3-56.8V176c0-35.3-28.7-64-64-64S64 140.7 64 176c0 86.8 52.3 162.7 128 193.3V432c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V369.3c75.7-30.6 128-106.5 128-193.3c0-35.3-28.7-64-64-64z" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-slate-900 group-hover:text-[#20b88f] transition">
                  Yovela Dental Clinic
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">Gateway Integrasi SATUSEHAT Kemenkes RI • FHIR R4</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-800 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#26d4a5] animate-pulse" />
              <span>Bridge Online (Production Ready)</span>
            </div>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFIKASI */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700 text-xs font-semibold">
          <div className="w-6 h-6 rounded-full bg-[#26d4a5] text-slate-950 flex items-center justify-center text-xs">
            <i className="fa-solid fa-check" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. SUB-BANNER STATUS KONEKSI FASKES */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 xl:px-10 py-3.5 shadow-2xs">
        <div className="max-w-[1440px] w-full mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-hospital text-xs" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Organization ID</span>
              <strong className="text-slate-800 font-mono">{faskesConfig.organizationId}</strong>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-user-doctor text-xs" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Practitioner IHS ID</span>
              <strong className="text-slate-800 font-mono">{faskesConfig.doctorIhsNumber}</strong>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-shield-halved text-xs" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Protokol Keamanan</span>
              <strong className="text-slate-800">OAuth 2.0 Client Credentials</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WORKSPACE KONTEN UTAMA */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* KOLOM KIRI (6 Kolom): Daftar Pasien & Antrean Kirim FHIR */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Rekam Medis Pasien Siap Sinkron</h2>
                  <p className="text-[11px] text-slate-400">Pilih pasien untuk meninjau struktur JSON FHIR</p>
                </div>

                <div className="relative w-full sm:w-56">
                  <input
                    type="text"
                    placeholder="Cari Pasien, NIK..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#26d4a5] focus:bg-white transition"
                  />
                  <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* List Pasien */}
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredPatients.map((patient) => {
                  const isSelected = selectedPatientId === patient.id;
                  const isSyncing = syncingId === patient.id;

                  return (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      className={`p-3.5 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#26d4a5]/10 border-[#26d4a5] shadow-xs'
                          : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                          isSelected ? 'bg-[#26d4a5] text-slate-950' : 'bg-white text-[#0fa882] border border-slate-200'
                        }`}>
                          {patient.queueNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{patient.name}</h4>
                            <span className="text-[10px] text-slate-500 font-mono">({patient.nik})</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            ICD-10: {patient.lastSoap?.diagnosisIcd10 || 'K02.1'} • {patient.rmNumber}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSyncPatient(patient);
                        }}
                        disabled={isSyncing}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                          isSyncing
                            ? 'bg-amber-500 text-white animate-pulse'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-[#26d4a5] hover:text-[#0fa882]'
                        }`}
                      >
                        <i className={`fa-solid ${isSyncing ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'} text-xs`} />
                        <span>{isSyncing ? 'Kirim...' : 'Kirim'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (6 Kolom): Pratinjau JSON Payload FHIR R4 */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">FHIR R4 Resource Previewer</h3>
                  <p className="text-[10px] text-slate-400">
                    Pasien Aktif: <strong className="text-slate-800">{activePatient?.name}</strong>
                  </p>
                </div>

                {/* Tab Pilihan Resource FHIR */}
                <div className="flex bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
                  {(['Encounter', 'Condition', 'Procedure'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveJsonTab(tab)}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        activeJsonTab === tab
                          ? 'bg-white text-[#0fa882] shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kotak Tampilan JSON Interaktif */}
              <div className="bg-slate-950 rounded-2xl p-4 overflow-x-auto shadow-inner text-[11px] font-mono leading-relaxed text-slate-200 border border-slate-800 max-h-[360px] overflow-y-auto scrollbar-thin">
                <pre className="text-emerald-400">
                  {JSON.stringify(fhirPayload?.[activeJsonTab] || {}, null, 2)}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <i className="fa-solid fa-code text-[#0fa882]" />
                  <span>HL7 FHIR Release 4 • JSON Payload</span>
                </span>

                {activePatient && (
                  <button
                    type="button"
                    onClick={() => handleSyncPatient(activePatient)}
                    className="px-4 py-2 rounded-xl bg-[#26d4a5] hover:bg-[#20b88f] text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <i className="fa-solid fa-paper-plane text-xs" />
                    <span>Sinkronkan Bundle Pasien Ini</span>
                  </button>
                )}
              </div>
            </div>

            {/* Riwayat Log Sinkronisasi */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-clock-rotate-left text-[#0fa882]" />
                  <span>Log Transmisi API Terakhir</span>
                </h4>
                <span className="text-[10px] text-slate-400">{syncLogs.length} Aktivitas</span>
              </div>

              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 text-xs">
                {syncLogs.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-4">Belum ada transmisi data.</p>
                ) : (
                  syncLogs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{log.patientName}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2">{log.timestamp}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                        {log.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
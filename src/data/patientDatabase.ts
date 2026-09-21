import { ToothData } from '../components/Odontogram';
import { Treatment } from './mockData';

export interface PatientRecord {
  id: string;
  queueNumber: string;
  name: string;
  rmNumber: string;
  nik: string;
  birthDate?: string;
  age: number;
  gender: 'Laki-laki' | 'Perempuan';
  phone: string;
  address: string;
  allergies: string;
  registrationDate: string;
  statusKunjungan: 'Menunggu' | 'Sedang Diperiksa' | 'Menunggu Pembayaran' | 'Selesai';
  registeredBy?: string;
  initialOdontogram?: Record<number, any>;
  lastSoap?: {
    subjective: string;
    objective: string;
    diagnosisIcd10: string;
    suggestedTreatments?: string[];
  };
}

export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'P-01',
    queueNumber: 'A-01',
    name: 'Budi Santoso',
    rmNumber: 'RM-20260001',
    nik: '3301011205880001',
    birthDate: '1988-05-12',
    age: 38,
    gender: 'Laki-laki',
    phone: '0812-3456-7890',
    address: 'Jl. Pemuda No. 12, Semarang',
    allergies: 'Tidak Ada',
    registrationDate: '2026-09-21',
    statusKunjungan: 'Sedang Diperiksa',
    registeredBy: 'Budi Santoso, A.Md.Kes (Front Office)',
    initialOdontogram: {
      16: {
        generalCondition: 'normal',
        surfaces: { occlusal: 'caries', mesial: null, distal: null, buccal: null, lingual: null },
      },
      46: {
        generalCondition: 'rct',
        surfaces: { occlusal: 'composite', mesial: null, distal: null, buccal: null, lingual: null },
      },
    },
    lastSoap: {
      subjective: 'Pasien mengeluhkan ngilu tajam pada gigi kanan atas saat minum air es sejak 3 hari lalu.',
      objective: 'Gigi 16 karies oklusal mencapai dentin dalam, tes dingin (+), palpasi (-), perkusi (-).',
      diagnosisIcd10: 'K04.0',
      suggestedTreatments: ['TRX-01', 'TRX-03'],
    },
  },
  {
    id: 'P-02',
    queueNumber: 'A-02',
    name: 'Siti Aminah',
    rmNumber: 'RM-20260002',
    nik: '3301015508920002',
    birthDate: '1992-08-15',
    age: 34,
    gender: 'Perempuan',
    phone: '0813-9876-5432',
    address: 'Jl. Pandanaran No. 45, Semarang',
    allergies: 'Amoxicillin',
    registrationDate: '2026-09-21',
    statusKunjungan: 'Menunggu',
    registeredBy: 'Budi Santoso, A.Md.Kes (Front Office)',
    initialOdontogram: {},
    lastSoap: {
      subjective: 'Gusi berdarah saat menyikat gigi dan terasa bau mulut.',
      objective: 'Kalkulus subgingiva regio anterior mandibula, gingiva hiperemis.',
      diagnosisIcd10: 'K05.1',
      suggestedTreatments: ['TRX-02'],
    },
  },
];

export const getStoredPatients = (): PatientRecord[] => {
  if (typeof window === 'undefined') return INITIAL_PATIENTS;
  const data = localStorage.getItem('yovela_patients_db');
  if (!data) {
    localStorage.setItem('yovela_patients_db', JSON.stringify(INITIAL_PATIENTS));
    return INITIAL_PATIENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PATIENTS;
  }
};

export const saveStoredPatients = (patients: PatientRecord[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('yovela_patients_db', JSON.stringify(patients));
};

export const getActivePatient = (): PatientRecord => {
  const list = getStoredPatients();
  if (typeof window === 'undefined') return list[0];
  const activeId = localStorage.getItem('yovela_active_patient_id');
  const found = list.find((p) => p.id === activeId);
  return found || list[0];
};

export const setActivePatient = (patient: PatientRecord) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('yovela_active_patient_id', patient.id);
};
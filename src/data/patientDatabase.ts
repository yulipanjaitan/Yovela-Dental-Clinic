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
    id: "p-01",
    queueNumber: "A-01",
    name: "Budi Santoso",
    rmNumber: "RM-20260001",
    nik: "3301011205880001",
    birthDate: "1988-05-12",
    age: 38,
    gender: "Laki-laki",
    phone: "0812-3456-7890",
    address: "Jl. Pemuda No. 12, Semarang",
    allergies: "Tidak Ada",
    registrationDate: "2026-09-21",
    statusKunjungan: "Sedang Diperiksa",
    registeredBy: "Budi Santoso, A.Md.Kes (Front Office)",
    initialOdontogram: {
      16: { generalCondition: "normal", surfaces: { occlusal: "caries", mesial: null, distal: null, buccal: null, lingual: null }, notes: "Karies oklusal dentin" },
      46: { generalCondition: "rct", surfaces: { occlusal: "composite", mesial: null, distal: null, buccal: null, lingual: null }, notes: "Pasca PSA" }
    },
    lastSoap: {
      subjective: "Pasien mengeluhkan ngilu tajam pada gigi kanan atas saat minum air es sejak 3 hari lalu.",
      objective: "Gigi 16 karies oklusal mencapai dentin dalam, tes dingin (+), palpasi (-), perkusi (-).",
      diagnosisIcd10: "K04.0",
      suggestedTreatments: ["t-01", "t-02"]
    }
  },
  {
    id: "p-02",
    queueNumber: "A-02",
    name: "Siti Rahmawati",
    rmNumber: "RM-20260002",
    nik: "3301026509990002",
    birthDate: "1999-09-25",
    age: 26,
    gender: "Perempuan",
    phone: "0813-9876-5432",
    address: "Jl. Pandanaran No. 45, Semarang",
    allergies: "Penicillin",
    registrationDate: "2026-09-21",
    statusKunjungan: "Menunggu",
    registeredBy: "Budi Santoso, A.Md.Kes (Front Office)",
    initialOdontogram: {
      21: { generalCondition: "normal", surfaces: { mesial: "composite", distal: null, occlusal: null, buccal: null, lingual: null }, notes: "Tumpatan estetik lama" },
      36: { generalCondition: "caries", surfaces: { occlusal: "caries", buccal: "caries", distal: null, mesial: null, lingual: null }, notes: "Karies profunda" }
    },
    lastSoap: {
      subjective: "Gigi depan sewarna gusi ingin ditambal ulang karena estetika kurang baik, gigi geraham bawah kadang nyut-nyutan.",
      objective: "Gigi 21 fraktur insisal kecil dengan karies sekunder, gigi 36 karies mencapai pulpa.",
      diagnosisIcd10: "K02.1",
      suggestedTreatments: ["t-01", "t-03"]
    }
  },
  {
    id: "p-03",
    queueNumber: "A-03",
    name: "Ahmad Hidayat",
    rmNumber: "RM-20260003",
    nik: "3301031001810003",
    birthDate: "1981-01-10",
    age: 45,
    gender: "Laki-laki",
    phone: "0811-2233-4455",
    address: "Jl. Gajah Mada No. 88, Semarang",
    allergies: "Tidak Ada",
    registrationDate: "2026-09-21",
    statusKunjungan: "Menunggu",
    registeredBy: "Budi Santoso, A.Md.Kes (Front Office)",
    initialOdontogram: {
      38: { generalCondition: "impacted", surfaces: { occlusal: null, mesial: null, distal: null, buccal: null, lingual: null }, notes: "Impaksi mesioangular" },
      48: { generalCondition: "impacted", surfaces: { occlusal: null, mesial: null, distal: null, buccal: null, lingual: null }, notes: "Impaksi vertikal" }
    },
    lastSoap: {
      subjective: "Rahang belakang bawah terasa bengkak dan nyeri hilang timbul sejak seminggu yang lalu saat dipakai mengunyah.",
      objective: "Gigi 38 dan 48 impaksi, operkulitis ringan pada mukosa sekitar gigi 38.",
      diagnosisIcd10: "K01.1",
      suggestedTreatments: ["t-04"]
    }
  },
  {
    id: "p-04",
    queueNumber: "A-04",
    name: "Dewi Lestari",
    rmNumber: "RM-20260004",
    nik: "3301044303950004",
    birthDate: "1995-03-03",
    age: 31,
    gender: "Perempuan",
    phone: "0819-8877-6655",
    address: "Jl. Pahlawan No. 5, Semarang",
    allergies: "Tidak Ada",
    registrationDate: "2026-09-21",
    statusKunjungan: "Menunggu",
    registeredBy: "Budi Santoso, A.Md.Kes (Front Office)",
    initialOdontogram: {
      11: { generalCondition: "normal", surfaces: { distal: "caries", mesial: null, occlusal: null, buccal: null, lingual: null }, notes: "Karies proksimal" },
      12: { generalCondition: "normal", surfaces: { distal: "caries", mesial: null, occlusal: null, buccal: null, lingual: null }, notes: "Karies proksimal" }
    },
    lastSoap: {
      subjective: "Ada celah kehitaman di antara gigi depan atas yang sering nyangkut makanan dan terasa ngilu.",
      objective: "Karies email/dentin pada sisi interdental gigi 11 dan 12.",
      diagnosisIcd10: "K02.0",
      suggestedTreatments: ["t-01"]
    }
  },
  {
    id: "p-05",
    queueNumber: "A-05",
    name: "Rizky Pratama",
    rmNumber: "RM-20260005",
    nik: "3301052207070005",
    birthDate: "2007-07-22",
    age: 19,
    gender: "Laki-laki",
    phone: "0856-1122-3344",
    address: "Jl. Setiabudi No. 100, Semarang",
    allergies: "Tidak Ada",
    registrationDate: "2026-09-21",
    statusKunjungan: "Menunggu",
    registeredBy: "Budi Santoso, A.Md.Kes (Front Office)",
    initialOdontogram: {
      46: { generalCondition: "radix", surfaces: { occlusal: null, mesial: null, distal: null, buccal: null, lingual: null }, notes: "Sisa akar tertinggal" }
    },
    lastSoap: {
      subjective: "Gigi belakang bawah berlubang besar tinggal akar, ingin dicabut karena sering menusuk lidah.",
      objective: "Mahkota gigi 46 hancur total tinggal sisa akar (radix), jaringan sekitar radang kronis (-).",
      diagnosisIcd10: "K04.1",
      suggestedTreatments: ["t-05"]
    }
  },
  {
    id: "p-06",
    queueNumber: "A-06",
    name: "Maya Indah",
    rmNumber: "RM-20260006",
    nik: "3301065012970006",
    birthDate: "1997-12-10",
    age: 29,
    gender: "Perempuan",
    phone: "0878-5544-3322",
    address: "Jl. MT Haryono No. 14, Semarang",
    allergies: "Sulfonamide",
    registrationDate: "2026-09-21",
    statusKunjungan: "Menunggu",
    registeredBy: "Budi Santoso, A.Md.Kes (Front Office)",
    initialOdontogram: {
      26: { generalCondition: "rct", surfaces: { occlusal: "composite", mesial: "composite", distal: "composite", buccal: null, lingual: null }, notes: "Pasca perawatan saluran akar" }
    },
    lastSoap: {
      subjective: "Kontrol pasca perawatan saluran akar gigi geraham atas kiri, sudah tidak ada keluhan nyeri spontan.",
      objective: "Perkusi (-), palpasi (-), restorasi sementara/tetap intak dan baik.",
      diagnosisIcd10: "K04.4",
      suggestedTreatments: ["t-02", "t-06"]
    }
  },
  {
    id: "p-07",
    queueNumber: "A-07",
    name: "Eko Prasetyo",
    rmNumber: "RM-20260007",
    nik: "3301070308740007",
    birthDate: "1974-08-03",
    age: 52,
    gender: "Laki-laki",
    phone: "0812-9988-7766",
    address: "Jl. Majapahit No. 50, Semarang",
    allergies: "Tidak Ada",
    registrationDate: "2026-09-21",
    statusKunjungan: "Menunggu",
    registeredBy: "Budi Santoso, A.Md.Kes (Front Office)",
    initialOdontogram: {
      36: { generalCondition: "missing", surfaces: { occlusal: null, mesial: null, distal: null, buccal: null, lingual: null }, notes: "Missing tooth" },
      37: { generalCondition: "missing", surfaces: { occlusal: null, mesial: null, distal: null, buccal: null, lingual: null }, notes: "Missing tooth" }
    },
    lastSoap: {
      subjective: "Ingin membuat gigi tiruan/palsu untuk menggantikan gigi belakang bawah yang sudah lama dicabut.",
      objective: "Edentulous area pada regio 36 dan 37, jaringan pendukung sehat dan kuat.",
      diagnosisIcd10: "K08.1",
      suggestedTreatments: ["t-07"]
    }
  },
  {
    id: "p-08",
    queueNumber: "A-08",
    name: "Putri Wulandari",
    rmNumber: "RM-20260008",
    nik: "3301086804020008",
    birthDate: "2002-04-28",
    age: 24,
    gender: "Perempuan",
    phone: "0857-3322-1100",
    address: "Jl. Tlogosari Raya No. 9, Semarang",
    allergies: "Tidak Ada",
    registrationDate: "2026-09-21",
    statusKunjungan: "Menunggu",
    registeredBy: "Budi Santoso, A.Md.Kes (Front Office)",
    initialOdontogram: {
      13: { generalCondition: "normal", surfaces: { buccal: "caries", occlusal: null, mesial: null, distal: null, lingual: null }, notes: "Karies servikal" },
      14: { generalCondition: "normal", surfaces: { buccal: "caries", occlusal: null, mesial: null, distal: null, lingual: null }, notes: "Karies servikal" }
    },
    lastSoap: {
      subjective: "Leher gigi terasa linu saat tersikat sikat gigi atau terkena air dingin.",
      objective: "Abrasio / karies servikal pada gigi 13 dan 14 bagian bukal.",
      diagnosisIcd10: "K03.1",
      suggestedTreatments: ["t-01"]
    }
  },
  {
    id: "p-09",
    queueNumber: "A-09",
    name: "Hendra Wijaya",
    rmNumber: "RM-20260009",
    nik: "3301091510860009",
    birthDate: "1986-10-15",
    age: 40,
    gender: "Laki-laki",
    phone: "0813-4455-6677",
    address: "Jl. Imam Bonjol No. 21, Semarang",
    allergies: "Tidak Ada",
    registrationDate: "2026-09-21",
    statusKunjungan: "Menunggu",
    registeredBy: "Budi Santoso, A.Md.Kes (Front Office)",
    initialOdontogram: {
      45: { generalCondition: "normal", surfaces: { occlusal: "temporary", mesial: null, distal: null, buccal: null, lingual: null }, notes: "Tumpatan sementara" }
    },
    lastSoap: {
      subjective: "Kontrol tambalan sementara gigi geraham kecil bawah, sudah tidak ngilu.",
      objective: "Tumpatan sementara utuh, tes vitalitas (+) normal.",
      diagnosisIcd10: "K02.1",
      suggestedTreatments: ["t-01"]
    }
  },
  {
    id: "p-10",
    queueNumber: "A-10",
    name: "Rina Marlina",
    rmNumber: "RM-20260010",
    nik: "3301104512910010",
    birthDate: "1991-12-05",
    age: 35,
    gender: "Perempuan",
    phone: "0821-7788-9900",
    address: "Jl. S. Parman No. 30, Semarang",
    allergies: "Tidak Ada",
    registrationDate: "2026-09-21",
    statusKunjungan: "Menunggu",
    registeredBy: "Budi Santoso, A.Md.Kes (Front Office)",
    initialOdontogram: {
      16: { generalCondition: "normal", surfaces: { occlusal: null, mesial: null, distal: null, buccal: null, lingual: null }, notes: "Karang gigi parah" },
      26: { generalCondition: "normal", surfaces: { occlusal: null, mesial: null, distal: null, buccal: null, lingual: null }, notes: "Karang gigi parah" }
    },
    lastSoap: {
      subjective: "Gusi sering berdarah saat menggosok gigi dan nafas terasa kurang segar.",
      objective: "Kalkulus (karang gigi) subgingiva dan supragingiva menyeluruh, gingivitis ringan.",
      diagnosisIcd10: "K05.1",
      suggestedTreatments: ["t-08"]
    }
  }
];

// --- IMMEDIATE INITIALIZATION (IFFE) ---
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('yovela_patients_db')) {
    localStorage.setItem('yovela_patients_db', JSON.stringify(INITIAL_PATIENTS));
  }
  
  if (!localStorage.getItem('yovela_active_patient_id')) {
    localStorage.setItem('yovela_active_patient_id', INITIAL_PATIENTS[0].id);
  }
}

export const getStoredPatients = (): PatientRecord[] => {
  if (typeof window === 'undefined') return INITIAL_PATIENTS;
  const data = localStorage.getItem('yovela_patients_db');
  if (!data) {
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
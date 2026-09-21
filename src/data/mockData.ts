export interface Treatment {
  id: string;
  category: 'Pemeriksaan & Preventif' | 'Konservasi & Endodontik' | 'Bedah Mulut' | 'Periodonsia' | 'Ortodonti' | 'Prostodonsia & Estetika' | 'Pedodonsia (Gigi Anak)';
  name: string;
  price: number;
  icd9cm: string; // Standar Prosedur Kemenkes RI / SATUSEHAT
  description?: string;
}

export interface Diagnosis {
  code: string; // Kode ICD-10
  name: string; // Terminologi Medis Odontologi
  category: string;
}

// 1. DAFTAR TINDAKAN & PELAYANAN KLINIS (Lengkap dengan ICD-9-CM & Kategori)
export const TREATMENTS: Treatment[] = [
  // --- KATEGORI 1: PEMERIKSAAN & PREVENTIF ---
  {
    id: 'TRT-001',
    category: 'Pemeriksaan & Preventif',
    name: 'Konsultasi & Pemeriksaan Intraoral Rutin',
    price: 100000,
    icd9cm: '89.31',
    description: 'Pemeriksaan rongga mulut berkala dan evaluasi odontogram',
  },
  {
    id: 'TRT-002',
    category: 'Pemeriksaan & Preventif',
    name: 'Foto Rontgen Periapikal Digital',
    price: 85000,
    icd9cm: '87.11',
    description: 'Radiografi periapikal lokal satu regio gigi',
  },
  {
    id: 'TRT-003',
    category: 'Pemeriksaan & Preventif',
    name: 'Topikal Aplikasi Fluor (Fluoride Varnish)',
    price: 180000,
    icd9cm: '96.54',
    description: 'Pencegahan karies dan remineralisasi email gigi',
  },
  {
    id: 'TRT-004',
    category: 'Pemeriksaan & Preventif',
    name: 'Fissure Sealant (Per Gigi)',
    price: 200000,
    icd9cm: '23.49',
    description: 'Penutupan ceruk pit dan fisur gigi posterior',
  },

  // --- KATEGORI 2: PERIODONSIA (KESEHATAN GUSI & KARANG GIGI) ---
  {
    id: 'TRT-005',
    category: 'Periodonsia',
    name: 'Scaling & Polishing Ringan (1-2 Rahang)',
    price: 300000,
    icd9cm: '96.54',
    description: 'Pembersihan karang gigi supragingival ultrasonik',
  },
  {
    id: 'TRT-006',
    category: 'Periodonsia',
    name: 'Scaling Deep / Root Planing Subgingival (Per Regio)',
    price: 450000,
    icd9cm: '96.54',
    description: 'Pembersihan karang gigi mendalam pada saku periodontal',
  },
  {
    id: 'TRT-007',
    category: 'Periodonsia',
    name: 'Kuretase Periodontal & Aplikasi Antibiotik Topikal',
    price: 350000,
    icd9cm: '24.39',
    description: 'Pembersihan jaringan granulasi pada gingivitis kronis',
  },

  // --- KATEGORI 3: KONSERVASI & ENDODONTIK (PENAMBALAN & PERAWATAN SALURAN AKAR) ---
  {
    id: 'TRT-008',
    category: 'Konservasi & Endodontik',
    name: 'Tambal Gigi Komposit Sinar Anterior (Estetik Depan)',
    price: 350000,
    icd9cm: '23.2',
    description: 'Restorasi resin komposit nano-hybrid warna gigi',
  },
  {
    id: 'TRT-009',
    category: 'Konservasi & Endodontik',
    name: 'Tambal Gigi Komposit Sinar Posterior (Gigi Geraham)',
    price: 280000,
    icd9cm: '23.2',
    description: 'Penambalan resin komposit tahan beban kunyah',
  },
  {
    id: 'TRT-010',
    category: 'Konservasi & Endodontik',
    name: 'Tambal Gigi Glass Ionomer Cement (GIC)',
    price: 200000,
    icd9cm: '23.2',
    description: 'Penambalan semen ionomer kaca pelepasan fluoride',
  },
  {
    id: 'TRT-011',
    category: 'Konservasi & Endodontik',
    name: 'Perawatan Saluran Akar (PSA / Endodontik) Kunjungan 1 - Ekstirpasi Pulpa',
    price: 400000,
    icd9cm: '23.7',
    description: 'Trepanasi, pembersihan kamar pulpa, dan medikamen intra-kanal',
  },
  {
    id: 'TRT-012',
    category: 'Konservasi & Endodontik',
    name: 'PSA Kunjungan Lanjutan - Preparasi & Obturasi Gutta Percha',
    price: 450000,
    icd9cm: '23.73',
    description: 'Pengisian permanen saluran akar dan foto kontrol',
  },
  {
    id: 'TRT-013',
    category: 'Konservasi & Endodontik',
    name: 'Pemasangan Pasak Fiber (Fiber Post) & Core Build-Up',
    price: 500000,
    icd9cm: '23.49',
    description: 'Penguatan mahkota pasca perawatan saluran akar',
  },

  // --- KATEGORI 4: BEDAH MULUT & EKSTRAKSI (PENCABUTAN) ---
  {
    id: 'TRT-014',
    category: 'Bedah Mulut',
    name: 'Pencabutan Gigi Dewasa Tanpa Komplikasi (Goyang)',
    price: 250000,
    icd9cm: '23.09',
    description: 'Ekstraksi gigi permanen dengan anestesi lokal infiltrasi',
  },
  {
    id: 'TRT-015',
    category: 'Bedah Mulut',
    name: 'Pencabutan Gigi Permanen dengan Komplikasi / Sisa Akar',
    price: 450000,
    icd9cm: '23.19',
    description: 'Ekstraksi sisa akar dengan elevasi atau separasi',
  },
  {
    id: 'TRT-016',
    category: 'Bedah Mulut',
    name: 'Odontektomi / Operasi Gigi Bungsu Impaksi Kelas I - II',
    price: 1800000,
    icd9cm: '23.19',
    description: 'Pembedahan pengangkatan molar 3 impaksi bertulang ringan',
  },
  {
    id: 'TRT-017',
    category: 'Bedah Mulut',
    name: 'Odontektomi Gigi Bungsu Impaksi Kompleks / Horizontal',
    price: 2500000,
    icd9cm: '23.19',
    description: 'Pembedahan gigi bungsu impaksi dalam dengan pembelahan mahkota/akar',
  },
  {
    id: 'TRT-018',
    category: 'Bedah Mulut',
    name: 'Insisi & Drainase Abses Intraoral',
    price: 350000,
    icd9cm: '27.0',
    description: 'Evakuasi pus/nanah akibat infeksi odontogenik akut',
  },

  // --- KATEGORI 5: PROSTODONSIA & ESTETIKA GIGI ---
  {
    id: 'TRT-019',
    category: 'Prostodonsia & Estetika',
    name: 'In-Office Dental Bleaching / Pemutihan Gigi Laser',
    price: 2200000,
    icd9cm: '96.54',
    description: 'Pencerahan warna enamel menggunakan gel hidrogen peroksida & aktivasi cahaya',
  },
  {
    id: 'TRT-020',
    category: 'Prostodonsia & Estetika',
    name: 'Mahkota Tiruan Porcelain Fused to Metal (PFM Crown)',
    price: 1800000,
    icd9cm: '23.41',
    description: 'Crown selubung permanen keramik logam',
  },
  {
    id: 'TRT-021',
    category: 'Prostodonsia & Estetika',
    name: 'Mahkota Tiruan All-Ceramic Zirconia Premium (Per Unit)',
    price: 3200000,
    icd9cm: '23.41',
    description: 'Restorasi mahkota estetik tinggi bahan Zirconia tanpa logam',
  },
  {
    id: 'TRT-022',
    category: 'Prostodonsia & Estetika',
    name: 'Porcelain Veneer Estetik (Per Gigi)',
    price: 2800000,
    icd9cm: '23.49',
    description: 'Lapisan keramik tipis untuk perbaikan bentuk, ukuran, dan warna senyum',
  },
  {
    id: 'TRT-023',
    category: 'Prostodonsia & Estetika',
    name: 'Gigi Tiruan Lepasan Akrilik (Basis + 1 Elemen Gigi)',
    price: 850000,
    icd9cm: '23.42',
    description: 'Plat akrilik lepasan untuk penggantian gigi hilang',
  },

  // --- KATEGORI 6: ORTODONTI (PERAWATAN KAWAT GIGI) ---
  {
    id: 'TRT-024',
    category: 'Ortodonti',
    name: 'Pemasangan Behel / Kawat Gigi Metal Konvensional (Atas & Bawah)',
    price: 6500000,
    icd9cm: '24.7',
    description: 'Bracket ortodonti fixed metal standar dua rahang',
  },
  {
    id: 'TRT-025',
    category: 'Ortodonti',
    name: 'Pemasangan Behel Sapphire / Ceramic Aesthetic Brackets',
    price: 9500000,
    icd9cm: '24.7',
    description: 'Bracket transparan estetik tinggi senada warna gigi',
  },
  {
    id: 'TRT-026',
    category: 'Ortodonti',
    name: 'Kontrol Rutin / Aktivasi Behel Bulanan (Ganti Karet & Kawat)',
    price: 200000,
    icd9cm: '24.8',
    description: 'Pemeriksaan perkembangan pergeseran gigi dan penggantian archwire/power-O',
  },
  {
    id: 'TRT-027',
    category: 'Ortodonti',
    name: 'Retainer Pasca Behel Clear Aligner / Hawley (Per Rahang)',
    price: 900000,
    icd9cm: '24.8',
    description: 'Alat penahan posisi gigi pasca perawatan ortodonti selesai',
  },

  // --- KATEGORI 7: PEDODONSIA (PERAWATAN GIGI ANAK) ---
  {
    id: 'TRT-028',
    category: 'Pedodonsia (Gigi Anak)',
    name: 'Pencabutan Gigi Susu Sulung (Topikal / Infiltrasi Ringan)',
    price: 150000,
    icd9cm: '23.01',
    description: 'Ekstraksi gigi susu goyang atau persistensi',
  },
  {
    id: 'TRT-029',
    category: 'Pedodonsia (Gigi Anak)',
    name: 'Tambal Gigi Susu Komposit / Glass Ionomer Warna-Warni',
    price: 180000,
    icd9cm: '23.2',
    description: 'Restorasi karies gigi desidui ramah anak',
  },
  {
    id: 'TRT-030',
    category: 'Pedodonsia (Gigi Anak)',
    name: 'Pulpotomi / Perawatan Saraf Gigi Susu + Stainless Steel Crown (SSC)',
    price: 750000,
    icd9cm: '23.71',
    description: 'Perawatan vitalitas pulpa dan restorasi mahkota logam gigi anak',
  },
];

// 2. MASTER DIAGNOSIS ICD-10 ODONTOLOGI LENGKAP
export const DIAGNOSES: Diagnosis[] = [
  { code: 'K02.0', name: 'Caries limited to enamel (Karies email / white spot)', category: 'Karies' },
  { code: 'K02.1', name: 'Caries of dentine (Karies dentin / lubang sedang)', category: 'Karies' },
  { code: 'K02.2', name: 'Caries of cementum (Karies sementum / leher akar)', category: 'Karies' },
  { code: 'K02.9', name: 'Dental caries, unspecified (Karies gigi tak spesifik)', category: 'Karies' },
  { code: 'K04.0', name: 'Pulpitis (Pulpitis reversibel / ireversibel akut/kronis)', category: 'Pulpa & Periapikal' },
  { code: 'K04.1', name: 'Necrosis of pulp (Nekrosis pulpa / gigi mati)', category: 'Pulpa & Periapikal' },
  { code: 'K04.4', name: 'Acute apical periodontitis (Periodontitis apikalis akut)', category: 'Pulpa & Periapikal' },
  { code: 'K04.6', name: 'Periapical abscess with sinus (Abses periapikal dengan fistula)', category: 'Pulpa & Periapikal' },
  { code: 'K04.7', name: 'Periapical abscess without sinus (Abses periapikal tanpa fistula)', category: 'Pulpa & Periapikal' },
  { code: 'K05.0', name: 'Acute gingivitis (Radang gusi akut)', category: 'Gusi & Periodontal' },
  { code: 'K05.1', name: 'Chronic gingivitis (Radang gusi kronis / gusi berdarah)', category: 'Gusi & Periodontal' },
  { code: 'K05.3', name: 'Chronic periodontitis (Periodontitis kronis / karang gigi parah)', category: 'Gusi & Periodontal' },
  { code: 'K01.1', name: 'Impacted teeth (Gigi impaksi / gigi bungsu miring)', category: 'Anomali & Impaksi' },
  { code: 'K07.2', name: 'Anomalies of dental arch relationship (Maloklusi / susunan gigi tidak rapi)', category: 'Ortodonti' },
  { code: 'K08.1', name: 'Loss of teeth due to accident, extraction (Kehilangan gigi / edentulous)', category: 'Prostodonsia' },
  { code: 'K03.1', name: 'Abrasion of teeth (Abrasi servikal karena sikat gigi keras)', category: 'Kerusakan Fisik Gigi' },
  { code: 'K03.0', name: 'Excessive attrition of teeth (Atrisi / aus permukaan kunyah)', category: 'Kerusakan Fisik Gigi' },
  { code: 'K03.6', name: 'Deposits [accretions] on teeth (Stain rokok / teh / plak berlebih)', category: 'Kebersihan Mulut' },
  { code: 'K00.6', name: 'Disturbances in tooth eruption (Persistensi gigi susu)', category: 'Pedodonsia' },
];
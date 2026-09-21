'use client';

import React from 'react';

export type ToothSurface = 'occlusal' | 'mesial' | 'distal' | 'buccal' | 'lingual';

export type GeneralToothCondition = 
  | 'normal'
  | 'missing'
  | 'radix'
  | 'impacted'
  | 'rct'
  | 'full_crown';

export interface ToothData {
  generalCondition?: GeneralToothCondition;
  surfaces: Record<ToothSurface, string | null>;
  notes?: string;
}

interface ToothProps {
  toothNumber: number;
  data?: ToothData;
  isDeciduous?: boolean;
  onSurfaceClick: (toothNumber: number, surface: ToothSurface) => void;
  onToothConditionClick: (toothNumber: number) => void;
}

export const SURFACE_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  caries: { fill: '#ef4444', stroke: '#b91c1c', label: 'Karies (CAR)' },
  composite: { fill: '#26d4a5', stroke: '#0fa882', label: 'Komposit (CFR)' },
  amalgam: { fill: '#64748b', stroke: '#334155', label: 'Amalgam (AMF)' },
  gic: { fill: '#10b981', stroke: '#047857', label: 'GIC (Fisur)' },
  temporary: { fill: '#f59e0b', stroke: '#b45309', label: 'Tumpatan Sementara' },
};

export const Tooth: React.FC<ToothProps> = ({
  toothNumber,
  data,
  isDeciduous = false,
  onSurfaceClick,
  onToothConditionClick,
}) => {
  const surfaces = data?.surfaces || {
    occlusal: null,
    mesial: null,
    distal: null,
    buccal: null,
    lingual: null,
  };
  const generalCondition = data?.generalCondition || 'normal';

  const getSurfaceColor = (surf: ToothSurface) => {
    const cond = surfaces[surf];
    if (cond && SURFACE_COLORS[cond]) {
      return SURFACE_COLORS[cond].fill;
    }
    return '#ffffff';
  };

  const isMissing = generalCondition === 'missing';
  const isRadix = generalCondition === 'radix';
  const isImpacted = generalCondition === 'impacted';
  const isRct = generalCondition === 'rct';
  const isCrown = generalCondition === 'full_crown';

  return (
    <div className="flex flex-col items-center p-0.5 select-none group font-['Poppins',sans-serif]">
      {/* Tombol Nomor FDI Gigi */}
      <button
        type="button"
        onClick={() => onToothConditionClick(toothNumber)}
        title={`Status & Catatan Gigi #${toothNumber}`}
        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 mb-1 rounded-md cursor-pointer transition-all duration-150 transform group-hover:scale-110 ${
          isDeciduous
            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
            : generalCondition !== 'normal'
            ? 'bg-[#26d4a5] text-slate-950 font-black shadow-xs'
            : 'bg-slate-100 text-slate-700 hover:bg-[#26d4a5]/20 hover:text-slate-900'
        }`}
      >
        {toothNumber}
      </button>

      {/* Kotak Gigi dengan Efek Kursor Hover Terangkat & Glow */}
      <div 
        className={`relative p-1 rounded-xl bg-white border cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#26d4a5] ${
          isImpacted ? 'border-dashed border-amber-500 bg-amber-50/40' : 'border-slate-200 shadow-2xs'
        } ${isCrown ? 'ring-2 ring-amber-400 bg-amber-50/20' : ''}`}
      >
        <svg viewBox="0 0 100 100" className="w-9 h-9 md:w-10 md:h-10">
          {/* 1. Bukal / Labial (Segmen Atas) */}
          <polygon
            points="10,10 90,10 70,30 30,30"
            fill={getSurfaceColor('buccal')}
            stroke="#94a3b8"
            strokeWidth="1.5"
            className="tooth-segment"
            onClick={() => onSurfaceClick(toothNumber, 'buccal')}
          />

          {/* 2. Distal (Segmen Kanan) */}
          <polygon
            points="90,10 90,90 70,70 70,30"
            fill={getSurfaceColor('distal')}
            stroke="#94a3b8"
            strokeWidth="1.5"
            className="tooth-segment"
            onClick={() => onSurfaceClick(toothNumber, 'distal')}
          />

          {/* 3. Lingual / Palatal (Segmen Bawah) */}
          <polygon
            points="90,90 10,90 30,70 70,70"
            fill={getSurfaceColor('lingual')}
            stroke="#94a3b8"
            strokeWidth="1.5"
            className="tooth-segment"
            onClick={() => onSurfaceClick(toothNumber, 'lingual')}
          />

          {/* 4. Mesial (Segmen Kiri) */}
          <polygon
            points="10,90 10,10 30,30 30,70"
            fill={getSurfaceColor('mesial')}
            stroke="#94a3b8"
            strokeWidth="1.5"
            className="tooth-segment"
            onClick={() => onSurfaceClick(toothNumber, 'mesial')}
          />

          {/* 5. Oklusal / Insisal (Segmen Tengah) */}
          <polygon
            points="30,30 70,30 70,70 30,70"
            fill={getSurfaceColor('occlusal')}
            stroke="#94a3b8"
            strokeWidth="1.5"
            className="tooth-segment"
            onClick={() => onSurfaceClick(toothNumber, 'occlusal')}
          />

          {/* Layer Kondisi Khusus: Missing / Hilang (Silang Merah) */}
          {isMissing && (
            <g stroke="#dc2626" strokeWidth="4" strokeLinecap="round" className="pointer-events-none">
              <line x1="10" y1="10" x2="90" y2="90" />
              <line x1="90" y1="10" x2="10" y2="90" />
            </g>
          )}

          {/* Layer Kondisi Khusus: Radix / Sisa Akar (Simbol R) */}
          {isRadix && (
            <g fill="#ea580c" opacity="0.85" className="pointer-events-none">
              <polygon points="50,15 85,85 15,85" />
              <text x="50" y="65" fontSize="24" fontWeight="bold" textAnchor="middle" fill="#ffffff">
                R
              </text>
            </g>
          )}

          {/* Layer Kondisi Khusus: RCT / Endodontik (Garis Biru) */}
          {isRct && (
            <g stroke="#2563eb" strokeWidth="4" strokeLinecap="round" className="pointer-events-none">
              <line x1="50" y1="5" x2="50" y2="95" />
              <line x1="30" y1="5" x2="70" y2="5" />
            </g>
          )}
        </svg>

        {/* Badge Mahkota / Crown (CRN) */}
        {isCrown && (
          <span className="absolute -top-1 -right-1 text-[8px] bg-amber-500 text-white font-extrabold px-1 rounded-full shadow-2xs pointer-events-none">
            CRN
          </span>
        )}
      </div>

      {/* Indikator Titik Mint Catatan Klinis */}
      {data?.notes && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#26d4a5] mt-1" title={data.notes} />
      )}
    </div>
  );
};
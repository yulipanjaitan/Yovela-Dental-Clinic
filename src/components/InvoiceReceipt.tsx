'use client';

import React from 'react';
import { Treatment } from '../data/mockData';

export interface InvoiceData {
  invoiceNo: string;
  patientName: string;
  rmNumber: string;
  doctorName: string;
  treatments: Treatment[];
  total: number;
}

interface InvoiceReceiptProps {
  invoiceData: InvoiceData;
}

export const InvoiceReceipt: React.FC<InvoiceReceiptProps> = ({ invoiceData }) => {
  return (
    <aside
      aria-label="Struk Kasir Termal"
      className="hidden print:block fixed inset-0 m-0 p-4 bg-white text-black font-mono text-[11px] leading-tight z-[9999]"
      style={{ width: '80mm', maxWidth: '80mm' }}
    >
      <div className="text-center pb-2 border-b border-dashed border-black">
        <h2 className="text-sm font-bold uppercase tracking-wider">Yovela Dental Clinic</h2>
        <p className="text-[10px]">Jl. Pemuda No. 45, Semarang</p>
        <p className="text-[10px]">Telp: (024) 8765-4321</p>
      </div>

      <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span>No. Bukti:</span>
          <span className="font-bold">{invoiceData.invoiceNo}</span>
        </div>
        <div className="flex justify-between">
          <span>Waktu:</span>
          <span>{new Date().toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span>Pasien:</span>
          <span className="font-bold">{invoiceData.patientName}</span>
        </div>
        <div className="flex justify-between">
          <span>No. RM:</span>
          <span>{invoiceData.rmNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Dokter:</span>
          <span className="truncate max-w-[140px]">{invoiceData.doctorName}</span>
        </div>
      </div>

      <div className="py-2 border-b border-dashed border-black space-y-1">
        <div className="flex justify-between font-bold text-[10px]">
          <span>Tindakan / Prosedur</span>
          <span>Tarif</span>
        </div>
        {invoiceData.treatments.map((item, idx) => (
          <div key={idx} className="flex justify-between text-[10px]">
            <span className="truncate max-w-[150px]">{item.name}</span>
            <span>Rp {item.price.toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>

      <div className="py-2 border-b border-dashed border-black space-y-1 text-[11px]">
        <div className="flex justify-between font-bold">
          <span>TOTAL BIAYA:</span>
          <span>Rp {invoiceData.total.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>Metode Bayar:</span>
          <span>QRIS / Transfer</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>Status:</span>
          <span className="font-bold">LUNAS</span>
        </div>
      </div>

      <div className="pt-3 text-center text-[9px] space-y-0.5">
        <p>Terima kasih atas kunjungan Anda.</p>
        <p>Lekas sembuh & senyum sehat selalu.</p>
        <p className="font-bold">Simpan struk ini sebagai bukti pembayaran resmi.</p>
      </div>
    </aside>
  );
};
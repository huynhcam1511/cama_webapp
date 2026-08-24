"use client";

import React, { useState } from 'react';
import { Layers, Plus, QrCode, Loader2, Printer, ChevronLeft } from 'lucide-react';
import QRCode from 'qrcode';
import { generateSequentialLocations } from '../actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LocationGeneratorPage() {
  const router = useRouter();
  const [floor, setFloor] = useState('Tầng 01');
  const [startNum, setStartNum] = useState(1);
  const [endNum, setEndNum] = useState(50);
  const [notes, setNotes] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<{code: string, img: string}[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (startNum > endNum) {
      alert("Số bắt đầu phải nhỏ hơn hoặc bằng số kết thúc");
      return;
    }

    setIsGenerating(true);
    
    // 1. Save to DB
    const res = await generateSequentialLocations(floor, startNum, endNum, notes);
    if (!res.success) {
      alert("Lỗi khi tạo vị trí trong CSDL: " + res.error);
      setIsGenerating(false);
      return;
    }

    // 2. Generate QR images
    const codes = [];
    for (let i = startNum; i <= endNum; i++) {
      const paddedNumber = i.toString().padStart(2, '0');
      const locCode = `${floor.trim().toUpperCase().replace(/\s+/g, '-')}-${paddedNumber}`;
      
      const url = new URL(window.location.origin + '/dashboard/inventory/catalog/new');
      url.searchParams.set("floor", floor);
      url.searchParams.set("shelf", paddedNumber);
      
      try {
        const qrDataUrl = await QRCode.toDataURL(url.toString(), { margin: 1, width: 300, color: { dark: '#0f172a', light: '#ffffff' } });
        codes.push({ code: `${floor} - ${paddedNumber}`, img: qrDataUrl });
      } catch (err) {
        console.error("QR Error", err);
      }
    }
    
    setGeneratedCodes(codes);
    setIsGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50 relative">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="p-6 border-b border-slate-100 bg-white no-print">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/inventory/locations" className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-indigo-600" /> Tạo Mã Định Danh Hàng Loạt
          </h2>
        </div>

        <form onSubmit={handleGenerate} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tên Tầng/Khu Vực</label>
              <input 
                type="text" 
                value={floor} 
                onChange={e => setFloor(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="VD: Tầng 01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Từ Số</label>
              <input 
                type="number" 
                value={startNum} 
                onChange={e => setStartNum(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Đến Số</label>
              <input 
                type="number" 
                value={endNum} 
                onChange={e => setEndNum(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                min="1"
                required
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú (Tùy chọn)</label>
            <input 
              type="text" 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="VD: Kệ treo váy cưới"
            />
          </div>

          <div className="flex gap-4">
            <button 
              type="submit"
              disabled={isGenerating}
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
              {isGenerating ? 'Đang tạo...' : 'Tạo Mã Vị Trí'}
            </button>
            
            {generatedCodes.length > 0 && (
              <button 
                type="button"
                onClick={handlePrint}
                className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-5 h-5" /> In Mã Tem (A4)
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Print Area */}
      {generatedCodes.length > 0 && (
        <div className="flex-1 p-8 bg-slate-100 overflow-y-auto no-print">
          <h3 className="text-lg font-bold text-slate-700 mb-4">Xem trước bản in:</h3>
          <div className="bg-white p-8 shadow-xl max-w-[210mm] mx-auto border border-slate-200">
             <div id="print-area" className="w-full">
                <div className="grid grid-cols-4 gap-4 w-full" style={{ pageBreakInside: 'avoid' }}>
                  {generatedCodes.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center border border-slate-300 p-2 break-inside-avoid text-center">
                      <img src={item.img} alt={item.code} className="w-20 h-20 object-contain mb-1" />
                      <div className="font-bold text-slate-900 leading-tight" style={{ fontSize: '11px' }}>{item.code}</div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

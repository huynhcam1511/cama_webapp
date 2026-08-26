"use client";

import { X, QrCode, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const Scanner = dynamic(() => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner), { 
  ssr: false,
  loading: () => <div className="text-white">Đang tải camera...</div> 
});

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
  title?: string;
  instruction?: string;
}

export default function QRScanner({
  onScanSuccess,
  onClose,
  title = "Quét Mã QR",
  instruction = "Đưa mã QR trên tem vào khung hình để quét.",
}: QRScannerProps) {
  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSecure(window.isSecureContext);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-200">
      
      {/* Header / Controls floating on top */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-5 pt-8 bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-12 pointer-events-auto">
        <h3 className="font-bold flex items-center gap-2 text-white text-lg drop-shadow-md">
          <QrCode className="w-6 h-6 text-white" /> {title}
        </h3>
        <button 
          onClick={onClose} 
          className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Full screen Video Stream using yudiel/react-qr-scanner */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {!isSecure ? (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm">
            <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
            <h4 className="text-white font-bold text-xl mb-2">Không có quyền Camera</h4>
            <p className="text-slate-300 text-sm">
              Trình duyệt đã chặn Camera vì bạn đang truy cập qua kết nối không bảo mật (HTTP).
              <br/><br/>
              Vui lòng chuyển sang dùng <strong>HTTPS</strong> hoặc truy cập bằng <strong>localhost</strong>.
            </p>
          </div>
        ) : (
          <Scanner
            onScan={(result) => {
              if (result && result.length > 0) {
                onScanSuccess(result[0].rawValue);
              }
            }}
            onError={(error) => {
               console.warn("Scanner error:", error);
            }}
            components={{
              finder: true,
            }}
            styles={{
              container: {
                width: "100%",
                height: "100%",
              },
              video: {
                objectFit: "cover",
              }
            }}
          />
        )}
      </div>

      {/* Instruction floating at bottom */}
      <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col items-center justify-center px-6 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-md text-white text-sm md:text-base text-center font-medium px-6 py-4 rounded-3xl shadow-xl max-w-sm border border-white/10">
          {instruction}
        </div>
      </div>
    </div>
  );
}

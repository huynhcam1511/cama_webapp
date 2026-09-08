"use client";

import { X, QrCode, AlertTriangle, Focus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";

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
  const scannerRef = useRef<any>(null);
  const lastScanRef = useRef({ value: "", at: 0 });

  const refocusCamera = async () => {
    const stream = scannerRef.current?.getStream?.() as MediaStream | null;
    const track = stream?.getVideoTracks?.()[0];
    if (!track) return;
    try {
      await track.applyConstraints({
        advanced: [{ focusMode: "continuous" } as any],
      });
    } catch {
      // Some iOS/older Android cameras do not expose manual focus controls.
    }
  };

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
            ref={scannerRef}
            onScan={(result) => {
              if (result && result.length > 0) {
                const value = result[0].rawValue;
                const now = Date.now();
                if (value && (lastScanRef.current.value !== value || now - lastScanRef.current.at > 1500)) {
                  lastScanRef.current = { value, at: now };
                  onScanSuccess(value);
                }
              }
            }}
            onError={(error) => {
               console.warn("Scanner error:", error);
            }}
            components={{
              finder: true,
              torch: true,
              zoom: true,
            }}
            constraints={{
              facingMode: { ideal: "environment" },
              width: { ideal: 2560 },
              height: { ideal: 1440 },
              frameRate: { ideal: 30, min: 20 },
              advanced: [
                { focusMode: "continuous" } as any,
                { exposureMode: "continuous" } as any,
                { whiteBalanceMode: "continuous" } as any,
              ],
            }}
            formats={["qr_code", "data_matrix", "code_128", "code_39", "ean_13", "ean_8"]}
            retryDelay={60}
            scanDelay={250}
            startTimeoutMs={8000}
            settleDelayMs={250}
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
          <div className="mt-2 text-xs font-normal text-white/75">Tem hơi cong: đưa mã chiếm khoảng 1/3 khung và nghiêng nhẹ để tránh phản sáng.</div>
          <button type="button" onClick={refocusCamera} className="mx-auto mt-3 flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">
            <Focus className="h-3.5 w-3.5" /> Lấy nét lại
          </button>
        </div>
      </div>
    </div>
  );
}

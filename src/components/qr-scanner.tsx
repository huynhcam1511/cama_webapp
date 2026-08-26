"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, QrCode } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
  title?: string;
  instruction?: string;
}

export default function QRScanner({
  onScanSuccess,
  onClose,
  title = "Quét Mã QR Sản Phẩm",
  instruction = "Đưa mã QR trên tem sản phẩm vào khung hình để quét.",
}: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Create instance restricted to QR_CODE for maximum performance
    const html5QrCode = new Html5Qrcode("qr-reader", { verbose: false, formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ] });
    scannerRef.current = html5QrCode;
    let isStopping = false;

    let lastScannedText = "";
    let lastScannedTime = 0;

    html5QrCode.start(
      { facingMode: "environment" }, // Prefer back camera
      {
        fps: 15,
      },
      (decodedText) => {
        const now = Date.now();
        // Prevent spamming the same code within 3 seconds
        if (decodedText !== lastScannedText || now - lastScannedTime > 3000) {
          lastScannedText = decodedText;
          lastScannedTime = now;
          onScanSuccess(decodedText);
        }
      },
      (errorMessage) => {
        // Ignore scan errors, they happen every frame a QR code is not found
      }
    ).catch((err) => {
      console.error("Failed to start scanner:", err);
      setError("Không thể truy cập camera. Vui lòng cấp quyền hoặc thử lại.");
    });

    // Cleanup on unmount
    return () => {
      if (scannerRef.current && !isStopping) {
        isStopping = true;
        try {
          scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
          }).catch(e => {
            // Might error if stopped before fully started, ignore
          });
        } catch (e) {
          console.error("Sync cleanup stop error", e);
        }
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-200">
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      {/* Video Stream */}
      <div id="qr-reader" className="absolute inset-0 [&>video]:object-cover [&>video]:w-full [&>video]:h-full [&>video]:absolute [&>video]:inset-0"></div>
      
      {/* Dark Overlay with Transparent Square Box using CSS box-shadow trick */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-64 h-64 md:w-80 md:h-80 border-2 border-white/20 rounded-3xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]">
          {/* Mảng nháy scan */}
          <div className="absolute left-0 w-full h-[3px] bg-green-500 shadow-[0_0_12px_3px_rgba(34,197,94,0.8)]" style={{ animation: 'scan-line 2s ease-in-out infinite' }}></div>
          
          {/* Góc trang trí */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-3xl -m-[2px]"></div>
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-3xl -m-[2px]"></div>
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-3xl -m-[2px]"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-3xl -m-[2px]"></div>
        </div>
      </div>

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

      {/* Instruction floating at bottom */}
      <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col items-center justify-center px-6 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-md text-white text-sm md:text-base text-center font-medium px-6 py-4 rounded-3xl shadow-xl max-w-sm border border-white/10">
          {instruction}
        </div>
        
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-500/90 text-white backdrop-blur rounded-2xl text-sm font-bold w-full max-w-sm text-center shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

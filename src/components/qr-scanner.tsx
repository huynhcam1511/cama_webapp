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
    const html5QrCode = new Html5Qrcode("qr-reader", { formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ] });
    scannerRef.current = html5QrCode;
    let isStopping = false;

    let lastScannedText = "";
    let lastScannedTime = 0;

    html5QrCode.start(
      { facingMode: "environment" }, // Prefer back camera
      {
        fps: 20, // Increase scanning frequency for better responsiveness
        // No qrbox = scan the entire video frame
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <h3 className="font-bold flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-400" /> {title}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm aspect-square bg-slate-200 rounded-xl overflow-hidden relative shadow-inner border-2 border-slate-300">
            {/* The div where html5-qrcode will render the video stream */}
            <div id="qr-reader" className="w-full h-full"></div>
            
            {/* Overlay target frame - html5-qrcode adds its own, but we can style around it if needed */}
          </div>
          
          <p className="text-sm text-slate-500 mt-6 text-center font-medium">
            {instruction}<br/>
            Hệ thống sẽ tự động nhận diện.
          </p>

          {error && (
            <div className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold w-full text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

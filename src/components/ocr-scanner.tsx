"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, X, Loader2, CheckCircle2 } from "lucide-react";
import Tesseract from "tesseract.js";

interface OCRScannerProps {
  onScan: (text: string, image?: string) => void;
  onClose: () => void;
}

export default function OCRScanner({ onScan, onClose }: OCRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recognizedOptions, setRecognizedOptions] = useState<string[]>([]);

  // Khởi động Camera
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        setStream(currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Không thể truy cập Camera. Vui lòng cấp quyền.");
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Crop hình vuông
    const cropSize = Math.min(canvas.width, canvas.height) * 0.8;
    const cropX = (canvas.width - cropSize) / 2;
    const cropY = (canvas.height - cropSize) / 2;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropSize;
    cropCanvas.height = cropSize;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return null;

    cropCtx.drawImage(canvas, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);
    return cropCanvas.toDataURL('image/jpeg', 0.8);
  };

  const handleCapture = useCallback(async () => {
    if (!stream) return;
    setIsScanning(true);
    setError(null);

    try {
      const imageData = captureImage();
      if (!imageData) throw new Error("Không thể chụp ảnh");

      // Nhận diện OCR, chỉ lấy tiếng Anh và số để tránh lỗi tiếng Trung
      const worker = await Tesseract.createWorker('eng');
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-',
      });
      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();

      const words = text
        .split(/[\s\n]+/)
        .map(w => w.replace(/[^A-Za-z0-9-]/g, '').trim())
        .filter(w => w.length >= 3);

      const uniqueWords = Array.from(new Set(words));

      if (uniqueWords.length > 0) {
        if (uniqueWords.length === 1) {
          onScan(uniqueWords[0], imageData);
        } else {
          // Lưu lại imageData để pass khi user chọn
          (window as any)._lastOcrImage = imageData;
          setRecognizedOptions(uniqueWords);
        }
      } else {
        // Fallback: Nếu không nhận diện được, cho phép dùng ảnh luôn
        (window as any)._lastOcrImage = imageData;
        setError("Không nhận diện được mã số. Bạn có muốn lưu luôn ảnh mác này không?");
      }

    } catch (err) {
      console.error("OCR Error:", err);
      setError("Có lỗi xảy ra khi quét. Vui lòng thử lại.");
    } finally {
      setIsScanning(false);
    }
  }, [stream, onScan]);

  const handleUseImageOnly = () => {
    const img = (window as any)._lastOcrImage || captureImage();
    if (img) onScan("", img);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="text-center text-white mb-6 z-10">
        <h3 className="text-xl font-bold mb-2">Quét Mác Áo (OCR)</h3>
        {recognizedOptions.length > 0 ? (
          <p className="text-sm text-yellow-300 font-medium">Chọn một mã đúng nhất bên dưới</p>
        ) : (
          <p className="text-sm text-white/70">Hướng Camera sao cho mã số nằm trong khung</p>
        )}
      </div>

      {recognizedOptions.length > 0 ? (
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {recognizedOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onScan(opt)}
              className="w-full py-4 px-6 bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-800 text-lg font-bold rounded-xl transition-all shadow-sm flex items-center justify-between group"
            >
              <span className="font-mono tracking-wider">{opt}</span>
              <CheckCircle2 className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
            </button>
          ))}
          <button
            onClick={() => setRecognizedOptions([])}
            className="mt-4 py-3 w-full text-slate-500 font-medium hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Quét lại
          </button>
        </div>
      ) : (
        <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/10">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <X className="w-8 h-8" />
            </div>
            <p className="text-rose-400 font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-6 px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Overlay Overlay */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

            {/* Viewfinder Cutout */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[80%] aspect-square border-2 border-yellow-400/80 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] bg-transparent">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-yellow-400 rounded-tl-xl -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-yellow-400 rounded-tr-xl -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-yellow-400 rounded-bl-xl -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-yellow-400 rounded-br-xl -mb-1 -mr-1"></div>

                {isScanning && (
                  <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex flex-col items-center justify-center text-blue-100 rounded-xl">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-sm font-medium animate-pulse">Đang quét AI...</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      )}

      {!error && recognizedOptions.length === 0 && (
        <div className="mt-8 z-10 w-full max-w-md px-6">
          <button
            disabled={isScanning}
            onClick={handleCapture}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-95 text-lg"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Vui lòng chờ...
              </>
            ) : (
              <>
                <Camera className="w-6 h-6" />
                Chụp & Quét Chữ
              </>
            )}
          </button>

          <button
            disabled={isScanning}
            onClick={handleUseImageOnly}
            className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all disabled:opacity-50"
          >
            Chỉ lưu ảnh (Bỏ qua nhận diện)
          </button>
        </div>
      )}
    </div>
  );
}

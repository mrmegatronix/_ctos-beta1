import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        scannerRef.current = new Html5Qrcode("reader");
        await scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
            ]
          },
          (decodedText) => {
            if (scannerRef.current) {
              scannerRef.current.stop().then(() => {
                onScan(decodedText);
              }).catch(err => console.error("Failed to stop scanner", err));
            }
          },
          (errorMessage) => {
            // Ignore scan failures as they happen frequently until a barcode is focused
          }
        );
      } catch (err) {
        setError("Failed to start camera. Please ensure camera permissions are granted.");
        console.error("Scanner setup failed:", err);
      }
    };

    initializeScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl w-full max-w-md overflow-hidden relative">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-slate-100 font-bold">
            <Camera className="w-5 h-5" />
            <span>Scan Barcode</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 bg-black relative">
          <div id="reader" className="w-full min-h-[300px] overflow-hidden rounded-lg"></div>
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-red-500 bg-black/90">
              {error}
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800 text-center text-sm text-slate-400">
          Position the barcode inside the frame to scan.
        </div>
      </div>
    </div>
  );
};

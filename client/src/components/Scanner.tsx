import React, { useRef, useEffect, useState } from 'react';
import { BarcodeScanner } from '@/lib/scanner';
import { Camera, CameraOff } from 'lucide-react';

interface ScannerProps {
  onResult: (barcode: string) => void;
  onError?: (error: Error) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onResult, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<BarcodeScanner | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    scannerRef.current = new BarcodeScanner();
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stopScanning();
      }
      // Clean up video streams on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current || !scannerRef.current) return;

    try {
      setError(null);
      await scannerRef.current.startScanning(
        videoRef.current,
        (barcode) => {
          onResult(barcode);
          // Brief pause after successful scan to prevent multiple scans of same item
          scannerRef.current?.stopScanning();
          setTimeout(() => {
            if (scannerRef.current && !scannerRef.current.isScanning()) {
              startScanning();
            }
          }, 1000);
        },
        (err) => {
          setError('Scanner error occurred');
          onError?.(err);
        }
      );
      setIsActive(true);
    } catch (err) {
      setError('Camera access denied or not available');
      onError?.(err as Error);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stopScanning();
      setIsActive(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative bg-gray-900 rounded-xl overflow-hidden h-48">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        
        {/* Scanner Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-32 border-2 border-primary-400 rounded-lg relative">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-primary-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-primary-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-primary-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-primary-400 rounded-br-lg"></div>
            
            {/* Scanning line */}
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-1 bg-red-500 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center">
          <Camera className="w-3 h-3 mr-1" />
          {isActive ? 'Auto-scan enabled' : 'Camera inactive'}
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute top-2 left-2 right-2 bg-red-500 text-white text-sm px-3 py-2 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Control buttons */}
      <div className="flex justify-center mt-4 space-x-4">
        {!isActive ? (
          <button
            onClick={startScanning}
            data-testid="button-start-scanner"
            className="bg-primary text-white px-6 py-2 rounded-lg flex items-center touch-feedback"
          >
            <Camera className="w-4 h-4 mr-2" />
            Start Scanner
          </button>
        ) : (
          <button
            onClick={stopScanning}
            data-testid="button-stop-scanner"
            className="bg-red-500 text-white px-6 py-2 rounded-lg flex items-center touch-feedback"
          >
            <CameraOff className="w-4 h-4 mr-2" />
            Stop Scanner
          </button>
        )}
      </div>
    </div>
  );
};

export default Scanner;

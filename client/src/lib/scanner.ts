import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

export class BarcodeScanner {
  private codeReader: BrowserMultiFormatReader;
  private scanning = false;

  constructor() {
    this.codeReader = new BrowserMultiFormatReader();
  }

  async startScanning(
    videoElement: HTMLVideoElement,
    onResult: (barcode: string) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (this.scanning) return;

    this.scanning = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      videoElement.srcObject = stream;
      videoElement.play();

      // Continuous scanning
      const scan = async () => {
        if (!this.scanning) return;

        try {
          const result = await this.codeReader.decodeFromVideoElement(videoElement);
          if (result) {
            onResult(result.getText());
          }
        } catch (error) {
          if (!(error instanceof NotFoundException)) {
            onError?.(error as Error);
          }
        }

        setTimeout(scan, 100); // Scan every 100ms
      };

      scan();
    } catch (error) {
      this.scanning = false;
      onError?.(error as Error);
    }
  }

  stopScanning(): void {
    this.scanning = false;
    try {
      this.codeReader.reset();
      // Also stop all media streams to prevent memory leaks
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
        }
      });
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }
  }

  isScanning(): boolean {
    return this.scanning;
  }
}

import { useState, useRef } from 'react';
import { Upload, Camera, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Bill } from '../types';

interface UploadStageProps {
  onUploadComplete: (bill: Bill) => void;
}

export default function UploadStage({ onUploadComplete }: UploadStageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG).');
      return;
    }
    setError(null);
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to parse image');
      }

      const bill: Bill = await response.json();
      onUploadComplete(bill);
    } catch (err: any) {
      setError(err.message || 'An error occurred while uploading.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Snap Your Bill</h2>
          <p className="text-text-secondary dark:text-text-secondary">Take a photo or upload a receipt and let AI do the heavy lifting.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Take Photo Button */}
          <div
            onClick={() => !isLoading && cameraInputRef.current?.click()}
            className={`
              relative group overflow-hidden rounded-3xl border border-border p-8 text-center cursor-pointer transition-all duration-300 glass-panel hover:border-brand-primary/50 hover:bg-surface-tonal
              ${isLoading ? 'pointer-events-none opacity-80' : ''}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-subtle-bg border border-border flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary/10 group-hover:border-brand-primary/30 transition-all duration-300 shadow-sm">
                <Camera size={28} className="text-brand-primary" />
              </div>
              <div>
                <p className="text-base font-semibold text-text-primary">Take Photo</p>
                <p className="text-xs text-text-secondary mt-1">Use device camera</p>
              </div>
            </div>
          </div>

          {/* Upload File Button */}
          <div
            onClick={() => !isLoading && fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`
              relative group overflow-hidden rounded-3xl border border-dashed p-8 text-center cursor-pointer transition-all duration-300 glass-panel
              ${isDragging ? 'border-brand-primary bg-brand-primary/10 shadow-[0_0_20px_rgba(0,240,255,0.3)]' : 'border-border hover:border-brand-primary/50 hover:bg-surface-tonal'}
              ${isLoading ? 'pointer-events-none opacity-80' : ''}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-subtle-bg border border-border flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary/10 group-hover:border-brand-primary/30 transition-all duration-300 shadow-sm">
                <Upload size={28} className="text-brand-primary" />
              </div>
              <div>
                <p className="text-base font-semibold text-text-primary">Upload File</p>
                <p className="text-xs text-text-secondary mt-1">Click or drag image</p>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400"
            >
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-surface-bg/80 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-6 p-8 rounded-3xl glass-panel max-w-sm w-full mx-4 border border-brand-primary/30 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              >
                <Loader2 size={64} className="text-brand-primary drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]" />
              </motion.div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-text-primary">Analyzing Receipt</h3>
                <p className="text-text-secondary text-sm">Gemini AI is extracting items, quantities, and prices...</p>
              </div>
              
              <div className="w-full space-y-3 mt-4">
                <div className="h-4 bg-subtle-bg rounded-full w-full animate-pulse" />
                <div className="h-4 bg-subtle-bg rounded-full w-5/6 animate-pulse" />
                <div className="h-4 bg-subtle-bg rounded-full w-4/6 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

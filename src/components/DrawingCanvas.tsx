import React, { useRef, useEffect, useState } from 'react';
import { X, Check, RotateCcw, Eraser, Pencil } from 'lucide-react';
import { motion } from 'motion/react';

interface DrawingCanvasProps {
  initialImage?: string;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

export default function DrawingCanvas({ initialImage, onSave, onClose }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#BF00FF');
  const [lineWidth, setLineWidth] = useState(3);
  const [mode, setMode] = useState<'pencil' | 'eraser'>('pencil');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const currentData = canvas.toDataURL();
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Restore content after resize
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = currentData;
      }
    };

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (initialImage) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = initialImage;
      }
    }

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [initialImage]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = mode === 'eraser' ? '#1a1a1a' : color; // Assuming dark bg
    ctx.lineWidth = lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
      <div className="p-4 flex justify-between items-center bg-black/50 border-b border-white/10">
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => setMode('pencil')}
              className={`p-2 rounded-lg ${mode === 'pencil' ? 'bg-[var(--color-accent-notes)] text-white' : 'text-gray-400'}`}
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setMode('eraser')}
              className={`p-2 rounded-lg ${mode === 'eraser' ? 'bg-[var(--color-accent-notes)] text-white' : 'text-gray-400'}`}
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
          />
          <button onClick={clearCanvas} className="p-2 text-gray-400 hover:text-white">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
        <button onClick={handleSave} className="p-2 text-[var(--color-accent-notes)] hover:text-white">
          <Check className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative bg-[#1a1a1a] cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 touch-none"
        />
      </div>
      
      <div className="p-4 bg-black/50 border-t border-white/10 flex justify-center gap-4">
        {[2, 4, 8, 12, 16].map(w => (
          <button
            key={w}
            onClick={() => setLineWidth(w)}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${lineWidth === w ? 'border-[var(--color-accent-notes)] scale-110' : 'border-white/20'}`}
          >
            <div className="bg-white rounded-full" style={{ width: w, height: w }} />
          </button>
        ))}
      </div>
    </div>
  );
}

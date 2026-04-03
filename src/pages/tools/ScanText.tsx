import { useState, useRef, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Camera, Image as ImageIcon, Copy, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';

export default function ScanText() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process image
    await scanImage(file);
  };

  const scanImage = async (file: File) => {
    setIsScanning(true);
    setExtractedText('');
    setCopied(false);

    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey || '' });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: 'Extract all the text from this image. Return only the extracted text, nothing else. If there is no text, return an empty string.' },
            { inlineData: { data: base64Data, mimeType: file.type } }
          ]
        }
      });

      setExtractedText(response.text || t('No text found in the image.'));
    } catch (error) {
      console.error('Error scanning text:', error);
      setExtractedText(t('Error scanning text. Please try again. Make sure Gemini API key is configured.'));
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6">
      <div 
        className="flex items-center gap-2 mb-6 cursor-pointer group w-fit"
        onClick={() => navigate('/tools')}
      >
        <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-all duration-300">
          <ChevronLeft className="w-4 h-4 text-[var(--color-accent-notes)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-accent-notes)] drop-shadow-[0_0_12px_rgba(191,0,255,0.3)]">{t('Scan Text')}</h2>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto scrollbar-hide pb-28">
        
        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 py-6 rounded-2xl glass flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all duration-300 border border-white/10 group shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          >
            <div className="p-3 rounded-xl bg-[var(--color-accent-notes)]/10 text-[var(--color-accent-notes)] group-hover:shadow-[0_0_15px_rgba(191,0,255,0.3)] transition-all">
              <Camera className="w-8 h-8" />
            </div>
            <span className="font-bold text-sm text-white/90">{t('Camera')}</span>
          </button>
          <button 
            onClick={() => galleryInputRef.current?.click()}
            className="flex-1 py-6 rounded-2xl glass flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all duration-300 border border-white/10 group shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          >
            <div className="p-3 rounded-xl bg-[var(--color-accent-notes)]/10 text-[var(--color-accent-notes)] group-hover:shadow-[0_0_15px_rgba(191,0,255,0.3)] transition-all">
              <ImageIcon className="w-8 h-8" />
            </div>
            <span className="font-bold text-sm text-white/90">{t('Gallery')}</span>
          </button>
        </div>

        {/* Hidden Inputs */}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={cameraInputRef} 
          className="hidden" 
          onChange={handleImageSelect} 
        />
        <input 
          type="file" 
          accept="image/*" 
          ref={galleryInputRef} 
          className="hidden" 
          onChange={handleImageSelect} 
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="w-full h-56 rounded-[2rem] overflow-hidden glass relative flex items-center justify-center border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
            {isScanning && (
              <div className="absolute inset-0 bg-[#0a1128]/60 backdrop-blur-md flex flex-col items-center justify-center text-white z-20">
                <div className="relative">
                  <Loader2 className="w-10 h-10 animate-spin mb-3 text-[var(--color-accent-notes)]" />
                  <div className="absolute inset-0 blur-xl bg-[var(--color-accent-notes)]/30 animate-pulse" />
                </div>
                <span className="font-bold text-base tracking-wider">{t('Scanning...')}</span>
              </div>
            )}
          </div>
        )}

        {/* Extracted Text */}
        {(extractedText || isScanning) && (
          <div className="flex-1 flex flex-col glass rounded-[2rem] p-6 relative border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-white/90">{t('Extracted Text')}</h3>
              <button 
                onClick={handleCopy}
                disabled={isScanning || !extractedText}
                className="p-2.5 rounded-xl bg-[var(--color-accent-notes)]/10 text-[var(--color-accent-notes)] hover:bg-[var(--color-accent-notes)]/20 transition-all disabled:opacity-50 border border-[var(--color-accent-notes)]/20"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex-1 bg-black/40 rounded-xl p-4 overflow-y-auto border border-white/5 min-h-[150px]">
              {isScanning ? (
                <div className="h-full flex items-center justify-center text-gray-600 font-medium italic text-sm">
                  {t('Extracting text...')}
                </div>
              ) : (
                <p className="text-white/90 text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {extractedText}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

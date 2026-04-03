import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QRGenerator() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const qrRef = useRef<SVGSVGElement>(null);

  const downloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "qrcode.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6">
      <div 
        className="flex items-center gap-2 mb-6 cursor-pointer group w-fit"
        onClick={() => navigate('/tools')}
      >
        <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-all duration-300">
          <ChevronLeft className="w-4 h-4 text-[var(--color-accent-conv)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-accent-conv)] drop-shadow-[0_0_12px_rgba(0,242,255,0.3)]">{t('QR Generator')}</h2>
      </div>

      <div className="flex-1 flex flex-col items-center gap-8 pb-28">
        <div className="w-full relative group">
          <input
            type="text"
            placeholder="Enter text or URL"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-4 rounded-2xl glass outline-none border border-white/5 focus:border-[var(--color-accent-conv)]/50 transition-all text-sm text-white placeholder-gray-600 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
          />
          <div className="absolute inset-0 rounded-2xl bg-[var(--color-accent-conv)]/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
        </div>

        <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative">
          <div className="absolute inset-0 bg-[var(--color-accent-conv)]/5 blur-2xl rounded-full" />
          <div className="relative z-10 bg-white p-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <QRCodeSVG 
              value={text || 'https://allexpert.app'} 
              size={180}
              level="H"
              includeMargin={true}
              ref={qrRef}
            />
          </div>
        </div>

        <button
          onClick={downloadQR}
          disabled={!text}
          className="w-full py-4 rounded-2xl bg-[var(--color-accent-conv)] text-white font-bold text-base tracking-widest flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all hover:scale-[1.02] active:scale-95"
        >
          <Download className="w-5 h-5" />
          {t('DOWNLOAD')}
        </button>
      </div>
    </div>
  );
}

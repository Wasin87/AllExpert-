import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  QrCode, 
  ChevronLeft, 
  Globe, 
  Type, 
  Wifi, 
  Mail, 
  Phone, 
  MessageSquare,
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Palette, 
  Sliders,
  Eye,
  EyeOff,
  ChevronDown
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export type QRMode = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms';

interface ColorPreset {
  name: string;
  fg: string;
  bg: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { name: 'Cyber Neon', fg: '#00f2ff', bg: '#0b1120' },
  { name: 'Neon Violet', fg: '#c084fc', bg: '#130c25' },
  { name: 'Emerald', fg: '#10b981', bg: '#061a14' },
  { name: 'Sunset', fg: '#f97316', bg: '#1a0d08' },
  { name: 'Gold Luxury', fg: '#facc15', bg: '#18181b' },
];

export default function QRCodeGenerator() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode state (Default: url)
  const paramMode = searchParams.get('mode') as QRMode;
  const initialMode: QRMode = ['url', 'text', 'wifi', 'email', 'phone', 'sms'].includes(paramMode) 
    ? paramMode 
    : 'url';
  const initialText = searchParams.get('text') || '';

  const [mode, setMode] = useState<QRMode>(initialMode);

  // Field states with safe defined string fallbacks
  const [urlInput, setUrlInput] = useState(
    initialText && /^https?:\/\//i.test(initialText) ? initialText : 'https://'
  );
  const [textInput, setTextInput] = useState(
    initialText && !/^https?:\/\//i.test(initialText) ? initialText : 'Hello from AllExpert!'
  );
  
  // WiFi states
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [showWifiPassword, setShowWifiPassword] = useState(false);

  // Email states
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Phone states
  const [phoneNumber, setPhoneNumber] = useState('');

  // SMS states
  const [smsNumber, setSmsNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  // Customization
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [includeMargin, setIncludeMargin] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [showStylePanel, setShowStylePanel] = useState(false); // Collapsible on mobile

  // Status
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const qrCanvasContainerRef = useRef<HTMLDivElement>(null);

  // If initial text is passed from URL query params
  useEffect(() => {
    if (initialText) {
      if (/^https?:\/\//i.test(initialText)) {
        setMode('url');
        setUrlInput(initialText);
      } else {
        setMode('text');
        setTextInput(initialText);
      }
    }
  }, [initialText]);

  // Compute actual QR payload
  const getQrValue = (): string => {
    switch (mode) {
      case 'url': {
        const trimmed = urlInput.trim();
        if (!trimmed || trimmed === 'https://' || trimmed === 'http://') {
          return 'https://allexpert.app';
        }
        if (!/^https?:\/\//i.test(trimmed)) {
          return `https://${trimmed}`;
        }
        return trimmed;
      }
      case 'wifi': {
        const ssid = wifiSsid.trim();
        if (!ssid) return 'WIFI:S:MyNetwork;T:WPA;P:password;;';
        const enc = wifiEncryption === 'nopass' ? 'nopass' : wifiEncryption;
        const pass = wifiEncryption === 'nopass' ? '' : wifiPassword;
        const hidden = wifiHidden ? 'H:true;' : '';
        return `WIFI:T:${enc};S:${ssid};P:${pass};${hidden};`;
      }
      case 'email': {
        const to = emailTo.trim();
        if (!to) return 'mailto:info@example.com';
        const params: string[] = [];
        if (emailSubject.trim()) params.push(`subject=${encodeURIComponent(emailSubject.trim())}`);
        if (emailBody.trim()) params.push(`body=${encodeURIComponent(emailBody.trim())}`);
        const query = params.length > 0 ? `?${params.join('&')}` : '';
        return `mailto:${to}${query}`;
      }
      case 'phone': {
        const phone = phoneNumber.trim().replace(/\s+/g, '');
        if (!phone) return 'tel:+1234567890';
        return `tel:${phone}`;
      }
      case 'sms': {
        const phone = smsNumber.trim().replace(/\s+/g, '');
        const msg = smsMessage.trim();
        if (!phone) return 'smsto:+1234567890:Hello';
        return `smsto:${phone}:${msg}`;
      }
      case 'text':
      default:
        return textInput.trim() || 'AllExpert QR Code';
    }
  };

  const qrValue = getQrValue();

  // Download High-Resolution PNG (1024x1024 crisp vector-like canvas)
  const handleDownloadPng = () => {
    const canvas = qrCanvasContainerRef.current?.querySelector('canvas');
    if (!canvas) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

    const pngUrl = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `allexpert-qr-${mode}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloadSuccess('PNG Downloaded (High-Res 1024px)!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Download High-Resolution JPG (1024x1024 crisp canvas)
  const handleDownloadJpg = () => {
    const canvas = qrCanvasContainerRef.current?.querySelector('canvas');
    if (!canvas) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

    const jpgUrl = exportCanvas.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = jpgUrl;
    a.download = `allexpert-qr-${mode}-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloadSuccess('JPG Downloaded (High-Res 1024px)!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Copy QR Image to Clipboard
  const handleCopyImage = async () => {
    const canvas = qrCanvasContainerRef.current?.querySelector('canvas');
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2500);
        }
      }, 'image/png');
    } catch {
      handleCopyText();
    }
  };

  // Copy Payload Text
  const handleCopyText = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Apply color preset
  const handleApplyPreset = (preset: ColorPreset) => {
    setFgColor(preset.fg);
    setBgColor(preset.bg);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-24 md:pb-12 text-white">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div 
          className="flex items-center gap-2.5 cursor-pointer group w-fit"
          onClick={() => navigate('/tools')}
        >
          <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-all duration-300">
            <ChevronLeft className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center gap-2">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 shrink-0" />
              <span>{t('QR Code Generator')}</span>
            </h1>
            <p className="text-xs text-gray-400">
              Create instant, high-resolution offline QR codes for any device
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/tools/shorturl')}
          className="self-start sm:self-center px-3.5 py-2 rounded-xl glass hover:bg-white/10 text-violet-300 hover:text-violet-200 border border-violet-500/20 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
        >
          <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
          <span>URL Shortener</span>
        </button>
      </div>

      {/* Main Responsive Grid Layout:
          - Desktop (lg): 2 columns side-by-side (Left: Inputs & Styles, Right: Sticky Live Preview)
          - Mobile (< lg): Stacked in natural flow (Inputs -> Live QR Preview with downloads -> Styles)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (Desktop: span 7, Mobile: order-1) */}
        <div className="lg:col-span-7 space-y-5 order-1">
          {/* 1. Mode Selector Tabs Card */}
          <div className="glass rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-3 px-0.5">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                Select QR Type
              </span>
              <span className="text-[11px] text-cyan-300 font-semibold capitalize bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                {mode === 'url' ? 'Website URL' : mode.toUpperCase()}
              </span>
            </div>

            {/* Responsive 3x2 Grid for Mode Tabs with optimal touch targets (>= 48px) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {/* URL */}
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`min-h-[52px] flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-xs font-bold gap-1 active:scale-95 ${
                  mode === 'url'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'glass border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="text-[11px] sm:text-xs">URL</span>
              </button>

              {/* Text */}
              <button
                type="button"
                onClick={() => setMode('text')}
                className={`min-h-[52px] flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-xs font-bold gap-1 active:scale-95 ${
                  mode === 'text'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'glass border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Type className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="text-[11px] sm:text-xs">Text</span>
              </button>

              {/* Wi-Fi */}
              <button
                type="button"
                onClick={() => setMode('wifi')}
                className={`min-h-[52px] flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-xs font-bold gap-1 active:scale-95 ${
                  mode === 'wifi'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'glass border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Wifi className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="text-[11px] sm:text-xs">Wi-Fi</span>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={() => setMode('email')}
                className={`min-h-[52px] flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-xs font-bold gap-1 active:scale-95 ${
                  mode === 'email'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'glass border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="text-[11px] sm:text-xs">Email</span>
              </button>

              {/* Phone */}
              <button
                type="button"
                onClick={() => setMode('phone')}
                className={`min-h-[52px] flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-xs font-bold gap-1 active:scale-95 ${
                  mode === 'phone'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'glass border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="text-[11px] sm:text-xs">Phone</span>
              </button>

              {/* SMS */}
              <button
                type="button"
                onClick={() => setMode('sms')}
                className={`min-h-[52px] flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-xs font-bold gap-1 active:scale-95 ${
                  mode === 'sms'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'glass border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="text-[11px] sm:text-xs">SMS</span>
              </button>
            </div>
          </div>

          {/* 2. Mode Input Content Card */}
          <div className="glass rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-4">
            {/* 1. URL MODE */}
            {mode === 'url' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                    Enter Website URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setUrlInput('https://')}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Reset
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="url"
                    value={urlInput || ''}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Scanned with any phone camera, opens the link directly in their browser.
                </p>
              </div>
            )}

            {/* 2. TEXT MODE */}
            {mode === 'text' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-cyan-400 shrink-0" />
                    Enter Plain Text
                  </label>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {textInput.length} chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={textInput || ''}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type any message, address, serial number, or note..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 transition-all font-sans resize-none"
                />
                <p className="text-[11px] text-gray-400">
                  Scanned phones will instantly display this exact text message.
                </p>
              </div>
            )}

            {/* 3. WIFI MODE */}
            {mode === 'wifi' && (
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-cyan-400 shrink-0" />
                  Wi-Fi Network Configuration
                </label>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">Network Name (SSID)</span>
                    <input
                      type="text"
                      value={wifiSsid || ''}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="e.g. Home_WiFi_5G"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 block mb-1">Security Type</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['WPA', 'WEP', 'nopass'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setWifiEncryption(type)}
                          className={`min-h-[40px] py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                            wifiEncryption === type
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'glass border-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          {type === 'WPA' ? 'WPA/WPA2' : type === 'WEP' ? 'WEP' : 'None'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {wifiEncryption !== 'nopass' && (
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">Wi-Fi Password</span>
                      <div className="relative">
                        <input
                          type={showWifiPassword ? 'text' : 'password'}
                          value={wifiPassword || ''}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="Network password"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowWifiPassword(!showWifiPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                          title={showWifiPassword ? 'Hide password' : 'Show password'}
                        >
                          {showWifiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2.5 cursor-pointer pt-1 text-xs text-gray-300 select-none">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
                    />
                    <span>Hidden Network (SSID is not broadcast)</span>
                  </label>
                </div>

                <p className="text-[11px] text-gray-400">
                  Guests scan this QR with their phone camera to connect to Wi-Fi instantly without typing passwords!
                </p>
              </div>
            )}

            {/* 4. EMAIL MODE */}
            {mode === 'email' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                  Email Message Setup
                </label>

                <div>
                  <span className="text-xs text-gray-400 block mb-1">Recipient Email</span>
                  <input
                    type="email"
                    value={emailTo || ''}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 transition-all font-mono"
                  />
                </div>

                <div>
                  <span className="text-xs text-gray-400 block mb-1">Subject (Optional)</span>
                  <input
                    type="text"
                    value={emailSubject || ''}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Inquiry / Feedback"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

                <div>
                  <span className="text-xs text-gray-400 block mb-1">Message Body (Optional)</span>
                  <textarea
                    rows={3}
                    value={emailBody || ''}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Pre-filled email message..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 transition-all resize-none"
                  />
                </div>

                <p className="text-[11px] text-gray-400">
                  Scanning automatically opens default email client with recipient and subject pre-filled.
                </p>
              </div>
            )}

            {/* 5. PHONE MODE */}
            {mode === 'phone' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                  Phone Quick-Dial
                </label>

                <div>
                  <span className="text-xs text-gray-400 block mb-1">Phone Number (with country code)</span>
                  <input
                    type="tel"
                    value={phoneNumber || ''}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 transition-all font-mono"
                  />
                </div>

                <p className="text-[11px] text-gray-400">
                  Scanning triggers an instant prompt on smartphones to place a call to this number.
                </p>
              </div>
            )}

            {/* 6. SMS MODE */}
            {mode === 'sms' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                  SMS Direct Text
                </label>

                <div>
                  <span className="text-xs text-gray-400 block mb-1">Phone Number</span>
                  <input
                    type="tel"
                    value={smsNumber || ''}
                    onChange={(e) => setSmsNumber(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 transition-all font-mono"
                  />
                </div>

                <div>
                  <span className="text-xs text-gray-400 block mb-1">Pre-filled Message</span>
                  <textarea
                    rows={3}
                    value={smsMessage || ''}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="Hello! I would like to inquire about..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-400 transition-all resize-none"
                  />
                </div>

                <p className="text-[11px] text-gray-400">
                  Scanning opens SMS messenger with recipient and body pre-typed, ready to send.
                </p>
              </div>
            )}
          </div>

          {/* 3. Style & Color Customization (On desktop: always visible. On mobile: accordion/card) */}
          <div className="glass rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-4">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => setShowStylePanel(!showStylePanel)}
              >
                <Palette className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Color & Appearance
                </span>
                <span className="lg:hidden text-gray-400">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showStylePanel ? 'rotate-180' : ''}`} />
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFgColor('#000000');
                  setBgColor('#ffffff');
                  setErrorLevel('H');
                  setIncludeMargin(true);
                  setShowLogo(true);
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Reset
              </button>
            </div>

            {/* Content: Visible on desktop always, or when toggled on mobile */}
            <div className={`space-y-4 ${showStylePanel ? 'block' : 'hidden lg:block'}`}>
              {/* Presets */}
              <div>
                <span className="text-xs text-gray-400 block mb-2 font-medium">Color Themes</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="p-2 rounded-xl border border-white/10 hover:border-white/30 flex flex-col items-center gap-1.5 transition-all text-[11px] active:scale-95"
                      style={{ backgroundColor: preset.bg }}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-black/20 shadow-sm shrink-0"
                        style={{ backgroundColor: preset.fg }}
                      />
                      <span
                        className="font-bold text-[10px] truncate max-w-full"
                        style={{ color: preset.fg }}
                      >
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Hex Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-xs text-gray-300 font-medium">QR Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor || '#000000'}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono uppercase text-gray-300">{fgColor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-xs text-gray-300 font-medium">Background Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor || '#ffffff'}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono uppercase text-gray-300">{bgColor}</span>
                  </div>
                </div>
              </div>

              {/* Error correction & Logo Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
                  <span className="text-xs text-gray-400 block mb-1 font-medium">Error Correction</span>
                  <select
                    value={errorLevel || 'H'}
                    onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="L">L (7% Recovery)</option>
                    <option value="M">M (15% Standard)</option>
                    <option value="Q">Q (25% High)</option>
                    <option value="H">H (30% Best & Logo)</option>
                  </select>
                </div>

                <label className="min-h-[50px] p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between cursor-pointer select-none">
                  <div>
                    <span className="text-xs text-white font-medium block">Center Badge</span>
                    <span className="text-[10px] text-gray-400">AllExpert logo mark</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="w-4 h-4 rounded accent-cyan-400 cursor-pointer shrink-0"
                  />
                </label>

                <label className="min-h-[50px] p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between cursor-pointer select-none">
                  <div>
                    <span className="text-xs text-white font-medium block">White Margin</span>
                    <span className="text-[10px] text-gray-400">Quiet scan border</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeMargin}
                    onChange={(e) => setIncludeMargin(e.target.checked)}
                    className="w-4 h-4 rounded accent-cyan-400 cursor-pointer shrink-0"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live QR Preview & Export Controls 
            - On desktop (lg): Span 5, Sticky top-4
            - On mobile: Appears right after inputs (order-2) for instant visual feedback!
        */}
        <div className="lg:col-span-5 order-2 lg:sticky lg:top-4">
          <div className="glass rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-4 sm:space-y-5 text-center">
            {/* Header / Status */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 shrink-0" />
                Live QR Preview
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <Check className="w-3 h-3 shrink-0" /> Ready to Scan
              </span>
            </div>

            {/* QR Canvas Box: Fully responsive, auto-scales down on mobile without overflow */}
            <div className="flex justify-center p-1 sm:p-2">
              <div 
                ref={qrCanvasContainerRef}
                className="p-3 sm:p-4 rounded-2xl shadow-2xl transition-all duration-300 inline-block border border-white/10 max-w-full overflow-hidden"
                style={{ backgroundColor: bgColor }}
              >
                {/* Responsive container box: 200px on narrow mobile, 256px on sm, 280px on md/lg */}
                <div className="w-[200px] h-[200px] xs:w-[240px] xs:h-[240px] sm:w-[260px] sm:h-[260px] md:w-[280px] md:h-[280px] max-w-full flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:h-auto [&>canvas]:object-contain">
                  <QRCodeCanvas
                    value={qrValue}
                    size={320}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    level={errorLevel}
                    includeMargin={includeMargin}
                    style={{ width: '100%', height: 'auto', maxWidth: '100%', display: 'block' }}
                    imageSettings={
                      showLogo && errorLevel === 'H'
                        ? {
                            src: '/favicon.svg',
                            x: undefined,
                            y: undefined,
                            height: 38,
                            width: 38,
                            excavate: true,
                          }
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>

            {/* Quick Payload Info (Responsive with break-all to prevent horizontal overflow) */}
            <div className="bg-black/40 rounded-xl p-3 text-left border border-white/5 space-y-1 overflow-hidden">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span className="font-semibold uppercase tracking-wider">Payload:</span>
                <span className="text-[10px] text-cyan-400 font-mono">{mode.toUpperCase()}</span>
              </div>
              <p className="text-xs font-mono text-gray-200 truncate select-all">
                {qrValue}
              </p>
            </div>

            {/* High-Resolution Download Buttons */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="min-h-[44px] py-2.5 sm:py-3 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Download PNG</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJpg}
                className="min-h-[44px] py-2.5 sm:py-3 px-3 rounded-xl glass hover:bg-white/10 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Download className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Download JPG</span>
              </button>
            </div>

            {/* Copy Actions */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleCopyImage}
                className="min-h-[40px] py-2 px-2.5 sm:px-3 rounded-xl glass hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                {copiedImage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Copied Image!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    <span>Copy Image</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="min-h-[40px] py-2 px-2.5 sm:px-3 rounded-xl glass hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Copied Text!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            {/* Download Toast Notification */}
            {downloadSuccess && (
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-fade-in">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{downloadSuccess}</span>
              </div>
            )}

            {/* Direct Test Link for URL mode */}
            {mode === 'url' && qrValue.startsWith('http') && (
              <a
                href={qrValue}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold pt-1 transition-colors hover:underline"
              >
                <span>Test opening URL in new tab</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

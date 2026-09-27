import { useState, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Link2, 
  ChevronLeft, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  BarChart2, 
  ClipboardPaste,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export interface ShortenedUrlItem {
  id: string;
  slug: string;
  longUrl: string;
  shortUrl: string;
  internalShortUrl: string;
  createdAt: number;
  clicks: number;
}

export default function ShortUrl() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<ShortenedUrlItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [history, setHistory] = useState<ShortenedUrlItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('allexpert_short_urls');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load short URLs history', e);
    }
  }, []);

  // Save history
  const saveHistory = (items: ShortenedUrlItem[]) => {
    setHistory(items);
    localStorage.setItem('allexpert_short_urls', JSON.stringify(items));
  };

  // Generate unique random slug
  const generateSlug = (length = 6) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Format and validate URL
  const formatUrl = (input: string): string => {
    let clean = input.trim();
    if (!clean) return '';
    if (!/^https?:\/\//i.test(clean)) {
      clean = `https://${clean}`;
    }
    return clean;
  };

  // Handle URL Shortening
  const handleShorten = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const formatted = formatUrl(longUrl);
    if (!formatted || formatted === 'https://') {
      setError('Please enter a valid URL to shorten.');
      return;
    }

    try {
      new URL(formatted);
    } catch {
      setError('Invalid URL format. Please check the web address.');
      return;
    }

    setLoading(true);

    // Format and sanitize target URL
    let universalShortUrl = '';
    const trimmedAlias = customAlias.trim().replace(/[^a-zA-Z0-9-_]/g, '');

    if (trimmedAlias) {
      // 1. Try is.gd with custom alias
      try {
        const isGdUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(formatted)}&shorturl=${encodeURIComponent(trimmedAlias)}`;
        const res = await fetch(isGdUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && data.shorturl) {
            universalShortUrl = data.shorturl;
          }
        }
      } catch {
        // proceed to spoo.me
      }

      // 2. Try spoo.me with custom alias
      if (!universalShortUrl) {
        try {
          const res = await fetch('https://spoo.me/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
            body: `url=${encodeURIComponent(formatted)}&alias=${encodeURIComponent(trimmedAlias)}`
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.short_url) {
              universalShortUrl = data.short_url.replace(/^http:/, 'https:');
            } else if (data && data.AliasError) {
              setError(`Custom alias "${trimmedAlias}" is already in use by someone else. Please try another alias or leave it empty to auto-generate.`);
              setLoading(false);
              return;
            }
          }
        } catch {
          // proceed
        }
      }

      // If user provided a custom alias but both services couldn't claim it
      if (!universalShortUrl) {
        setError(`Custom alias "${trimmedAlias}" could not be reserved (it may already be in use). Please try another alias or leave it blank.`);
        setLoading(false);
        return;
      }
    } else {
      // Auto-generated short URL (no custom alias)
      // Step 1: Try is.gd
      try {
        const isGdUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(formatted)}`;
        const res = await fetch(isGdUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && data.shorturl) {
            universalShortUrl = data.shorturl;
          }
        }
      } catch {
        // proceed
      }

      // Step 2: Try spoo.me
      if (!universalShortUrl) {
        try {
          const res = await fetch('https://spoo.me/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
            body: `url=${encodeURIComponent(formatted)}`
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.short_url) {
              universalShortUrl = data.short_url.replace(/^http:/, 'https:');
            }
          }
        } catch {
          // proceed
        }
      }

      // Step 3: Try TinyURL via CORS proxy
      if (!universalShortUrl) {
        try {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(formatted)}`)}`;
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const text = await res.text();
            if (text && text.startsWith('http')) {
              universalShortUrl = text.trim();
            }
          }
        } catch {
          // proceed
        }
      }
    }

    if (!universalShortUrl) {
      setError('Could not connect to URL shortening service. Please check your internet connection and try again.');
      setLoading(false);
      return;
    }

    const effectiveSlug = trimmedAlias || universalShortUrl.split('/').pop() || generateSlug(6);
    const internalShortUrl = universalShortUrl;

    const newItem: ShortenedUrlItem = {
      id: `${Date.now()}_${effectiveSlug}`,
      slug: effectiveSlug,
      longUrl: formatted,
      shortUrl: universalShortUrl,
      internalShortUrl,
      createdAt: Date.now(),
      clicks: 0,
    };

    // Prepend to history
    const updated = [newItem, ...history.filter(item => item.shortUrl !== universalShortUrl)];
    saveHistory(updated);
    setLatestResult(newItem);
    setLongUrl('');
    setCustomAlias('');
    setLoading(false);
  };

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setLongUrl(text);
      }
    } catch {
      // fallback
    }
  };

  // Delete item from history
  const handleDelete = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    saveHistory(updated);
    if (latestResult?.id === id) {
      setLatestResult(null);
    }
  };

  // Clear all history
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your shortened URLs history?')) {
      saveHistory([]);
      setLatestResult(null);
    }
  };

  // Calculate length reduction
  const calculateSavings = (orig: string, short: string) => {
    const saved = orig.length - short.length;
    const percent = Math.round((saved / orig.length) * 100);
    return { saved: Math.max(0, saved), percent: Math.max(0, percent) };
  };

  return (
    <div className="flex flex-col min-h-full bg-[var(--bg)] p-4 md:p-6 pb-32">
      {/* Header */}
      <div 
        className="flex items-center gap-2 mb-6 cursor-pointer group w-fit"
        onClick={() => navigate('/tools')}
      >
        <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-all duration-300">
          <ChevronLeft className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-violet-400 drop-shadow-[0_0_12px_rgba(167,139,250,0.3)]">
            {t('URL Shortener')}
          </h2>
          <p className="text-xs text-gray-400">Convert long, clumsy web links into clean, fast, and trackable short URLs</p>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Main Shortener Card */}
        <div className="glass rounded-[2rem] p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-5">
          <form onSubmit={handleShorten} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-violet-400" />
                  Enter Long URL
                </label>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={longUrl || ''}
                  onChange={(e) => setLongUrl(e.target.value)}
                  placeholder="https://example.com/very/long/path/with?parameters=true"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-400 transition-all font-mono"
                />
              </div>
            </div>

            {/* Custom Alias & Submit Button */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-violet-400">
                  <span className="text-xs text-violet-400 font-semibold pr-2 select-none">Alias:</span>
                  <input
                    type="text"
                    value={customAlias || ''}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="my-custom-name (optional)"
                    className="bg-transparent text-white text-xs font-mono placeholder-gray-600 focus:outline-none flex-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !longUrl.trim()}
                className="py-3 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Shortening...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Shorten URL</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {error}
              </p>
            )}
          </form>

          {/* Newly Generated Result Card */}
          {latestResult && (
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-violet-950/40 via-purple-900/20 to-black/60 border border-violet-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Your Short Link is Ready!
                </span>
                {(() => {
                  const stats = calculateSavings(latestResult.longUrl, latestResult.shortUrl);
                  return stats.percent > 0 ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {stats.percent}% Shorter ({stats.saved} chars saved)
                    </span>
                  ) : null;
                })()}
              </div>

              {/* Short URL Box */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/60 rounded-xl p-3 border border-white/10">
                <div className="overflow-hidden flex-1">
                  <p className="text-base font-bold font-mono text-cyan-300 truncate">
                    {latestResult.shortUrl}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5 font-mono">
                    Target: {latestResult.longUrl}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(latestResult.shortUrl, latestResult.id)}
                    className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    {copiedId === latestResult.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Test Link Button */}
                  <a
                    href={latestResult.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl glass hover:bg-white/10 text-gray-200 hover:text-white font-semibold text-xs flex items-center gap-1 transition-all"
                    title="Test / Open Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open</span>
                  </a>

                  {/* QR Code Action Button */}
                  <button
                    onClick={() => navigate(`/tools/qrcode?mode=url&text=${encodeURIComponent(latestResult.shortUrl)}`)}
                    className="p-2.5 rounded-xl glass hover:bg-white/10 text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center gap-1 transition-all"
                    title="Generate QR code for this short link"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR</span>
                  </button>
                </div>
              </div>

              {/* Universal working short URL guarantee */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-white/5">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Check className="w-3 h-3" /> Live public short URL (opens destination instantly on all devices)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Shortened URLs History Section */}
        <div className="glass rounded-[2rem] p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-400" />
              Recent Shortened Links ({history.length})
            </h3>
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-red-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-xs border border-dashed border-white/5 rounded-2xl">
              No shortened links yet. Paste a link above to create your first short URL.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 group"
                >
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold font-mono text-cyan-300 truncate">
                        {item.shortUrl}
                      </p>
                      {item.clicks > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300 flex items-center gap-1">
                          <BarChart2 className="w-3 h-3 text-cyan-400" />
                          {item.clicks} clicks
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-1 max-w-[90%] font-mono">
                      {item.longUrl}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Copy */}
                    <button
                      onClick={() => handleCopy(item.shortUrl, item.id)}
                      className="p-2 rounded-lg glass hover:bg-white/10 text-gray-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1"
                      title="Copy short link"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Open */}
                    <a
                      href={item.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg glass hover:bg-white/10 text-gray-300 hover:text-white transition-all text-xs font-semibold"
                      title="Test / Open in browser"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* QR Code */}
                    <button
                      onClick={() => navigate(`/tools/qrcode?mode=url&text=${encodeURIComponent(item.shortUrl)}`)}
                      className="p-2 rounded-lg glass hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-all text-xs font-semibold"
                      title="Generate QR code"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg glass hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all text-xs"
                      title="Delete link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

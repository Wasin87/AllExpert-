import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, ArrowRight, AlertCircle, Home, Link2 } from 'lucide-react';

interface ShortenedUrl {
  id: string;
  slug: string;
  longUrl: string;
  shortUrl: string;
  internalShortUrl: string;
  createdAt: number;
  clicks: number;
}

export default function ShortRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [countdown, setCountdown] = useState(1);

  useEffect(() => {
    if (!code) {
      setNotFound(true);
      return;
    }

    try {
      const stored = localStorage.getItem('allexpert_short_urls');
      const list: ShortenedUrl[] = stored ? JSON.parse(stored) : [];
      const match = list.find(item => item.slug.toLowerCase() === code.toLowerCase());

      if (match && match.longUrl) {
        setTargetUrl(match.longUrl);

        // Update click count
        match.clicks = (match.clicks || 0) + 1;
        localStorage.setItem('allexpert_short_urls', JSON.stringify(list));

        // Fast redirect
        const timer = setTimeout(() => {
          window.location.replace(match.longUrl);
        }, 800);

        return () => clearTimeout(timer);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Redirect error:', err);
      setNotFound(true);
    }
  }, [code]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
        <div className="glass rounded-[2rem] p-8 max-w-md w-full text-center border border-white/10 space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Short Link Not Found</h2>
          <p className="text-xs text-gray-400">
            The short link code <span className="font-mono text-cyan-400">/s/{code}</span> was not found or has been removed.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/tools/shorturl')}
              className="px-6 py-3 rounded-xl bg-[var(--color-accent-blue)] text-white font-bold text-xs flex items-center justify-center gap-2 w-full shadow-lg"
            >
              <Link2 className="w-4 h-4" />
              <span>Create New Short URL</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
      <div className="glass rounded-[2rem] p-8 max-w-md w-full text-center border border-white/10 space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto animate-pulse">
          <Link2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Redirecting...</h2>
          <p className="text-xs text-gray-400 mt-1">Taking you to your destination link</p>
        </div>

        {targetUrl && (
          <div className="bg-black/40 rounded-xl p-3 border border-white/5 overflow-hidden">
            <p className="text-xs font-mono text-cyan-300 truncate">{targetUrl}</p>
          </div>
        )}

        <div className="pt-2">
          {targetUrl && (
            <a
              href={targetUrl}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all"
            >
              <span>Click Here if Not Redirected</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

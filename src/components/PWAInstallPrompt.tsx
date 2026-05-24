import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share, Plus, Sparkles, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'other'>('other');
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    setIsInstalled(isStandalone);

    // Detect platform
    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroid = /Android/i.test(ua);

    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    }

    // Capture the native install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent automatic prompt
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check localStorage to respect user dismission
      const hasDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasDismissed && !isStandalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect successful installation
    const handleAppInstalled = () => {
      console.log('AllExpert App was installed successfully!');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // If iOS and not standalone, show prompt after a short delay (e.g., 5s) to avoid annoying users immediately
    if (isIOS && !isStandalone) {
      const hasDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasDismissed) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 6000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show native prompt
    await deferredPrompt.prompt();

    // Check outcome
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt choice: ${outcome}`);

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPrompt(false);
    }
    
    // Clear prompt event
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Keep it dismissed to respect user preference
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // If already installed, don't show prompt
  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-16 md:bottom-6 right-4 left-4 md:left-auto md:w-[400px] z-[9999] glass border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-2xl"
        >
          {platform === 'ios' ? (
            // iOS Premium Instructional Drawer
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-black/40 flex-shrink-0">
                    <img src="https://i.ibb.co/mrGsQ2GT/logo.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      Install AllExpert <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    </h3>
                    <p className="text-xs text-gray-400">Add to your Home Screen</p>
                  </div>
                </div>
                <button 
                  onClick={handleDismiss} 
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 bg-white/5 rounded-xl p-3.5 border border-white/5 text-xs text-gray-300">
                <p className="font-semibold text-white mb-2">Instructions for iOS Safari:</p>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white flex-shrink-0">
                    <Share className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
                  </div>
                  <span>1. Tap on the <span className="text-white font-medium">Share</span> button in Safari.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white flex-shrink-0">
                    <Plus className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
                  </div>
                  <span>2. Scroll down and choose <span className="text-white font-medium">Add to Home Screen</span>.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            // Native Android / Chrome Dialog
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-black/40 flex-shrink-0">
                    <img src="https://i.ibb.co/mrGsQ2GT/logo.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      Install AllExpert <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    </h3>
                    <p className="text-xs text-gray-400">Experience as a standalone app</p>
                  </div>
                </div>
                <button 
                  onClick={handleDismiss} 
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Install AllExpert for fast offline access, native multitasking, home screen layout integration, and a completely distraction-free workspace.
              </p>

              <div className="flex items-center gap-2 justify-end mt-1">
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  Later
                </button>
                <button
                  onClick={handleInstallClick}
                  disabled={!deferredPrompt}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-accent-blue)] to-indigo-600 hover:from-[var(--color-accent-blue)] hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

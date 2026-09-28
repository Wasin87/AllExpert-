import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Languages, Code2, CheckCircle2, Copy, Check, Sparkles, Cpu, ShieldCheck, Terminal, Award } from 'lucide-react';
import { motion } from 'motion/react';
import AppLogo from '@/components/ui/AppLogo';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useSettingsStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const handleCopyName = () => {
    navigator.clipboard.writeText('Md Wasin Ahmed');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col min-h-full max-w-2xl mx-auto space-y-6 pb-28">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">{t('Settings')}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Preferences & Developer Info</p>
        </div>
        <AppLogo showText={false} badgeSize="w-9 h-9" />
      </div>

      {/* Preferences Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">App Preferences</h3>
        
        {/* Language Toggle */}
        <div className="glass rounded-2xl p-4 flex items-center justify-between border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-[var(--color-accent-blue)] border border-blue-500/20">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">{t('Language')}</span>
              <span className="text-[11px] text-gray-400">Choose your interface language</span>
            </div>
          </div>
          <select 
            value={language || 'en'}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'bn')}
            className="bg-black/40 text-white border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer focus:border-[var(--color-accent-blue)] transition-colors"
          >
            <option value="en" className="bg-slate-900 text-white">English (US)</option>
            <option value="bn" className="bg-slate-900 text-white">বাংলা (Bangla)</option>
          </select>
        </div>
      </div>

      {/* Developer Profile Section (Md Wasin Ahmed) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
            Lead Developer Profile
          </h3>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Verified Creator
          </span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass rounded-[2rem] p-6 border border-white/15 overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.4)] group"
        >
          {/* Cyber glowing backgrounds */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/10 blur-2xl -ml-10 -mb-10 pointer-events-none" />

          {/* Top header row inside card */}
          <div className="flex items-start justify-between relative z-10 mb-5">
            <div className="flex items-center gap-4">
              {/* Developer Avatar Badge */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                  <div className="w-full h-full bg-slate-950 rounded-[0.9rem] flex items-center justify-center text-white font-black text-xl tracking-tight">
                    WA
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-slate-950 shadow-md">
                  <Sparkles className="w-3 h-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-black text-white tracking-tight">
                    Md Wasin Ahmed
                  </h4>
                  <CheckCircle2 className="w-4 h-4 text-blue-400 fill-blue-500/20 shrink-0" />
                </div>
                <p className="text-[11px] font-bold text-[var(--color-accent-blue)] tracking-wider uppercase mt-0.5 flex items-center gap-1">
                  <span>Founder & Lead Architect</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">
                  Core Engineer behind AllExpert Platform
                </p>
              </div>
            </div>

            {/* Quick Copy Name Button */}
            <button
              onClick={handleCopyName}
              title="Copy Developer Name"
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">Copy Name</span>
                </>
              )}
            </button>
          </div>

          {/* Tech Stack Badges */}
          <div className="pt-3 border-t border-white/10 relative z-10 flex flex-wrap items-center gap-2">
            {[
              { icon: Terminal, label: 'Full-Stack Suite' },
              { icon: Cpu, label: 'React & TypeScript' },
              { icon: ShieldCheck, label: 'High Security' },
              { icon: Award, label: 'v2.0.0 Architecture' },
            ].map((tag, idx) => (
              <div 
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-semibold text-gray-300 flex items-center gap-1.5 hover:bg-white/10 transition-colors"
              >
                <tag.icon className="w-3 h-3 text-[var(--color-accent-blue)]" />
                <span>{tag.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer Details */}
      <div className="text-center pt-6 space-y-1">
        <p className="text-xs text-gray-400 font-semibold flex items-center justify-center gap-1">
          {t('Developed by Md Wasin Ahmed')}
        </p>
        <p className="text-[10px] text-gray-500 font-mono">
          AllExpert Systems v2.0.0 • All Rights Reserved
        </p>
      </div>
    </div>
  );
}

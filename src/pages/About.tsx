import { useTranslation } from 'react-i18next';
import { ChevronLeft, Code2, Heart, Mail, Globe, Shield, Zap, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function About() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6">
      <div 
        className="flex items-center gap-2 mb-6 cursor-pointer group w-fit"
        onClick={() => navigate('/more')}
      >
        <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-all duration-300">
          <ChevronLeft className="w-4 h-4 text-[var(--color-accent-blue)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text)] drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]">{t('About')}</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-28">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center mb-10"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-[var(--color-accent-blue)]/20 blur-3xl rounded-full group-hover:bg-[var(--color-accent-blue)]/40 transition-all duration-500" />
            <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white/10 mb-4 shadow-2xl relative z-10">
              <img src="https://i.ibb.co/mrGsQ2GT/logo.png" alt="AllExpert Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            All<span className="text-[var(--color-accent-blue)] drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">Expert</span>
          </h1>
          <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-[var(--color-accent-blue)] to-transparent mt-3" />
          <p className="text-gray-400 mt-4 text-center max-w-xs font-medium leading-relaxed text-xs">
            {t('Empowering your digital life with a suite of professional-grade utility tools designed for the future.')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {[
            { icon: Shield, title: 'Secure', desc: 'Privacy-first architecture ensuring your data stays yours.' },
            { icon: Zap, title: 'Fast', desc: 'Optimized performance for instantaneous results.' },
            { icon: Cpu, title: 'Smart', desc: 'AI-powered features to simplify complex tasks.' },
            { icon: Globe, title: 'Global', desc: 'Multi-language support for users worldwide.' }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="glass p-4 rounded-2xl border border-white/5 flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-white/5 text-[var(--color-accent-blue)] shrink-0">
                <feature.icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-0.5 text-sm">{t(feature.title)}</h4>
                <p className="text-gray-500 text-[11px] leading-snug">{t(feature.desc)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-6 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2.5 text-white">
              <Code2 className="w-5 h-5 text-[var(--color-accent-blue)]" />
              {t('Lead Developer')}
            </h3>
            <div className="w-8 h-8 rounded-xl bg-white/5 p-1.5 border border-white/10">
              <img src="https://i.ibb.co/mrGsQ2GT/logo.png" alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-accent-blue)] to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0">
              WA
            </div>
            <div>
              <h4 className="text-xl font-black text-white">{t('Md Wasin Ahmed')}</h4>
              <p className="text-[var(--color-accent-blue)] font-bold tracking-widest text-[10px] uppercase mt-0.5">{t('Founder & Lead Architect')}</p>
              <div className="flex gap-3 mt-3">
                <div className="h-1 w-6 bg-[var(--color-accent-blue)] rounded-full" />
                <div className="h-1 w-3 bg-white/20 rounded-full" />
                <div className="h-1 w-1.5 bg-white/10 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-12 text-center text-gray-500 flex flex-col items-center gap-3 pb-12">
          <div className="flex items-center gap-2 text-sm font-medium">
            {t('Crafted with')} <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> {t('by Md Wasin Ahmed')}
          </div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-600">© 2026 AllExpert Systems</p>
        </div>
      </div>
    </div>
  );
}

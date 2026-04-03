import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useTasbihStore } from '@/store/useTasbihStore';
import { RotateCcw, Save, History, ChevronLeft, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function Tasbih() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { count, sessions, increment, reset, saveSession, clearSessions } = useTasbihStore();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6">
      <div 
        className="flex items-center gap-2 mb-6 cursor-pointer group w-fit"
        onClick={() => navigate('/tools')}
      >
        <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-all duration-300">
          <ChevronLeft className="w-4 h-4 text-[var(--color-accent-conv)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-accent-conv)] drop-shadow-[0_0_12px_rgba(0,242,255,0.3)]">{t('Tasbih')}</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-12 pb-28">
        <div className="text-center relative">
          <div className="absolute inset-0 blur-3xl bg-[var(--color-accent-conv)]/10 rounded-full" />
          <span className="text-8xl font-light text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] relative z-10">{count}</span>
          <p className="text-gray-500 mt-3 font-bold tracking-[0.3em] uppercase text-xs relative z-10">{t('Counter')}</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={increment}
          className="w-48 h-48 rounded-full bg-[var(--color-accent-conv)] text-white shadow-[0_0_40px_rgba(0,242,255,0.4)] flex items-center justify-center border-[10px] border-[var(--bg)] relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-36 h-36 rounded-full border-2 border-white/30 flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl font-black tracking-widest drop-shadow-lg">TAP</span>
          </div>
        </motion.button>

        <div className="flex gap-6">
          <motion.button
            whileHover={{ scale: 1.1, rotate: -45 }}
            whileTap={{ scale: 0.9 }}
            onClick={reset}
            className="w-14 h-14 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 border border-white/10"
          >
            <RotateCcw className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={saveSession}
            className="w-14 h-14 rounded-xl glass flex items-center justify-center text-[var(--color-accent-conv)] hover:text-white transition-all duration-300 border border-white/10"
          >
            <Save className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowHistory(true)}
            className="w-14 h-14 rounded-xl glass flex items-center justify-center text-purple-400 hover:text-white transition-all duration-300 border border-white/10"
          >
            <History className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)]"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{t('History')}</h2>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 rounded-xl glass hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide">
              {sessions.length === 0 ? (
                <div className="text-center text-gray-600 mt-20 font-medium italic text-sm">
                  {t('No history found')}
                </div>
              ) : (
                sessions.map((session) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={session.id} 
                    className="glass p-4 rounded-2xl flex justify-between items-center border border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <div className="text-2xl font-bold text-[var(--color-accent-conv)] drop-shadow-[0_0_8px_rgba(0,242,255,0.3)]">{session.count}</div>
                      <div className="text-xs text-gray-500 font-medium mt-0.5">{format(session.date, 'PPpp')}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {sessions.length > 0 && (
              <div className="p-6 border-t border-white/5">
                <button
                  onClick={clearSessions}
                  className="w-full py-4 rounded-xl bg-red-500/10 text-red-500 font-bold tracking-widest flex items-center justify-center gap-2.5 hover:bg-red-500/20 transition-all border border-red-500/20 text-sm"
                >
                  <Trash2 className="w-5 h-5" />
                  {t('CLEAR HISTORY')}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

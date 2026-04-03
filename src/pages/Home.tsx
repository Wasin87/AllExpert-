import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Calculator, ArrowRightLeft, StickyNote, Wrench, Settings, ChevronRight, Zap, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotesStore } from '@/store/useNotesStore';
import { useCalcStore } from '@/store/useCalcStore';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notes = useNotesStore(state => state.notes);
  const calcHistory = useCalcStore(state => state.history);

  const tools = [
    { id: 'calc', icon: Calculator, label: 'Calculator', path: '/calculator', color: 'bg-[var(--color-accent-calc)] shadow-[0_0_20px_rgba(191,0,255,0.4)]' },
    { id: 'conv', icon: ArrowRightLeft, label: 'Converter', path: '/converter', color: 'bg-[var(--color-accent-conv)] shadow-[0_0_20px_rgba(0,242,255,0.4)]' },
    { id: 'notes', icon: StickyNote, label: 'Notes', path: '/notes', color: 'bg-[var(--color-accent-notes)] shadow-[0_0_20px_rgba(77,159,255,0.4)]' },
    { id: 'tools', icon: Wrench, label: 'Tools', path: '/tools', color: 'bg-[var(--color-accent-tools)] shadow-[0_0_20px_rgba(126,140,224,0.4)]' },
  ];

  return (
    <div className="p-6 space-y-8 pb-32">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border border-white/10 shadow-[0_0_12px_rgba(255,255,255,0.1)]">
            <img src="https://i.ibb.co/mrGsQ2GT/logo.png" alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            All<span className="text-[var(--color-accent-blue)]">Expert</span>
          </h1>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => navigate('/notes')} className="p-1.5 rounded-full glass hover:bg-white/10 transition-colors">
            <Search className="w-5 h-5 text-gray-300" />
          </button>
          <button onClick={() => navigate('/settings')} className="p-1.5 rounded-full glass hover:bg-white/10 transition-colors">
            <Settings className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[1.5rem] p-6 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-accent-blue)] opacity-10 blur-[50px] rounded-full group-hover:opacity-20 transition-opacity" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-accent-calc)] opacity-5 blur-[40px] rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="p-1.5 rounded-lg bg-yellow-400/20"
            >
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-white">{t('Welcome Back')}</h2>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed max-w-[85%]">
            Access all your expert tools in one place with a futuristic experience.
          </p>
        </div>
      </motion.div>

      {/* Quick Tools Grid */}
      <section>
        <h3 className="text-sm font-semibold mb-4 px-1 text-gray-300 tracking-wide uppercase">{t('Quick Tools')}</h3>
        <div className="grid grid-cols-4 gap-3">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={tool.path} className="flex flex-col items-center gap-2 group">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-active:scale-95 ${tool.color}`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-center text-gray-400 group-hover:text-white transition-colors">{t(tool.label)}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-sm font-semibold text-gray-300 tracking-wide uppercase">{t('Recent Activity')}</h3>
        </div>
        <div className="space-y-3">
          {calcHistory.length > 0 && (
            <Link to="/calculator" className="block">
              <div className="glass rounded-2xl p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[var(--color-accent-calc)]/10 text-[var(--color-accent-calc)] shadow-[0_0_12px_rgba(191,0,255,0.1)]">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{calcHistory[0].expression}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">= {calcHistory[0].result}</p>
                  </div>
                </div>
                <div className="p-1.5 rounded-full bg-white/5 text-gray-400 group-hover:text-[var(--color-accent-blue)] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          )}
          
          {notes.length > 0 && (
            <Link to="/notes" className="block">
              <div className="glass rounded-2xl p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[var(--color-accent-notes)]/10 text-[var(--color-accent-notes)] shadow-[0_0_12px_rgba(77,159,255,0.1)]">
                    <StickyNote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold truncate max-w-[150px] text-white">{notes[notes.length - 1].title || 'Untitled Note'}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Latest note</p>
                  </div>
                </div>
                <div className="p-1.5 rounded-full bg-white/5 text-gray-400 group-hover:text-[var(--color-accent-blue)] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          )}

          {calcHistory.length === 0 && notes.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm glass rounded-3xl border-dashed">
              No recent activity yet
            </div>
          )}
        </div>
      </section>

      {/* Today Task */}
      <section>
        <Link to="/notes">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-[var(--color-accent-blue)] to-cyan-500 rounded-2xl p-5 text-white shadow-[0_10px_30px_rgba(59,130,246,0.3)] flex justify-between items-center relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-[30px] rounded-full -mr-12 -mt-12 group-hover:bg-white/20 transition-all" />
            <div className="relative z-10">
              <h3 className="font-bold text-lg">{t('Today Task')}</h3>
              <p className="text-xs text-blue-50/80 mt-0.5">Manage your daily tasks efficiently</p>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl relative z-10">
              <ChevronRight className="w-5 h-5" />
            </div>
          </motion.div>
        </Link>
      </section>
    </div>
  );
}

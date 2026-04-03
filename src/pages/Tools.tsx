import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Timer, Key, ArrowRightLeft, Hash, ChevronLeft, Gamepad2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Tools() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tools = [
    { id: 'games', icon: Gamepad2, label: 'Game Zone', path: '/games', color: 'bg-indigo-500', desc: 'Play fun mini-games' },
    { id: 'stopwatch', icon: Timer, label: 'Stopwatch', path: '/tools/stopwatch', color: 'bg-red-500', desc: 'Track time with laps' },
    { id: 'password', icon: Key, label: 'Password Generator', path: '/tools/password', color: 'bg-green-500', desc: 'Secure random passwords' },
    { id: 'tasbih', icon: Hash, label: 'Tasbih', path: '/tools/tasbih', color: 'bg-emerald-500', desc: 'Digital tally counter' },
    { id: 'converter', icon: ArrowRightLeft, label: 'Converter', path: '/converter', color: 'bg-[var(--color-accent-conv)]', desc: 'Convert all units' },
  ];

  return (
    <div className="p-6 h-full flex flex-col bg-[var(--bg)] pb-24">
      <div 
        className="flex items-center gap-2 mb-6 cursor-pointer group w-fit"
        onClick={() => navigate('/')}
      >
        <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-all duration-300">
          <ChevronLeft className="w-4 h-4 text-[var(--color-accent-tools)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-accent-tools)] drop-shadow-[0_0_12px_rgba(0,242,255,0.3)]">{t('Tools')}</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={tool.path} className="glass rounded-[1.5rem] p-5 flex items-center gap-5 group hover:bg-white/5 transition-all duration-300 border border-white/10 hover:scale-[1.02] shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg ${tool.color} group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white/90 mb-0.5">{t(tool.label)}</h3>
                <p className="text-xs text-gray-500 font-medium">{t(tool.desc)}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

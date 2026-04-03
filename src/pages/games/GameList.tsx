import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ChevronLeft, Gamepad2, Hash, Scissors, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GameList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const games = [
    {
      id: 'tictactoe',
      name: 'Tic-Tac-Toe',
      icon: Hash,
      path: '/games/tictactoe',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]'
    },
    {
      id: 'rps',
      name: 'Rock Paper Scissors',
      icon: Scissors,
      path: '/games/rps',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6">
      <div 
        className="flex items-center gap-2 mb-6 cursor-pointer group w-fit"
        onClick={() => navigate('/tools')}
      >
        <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-all duration-300">
          <ChevronLeft className="w-4 h-4 text-[var(--color-accent-blue)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text)] drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]">{t('Game Zone')}</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-28">
        <div className="grid grid-cols-1 gap-4">
          {games.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(game.path)}
              className={`glass p-5 rounded-2xl border flex items-center justify-between cursor-pointer group transition-all duration-300 ${game.color} ${game.shadow}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/5">
                  <game.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t(game.name)}</h3>
                  <p className="text-xs text-white/50">{t('Play now and win!')}</p>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white/10 text-white group-hover:bg-white/20 transition-colors">
                <Gamepad2 className="w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

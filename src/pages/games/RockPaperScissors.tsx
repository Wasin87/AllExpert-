import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RotateCcw, Scissors, Hand, Square, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Choice = 'rock' | 'paper' | 'scissors' | null;
type Result = 'win' | 'lose' | 'draw' | null;

export default function RockPaperScissors() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userChoice, setUserChoice] = useState<Choice>(null);
  const [computerChoice, setComputerChoice] = useState<Choice>(null);
  const [result, setResult] = useState<Result>(null);
  const [score, setScore] = useState({ user: 0, computer: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const choices: { id: Choice; icon: any; color: string }[] = [
    { id: 'rock', icon: Square, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { id: 'paper', icon: Hand, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { id: 'scissors', icon: Scissors, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
  ];

  const play = (choice: Choice) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setUserChoice(choice);
    setComputerChoice(null);
    setResult(null);

    setTimeout(() => {
      const compChoice = choices[Math.floor(Math.random() * 3)].id;
      setComputerChoice(compChoice);
      
      let gameResult: Result;
      if (choice === compChoice) gameResult = 'draw';
      else if (
        (choice === 'rock' && compChoice === 'scissors') ||
        (choice === 'paper' && compChoice === 'rock') ||
        (choice === 'scissors' && compChoice === 'paper')
      ) gameResult = 'win';
      else gameResult = 'lose';

      setResult(gameResult);
      if (gameResult === 'win') setScore(prev => ({ ...prev, user: prev.user + 1 }));
      if (gameResult === 'lose') setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
      setIsAnimating(false);
    }, 1000);
  };

  const resetGame = () => {
    setUserChoice(null);
    setComputerChoice(null);
    setResult(null);
    setScore({ user: 0, computer: 0 });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6">
      <div 
        className="flex items-center gap-2 mb-6 cursor-pointer group w-fit"
        onClick={() => navigate('/games')}
      >
        <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-all duration-300">
          <ChevronLeft className="w-4 h-4 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text)] drop-shadow-[0_0_12px_rgba(168,85,247,0.3)]">{t('Rock Paper Scissors')}</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pb-28">
        <div className="flex gap-10 mb-12">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('YOU')}</span>
            <div className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{score.user}</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('CPU')}</span>
            <div className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{score.computer}</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 mb-16 h-32">
          <AnimatePresence mode="wait">
            {userChoice && (
              <motion.div
                key="user"
                initial={{ opacity: 0, x: -50, scale: 0.5 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className={`w-24 h-24 rounded-3xl glass flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-full" />
                {(() => {
                  const Icon = choices.find(c => c.id === userChoice)?.icon;
                  return Icon ? <Icon className="w-10 h-10 text-blue-400 relative z-10" /> : null;
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-2xl font-black text-gray-700 italic">VS</div>

          <AnimatePresence mode="wait">
            {computerChoice ? (
              <motion.div
                key="computer"
                initial={{ opacity: 0, x: 50, scale: 0.5 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className={`w-24 h-24 rounded-3xl glass flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-purple-500/5 blur-xl rounded-full" />
                {(() => {
                  const Icon = choices.find(c => c.id === computerChoice)?.icon;
                  return Icon ? <Icon className="w-10 h-10 text-purple-400 relative z-10" /> : null;
                })()}
              </motion.div>
            ) : isAnimating ? (
              <motion.div
                key="loading"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-24 h-24 rounded-3xl glass flex items-center justify-center border border-white/10"
              >
                <RotateCcw className="w-8 h-8 text-gray-600" />
              </motion.div>
            ) : (
              <div className="w-24 h-24 rounded-3xl glass flex items-center justify-center border border-white/10 opacity-20">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="mb-12 h-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-2xl font-black uppercase tracking-widest ${result === 'win' ? 'text-emerald-400' : result === 'lose' ? 'text-red-400' : 'text-gray-400'}`}
              >
                {result === 'win' ? t('WIN!') : result === 'lose' ? t('LOSE!') : t('DRAW!')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
          {choices.map((choice) => (
            <motion.button
              key={choice.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => play(choice.id)}
              disabled={isAnimating}
              className={`flex flex-col items-center gap-3 p-5 rounded-3xl glass border transition-all duration-300 group ${choice.color} ${userChoice === choice.id ? 'ring-2 ring-white/20 scale-105' : 'opacity-80 hover:opacity-100'}`}
            >
              <choice.icon className="w-8 h-8 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t(choice.id || '')}</span>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="mt-12 flex items-center gap-2 px-6 py-3 rounded-2xl glass text-gray-400 hover:text-white transition-all border border-white/10 group"
        >
          <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-bold tracking-widest uppercase text-xs">{t('RESET')}</span>
        </motion.button>
      </div>
    </div>
  );
}

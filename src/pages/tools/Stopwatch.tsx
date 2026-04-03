import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Square, Flag, RotateCcw, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Stopwatch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 10);
      }, 10);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);

    return {
      hours: hours.toString().padStart(2, '0'),
      main: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      ms: milliseconds.toString().padStart(2, '0')
    };
  };

  const handleStartStop = () => setIsRunning(!isRunning);
  
  const handleLapReset = () => {
    if (isRunning) {
      setLaps([time, ...laps]);
    } else {
      setTime(0);
      setLaps([]);
    }
  };

  const timeParts = formatTime(time);

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6">
      <div 
        className="flex items-center gap-2 mb-6 cursor-pointer group w-fit"
        onClick={() => navigate('/tools')}
      >
        <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-all duration-300">
          <ChevronLeft className="w-4 h-4 text-[var(--color-accent-conv)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-accent-conv)] drop-shadow-[0_0_12px_rgba(0,242,255,0.3)]">{t('Stopwatch')}</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pb-28">
        <div className="relative w-60 h-60 flex items-center justify-center mb-12">
          {/* Background Circle */}
          <div className="absolute inset-0 rounded-full border-[6px] border-white/5 shadow-inner"></div>
          
          {/* Animated Ring & Waves */}
          {isRunning && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-[3px] border-[var(--color-accent-conv)]/40 shadow-[0_0_30px_rgba(0,242,255,0.4)]"
                animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-[3px] border-[var(--color-accent-conv)]/20 shadow-[0_0_20px_rgba(0,242,255,0.2)]"
                animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.7 }}
              />
              <motion.div 
                className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-[var(--color-accent-conv)] border-r-[var(--color-accent-conv)] shadow-[0_0_15px_rgba(0,242,255,0.5)]"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            </>
          )}

          {/* Time Display */}
          <div className="flex flex-col items-center z-10">
            <div className="flex items-baseline font-mono">
              <span className="text-5xl font-bold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">{timeParts.main}</span>
              <span className="text-2xl font-bold text-[var(--color-accent-conv)] ml-1.5 drop-shadow-[0_0_8px_rgba(0,242,255,0.3)]">{timeParts.ms}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-gray-500 text-sm font-bold tracking-widest">
              <RotateCcw className="w-4 h-4" />
              <span>{timeParts.hours}H</span>
            </div>
          </div>
        </div>

        <div className="flex gap-8 mb-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleStartStop}
            className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${isRunning ? 'bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)]' : 'bg-[var(--color-accent-conv)] shadow-[0_0_25px_rgba(0,242,255,0.4)]'}`}
          >
            {isRunning ? <Square className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLapReset}
            className="w-20 h-20 rounded-[1.5rem] glass flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 border border-white/10"
          >
            {isRunning ? <Flag className="w-8 h-8" /> : <RotateCcw className="w-8 h-8" />}
          </motion.button>
        </div>

        <div className="w-full flex-1 overflow-y-auto space-y-2.5 scrollbar-hide px-2">
          {laps.map((lap, index) => {
            const lapParts = formatTime(lap);
            return (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={index} 
                className="flex justify-between items-center p-4 glass rounded-xl border border-white/5 hover:bg-white/5 transition-colors"
              >
                <span className="text-gray-500 font-bold tracking-wider text-xs">{t('LAP')} {laps.length - index}</span>
                <span className="font-mono text-lg text-white/90">
                  {lapParts.hours !== '00' ? `${lapParts.hours}:` : ''}{lapParts.main}.<span className="text-[var(--color-accent-conv)] text-sm font-bold">{lapParts.ms}</span>
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

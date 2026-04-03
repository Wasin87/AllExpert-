import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RotateCcw, User, Cpu, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Player = 'X' | 'O' | null;

export default function TicTacToe() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [isAiMode, setIsAiMode] = useState(false);

  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(square => square !== null)) return 'Draw';
    return null;
  };

  const handleClick = (i: number) => {
    if (winner || board[i]) return;
    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  useEffect(() => {
    const result = calculateWinner(board);
    if (result) {
      setWinner(result);
    } else if (isAiMode && !isXNext) {
      const timer = setTimeout(() => {
        makeAiMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [board, isXNext, isAiMode]);

  const makeAiMove = () => {
    const emptySquares = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
    if (emptySquares.length > 0) {
      const randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
      handleClick(randomIndex);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6">
      <div 
        className="flex items-center gap-2 mb-6 cursor-pointer group w-fit"
        onClick={() => navigate('/games')}
      >
        <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-all duration-300">
          <ChevronLeft className="w-4 h-4 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text)] drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]">{t('Tic-Tac-Toe')}</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pb-28">
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => { setIsAiMode(false); resetGame(); }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 ${!isAiMode ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'glass text-gray-400'}`}
          >
            <User className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">PvP</span>
          </button>
          <button 
            onClick={() => { setIsAiMode(true); resetGame(); }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 ${isAiMode ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'glass text-gray-400'}`}
          >
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">PvAI</span>
          </button>
        </div>

        <div className="mb-6 text-center">
          <AnimatePresence mode="wait">
            {winner ? (
              <motion.div
                key="winner"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-500 mb-2">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-widest">
                  {winner === 'Draw' ? t('DRAW!') : `${winner} ${t('WINS!')}`}
                </h3>
              </motion.div>
            ) : (
              <motion.div
                key="turn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('TURN')}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black ${isXNext ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                  {isXNext ? 'X' : 'O'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 glass rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
          {board.map((square, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(i)}
              className={`w-20 h-20 rounded-2xl glass flex items-center justify-center text-3xl font-black transition-all duration-300 border border-white/5 relative z-10 ${square === 'X' ? 'text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : square === 'O' ? 'text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'hover:bg-white/5'}`}
            >
              <AnimatePresence mode="wait">
                {square && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    {square}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="mt-10 flex items-center gap-2 px-6 py-3 rounded-2xl glass text-gray-400 hover:text-white transition-all border border-white/10 group"
        >
          <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-bold tracking-widest uppercase text-xs">{t('RESTART')}</span>
        </motion.button>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { evaluate } from 'mathjs';
import { useCalcStore } from '@/store/useCalcStore';
import { Delete, History, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Calculator() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [isScientific, setIsScientific] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const addHistory = useCalcStore(state => state.addHistory);
  const history = useCalcStore(state => state.history);
  const clearHistory = useCalcStore(state => state.clearHistory);

  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [expression]);

  const handleInput = (val: string) => {
    setExpression(prev => prev + val);
    try {
      // Live preview
      const res = evaluate(expression + val);
      if (res !== undefined && !isNaN(res)) {
        setResult(res.toString());
      }
    } catch (e) {
      // Ignore incomplete expressions
    }
  };

  const handleCalculate = () => {
    try {
      if (!expression) return;
      const res = evaluate(expression);
      const finalResult = res.toString();
      setExpression(finalResult);
      setResult('');
      addHistory(expression, finalResult);
    } catch (e) {
      setResult('Error');
    }
  };

  const handleClear = () => {
    setExpression('');
    setResult('');
  };

  const handleDelete = () => {
    setExpression(prev => prev.slice(0, -1));
    try {
      const newExp = expression.slice(0, -1);
      if (!newExp) {
        setResult('');
        return;
      }
      const res = evaluate(newExp);
      if (res !== undefined && !isNaN(res)) {
        setResult(res.toString());
      } else {
        setResult('');
      }
    } catch (e) {
      setResult('');
    }
  };

  const basicButtons = [
    ['C', '()', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', 'DEL', '=']
  ];

  const scientificButtons = [
    ['sin', 'cos', 'tan', 'log'],
    ['asin', 'acos', 'atan', 'ln'],
    ['sqrt', '^', 'pi', 'e'],
    ['(', ')', '!', 'exp']
  ];

  const renderButton = (btn: string) => {
    const isOperator = ['/', '*', '-', '+'].includes(btn);
    const isEquals = btn === '=';
    const isAction = ['C', 'DEL', '()', '%'].includes(btn);
    
    let onClick = () => handleInput(btn);
    if (btn === 'C') onClick = handleClear;
    if (btn === 'DEL') onClick = handleDelete;
    if (btn === '=') onClick = handleCalculate;
    if (btn === '()') onClick = () => handleInput('(');

    let bgColor = 'bg-white/5';
    let textColor = 'text-white';
    let shadowColor = 'rgba(255,255,255,0.1)';

    if (isEquals) {
      bgColor = 'bg-[var(--color-accent-calc)]';
      textColor = 'text-white';
      shadowColor = 'rgba(191,0,255,0.4)';
    } else if (btn === 'C') {
      bgColor = 'bg-red-600';
      textColor = 'text-white';
      shadowColor = 'rgba(220,38,38,0.4)';
    } else if (btn === 'DEL') {
      bgColor = 'bg-yellow-500';
      textColor = 'text-black';
      shadowColor = 'rgba(234,179,8,0.4)';
    } else if (isOperator) {
      bgColor = 'bg-green-600';
      textColor = 'text-white';
      shadowColor = 'rgba(22,163,74,0.4)';
    } else if (btn === '()' || btn === '%') {
      bgColor = 'bg-[#00838F]'; // Deep Aqua
      textColor = 'text-white';
      shadowColor = 'rgba(0,131,143,0.4)';
    }

    return (
      <motion.button
        key={btn}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className={`h-14 rounded-xl text-lg font-bold flex items-center justify-center transition-all duration-300 shadow-lg border border-white/10
          ${bgColor} ${textColor}`}
        style={{ boxShadow: `0 4px 15px ${shadowColor}` }}
      >
        {btn === 'DEL' ? <Delete className="w-5 h-5" /> : btn}
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] pb-24 md:pb-0">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div className="flex gap-2 glass border border-white/5 p-1 rounded-xl shadow-sm">
          <button 
            onClick={() => setIsScientific(false)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${!isScientific ? 'bg-white/10 shadow-sm text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {t('Basic')}
          </button>
          <button 
            onClick={() => setIsScientific(true)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isScientific ? 'bg-white/10 shadow-sm text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {t('Scientific')}
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/converter')} className="px-3 py-1.5 rounded-xl glass text-[var(--color-accent-conv)] text-sm font-medium flex items-center gap-1 hover:bg-white/5 transition-colors">
            <ArrowRightLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('All Units')}</span>
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 rounded-xl glass text-[var(--color-accent-calc)] hover:bg-white/5 transition-colors">
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Display */}
      <div className="flex-1 flex flex-col justify-end p-6 pb-16 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-[var(--bg)] pointer-events-none" />
        <div 
          ref={displayRef}
          className="w-full text-right overflow-x-auto whitespace-nowrap scrollbar-hide mb-2 relative z-10"
        >
          <span className="text-5xl font-light tracking-wider text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{expression || '0'}</span>
        </div>
        <div className="h-8 text-right relative z-10">
          <span className="text-2xl text-gray-500">{result}</span>
        </div>
      </div>

      {/* Keypad */}
      <div className="p-5 pt-8 glass rounded-t-[2.5rem] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] mb-2">
        {isScientific && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {scientificButtons.flat().map(btn => (
              <motion.button
                key={btn}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleInput(btn + '(')}
                className="h-10 rounded-lg text-[10px] font-bold uppercase tracking-tighter bg-white/5 text-[var(--color-accent-calc)] border border-white/5 shadow-sm hover:bg-white/10 transition-colors"
              >
                {btn}
              </motion.button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-4 gap-2.5">
          {basicButtons.flat().map(renderButton)}
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col justify-end">
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-[var(--bg)] h-[70%] rounded-t-3xl p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{t('History')}</h3>
              <button onClick={() => setShowHistory(false)} className="text-gray-500">{t('Close')}</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {history.map(item => (
                <div key={item.id} className="text-right border-b border-[var(--border)] pb-2" onClick={() => {
                  setExpression(item.expression);
                  setShowHistory(false);
                }}>
                  <p className="text-gray-500 text-sm">{item.expression}</p>
                  <p className="text-xl font-medium text-[var(--text)]">={item.result}</p>
                </div>
              ))}
              {history.length === 0 && <p className="text-center text-gray-500 mt-10">{t('No history')}</p>}
            </div>
            {history.length > 0 && (
              <button onClick={clearHistory} className="mt-4 py-3 w-full rounded-xl bg-red-500/10 text-red-500 font-medium">
                {t('Clear History')}
              </button>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowUpDown, RotateCcw, ChevronDown, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = {
  Length: {
    units: ['cm', 'm', 'mm', 'nm', 'pm', 'pc', 'inch', 'mile', 'foot', 'yard'],
    rates: {
      m: 1, cm: 100, mm: 1000, nm: 1e9, pm: 1e12, pc: 3.086e-17, inch: 39.3701, mile: 0.000621371, foot: 3.28084, yard: 1.09361
    }
  },
  Area: {
    units: ['m²', 'km²', 'dm²', 'mm²'],
    rates: {
      'm²': 1, 'km²': 1e-6, 'dm²': 100, 'mm²': 1e6
    }
  },
  Weight: {
    units: ['kg', 'gram', 'mg', 'microgram', 'pound'],
    rates: {
      kg: 1, gram: 1000, mg: 1e6, microgram: 1e9, pound: 2.20462
    }
  },
  Temperature: {
    units: ['C', 'F', 'K'],
  },
  Power: {
    units: ['W', 'kW', 'hp', 'ps', 'kgm/s'],
    rates: {
      W: 1, kW: 0.001, hp: 0.00134102, ps: 0.00135962, 'kgm/s': 0.101972
    }
  },
  'Number System': {
    units: ['Decimal', 'Binary', 'Octal', 'Hex'],
  },
  Speed: {
    units: ['m/s', 'km/s', 'km/h'],
    rates: {
      'm/s': 1, 'km/s': 0.001, 'km/h': 3.6
    }
  }
};

export default function Converter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [category, setCategory] = useState<keyof typeof categories>('Length');
  const [fromUnit, setFromUnit] = useState(categories.Length.units[0]);
  const [toUnit, setToUnit] = useState(categories.Length.units[1]);
  const [fromValue, setFromValue] = useState('1');
  const [toValue, setToValue] = useState('');

  useEffect(() => {
    setFromUnit(categories[category].units[0]);
    setToUnit(categories[category].units[1]);
  }, [category]);

  useEffect(() => {
    calculate();
  }, [fromValue, fromUnit, toUnit, category]);

  const calculate = () => {
    if (!fromValue) {
      setToValue('');
      return;
    }

    if (category === 'Number System') {
      try {
        let decimalValue = 0;
        if (fromUnit === 'Decimal') decimalValue = parseInt(fromValue, 10);
        else if (fromUnit === 'Binary') decimalValue = parseInt(fromValue, 2);
        else if (fromUnit === 'Octal') decimalValue = parseInt(fromValue, 8);
        else if (fromUnit === 'Hex') decimalValue = parseInt(fromValue, 16);

        if (isNaN(decimalValue)) {
          setToValue('Invalid');
          return;
        }

        let res = '';
        if (toUnit === 'Decimal') res = decimalValue.toString(10);
        else if (toUnit === 'Binary') res = decimalValue.toString(2);
        else if (toUnit === 'Octal') res = decimalValue.toString(8);
        else if (toUnit === 'Hex') res = decimalValue.toString(16).toUpperCase();

        setToValue(res);
      } catch (e) {
        setToValue('Error');
      }
      return;
    }

    if (isNaN(Number(fromValue))) {
      setToValue('');
      return;
    }

    const val = Number(fromValue);

    if (category === 'Temperature') {
      let c = 0;
      if (fromUnit === 'C') c = val;
      else if (fromUnit === 'F') c = (val - 32) * 5/9;
      else if (fromUnit === 'K') c = val - 273.15;

      let res = 0;
      if (toUnit === 'C') res = c;
      else if (toUnit === 'F') res = (c * 9/5) + 32;
      else if (toUnit === 'K') res = c + 273.15;

      setToValue(res.toFixed(4).replace(/\.?0+$/, ''));
      return;
    }

    const rates = categories[category as Exclude<keyof typeof categories, 'Temperature' | 'Number System'>].rates;
    const baseVal = val / rates[fromUnit as keyof typeof rates];
    const finalVal = baseVal * rates[toUnit as keyof typeof rates];
    
    setToValue(finalVal.toFixed(6).replace(/\.?0+$/, ''));
  };

  const handleSwap = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue);
  };

  const handleReset = () => {
    setFromValue('');
    setToValue('');
  };

  const isNumberSystem = category === 'Number System';

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6">
      <div 
        className="flex items-center gap-2 mb-6 cursor-pointer group w-fit"
        onClick={() => navigate('/tools')}
      >
        <div className="p-2 rounded-full glass group-hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5 text-[var(--color-accent-conv)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-accent-conv)]">{t('Converter')}</h2>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto gap-2 pb-3 scrollbar-hide mb-1 px-1">
        {Object.keys(categories).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat as keyof typeof categories)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-semibold transition-all duration-300
              ${category === cat 
                ? 'bg-[var(--color-accent-conv)] text-white shadow-[0_0_15px_rgba(0,242,255,0.4)]' 
                : 'glass text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            {t(cat)}
          </button>
        ))}
      </div>

      {/* Conversion Area */}
      <div className="flex-1 flex flex-col gap-4 mt-4 pb-20">
        {/* From */}
        <div className="glass rounded-[2rem] p-6 relative border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <div className="relative mb-4">
            <select 
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="bg-white/5 text-gray-300 text-xs font-medium outline-none px-3 py-1.5 rounded-lg appearance-none pr-8 cursor-pointer border border-white/5 hover:border-white/10 transition-all"
            >
              {categories[category].units.map(u => <option key={u} value={u} className="text-white bg-[#1A1C2E]">{u}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <input
            type={isNumberSystem ? "text" : "number"}
            inputMode={isNumberSystem ? "text" : "decimal"}
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            className="w-full bg-transparent text-5xl font-light outline-none text-white placeholder-gray-700 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
            placeholder="0"
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-6 -my-8 z-10 relative">
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwap}
            className="w-14 h-14 rounded-xl bg-[var(--color-accent-conv)] text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.5)] border-[3px] border-[var(--bg)] transition-all"
          >
            <ArrowUpDown className="w-6 h-6" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: -90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="w-14 h-14 rounded-xl glass text-gray-400 hover:text-white flex items-center justify-center shadow-lg border-[3px] border-[var(--bg)] transition-all"
          >
            <RotateCcw className="w-6 h-6" />
          </motion.button>
        </div>

        {/* To */}
        <div className="glass rounded-[2rem] p-6 relative border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <div className="relative mb-4">
            <select 
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="bg-white/5 text-gray-300 text-xs font-medium outline-none px-3 py-1.5 rounded-lg appearance-none pr-8 cursor-pointer border border-white/5 hover:border-white/10 transition-all"
            >
              {categories[category].units.map(u => <option key={u} value={u} className="text-white bg-[#1A1C2E]">{u}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <input
            type={isNumberSystem ? "text" : "number"}
            value={toValue}
            readOnly
            className="w-full bg-transparent text-5xl font-light outline-none text-[var(--color-accent-conv)] placeholder-gray-700/50 drop-shadow-[0_0_15px_rgba(0,242,255,0.3)]"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}

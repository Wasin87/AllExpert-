import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, RefreshCw, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PasswordGenerator() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);

  const generatePassword = () => {
    let charset = 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
  };

  useEffect(() => {
    generatePassword();
  }, [length, includeNumbers, includeSymbols, includeUppercase]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6">
      <div 
        className="flex items-center gap-2 mb-6 cursor-pointer group w-fit"
        onClick={() => navigate('/tools')}
      >
        <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-all duration-300">
          <ChevronLeft className="w-4 h-4 text-[var(--color-accent-conv)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-accent-conv)] drop-shadow-[0_0_12px_rgba(0,242,255,0.3)]">{t('Password Generator')}</h2>
      </div>

      <div className="flex-1 flex flex-col gap-6 pb-28">
        <div className="glass p-6 rounded-[2rem] flex flex-col gap-5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="bg-black/40 rounded-xl p-4 border border-white/5 min-h-[60px] flex items-center justify-center">
            <p className="text-2xl font-mono text-center break-all text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{password}</p>
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={generatePassword} className="p-3 rounded-xl glass hover:bg-white/5 text-gray-400 hover:text-[var(--color-accent-conv)] transition-all flex items-center gap-1.5 border border-white/5">
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider">RESET</span>
            </button>
            <button onClick={copyToClipboard} className="p-3 rounded-xl glass hover:bg-white/5 text-gray-400 hover:text-[var(--color-accent-conv)] transition-all flex items-center gap-1.5 border border-white/5">
              <Copy className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider">COPY</span>
            </button>
          </div>
        </div>

        <div className="glass p-6 rounded-[2rem] space-y-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div>
            <div className="flex justify-between mb-3 items-center">
              <label className="font-bold text-gray-300 tracking-wide text-sm">{t('LENGTH')}</label>
              <span className="text-xl font-mono text-[var(--color-accent-conv)] drop-shadow-[0_0_8px_rgba(0,242,255,0.3)]">{length}</span>
            </div>
            <input 
              type="range" 
              min="8" 
              max="32" 
              value={length} 
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-[var(--color-accent-conv)] h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            {[
              { label: t('Include Uppercase'), state: includeUppercase, setState: setIncludeUppercase },
              { label: t('Include Numbers'), state: includeNumbers, setState: setIncludeNumbers },
              { label: t('Include Symbols'), state: includeSymbols, setState: setIncludeSymbols }
            ].map((item, idx) => (
              <label key={idx} className="flex items-center justify-between cursor-pointer group">
                <span className="text-gray-300 font-medium text-sm group-hover:text-white transition-colors">{item.label}</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={item.state} 
                    onChange={(e) => item.setState(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-500 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-accent-conv)] peer-checked:after:bg-white peer-checked:shadow-[0_0_8px_rgba(0,242,255,0.3)]"></div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={generatePassword}
          className="w-full py-4 rounded-xl bg-[var(--color-accent-conv)] text-white font-bold text-base tracking-widest mt-auto shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all hover:scale-[1.02] active:scale-95"
        >
          {t('GENERATE')}
        </button>
      </div>
    </div>
  );
}

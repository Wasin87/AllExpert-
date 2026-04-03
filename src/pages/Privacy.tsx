import { useTranslation } from 'react-i18next';
import { ChevronLeft, ShieldCheck, Lock, EyeOff, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6">
      <div 
        className="flex items-center gap-2 mb-8 cursor-pointer group w-fit"
        onClick={() => navigate('/more')}
      >
        <div className="p-2 rounded-full glass group-hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold text-purple-500">{t('Privacy Policy')}</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 space-y-6">
        <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-3xl p-6 border border-gray-200 dark:border-white/5 shadow-sm text-center">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text)] mb-2">{t('Your Privacy Matters')}</h3>
          <p className="text-sm text-gray-500">
            {t('At AllExpert, we are committed to protecting your personal information and your right to privacy.')}
          </p>
        </div>

        <div className="bg-white dark:bg-[var(--color-card-dark)] rounded-3xl p-6 border border-gray-200 dark:border-white/5 shadow-sm space-y-6">
          
          <div className="flex gap-4">
            <div className="mt-1">
              <Database className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[var(--text)] mb-1">{t('Data Collection')}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t('We only collect data that is essential for the app to function. Your notes, history, and preferences are stored locally on your device unless you explicitly choose to sync them.')}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1">
              <Lock className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[var(--text)] mb-1">{t('Security')}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t('We use industry-standard security measures to protect your data. Features like hidden notes are encrypted and protected by your custom password.')}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1">
              <EyeOff className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[var(--text)] mb-1">{t('No Third-Party Sharing')}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t('We do not sell, trade, or rent your personal identification information to others. Your data is yours alone.')}
              </p>
            </div>
          </div>

        </div>

        <div className="text-center text-xs text-gray-400 mt-8">
          {t('Last updated: April 2026')}
        </div>
      </div>
    </div>
  );
}

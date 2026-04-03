import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Moon, Sun, Languages } from 'lucide-react';
import { useEffect } from 'react';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useSettingsStore();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  return (
    <div className="p-6 flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6">{t('Settings')}</h2>

      <div className="space-y-4 flex-1">
        {/* Language Toggle */}
        <div className="glass rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <Languages className="w-5 h-5" />
            </div>
            <span className="font-medium">{t('Language')}</span>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'bn')}
            className="bg-transparent outline-none font-medium text-[var(--color-accent-blue)]"
          >
            <option value="en">English</option>
            <option value="bn">বাংলা</option>
          </select>
        </div>
      </div>

      <div className="text-center pb-8">
        <p className="text-xs text-gray-500">{t('Developed by Wasin')}</p>
        <p className="text-xs text-gray-600 mt-1">AllExpert v2.0.0</p>
      </div>
    </div>
  );
}

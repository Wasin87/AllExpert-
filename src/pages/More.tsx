import { useTranslation } from 'react-i18next';
import { Settings, Info, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function More() {
  const { t } = useTranslation();

  const links = [
    { icon: Settings, label: 'Settings', path: '/settings', color: 'text-blue-500' },
    { icon: Shield, label: 'Privacy Policy', path: '/privacy', color: 'text-purple-500' },
    { icon: Info, label: 'About', path: '/about', color: 'text-gray-500' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{t('More')}</h2>

      <div className="glass rounded-3xl overflow-hidden">
        {links.map((link, index) => (
          <Link 
            key={index} 
            to={link.path}
            className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-colors ${index !== links.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
          >
            <div className={`p-2 rounded-xl bg-gray-100 dark:bg-gray-800 ${link.color}`}>
              <link.icon className="w-5 h-5" />
            </div>
            <span className="font-medium flex-1">{t(link.label)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

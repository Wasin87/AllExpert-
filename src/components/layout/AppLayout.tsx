import { useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Calculator, Wrench, StickyNote, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ParticleBackground from '@/components/ui/ParticleBackground';

export default function AppLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/calculator', icon: Calculator, label: 'Calculator' },
    { path: '/tools', icon: Wrench, label: 'Tools' },
    { path: '/notes', icon: StickyNote, label: 'Notes' },
    { path: '/more', icon: MoreHorizontal, label: 'More' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-[var(--bg)] text-[var(--text)] relative overflow-hidden">
      <ParticleBackground />
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-48 glass border-r border-white/5 z-50">
        <div className="p-4 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[var(--color-accent-blue)] shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            <img src="https://i.ibb.co/mrGsQ2GT/logo.png" alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-base font-bold tracking-tight text-white">
            All<span className="text-[var(--color-accent-blue)]">Expert</span>
          </h1>
        </div>
        <nav className="flex-1 px-2.5 py-3">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-300 relative overflow-hidden group",
                      isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn("w-4.5 h-4.5 transition-all", isActive ? "text-[var(--color-accent-blue)] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "group-hover:text-gray-200")} />
                    <span className="font-medium text-xs">{t(item.label)}</span>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--color-accent-blue)] shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                      />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden relative md:pb-0 pb-20 scroll-smooth scrollbar-hide">
        <div className="max-w-5xl mx-auto h-full px-4 md:px-6 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-full py-4"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass rounded-t-[1.5rem] border-t border-white/10 z-50 h-14 px-1">
        <ul className="flex justify-around items-center h-full">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <li key={item.path} className="flex-1 flex justify-center">
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center w-12 h-12 rounded-lg gap-0 transition-all duration-300",
                    isActive 
                      ? "text-[var(--color-accent-blue)]" 
                      : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  <div className={cn(
                    "p-1 rounded-lg transition-all duration-300",
                    isActive ? "bg-[var(--color-accent-blue)]/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : ""
                  )}>
                    <item.icon className={cn("w-4.5 h-4.5", isActive ? "text-[var(--color-accent-blue)]" : "")} />
                  </div>
                  <span className={cn("text-[8px] font-semibold transition-all", isActive ? "opacity-100" : "opacity-0 h-0")}>{t(item.label)}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

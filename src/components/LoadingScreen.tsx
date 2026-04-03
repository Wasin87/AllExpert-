import { motion } from 'motion/react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-accent-blue)] shadow-[0_0_30px_rgba(59,130,246,0.5)]">
          <img 
            src="https://i.ibb.co/mrGsQ2GT/logo.png" 
            alt="AllExpert Logo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = "https://picsum.photos/seed/allexpert/200/200";
            }}
          />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-2 border-t-4 border-transparent border-r-[var(--color-accent-blue)] rounded-full opacity-50"
        />
      </motion.div>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 text-3xl font-bold text-white tracking-wider"
      >
        All<span className="text-[var(--color-accent-blue)]">Expert</span>
      </motion.h1>
    </div>
  );
}

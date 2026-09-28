import { useState } from 'react';

interface AppLogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  textSize?: string;
  badgeSize?: string;
}

export default function AppLogo({
  className = "",
  imgClassName = "w-full h-full object-cover",
  showText = false,
  textSize = "text-base",
  badgeSize = "w-8 h-8"
}: AppLogoProps) {
  const [imgSrc, setImgSrc] = useState('/logo.png');
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (imgSrc === '/logo.png') {
      setImgSrc('https://i.ibb.co/mrGsQ2GT/logo.png');
    } else {
      setHasError(true);
    }
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`${badgeSize} relative shrink-0 rounded-full overflow-hidden border-2 border-[var(--color-accent-blue)] shadow-[0_0_12px_rgba(59,130,246,0.5)] bg-slate-950 flex items-center justify-center group`}>
        {!hasError ? (
          <img
            src={imgSrc}
            alt="AllExpert Logo"
            className={`${imgClassName} transition-transform duration-300 group-hover:scale-110`}
            onError={handleError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white font-black text-xs tracking-tighter">
            AE
          </div>
        )}
      </div>

      {showText && (
        <span className={`font-bold tracking-tight text-white ${textSize}`}>
          All<span className="text-[var(--color-accent-blue)] drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">Expert</span>
        </span>
      )}
    </div>
  );
}

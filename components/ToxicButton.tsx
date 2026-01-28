
import React from 'react';
import { HoverBorderGradient } from './HoverBorderGradient.tsx';
import { Spinner } from './Spinner.tsx';

interface ToxicButtonProps {
  onClick: () => void;
  isLoading: boolean;
  activeColor: string;
}

const ToxicButton: React.FC<ToxicButtonProps> = ({ onClick, isLoading, activeColor }) => {
  return (
    <HoverBorderGradient
      onClick={onClick}
      disabled={isLoading}
      activeColor={activeColor}
      containerClassName="scale-100 md:scale-110 transition-transform duration-300 active:scale-95"
      className={`
        relative px-8 py-4 font-black text-lg md:text-xl uppercase tracking-tighter italic overflow-hidden border-none flex items-center justify-center min-h-[64px] min-w-[240px]
        ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
      `}
      style={{
        lineHeight: '1',
        boxShadow: isLoading 
          ? 'none' 
          : `inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -4px 12px rgba(0,0,0,0.8), 0 15px 45px rgba(${activeColor}, 0.25)`,
        background: isLoading 
          ? 'transparent' 
          : `linear-gradient(180deg, rgba(${activeColor}, 0.25) 0%, rgba(15, 23, 42, 0.6) 100%)`,
        border: `1px solid rgba(${activeColor}, 0.5)`
      }}
    >
      <span className="relative z-20 flex items-center justify-center text-white text-center">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Spinner size={20} color={`rgb(${activeColor})`} />
            <span className="animate-pulse tracking-widest text-sm font-black" style={{ color: `rgb(${activeColor})` }}>ГЕНЕРИРУЮ ЯД...</span>
          </div>
        ) : (
          <span style={{ textShadow: `0 0 12px rgba(${activeColor}, 1)` }}>Создать комплимент</span>
        )}
      </span>
      
      {/* Световой блик */}
      <div className="absolute inset-0 z-10 opacity-0 hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full pointer-events-none" />
    </HoverBorderGradient>
  );
};

export default ToxicButton;

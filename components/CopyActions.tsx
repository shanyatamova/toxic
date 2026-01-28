
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CopyActionsProps {
  onCopyText: () => void;
  onCopyImage: () => void;
  isLoading: boolean;
  isCopied: boolean;
  activeColor: string;
  className?: string;
}

const Tooltip = ({ text, show, position }: { text: string; show: boolean; position: 'up' | 'down' }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: position === 'up' ? 10 : -10, scale: 0.9, x: '-50%' }}
        animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
        exit={{ opacity: 0, y: position === 'up' ? 10 : -10, scale: 0.9, x: '-50%' }}
        className={`absolute left-1/2 ${position === 'up' ? 'bottom-full mb-4' : 'top-full mt-4'} px-3 py-1.5 bg-slate-900/95 border border-slate-700/50 rounded-lg shadow-2xl z-50 pointer-events-none`}
      >
        <span className="mono text-[10px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap italic">
          {text}
        </span>
        <div className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 border-slate-700/50 rotate-45 ${position === 'up' ? '-bottom-1.5 border-b border-r' : '-top-1.5 border-t border-l'}`} />
      </motion.div>
    )}
  </AnimatePresence>
);

const CopyActions: React.FC<CopyActionsProps> = ({ 
  onCopyText, 
  onCopyImage, 
  isLoading, 
  isCopied, 
  activeColor,
  className = ""
}) => {
  const [hovered, setHovered] = useState<'text' | 'image' | null>(null);

  const btnBase = `
    relative p-3.5 rounded-2xl border transition-all duration-500 flex items-center justify-center backdrop-blur-2xl
    ${isLoading ? 'opacity-20 cursor-wait' : 'hover:scale-110 active:scale-90 shadow-2xl cursor-pointer'}
  `;

  return (
    <div className={`flex flex-col gap-5 items-center ${className}`}>
      {/* ЗАБРАТЬ ЯД (вверх) */}
      <div className="relative">
        <Tooltip text="ЗАБРАТЬ ЯД" show={hovered === 'text'} position="up" />
        <button
          onClick={(e) => { e.stopPropagation(); if (!isLoading) onCopyText(); }}
          disabled={isLoading}
          onMouseEnter={() => setHovered('text')}
          onMouseLeave={() => setHovered(null)}
          className={btnBase}
          style={{ 
            borderColor: hovered === 'text' && !isLoading ? `rgba(${activeColor}, 1)` : 'rgba(255, 255, 255, 0.15)',
            background: hovered === 'text' && !isLoading ? `rgba(${activeColor}, 0.35)` : 'rgba(15, 23, 42, 0.85)',
            boxShadow: hovered === 'text' && !isLoading ? `0 0 30px rgba(${activeColor}, 0.3)` : '0 10px 20px rgba(0,0,0,0.4)'
          }}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* В РАМОЧКУ (вниз) */}
      <div className="relative">
        <Tooltip text="В РАМОЧКУ" show={hovered === 'image'} position="down" />
        <button
          onClick={(e) => { e.stopPropagation(); if (!isLoading) onCopyImage(); }}
          disabled={isLoading}
          onMouseEnter={() => setHovered('image')}
          onMouseLeave={() => setHovered(null)}
          className={btnBase}
          style={{ 
            borderColor: hovered === 'image' && !isLoading ? `rgba(${activeColor}, 1)` : 'rgba(255, 255, 255, 0.15)',
            background: hovered === 'image' && !isLoading ? `rgba(${activeColor}, 0.35)` : 'rgba(15, 23, 42, 0.85)',
            boxShadow: hovered === 'image' && !isLoading ? `0 0 30px rgba(${activeColor}, 0.3)` : '0 10px 20px rgba(0,0,0,0.4)'
          }}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isCopied && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-full ml-4 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none"
          >
            <span className="mono text-[9px] font-black uppercase tracking-[0.4em] text-white italic drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              УШЛО В ЦЕЛЬ
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CopyActions;

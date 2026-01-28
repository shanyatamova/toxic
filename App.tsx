
import React, { useState, useCallback, useMemo, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';
import { generateToxicCompliment, ToxicCategory } from './services/geminiService.ts';
import ToxicButton from './components/ToxicButton.tsx';
import CopyActions from './components/CopyActions.tsx';
import Squares from './components/Squares.tsx';
import { Spinner } from './components/Spinner.tsx';

const CATEGORIES: { id: ToxicCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { 
    id: 'corporate', 
    label: 'Корпоративный террариум', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ), 
    color: '16, 185, 129'
  },
  { 
    id: 'personal', 
    label: 'Личный фронт', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ), 
    color: '244, 63, 94'
  },
  { 
    id: 'friend', 
    label: 'Душный друг', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="15" x2="16" y2="15" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ), 
    color: '245, 158, 11'
  },
];

const INITIAL_TEXTS: Record<ToxicCategory, string> = {
  corporate: "Стань лучшим сотрудником года (в глазах своего психолога)",
  personal: "Будь экспертом в любви (к себе, потому что больше некому)",
  friend: "Держи друзей близко, а врагов еще ближе",
};

interface HistoryItem {
  id: string;
  text: string;
  categoryId: ToxicCategory;
  bgVariant: number;
}

// Ускоряем пружину: делаем её более упругой и отзывчивой
const transitionConfig = {
  type: "spring",
  stiffness: 240, // Повышаем жесткость для быстрого отклика
  damping: 28,    // Оптимальное затухание, чтобы не было лишних колебаний
  mass: 0.8,      // Облегчаем массу для скорости полета
  restDelta: 0.01
};

const App: React.FC = () => {
  const [category, setCategory] = useState<ToxicCategory>('corporate');
  const [compliment, setCompliment] = useState<string>(INITIAL_TEXTS.corporate);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [bgVariant, setBgVariant] = useState<number>(0); 
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  
  const captureRef = useRef<HTMLDivElement>(null);
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const modalCaptureRef = useRef<HTMLDivElement>(null);

  const activeCategory = useMemo(() => {
    return CATEGORIES.find(c => c.id === category) || CATEGORIES[0];
  }, [category]);

  const activeColor = activeCategory.color;

  const getBackgroundStyle = (variant: number, color: string) => {
    switch (variant) {
      case 1: return { background: `linear-gradient(180deg, rgba(${color}, 0.6) 0%, rgba(${color}, 0.3) 40%, #050505 100%)` };
      case 2: return { background: `linear-gradient(135deg, rgba(${color}, 0.6) 0%, #050505 75%)` };
      case 3: return { background: `linear-gradient(to top, rgba(${color}, 0.6) 0%, #050505 100%)` };
      case 4: return { background: `radial-gradient(circle at 50% 0%, rgba(${color}, 0.7) 0%, #050505 100%)` };
      default: return { background: `radial-gradient(circle at 50% 50%, rgba(${color}, 0.5) 0%, #050505 100%)` };
    }
  };

  const pushToHistory = useCallback(() => {
    const isStarter = Object.values(INITIAL_TEXTS).includes(compliment);
    if (compliment && !isStarter) {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        text: compliment,
        categoryId: category,
        bgVariant: bgVariant
      };
      setHistory(prev => [newItem, ...prev].slice(0, 15));
    }
  }, [compliment, category, bgVariant]);

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleCopyImage = async (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current || isCapturing) return;
    
    setIsCapturing(true);
    try {
      const dataUrl = await htmlToImage.toPng(ref.current, { 
        cacheBust: true, 
        pixelRatio: 2, 
        backgroundColor: '#050505'
      });

      if (!navigator.clipboard || !window.ClipboardItem) {
        const link = document.createElement('a');
        link.download = `toxic-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        return;
      }

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      if (blob) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error('Capture failed', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const changeCategory = (newCat: ToxicCategory) => {
    if (newCat === category || isLoading) return;
    pushToHistory();
    setCategory(newCat);
    setCompliment(INITIAL_TEXTS[newCat]);
    setBgVariant(0);
  };

  const handleGenerate = useCallback(async () => {
    pushToHistory();
    setIsLoading(true);
    let nextBg;
    do { nextBg = Math.floor(Math.random() * 5); } while (nextBg === bgVariant);
    
    try {
      const newCompliment = await generateToxicCompliment(category);
      setCompliment(newCompliment);
      setBgVariant(nextBg);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [category, bgVariant, compliment, pushToHistory]);

  const scrollHistory = (direction: 'left' | 'right') => {
    if (historyScrollRef.current) {
      const scrollAmount = 240;
      historyScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start px-4 pt-4 pb-8 md:pt-6 relative overflow-hidden text-slate-200 antialiased selection:bg-white/10">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Squares 
          direction="diagonal"
          speed={0.4}
          squareSize={60}
          borderColor={`rgba(${activeColor}, 0.15)`}
          hoverFillColor={`rgba(${activeColor}, 0.2)`}
        />
      </div>

      <div className="scanline z-10"></div>
      
      <header className="text-center mb-6 md:mb-10 relative z-20 w-full flex flex-col items-center">
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic whitespace-nowrap leading-[0.85] md:mt-6">
          <span style={{ color: `rgb(${activeColor})` }} className="transition-colors duration-500">TOXIC</span>COMPLIMENTS
        </h1>
      </header>

      {/* Кнопки категорий */}
      <div className="flex flex-row flex-wrap gap-2 md:gap-3 mb-8 md:mb-10 w-full max-w-5xl relative z-20 px-2 justify-center items-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            disabled={isLoading}
            onClick={() => changeCategory(cat.id)}
            style={{ 
              borderColor: category === cat.id ? `rgb(${cat.color})` : 'transparent',
              boxShadow: category === cat.id ? `0 0 20px rgba(${cat.color}, 0.2)` : 'none',
              borderWidth: '2px'
            }}
            className={`
              relative flex flex-row items-center justify-center py-2 px-4 md:py-2.5 md:px-6 rounded-full transition-all duration-500 group overflow-hidden min-w-fit border-solid
              ${category === cat.id 
                ? 'bg-slate-900/90 scale-[1.02] opacity-100 shadow-xl cursor-default' 
                : 'bg-slate-900/30 opacity-60 hover:opacity-100 hover:bg-slate-900/60 cursor-pointer'
              }
              ${isLoading ? 'opacity-40 grayscale cursor-wait' : ''}
            `}
          >
            {isLoading && category === cat.id && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px]">
                 <Spinner size={14} color={`rgb(${cat.color})`} />
              </div>
            )}
            
            <div 
              className={`w-3.5 h-3.5 md:w-4 md:h-4 mr-2 transition-all duration-500 ${category === cat.id ? 'scale-110' : 'opacity-40 grayscale group-hover:opacity-80 group-hover:grayscale-0'}`}
              style={{ color: category === cat.id ? `rgb(${cat.color})` : '#94a3b8' }}
            >
              {cat.icon}
            </div>
            <span 
              className="mono font-black text-[9px] md:text-[11px] uppercase tracking-widest text-center italic whitespace-nowrap"
              style={{ color: category === cat.id ? `rgb(${cat.color})` : '#94a3b8' }}
            >
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      <main className="w-full max-w-5xl relative z-20 flex flex-col items-center">
        <div className="relative mb-10 md:mb-12">
            <div className="relative w-[260px] sm:w-[280px] md:w-[320px]">
                <div className="relative p-1 rounded-[2rem] md:rounded-[2.5rem] border-[1px] border-slate-800 bg-slate-900 shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden w-full">
                    <div className="w-full h-full rounded-[1.8rem] md:rounded-[2.3rem] overflow-hidden">
                        <div 
                            ref={captureRef}
                            className="aspect-[4/5] w-full relative flex flex-col transition-all duration-700 bg-slate-950"
                            style={getBackgroundStyle(bgVariant, activeColor)}
                        >
                            <div className="relative z-10 flex-grow flex items-center justify-center p-6 md:p-8 h-full">
                                <AnimatePresence mode="wait">
                                  <motion.p 
                                      key={compliment}
                                      initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                                      animate={{ 
                                        opacity: isLoading ? 0 : 1, 
                                        scale: isLoading ? 0.95 : 1, 
                                        filter: isLoading ? 'blur(20px)' : 'blur(0px)' 
                                      }}
                                      transition={{ 
                                        duration: 0.8, 
                                        ease: [0.16, 1, 0.3, 1],
                                        delay: isLoading ? 0 : 0.2
                                      }}
                                      className="mono text-white text-base sm:text-lg md:text-xl font-black leading-relaxed text-center italic"
                                      style={{ textShadow: `0 4px 20px rgba(${activeColor}, 0.4), 0 0 8px rgba(0,0,0,0.8)` }}
                                  >
                                      {compliment}
                                  </motion.p>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                <CopyActions 
                    onCopyText={() => handleCopyText(compliment)}
                    onCopyImage={() => handleCopyImage(captureRef)}
                    isLoading={isLoading || isCapturing}
                    isCopied={isCopied}
                    activeColor={activeColor}
                    className="absolute -right-6 md:-right-7 top-1/2 -translate-y-1/2 z-30"
                />
            </div>
        </div>

        <div className="w-full flex justify-center mb-16 md:mb-20">
            <ToxicButton onClick={handleGenerate} isLoading={isLoading} activeColor={activeColor} />
        </div>

        {history.length > 0 && (
          <motion.div layout className="w-full mt-4 max-w-4xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4 px-4">
              <div className="flex flex-col">
                <h3 className="mono text-[9px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-500 italic">Архив унижений</h3>
                <div className="h-0.5 w-10 bg-slate-800 mt-1"></div>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => scrollHistory('left')} className="p-1.5 rounded-full bg-slate-900/80 border border-slate-800 hover:border-slate-500 transition-all active:scale-90 shadow-lg cursor-pointer">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                 </button>
                 <button onClick={() => scrollHistory('right')} className="p-1.5 rounded-full bg-slate-900/80 border border-slate-800 hover:border-slate-500 transition-all active:scale-90 shadow-lg cursor-pointer">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </button>
              </div>
            </div>
            
            <div ref={historyScrollRef} className="flex gap-3 overflow-x-auto pb-6 px-4 w-full no-scrollbar scroll-smooth">
              {history.map((item) => {
                const catInfo = CATEGORIES.find(c => c.id === item.categoryId) || CATEGORIES[0];
                return (
                  <motion.div 
                    layoutId={`card-${item.id}`}
                    layout
                    transition={transitionConfig}
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="flex-shrink-0 w-24 md:w-32 aspect-[4/5] rounded-xl md:rounded-2xl overflow-hidden border border-slate-900 shadow-2xl relative group transition-all cursor-pointer hover:border-slate-700"
                    style={getBackgroundStyle(item.bgVariant, catInfo.color)}
                  >
                    <div className="p-2 md:p-4 h-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity text-wrap">
                      <p className="mono text-white text-[7px] md:text-[9px] font-black text-center italic line-clamp-6 leading-relaxed">{item.text}</p>
                    </div>
                    <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 md:w-3.5 md:h-3.5 opacity-40 group-hover:opacity-80 transition-all" style={{ color: `rgb(${catInfo.color})` }}>
                      {catInfo.icon}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0, transition: { duration: 0.25 } }} 
              onClick={() => setSelectedItem(null)} 
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-xl cursor-zoom-out" 
            />
            <div className="relative w-[260px] sm:w-[280px] md:w-[320px] pointer-events-none">
              <motion.div 
                layoutId={`card-${selectedItem.id}`}
                transition={transitionConfig}
                className="relative p-1 rounded-[2.5rem] border-[1px] border-slate-800 bg-slate-900 shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden w-full pointer-events-auto"
              >
                 <div className="w-full h-full rounded-[2.3rem] overflow-hidden">
                    <div 
                        ref={modalCaptureRef} 
                        className="aspect-[4/5] w-full relative flex flex-col bg-slate-950" 
                        style={getBackgroundStyle(selectedItem.bgVariant, CATEGORIES.find(c => c.id === selectedItem.categoryId)?.color || '255,255,255')}
                    >
                        <div className="relative z-10 flex-grow flex items-center justify-center p-8 h-full">
                            <p className="mono text-white text-lg sm:text-xl md:text-2xl font-black leading-relaxed text-center italic" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>{selectedItem.text}</p>
                        </div>
                    </div>
                 </div>
              </motion.div>

              <CopyActions 
                onCopyText={() => handleCopyText(selectedItem.text)}
                onCopyImage={() => handleCopyImage(modalCaptureRef)}
                isLoading={isCapturing}
                isCopied={isCopied}
                activeColor={CATEGORIES.find(c => c.id === selectedItem.categoryId)?.color || '255,255,255'}
                className="absolute -right-6 md:-right-7 top-1/2 -translate-y-1/2 z-30 pointer-events-auto"
              />

              <motion.button 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
                onClick={() => setSelectedItem(null)} 
                className="fixed top-4 right-4 md:top-6 md:right-6 p-3 md:p-4 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-all active:scale-90 cursor-pointer pointer-events-auto"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </motion.button>
            </div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-auto py-4 text-slate-800 text-[7px] md:text-[8px] mono text-center relative z-20 uppercase tracking-[0.5em] opacity-20 w-full">
        <p>© {new Date().getFullYear()} Passive Aggressive Lab</p>
      </footer>
    </div>
  );
};

export default App;

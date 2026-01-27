
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

// Add disabled prop to the interface to support button-like behavior when used as a button
export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button" as any,
  duration = 1,
  clockwise = true,
  activeColor = "255, 255, 255",
  ...props
}: React.PropsWithChildren<{
  as?: React.ElementType;
  containerClassName?: string;
  className?: string;
  duration?: number;
  clockwise?: boolean;
  activeColor?: string;
  disabled?: boolean;
} & React.HTMLAttributes<HTMLElement>>) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  // Градиенты для каждой стороны
  const movingMap: Record<Direction, string> = {
    TOP: `radial-gradient(40% 60% at 50% 0%, rgba(${activeColor}, 1) 0%, rgba(${activeColor}, 0) 100%)`,
    LEFT: `radial-gradient(35% 55% at 0% 50%, rgba(${activeColor}, 1) 0%, rgba(${activeColor}, 0) 100%)`,
    BOTTOM: `radial-gradient(40% 60% at 50% 100%, rgba(${activeColor}, 1) 0%, rgba(${activeColor}, 0) 100%)`,
    RIGHT: `radial-gradient(35% 55% at 100% 50%, rgba(${activeColor}, 1) 0%, rgba(${activeColor}, 0) 100%)`,
  };

  useEffect(() => {
    // Анимация работает всегда, но ускоряется или становится ярче при ховере
    const interval = setInterval(() => {
      setDirection((prevState) => rotateDirection(prevState));
    }, duration * 375); 
    return () => clearInterval(interval);
  }, [duration, clockwise]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex rounded-full content-center bg-slate-900/60 transition-all duration-500 items-center flex-col flex-nowrap justify-center overflow-visible p-px decoration-clone w-fit ${containerClassName || ""}`}
      {...props}
    >
      <div
        className={`w-auto text-white z-10 bg-slate-950 px-6 py-3 rounded-[inherit] transition-colors duration-500 ${className || ""}`}
      >
        {children}
      </div>

      <motion.div
        className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit] pointer-events-none"
        style={{
          filter: "blur(2.5px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        animate={{
          opacity: hovered ? 1 : 0.7, // Сделали границу заметнее в покое
          background: movingMap[direction],
        }}
        transition={{ 
          opacity: { duration: 0.3 },
          background: { ease: "linear", duration: 0.35 } 
        }}
      />
      
      <div className="bg-slate-950 absolute z-1 flex-none inset-[1.5px] rounded-[inherit] pointer-events-none" />
      
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1.15 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-[-1] rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, rgba(${activeColor}, 0.9) 0%, transparent 75%)`,
              filter: "blur(30px)",
            }}
          />
        )}
      </AnimatePresence>
    </Tag>
  );
}

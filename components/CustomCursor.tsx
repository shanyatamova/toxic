
import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface CustomCursorProps {
  activeColor: string;
}

const CustomCursor: React.FC<CustomCursorProps> = ({ activeColor }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Motion values для мгновенной позиции
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Настройки пружины для идеальной плавности (эффект "жидкости")
  // damping: 35 (убирает осцилляции/тряску), stiffness: 250 (дает отзывчивость)
  const springConfig = { damping: 35, stiffness: 250, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('[role="button"]') ||
        target.classList.contains('cursor-pointer');
      
      setIsHovered(!!isInteractive);
    };

    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveMouse);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);

    return () => {
      window.removeEventListener('mousemove', moveMouse);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] hidden md:block">
      <motion.div
        className="absolute rounded-full"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovered ? 24 : 12,
          height: isHovered ? 24 : 12,
          backgroundColor: `rgb(${activeColor})`,
          // Мягкое неоновое свечение
          boxShadow: `0 0 ${isHovered ? '25px' : '12px'} rgb(${activeColor})`,
          // Дополнительный слой свечения для объема
          filter: `drop-shadow(0 0 4px rgba(${activeColor}, 0.5))`,
        }}
        animate={{
          scale: isClicked ? 0.6 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          // Плавный переход при изменении размера (hover/click)
          type: "spring",
          damping: 20,
          stiffness: 300,
          opacity: { duration: 0.2 }
        }}
      />
    </div>
  );
};

export default CustomCursor;

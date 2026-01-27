
import React, { useRef, useEffect } from 'react';

type CanvasStrokeStyle = string | CanvasGradient | CanvasPattern;

export interface SquaresProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
  speed?: number;
  borderColor?: CanvasStrokeStyle;
  squareSize?: number;
  hoverFillColor?: CanvasStrokeStyle;
}

export const Squares: React.FC<SquaresProps> = ({
  direction = 'right',
  speed = 1,
  borderColor = '#999',
  squareSize = 40,
  hoverFillColor = '#222'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const offsetRef = useRef({ x: 0, y: 0 });
  const hoveredSquareRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const draw = (time: number) => {
      if (!ctx || !canvas) return;

      // Рассчитываем дельту времени для плавной анимации
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Обновляем смещение сетки
      const moveStep = (speed * deltaTime) / 20; // Коэффициент скорости
      
      switch (direction) {
        case 'right': offsetRef.current.x -= moveStep; break;
        case 'left':  offsetRef.current.x += moveStep; break;
        case 'up':    offsetRef.current.y += moveStep; break;
        case 'down':  offsetRef.current.y -= moveStep; break;
        case 'diagonal':
          offsetRef.current.x -= moveStep;
          offsetRef.current.y -= moveStep;
          break;
      }

      // Зацикливаем смещение в пределах одного квадрата
      offsetRef.current.x %= squareSize;
      offsetRef.current.y %= squareSize;

      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 1;
      ctx.strokeStyle = borderColor;

      // Рисуем сетку с учетом смещения
      // Добавляем по одному квадрату с каждой стороны, чтобы не было пустых зон при движении
      for (let x = offsetRef.current.x - squareSize; x < width + squareSize; x += squareSize) {
        for (let y = offsetRef.current.y - squareSize; y < height + squareSize; y += squareSize) {
          
          // Проверка ховера
          if (hoveredSquareRef.current) {
            const mouseX = hoveredSquareRef.current.x;
            const mouseY = hoveredSquareRef.current.y;
            if (mouseX >= x && mouseX < x + squareSize && mouseY >= y && mouseY < y + squareSize) {
              ctx.fillStyle = hoverFillColor;
              ctx.fillRect(x, y, squareSize, squareSize);
            }
          }

          ctx.strokeRect(x, y, squareSize, squareSize);
        }
      }

      // Виньетка (градиент затемнения к краям)
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.sqrt(width**2 + height**2) / 2
      );
      gradient.addColorStop(0, 'rgba(2, 6, 23, 0)');
      gradient.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      requestRef.current = requestAnimationFrame(draw);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      hoveredSquareRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      hoveredSquareRef.current = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    requestRef.current = requestAnimationFrame((t) => {
      lastTimeRef.current = t;
      draw(t);
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full border-none block bg-transparent"
    />
  );
};

export default Squares;

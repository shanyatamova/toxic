
import React from 'react';

// Explicitly include className in SpinnerProps to ensure it's recognized by the compiler
interface SpinnerProps extends React.ComponentProps<'div'> {
  size?: number;
  invert?: boolean;
  disabled?: boolean;
  color?: string;
  className?: string;
}

export function Spinner({ size = 16, invert, disabled, className = "", color, ...props }: SpinnerProps) {
  if (disabled) return null;

  const sizePx = `${size}px`;
  const barWidth = `${(size * 0.2).toFixed(2)}px`;
  const barHeight = `${(size * 0.1).toFixed(2)}px`;
  
  return (
    <div 
      className={`relative ${className}`} 
      style={{ width: sizePx, height: sizePx }} 
      {...props}
    >
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 flex animate-spin justify-center"
          style={{
            animationDelay: `${i * 120}ms`,
            animationDuration: '1s'
          }}
        >
          <div
            style={{
              backgroundColor: color || 'currentColor',
              width: barWidth,
              height: barHeight,
              borderRadius: '9999px',
              marginTop: '0px'
            }}
          />
        </div>
      ))}
    </div>
  );
}

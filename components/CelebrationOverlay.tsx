import React from 'react';

export const CelebrationOverlay: React.FC = () => {
  // Generate deterministic arrays to avoid re-renders creating jitter
  const confetti = Array.from({ length: 50 });
  const fireworks = Array.from({ length: 5 });

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Confetti Layer */}
      {confetti.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 3 + Math.random() * 2;
        const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <div
            key={`confetti-${i}`}
            className="absolute w-2 h-3 rounded-[1px] opacity-0"
            style={{
              left: `${left}%`,
              top: '-10px',
              backgroundColor: color,
              animation: `confetti ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}

      {/* Fireworks Layer */}
      {fireworks.map((_, i) => {
          const top = 10 + Math.random() * 40; // Keep fireworks in top half
          const left = 10 + Math.random() * 80;
          const delay = Math.random() * 3;
          
          return (
            <div 
                key={`fw-${i}`} 
                className="absolute w-0 h-0"
                style={{
                    top: `${top}%`,
                    left: `${left}%`
                }}
            >
                {[...Array(12)].map((__, j) => {
                    const angle = j * (360 / 12);
                    const rad = (angle * Math.PI) / 180;
                    const distance = 60 + Math.random() * 40;
                    const tx = Math.cos(rad) * distance;
                    const ty = Math.sin(rad) * distance;
                    const color = ['#f87171', '#60a5fa', '#4ade80', '#facc15', '#c084fc'][i % 5];

                    return (
                        <div 
                            key={j}
                            className="absolute w-2 h-2 rounded-full opacity-0"
                            style={{
                                backgroundColor: color,
                                '--tx': `${tx}px`,
                                '--ty': `${ty}px`,
                                animation: 'particles 1.5s ease-out infinite',
                                animationDelay: `${delay}s`
                            } as React.CSSProperties}
                        />
                    );
                })}
            </div>
          );
      })}
    </div>
  );
};
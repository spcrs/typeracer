import React, { useEffect, useState } from "react";

export const Countdown: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const finishTimeout = setTimeout(() => onComplete(), 600);
      return () => clearTimeout(finishTimeout);
    }
  }, [count, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-900/90 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-md relative overflow-hidden max-w-sm w-full">
      {/* Background Radial Ambient Glow */}
      <div className="absolute inset-0 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />

      <span className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">
        {count === 0 ? "Get Ready" : "Race Starts In"}
      </span>

      <div className="h-32 flex items-center justify-center">
        <span
          key={count}
          className={`font-mono font-black text-8xl tracking-tight animate-countdown ${
            count === 3
              ? "text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]"
              : count === 2
              ? "text-indigo-400 drop-shadow-[0_0_25px_rgba(129,140,248,0.5)]"
              : count === 1
              ? "text-violet-400 drop-shadow-[0_0_25px_rgba(167,139,250,0.5)]"
              : "text-emerald-400 text-7xl drop-shadow-[0_0_35px_rgba(52,211,153,0.7)]"
          }`}
        >
          {count === 0 ? "GO!" : count}
        </span>
      </div>

      <p className="text-xs text-slate-500 mt-2">Hands on the keyboard!</p>
    </div>
  );
};
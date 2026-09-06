import React, { useEffect, useState } from "react";

export const Countdown: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [count, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-900/90 border border-slate-700 rounded-3xl shadow-2xl animate-fade-in">
      <span className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">
        Starting in
      </span>
      <span className="text-7xl font-mono font-black text-indigo-400 animate-bounce">
        {count === 0 ? "GO!" : count}
      </span>
    </div>
  );
};
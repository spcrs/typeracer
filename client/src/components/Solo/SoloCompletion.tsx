import React from "react";
import type { TypingStats } from "../../hooks/useTyping";

interface SoloCompletionProps {
  stats: TypingStats;
  onRestart: () => void;
  onHome: () => void;
}

export const SoloCompletion: React.FC<SoloCompletionProps> = ({ stats, onRestart, onHome }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-800/60 border border-slate-700 rounded-3xl shadow-2xl max-w-lg w-full text-center">
      <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2">
        Race Complete
      </span>
      <h2 className="text-3xl font-black text-white mb-6 tracking-tight">Great Typing!</h2>

      <div className="grid grid-cols-3 gap-4 w-full mb-8">
        <div className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-2xl">
          <p className="text-xs text-slate-400 mb-1 font-semibold">Speed</p>
          <p className="text-3xl font-extrabold text-indigo-400">{stats.wpm}</p>
          <p className="text-[10px] text-slate-500 uppercase">WPM</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-2xl">
          <p className="text-xs text-slate-400 mb-1 font-semibold">Accuracy</p>
          <p className="text-3xl font-extrabold text-emerald-400">{stats.accuracy}%</p>
          <p className="text-[10px] text-slate-500 uppercase">Score</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-2xl">
          <p className="text-xs text-slate-400 mb-1 font-semibold">Time</p>
          <p className="text-3xl font-extrabold text-amber-400">{stats.timeTaken}s</p>
          <p className="text-[10px] text-slate-500 uppercase">Total</p>
        </div>
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={onRestart}
          className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-lg"
        >
          Race Again
        </button>
        <button
          onClick={onHome}
          className="px-6 py-3.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-slate-200 font-semibold rounded-xl transition"
        >
          Menu
        </button>
      </div>
    </div>
  );
};
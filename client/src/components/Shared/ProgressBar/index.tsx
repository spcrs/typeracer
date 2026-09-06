import React from "react";
import type { RoomUser } from "../../../types";

interface ProgressBarProps {
  user: RoomUser;
  isSelf: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ user, isSelf }) => {
  const isFinished = user.status === "finished";

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-sm ${
        isSelf
          ? "bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-950/40"
          : "bg-slate-900/60 border-slate-800"
      }`}
    >
      {/* Active Accent Bar on left edge for self */}
      {isSelf && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l" />
      )}

      {/* Row Header Info */}
      <div className="flex justify-between items-center text-xs mb-2 font-medium">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-200 truncate">
            {user.nickname}
          </span>
          {isSelf && (
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">
              You
            </span>
          )}
          {isFinished && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 animate-pulse">
              Finished
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-slate-400 font-mono text-xs">
          <span>
            <strong className="text-indigo-400 font-bold text-sm">{user.wpm}</strong>{" "}
            <span className="text-[10px] text-slate-500 uppercase">WPM</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-semibold min-w-[36px] text-right">
            {Math.round(user.progress)}%
          </span>
        </div>
      </div>

      {/* Track Container */}
      <div className="relative w-full h-3 bg-slate-950/80 rounded-full border border-slate-800 overflow-visible">
        {/* Progress Fill */}
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full relative ${
            isFinished
              ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
              : isSelf
              ? "bg-gradient-to-r from-indigo-600 to-violet-500"
              : "bg-gradient-to-r from-slate-700 to-slate-500"
          }`}
          style={{ width: `${Math.min(user.progress, 100)}%` }}
        >
          {/* Animated Mini Racer Indicator sitting on the track edge */}
          <span
            className="absolute -right-2.5 -top-2.5 text-xs transition-transform duration-200 select-none filter drop-shadow-md"
            style={{
              transform: user.progress > 0 ? "scale(1)" : "scale(0)",
            }}
          >
            🏎️
          </span>
        </div>
      </div>
    </div>
  );
};
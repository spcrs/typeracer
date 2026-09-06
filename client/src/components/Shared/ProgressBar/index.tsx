import React from "react";
import type { RoomUser } from "../../../types";

interface ProgressBarProps {
  user: RoomUser;
  isSelf: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ user, isSelf }) => {
  return (
    <div
      className={`p-3 rounded-xl border transition-all duration-300 ${
        isSelf
          ? "bg-indigo-950/40 border-indigo-500/50 shadow-md"
          : "bg-slate-900/60 border-slate-800"
      }`}
    >
      <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-200 truncate">
            {user.nickname} {isSelf && <span className="text-indigo-400 font-bold">(You)</span>}
          </span>
          {user.status === "finished" && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
              Finished
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-mono">
          <span>{user.wpm} <span className="text-[10px] text-slate-500">WPM</span></span>
          <span className="text-indigo-300 font-bold">{user.progress}%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${
            user.status === "finished"
              ? "bg-emerald-500"
              : isSelf
              ? "bg-indigo-500"
              : "bg-slate-500"
          }`}
          style={{ width: `${Math.min(user.progress, 100)}%` }}
        />
      </div>
    </div>
  );
};
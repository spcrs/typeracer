import React from "react";
import { useApp } from "../../../context/useAppContext";
import { useRoom } from "../../../context/userRoomContext";

export const Leaderboard: React.FC = () => {
  const {
    leaderboard,
    leaveRoom,
    isAdmin,
    requestRematch,
    rejoinLobby,
    rematchAvailable,
    error,
  } = useRoom();
  const { nickname } = useApp();

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-xl">🥇</span>;
      case 2:
        return <span className="text-xl">🥈</span>;
      case 3:
        return <span className="text-xl">🥉</span>;
      default:
        return <span className="font-mono text-slate-500 font-bold">#{rank}</span>;
    }
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-700/80 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center">
      <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-1">
        Results
      </span>
      <h2 className="text-3xl font-black text-white mb-6 tracking-tight">Race Standings</h2>

      {/* Host left banner notification */}
      {error && (
        <div className="w-full mb-6 p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-center text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Standings Table */}
      <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-semibold bg-slate-900/50">
              <th className="py-3 px-4 text-center">Rank</th>
              <th className="py-3 px-4">Racer</th>
              <th className="py-3 px-4 text-right">Speed</th>
              <th className="py-3 px-4 text-right">Accuracy</th>
              <th className="py-3 px-4 text-right">Time</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {leaderboard.map((entry) => {
              const isSelf = entry.nickname === nickname;
              return (
                <tr
                  key={entry.rank + entry.nickname}
                  className={`transition-colors ${
                    isSelf ? "bg-indigo-950/30 font-medium" : "hover:bg-slate-800/20"
                  }`}
                >
                  <td className="py-3.5 px-4 text-center w-12">{getRankBadge(entry.rank)}</td>
                  <td className="py-3.5 px-4">
                    <span className={isSelf ? "text-indigo-300 font-bold" : "text-slate-200"}>
                      {entry.nickname}
                    </span>
                    {isSelf && (
                      <span className="ml-1.5 text-[10px] text-indigo-400 font-semibold">
                        (You)
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-indigo-400 font-bold">
                    {entry.wpm} <span className="text-[10px] font-normal text-slate-500">WPM</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                    {entry.accuracy}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                    {entry.timeTaken !== null ? `${entry.timeTaken}s` : "—"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {entry.status === "Finished" ? (
                      <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                        Finished
                      </span>
                    ) : (
                      <span className="text-[11px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                        {entry.progress}%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center">
        {/* Host controls */}
        {isAdmin && !error && (
          <button
            onClick={requestRematch}
            className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-950/50 cursor-pointer"
          >
            Start Rematch
          </button>
        )}

        {/* Non-host controls: Only shows if host opened a rematch and has not left */}
        {!isAdmin && rematchAvailable && !error && (
          <button
            onClick={rejoinLobby}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-950/50 animate-pulse cursor-pointer"
          >
            Rejoin Lobby
          </button>
        )}

        {/* Universal Exit */}
        <button
          onClick={leaveRoom}
          className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
        >
          {error ? "Back to Home" : "Leave Room"}
        </button>
      </div>

      {/* Non-host waiting status if rematch is not yet clicked */}
      {!isAdmin && !rematchAvailable && !error && (
        <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-ping" />
          Waiting for host to start a rematch...
        </p>
      )}
    </div>
  );
};
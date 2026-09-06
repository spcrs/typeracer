import React, { useState } from "react";
import { useRoom } from "../../../context/userRoomContext";



export const Lobby: React.FC = () => {
  const { roomId, users, isAdmin, leaveRoom, startRace } = useRoom();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const userList = Object.entries(users);

  return (
    <div className="w-full max-w-xl bg-slate-800/60 border border-slate-700 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
      {/* Room Tag Header */}
      <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-1">
        Race Lobby
      </span>
      <h2 className="text-xl text-slate-300 font-medium mb-6">Invite Your Opponents</h2>

      {/* Shareable Room ID Banner */}
      <div
        onClick={handleCopy}
        className="group relative flex items-center justify-between w-full max-w-xs px-6 py-4 bg-slate-950 border border-indigo-500/30 hover:border-indigo-500 rounded-2xl cursor-pointer transition shadow-inner mb-8"
      >
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Room Code</p>
          <p className="text-3xl font-mono font-black text-indigo-400 tracking-widest">{roomId}</p>
        </div>
        <span className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
          {copied ? "Copied!" : "Copy"}
        </span>
      </div>

      {/* Connected Users Roster */}
      <div className="w-full mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Racers Connected
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono font-medium">
            {userList.length} / 10
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
          {userList.map(([socketId, user], idx) => (
            <div
              key={socketId}
              className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border border-slate-700/60 rounded-xl"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="text-sm">🏎️</span>
                <span className="text-sm font-medium text-slate-200 truncate">
                  {user.nickname}
                </span>
              </div>
              {idx === 0 && (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Host
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4 w-full">
        <button
          onClick={leaveRoom}
          className="flex-1 py-3.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl transition"
        >
          Leave Room
        </button>

        {isAdmin ? (
          <button
            onClick={startRace}
            className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg cursor-pointer"
          >
            Start Race
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900/60 border border-slate-800 text-slate-400 text-sm rounded-xl">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            Waiting for host...
          </div>
        )}
      </div>
    </div>
  );
};
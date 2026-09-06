import React, { useState } from "react";
import { useRoom } from "../../../context/userRoomContext";

export const JoinRoom: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { joinRoom, error } = useRoom();
  const [roomIdInput, setRoomIdInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomIdInput.trim().length === 6) {
      joinRoom(roomIdInput.trim());
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-800/60 border border-slate-700 p-8 rounded-3xl shadow-xl">
      <h3 className="text-2xl font-bold text-white mb-2">Join a Race</h3>
      <p className="text-slate-400 text-sm mb-6">Enter the 6-character room code from your host.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            maxLength={6}
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
            placeholder="e.g. A3F9KL"
            className="w-full px-4 py-3.5 text-center tracking-widest text-2xl font-mono uppercase bg-slate-950 border border-slate-700 rounded-xl text-indigo-400 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            autoFocus
          />
          {error && <p className="text-rose-400 text-xs mt-2 text-center">{error}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-xl transition"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={roomIdInput.trim().length !== 6}
            className="flex-1 py-3 bg-indigo-600 disabled:bg-indigo-900 disabled:text-slate-500 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-md"
          >
            Enter Lobby
          </button>
        </div>
      </form>
    </div>
  );
};
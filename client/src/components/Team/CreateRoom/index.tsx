import React, { useState } from "react";
import { useRoom } from "../../../context/userRoomContext";

export const CreateRoom: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { createRoom } = useRoom();
  const [wordCount, setWordCount] = useState(50);
  const [timeLimit, setTimeLimit] = useState(120);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRoom(wordCount, timeLimit);
  };

  return (
    <div className="w-full max-w-md bg-slate-800/60 border border-slate-700 p-8 rounded-3xl shadow-xl">
      <h3 className="text-2xl font-bold text-white mb-2">Create a Race Room</h3>
      <p className="text-slate-400 text-sm mb-6">Configure the round parameters.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2 font-medium">
            <label className="text-slate-300">Word Count Target</label>
            <span className="text-indigo-400 font-bold">{wordCount} words</span>
          </div>
          <input
            type="range"
            min={25}
            max={300}
            step={25}
            value={wordCount}
            onChange={(e) => setWordCount(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>25 words</span>
            <span>150 words</span>
            <span>300 words</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2 font-medium">
            <label className="text-slate-300">Time Limit</label>
            <span className="text-indigo-400 font-bold">{timeLimit}s ({Math.floor(timeLimit / 60)}m {timeLimit % 60 ? `${timeLimit % 60}s` : ""})</span>
          </div>
          <input
            type="range"
            min={30}
            max={300}
            step={30}
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>30s</span>
            <span>2.5m</span>
            <span>5m</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-md"
          >
            Create Room
          </button>
        </div>
      </form>
    </div>
  );
};
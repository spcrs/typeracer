import React from 'react';
import { useApp } from '../../context/useAppContext';

export const HomeScreen: React.FC = () => {
  const { nickname, setCurrentScreen } = useApp();

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
          Ready to race, <span className="text-indigo-400">{nickname}</span>?
        </h2>
        <p className="text-slate-400 text-sm">
          Select a mode below to hit the track.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
        {/* Solo Card */}
        <button
          onClick={() => setCurrentScreen('solo')}
          className="flex flex-col items-start p-6 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700 hover:border-indigo-500 rounded-2xl transition duration-200 text-left group shadow-lg"
        >
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 mb-2">
            Practice
          </span>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition">
            Solo Race
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Test your typing speed and accuracy against random passages without a lobby.
          </p>
        </button>

        {/* Team Card */}
        <button
          onClick={() => setCurrentScreen('team')}
          className="flex flex-col items-start p-6 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700 hover:border-violet-500 rounded-2xl transition duration-200 text-left group shadow-lg"
        >
          <span className="text-xs uppercase tracking-wider font-semibold text-violet-400 mb-2">
            Multiplayer
          </span>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition">
            Team Race
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Create or join a private room with up to 10 players and race head-to-head live.
          </p>
        </button>
      </div>
    </div>
  );
};
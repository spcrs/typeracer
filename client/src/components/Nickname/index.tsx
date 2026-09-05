import React, { useState } from 'react';
import { useApp } from '../../context/useAppContext';

export const NicknameScreen: React.FC = () => {
  const { nickname, setNickname, setCurrentScreen } = useApp();
  const [inputName, setInputName] = useState(nickname);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) {
      setError('Please enter a nickname.');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 16) {
      setError('Nickname must be between 2 and 16 characters.');
      return;
    }
    setNickname(trimmed);
    setCurrentScreen('home');
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl shadow-xl w-full max-w-md">
      <h2 className="text-2xl font-bold text-white mb-2">Welcome to TypeRacer</h2>
      <p className="text-slate-400 text-sm mb-6 text-center">
        Choose a racer tag to get started.
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <input
            type="text"
            value={inputName}
            onChange={(e) => {
              setInputName(e.target.value);
              setError('');
            }}
            placeholder="e.g. SpeedDemon"
            maxLength={16}
            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            autoFocus
          />
          {error && <p className="text-rose-400 text-xs mt-1.5">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-semibold text-white rounded-lg transition shadow-md"
        >
          Continue
        </button>
      </form>
    </div>
  );
};
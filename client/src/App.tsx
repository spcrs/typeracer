import React from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useAppContext';
import { NicknameScreen } from './components/Nickname';
import { HomeScreen } from './components/Home';
import { SoloScreen } from './components/Solo';

const MainView: React.FC = () => {
  const { currentScreen, isConnected, nickname, setCurrentScreen } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between py-4 border-b border-slate-800">
        <h1
          onClick={() => nickname && setCurrentScreen('home')}
          className="text-2xl font-black tracking-wider text-indigo-400 cursor-pointer"
        >
          TYPE<span className="text-white">RACER</span>
        </h1>

        <div className="flex items-center gap-3">
          {nickname && (
            <button
              onClick={() => setCurrentScreen('nickname')}
              className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-700 text-slate-300 transition"
            >
              👤 {nickname}
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
              }`}
            />
            <span className="text-xs text-slate-500">
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Screen Router */}
      <main className="flex-1 flex items-center justify-center w-full my-8">
        {currentScreen === 'nickname' && <NicknameScreen />}
        {currentScreen === 'home' && <HomeScreen />}
        {currentScreen === 'solo' && <SoloScreen />}
        {currentScreen === 'team' && (
          <div className="text-center text-slate-400">Team Screen (Phase 3)</div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-xs text-slate-600 py-4">
        TypeRacer • React + Node.js + Socket.IO
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainView />
    </AppProvider>
  );
}
import React, { useEffect, useState, useRef } from "react";
import { useApp } from "../../../context/useAppContext";
import { useTyping } from "../../../hooks/useTyping";
import { TypingBox } from "../../Shared/TypingBox";
import { ProgressBar } from "../../Shared/ProgressBar";
import type { RoomUser } from "../../../types";
import { useRoom } from "../../../context/userRoomContext";
import { Countdown } from "./CountDown";

export const LiveRace: React.FC = () => {
  const { paragraph, users, timeLimit, emitProgress, emitFinish, leaveRoom } = useRoom();
  const { socket } = useApp();
  const [raceActive, setRaceActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timeLimit);

  const {
    targetWords,
    typedWords,
    currentWordIndex,
    currentInput,
    stats,
    handleInputChange,
    handleKeyDown,
    selectWord,
    isCompleted,
  } = useTyping(paragraph);

  const lastEmittedProgress = useRef(-1);

  // Timer countdown
  useEffect(() => {
    if (!raceActive) return;

    const timer = setInterval(() => {
      setRemainingTime((prev: number) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [raceActive]);

  // Emit progress to server every second (or upon completion)
  useEffect(() => {
    if (!raceActive) return;

    if (stats.progress !== lastEmittedProgress.current) {
      emitProgress(stats.progress, stats.wpm, stats.accuracy);
      lastEmittedProgress.current = stats.progress;
    }
  }, [raceActive, stats.progress, stats.wpm, stats.accuracy, emitProgress]);

  // Emit finish event on 100% completion
  useEffect(() => {
    if (isCompleted && raceActive) {
      emitFinish(stats.wpm, stats.accuracy, stats.timeTaken);
    }
  }, [isCompleted, raceActive, stats, emitFinish]);

  if (!raceActive) {
    return <Countdown onComplete={() => setRaceActive(true)} />;
  }

  const userEntries = Object.entries(users);

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 px-4">
      {/* Top Header: Clock & Self Stats */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl">
        <div className="flex items-center gap-6 font-mono">
          <div>
            <span className="text-[10px] uppercase text-slate-500 block font-semibold">Time Remaining</span>
            <span
              className={`text-2xl font-black ${
                remainingTime <= 10 ? "text-rose-400 animate-pulse" : "text-amber-400"
              }`}
            >
              {remainingTime}s
            </span>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <span className="text-[10px] uppercase text-slate-500 block font-semibold">Speed</span>
            <span className="text-2xl font-black text-indigo-400">
              {stats.wpm} <span className="text-xs font-normal text-slate-400">WPM</span>
            </span>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <span className="text-[10px] uppercase text-slate-500 block font-semibold">Accuracy</span>
            <span className="text-2xl font-black text-emerald-400">{stats.accuracy}%</span>
          </div>
        </div>

        <button
          onClick={leaveRoom}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-3.5 py-2 rounded-xl border border-slate-700 transition"
        >
          Quit Race
        </button>
      </div>

      {/* Progress Track for all competitors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
        {userEntries.map(([socketId, user]) => (
          <ProgressBar
            key={socketId}
            user={user as RoomUser}
            isSelf={socketId === socket.id}
          />
        ))}
      </div>

      {/* Typing box */}
      <TypingBox
        targetWords={targetWords}
        typedWords={typedWords}
        currentWordIndex={currentWordIndex}
        currentInput={currentInput}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSelectWord={selectWord}
        disabled={isCompleted || remainingTime === 0}
      />
    </div>
  );
};
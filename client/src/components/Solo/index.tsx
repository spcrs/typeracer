import React, { useEffect, useState, useCallback } from "react";
import { useApp } from "../../context/useAppContext";
import { useTyping } from "../../hooks/useTyping";
import { TypingBox } from "../Shared/TypingBox";
import { SoloCompletion } from "./SoloCompletion";

interface SoloRaceSessionProps {
  paragraph: string;
  onRestart: () => void;
  onHome: () => void;
}

const SoloRaceSession: React.FC<SoloRaceSessionProps> = ({ paragraph, onRestart, onHome }) => {
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

  if (isCompleted) {
    return <SoloCompletion stats={stats} onRestart={onRestart} onHome={onHome} />;
  }

  return (
    <>
      {/* Top Live Stats Bar */}
      <div className="w-full flex items-center justify-between px-6 py-3 bg-slate-800/40 border border-slate-700/60 rounded-xl">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-500 block font-semibold uppercase">Speed</span>
            <span className="text-2xl font-bold text-indigo-400">
              {stats.wpm} <span className="text-xs text-slate-400 font-normal">WPM</span>
            </span>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <span className="text-xs text-slate-500 block font-semibold uppercase">Accuracy</span>
            <span className="text-2xl font-bold text-emerald-400">{stats.accuracy}%</span>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <span className="text-xs text-slate-500 block font-semibold uppercase">Progress</span>
            <span className="text-2xl font-bold text-amber-400">{stats.progress}%</span>
          </div>
        </div>

        <button
          onClick={onHome}
          className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          Exit
        </button>
      </div>

      {/* Core Interactive Typing Box */}
      <TypingBox
        targetWords={targetWords}
        typedWords={typedWords}
        currentWordIndex={currentWordIndex}
        currentInput={currentInput}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSelectWord={selectWord}
        disabled={isCompleted}
      />
    </>
  );
};

export const SoloScreen: React.FC = () => {
  const { socket, nickname, setCurrentScreen } = useApp();
  const [paragraph, setParagraph] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const handleRestart = useCallback(() => {
    setLoading(true);
    socket.emit("solo:start", { nickname });
  }, [socket, nickname]);

  useEffect(() => {
    // 1. Listen for socket response
    const handleParagraph = (data: { paragraph: string }) => {
      setParagraph(data.paragraph);
      setLoading(false);
    };

    socket.on("solo:paragraph", handleParagraph);

    // 2. Emit initial request directly without calling setState synchronously in the effect
    socket.emit("solo:start", { nickname });

    return () => {
      socket.off("solo:paragraph", handleParagraph);
    };
  }, [socket, nickname]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Requesting passage from server...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-6 px-4">
      <SoloRaceSession
        key={paragraph}
        paragraph={paragraph}
        onRestart={handleRestart}
        onHome={() => setCurrentScreen("home")}
      />
    </div>
  );
};
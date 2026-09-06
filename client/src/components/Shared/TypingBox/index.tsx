import React, { useRef, useEffect } from "react";

interface TypingBoxProps {
  targetWords: string[];
  typedWords: string[];
  currentWordIndex: number;
  currentInput: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSelectWord: (index: number) => void;
  disabled?: boolean;
}

export const TypingBox: React.FC<TypingBoxProps> = ({
  targetWords,
  typedWords,
  currentWordIndex,
  currentInput,
  onInputChange,
  onKeyDown,
  onSelectWord,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // Auto-focus input box
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled, currentWordIndex]);

  // Auto-scroll the active word into the visible viewport
  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeWordRef.current;

      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      // Keep active line vertically centered in the scroll window
      if (
        elementTop < containerTop ||
        elementTop + elementHeight > containerTop + containerHeight
      ) {
        container.scrollTo({
          top: elementTop - containerHeight / 2 + elementHeight / 2,
          behavior: "smooth",
        });
      }
    }
  }, [currentWordIndex]);

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="relative w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl cursor-text select-none"
    >
      {/* Scrollable Viewport for Target Passage */}
      <div
        ref={containerRef}
        className="max-h-48 overflow-y-auto pr-2 mb-6 scroll-smooth [scrollbar-width:thin] [scrollbar-color:#4f46e5_#0f172a]"
      >
        <div className="flex flex-wrap gap-x-2 gap-y-3 text-lg sm:text-xl font-mono leading-relaxed">
          {targetWords.map((word, wordIdx) => {
            const isCurrent = wordIdx === currentWordIndex;
            const typed = isCurrent ? currentInput : typedWords[wordIdx] || "";
            const isWordFinished = wordIdx < currentWordIndex;
            const isIncorrect = isWordFinished && typed !== word;

            return (
              <span
                key={wordIdx}
                ref={isCurrent ? activeWordRef : null}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWord(wordIdx);
                }}
                className={`relative px-1.5 py-0.5 rounded cursor-pointer transition-all duration-100 ${
                  isCurrent
                    ? "bg-slate-800 ring-2 ring-indigo-500/50"
                    : isIncorrect
                    ? "bg-rose-950/40 underline decoration-rose-500 underline-offset-4 decoration-2"
                    : "hover:bg-slate-800/40"
                }`}
              >
                {word.split("").map((char, charIdx) => {
                  let charColor = "text-slate-500"; // Untyped

                  if (charIdx < typed.length) {
                    charColor =
                      typed[charIdx] === char
                        ? "text-emerald-400"
                        : "text-rose-400 bg-rose-500/20";
                  }

                  return (
                    <span key={charIdx} className={charColor}>
                      {char}
                    </span>
                  );
                })}

                {/* Extra overflowing characters typed incorrectly */}
                {typed.length > word.length && (
                  <span className="text-rose-400 bg-rose-500/20">
                    {typed.slice(word.length)}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder={disabled ? "Race completed!" : "Type here... (Press space for next word)"}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-base shadow-inner"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>
    </div>
  );
};
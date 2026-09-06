import { useState, useEffect, useRef, useMemo, useCallback } from "react";

export interface WordStatus {
  word: string;
  typed: string;
  isCurrent: boolean;
  isComplete: boolean;
  hasError: boolean;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  progress: number;
  timeTaken: number;
  isCompleted: boolean;
}

export const useTyping = (targetText: string) => {
  const targetWords = useMemo(() => {
    return targetText.trim().length > 0 ? targetText.trim().split(/\s+/) : [];
  }, [targetText]);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedWords, setTypedWords] = useState<string[]>(() =>
    new Array(targetWords.length).fill("")
  );
  const [currentInput, setCurrentInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Elapsed timer loop
  useEffect(() => {
    if (startTime && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((Date.now() - startTime) / 1000);
      }, 250);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isCompleted]);

  const checkRaceCompletion = useCallback(
  (wordsState: string[]) => {
    if (targetWords.length === 0) return;

    const allMatch = targetWords.every(
      (target, idx) => (wordsState[idx] || "") === target
    );

    if (allMatch) {
      setIsCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  },
  [targetWords]
);

  // Handle single character / word updates
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isCompleted || targetWords.length === 0) return;

      const val = e.target.value;

      if (!startTime) {
        setStartTime(Date.now());
      }

      setTotalKeystrokes((prev) => prev + 1);

      const targetWord = targetWords[currentWordIndex] || "";

      // Spacebar Navigation
      if (val.endsWith(" ")) {
        const trimmedVal = val.slice(0, -1); // Remove space
        const updated = [...typedWords];
        updated[currentWordIndex] = trimmedVal;
        setTypedWords(updated);

        let wordCorrectChars = 0;
        for (let i = 0; i < trimmedVal.length; i++) {
          if (trimmedVal[i] === targetWord[i]) wordCorrectChars++;
        }
        setCorrectKeystrokes((prev) => prev + wordCorrectChars);

        // Advance to next word if not at the end
        if (currentWordIndex < targetWords.length - 1) {
          setCurrentWordIndex((prev) => prev + 1);
          setCurrentInput(typedWords[currentWordIndex + 1] || "");
        }
        
        // ALWAYS check for completion (in case jumping back to fix the last remaining error)
        checkRaceCompletion(updated);
        return;
      }

      // Normal Character Typing
      const lastChar = val[val.length - 1];
      const expectedChar = targetWord[val.length - 1];
      if (lastChar && lastChar === expectedChar) {
        setCorrectKeystrokes((prev) => prev + 1);
      }

      setCurrentInput(val);
      const updated = [...typedWords];
      updated[currentWordIndex] = val;
      setTypedWords(updated);

      // ALWAYS check for completion on every single keystroke
      checkRaceCompletion(updated);
    },
    [
      currentWordIndex,
      typedWords,
      targetWords,
      startTime,
      isCompleted,
      checkRaceCompletion,
    ]
  );

  const selectWord = useCallback(
    (index: number) => {
      if (index >= 0 && index < targetWords.length && !isCompleted) {
        const updated = [...typedWords];
        updated[currentWordIndex] = currentInput;
        setTypedWords(updated);

        setCurrentWordIndex(index);
        setCurrentInput(updated[index] || "");
      }
    },
    [currentWordIndex, currentInput, typedWords, targetWords, isCompleted]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && currentInput === "" && currentWordIndex > 0) {
        e.preventDefault();
        const prevIndex = currentWordIndex - 1;
        setCurrentWordIndex(prevIndex);
        setCurrentInput(typedWords[prevIndex] || "");
      }
    },
    [currentInput, currentWordIndex, typedWords]
  );

  

  const stats: TypingStats = useMemo(() => {
    let correctlyTypedWords = 0;
    targetWords.forEach((word, idx) => {
      if (typedWords[idx] === word) {
        correctlyTypedWords++;
      }
    });

    const elapsedMinutes = elapsedSeconds > 0 ? elapsedSeconds / 60 : 0;
    const wpm = elapsedMinutes > 0 ? Math.round(correctlyTypedWords / elapsedMinutes) : 0;
    const accuracy =
      totalKeystrokes > 0 ? Math.min(100, Math.round((correctKeystrokes / totalKeystrokes) * 100)) : 100;
    const progress =
      targetWords.length > 0 ? Math.round((correctlyTypedWords / targetWords.length) * 100) : 0;

    return {
      wpm,
      accuracy,
      progress,
      timeTaken: Math.round(elapsedSeconds),
      isCompleted,
    };
  }, [targetWords, typedWords, elapsedSeconds, totalKeystrokes, correctKeystrokes, isCompleted]);

  return {
    targetWords,
    typedWords,
    currentWordIndex,
    currentInput,
    stats,
    handleInputChange,
    handleKeyDown,
    selectWord,
    isCompleted,
  };
};
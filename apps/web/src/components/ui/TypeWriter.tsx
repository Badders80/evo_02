"use client";

import { useState, useEffect, useRef } from "react";

interface TypeWriterProps {
  /** Single text to type (legacy mode) */
  text?: string;
  /** Array of words to cycle through (cycling mode) */
  words?: string[];
  /** Typing speed in ms per char. Default 80 */
  speed?: number;
  /** Delete speed in ms per char. Default 40 */
  deleteSpeed?: number;
  /** Hold time after complete word in ms. Default 2500 */
  holdDelay?: number;
  /** Delay before starting in ms. Default 500 */
  delay?: number;
  /** Loop (legacy mode only) */
  loop?: boolean;
  /** Trigger type */
  trigger?: "instant" | "inView";
  /** Show blinking cursor. Default true */
  cursor?: boolean;
  className?: string;
}

export function TypeWriter({
  text,
  words,
  speed = 80,
  deleteSpeed = 40,
  holdDelay = 2500,
  delay = 500,
  loop = false,
  trigger = "instant",
  cursor = true,
  className = "",
}: TypeWriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");
  const [started, setStarted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cycling mode
  const cyclingWords = words && words.length > 0;

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTimeout(() => {
        if (cyclingWords) {
          setDisplayedText(words![0]);
        } else {
          setDisplayedText(text ?? "");
        }
      }, 0);
      return;
    }

    if (cyclingWords) {
      // Cycling mode
      const currentWord = words![wordIndex];

      if (phase === "typing") {
        if (displayedText.length < currentWord.length) {
          timeoutRef.current = setTimeout(() => {
            setDisplayedText(currentWord.slice(0, displayedText.length + 1));
          }, speed);
        } else {
          timeoutRef.current = setTimeout(() => setPhase("holding"), holdDelay);
        }
      } else if (phase === "holding") {
        timeoutRef.current = setTimeout(() => setPhase("deleting"), 50);
      } else if (phase === "deleting") {
        if (displayedText.length > 0) {
          timeoutRef.current = setTimeout(() => {
            setDisplayedText(displayedText.slice(0, -1));
          }, deleteSpeed);
        } else {
          setTimeout(() => {
            setWordIndex((prev) => (prev + 1) % words!.length);
            setPhase("typing");
          }, 0);
        }
      }
    } else {
      // Legacy mode — single text
      const fullText = text ?? "";
      if (displayedText.length < fullText.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
        }, speed);
      } else if (loop) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedText("");
        }, holdDelay);
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayedText, phase, wordIndex, started, cyclingWords, words, text, speed, deleteSpeed, holdDelay, loop]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && (
        <span
          className="inline-block w-[2px] h-[1em] -mb-[0.1em] ml-[2px] bg-current animate-cursor-blink"
          aria-hidden
        />
      )}
    </span>
  );
}
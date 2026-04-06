"use client";

import { useEffect, useRef, useState } from "react";

const MIN_START_TIME = -90;
const MAX_START_TIME = 0;
const DEFAULT_START_TIME = -60;

const clamp = (value: number) =>
  Math.min(MAX_START_TIME, Math.max(MIN_START_TIME, value));

export const useTimer = () => {
  const [initialTime, setInitialTime] = useState(DEFAULT_START_TIME);
  const [time, setTime] = useState(DEFAULT_START_TIME);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedSecondsRef = useRef(0);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = () => {
    if (intervalRef.current) return;

    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      elapsedSecondsRef.current += 1;
      setTime(initialTime + elapsedSecondsRef.current);
    }, 1000);
  };

  const pause = () => {
    clearTimer();
    setIsRunning(false);
  };

  const reset = () => {
    clearTimer();
    elapsedSecondsRef.current = 0;
    setIsRunning(false);
    setTime(initialTime);
  };

  const setStartTime = (value: number) => {
    const next = clamp(value);
    setInitialTime(next);

    if (!isRunning) {
      elapsedSecondsRef.current = 0;
      setTime(next);
    }
  };

  const addTenSeconds = () => {
    elapsedSecondsRef.current += 10;
    setTime(initialTime + elapsedSecondsRef.current);
  };

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return {
    time,
    initialTime,
    isRunning,
    minStartTime: MIN_START_TIME,
    maxStartTime: MAX_START_TIME,
    start,
    pause,
    reset,
    setStartTime,
    addTenSeconds,
  };
};

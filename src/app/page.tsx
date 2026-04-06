"use client";

import { useEffect, useState } from "react";
import {
  EventsList,
  TimerControls,
  TimerDisplay,
  VoiceEventsBridge,
} from "@/components";
import type { VoiceBridgeEvent } from "@/components/VoiceEventsBridge/VoiceEventsBridge";
import { useTimer } from "@/hooks/useTimer";
import { useVoiceEngine } from "@/hooks/useVoiceEngine";
import { getVisibleTimingsState } from "@/lib/timings/timingsTools";
import type { TimingState } from "@/lib/timings/timingsTypes";

import styles from "./page.module.css";

const SOUND_ENABLED_KEY = "dota-timer:sound-enabled";
const ACTIVE_VOICE_ENABLED_KEY = "dota-timer:active-voice-enabled";
const VOLUME_KEY = "dota-timer:volume";

const getPregameMessage = (time: number): string | null => {
  if (time >= 0) {
    return null;
  }

  const secondsLeft = Math.abs(time);

  if (secondsLeft === 1) {
    return "До початку гри залишилась 1 секунда";
  }

  return `До початку гри залишилось ${secondsLeft} секунд`;
};

const readBooleanSetting = (key: string, fallback: boolean): boolean => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  if (rawValue === null) {
    return fallback;
  }

  return rawValue === "true";
};

const readNumberSetting = (key: string, fallback: number): number => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  if (rawValue === null) {
    return fallback;
  }

  const parsed = Number(rawValue);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.max(0, Math.min(1, parsed));
};

export default function Home() {
  const voiceEngine = useVoiceEngine();

  const [soundEnabled, setSoundEnabled] = useState(() =>
    readBooleanSetting(SOUND_ENABLED_KEY, true),
  );
  const [activeVoiceEnabled, setActiveVoiceEnabled] = useState(() =>
    readBooleanSetting(ACTIVE_VOICE_ENABLED_KEY, true),
  );
  const [volume, setVolume] = useState(() => readNumberSetting(VOLUME_KEY, 1));

  const {
    time,
    initialTime,
    isRunning,
    minStartTime,
    maxStartTime,
    start,
    pause,
    reset,
    setStartTime,
    addTenSeconds,
  } = useTimer();

  const visibleTimings: TimingState[] = getVisibleTimingsState(time);
  const pregameMessage = getPregameMessage(time);

  const voiceEvents: VoiceBridgeEvent[] = visibleTimings.flatMap((event) => {
    if (!event.voiceId) {
      return [];
    }

    const status: "idle" | "prepare" | "warning" | "active" =
      event.stage === "prepare" ||
      event.stage === "warning" ||
      event.stage === "active"
        ? event.stage
        : "idle";

    const occurrence =
      typeof event.nextSpawnTime === "number"
        ? event.nextSpawnTime
        : typeof event.currentSpawnTime === "number"
          ? event.currentSpawnTime
          : event.id;

    return [
      {
        id: event.voiceId,
        voiceKey: `${event.voiceId}:${occurrence}`,
        status,
      },
    ];
  });

  useEffect(() => {
    voiceEngine.setEnabled(soundEnabled);
    window.localStorage.setItem(SOUND_ENABLED_KEY, String(soundEnabled));
  }, [soundEnabled, voiceEngine]);

  useEffect(() => {
    voiceEngine.setActiveEnabled(activeVoiceEnabled);
    window.localStorage.setItem(
      ACTIVE_VOICE_ENABLED_KEY,
      String(activeVoiceEnabled),
    );
  }, [activeVoiceEnabled, voiceEngine]);

  useEffect(() => {
    voiceEngine.setVolume(volume);
    window.localStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume, voiceEngine]);

  const handleStart = async () => {
    await voiceEngine.unlock();
    start();
  };

  const handlePause = async () => {
    await voiceEngine.unlock();
    pause();
    voiceEngine.stopAll();
  };

  const handleReset = async () => {
    await voiceEngine.unlock();
    reset();
    voiceEngine.stopAll();
    voiceEngine.resetAll();
  };

  const handleAddTenSeconds = async () => {
    await voiceEngine.unlock();
    addTenSeconds();
  };

  const handleStartTimeChange = async (value: number) => {
    await voiceEngine.unlock();
    setStartTime(value);
  };

  const handleToggleSound = async () => {
    await voiceEngine.unlock();
    setSoundEnabled((prev) => !prev);
  };

  const handleToggleActiveVoice = async () => {
    await voiceEngine.unlock();
    setActiveVoiceEnabled((prev) => !prev);
  };

  const handleVolumeChange = async (value: number) => {
    await voiceEngine.unlock();
    setVolume(value);
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1 className={styles.title}>Dota Timer</h1>

        <div className={styles.timerBox}>
          <span className={styles.timerLabel}>
            {time < 0 ? "Підготовка до гри" : "Час матчу"}
          </span>

          <div className={styles.timerValue}>
            <TimerDisplay time={time} />
          </div>

          {pregameMessage && (
            <p className={styles.pregameMessage}>{pregameMessage}</p>
          )}
        </div>

        <TimerControls
          isRunning={isRunning}
          initialTime={initialTime}
          minStartTime={minStartTime}
          maxStartTime={maxStartTime}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onAddTenSeconds={handleAddTenSeconds}
          onStartTimeChange={handleStartTimeChange}
          soundEnabled={soundEnabled}
          activeVoiceEnabled={activeVoiceEnabled}
          volume={volume}
          onToggleSound={handleToggleSound}
          onToggleActiveVoice={handleToggleActiveVoice}
          onVolumeChange={handleVolumeChange}
        />
      </section>

      <EventsList events={visibleTimings} />

      <VoiceEventsBridge
        events={voiceEvents}
        isRunning={isRunning}
        voiceEngine={voiceEngine}
      />
    </main>
  );
}

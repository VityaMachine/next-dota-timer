export type TimingType =
  | "rune"
  | "lotus"
  | "wisdom"
  | "stack"
  | "tormentor"
  | null;

export type TimingConfig = {
  id: number;
  name: string;
  startTiming: number;
  period: number | null;
  maxOccurrences: number | null;
  prepareSeconds: number;
  warningSeconds: number;
  showLength: number;
  isIncluded: boolean;
  image: string | null;
  type: TimingType;
  voiceId: string | null;
};

export type TimingStage =
  | "idle"
  | "prepare"
  | "warning"
  | "active"
  | "finished";

export type TimingState = {
  id: number;
  name: string;
  image: string | null;
  type: TimingType;
  isIncluded: boolean;
  isVisible: boolean;
  isFinished: boolean;
  secondsLeft: number | null;
  stage: TimingStage;
  currentSpawnTime: number | null;
  nextSpawnTime: number | null;
  voiceId: string | null;
};

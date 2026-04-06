import rawTimings from "@/data/timings.json";
import type {
  TimingConfig,
  TimingStage,
  TimingState,
} from "@/lib/timings/timingsTypes";

export const TIMINGS = rawTimings as TimingConfig[];

// const stagePriority: Record<TimingState["stage"], number> = {
//   active: 0,
//   warning: 1,
//   prepare: 2,
//   idle: 3,
//   finished: 4,
// };

const isSingleEventFinished = (
  currentTime: number,
  timing: TimingConfig,
): boolean => {
  if (timing.period !== null) {
    return false;
  }

  return currentTime > timing.startTiming + timing.showLength;
};

const getSingleEventSpawnTime = (
  currentTime: number,
  timing: TimingConfig,
): number | null => {
  if (isSingleEventFinished(currentTime, timing)) {
    return null;
  }

  return timing.startTiming;
};

const getPeriodicEventSpawnTime = (
  currentTime: number,
  timing: TimingConfig,
): number | null => {
  const period = timing.period;

  if (period === null) {
    return null;
  }

  const maxOccurrences = timing.maxOccurrences ?? null;

  const getSpawnByIndex = (index: number) =>
    timing.startTiming + index * period;

  const isIndexAllowed = (index: number) => {
    if (maxOccurrences === null) {
      return true;
    }

    return index < maxOccurrences;
  };

  if (currentTime <= timing.startTiming) {
    return isIndexAllowed(0) ? timing.startTiming : null;
  }

  const cyclesPassed = Math.floor((currentTime - timing.startTiming) / period);
  const currentIndex = cyclesPassed;
  const currentSpawn = getSpawnByIndex(currentIndex);

  if (
    isIndexAllowed(currentIndex) &&
    currentTime <= currentSpawn + timing.showLength
  ) {
    return currentSpawn;
  }

  const nextIndex = currentIndex + 1;

  if (!isIndexAllowed(nextIndex)) {
    return null;
  }

  return getSpawnByIndex(nextIndex);
};

export const getRelevantSpawnTime = (
  currentTime: number,
  timing: TimingConfig,
): number | null => {
  if (timing.period === null) {
    return getSingleEventSpawnTime(currentTime, timing);
  }

  return getPeriodicEventSpawnTime(currentTime, timing);
};

export const getTimingStage = (
  currentTime: number,
  spawnTime: number | null,
  timing: TimingConfig,
): TimingStage => {
  if (timing.period === null && isSingleEventFinished(currentTime, timing)) {
    return "finished";
  }

  if (spawnTime === null) {
    return "idle";
  }

  const diff = spawnTime - currentTime;

  if (diff > timing.prepareSeconds) {
    return "idle";
  }

  if (diff > timing.warningSeconds) {
    return "prepare";
  }

  if (diff > 0) {
    return "warning";
  }

  if (diff >= -timing.showLength) {
    return "active";
  }

  return "idle";
};

export const getTimingState = (
  currentTime: number,
  timing: TimingConfig,
): TimingState => {
  const relevantSpawnTime = getRelevantSpawnTime(currentTime, timing);
  const stage = getTimingStage(currentTime, relevantSpawnTime, timing);
  const isFinished = stage === "finished";

  return {
    id: timing.id,
    name: timing.name,
    image: timing.image,
    type: timing.type,
    voiceId: timing.voiceId ?? null,
    currentSpawnTime: stage === "active" ? relevantSpawnTime : null,
    nextSpawnTime:
      stage === "prepare" || stage === "warning" || stage === "idle"
        ? relevantSpawnTime
        : null,
    secondsLeft:
      relevantSpawnTime === null ? null : relevantSpawnTime - currentTime,
    stage,
    isVisible: timing.isIncluded && !isFinished && stage !== "idle",
    isIncluded: timing.isIncluded,
    isFinished,
  };
};

export const getAllTimingsState = (currentTime: number): TimingState[] => {
  return TIMINGS.map((timing) => getTimingState(currentTime, timing)).filter(
    (timing): timing is TimingState => timing !== undefined,
  );
};

export const getVisibleTimingsState = (currentTime: number): TimingState[] => {
  return getAllTimingsState(currentTime).filter((timing) => timing.isVisible);
};

export const getVisibleTimingsForDisplay = (
  currentTime: number,
): TimingState[] => {
  return getVisibleTimingsState(currentTime);
};

import {
  buildCombinedVoiceSequence,
  buildVoiceSequence,
  COMMON_VOICES,
  EVENT_VOICES,
} from "./voiceRegistry";
import type { EventStage } from "./voiceTypes";
import { VoiceQueue } from "./voiceQueue";

type SpokenStageMap = Map<string, Set<EventStage>>;

export class VoiceEngine {
  private queue: VoiceQueue;
  private spokenStages: SpokenStageMap = new Map();
  private activeEnabled = true;

  constructor(queue: VoiceQueue) {
    this.queue = queue;
  }

  preloadAll() {
    const commonSources = Object.values(COMMON_VOICES);
    const eventSources = Object.values(EVENT_VOICES);

    this.queue.preload([...commonSources, ...eventSources]);
  }

  async unlock() {
    await this.queue.unlock();
  }

  isUnlocked() {
    return this.queue.isUnlocked();
  }

  isEnabled() {
    return this.queue.isEnabled();
  }

  getVolume() {
    return this.queue.getVolume();
  }

  isActiveEnabled() {
    return this.activeEnabled;
  }

  setEnabled(value: boolean) {
    this.queue.setEnabled(value);
  }

  setVolume(value: number) {
    this.queue.setVolume(value);
  }

  setActiveEnabled(value: boolean) {
    this.activeEnabled = value;
  }

  enqueueEventStage(voiceKey: string, eventId: string, stage: EventStage) {
    if (stage === "active" && !this.activeEnabled) {
      return;
    }

    const spoken = this.spokenStages.get(voiceKey) ?? new Set<EventStage>();

    if (spoken.has(stage)) return;

    const sequence = buildVoiceSequence(eventId, stage);
    if (sequence.length === 0) return;

    spoken.add(stage);
    this.spokenStages.set(voiceKey, spoken);

    this.queue.enqueue({
      key: `${voiceKey}:${stage}`,
      sequence,
    });
  }

  enqueueCombinedStage(
    stage: EventStage,
    items: Array<{ voiceKey: string; eventId: string }>,
  ) {
    if (stage === "active" && !this.activeEnabled) {
      return;
    }

    const freshItems = items.filter(({ voiceKey }) => {
      const spoken = this.spokenStages.get(voiceKey) ?? new Set<EventStage>();
      return !spoken.has(stage);
    });

    if (freshItems.length === 0) {
      return;
    }

    const sequence = buildCombinedVoiceSequence(
      stage,
      freshItems.map((item) => item.eventId),
    );

    if (sequence.length === 0) {
      return;
    }

    for (const { voiceKey } of freshItems) {
      const spoken = this.spokenStages.get(voiceKey) ?? new Set<EventStage>();
      spoken.add(stage);
      this.spokenStages.set(voiceKey, spoken);
    }

    this.queue.enqueue({
      key: `${stage}:${freshItems.map((item) => item.voiceKey).join("|")}`,
      sequence,
    });
  }

  resetEvent(voiceKey: string) {
    this.spokenStages.delete(voiceKey);
  }

  resetAll() {
    this.spokenStages.clear();
    this.queue.clear();
  }

  stopAll() {
    this.queue.stop();
  }
}

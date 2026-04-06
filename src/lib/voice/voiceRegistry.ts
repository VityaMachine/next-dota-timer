import type { EventStage, VoicePart, VoiceSequence } from "./voiceTypes";

const AUDIO_BASE = "/audio";

export const COMMON_VOICES = {
  prepare: `${AUDIO_BASE}/prepare.mp3`,
  warning: `${AUDIO_BASE}/warning.mp3`,
  timing: `${AUDIO_BASE}/timing.mp3`,
  and: `${AUDIO_BASE}/and.mp3`,
} as const;

export const EVENT_VOICES: Record<string, string> = {
  bounty: `${AUDIO_BASE}/events/bounty.mp3`,
  wisdom: `${AUDIO_BASE}/events/wisdom.mp3`,
  lotus: `${AUDIO_BASE}/events/lotus.mp3`,
  tormentor: `${AUDIO_BASE}/events/tormentor.mp3`,
  water: `${AUDIO_BASE}/events/water.mp3`,
  stack: `${AUDIO_BASE}/events/stack.mp3`,
  powerRune: `${AUDIO_BASE}/events/power-rune.mp3`,
};

export function buildVoiceSequence(
  eventId: string,
  stage: EventStage,
): VoiceSequence {
  return buildCombinedVoiceSequence(stage, [eventId]);
}

export function buildCombinedVoiceSequence(
  stage: EventStage,
  eventIds: string[],
): VoiceSequence {
  const validEventIds = eventIds.filter((eventId) => EVENT_VOICES[eventId]);

  if (validEventIds.length === 0) {
    return [];
  }

  const eventParts: VoicePart[] = validEventIds.flatMap((eventId, index) => {
    const parts: VoicePart[] = [
      {
        id: eventId,
        src: EVENT_VOICES[eventId],
      },
    ];

    if (index < validEventIds.length - 1) {
      parts.push({
        id: `and-${index}`,
        src: COMMON_VOICES.and,
      });
    }

    return parts;
  });

  switch (stage) {
    case "prepare":
      return [{ id: "prepare", src: COMMON_VOICES.prepare }, ...eventParts];

    case "warning":
      return [{ id: "warning", src: COMMON_VOICES.warning }, ...eventParts];

    case "active":
      return [...eventParts, { id: "timing", src: COMMON_VOICES.timing }];

    default:
      return [];
  }
}

export type EventStage = "prepare" | "warning" | "active";

export type VoicePart = {
  id: string;
  src: string;
};

export type VoiceSequence = VoicePart[];

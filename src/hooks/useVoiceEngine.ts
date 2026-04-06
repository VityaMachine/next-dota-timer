"use client";

import { useEffect, useState } from "react";
import { VoiceEngine } from "@/lib/voice/voiceEngine";
import { VoiceQueue } from "@/lib/voice/voiceQueue";

export function useVoiceEngine() {
  const [engine] = useState(() => {
    const queue = new VoiceQueue();
    return new VoiceEngine(queue);
  });

  useEffect(() => {
    engine.preloadAll();
  }, [engine]);

  return engine;
}

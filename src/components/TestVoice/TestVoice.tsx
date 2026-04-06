"use client";

import { VoiceQueue } from "@/lib/voice/voiceQueue";
import { VoiceEngine } from "@/lib/voice/voiceEngine";

const queue = new VoiceQueue();
const engine = new VoiceEngine(queue);

export default function TestVoice() {
  const handleTest = async () => {
    engine.preloadAll();
    await engine.unlock();

    engine.enqueueEventStage("bounty:180", "bounty", "prepare");

    setTimeout(() => {
      engine.enqueueEventStage("bounty:180", "bounty", "warning");
    }, 2000);

    setTimeout(() => {
      engine.enqueueEventStage("bounty:180", "bounty", "active");
    }, 4000);
  };

  return <button onClick={handleTest}>TEST VOICE</button>;
}

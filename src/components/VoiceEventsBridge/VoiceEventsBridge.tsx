"use client";

import { useEffect, useRef } from "react";
import type { VoiceEngine } from "@/lib/voice/voiceEngine";

type EventStage = "prepare" | "warning" | "active";
type EventStatus = EventStage | "idle";

export type VoiceBridgeEvent = {
  id: string;
  voiceKey?: string;
  status: EventStatus;
};

type Props = {
  events: VoiceBridgeEvent[];
  isRunning: boolean;
  voiceEngine: VoiceEngine;
};

export default function VoiceEventsBridge({
  events,
  isRunning,
  voiceEngine,
}: Props) {
  const prevStatusesRef = useRef<Map<string, EventStatus>>(new Map());

  useEffect(() => {
    if (!isRunning) return;

    const prevMap = prevStatusesRef.current;
    const nextMap = new Map<string, EventStatus>();

    const groupedTransitions: Record<
      EventStage,
      Array<{ voiceKey: string; eventId: string }>
    > = {
      prepare: [],
      warning: [],
      active: [],
    };

    for (const event of events) {
      const voiceKey = event.voiceKey ?? event.id;
      const prevStatus = prevMap.get(voiceKey) ?? "idle";
      const nextStatus = event.status;

      nextMap.set(voiceKey, nextStatus);

      if (prevStatus !== nextStatus) {
        if (nextStatus === "prepare") {
          groupedTransitions.prepare.push({
            voiceKey,
            eventId: event.id,
          });
        }

        if (nextStatus === "warning") {
          groupedTransitions.warning.push({
            voiceKey,
            eventId: event.id,
          });
        }

        if (nextStatus === "active") {
          groupedTransitions.active.push({
            voiceKey,
            eventId: event.id,
          });
        }

        if (nextStatus === "idle") {
          voiceEngine.resetEvent(voiceKey);
        }
      }
    }

    if (groupedTransitions.prepare.length > 0) {
      voiceEngine.enqueueCombinedStage("prepare", groupedTransitions.prepare);
    }

    if (groupedTransitions.warning.length > 0) {
      voiceEngine.enqueueCombinedStage("warning", groupedTransitions.warning);
    }

    if (groupedTransitions.active.length > 0) {
      voiceEngine.enqueueCombinedStage("active", groupedTransitions.active);
    }

    prevStatusesRef.current = nextMap;
  }, [events, isRunning, voiceEngine]);

  useEffect(() => {
    if (!isRunning) {
      prevStatusesRef.current.clear();
    }
  }, [isRunning]);

  return null;
}

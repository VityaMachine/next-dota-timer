"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { TimingState } from "@/lib/timings/timingsTypes";
import styles from "./EventCard.module.css";

type EventCardProps = {
  event: TimingState;
};

const stageLabels: Record<TimingState["stage"], string> = {
  idle: "Очікування",
  prepare: "ГОТУЙСЬ",
  warning: "УВАГА",
  active: "ТАЙМІНГ",
  finished: "Завершено",
};

const formatCountdown = (seconds: number | null): string => {
  if (seconds === null) {
    return "--:--";
  }

  if (seconds <= 0) {
    return "00:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getCardClassName = (stage: TimingState["stage"]) => {
  const stageClassMap: Partial<Record<TimingState["stage"], string>> = {
    prepare: styles.prepare,
    warning: styles.warning,
    active: styles.active,
  };

  return [styles.inner, stageClassMap[stage] ?? ""].filter(Boolean).join(" ");
};

export default function EventCard({ event }: EventCardProps) {
  const prevStageRef = useRef<TimingState["stage"]>(event.stage);
  const impactRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prevStage = prevStageRef.current;
    const impactEl = impactRef.current;

    if (prevStage !== "active" && event.stage === "active" && impactEl) {
      impactEl.classList.remove(styles.impactReplay);

      // форсимо reflow, щоб анімація гарантовано перезапустилась
      void impactEl.offsetWidth;

      impactEl.classList.add(styles.impactReplay);
    }

    prevStageRef.current = event.stage;
  }, [event.stage]);

  const countdownText =
    event.stage === "active" ? "ТАЙМІНГ" : formatCountdown(event.secondsLeft);

  return (
    <article className={`${styles.card} ${styles.enter}`}>
      <div className={getCardClassName(event.stage)}>
        <div ref={impactRef} className={styles.impactOverlay} />

        <div className={styles.left}>
          <div className={styles.media}>
            {event.image ? (
              <Image
                src={event.image}
                alt={event.name}
                width={64}
                height={64}
                className={styles.image}
              />
            ) : (
              <div className={styles.placeholder}>—</div>
            )}
          </div>

          <div className={styles.info}>
            <h2 className={styles.title}>{event.name}</h2>
            <span className={styles.badge}>{stageLabels[event.stage]}</span>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.countdown}>{countdownText}</div>
          <div className={styles.caption}>
            {event.stage === "active" ? "таймінг" : "до таймінгу"}
          </div>
        </div>
      </div>
    </article>
  );
}

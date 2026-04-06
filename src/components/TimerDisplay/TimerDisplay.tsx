import styles from "./TimerDisplay.module.css";

type TimerDisplayProps = {
  time: number;
};

const formatMatchTime = (totalSeconds: number): string => {
  const sign = totalSeconds < 0 ? "-" : "";
  const absSeconds = Math.abs(totalSeconds);

  const minutes = Math.floor(absSeconds / 60);
  const seconds = absSeconds % 60;

  return `${sign}${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default function TimerDisplay({ time }: TimerDisplayProps) {
  return <p className={styles.time}>{formatMatchTime(time)}</p>;
}

import styles from "./TimerControls.module.css";

type TimerControlsProps = {
  isRunning: boolean;
  initialTime: number;
  minStartTime: number;
  maxStartTime: number;
  onStart: () => void | Promise<void>;
  onPause: () => void | Promise<void>;
  onReset: () => void | Promise<void>;
  onAddTenSeconds: () => void | Promise<void>;
  onStartTimeChange: (value: number) => void | Promise<void>;
  soundEnabled: boolean;
  activeVoiceEnabled: boolean;
  volume: number;
  onToggleSound: () => void | Promise<void>;
  onToggleActiveVoice: () => void | Promise<void>;
  onVolumeChange: (value: number) => void | Promise<void>;
};

const PRESETS = [-90, -60, -30, 0];

type PressHandler = () => void | Promise<void>;

const createPressHandler =
  (handler: PressHandler) =>
  async (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    await handler();
  };

export default function TimerControls({
  isRunning,
  initialTime,
  minStartTime,
  maxStartTime,
  onStart,
  onPause,
  onReset,
  onAddTenSeconds,
  onStartTimeChange,
  soundEnabled,
  activeVoiceEnabled,
  volume,
  onToggleSound,
  onToggleActiveVoice,
  onVolumeChange,
}: TimerControlsProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.label}>Старт гри</span>
          <span className={styles.hint}>час до 0:00</span>
        </div>

        <div className={styles.row}>
          <div className={styles.presets}>
            {PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                disabled={isRunning}
                onPointerUp={createPressHandler(() => onStartTimeChange(value))}
                className={`${styles.preset} ${
                  initialTime === value ? styles.active : ""
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          <div className={styles.inputWrap}>
            <input
              type="number"
              min={minStartTime}
              max={maxStartTime}
              value={initialTime}
              disabled={isRunning}
              className={styles.input}
              onChange={(e) => {
                void onStartTimeChange(Number(e.target.value));
              }}
            />
            <span className={styles.suffix}>сек</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.label}>Керування</span>
          <span className={styles.hint}>таймер матчу</span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            disabled={isRunning}
            onPointerUp={createPressHandler(onStart)}
            className={styles.primary}
          >
            Start
          </button>

          <button
            type="button"
            onPointerUp={createPressHandler(onPause)}
            className={styles.button}
          >
            Pause
          </button>

          <button
            type="button"
            onPointerUp={createPressHandler(onAddTenSeconds)}
            className={styles.button}
          >
            +10 сек
          </button>

          <button
            type="button"
            onPointerUp={createPressHandler(onReset)}
            className={styles.danger}
          >
            Reset
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.label}>Звук</span>
          <span className={styles.hint}>озвучка таймінгів</span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onPointerUp={createPressHandler(onToggleSound)}
            className={soundEnabled ? styles.primary : styles.button}
          >
            {soundEnabled ? "Sound On" : "Sound Off"}
          </button>
        </div>

        <div className={styles.row}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={activeVoiceEnabled}
              onChange={() => {
                void onToggleActiveVoice();
              }}
            />
            <span>Active voice</span>
          </label>
        </div>

        <div className={styles.row}>
          <div className={styles.inputWrap}>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(volume * 100)}
              className={styles.input}
              onChange={(e) => {
                void onVolumeChange(Number(e.target.value) / 100);
              }}
            />
            <span className={styles.suffix}>{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

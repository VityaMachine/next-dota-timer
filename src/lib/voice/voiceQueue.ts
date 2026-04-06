import type { VoicePart } from "./voiceTypes";

type QueueItem = {
  key: string;
  sequence: VoicePart[];
};

export class VoiceQueue {
  private queue: QueueItem[] = [];
  private isPlaying = false;
  private unlocked = false;
  private enabled = true;
  private volume = 1;
  private audioCache = new Map<string, HTMLAudioElement>();
  private currentAudio: HTMLAudioElement | null = null;

  async unlock() {
    if (this.unlocked || typeof window === "undefined") return;

    this.unlocked = true;
    void this.processQueue();
  }

  isUnlocked() {
    return this.unlocked;
  }

  isEnabled() {
    return this.enabled;
  }

  getVolume() {
    return this.volume;
  }

  setEnabled(value: boolean) {
    this.enabled = value;

    if (!value) {
      this.stop();
    } else {
      void this.processQueue();
    }
  }

  setVolume(value: number) {
    const normalized = Math.max(0, Math.min(1, value));
    this.volume = normalized;

    if (this.currentAudio) {
      this.currentAudio.volume = normalized;
    }
  }

  preload(sources: string[]) {
    if (typeof window === "undefined") return;

    sources.forEach((src) => {
      if (this.audioCache.has(src)) return;

      const audio = new Audio(src);
      audio.preload = "auto";
      audio.playsInline = true;
      audio.volume = this.volume;
      this.audioCache.set(src, audio);
    });
  }

  enqueue(item: QueueItem) {
    if (!this.enabled) return;

    this.queue.push(item);
    void this.processQueue();
  }

  clear() {
    this.queue = [];
  }

  stop() {
    this.queue = [];

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    this.isPlaying = false;
  }

  private getAudio(src: string) {
    const cached = this.audioCache.get(src);

    if (cached) {
      const cloned = cached.cloneNode(true) as HTMLAudioElement;
      cloned.preload = "auto";
      cloned.playsInline = true;
      cloned.volume = this.volume;
      return cloned;
    }

    const audio = new Audio(src);
    audio.preload = "auto";
    audio.playsInline = true;
    audio.volume = this.volume;
    return audio;
  }

  private playSingle(src: string) {
    return new Promise<void>((resolve) => {
      if (!this.enabled) {
        resolve();
        return;
      }

      const audio = this.getAudio(src);
      this.currentAudio = audio;

      const cleanup = () => {
        audio.onended = null;
        audio.onerror = null;
        this.currentAudio = null;
      };

      audio.onended = () => {
        cleanup();
        resolve();
      };

      audio.onerror = () => {
        cleanup();
        resolve();
      };

      audio.play().catch(() => {
        cleanup();
        resolve();
      });
    });
  }

  private async processQueue() {
    if (this.isPlaying) return;
    if (!this.unlocked) return;
    if (!this.enabled) return;
    if (this.queue.length === 0) return;

    this.isPlaying = true;

    while (this.queue.length > 0) {
      if (!this.enabled) {
        break;
      }

      const item = this.queue.shift();
      if (!item) continue;

      for (const part of item.sequence) {
        if (!this.enabled) {
          break;
        }

        await this.playSingle(part.src);
      }
    }

    this.isPlaying = false;
  }
}

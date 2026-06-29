import { useCallback, useRef } from 'react';
import { useSettingsStore } from '@/shared/stores/settings.store';

export function useKeySound() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    if (!soundEnabled) return;

    try {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 800;
      gain.gain.value = 0.03;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } catch {
      // Audio not available
    }
  }, [soundEnabled]);

  return play;
}

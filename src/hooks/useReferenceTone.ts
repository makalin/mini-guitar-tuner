import { useRef, useCallback } from 'react';

export function useReferenceTone(volume: number, durationSeconds: number, calibrationCents: number) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const play = useCallback(
    (frequencyHz: number) => {
      const calibratedFreq = frequencyHz * Math.pow(2, calibrationCents / 1200);
      const ctx = audioContextRef.current;
      if (ctx?.state === 'suspended') ctx.resume();

      if (!audioContextRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new Ctx();
      }
      const audioContext = audioContextRef.current;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(calibratedFreq, audioContext.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(volume * 0.25, audioContext.currentTime + durationSeconds * 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + durationSeconds);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + durationSeconds);
    },
    [volume, durationSeconds, calibrationCents]
  );

  return play;
}

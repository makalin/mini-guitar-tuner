import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, Square, Settings, X, Volume2 } from 'lucide-react';
import { TUNINGS, TUNING_IDS, DEFAULT_TUNING_ID, type TuningId, type TuningNote } from './constants/tunings';
import { THEMES, type ThemeId } from './constants/themes';
import { useSettings } from './context/SettingsContext';
import { useReferenceTone } from './hooks/useReferenceTone';

const GuitarTuner = () => {
  const { settings, setTuningId, setTheme, setRefToneVolume, setRefToneDuration, setCalibrationCents, resetSettings } = useSettings();
  const playTone = useReferenceTone(settings.refToneVolume, settings.refToneDuration, settings.calibrationCents);

  const [isListening, setIsListening] = useState(false);
  const [pitch, setPitch] = useState<number | null>(null);
  const [closestNote, setClosestNote] = useState<TuningNote | null>(null);
  const [deviation, setDeviation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState(new Float32Array(100).fill(0));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const listeningRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const selectedTuning = TUNINGS[settings.tuningId] ?? TUNINGS[DEFAULT_TUNING_ID];
  const notes = selectedTuning.notes;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const findClosestNote = useCallback(
    (frequency: number) => {
      let closest = notes[0];
      let minDiff = Math.abs(frequency - notes[0].freq);
      notes.forEach((note) => {
        const diff = Math.abs(frequency - note.freq);
        if (diff < minDiff) {
          closest = note;
          minDiff = diff;
        }
      });
      const dev = ((frequency - closest.freq) / closest.freq) * 100;
      return { note: closest, deviation: dev };
    },
    [notes]
  );

  const handleTuningChange = useCallback(
    (value: string) => {
      setTuningId(value as TuningId);
      setPitch(null);
      setClosestNote(null);
      setDeviation(0);
    },
    [setTuningId]
  );

  const startListening = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      listeningRef.current = true;
      setIsListening(true);
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      const detectPitch = () => {
        if (!listeningRef.current) return;
        analyser.getFloatTimeDomainData(dataArray);
        const waveformSamples = new Float32Array(100);
        for (let i = 0; i < 100; i++) {
          waveformSamples[i] = dataArray[Math.floor(i * (bufferLength / 100))];
        }
        setWaveformData(waveformSamples);
        let zeroCrossings = 0;
        for (let i = 1; i < bufferLength; i++) {
          if (dataArray[i - 1] < 0 && dataArray[i] >= 0) zeroCrossings++;
        }
        const frequency = (zeroCrossings * audioContext.sampleRate) / (2 * bufferLength);
        const minFreq = notes[0].freq * 0.8;
        const maxFreq = notes[notes.length - 1].freq * 1.2;
        if (frequency > minFreq && frequency < maxFreq) {
          setPitch(Math.round(frequency));
          const { note, deviation } = findClosestNote(frequency);
          setClosestNote(note);
          setDeviation(deviation);
        }
        requestAnimationFrame(detectPitch);
      };
      detectPitch();
    } catch {
      setError('Allow microphone access to use the tuner.');
    }
  };

  const stopListening = () => {
    listeningRef.current = false;
    setIsListening(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const needleAngle = Math.max(-45, Math.min(45, deviation * 3));

  return (
    <div className="min-h-screen p-4 pb-8" style={{ background: 'var(--tuner-bg)', color: 'var(--tuner-text)' }}>
      {/* Header */}
      <header className="flex items-center justify-between max-w-lg mx-auto mb-4">
        <h1 className="text-xl font-semibold tracking-wide" style={{ fontFamily: 'var(--tuner-font-display)' }}>
          Mini Guitar Tuner
        </h1>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-lg border transition-opacity hover:opacity-80"
          style={{ borderColor: 'var(--tuner-border)', background: 'var(--tuner-surface)' }}
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" style={{ color: 'var(--tuner-accent)' }} />
        </button>
      </header>

      {/* Main panel */}
      <main
        className="max-w-lg mx-auto rounded-2xl border-2 p-6 shadow-xl"
        style={{
          background: 'var(--tuner-surface)',
          borderColor: 'var(--tuner-border)',
          boxShadow: '0 0 0 1px var(--tuner-border), 0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        {error && (
          <div
            className="mb-4 p-4 rounded-lg text-sm"
            style={{ background: 'var(--tuner-sharp)', color: 'var(--tuner-bg)' }}
          >
            {error}
          </div>
        )}

        {/* Tuning selector */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--tuner-text-muted)' }}>
            Instrument & Tuning
          </label>
          <select
            value={settings.tuningId}
            onChange={(e) => handleTuningChange(e.target.value)}
            className="w-full py-3 px-4 rounded-lg text-base font-medium focus:outline-none focus:ring-2"
            style={{
              background: 'var(--tuner-bg)',
              border: '2px solid var(--tuner-border)',
              color: 'var(--tuner-text)',
            }}
          >
            {TUNING_IDS.map((id) => (
              <option key={id} value={id}>
                {TUNINGS[id].instrument} — {TUNINGS[id].name}
              </option>
            ))}
          </select>
        </div>

        {/* Listen button */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-transform active:scale-95"
            style={{
              background: isListening ? 'var(--tuner-sharp)' : 'var(--tuner-accent)',
              color: 'var(--tuner-bg)',
            }}
          >
            {isListening ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isListening ? 'Stop' : 'Listen'}
          </button>
        </div>

        {/* Needle meter */}
        <div
          className="relative mx-auto mb-6 rounded-xl overflow-hidden"
          style={{
            height: 140,
            background: 'var(--tuner-bg)',
            border: '2px solid var(--tuner-border)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="absolute w-1 rounded-full transition-transform duration-150 origin-bottom"
              style={{
                height: '60%',
                bottom: '50%',
                background: 'var(--tuner-needle)',
                transform: `translateX(-50%) rotate(${needleAngle}deg)`,
                boxShadow: '0 0 8px var(--tuner-needle)',
              }}
            />
          </div>
          <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4 text-xs" style={{ color: 'var(--tuner-text-muted)' }}>
            <span>Flat</span>
            <span className="font-medium" style={{ color: 'var(--tuner-in-tune)' }}>In tune</span>
            <span>Sharp</span>
          </div>
        </div>

        {/* Detected note */}
        {pitch !== null && closestNote && (
          <div className="text-center mb-6">
            <div className="text-4xl font-bold tracking-tight" style={{ color: 'var(--tuner-accent)' }}>
              {closestNote.note}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--tuner-text-muted)' }}>
              {pitch.toFixed(1)} Hz
              {Math.abs(deviation) < 5 ? (
                <span className="ml-2 font-medium" style={{ color: 'var(--tuner-in-tune)' }}>In tune</span>
              ) : deviation > 0 ? (
                <span className="ml-2" style={{ color: 'var(--tuner-sharp)' }}>Sharp</span>
              ) : (
                <span className="ml-2" style={{ color: 'var(--tuner-flat)' }}>Flat</span>
              )}
            </div>
          </div>
        )}

        {/* Waveform */}
        {isListening && (
          <div className="mb-6 rounded-lg overflow-hidden" style={{ background: 'var(--tuner-bg)', border: '1px solid var(--tuner-border)' }}>
            <svg className="w-full h-20" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="var(--tuner-wave)"
                strokeWidth="0.5"
                strokeLinejoin="round"
                points={Array.from(waveformData, (v, i) => `${(i / (waveformData.length - 1 || 1)) * 100},${50 + v * 30}`).join(' ')}
              />
            </svg>
          </div>
        )}

        {/* Reference tones — play target pitch per string */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="w-4 h-4" style={{ color: 'var(--tuner-accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--tuner-text-muted)' }}>
              Reference tone
            </span>
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${notes.length}, minmax(0, 1fr))` }}>
            {notes.map((n, i) => (
              <button
                key={`${n.note}-${i}`}
                type="button"
                onClick={() => playTone(n.freq)}
                className="py-3 px-2 rounded-lg font-semibold text-sm transition-transform active:scale-95"
                style={{
                  background: 'var(--tuner-bg)',
                  border: '2px solid var(--tuner-border)',
                  color: 'var(--tuner-accent)',
                }}
              >
                <span className="block">{n.note}</span>
                <span className="block text-xs font-normal mt-0.5" style={{ color: 'var(--tuner-text-muted)' }}>
                  {n.freq.toFixed(0)} Hz
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Settings modal */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border-2 p-6 shadow-2xl"
            style={{
              background: 'var(--tuner-surface)',
              borderColor: 'var(--tuner-border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="p-2 rounded-lg hover:opacity-80"
                style={{ background: 'var(--tuner-bg)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--tuner-text-muted)' }}>
                  Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id as ThemeId)}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{
                        background: settings.theme === t.id ? 'var(--tuner-accent)' : 'var(--tuner-bg)',
                        color: settings.theme === t.id ? 'var(--tuner-bg)' : 'var(--tuner-text)',
                        border: '2px solid var(--tuner-border)',
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--tuner-text-muted)' }}>
                  Reference tone volume
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={settings.refToneVolume}
                  onChange={(e) => setRefToneVolume(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full"
                  style={{ accentColor: 'var(--tuner-accent)' }}
                />
                <span className="text-xs ml-2" style={{ color: 'var(--tuner-text-muted)' }}>
                  {Math.round(settings.refToneVolume * 100)}%
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--tuner-text-muted)' }}>
                  Tone duration (sec)
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.25}
                  value={settings.refToneDuration}
                  onChange={(e) => setRefToneDuration(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full"
                  style={{ accentColor: 'var(--tuner-accent)' }}
                />
                <span className="text-xs ml-2" style={{ color: 'var(--tuner-text-muted)' }}>
                  {settings.refToneDuration}s
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--tuner-text-muted)' }}>
                  Calibration (cents, A440 = 0)
                </label>
                <input
                  type="number"
                  min={-50}
                  max={50}
                  value={settings.calibrationCents}
                  onChange={(e) => setCalibrationCents(parseFloat(e.target.value) || 0)}
                  className="w-full py-2 px-3 rounded-lg"
                  style={{
                    background: 'var(--tuner-bg)',
                    border: '2px solid var(--tuner-border)',
                    color: 'var(--tuner-text)',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  resetSettings();
                  setSettingsOpen(false);
                }}
                className="w-full py-2 rounded-lg text-sm font-medium"
                style={{
                  background: 'var(--tuner-bg)',
                  border: '2px solid var(--tuner-border)',
                  color: 'var(--tuner-text-muted)',
                }}
              >
                Reset to defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuitarTuner;

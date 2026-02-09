import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
import { Switch } from './components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

const TUNINGS = {
  'standard': {
    name: 'Standard (6 String)',
    notes: [
      { note: 'E2', freq: 82.41 },
      { note: 'A2', freq: 110.00 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.00 },
      { note: 'B3', freq: 246.94 },
      { note: 'E4', freq: 329.63 }
    ]
  },
  'drop-d': {
    name: 'Drop D',
    notes: [
      { note: 'D2', freq: 73.42 },
      { note: 'A2', freq: 110.00 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.00 },
      { note: 'B3', freq: 246.94 },
      { note: 'E4', freq: 329.63 }
    ]
  },
  '7-string': {
    name: '7 String',
    notes: [
      { note: 'B1', freq: 61.74 },
      { note: 'E2', freq: 82.41 },
      { note: 'A2', freq: 110.00 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.00 },
      { note: 'B3', freq: 246.94 },
      { note: 'E4', freq: 329.63 }
    ]
  },
  '8-string': {
    name: '8 String',
    notes: [
      { note: 'F#1', freq: 46.25 },
      { note: 'B1', freq: 61.74 },
      { note: 'E2', freq: 82.41 },
      { note: 'A2', freq: 110.00 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.00 },
      { note: 'B3', freq: 246.94 },
      { note: 'E4', freq: 329.63 }
    ]
  },
  'bass': {
    name: 'Bass Guitar',
    notes: [
      { note: 'E1', freq: 41.20 },
      { note: 'A1', freq: 55.00 },
      { note: 'D2', freq: 73.42 },
      { note: 'G2', freq: 98.00 }
    ]
  }
};

const GuitarTuner = () => {
  const [isListening, setIsListening] = useState(false);
  const [pitch, setPitch] = useState<number | null>(null);
  const [closestNote, setClosestNote] = useState<{ note: string; freq: number } | null>(null);
  const [deviation, setDeviation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [waveformData, setWaveformData] = useState(new Float32Array(100).fill(0));
  const [selectedTuning, setSelectedTuning] = useState<keyof typeof TUNINGS>('standard');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const findClosestNote = (frequency: number) => {
    const notes = TUNINGS[selectedTuning].notes;
    let closestNote = notes[0];
    let minDiff = Math.abs(frequency - notes[0].freq);

    notes.forEach(note => {
      const diff = Math.abs(frequency - note.freq);
      if (diff < minDiff) {
        closestNote = note;
        minDiff = diff;
      }
    });

    const deviation = ((frequency - closestNote.freq) / closestNote.freq) * 100;
    return { note: closestNote, deviation };
  };

  const handleTuningChange = (value: string) => {
    setSelectedTuning(value as keyof typeof TUNINGS);
    setPitch(null);
    setClosestNote(null);
    setDeviation(0);
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyser.fftSize = 2048;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      const detectPitch = () => {
        analyser.getFloatTimeDomainData(dataArray);
        
        const waveformSamples = new Float32Array(100);
        for (let i = 0; i < 100; i++) {
          waveformSamples[i] = dataArray[Math.floor(i * (bufferLength / 100))];
        }
        setWaveformData(waveformSamples);
        
        let zeroCrossings = 0;
        for (let i = 1; i < bufferLength; i++) {
          if (dataArray[i-1] < 0 && dataArray[i] >= 0) {
            zeroCrossings++;
          }
        }

        const frequency = (zeroCrossings * audioContext.sampleRate) / (2 * bufferLength);
        
        // Adjust frequency range based on tuning type
        const minFreq = TUNINGS[selectedTuning].notes[0].freq * 0.8;
        const maxFreq = TUNINGS[selectedTuning].notes[TUNINGS[selectedTuning].notes.length - 1].freq * 1.2;
        
        if (frequency > minFreq && frequency < maxFreq) {
          setPitch(Math.round(frequency));
          const { note, deviation } = findClosestNote(frequency);
          setClosestNote(note);
          setDeviation(deviation);
        }

        if (isListening) {
          requestAnimationFrame(detectPitch);
        }
      };

      setIsListening(true);
      detectPitch();
    } catch (err) {
      setError("Please allow microphone access to use the tuner.");
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const WaveformVisualizer = ({ data }: { data: Float32Array }) => {
    const points = Array.from(data, (value, index) => {
      const x = (index / (data.length - 1 || 1)) * 100;
      const y = 50 + value * 40;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <polyline
          points={points}
          className="stroke-blue-500 dark:stroke-blue-400 fill-none stroke-2"
        />
      </svg>
    );
  };

  return (
    <div className={`min-h-screen p-4 transition-colors ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="fixed top-4 right-4 flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
        <Sun className="h-4 w-4 dark:text-gray-400" />
        <Switch
          checked={isDarkMode}
          onCheckedChange={setIsDarkMode}
        />
        <Moon className="h-4 w-4 dark:text-gray-400" />
      </div>

      <Card className="w-full max-w-md mx-auto dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-center dark:text-white">Guitar Tuner</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <Select value={selectedTuning} onValueChange={handleTuningChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select tuning" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TUNINGS).map(([key, { name }]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex justify-center">
                <Button 
                  size="lg"
                  onClick={isListening ? stopListening : startListening}
                  className="w-32"
                >
                  {isListening ? (
                    <><Square className="mr-2" size={20} /> Stop</>
                  ) : (
                    <><Mic className="mr-2" size={20} /> Start</>
                  )}
                </Button>
              </div>

              {isListening && (
                <WaveformVisualizer data={waveformData} />
              )}

              {pitch && closestNote && (
                <div className="text-center space-y-4">
                  <div>
                    <div className="text-4xl font-bold mb-2 dark:text-white">{closestNote.note}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {pitch.toFixed(1)} Hz
                    </div>
                  </div>

                  <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`absolute h-full transition-all duration-200 ${
                        Math.abs(deviation) < 5 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        left: '50%',
                        width: '4px',
                        transform: `translateX(${Math.max(Math.min(deviation * 2, 50), -50)}%)`
                      }}
                    />
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.abs(deviation) < 5 ? 'In tune!' : deviation > 0 ? 'Too high' : 'Too low'}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {TUNINGS[selectedTuning].notes.map(({note, freq}) => (
                  <div key={note} className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <div className="font-bold dark:text-white">{note}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{freq.toFixed(2)} Hz</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuitarTuner;

export type TuningId = string;

export interface TuningNote {
  note: string;
  freq: number;
}

export interface Tuning {
  id: TuningId;
  name: string;
  instrument: string;
  notes: TuningNote[];
}

export const TUNINGS: Record<TuningId, Tuning> = {
  'guitar-standard': {
    id: 'guitar-standard',
    name: 'Standard',
    instrument: 'Guitar',
    notes: [
      { note: 'E2', freq: 82.41 },
      { note: 'A2', freq: 110.0 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.0 },
      { note: 'B3', freq: 246.94 },
      { note: 'E4', freq: 329.63 },
    ],
  },
  'guitar-drop-d': {
    id: 'guitar-drop-d',
    name: 'Drop D',
    instrument: 'Guitar',
    notes: [
      { note: 'D2', freq: 73.42 },
      { note: 'A2', freq: 110.0 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.0 },
      { note: 'B3', freq: 246.94 },
      { note: 'E4', freq: 329.63 },
    ],
  },
  'guitar-drop-c': {
    id: 'guitar-drop-c',
    name: 'Drop C',
    instrument: 'Guitar',
    notes: [
      { note: 'C2', freq: 65.41 },
      { note: 'G2', freq: 98.0 },
      { note: 'C3', freq: 130.81 },
      { note: 'F3', freq: 174.61 },
      { note: 'A3', freq: 220.0 },
      { note: 'D4', freq: 293.66 },
    ],
  },
  'guitar-open-g': {
    id: 'guitar-open-g',
    name: 'Open G',
    instrument: 'Guitar',
    notes: [
      { note: 'D2', freq: 73.42 },
      { note: 'G2', freq: 98.0 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.0 },
      { note: 'B3', freq: 246.94 },
      { note: 'D4', freq: 293.66 },
    ],
  },
  'guitar-open-d': {
    id: 'guitar-open-d',
    name: 'Open D',
    instrument: 'Guitar',
    notes: [
      { note: 'D2', freq: 73.42 },
      { note: 'A2', freq: 110.0 },
      { note: 'D3', freq: 146.83 },
      { note: 'F#3', freq: 185.0 },
      { note: 'A3', freq: 220.0 },
      { note: 'D4', freq: 293.66 },
    ],
  },
  'guitar-7': {
    id: 'guitar-7',
    name: '7-String',
    instrument: 'Guitar',
    notes: [
      { note: 'B1', freq: 61.74 },
      { note: 'E2', freq: 82.41 },
      { note: 'A2', freq: 110.0 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.0 },
      { note: 'B3', freq: 246.94 },
      { note: 'E4', freq: 329.63 },
    ],
  },
  'guitar-8': {
    id: 'guitar-8',
    name: '8-String',
    instrument: 'Guitar',
    notes: [
      { note: 'F#1', freq: 46.25 },
      { note: 'B1', freq: 61.74 },
      { note: 'E2', freq: 82.41 },
      { note: 'A2', freq: 110.0 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.0 },
      { note: 'B3', freq: 246.94 },
      { note: 'E4', freq: 329.63 },
    ],
  },
  'bass-standard': {
    id: 'bass-standard',
    name: 'Standard',
    instrument: 'Bass',
    notes: [
      { note: 'E1', freq: 41.2 },
      { note: 'A1', freq: 55.0 },
      { note: 'D2', freq: 73.42 },
      { note: 'G2', freq: 98.0 },
    ],
  },
  'bass-5': {
    id: 'bass-5',
    name: '5-String',
    instrument: 'Bass',
    notes: [
      { note: 'B0', freq: 30.87 },
      { note: 'E1', freq: 41.2 },
      { note: 'A1', freq: 55.0 },
      { note: 'D2', freq: 73.42 },
      { note: 'G2', freq: 98.0 },
    ],
  },
  'ukulele-soprano': {
    id: 'ukulele-soprano',
    name: 'Soprano (GCEA)',
    instrument: 'Ukulele',
    notes: [
      { note: 'G4', freq: 392.0 },
      { note: 'C4', freq: 261.63 },
      { note: 'E4', freq: 329.63 },
      { note: 'A4', freq: 440.0 },
    ],
  },
  'ukulele-concert': {
    id: 'ukulele-concert',
    name: 'Concert',
    instrument: 'Ukulele',
    notes: [
      { note: 'G4', freq: 392.0 },
      { note: 'C4', freq: 261.63 },
      { note: 'E4', freq: 329.63 },
      { note: 'A4', freq: 440.0 },
    ],
  },
  'ukulele-baritone': {
    id: 'ukulele-baritone',
    name: 'Baritone (DGBE)',
    instrument: 'Ukulele',
    notes: [
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.0 },
      { note: 'B3', freq: 246.94 },
      { note: 'E4', freq: 329.63 },
    ],
  },
  'banjo-5': {
    id: 'banjo-5',
    name: '5-String (G)',
    instrument: 'Banjo',
    notes: [
      { note: 'G4', freq: 392.0 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.0 },
      { note: 'B3', freq: 246.94 },
      { note: 'D4', freq: 293.66 },
    ],
  },
  'mandolin': {
    id: 'mandolin',
    name: 'Standard',
    instrument: 'Mandolin',
    notes: [
      { note: 'G3', freq: 196.0 },
      { note: 'D4', freq: 293.66 },
      { note: 'A4', freq: 440.0 },
      { note: 'E5', freq: 659.25 },
    ],
  },
  'violin': {
    id: 'violin',
    name: 'Standard',
    instrument: 'Violin',
    notes: [
      { note: 'G3', freq: 196.0 },
      { note: 'D4', freq: 293.66 },
      { note: 'A4', freq: 440.0 },
      { note: 'E5', freq: 659.25 },
    ],
  },
  'cello': {
    id: 'cello',
    name: 'Standard',
    instrument: 'Cello',
    notes: [
      { note: 'C2', freq: 65.41 },
      { note: 'G2', freq: 98.0 },
      { note: 'D3', freq: 146.83 },
      { note: 'A3', freq: 220.0 },
    ],
  },
};

export const TUNING_IDS = Object.keys(TUNINGS) as TuningId[];
export const DEFAULT_TUNING_ID: TuningId = 'guitar-standard';

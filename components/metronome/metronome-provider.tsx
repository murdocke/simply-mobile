import { Audio } from 'expo-av';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const TIME_SIGNATURES = ['4/4', '3/4', '2/4', '6/8'] as const;
export type TimeSignature = (typeof TIME_SIGNATURES)[number];

const beatsPerBar: Record<TimeSignature, number> = {
  '4/4': 4,
  '3/4': 3,
  '2/4': 2,
  '6/8': 6,
};
const CLICK_GAIN = 0.85;
const UPTICK_GAIN = 0.95;

type BeatPulse = {
  tick: number;
  accented: boolean;
};

type MetronomeContextValue = {
  bpm: number;
  setBpm: (value: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (value: boolean | ((prev: boolean) => boolean)) => void;
  togglePlayback: () => void;
  accentOn: boolean;
  setAccentOn: (value: boolean | ((prev: boolean) => boolean)) => void;
  volume: number;
  setVolume: (value: number | ((prev: number) => number)) => void;
  timeSignature: TimeSignature;
  setTimeSignature: (value: TimeSignature) => void;
  beatPulse: BeatPulse;
};

const MetronomeContext = createContext<MetronomeContextValue | null>(null);

type MetronomeProviderProps = {
  children: ReactNode;
};

export function MetronomeProvider({ children }: MetronomeProviderProps) {
  const [bpm, setBpm] = useState(96);
  const [isPlaying, setIsPlaying] = useState(false);
  const [accentOn, setAccentOn] = useState(true);
  const [volume, setVolume] = useState(1);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
  const [beatPulse, setBeatPulse] = useState<BeatPulse>({ tick: 0, accented: false });

  const clickSoundRef = useRef<Audio.Sound | null>(null);
  const uptickSoundRef = useRef<Audio.Sound | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextTickAtRef = useRef(0);
  const beatRef = useRef(0);
  const accentOnRef = useRef(accentOn);
  const volumeRef = useRef(volume);
  const timeSignatureRef = useRef<TimeSignature>(timeSignature);
  const beatsPerBarRef = useRef(beatsPerBar[timeSignature]);

  const stopLoop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    accentOnRef.current = accentOn;
  }, [accentOn]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    timeSignatureRef.current = timeSignature;
    beatsPerBarRef.current = beatsPerBar[timeSignature];
    beatRef.current = 0;
  }, [timeSignature]);

  const playTick = useCallback(async () => {
    const beatInBar = beatRef.current % beatsPerBarRef.current;
    const isCountOne = beatInBar === 0;
    const isCountFourInSixEight = timeSignatureRef.current === '6/8' && beatInBar === 3;
    const isAccentedBeat = isCountOne || isCountFourInSixEight;
    const useAccent = accentOnRef.current && isAccentedBeat;
    const sound = useAccent ? uptickSoundRef.current : clickSoundRef.current;

    setBeatPulse((prev) => ({ tick: prev.tick + 1, accented: useAccent }));

    if (sound) {
      try {
        await sound.replayAsync();
      } catch {
        // ignore playback glitches from overlap/timing jitter
      }
    }

    beatRef.current += 1;
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          staysActiveInBackground: false,
        });
        const { sound: clickSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/metronome-click.wav'),
          { volume: CLICK_GAIN * volumeRef.current }
        );
        const { sound: uptickSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/metronome-uptick.wav'),
          { volume: UPTICK_GAIN * volumeRef.current }
        );

        if (!active) {
          await clickSound.unloadAsync();
          await uptickSound.unloadAsync();
          return;
        }
        clickSoundRef.current = clickSound;
        uptickSoundRef.current = uptickSound;
      } catch {
        // leave silent if audio init fails
      }
    })();

    return () => {
      active = false;
      stopLoop();
      if (clickSoundRef.current) {
        void clickSoundRef.current.unloadAsync();
        clickSoundRef.current = null;
      }
      if (uptickSoundRef.current) {
        void uptickSoundRef.current.unloadAsync();
        uptickSoundRef.current = null;
      }
    };
  }, [stopLoop]);

  useEffect(() => {
    if (clickSoundRef.current) {
      void clickSoundRef.current.setVolumeAsync(CLICK_GAIN * volume);
    }
    if (uptickSoundRef.current) {
      void uptickSoundRef.current.setVolumeAsync(UPTICK_GAIN * volume);
    }
  }, [volume]);

  useEffect(() => {
    stopLoop();
    if (!isPlaying) {
      return;
    }

    beatRef.current = 0;
    const baseIntervalMs = 60000 / bpm;
    const intervalMs = timeSignature === '6/8' ? baseIntervalMs / 2 : baseIntervalMs;
    nextTickAtRef.current = performance.now();

    const scheduleNext = () => {
      const now = performance.now();
      const delay = Math.max(0, nextTickAtRef.current - now);
      timeoutRef.current = setTimeout(() => {
        void playTick();
        nextTickAtRef.current += intervalMs;
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return stopLoop;
  }, [bpm, isPlaying, playTick, stopLoop, timeSignature]);

  const togglePlayback = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      bpm,
      setBpm,
      isPlaying,
      setIsPlaying,
      togglePlayback,
      accentOn,
      setAccentOn,
      volume,
      setVolume,
      timeSignature,
      setTimeSignature,
      beatPulse,
    }),
    [accentOn, beatPulse, bpm, isPlaying, timeSignature, togglePlayback, volume]
  );

  return <MetronomeContext.Provider value={value}>{children}</MetronomeContext.Provider>;
}

export function useMetronome() {
  const context = useContext(MetronomeContext);
  if (!context) {
    throw new Error('useMetronome must be used within MetronomeProvider');
  }
  return context;
}

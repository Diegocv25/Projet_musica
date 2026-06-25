import { Audio } from "expo-av";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Track } from "./music";

type PlayerContextType = {
  current: Track | null;
  playing: boolean;
  loading: boolean;
  play: (track: Track) => void;
  toggle: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(() => undefined);

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => undefined);
      }
    };
  }, []);

  async function loadAndPlay(track: Track) {
    setLoading(true);
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: true, volume: 1.0 },
      );
      soundRef.current = sound;
      setCurrent(track);
      setPlaying(true);
    } catch {
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  }

  async function togglePlayback() {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
      setPlaying(false);
      return;
    }
    await soundRef.current.playAsync();
    setPlaying(true);
  }

  const value = useMemo(
    () => ({
      current,
      playing,
      loading,
      play: (track: Track) => {
        void loadAndPlay(track);
      },
      toggle: () => {
        void togglePlayback();
      },
    }),
    [current, playing, loading],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}

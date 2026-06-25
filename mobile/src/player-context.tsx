import { createContext, useContext, useMemo, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import TrackPlayer, { AppKilledPlaybackBehavior, Capability, State } from "react-native-track-player";
import type { Track as PlayerTrack } from "react-native-track-player";
import type { Track } from "./music";

type PlayerContextType = {
  current: Track | null;
  playing: boolean;
  loading: boolean;
  play: (track: Track) => void;
  toggle: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

function toPlayerTrack(track: Track): PlayerTrack {
  const uri = track.playUrl || track.audioUrl;
  return {
    id: track.id,
    url: uri,
    title: track.title,
    artist: track.artist,
    artwork: track.cover,
    cover: track.cover,
    playUrl: track.playUrl,
    audioUrl: track.audioUrl,
    folderId: track.folderId,
    status: track.status,
  };
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const setupRef = useRef<Promise<void> | null>(null);

  async function ensurePlayerReady() {
    if (!setupRef.current) {
      setupRef.current = (async () => {
        try {
          await TrackPlayer.setupPlayer();
        } catch (error) {
          console.warn("TrackPlayer setup failed", error);
        }

        try {
          await TrackPlayer.updateOptions({
            android: {
              appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
            },
            capabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.Stop,
              Capability.SeekTo,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
            ],
            compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
          });
        } catch (error) {
          console.warn("TrackPlayer updateOptions failed", error);
        }
      })();
    }

    await setupRef.current;
  }

  async function ensureNotificationPermission() {
    if (Platform.OS !== "android") return;
    const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
    if (!permission) return;
    try {
      const granted = await PermissionsAndroid.request(permission);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn("Notification permission not granted for TrackPlayer");
      }
    } catch (error) {
      console.warn("Notification permission request failed", error);
    }
  }

  async function loadAndPlay(track: Track) {
    const uri = track.playUrl || track.audioUrl;
    if (!uri) return;

    setLoading(true);
    try {
      await ensurePlayerReady();
      await ensureNotificationPermission();
      await TrackPlayer.reset();
      await TrackPlayer.add(toPlayerTrack(track));
      await TrackPlayer.play();
      setCurrent(track);
      setPlaying(true);
    } catch (error) {
      console.warn("TrackPlayer play failed", error);
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  }

  async function togglePlayback() {
    try {
      await ensurePlayerReady();
      if (!current) {
        return;
      }
      const state = (await TrackPlayer.getPlaybackState()).state;
      if (state === State.Playing || state === State.Buffering) {
        await TrackPlayer.pause();
        setPlaying(false);
        return;
      }
      await TrackPlayer.play();
      setPlaying(true);
    } catch (error) {
      console.warn("TrackPlayer toggle failed", error);
    }
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

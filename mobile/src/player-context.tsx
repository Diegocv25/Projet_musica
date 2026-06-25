import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
  useActiveTrack,
  useIsPlaying,
  useTrackPlayerEvents,
} from "react-native-track-player";
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

function fromPlayerTrack(track: PlayerTrack | undefined): Track | null {
  if (!track) return null;
  return {
    id: String(track.id),
    title: track.title ?? "",
    artist: track.artist ?? "",
    cover: String(track.artwork ?? track.cover ?? ""),
    duration: typeof track.duration === "number" ? `${Math.floor(track.duration / 60)}:${String(Math.round(track.duration % 60)).padStart(2, "0")}` : "",
    audioUrl: String(track.url ?? track.audioUrl ?? ""),
    playUrl: typeof track.playUrl === "string" ? track.playUrl : undefined,
    folderId: typeof track.folderId === "string" ? track.folderId : undefined,
    status: typeof track.status === "string" ? track.status : undefined,
  };
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const setupRef = useRef<Promise<void> | null>(null);
  const activeTrack = useActiveTrack();
  const { playing: isPlaying } = useIsPlaying();

  useEffect(() => {
    void ensurePlayerReady();
    void ensureNotificationPermission();
  }, []);

  useTrackPlayerEvents([Event.PlaybackError], (event) => {
    console.warn("TrackPlayer playback error", event);
  });

  async function ensurePlayerReady() {
    if (!setupRef.current) {
      setupRef.current = (async () => {
        try {
          await TrackPlayer.setupPlayer();
        } catch (error) {
          const message = String(error ?? "");
          if (!message.includes("already initialized")) {
            throw error;
          }
        }

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
      await TrackPlayer.reset();
      await TrackPlayer.add(toPlayerTrack(track));
      await TrackPlayer.play();
    } catch (error) {
      console.warn("TrackPlayer play failed", error);
    } finally {
      setLoading(false);
    }
  }

  async function togglePlayback() {
    try {
      await ensurePlayerReady();
      const state = (await TrackPlayer.getPlaybackState()).state;
      if (state === State.Playing || state === State.Buffering) {
        await TrackPlayer.pause();
        return;
      }
      await TrackPlayer.play();
    } catch (error) {
      console.warn("TrackPlayer toggle failed", error);
    }
  }

  const value = useMemo(
    () => ({
      current: fromPlayerTrack(activeTrack),
      playing: Boolean(isPlaying),
      loading,
      play: (track: Track) => {
        void loadAndPlay(track);
      },
      toggle: () => {
        void togglePlayback();
      },
    }),
    [activeTrack, isPlaying, loading],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}

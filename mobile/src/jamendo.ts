import Constants from "expo-constants";
import type { Track } from "./music";

type JamendoTrack = {
  id: string;
  name: string;
  artist_name: string;
  image?: string;
  audio?: string;
  duration?: number;
};

type JamendoResponse = {
  headers?: { status?: string; error_message?: string };
  results?: JamendoTrack[];
};

function getClientId() {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
  const fromExtra = typeof extra.jamendoClientId === "string" ? extra.jamendoClientId : "";
  const fromPublicEnv = process.env.EXPO_PUBLIC_JAMENDO_CLIENT_ID ?? "";
  return (fromPublicEnv || fromExtra).trim();
}

function secondsToDuration(seconds?: number) {
  if (!seconds || Number.isNaN(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function mapTrack(track: JamendoTrack): Track | null {
  if (!track.audio) return null;
  return {
    id: String(track.id),
    title: track.name,
    artist: track.artist_name,
    cover: track.image || "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?q=80&w=800&auto=format&fit=crop",
    duration: secondsToDuration(track.duration),
    audioUrl: track.audio,
  };
}

export async function searchJamendoTracks(query: string, limit = 20): Promise<Track[]> {
  const clientId = getClientId();
  if (!clientId) return [];

  const params = new URLSearchParams({
    client_id: clientId,
    format: "json",
    include: "musicinfo",
    audioformat: "mp32",
    limit: String(limit),
    search: query,
  });

  const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?${params.toString()}`);
  if (!response.ok) throw new Error(`Jamendo HTTP ${response.status}`);
  const data = (await response.json()) as JamendoResponse;

  if (data.headers?.status !== "success") {
    throw new Error(data.headers?.error_message || "Jamendo API error");
  }

  return (data.results || []).map(mapTrack).filter((t): t is Track => Boolean(t));
}

export async function getFeaturedJamendoTracks(limit = 12): Promise<Track[]> {
  const clientId = getClientId();
  if (!clientId) return [];

  const params = new URLSearchParams({
    client_id: clientId,
    format: "json",
    include: "musicinfo",
    audioformat: "mp32",
    limit: String(limit),
    order: "popularity_total",
  });

  const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?${params.toString()}`);
  if (!response.ok) throw new Error(`Jamendo HTTP ${response.status}`);
  const data = (await response.json()) as JamendoResponse;

  if (data.headers?.status !== "success") {
    throw new Error(data.headers?.error_message || "Jamendo API error");
  }

  return (data.results || []).map(mapTrack).filter((t): t is Track => Boolean(t));
}


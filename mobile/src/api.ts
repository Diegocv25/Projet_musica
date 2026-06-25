import Constants from "expo-constants";

export type Folder = {
  id: string;
  name: string;
  created_at: string;
  trackCount: number;
};

export type SearchResult = {
  youtubeId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration: number | null;
  durationLabel: string | null;
  sourceUrl: string;
  saved: boolean;
  status: "queued" | "downloading" | "ready" | "error" | null;
  fileUrl: string | null;
  folderId: string | null;
};

export type TrackRecord = {
  id: string;
  folderId: string;
  youtubeId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  sourceUrl: string;
  duration: number | null;
  status: "queued" | "downloading" | "ready" | "error";
  fileSize: number | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  fileUrl: string | null;
};

export type TrackPayload = {
  youtubeId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  sourceUrl: string;
  duration: number | null;
  folderId?: string | null;
};

type ApiSearchResponse = {
  results: SearchResult[];
};

type ApiFoldersResponse = {
  folders: Folder[];
};

type ApiTracksResponse = {
  tracks: TrackRecord[];
};

type ApiTrackResponse = {
  track: TrackRecord;
  message?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
const baseFromExtra = typeof extra.apiBaseUrl === "string" ? extra.apiBaseUrl : "";
const baseFromEnv = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
const FALLBACK_API_BASE = "http://127.0.0.1:8787";

export function getApiBaseUrl() {
  return (baseFromEnv || baseFromExtra || FALLBACK_API_BASE).replace(/\/$/, "");
}

export function apiUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${cleanPath}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function loadFolders() {
  const data = await request<ApiFoldersResponse>("/folders");
  return data.folders;
}

export async function createFolder(name: string) {
  const data = await request<{ folder: Folder }>("/folders", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return data.folder;
}

export async function searchYouTube(query: string, limit = 12) {
  const response = await fetch(apiUrl(`/search?q=${encodeURIComponent(query)}&limit=${limit}`));
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  const data = (await response.json()) as ApiSearchResponse;
  return data.results;
}

export async function loadTracks(folderId?: string | null) {
  const suffix = folderId ? `?folderId=${encodeURIComponent(folderId)}` : "";
  const data = await request<ApiTracksResponse>(`/tracks/by-folder${suffix}`);
  return data.tracks;
}

export async function loadStats() {
  return request<{ folders: number; tracks: number; ready: number; queued: number }>("/stats");
}

export async function queueDownload(payload: TrackPayload) {
  const data = await request<ApiTrackResponse>("/downloads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.track;
}

export function resolveRemoteUrl(relativeUrl: string | null) {
  if (!relativeUrl) return null;
  return apiUrl(relativeUrl);
}

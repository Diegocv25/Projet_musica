import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { apiUrl, type TrackRecord } from "./api";

const CACHE_KEY = "projeto-musica:offline-cache";
const OFFLINE_DIR = `${FileSystem.documentDirectory || ""}projeto-musica/offline/`;

type OfflineCache = Record<string, string>;

async function ensureDir() {
  if (!FileSystem.documentDirectory) {
    throw new Error("Armazenamento local indisponível neste aparelho.");
  }
  await FileSystem.makeDirectoryAsync(OFFLINE_DIR, { intermediates: true });
}

async function readCache(): Promise<OfflineCache> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) return {};
  return JSON.parse(raw) as OfflineCache;
}

async function writeCache(cache: OfflineCache) {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function getOfflinePath(trackId: string) {
  const cache = await readCache();
  return cache[trackId] ?? null;
}

export async function saveTrackOffline(track: TrackRecord) {
  if (!track.fileUrl) {
    throw new Error("A faixa ainda não foi baixada na VPS.");
  }

  await ensureDir();
  const fileName = `${track.youtubeId}.mp3`;
  const localUri = `${OFFLINE_DIR}${fileName}`;
  const result = await FileSystem.downloadAsync(apiUrl(track.fileUrl), localUri);
  const cache = await readCache();
  cache[track.id] = result.uri;
  await writeCache(cache);
  return result.uri;
}

export async function removeOfflineTrack(trackId: string) {
  const cache = await readCache();
  const localUri = cache[trackId];
  if (localUri) {
    await FileSystem.deleteAsync(localUri, { idempotent: true });
    delete cache[trackId];
    await writeCache(cache);
  }
}

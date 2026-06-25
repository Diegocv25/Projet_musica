import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { usePlayer } from "../src/player-context";
import { loadTracks, resolveRemoteUrl, type TrackRecord } from "../src/api";
import { getOfflinePath, saveTrackOffline } from "../src/offline";

export default function DownloadsScreen() {
  const params = useLocalSearchParams<{ folderId?: string | string[] }>();
  const folderId = Array.isArray(params.folderId) ? params.folderId[0] : params.folderId;
  const [tracks, setTracks] = useState<TrackRecord[]>([]);
  const [offlinePaths, setOfflinePaths] = useState<Record<string, string | null>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const { play } = usePlayer();

  async function refresh() {
    const data = await loadTracks(folderId ?? null);
    setTracks(data);
    const entries = await Promise.all(data.map(async (track) => [track.id, await getOfflinePath(track.id)] as const));
    setOfflinePaths(Object.fromEntries(entries));
  }

  useEffect(() => {
    void refresh().catch((err) => Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao carregar downloads"));
  }, [folderId]);

  async function onPlay(track: TrackRecord) {
    const offlinePath = offlinePaths[track.id];
    const uri = offlinePath || resolveRemoteUrl(track.fileUrl);
    if (!uri) {
      Alert.alert("Indisponível", "Baixe a faixa primeiro.");
      return;
    }

    play({
      id: track.id,
      title: track.title,
      artist: track.artist,
      cover: track.thumbnailUrl,
      duration: track.duration !== null ? `${Math.floor(track.duration / 60)}:${Math.floor(track.duration % 60).toString().padStart(2, "0")}` : "--:--",
      audioUrl: uri,
      playUrl: uri,
      folderId: track.folderId,
      status: track.status,
    });
    router.push("/player");
  }

  async function onOffline(track: TrackRecord) {
    try {
      setBusyId(track.id);
      const localUri = await saveTrackOffline(track);
      setOfflinePaths((current) => ({ ...current, [track.id]: localUri }));
      Alert.alert("Pronto", "A música ficou disponível offline no aparelho.");
    } catch (err) {
      Alert.alert("Erro", err instanceof Error ? err.message : "Não foi possível salvar offline");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={s.title}>Downloads</Text>
      <Text style={s.sub}>MP3 salvo na VPS e opção de baixar para o aparelho.</Text>

      <View style={{ gap: 10, marginTop: 14 }}>
        {tracks.map((track) => {
          const localPath = offlinePaths[track.id];
          const ready = track.status === "ready";
          const fileUrl = ready ? resolveRemoteUrl(track.fileUrl) : null;
          return (
            <View key={track.id} style={s.card}>
              <Image source={{ uri: track.thumbnailUrl }} style={s.cover} />
              <View style={{ flex: 1 }}>
                <Text style={s.song}>{track.title}</Text>
                <Text style={s.artist}>{track.artist}</Text>
                <Text style={s.badge}>{track.status}</Text>
              </View>
              <View style={s.buttons}>
                <Pressable style={s.btn} onPress={() => onPlay(track)} disabled={!ready && !localPath}>
                  <Text style={s.btnText}>Tocar</Text>
                </Pressable>
                <Pressable style={[s.btn, busyId === track.id && { opacity: 0.5 }]} onPress={() => onOffline(track)} disabled={!fileUrl || busyId === track.id}>
                  <Text style={s.btnText}>{localPath ? "Offline" : "Salvar"}</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D12" },
  title: { color: "#fff", fontSize: 24, fontWeight: "600" },
  sub: { color: "rgba(255,255,255,0.55)", marginTop: 4 },
  card: {
    backgroundColor: "#1A1A26",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cover: { width: 54, height: 54, borderRadius: 10 },
  song: { color: "#fff", fontWeight: "600" },
  artist: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },
  badge: { color: "#C4B5FD", fontSize: 11, marginTop: 6, textTransform: "uppercase" },
  buttons: { gap: 8 },
  btn: { backgroundColor: "#7C3AED", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, minWidth: 72, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 12 },
});

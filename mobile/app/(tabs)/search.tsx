import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { usePlayer } from "../../src/player-context";
import { createFolder, loadFolders, loadTracks, queueDownload, resolveRemoteUrl, searchYouTube, type Folder, type SearchResult } from "../../src/api";

function formatDuration(seconds: number | null) {
  if (seconds === null) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const { play } = usePlayer();

  async function refreshFolders() {
    const data = await loadFolders();
    setFolders(data);
    if (!selectedFolderId && data[0]) {
      setSelectedFolderId(data[0].id);
    }
  }

  async function mergeSavedState(current: SearchResult[]) {
    const tracks = await loadTracks();
    const byYoutubeId = new Map(tracks.map((track) => [track.youtubeId, track]));
    return current.map((item) => {
      const saved = byYoutubeId.get(item.youtubeId);
      if (!saved) return item;
      return {
        ...item,
        saved: true,
        status: saved.status,
        fileUrl: saved.fileUrl,
        folderId: saved.folderId,
      };
    });
  }

  useEffect(() => {
    void refreshFolders().catch((err) => setError(err instanceof Error ? err.message : "Falha ao carregar pastas"));
  }, []);

  useEffect(() => {
    const term = query.trim();
    setError(null);

    if (!term) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      void searchYouTube(term, 12)
        .then(async (data) => {
          const merged = await mergeSavedState(data);
          setResults(merged);
        })
        .catch((err) => {
          setResults([]);
          setError(err instanceof Error ? err.message : "Falha na busca");
        })
        .finally(() => setLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (results.length === 0) return;
    const interval = setInterval(() => {
      void mergeSavedState(results)
        .then(setResults)
        .catch(() => undefined);
    }, 4000);
    return () => clearInterval(interval);
  }, [results]);

  const folderLabel = useMemo(() => folders.find((folder) => folder.id === selectedFolderId)?.name ?? "Padrão", [folders, selectedFolderId]);

  async function onCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    try {
      await createFolder(name);
      setNewFolderName("");
      await refreshFolders();
    } catch (err) {
      Alert.alert("Erro", err instanceof Error ? err.message : "Não foi possível criar a pasta");
    }
  }

  async function onDownload(result: SearchResult) {
    try {
      const track = await queueDownload({
        youtubeId: result.youtubeId,
        title: result.title,
        artist: result.artist,
        thumbnailUrl: result.thumbnailUrl,
        sourceUrl: result.sourceUrl,
        duration: result.duration,
        folderId: selectedFolderId,
      });
      setResults((current) =>
        current.map((item) =>
          item.youtubeId === result.youtubeId
            ? { ...item, saved: true, status: track.status, fileUrl: track.fileUrl, folderId: track.folderId }
            : item,
        ),
      );
      Alert.alert("Fila criada", "A música entrou para download na VPS.");
    } catch (err) {
      Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao baixar");
    }
  }

  function onPlay(result: SearchResult) {
    if (!result.fileUrl) {
      Alert.alert("Ainda não pronto", "Baixe a faixa primeiro.");
      return;
    }

    const remoteUrl = resolveRemoteUrl(result.fileUrl);
    if (!remoteUrl) return;

    play({
      id: result.youtubeId,
      title: result.title,
      artist: result.artist,
      cover: result.thumbnailUrl,
      duration: result.durationLabel || formatDuration(result.duration),
      audioUrl: remoteUrl,
      playUrl: remoteUrl,
      folderId: result.folderId ?? undefined,
      status: result.status ?? undefined,
    });
    router.push("/player");
  }

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 20, paddingBottom: 180 }} keyboardShouldPersistTaps="always">
      <Text style={s.h1}>Buscar no YouTube</Text>
      <Text style={s.sub}>Resultado com thumbnail, pasta e opção de baixar MP3 na VPS.</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Artista, faixa ou trecho"
        placeholderTextColor="rgba(255,255,255,0.35)"
        style={s.input}
      />

      <Text style={s.label}>Pasta ativa: {folderLabel}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 14 }}>
        {folders.map((folder) => (
          <Pressable
            key={folder.id}
            onPress={() => setSelectedFolderId(folder.id)}
            style={[s.chip, selectedFolderId === folder.id && s.chipActive]}
          >
            <Text style={[s.chipText, selectedFolderId === folder.id && s.chipTextActive]}>{folder.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={s.folderRow}>
        <TextInput
          value={newFolderName}
          onChangeText={setNewFolderName}
          placeholder="Criar pasta da família"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={[s.input, { flex: 1, marginBottom: 0 }]}
        />
        <Pressable style={s.smallBtn} onPress={onCreateFolder}>
          <Text style={s.smallBtnText}>Criar</Text>
        </Pressable>
      </View>

      {loading ? <Text style={s.status}>Buscando no YouTube...</Text> : null}
      {!loading && error ? <Text style={s.status}>{error}</Text> : null}
      {!loading && !error && query.trim() && results.length === 0 ? <Text style={s.status}>Nenhum resultado encontrado.</Text> : null}

      <View style={{ gap: 12 }}>
        {results.map((result) => (
          <View key={result.youtubeId} style={s.card}>
            <View style={s.resultTop}>
              <View style={s.coverWrap}>
                <Text style={s.coverLetter}>{result.title.slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{result.title}</Text>
                <Text style={s.subTitle}>{result.artist}</Text>
                <Text style={s.meta}>{result.durationLabel || formatDuration(result.duration)} • {result.saved ? result.status : "Novo"}</Text>
              </View>
            </View>

            <View style={s.actions}>
              <Pressable style={s.actionBtn} onPress={() => onDownload(result)}>
                <Ionicons name="download-outline" color="#fff" size={16} />
                <Text style={s.actionText}>Baixar MP3</Text>
              </Pressable>
              <Pressable style={[s.actionBtn, !result.fileUrl && s.disabledBtn]} onPress={() => onPlay(result)} disabled={!result.fileUrl}>
                <Ionicons name="play-outline" color="#fff" size={16} />
                <Text style={s.actionText}>Tocar</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D12" },
  h1: { color: "#fff", fontSize: 24, fontWeight: "600" },
  sub: { color: "rgba(255,255,255,0.55)", marginTop: 4, marginBottom: 14 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#1A1A26",
    color: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  label: { color: "rgba(255,255,255,0.65)", marginBottom: 8 },
  chip: {
    backgroundColor: "#1A1A26",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: "#7C3AED", borderColor: "#7C3AED" },
  chipText: { color: "rgba(255,255,255,0.72)", fontSize: 12 },
  chipTextActive: { color: "#fff" },
  folderRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 10 },
  smallBtn: {
    backgroundColor: "#2E1E5C",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  smallBtnText: { color: "#fff", fontWeight: "600" },
  status: { color: "rgba(255,255,255,0.55)", marginBottom: 12 },
  card: {
    backgroundColor: "#1A1A26",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 14,
    gap: 12,
  },
  resultTop: { flexDirection: "row", gap: 12, alignItems: "center" },
  coverWrap: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A2140",
  },
  coverLetter: { color: "#fff", fontSize: 22, fontWeight: "700" },
  title: { color: "#fff", fontSize: 15, fontWeight: "600" },
  subTitle: { color: "rgba(255,255,255,0.6)", marginTop: 2 },
  meta: { color: "rgba(255,255,255,0.42)", marginTop: 4, fontSize: 12 },
  actions: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 12,
  },
  disabledBtn: { opacity: 0.4 },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 12 },
});

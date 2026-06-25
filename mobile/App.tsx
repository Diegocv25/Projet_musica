import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type MusicStatus = "rascunho" | "gravada" | "lancada";
type StatusFilter = "todos" | MusicStatus;

type Song = {
  id: string;
  titulo: string;
  artista: string;
  genero: string;
  status: MusicStatus;
  createdAt: string;
};

const STORAGE_KEY = "projeto-musica:songs";

const statusOptions: MusicStatus[] = ["rascunho", "gravada", "lancada"];
const filterOptions: StatusFilter[] = ["todos", ...statusOptions];

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [titulo, setTitulo] = useState("");
  const [artista, setArtista] = useState("");
  const [genero, setGenero] = useState("");
  const [status, setStatus] = useState<MusicStatus>("rascunho");
  const [filter, setFilter] = useState<StatusFilter>("todos");

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Song[];
        if (Array.isArray(parsed)) setSongs(parsed);
      } catch {
        Alert.alert("Erro", "Não foi possível carregar as músicas salvas.");
      }
    })();
  }, []);

  const filteredSongs = useMemo(() => {
    const ordered = [...songs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return filter === "todos" ? ordered : ordered.filter((song) => song.status === filter);
  }, [songs, filter]);

  async function saveSongs(nextSongs: Song[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSongs));
    setSongs(nextSongs);
  }

  async function onSubmit() {
    const cleanTitulo = titulo.trim();
    const cleanArtista = artista.trim();
    const cleanGenero = genero.trim();

    if (!cleanTitulo || !cleanArtista || !cleanGenero) {
      Alert.alert("Validação", "Preencha título, artista e gênero.");
      return;
    }

    const newSong: Song = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      titulo: cleanTitulo,
      artista: cleanArtista,
      genero: cleanGenero,
      status,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveSongs([newSong, ...songs]);
      setTitulo("");
      setArtista("");
      setGenero("");
      setStatus("rascunho");
      Alert.alert("Sucesso", "Música cadastrada.");
    } catch {
      Alert.alert("Erro", "Falha ao salvar música.");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Projeto Música</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cadastrar música</Text>

          <TextInput style={styles.input} placeholder="Título" value={titulo} onChangeText={setTitulo} />
          <TextInput style={styles.input} placeholder="Artista" value={artista} onChangeText={setArtista} />
          <TextInput style={styles.input} placeholder="Gênero" value={genero} onChangeText={setGenero} />

          <Text style={styles.label}>Status</Text>
          <View style={styles.rowWrap}>
            {statusOptions.map((option) => (
              <Pressable
                key={option}
                style={[styles.pill, status === option && styles.pillActive]}
                onPress={() => setStatus(option)}
              >
                <Text style={[styles.pillText, status === option && styles.pillTextActive]}>{option}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.button} onPress={onSubmit}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Músicas ({songs.length})</Text>
          <Text style={styles.label}>Filtrar por status</Text>
          <View style={styles.rowWrap}>
            {filterOptions.map((option) => (
              <Pressable
                key={option}
                style={[styles.pill, filter === option && styles.pillActive]}
                onPress={() => setFilter(option)}
              >
                <Text style={[styles.pillText, filter === option && styles.pillTextActive]}>{option}</Text>
              </Pressable>
            ))}
          </View>

          {filteredSongs.length === 0 ? (
            <Text style={styles.empty}>Nenhuma música para o filtro atual.</Text>
          ) : (
            filteredSongs.map((song) => (
              <View key={song.id} style={styles.songItem}>
                <Text style={styles.songTitle}>{song.titulo}</Text>
                <Text style={styles.songMeta}>
                  {song.artista} • {song.genero} • {song.status}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f7fb" },
  container: { padding: 16, gap: 16 },
  title: { fontSize: 28, fontWeight: "700", color: "#1e293b" },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#0f172a" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  label: { fontSize: 14, color: "#334155", fontWeight: "500" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  pillText: { color: "#334155", textTransform: "capitalize" },
  pillTextActive: { color: "#fff" },
  button: {
    marginTop: 6,
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "600" },
  empty: { color: "#64748b", marginTop: 6 },
  songItem: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#f8fafc",
    gap: 3,
  },
  songTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  songMeta: { color: "#334155" },
});

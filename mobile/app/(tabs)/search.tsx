import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { tracks } from "../../src/music";
import { usePlayer } from "../../src/player-context";
import { router } from "expo-router";
import { searchJamendoTracks } from "../../src/jamendo";

export default function Search() {
  const [q, setQ] = useState("");
  const [apiTracks, setApiTracks] = useState<typeof tracks>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { play } = usePlayer();

  useEffect(() => {
    let active = true;
    const term = q.trim();

    async function run() {
      if (!term) {
        setApiTracks([]);
        setApiError(null);
        return;
      }

      setLoading(true);
      setApiError(null);
      try {
        const result = await searchJamendoTracks(term, 25);
        if (active) setApiTracks(result);
      } catch (error) {
        if (active) {
          setApiTracks([]);
          setApiError(error instanceof Error ? error.message : "Falha na API de música");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void run();
    return () => {
      active = false;
    };
  }, [q]);

  const localResults = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return tracks;
    return tracks.filter((t) => `${t.title} ${t.artist}`.toLowerCase().includes(term));
  }, [q]);

  const results = q.trim() ? (apiTracks.length ? apiTracks : localResults) : localResults;

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 20, paddingBottom: 180 }} keyboardShouldPersistTaps="always">
      <Text style={s.h1}>Buscar</Text>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Artista, faixa ou álbum"
        placeholderTextColor="rgba(255,255,255,0.35)"
        style={s.input}
      />

      {loading ? <Text style={s.empty}>Buscando na Jamendo...</Text> : null}
      {!loading && apiError ? <Text style={s.empty}>API indisponível ({apiError}). Mostrando fallback local.</Text> : null}

      {!results.length ? <Text style={s.empty}>Nenhum resultado encontrado.</Text> : null}

      <View style={{ gap: 10 }}>
        {results.map((t) => (
          <Pressable
            key={t.id}
            style={s.row}
            onPress={() => {
              play(t);
              router.push("/player");
            }}
          >
            <Image source={{ uri: t.cover }} style={s.cover} />
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{t.title}</Text>
              <Text style={s.sub}>{t.artist}</Text>
            </View>
            <Text style={s.action}>Tocar</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D12" },
  h1: { color: "#fff", fontSize: 22, fontWeight: "500", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#1A1A26", color: "#fff", borderRadius: 14, padding: 14, marginBottom: 14 },
  row: { backgroundColor: "#1A1A26", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  cover: { width: 48, height: 48, borderRadius: 10 },
  title: { color: "#fff", fontSize: 14, fontWeight: "500" },
  sub: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },
  action: { color: "#A78BFA", fontWeight: "500", fontSize: 12 },
  empty: { color: "rgba(255,255,255,0.55)", marginBottom: 10 },
});

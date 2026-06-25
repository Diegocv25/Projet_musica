import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { tracks } from "../src/music";
import { usePlayer } from "../src/player-context";

export default function PlaylistScreen() {
  const { play } = usePlayer();

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Pressable onPress={() => router.back()}><Text style={s.back}>← Voltar</Text></Pressable>
      <Text style={s.title}>Noite Intensa</Text>
      <Text style={s.sub}>12 músicas • 46 min</Text>

      <View style={{ gap: 10, marginTop: 14 }}>
        {tracks.map((t) => (
          <Pressable key={t.id} style={s.row} onPress={() => { play(t); router.push('/player'); }}>
            <Image source={{ uri: t.cover }} style={s.cover} />
            <View style={{ flex: 1 }}>
              <Text style={s.song}>{t.title}</Text>
              <Text style={s.artist}>{t.artist}</Text>
            </View>
            <Text style={s.duration}>{t.duration}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D12" },
  back: { color: "#A78BFA", marginBottom: 10 },
  title: { color: "#fff", fontSize: 24, fontWeight: "600" },
  sub: { color: "rgba(255,255,255,0.55)", marginTop: 4 },
  row: { backgroundColor: "#1A1A26", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  cover: { width: 48, height: 48, borderRadius: 10 },
  song: { color: "#fff", fontWeight: "500" },
  artist: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },
  duration: { color: "rgba(255,255,255,0.45)", fontSize: 12 },
});
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

export default function Library() {
  return (
    <View style={s.page}>
      <Text style={s.h1}>Sua Biblioteca</Text>
      <Text style={s.sub}>Playlists, curtidas e downloads.</Text>

      <Pressable style={s.card} onPress={() => router.push("/playlist") }>
        <Text style={s.title}>Playlists</Text>
        <Text style={s.subCard}>Noites • Focus • Chill</Text>
      </Pressable>

      <Pressable style={s.card} onPress={() => router.push("/downloads") }>
        <Text style={s.title}>Downloads</Text>
        <Text style={s.subCard}>2 faixas offline</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D12", padding: 20, gap: 12 },
  h1: { color: "#fff", fontSize: 22, fontWeight: "500" },
  sub: { color: "rgba(255,255,255,0.55)", marginBottom: 8 },
  card: { backgroundColor: "#1A1A26", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 14 },
  title: { color: "#fff", fontSize: 16, fontWeight: "500" },
  subCard: { color: "rgba(255,255,255,0.45)", marginTop: 4 },
});
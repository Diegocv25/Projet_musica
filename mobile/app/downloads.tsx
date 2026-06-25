import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { tracks } from "../src/music";

export default function DownloadsScreen() {
  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={s.title}>Downloads</Text>
      <Text style={s.sub}>Disponível offline</Text>

      <View style={{ gap: 10, marginTop: 14 }}>
        {tracks.slice(0, 2).map((t) => (
          <View key={t.id} style={s.row}>
            <Image source={{ uri: t.cover }} style={s.cover} />
            <View style={{ flex: 1 }}>
              <Text style={s.song}>{t.title}</Text>
              <Text style={s.artist}>{t.artist}</Text>
            </View>
            <Text style={s.badge}>Baixada</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D12" },
  title: { color: "#fff", fontSize: 24, fontWeight: "600" },
  sub: { color: "rgba(255,255,255,0.55)", marginTop: 4 },
  row: { backgroundColor: "#1A1A26", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  cover: { width: 48, height: 48, borderRadius: 10 },
  song: { color: "#fff", fontWeight: "500" },
  artist: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },
  badge: { color: "#A78BFA", fontSize: 12, fontWeight: "500" },
});
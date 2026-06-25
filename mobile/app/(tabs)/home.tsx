import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { tracks } from "../../src/music";
import { usePlayer } from "../../src/player-context";
import { router } from "expo-router";
import { getFeaturedJamendoTracks } from "../../src/jamendo";

const chips = ["Relaxe", "Foco", "Noite", "Acústico"];

export default function Home() {
  const { play } = usePlayer();
  const [featuredTracks, setFeaturedTracks] = useState(tracks);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const apiTracks = await getFeaturedJamendoTracks(12);
        if (active && apiTracks.length) setFeaturedTracks(apiTracks);
      } catch {
        // fallback local
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 20, paddingBottom: 180 }}>
      <View style={s.topRow}>
        <View>
          <Text style={s.greet}>Boa noite, Alex</Text>
          <Text style={s.sub}>Seu momento íntimo de som</Text>
        </View>
        <Text style={s.icon}>⚙️</Text>
      </View>

      <Text style={s.section}>Continuar ouvindo</Text>
      <View style={{ gap: 10, marginTop: 10 }}>
        {featuredTracks.slice(0, 2).map((t) => (
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
            <Text style={s.time}>{t.duration}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={s.section}>Playlists sugeridas</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginTop: 10 }}>
        {chips.map((c, i) => (
          <Pressable key={c} style={s.card} onPress={() => router.push("/playlist") }>
            <Image source={{ uri: featuredTracks[i % featuredTracks.length].cover }} style={s.cardImg} />
            <Text style={s.cardTitle}>{c}</Text>
            <Text style={s.cardSub}>12 músicas</Text>
          </Pressable>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D12" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  greet: { color: "#fff", fontSize: 22, fontWeight: "500" },
  section: { color: "#fff", fontSize: 16, fontWeight: "500", marginTop: 12 },
  icon: { fontSize: 20 },
  sub: { color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 3 },
  row: { backgroundColor: "#1A1A26", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", borderRadius: 14, padding: 10, flexDirection: "row", gap: 10, alignItems: "center" },
  cover: { width: 52, height: 52, borderRadius: 10 },
  title: { color: "#fff", fontSize: 14, fontWeight: "500" },
  time: { color: "rgba(255,255,255,0.45)", fontSize: 12 },
  card: { width: 136, backgroundColor: "#1A1A26", borderRadius: 12, padding: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  cardImg: { width: "100%", height: 120, borderRadius: 10 },
  cardTitle: { color: "#fff", fontSize: 13, marginTop: 8, fontWeight: "500" },
  cardSub: { color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 2 },
});

import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { usePlayer } from "../src/player-context";
import { router } from "expo-router";

export default function PlayerScreen() {
  const { current, playing, loading, toggle } = usePlayer();
  if (!current) {
    return (
      <View style={s.page}><Text style={s.sub}>Nenhuma faixa selecionada.</Text><Pressable onPress={() => router.back()}><Text style={s.back}>Voltar</Text></Pressable></View>
    );
  }
  return (
    <View style={s.page}>
      <Pressable onPress={() => router.back()}><Text style={s.back}>⌄</Text></Pressable>
      <Image source={{ uri: current.cover }} style={s.cover} />
      <Text style={s.title}>{current.title}</Text>
      <Text style={s.sub}>{current.artist}</Text>
      <View style={s.wave} />
      <View style={s.controls}>
        <Text style={s.control}>⏮</Text>
        <Pressable style={s.playBtn} onPress={toggle}><Text style={s.playBtnText}>{loading ? "..." : playing ? "Pausar" : "Tocar"}</Text></Pressable>
        <Text style={s.control}>⏭</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D12", alignItems: "center", padding: 20, paddingTop: 58 },
  back: { color: "#A78BFA", fontSize: 28, alignSelf: "flex-start" },
  cover: { width: "100%", aspectRatio: 1, borderRadius: 18, marginTop: 14 },
  title: { color: "#fff", fontSize: 26, fontWeight: "500", marginTop: 20 },
  sub: { color: "rgba(255,255,255,0.45)", marginTop: 5 },
  wave: { width: "100%", height: 44, borderRadius: 999, backgroundColor: "#1A1A26", marginTop: 30, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  controls: { marginTop: 22, width: "100%", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" },
  control: { color: "#fff", fontSize: 30 },
  playBtn: { backgroundColor: "#7C3AED", paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999 },
  playBtnText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});

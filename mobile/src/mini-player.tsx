import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePlayer } from "./player-context";

export function MiniPlayer() {
  const { current, playing, loading, toggle } = usePlayer();
  if (!current) return null;

  return (
    <Pressable style={styles.wrap} onPress={() => router.push("/player")}> 
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.sub}>{current.artist}</Text>
      </View>
      <Pressable onPress={toggle} style={styles.btn}><Text style={styles.btnText}>{loading ? "..." : playing ? "Pausar" : "Tocar"}</Text></Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 88,
    backgroundColor: "#1A1A26",
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: { color: "#fff", fontSize: 14, fontWeight: "500" },
  sub: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },
  btn: { backgroundColor: "#7C3AED", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "500" },
});

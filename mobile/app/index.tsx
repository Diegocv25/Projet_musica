import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Splash() {
  useEffect(() => {
    const t = setTimeout(() => router.replace("/login"), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0D0D12" }}>
      <Text style={{ color: "#fff", fontSize: 34, fontWeight: "500", marginBottom: 12 }}>Projeto Música</Text>
      <ActivityIndicator color="#A78BFA" />
    </View>
  );
}

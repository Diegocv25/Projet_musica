import { Stack } from "expo-router";
import { View } from "react-native";
import { MiniPlayer } from "../src/mini-player";
import { PlayerProvider } from "../src/player-context";

export default function RootLayout() {
  return (
    <PlayerProvider>
      <View style={{ flex: 1, backgroundColor: "#0D0D12" }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0D0D12" } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="cadastro" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="playlist" />
          <Stack.Screen name="downloads" />
          <Stack.Screen name="player" options={{ presentation: "modal" }} />
        </Stack>
        <MiniPlayer />
      </View>
    </PlayerProvider>
  );
}

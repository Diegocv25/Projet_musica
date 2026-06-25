import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: "#15121b", borderTopColor: "rgba(255,255,255,0.08)", height: 64, paddingTop: 6 },
        tabBarActiveTintColor: "#D2BBFF",
        tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            home: "home-outline",
            search: "search-outline",
            library: "library-outline",
          };
          return <Ionicons name={map[route.name] ?? "ellipse-outline"} color={color} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Início" }} />
      <Tabs.Screen name="search" options={{ title: "Buscar" }} />
      <Tabs.Screen name="library" options={{ title: "Biblioteca" }} />
    </Tabs>
  );
}
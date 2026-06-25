import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { loadFolders, loadStats, type Folder } from "../../src/api";

export default function Home() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [stats, setStats] = useState({ folders: 0, tracks: 0, ready: 0, queued: 0 });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [folderData, statData] = await Promise.all([loadFolders(), loadStats()]);
        if (!active) return;
        setFolders(folderData);
        setStats(statData);
      } catch (err) {
        Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao carregar resumo");
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
          <Text style={s.greet}>Projeto Música</Text>
          <Text style={s.sub}>Busca YouTube, download MP3 e offline local</Text>
        </View>
        <Ionicons name="musical-notes-outline" size={26} color="#fff" />
      </View>

      <View style={s.statsGrid}>
        <View style={s.statCard}>
          <Text style={s.statValue}>{stats.folders}</Text>
          <Text style={s.statLabel}>Pastas</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>{stats.tracks}</Text>
          <Text style={s.statLabel}>Músicas</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>{stats.ready}</Text>
          <Text style={s.statLabel}>Prontas</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>{stats.queued}</Text>
          <Text style={s.statLabel}>Fila</Text>
        </View>
      </View>

      <Text style={s.section}>Pastas da família</Text>
      <View style={{ gap: 10 }}>
        {folders.map((folder) => (
          <Pressable key={folder.id} style={s.card} onPress={() => {}}>
            <Text style={s.title}>{folder.name}</Text>
            <Text style={s.meta}>{folder.trackCount} músicas cadastradas</Text>
          </Pressable>
        ))}
      </View>

      <Text style={s.section}>Atalho</Text>
      <Text style={s.hint}>Use a aba Buscar para procurar no YouTube e baixar em MP3 na VPS.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D12" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  greet: { color: "#fff", fontSize: 24, fontWeight: "600" },
  sub: { color: "rgba(255,255,255,0.55)", marginTop: 4 },
  section: { color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 18, marginBottom: 10 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "48%",
    backgroundColor: "#1A1A26",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 14,
  },
  statValue: { color: "#fff", fontSize: 24, fontWeight: "700" },
  statLabel: { color: "rgba(255,255,255,0.55)", marginTop: 4 },
  card: {
    backgroundColor: "#1A1A26",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 14,
  },
  title: { color: "#fff", fontSize: 15, fontWeight: "600" },
  meta: { color: "rgba(255,255,255,0.55)", marginTop: 4 },
  hint: { color: "rgba(255,255,255,0.55)", lineHeight: 20 },
});

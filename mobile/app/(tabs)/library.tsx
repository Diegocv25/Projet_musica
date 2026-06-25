import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { createFolder, loadFolders, loadTracks, type Folder, type TrackRecord } from "../../src/api";

export default function Library() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tracks, setTracks] = useState<TrackRecord[]>([]);
  const [newFolderName, setNewFolderName] = useState("");

  async function refresh() {
    const [folderData, trackData] = await Promise.all([loadFolders(), loadTracks()]);
    setFolders(folderData);
    setTracks(trackData);
  }

  useEffect(() => {
    void refresh().catch((err) => Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao carregar biblioteca"));
  }, []);

  async function onCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    try {
      await createFolder(name);
      setNewFolderName("");
      await refresh();
    } catch (err) {
      Alert.alert("Erro", err instanceof Error ? err.message : "Não foi possível criar a pasta");
    }
  }

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 20, paddingBottom: 180 }}>
      <Text style={s.h1}>Biblioteca</Text>
      <Text style={s.sub}>Pastas da família, músicas baixadas e downloads prontos.</Text>

      <View style={s.createRow}>
        <TextInput
          value={newFolderName}
          onChangeText={setNewFolderName}
          placeholder="Nova pasta"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={[s.input, { flex: 1, marginBottom: 0 }]}
        />
        <Pressable style={s.primaryBtn} onPress={onCreateFolder}>
          <Text style={s.primaryBtnText}>Criar</Text>
        </Pressable>
      </View>

      <Text style={s.section}>Pastas</Text>
      <View style={{ gap: 10 }}>
        {folders.map((folder) => (
          <Pressable key={folder.id} style={s.card} onPress={() => router.push({ pathname: "/downloads", params: { folderId: folder.id } } as never)}>
            <View style={s.cardTop}>
              <View style={s.iconCircle}>
                <Ionicons name="folder-outline" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{folder.name}</Text>
                <Text style={s.meta}>{folder.trackCount} músicas</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.55)" />
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={s.section}>Downloads recentes</Text>
      <View style={{ gap: 10 }}>
        {tracks.slice(0, 6).map((track) => (
          <Pressable key={track.id} style={s.card} onPress={() => router.push({ pathname: "/downloads", params: { folderId: track.folderId } } as never)}>
            <Text style={s.title}>{track.title}</Text>
            <Text style={s.meta}>{track.artist}</Text>
            <Text style={s.badge}>{track.status}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D12" },
  h1: { color: "#fff", fontSize: 24, fontWeight: "600" },
  sub: { color: "rgba(255,255,255,0.55)", marginTop: 4, marginBottom: 16 },
  section: { color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 18, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#1A1A26",
    color: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  createRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  primaryBtn: { backgroundColor: "#7C3AED", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  primaryBtnText: { color: "#fff", fontWeight: "600" },
  card: {
    backgroundColor: "#1A1A26",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 14,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#2E1E5C" },
  title: { color: "#fff", fontSize: 15, fontWeight: "600" },
  meta: { color: "rgba(255,255,255,0.55)", marginTop: 3 },
  badge: { color: "#C4B5FD", marginTop: 8, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
});

import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { loginUser, seedDefaultUser } from "../src/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  useEffect(() => {
    seedDefaultUser();
  }, []);

  async function onEntrar() {
    try {
      await loginUser(email, senha);
      router.replace("/(tabs)/home" as never);
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Falha no login.");
    }
  }

  return (
    <View style={s.page}>
      <Text style={s.h1}>Bem-vindo de volta</Text>
      <Text style={s.sub}>Entre para continuar ouvindo</Text>
      <TextInput placeholder="E-mail" placeholderTextColor="rgba(255,255,255,0.35)" style={s.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
      <View style={s.senhaWrap}>
        <TextInput placeholder="Senha" placeholderTextColor="rgba(255,255,255,0.35)" secureTextEntry={!mostrarSenha} style={[s.input, { flex: 1, marginBottom: 0 }]} value={senha} onChangeText={setSenha} />
        <Pressable onPress={() => setMostrarSenha((v) => !v)} style={s.olho}><Text style={s.olhoTxt}>{mostrarSenha ? "Ocultar" : "Mostrar"}</Text></Pressable>
      </View>
      <Pressable style={s.btn} onPress={onEntrar}><Text style={s.btnText}>Entrar</Text></Pressable>
      <Pressable onPress={() => router.push("/cadastro")}><Text style={s.link}>Criar cadastro</Text></Pressable>
      <Text style={s.hint}>Login geral inicial: familia@soundwave.app / 123456</Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D12", padding: 20, justifyContent: "center", gap: 12 },
  h1: { color: "#fff", fontSize: 30, fontWeight: "500" },
  sub: { color: "rgba(255,255,255,0.45)", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#1A1A26", color: "#fff", borderRadius: 12, padding: 14 },
  senhaWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  olho: { paddingHorizontal: 10, paddingVertical: 8 },
  olhoTxt: { color: "#A78BFA", fontSize: 12 },
  btn: { marginTop: 8, backgroundColor: "#7C3AED", borderRadius: 12, padding: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "500" },
  link: { color: "#A78BFA", textAlign: "center", marginTop: 6 },
  hint: { color: "rgba(255,255,255,0.35)", textAlign: "center", fontSize: 12, marginTop: 6 },
});

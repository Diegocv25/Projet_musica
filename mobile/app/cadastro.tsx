import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { registerUser } from "../src/auth";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function onCadastrar() {
    try {
      if (!nome.trim() || !email.trim() || !senha.trim()) {
        Alert.alert("Atenção", "Preencha nome, e-mail e senha.");
        return;
      }
      await registerUser(nome, email, senha);
      Alert.alert("Sucesso", "Cadastro criado.");
      router.replace("/(tabs)/home" as never);
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Falha ao cadastrar.");
    }
  }

  return (
    <View style={s.page}>
      <Text style={s.h1}>Criar cadastro</Text>
      <Text style={s.sub}>Cada familiar pode criar sua pasta e organizar suas músicas.</Text>
      <TextInput placeholder="Nome" placeholderTextColor="rgba(255,255,255,0.35)" style={s.input} value={nome} onChangeText={setNome} />
      <TextInput placeholder="E-mail" placeholderTextColor="rgba(255,255,255,0.35)" style={s.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
      <View style={s.senhaWrap}>
        <TextInput placeholder="Senha" placeholderTextColor="rgba(255,255,255,0.35)" secureTextEntry={!mostrarSenha} style={[s.input, { flex: 1, marginBottom: 0 }]} value={senha} onChangeText={setSenha} />
        <Pressable onPress={() => setMostrarSenha((v) => !v)} style={s.olho}><Text style={s.olhoTxt}>{mostrarSenha ? "Ocultar" : "Mostrar"}</Text></Pressable>
      </View>
      <Pressable style={s.btn} onPress={onCadastrar}><Text style={s.btnText}>Cadastrar</Text></Pressable>
      <Pressable onPress={() => router.replace("/login")}><Text style={s.link}>Já tenho login</Text></Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D12", padding: 20, justifyContent: "center", gap: 12 },
  h1: { color: "#fff", fontSize: 30, fontWeight: "500" },
  sub: { color: "rgba(255,255,255,0.45)", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#1A1A26", color: "#fff", borderRadius: 12, padding: 14, marginBottom: 12 },
  senhaWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  olho: { paddingHorizontal: 10, paddingVertical: 8 },
  olhoTxt: { color: "#A78BFA", fontSize: 12 },
  btn: { marginTop: 8, backgroundColor: "#7C3AED", borderRadius: 12, padding: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "500" },
  link: { color: "#A78BFA", textAlign: "center", marginTop: 6 },
});

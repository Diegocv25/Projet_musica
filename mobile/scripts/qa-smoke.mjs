import fs from "node:fs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function checkJamendo() {
  const clientId = process.env.JAMENDO_CLIENT_ID || process.env.EXPO_PUBLIC_JAMENDO_CLIENT_ID;
  assert(clientId, "JAMENDO_CLIENT_ID/EXPO_PUBLIC_JAMENDO_CLIENT_ID ausente");

  const url = new URL("https://api.jamendo.com/v3.0/tracks/");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "3");
  url.searchParams.set("search", "ambient");
  url.searchParams.set("audioformat", "mp32");

  const response = await fetch(url);
  assert(response.ok, `Jamendo HTTP ${response.status}`);
  const data = await response.json();
  assert(data?.headers?.status === "success", "Jamendo status != success");
  assert(Array.isArray(data?.results) && data.results.length > 0, "Jamendo sem resultados");

  const withAudio = data.results.find((r) => r.audio);
  assert(withAudio, "Jamendo retornou sem audio");

  const audioHead = await fetch(withAudio.audio, { method: "HEAD" });
  assert(audioHead.ok, `Audio URL inválida (${audioHead.status})`);
  console.log("[ok] Jamendo API + áudio respondendo");
}

function checkButtonsWired() {
  const checks = [
    ["app/(tabs)/home.tsx", ["router.push(\"/player\")", "router.push(\"/playlist\")"]],
    ["app/(tabs)/search.tsx", ["router.push(\"/player\")", "searchJamendoTracks"]],
    ["app/(tabs)/library.tsx", ["router.push(\"/playlist\")", "router.push(\"/downloads\")"]],
    ["app/player.tsx", ["toggle", "router.back()"]],
    ["src/mini-player.tsx", ["router.push(\"/player\")", "toggle"]],
  ];

  for (const [file, tokens] of checks) {
    const content = fs.readFileSync(file, "utf8");
    for (const token of tokens) {
      assert(content.includes(token), `${file} sem wiring esperado: ${token}`);
    }
  }
  console.log("[ok] Botões/ações principais conectados no código");
}

await checkJamendo();
checkButtonsWired();
console.log("QA_SMOKE_OK");

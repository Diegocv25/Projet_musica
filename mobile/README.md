# Projeto Música (React Native / Expo)

## Rodar no celular (Expo Go)

1. Entre na pasta:
```bash
cd /root/.openclaw/workspace/workspace_projetos/projetos/projeto_musica/mobile
```

2. Instale dependências (se necessário):
```bash
npm install
```

3. Suba o app com túnel:
```bash
npx expo start --tunnel
```

4. No celular, abra o **Expo Go** e escaneie o QR code do terminal.

---

## Fluxos implementados
- Cadastro de música (título, artista, gênero, status)
- Persistência local com AsyncStorage
- Listagem de músicas
- Filtro por status (`todos`, `rascunho`, `gravada`, `lancada`)

---

## Verificação técnica local
```bash
npx tsc --noEmit
```

---

## Troubleshooting rápido
- Se o túnel falhar, rode novamente `npx expo start --tunnel`.
- Se travar porta, use:
```bash
npx expo start --tunnel --port 8082
```
- Se o QR não abrir no Expo Go, tente trocar rede ou usar dados móveis.

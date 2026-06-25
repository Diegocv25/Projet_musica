# Projeto Música — Mobile

App Expo para buscar músicas no YouTube, pedir download em MP3 para a VPS, organizar por pastas da família e tocar offline no celular.

## Rodar
```bash
cd mobile
npm install
npm run start
```

## Configuração da API
Defina a URL do backend na VPS em:
- `app.json` → `expo.extra.apiBaseUrl`

Exemplo local:
- `http://127.0.0.1:8787`

## Fluxo de uso
- Aba **Buscar**: pesquisa no YouTube
- Botão **Baixar MP3**: enfileira o download na VPS
- Aba **Biblioteca**: pastas e downloads
- Aba **Downloads**: tocar e salvar offline no aparelho

## Dependências principais
- Expo Router
- AsyncStorage
- Expo File System
- React Native Track Player

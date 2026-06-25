# Projeto Música

Aplicativo mobile + backend local para buscar músicas no YouTube, enfileirar download em MP3 na VPS, organizar por pastas da família e tocar offline no aparelho.

## Estrutura
- `mobile/` — app Expo/React Native
- `backend/` — API Fastify + SQLite + yt-dlp

## O que o sistema faz
- Pesquisa no YouTube
- Mostra thumbnail como capa
- Salva a faixa em MP3 na VPS
- Guarda metadados e pastas no SQLite local
- Permite baixar para o celular e ouvir offline

## Como rodar o backend
```bash
cd backend
npm install
npm run build
npm run start
```

### Variáveis úteis do backend
- `PORT` — porta da API, padrão `8787`
- `MUSIC_APP_DATA_DIR` — diretório dos dados na VPS
- `CORS_ORIGIN` — origem permitida no CORS
- `YTDLP_COOKIES_FILE` — caminho de cookies do YouTube, se a VPS exigir autenticação extra
- `YTDLP_EXTRACTOR_ARGS` — args extras para o yt-dlp, se necessário

## Como rodar o app mobile
```bash
cd mobile
npm install
npm run start
```

Se o app estiver no celular físico, ajuste a URL da API em:
- `mobile/app.json` → `extra.apiBaseUrl`

## Observação importante
O fluxo de busca funciona. O download depende do YouTube liberar a extração na VPS; quando o ambiente pedir verificação, forneça `YTDLP_COOKIES_FILE` com cookies válidos do YouTube ou ajuste os `YTDLP_EXTRACTOR_ARGS`.

## Estado atual
- Backend Fastify funcionando com SQLite
- Busca no YouTube funcionando
- UI mobile adaptada para busca/download/pastas/offline

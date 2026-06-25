# Projeto Música — Backend

API local da VPS para buscar músicas no YouTube, enfileirar download de MP3, salvar metadados em SQLite e servir os arquivos baixados.

## Stack
- Fastify
- SQLite local (`better-sqlite3`)
- `yt-dlp`
- `ffmpeg`

## Rodar
```bash
cd backend
npm install
npm run build
npm run start
```

## Variáveis úteis
- `PORT` — porta da API, padrão `8787`
- `MUSIC_APP_DATA_DIR` — diretório dos dados
- `CORS_ORIGIN` — origem permitida no CORS
- `YTDLP_COOKIES_FILE` — caminho para cookies do YouTube, se necessário
- `YTDLP_EXTRACTOR_ARGS` — args extras do yt-dlp, se necessário

## Observação sobre credenciais
Se existir `~/credentials.env`, o backend carrega esse arquivo automaticamente antes de subir.
Isso permite guardar `YTDLP_COOKIES_FILE` e `YTDLP_EXTRACTOR_ARGS` fora do repositório.

## Rotas principais
- `GET /health`
- `GET /search?q=...`
- `POST /downloads`
- `GET /tracks`
- `GET /tracks/by-folder?folderId=...`
- `GET /folders`
- `POST /folders`
- `GET /stats`

## Observação
A capa inicial usa a thumbnail do YouTube. O MP3 fica armazenado na VPS e o app mobile pode baixar uma cópia para offline no aparelho.

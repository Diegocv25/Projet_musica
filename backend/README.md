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
- `YTDLP_CONFIG_FILE` — caminho para o arquivo externo com opções do yt-dlp

## Config externo do yt-dlp
Por padrão, o backend lê:

```text
~/.config/projeto-musica/ytdlp.env
```

Esse arquivo é separado de `~/credentials.env` e deve carregar apenas configurações do yt-dlp, como:

```bash
YTDLP_COOKIES_FILE=/caminho/para/cookies.txt
YTDLP_EXTRACTOR_ARGS=player_client=android
```

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

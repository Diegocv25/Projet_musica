import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { CORS_ORIGIN, MEDIA_DIR, PORT } from "./config.js";
import { getDb, isoNow, type FolderRow, type TrackRow } from "./db.js";
import { kickWorker, processQueue, trackToApi } from "./worker.js";
import { searchYouTube } from "./youtube.js";

const app = Fastify({ logger: true });
const db = getDb();

await app.register(cors, { origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(",").map((s) => s.trim()) });

function durationLabel(seconds: number | null) {
  if (!seconds && seconds !== 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

app.get("/health", async () => ({ ok: true }));

app.get("/folders", async () => {
  const folders = db.prepare("SELECT * FROM folders ORDER BY created_at ASC").all() as FolderRow[];
  return {
    folders: folders.map((folder) => {
      const count = db.prepare("SELECT COUNT(*) AS total FROM tracks WHERE folder_id = ?").get(folder.id) as { total: number };
      return { ...folder, trackCount: count.total };
    }),
  };
});

app.post<{ Body: { name?: string } }>("/folders", async (req, reply) => {
  const name = req.body.name?.trim();
  if (!name) return reply.code(400).send({ error: "Nome da pasta obrigatório" });

  const now = isoNow();
  const row = { id: randomUUID(), name, created_at: now };
  try {
    db.prepare("INSERT INTO folders (id, name, created_at) VALUES (?, ?, ?)").run(row.id, row.name, row.created_at);
  } catch (error) {
    return reply.code(409).send({ error: error instanceof Error ? error.message : "Não foi possível criar a pasta" });
  }

  return { folder: { ...row, trackCount: 0 } };
});

app.get<{ Querystring: { q?: string; limit?: string } }>("/search", async (req, reply) => {
  const q = req.query.q?.trim();
  if (!q) return reply.code(400).send({ error: "Informe o termo de busca" });
  const limit = Number(req.query.limit || 12);

  const results = await searchYouTube(q, Number.isFinite(limit) ? limit : 12);
  const ids = results.map((r) => r.youtubeId);
  const saved = ids.length
    ? db.prepare(`SELECT * FROM tracks WHERE youtube_id IN (${ids.map(() => "?").join(",")})`).all(...ids) as TrackRow[]
    : [];
  const savedById = new Map(saved.map((row) => [row.youtube_id, row]));

  return {
    results: results.map((result) => {
      const track = savedById.get(result.youtubeId);
      return {
        ...result,
        durationLabel: durationLabel(result.duration),
        saved: Boolean(track),
        status: track?.status ?? null,
        fileUrl: track?.mp3_path ? `/media/${track.folder_id}/${encodeURIComponent(track.youtube_id)}.mp3` : null,
        folderId: track?.folder_id ?? null,
      };
    }),
  };
});

app.post<{ Body: { youtubeId?: string; title?: string; artist?: string; thumbnailUrl?: string; sourceUrl?: string; duration?: number | null; folderId?: string } }>("/downloads", async (req, reply) => {
  const body = req.body;
  const youtubeId = body.youtubeId?.trim();
  const title = body.title?.trim();
  const artist = body.artist?.trim();
  const thumbnailUrl = body.thumbnailUrl?.trim();
  const sourceUrl = body.sourceUrl?.trim();
  const defaultFolder = db.prepare("SELECT id FROM folders ORDER BY created_at ASC LIMIT 1").get() as { id: string };
  const folderIdValue = body.folderId?.trim() || defaultFolder.id;

  if (!youtubeId || !title || !artist || !thumbnailUrl || !sourceUrl) {
    return reply.code(400).send({ error: "Dados insuficientes para download" });
  }

  const folderExists = db.prepare("SELECT id FROM folders WHERE id = ?").get(folderIdValue);
  if (!folderExists) return reply.code(404).send({ error: "Pasta não encontrada" });

  const now = isoNow();
  const existing = db.prepare("SELECT * FROM tracks WHERE folder_id = ? AND youtube_id = ?").get(folderIdValue, youtubeId) as TrackRow | undefined;
  if (existing) {
    if (existing.status === "ready") return { track: trackToApi(existing) };
    return { track: trackToApi(existing), queued: true };
  }

  const row: TrackRow = {
    id: randomUUID(),
    folder_id: folderIdValue,
    youtube_id: youtubeId,
    title,
    artist,
    thumbnail_url: thumbnailUrl,
    source_url: sourceUrl,
    duration: body.duration ?? null,
    status: "queued",
    mp3_path: null,
    file_size: null,
    error_message: null,
    created_at: now,
    updated_at: now,
  };

  db.prepare(`
    INSERT INTO tracks (
      id, folder_id, youtube_id, title, artist, thumbnail_url, source_url,
      duration, status, mp3_path, file_size, error_message, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    row.id,
    row.folder_id,
    row.youtube_id,
    row.title,
    row.artist,
    row.thumbnail_url,
    row.source_url,
    row.duration,
    row.status,
    row.mp3_path,
    row.file_size,
    row.error_message,
    row.created_at,
    row.updated_at,
  );

  kickWorker();
  const saved = db.prepare("SELECT * FROM tracks WHERE id = ?").get(row.id) as TrackRow;
  return reply.code(201).send({ track: trackToApi(saved), message: "Download enfileirado" });
});

app.get("/tracks", async (req) => {
  const rows = db.prepare("SELECT * FROM tracks ORDER BY updated_at DESC").all() as TrackRow[];
  return { tracks: rows.map(trackToApi) };
});

app.get<{ Querystring: { folderId?: string } }>("/tracks/by-folder", async (req) => {
  const folderId = req.query.folderId?.trim();
  const rows = folderId
    ? db.prepare("SELECT * FROM tracks WHERE folder_id = ? ORDER BY updated_at DESC").all(folderId) as TrackRow[]
    : db.prepare("SELECT * FROM tracks ORDER BY updated_at DESC").all() as TrackRow[];
  return { tracks: rows.map(trackToApi) };
});

app.get<{ Params: { id: string } }>("/tracks/:id", async (req, reply) => {
  const row = db.prepare("SELECT * FROM tracks WHERE id = ?").get(req.params.id) as TrackRow | undefined;
  if (!row) return reply.code(404).send({ error: "Faixa não encontrada" });
  return { track: trackToApi(row) };
});

app.get<{ Params: { folderId: string; file: string } }>("/media/:folderId/:file", async (req, reply) => {
  const filePath = path.resolve(MEDIA_DIR, req.params.folderId, req.params.file);
  if (!filePath.startsWith(path.resolve(MEDIA_DIR))) return reply.code(400).send({ error: "Caminho inválido" });
  if (!fs.existsSync(filePath)) return reply.code(404).send({ error: "Arquivo não encontrado" });
  reply.header("Content-Type", "audio/mpeg");
  reply.header("Cache-Control", "public, max-age=3600");
  return reply.send(fs.createReadStream(filePath));
});

app.get<{ Params: { id: string } }>("/media/track/:id", async (req, reply) => {
  const row = db.prepare("SELECT * FROM tracks WHERE id = ?").get(req.params.id) as TrackRow | undefined;
  if (!row?.mp3_path) return reply.code(404).send({ error: "Arquivo não disponível" });
  if (!fs.existsSync(row.mp3_path)) return reply.code(404).send({ error: "Arquivo não encontrado" });
  reply.header("Content-Type", "audio/mpeg");
  return reply.send(fs.createReadStream(row.mp3_path));
});

app.get("/stats", async () => {
  const folders = db.prepare("SELECT COUNT(*) AS total FROM folders").get() as { total: number };
  const tracks = db.prepare("SELECT COUNT(*) AS total FROM tracks").get() as { total: number };
  const ready = db.prepare("SELECT COUNT(*) AS total FROM tracks WHERE status = 'ready'").get() as { total: number };
  const queued = db.prepare("SELECT COUNT(*) AS total FROM tracks WHERE status IN ('queued', 'downloading')").get() as { total: number };
  return { folders: folders.total, tracks: tracks.total, ready: ready.total, queued: queued.total };
});

await app.listen({ port: PORT, host: "0.0.0.0" });
await processQueue();

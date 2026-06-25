import fs from "node:fs";
import path from "node:path";
import { getDb, isoNow, rowToTrack, type TrackRow } from "./db.js";
import { downloadAsMp3 } from "./youtube.js";
import { MEDIA_DIR } from "./config.js";

let running = false;

function folderDir(folderId: string) {
  return path.join(MEDIA_DIR, folderId);
}

function mp3Path(folderId: string, youtubeId: string) {
  return path.join(folderDir(folderId), `${youtubeId}.mp3`);
}

function normalizeDownloadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/Sign in to confirm/i.test(message) || /not a bot/i.test(message)) {
    return "YouTube bloqueou o download sem cookies válidos";
  }
  if (/Requested format is not available/i.test(message)) {
    return "O YouTube não disponibilizou um formato baixável para esse vídeo";
  }
  return message || "Falha ao baixar";
}

export async function processQueue() {
  if (running) return;
  running = true;
  const db = getDb();

  try {
    while (true) {
      const next = db.prepare(`
        SELECT * FROM tracks
        WHERE status = 'queued'
        ORDER BY created_at ASC
        LIMIT 1
      `).get() as TrackRow | undefined;

      if (!next) break;

      const targetDir = folderDir(next.folder_id);
      fs.mkdirSync(targetDir, { recursive: true });

      db.prepare("UPDATE tracks SET status = ?, error_message = ?, updated_at = ? WHERE id = ?").run(
        "downloading",
        null,
        isoNow(),
        next.id,
      );

      const outputTemplate = path.join(targetDir, `${next.youtube_id}.%(ext)s`);

      try {
        await downloadAsMp3(next.source_url, outputTemplate);
        const finalPath = mp3Path(next.folder_id, next.youtube_id);
        const stat = fs.statSync(finalPath);
        db.prepare("UPDATE tracks SET status = ?, mp3_path = ?, file_size = ?, updated_at = ? WHERE id = ?").run(
          "ready",
          finalPath,
          stat.size,
          isoNow(),
          next.id,
        );
      } catch (error) {
        db.prepare("UPDATE tracks SET status = ?, error_message = ?, updated_at = ? WHERE id = ?").run(
          "error",
          normalizeDownloadError(error),
          isoNow(),
          next.id,
        );
      }
    }
  } finally {
    running = false;
  }
}

export function kickWorker() {
  void processQueue();
}

export function trackToApi(row: TrackRow) {
  const track = rowToTrack(row);
  return {
    id: row.id,
    folderId: row.folder_id,
    youtubeId: row.youtube_id,
    title: row.title,
    artist: row.artist,
    thumbnailUrl: row.thumbnail_url,
    sourceUrl: row.source_url,
    duration: row.duration,
    status: row.status,
    fileSize: row.file_size,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fileUrl: track.file_url,
  };
}

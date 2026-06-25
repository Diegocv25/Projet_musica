import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { DB_PATH, DEFAULT_FOLDER_NAME, ensureDataDirs } from "./config.js";

export type FolderRow = {
  id: string;
  name: string;
  created_at: string;
};

export type TrackRow = {
  id: string;
  folder_id: string;
  youtube_id: string;
  title: string;
  artist: string;
  thumbnail_url: string;
  source_url: string;
  duration: number | null;
  status: "queued" | "downloading" | "ready" | "error";
  mp3_path: string | null;
  file_size: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

type DbInstance = InstanceType<typeof Database>;

let dbInstance: DbInstance | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;
  ensureDataDirs();
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL,
      youtube_id TEXT NOT NULL,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      source_url TEXT NOT NULL,
      duration INTEGER,
      status TEXT NOT NULL,
      mp3_path TEXT,
      file_size INTEGER,
      error_message TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(folder_id, youtube_id),
      FOREIGN KEY(folder_id) REFERENCES folders(id) ON DELETE CASCADE
    );
  `);

  const folderCount = db.prepare("SELECT COUNT(*) AS total FROM folders").get() as { total: number };
  if (folderCount.total === 0) {
    const now = new Date().toISOString();
    db.prepare("INSERT INTO folders (id, name, created_at) VALUES (?, ?, ?)").run(
      randomUUID(),
      DEFAULT_FOLDER_NAME,
      now,
    );
  }

  dbInstance = db;
  return db;
}

export function isoNow() {
  return new Date().toISOString();
}

export function rowToTrack(row: TrackRow) {
  return {
    ...row,
    file_url: row.mp3_path ? `/media/${row.folder_id}/${encodeURIComponent(row.youtube_id)}.mp3` : null,
  };
}

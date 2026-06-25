import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
export const DATA_DIR = path.resolve(process.env.MUSIC_APP_DATA_DIR || path.join(ROOT, "data"));
export const DB_PATH = path.join(DATA_DIR, "projeto-musica.sqlite");
export const MEDIA_DIR = path.join(DATA_DIR, "media");
export const TMP_DIR = path.join(DATA_DIR, "tmp");
export const DEFAULT_FOLDER_NAME = "Família";
export const PORT = Number(process.env.PORT || 8787);
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

export function ensureDataDirs() {
  for (const dir of [DATA_DIR, MEDIA_DIR, TMP_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

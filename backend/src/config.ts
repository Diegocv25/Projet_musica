import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function loadEnvFileIfPresent(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const normalized = line.startsWith("export ") ? line.slice(7).trim() : line;
    const eqIndex = normalized.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = normalized.slice(0, eqIndex).trim();
    if (!key || process.env[key]) continue;
    let value = normalized.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFileIfPresent(path.join(os.homedir(), "credentials.env"));

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

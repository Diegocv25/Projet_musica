import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type YouTubeResult = {
  youtubeId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration: number | null;
  sourceUrl: string;
};

function toSourceUrl(id: string, webpageUrl?: string) {
  if (webpageUrl) return webpageUrl;
  return `https://www.youtube.com/watch?v=${id}`;
}

function normalizeTitle(title: string) {
  return title.replace(/\s*\(Official.*$/i, "").trim();
}

export async function searchYouTube(query: string, limit = 12): Promise<YouTubeResult[]> {
  const { stdout } = await execFileAsync(
    "yt-dlp",
    [
      `ytsearch${limit}:${query}`,
      "--flat-playlist",
      "--dump-single-json",
      "--no-warnings",
      "--skip-download",
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  );

  const payload = JSON.parse(stdout) as {
    entries?: Array<{
      id?: string;
      title?: string;
      thumbnail?: string;
      duration?: number;
      webpage_url?: string;
      uploader?: string;
      channel?: string;
    }>;
  };

  return (payload.entries || [])
    .filter((entry): entry is NonNullable<typeof entry> & { id: string; title: string } => Boolean(entry?.id && entry?.title))
    .map((entry) => ({
      youtubeId: entry.id,
      title: normalizeTitle(entry.title),
      artist: entry.channel || entry.uploader || "YouTube",
      thumbnailUrl:
        entry.thumbnail || `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`,
      duration: typeof entry.duration === "number" ? entry.duration : null,
      sourceUrl: toSourceUrl(entry.id, entry.webpage_url),
    }));
}

export async function downloadAsMp3(sourceUrl: string, outputTemplate: string) {
  const args = [
    sourceUrl,
    "-f",
    "bestaudio/best",
    "-x",
    "--audio-format",
    "mp3",
    "--audio-quality",
    "0",
    "--no-playlist",
    "--no-warnings",
    "-o",
    outputTemplate,
  ];

  const cookiesFile = process.env.YTDLP_COOKIES_FILE?.trim();
  if (cookiesFile && existsSync(cookiesFile)) {
    args.splice(1, 0, "--cookies", cookiesFile);
  }

  const extraExtractorArgs = process.env.YTDLP_EXTRACTOR_ARGS?.trim();
  if (extraExtractorArgs) {
    args.splice(1, 0, "--extractor-args", extraExtractorArgs);
  }

  await execFileAsync("yt-dlp", args, { maxBuffer: 10 * 1024 * 1024 });
}

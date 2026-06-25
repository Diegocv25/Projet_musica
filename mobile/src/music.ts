export type Track = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string;
  audioUrl: string;
};

export const tracks: Track[] = [
  {
    id: "1",
    title: "Midnight Echo",
    artist: "Lune",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop",
    duration: "3:42",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "2",
    title: "Velvet Room",
    artist: "Noir Set",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop",
    duration: "4:18",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "3",
    title: "Blue Static",
    artist: "Aria",
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800&auto=format&fit=crop",
    duration: "2:58",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "4",
    title: "Neon Drip",
    artist: "Obsidian",
    cover: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?q=80&w=800&auto=format&fit=crop",
    duration: "3:15",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
];

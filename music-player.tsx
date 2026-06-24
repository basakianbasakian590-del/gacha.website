import { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, X, Volume2 } from "lucide-react";
import { useGetSettings } from "@workspace/api-client-react";

const FALLBACK_URLS = [
  "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
  "https://assets.mixkit.co/music/preview/mixkit-game-show-suspense-waiting-667.mp3",
  "https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3",
];

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(30);
  const [error, setError] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { data: settings } = useGetSettings();

  const getUrl = () => {
    if (settings?.musicUrl) return settings.musicUrl;
    return FALLBACK_URLS[urlIndex % FALLBACK_URLS.length];
  };

  useEffect(() => {
    const url = getUrl();
    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume / 100;
    audio.preload = "none";
    audio.crossOrigin = "anonymous";

    audio.onerror = () => {
      setError(true);
      setIsPlaying(false);
    };

    audio.oncanplay = () => setError(false);

    audio.src = url;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [settings?.musicUrl, urlIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    setError(false);
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch {
      setError(true);
      setIsPlaying(false);
      setUrlIndex(i => i + 1);
    }
  };

  const bars = [1, 2, 3, 4];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {expanded ? (
        <div className="bg-black/90 border border-primary/40 rounded-2xl p-3 backdrop-blur-xl shadow-xl shadow-primary/10 w-48">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5">
                {isPlaying ? (
                  <div className="flex gap-0.5 items-end h-5">
                    {bars.map((b) => (
                      <div
                        key={b}
                        className="w-1 bg-primary rounded-sm"
                        style={{
                          animation: `equalize ${0.4 + b * 0.1}s ease-in-out infinite alternate`,
                          height: `${40 + b * 15}%`,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Music className="w-4 h-4 text-primary" />
                )}
              </div>
              <span className="text-xs font-mono text-primary font-bold">MUSIC</span>
            </div>
            <button onClick={() => setExpanded(false)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-center mb-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary/20 border border-primary hover:bg-primary/40 flex items-center justify-center transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4 text-primary ml-0.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-3 h-3 text-white/40 shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full h-1 accent-primary cursor-pointer"
            />
            <span className="text-xs font-mono text-white/40 w-6 shrink-0">{volume}</span>
          </div>

          {error && (
            <p className="text-destructive text-[10px] font-mono text-center mt-2">
              Gagal memuat audio
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="w-9 h-9 rounded-full bg-black/80 border border-primary/40 flex items-center justify-center hover:border-primary transition-all backdrop-blur-md"
          title="Music Player"
        >
          {isPlaying ? (
            <div className="flex gap-0.5 items-end h-4">
              {[1,2,3].map(b => (
                <div key={b} className="w-0.5 bg-primary rounded-sm animate-pulse" style={{ height: `${30 + b * 20}%` }} />
              ))}
            </div>
          ) : (
            <Music className="w-4 h-4 text-primary/70" />
          )}
        </button>
      )}

      <style>{`
        @keyframes equalize {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

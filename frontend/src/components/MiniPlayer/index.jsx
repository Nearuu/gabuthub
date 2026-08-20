import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2, VolumeX, X, Music, RotateCcw, RotateCw } from "lucide-react";
import useOstPlayerStore from "../../store/ostPlayerStore";

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    stop,
    setVolume,
    seek,
  } = useOstPlayerStore();

  const [ytCurrentTime, setYtCurrentTime] = useState(0);
  const [ytDuration, setYtDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const ytPlayerRef = useRef(null);

  // Helper untuk mengekstrak ID YouTube dari berbagai macam format URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const youtubeId = currentTrack ? getYouTubeId(currentTrack.preview_url) : null;

  // Reset state saat berganti lagu
  useEffect(() => {
    setYtCurrentTime(0);
    setYtDuration(0);
    ytPlayerRef.current = null;
  }, [currentTrack?.id]);

  // Load YouTube API Iframe Script jika lagu adalah YouTube
  useEffect(() => {
    if (!youtubeId) return;

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const interval = setInterval(() => {
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        setYtCurrentTime(ytPlayerRef.current.getCurrentTime() || 0);
        setYtDuration(ytPlayerRef.current.getDuration() || 0);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [youtubeId, currentTrack?.id]);

  // Sinkronkan perintah play/pause dengan YouTube player secara reaktif
  useEffect(() => {
    if (youtubeId && ytPlayerRef.current) {
      try {
        if (isPlaying && ytPlayerRef.current.playVideo) {
          ytPlayerRef.current.playVideo();
        } else if (!isPlaying && ytPlayerRef.current.pauseVideo) {
          ytPlayerRef.current.pauseVideo();
        }
      } catch (err) {
        console.warn("YouTube play/pause sync error:", err);
      }
    }
  }, [isPlaying, youtubeId]);

  if (!currentTrack) return null;

  const displayCurrentTime = youtubeId ? ytCurrentTime : currentTime;
  const displayDuration = youtubeId ? ytDuration : duration;

  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (targetSec) => {
    if (youtubeId && ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      ytPlayerRef.current.seekTo(targetSec, true);
      setYtCurrentTime(targetSec);
    } else {
      seek(targetSec);
    }
  };

  const handleTogglePlay = () => {
    if (youtubeId && ytPlayerRef.current) {
      if (isPlaying) {
        if (ytPlayerRef.current.pauseVideo) ytPlayerRef.current.pauseVideo();
      } else {
        if (ytPlayerRef.current.playVideo) ytPlayerRef.current.playVideo();
      }
    }
    togglePlay();
  };

  const handleSkip = (seconds) => {
    const activeTime = youtubeId ? ytCurrentTime : currentTime;
    const target = Math.max(0, (activeTime || 0) + seconds);
    handleSeek(target);
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(0.5);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-4xl -translate-x-1/2 px-4 md:px-0">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-6 rounded-2xl border border-wm-border bg-wm-card/95 p-3.5 sm:px-5 shadow-lg backdrop-blur-2xl transition-colors duration-300">
        
        {/* KIRI: Track Info (Poster + Judul + Artist) */}
        <div className="flex items-center gap-3 overflow-hidden w-full md:w-1/4">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-wm-accent/10 text-wm-accent flex-shrink-0 border border-wm-border overflow-hidden">
            {currentTrack.contentPoster ? (
              <img src={currentTrack.contentPoster} alt="" className="h-full w-full object-cover" />
            ) : (
              <Music className={isPlaying ? "animate-pulse text-wm-accent" : ""} size={20} />
            )}
          </div>
          <div className="overflow-hidden space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-xs font-black text-wm-texth">{currentTrack.title}</p>
              {youtubeId && (
                <span className="rounded-full bg-wm-accent/15 border border-wm-accent/30 px-2 py-0.2 text-[9px] font-bold text-wm-accent flex-shrink-0 tracking-wider">
                  LIVE
                </span>
              )}
            </div>
            <p className="truncate text-2xs text-wm-accent font-bold">{currentTrack.artist}</p>
          </div>
        </div>

        {/* TENGAH: Controls (Rewind + Play/Pause + Skip) & Progress Bar */}
        <div className="flex flex-1 flex-col items-center gap-2 w-full max-w-md">
          {/* Tombol Play/Pause & Skip */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSkip(-10)}
              className="p-1.5 rounded-full text-wm-text/60 hover:text-wm-texth hover:bg-wm-bg transition cursor-pointer"
              title="Mundurkan 10 detik"
            >
              <RotateCcw size={15} />
            </button>

            <button
              onClick={handleTogglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-wm-accent text-black transition hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-wm-accent/25 font-black"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="p-1.5 rounded-full text-wm-text/60 hover:text-wm-texth hover:bg-wm-bg transition cursor-pointer"
              title="Majukan 10 detik"
            >
              <RotateCw size={15} />
            </button>
          </div>

          {/* Interactive Range Seekbar Slider */}
          <div className="flex w-full items-center gap-2.5">
            <span className="text-[10px] font-mono font-bold text-wm-text/60 min-w-[34px] text-right">{formatTime(displayCurrentTime)}</span>
            <input
              type="range"
              min="0"
              max={displayDuration || 100}
              step="0.1"
              value={displayCurrentTime || 0}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-wm-bg border border-wm-border/50 accent-wm-accent"
            />
            <span className="text-[10px] font-mono font-bold text-wm-text/60 min-w-[34px]">{formatTime(displayDuration)}</span>
          </div>

          {/* Background YouTube Audio Stream Container (Re-created cleanly per track via key) */}
          {youtubeId && (
            <div key={currentTrack.id} className="w-0 h-0 overflow-hidden opacity-0 pointer-events-none absolute">
              <iframe
                id={`yt-player-iframe-${currentTrack.id}`}
                width="1"
                height="1"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`}
                title={currentTrack.title}
                allow="autoplay; encrypted-media"
                onLoad={() => {
                  if (window.YT && window.YT.Player) {
                    ytPlayerRef.current = new window.YT.Player(`yt-player-iframe-${currentTrack.id}`);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* KANAN: Volume Control & Close Button */}
        <div className="flex items-center justify-end gap-3 w-full md:w-1/4">
          <div className="hidden sm:flex items-center gap-2 text-wm-text/60">
            <button onClick={handleMuteToggle} className="hover:text-wm-texth cursor-pointer transition">
              {isMuted || volume === 0 ? <VolumeX size={16} className="text-wm-coral" /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(parseFloat(e.target.value) === 0);
              }}
              className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-wm-bg accent-wm-accent"
            />
          </div>

          <button
            onClick={stop}
            className="rounded-full p-2 bg-wm-bg border border-wm-border/60 text-wm-text/60 hover:text-wm-texth hover:bg-wm-card transition cursor-pointer"
            title="Tutup Audio Player"
          >
            <X size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}

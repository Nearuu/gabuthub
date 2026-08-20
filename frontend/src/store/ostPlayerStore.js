import { create } from "zustand";

const useOstPlayerStore = create((set, get) => {
  let audioInstance = null;

  return {
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    currentTime: 0,
    volume: 0.5,

    playTrack: (track) => {
      const { currentTrack, isPlaying } = get();

      // Jika mengeklik lagu yang sama, toggle play/pause
      if (currentTrack && currentTrack.id === track.id) {
        get().togglePlay();
        return;
      }

      // Jika ganti lagu lain, bersihkan audio instance lama
      if (audioInstance) {
        audioInstance.pause();
        audioInstance.src = "";
        audioInstance = null;
      }

      // Reset state untuk track baru
      set({
        currentTrack: track,
        isPlaying: true,
        progress: 0,
        currentTime: 0,
        duration: 0,
      });

      if (track.preview_url && !track.preview_url.includes("youtu")) {
        audioInstance = new Audio(track.preview_url);
        audioInstance.volume = get().volume;

        audioInstance.addEventListener("play", () => set({ isPlaying: true }));
        audioInstance.addEventListener("pause", () => set({ isPlaying: false }));
        audioInstance.addEventListener("timeupdate", () => {
          if (audioInstance && audioInstance.duration) {
            set({
              currentTime: audioInstance.currentTime,
              duration: audioInstance.duration,
              progress: (audioInstance.currentTime / audioInstance.duration) * 100,
            });
          }
        });
        audioInstance.addEventListener("ended", () => set({ isPlaying: false }));

        audioInstance.play().catch(() => {});
      }
    },

    togglePlay: () => {
      const { isPlaying } = get();
      if (audioInstance) {
        if (isPlaying) {
          audioInstance.pause();
          set({ isPlaying: false });
        } else {
          audioInstance.play().catch(() => {});
          set({ isPlaying: true });
        }
      } else {
        set({ isPlaying: !isPlaying });
      }
    },

    stop: () => {
      if (audioInstance) {
        audioInstance.pause();
        audioInstance = null;
      }
      set({ currentTrack: null, isPlaying: false, progress: 0, currentTime: 0 });
    },

    setVolume: (vol) => {
      if (audioInstance) {
        audioInstance.volume = vol;
      }
      set({ volume: vol });
    },

    seek: (targetTime) => {
      if (!audioInstance) return;
      audioInstance.currentTime = targetTime;
      const dur = audioInstance.duration || 1;
      set({
        currentTime: targetTime,
        progress: (targetTime / dur) * 100,
      });
    },
  };
});

export default useOstPlayerStore;

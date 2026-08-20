import { useState, useEffect, useRef } from "react";
import { Gamepad2, Flame, Flag, Sparkles, ThumbsUp, ThumbsDown, RefreshCw, CheckCircle2, Dices, AlertTriangle, Check, Music, Play, Pause, Volume2, Award, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import toast from "react-hot-toast";

export default function Game() {
  const [activeTab, setActiveTab] = useState("guess_ost"); // 'guess_ost' | 'hottakes' | 'redflag' | 'wheel'

  // Guess OST Game States
  const [ostQuestions, setOstQuestions] = useState([]);
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(15);
  const [ostIndex, setOstIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameFinished, setGameFinished] = useState(false);
  const [loadingGame, setLoadingGame] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const timerRef = useRef(null);
  const iframeRef = useRef(null);

  // Hot Takes State
  const [hotTakes, setHotTakes] = useState([]);
  const [takeIndex, setTakeIndex] = useState(0);
  const [userVotes, setUserVotes] = useState({});

  // Red Flag Characters State
  const [characters, setCharacters] = useState([]);
  const [charIndex, setCharIndex] = useState(0);
  const [charVotes, setCharVotes] = useState({});

  // Random Picker State
  const [allContents, setAllContents] = useState([]);
  const [selectedPick, setSelectedPick] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    loadGamesData();
    loadGuessOstGame();
  }, []);

  const loadGuessOstGame = async () => {
    setLoadingGame(true);
    try {
      const res = await API.get("/games/guess-ost");
      const q = res.data.questions || [];
      const secs = res.data.seconds_per_question || 15;
      setOstQuestions(q);
      setSecondsPerQuestion(secs);
      setTimeLeft(secs);
      setOstIndex(0);
      setScore(0);
      setSelectedOptionId(null);
      setIsPlayingAudio(false);
      setGameFinished(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGame(false);
    }
  };

  // Timer Countdown Effect (Runs ONLY when audio is playing and option not selected)
  useEffect(() => {
    if (activeTab !== "guess_ost" || gameFinished || loadingGame || ostQuestions.length === 0) return;
    if (!isPlayingAudio || selectedOptionId !== null) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [activeTab, ostIndex, isPlayingAudio, selectedOptionId, gameFinished, loadingGame, ostQuestions]);

  const handleTimeOut = () => {
    setSelectedOptionId(-1);
    setIsPlayingAudio(false);
    setTimeout(() => {
      nextOstQuestion();
    }, 2000);
  };

  const handleSelectOption = (option) => {
    if (selectedOptionId !== null) return;
    setSelectedOptionId(option.id);
    setIsPlayingAudio(false);

    if (option.is_correct) {
      setScore((prev) => prev + 1);
      toast.success("Jawaban Tepat!");
    } else {
      toast.error("Jawaban Kurang Tepat!");
    }

    setTimeout(() => {
      nextOstQuestion();
    }, 2000);
  };

  const nextOstQuestion = () => {
    if (ostIndex + 1 < ostQuestions.length) {
      setOstIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsPlayingAudio(false);
      setTimeLeft(secondsPerQuestion);
    } else {
      setGameFinished(true);
      setIsPlayingAudio(false);
    }
  };

  const loadGamesData = async () => {
    try {
      const [takesRes, charsRes, contentsRes] = await Promise.all([
        API.get("/hot-takes"),
        API.get("/flag-characters"),
        API.get("/contents"),
      ]);
      setHotTakes(Array.isArray(takesRes.data) ? takesRes.data : []);
      setCharacters(Array.isArray(charsRes.data) ? charsRes.data : []);
      setAllContents(Array.isArray(contentsRes.data) ? contentsRes.data : []);
    } catch (e) {
      console.error(e);
      // Fallback Mock Data jika backend endpoint belum berisi
      setHotTakes([
        { id: 1, question: "Reply 1988 adalah drakor slice of life terbaik yang tak tertandingi sejauh ini?", category: "Drakor" },
        { id: 2, question: "Ending film Interstellar jauh lebih membingungkan dibanding Inception?", category: "Movie" },
        { id: 3, question: "Anime Attack on Titan layak mendapat ending alternatif?", category: "Anime" },
      ]);
      setCharacters([
        { id: 1, name: "Park Yeon-jin", show: "The Glory", role: "Antagonis Utama", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Yeonjin" },
        { id: 2, name: "Sun-jae", show: "Lovely Runner", role: "Protagonis Utama", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sunjae" },
        { id: 3, name: "Cho Sang-woo", show: "Squid Game", role: "Pemain 218", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sangwoo" },
      ]);
    }
  };

  const handleVoteTake = (id, voteType) => {
    setUserVotes((prev) => ({ ...prev, [id]: voteType }));
    toast.success(`Pilihan tersimpan: ${voteType === 'agree' ? 'Setuju' : 'Tidak Setuju'}`);
  };

  const handleVoteChar = (id, flagType) => {
    setCharVotes((prev) => ({ ...prev, [id]: flagType }));
    toast.success(`Karakter dinilai: ${flagType === 'red' ? 'Red Flag' : 'Green Flag'}`);
  };

  const spinRandomPicker = () => {
    if (allContents.length === 0) return;
    setIsSpinning(true);
    setSelectedPick(null);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * allContents.length);
      setSelectedPick(allContents[randomIndex]);
      setIsSpinning(false);
    }, 1500);
  };

  const currentTake = hotTakes[takeIndex];
  const currentChar = characters[charIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-wm-text">
      
      {/* Header Banner */}
      <div className="rounded-3xl border border-wm-border bg-gradient-to-r from-wm-card via-wm-card/80 to-wm-bg p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-wm-accent/30 bg-wm-accent/10 px-3 py-1 text-2xs font-black text-wm-accent uppercase">
            <Gamepad2 size={14} /> Mini Games Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-wm-texth">GabutHub Mini Games & Prompts</h1>
          <p className="text-xs sm:text-sm text-wm-text/70 max-w-xl">
            Adu opini tentang drakor/anime, tentukan karakter Red Flag vs Green Flag, atau gunakan fitur acak untuk tontonan hari ini.
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-wm-border/60 gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab("guess_ost")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition cursor-pointer ${
            activeTab === "guess_ost"
              ? "border-wm-accent text-wm-accent font-black"
              : "border-transparent text-wm-text/60 hover:text-wm-texth"
          }`}
        >
          <Music size={16} /> Tebak Lagu OST
        </button>

        <button
          onClick={() => setActiveTab("hottakes")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition cursor-pointer ${
            activeTab === "hottakes"
              ? "border-wm-accent text-wm-accent font-black"
              : "border-transparent text-wm-text/60 hover:text-wm-texth"
          }`}
        >
          <Flame size={16} /> Hot Takes ({hotTakes.length})
        </button>

        <button
          onClick={() => setActiveTab("redflag")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition cursor-pointer ${
            activeTab === "redflag"
              ? "border-wm-accent text-wm-accent font-black"
              : "border-transparent text-wm-text/60 hover:text-wm-texth"
          }`}
        >
          <Flag size={16} /> Red/Green Flag ({characters.length})
        </button>

        <button
          onClick={() => setActiveTab("wheel")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 transition cursor-pointer ${
            activeTab === "wheel"
              ? "border-wm-accent text-wm-accent font-black"
              : "border-transparent text-wm-text/60 hover:text-wm-texth"
          }`}
        >
          <Dices size={16} /> Random Picker
        </button>
      </div>

      {/* TAB 0: TEBAK LAGU OST */}
      {activeTab === "guess_ost" && (
        <div className="space-y-6">
          {loadingGame ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-wm-border bg-wm-card">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-wm-accent border-t-transparent" />
            </div>
          ) : gameFinished ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-3xl border border-wm-border bg-wm-card p-8 sm:p-10 space-y-6 shadow-xl text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-wm-accent/15 text-wm-accent">
                <Award size={36} />
              </div>

              <div className="space-y-2">
                <span className="rounded-full bg-wm-accent/10 border border-wm-accent/20 px-3 py-1 text-xs font-black text-wm-accent uppercase">
                  Permainan Selesai
                </span>
                <h2 className="text-3xl font-black text-wm-texth">Hasil Skor Tebak Lagu</h2>
                <p className="text-sm text-wm-text/70">
                  Kamu berhasil menebak <span className="font-black text-wm-accent">{score}</span> dari total <span className="font-black text-wm-texth">{ostQuestions.length}</span> soal!
                </p>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={loadGuessOstGame}
                  className="flex items-center gap-2 rounded-2xl bg-wm-accent hover:bg-wm-accent-hover px-6 py-3.5 text-xs font-black text-black transition shadow-lg shadow-wm-accent/20 cursor-pointer active:scale-95"
                >
                  <RefreshCw size={16} /> Mainkan Lagi
                </button>
              </div>
            </motion.div>
          ) : ostQuestions.length > 0 ? (
            <div className="rounded-3xl border border-wm-border bg-wm-card p-6 sm:p-8 space-y-6 shadow-md relative overflow-hidden">
              
              {/* Header Soal & Timer Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-wm-accent/10 border border-wm-accent/20 px-3 py-1 text-xs font-black text-wm-accent">
                    Soal #{ostIndex + 1} dari {ostQuestions.length}
                  </span>
                  <span className="rounded-full bg-wm-bg border border-wm-border px-3 py-1 text-xs font-bold text-wm-text/80">
                    Mystery OST Challenge
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-black text-xs text-wm-accent bg-wm-accent/10 border border-wm-accent/20 px-3 py-1 rounded-full">
                  <Clock size={14} />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              {/* Progress Timer Visual Bar */}
              <div className="h-2 w-full rounded-full bg-wm-bg overflow-hidden border border-wm-border/50">
                <motion.div
                  className="h-full bg-wm-accent"
                  initial={{ width: "100%" }}
                  animate={{ width: `${(timeLeft / secondsPerQuestion) * 100}%` }}
                  transition={{ ease: "linear", duration: 1 }}
                />
              </div>

              {/* Interactive Audio Player Frame (Manual Play / Pause, NO Autoplay) */}
              <div className="rounded-2xl border border-wm-border bg-wm-bg p-6 flex flex-col items-center justify-center space-y-3 relative overflow-hidden text-center">
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className={`flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 shadow-lg cursor-pointer active:scale-95 ${
                    isPlayingAudio
                      ? "bg-wm-accent text-black shadow-wm-accent/30 animate-pulse scale-105"
                      : "bg-wm-card border-2 border-wm-accent text-wm-accent hover:bg-wm-accent hover:text-black"
                  }`}
                >
                  {isPlayingAudio ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>

                <div className="space-y-0.5">
                  <p className="text-xs font-black text-wm-texth">
                    {isPlayingAudio ? "Sedang Memutar Audio..." : "Klik Tombol Play Untuk Mendengar Lagu"}
                  </p>
                  <p className="text-[10px] text-wm-text/50">
                    {isPlayingAudio ? "Timer countdown berjalan..." : "Tekan play untuk memulai timer hitung mundur!"}
                  </p>
                </div>

                {/* Secret YouTube Embed Player (Controlled by isPlayingAudio) */}
                {isPlayingAudio && ostQuestions[ostIndex]?.preview_url && (
                  <div className="opacity-0 absolute pointer-events-none w-0 h-0 overflow-hidden">
                    <iframe
                      key={ostQuestions[ostIndex].id}
                      width="100"
                      height="100"
                      src={`https://www.youtube.com/embed/${
                        ostQuestions[ostIndex].preview_url.includes("v=")
                          ? ostQuestions[ostIndex].preview_url.split("v=")[1]?.split("&")[0]
                          : ostQuestions[ostIndex].preview_url.split("/").pop()
                      }?autoplay=1&enablejsapi=1`}
                      allow="autoplay"
                    />
                  </div>
                )}
              </div>

              {/* Multiple Choice Options (A, B, C, D) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {ostQuestions[ostIndex]?.options.map((opt, idx) => {
                  const labels = ["A", "B", "C", "D"];
                  const isSelected = selectedOptionId === opt.id;
                  const isCorrect = opt.is_correct;

                  let optionStyle = "border-wm-border bg-wm-bg text-wm-texth hover:border-wm-accent/50";
                  if (selectedOptionId !== null) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-400 font-black shadow-md";
                    } else if (isSelected && !isCorrect) {
                      optionStyle = "border-rose-500 bg-rose-500/20 text-rose-400 font-black";
                    } else {
                      optionStyle = "border-wm-border/40 bg-wm-bg/40 opacity-40 text-wm-text/40";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      disabled={selectedOptionId !== null}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition text-left cursor-pointer active:scale-98 ${optionStyle}`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-wm-card border border-wm-border font-black text-xs text-wm-accent flex-shrink-0">
                        {labels[idx]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-extrabold leading-tight">{opt.text}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="rounded-3xl border border-wm-border bg-wm-card p-8 text-center text-xs text-wm-text/60">
              Belum ada lagu OST di database untuk memulai permainan. Tambahkan OST di Panel Admin!
            </div>
          )}
        </div>
      )}

      {/* TAB 1: HOT TAKES */}
      {activeTab === "hottakes" && (
        <div className="space-y-6">
          {currentTake ? (
            <div className="rounded-3xl border border-wm-border bg-wm-card p-6 sm:p-8 space-y-6 shadow-md relative">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-wm-accent/10 border border-wm-accent/20 px-3 py-1 text-2xs font-bold text-wm-accent">
                  Opini #{takeIndex + 1} dari {hotTakes.length}
                </span>
                <span className="text-2xs text-wm-text/50 font-bold uppercase">{currentTake.category || "General"}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-wm-texth leading-snug">
                "{currentTake.question}"
              </h2>

              {/* Vote Choices */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => handleVoteTake(currentTake.id, "agree")}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition cursor-pointer ${
                    userVotes[currentTake.id] === "agree"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-black shadow-lg"
                      : "bg-wm-bg border-wm-border text-wm-texth hover:border-emerald-500/50"
                  }`}
                >
                  <ThumbsUp size={24} className="mb-2 text-emerald-400" />
                  <span className="font-bold text-sm">SETUJU</span>
                  <span className="text-3xs text-wm-text/60 mt-1">78% Netizen Setuju</span>
                </button>

                <button
                  onClick={() => handleVoteTake(currentTake.id, "disagree")}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition cursor-pointer ${
                    userVotes[currentTake.id] === "disagree"
                      ? "bg-rose-500/20 border-rose-500 text-rose-400 font-black shadow-lg"
                      : "bg-wm-bg border-wm-border text-wm-texth hover:border-rose-500/50"
                  }`}
                >
                  <ThumbsDown size={24} className="mb-2 text-rose-400" />
                  <span className="font-bold text-sm">TIDAK SETUJU</span>
                  <span className="text-3xs text-wm-text/60 mt-1">22% Netizen Menolak</span>
                </button>
              </div>

              {/* Next / Prev Prompt Pagination */}
              <div className="flex items-center justify-between border-t border-wm-border/50 pt-4 text-xs font-bold">
                <button
                  disabled={takeIndex === 0}
                  onClick={() => setTakeIndex((i) => Math.max(0, i - 1))}
                  className="px-4 py-2 rounded-xl border border-wm-border bg-wm-bg text-wm-text disabled:opacity-30 hover:text-wm-texth cursor-pointer"
                >
                  ← Pertanyaan Sebelumnya
                </button>

                <button
                  disabled={takeIndex === hotTakes.length - 1}
                  onClick={() => setTakeIndex((i) => Math.min(hotTakes.length - 1, i + 1))}
                  className="px-4 py-2 rounded-xl bg-wm-coral text-white hover:bg-wm-coral/95 disabled:opacity-30 cursor-pointer"
                >
                  Pertanyaan Selanjutnya →
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center italic text-wm-text/50 py-10">Belum ada prompt Hot Takes tersedia.</p>
          )}
        </div>
      )}

      {/* TAB 2: RED FLAG VS GREEN FLAG */}
      {activeTab === "redflag" && (
        <div className="space-y-6">
          {currentChar ? (
            <div className="rounded-3xl border border-wm-border bg-wm-card p-6 sm:p-8 text-center space-y-6 shadow-md">
              <div className="inline-block relative">
                <img
                  src={currentChar.avatar || "https://api.dicebear.com/7.x/adventurer/svg"}
                  alt=""
                  className="w-28 h-28 mx-auto rounded-full border-4 border-wm-border object-cover bg-wm-bg shadow-md"
                />
                {charVotes[currentChar.id] && (
                  <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-wm-card border border-wm-border shadow">
                    {charVotes[currentChar.id] === 'red' ? <AlertTriangle size={14} className="text-rose-500" /> : <Check size={14} className="text-emerald-400" />}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-black text-wm-texth">{currentChar.name}</h3>
                <p className="text-xs text-wm-accent font-bold mt-0.5">Dari: {currentChar.show} ({currentChar.role})</p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <button
                  onClick={() => handleVoteChar(currentChar.id, "red")}
                  className={`p-4 rounded-2xl border font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                    charVotes[currentChar.id] === "red"
                      ? "bg-rose-500 text-white border-rose-500 shadow-md"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white"
                  }`}
                >
                  <AlertTriangle size={14} /> RED FLAG
                </button>

                <button
                  onClick={() => handleVoteChar(currentChar.id, "green")}
                  className={`p-4 rounded-2xl border font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                    charVotes[currentChar.id] === "green"
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                  }`}
                >
                  <CheckCircle2 size={14} /> GREEN FLAG
                </button>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-wm-border/50 pt-4 text-xs font-bold max-w-md mx-auto">
                <button
                  disabled={charIndex === 0}
                  onClick={() => setCharIndex((i) => Math.max(0, i - 1))}
                  className="px-4 py-2 rounded-xl border border-wm-border bg-wm-bg text-wm-text disabled:opacity-30 cursor-pointer"
                >
                  ← Karakter Lalu
                </button>

                <button
                  disabled={charIndex === characters.length - 1}
                  onClick={() => setCharIndex((i) => Math.min(characters.length - 1, i + 1))}
                  className="px-4 py-2 rounded-xl bg-wm-coral text-white disabled:opacity-30 cursor-pointer"
                >
                  Karakter Lanjut →
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center italic text-wm-text/50 py-10">Belum ada daftar karakter tersedia.</p>
          )}
        </div>
      )}

      {/* TAB 3: RANDOM MOVIE PICKER */}
      {activeTab === "wheel" && (
        <div className="rounded-3xl border border-wm-border bg-wm-card p-6 sm:p-10 text-center space-y-6 shadow-md">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-wm-texth">Bingung Mau Nonton Apa Hari Ini?</h3>
            <p className="text-xs text-wm-text/70">Klik tombol di bawah untuk mendapatkan rekomendasi acak drakor/film tontonan kamu.</p>
          </div>

          <button
            onClick={spinRandomPicker}
            disabled={isSpinning}
            className="inline-flex items-center gap-2 rounded-2xl bg-wm-accent px-8 py-4 text-sm font-black text-black shadow-lg shadow-wm-accent/20 hover:scale-105 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={isSpinning ? "animate-spin" : ""} size={18} />
            <span>{isSpinning ? "Memilihkan Tontonan..." : "Putar Rekomendasi Acak"}</span>
          </button>

          {/* Result Card */}
          <AnimatePresence>
            {selectedPick && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto rounded-2xl border border-wm-accent/40 bg-wm-bg p-5 space-y-4 shadow-lg text-left"
              >
                <div className="flex gap-4 items-center">
                  <img src={selectedPick.poster_url} alt="" className="w-20 h-28 object-cover rounded-xl border border-wm-border shadow" />
                  <div>
                    <span className="rounded bg-wm-accent/10 border border-wm-accent/20 px-2 py-0.5 text-[10px] font-bold text-wm-accent uppercase">
                      {selectedPick.type}
                    </span>
                    <h4 className="text-base font-black text-wm-texth mt-1">{selectedPick.title}</h4>
                    <p className="text-2xs text-wm-text/70 line-clamp-2 mt-1">{selectedPick.synopsis}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}

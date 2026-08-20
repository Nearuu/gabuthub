import { useState, useEffect } from "react";
import { Vote, Award, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import useAuthStore from "../../store/authStore";
import API from "../../services/api";
import toast from "react-hot-toast";

export default function Voting() {
  const { token } = useAuthStore();

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingVoteId, setSubmittingVoteId] = useState(null);

  const loadPolls = async () => {
    try {
      const res = await API.get("/polls");
      setPolls(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat polling");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, [token]);

  const handleVoteSubmit = async (pollId, optionId) => {
    if (!token) {
      toast.error("Kamu harus login untuk memilih!");
      return;
    }

    setSubmittingVoteId(optionId);
    try {
      await API.post(`/polls/${pollId}/vote`, { option_id: optionId });
      toast.success("Pilihan berhasil disubmit!");
      loadPolls();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Gagal melakukan vote");
    } finally {
      setSubmittingVoteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-wm-mint border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 text-wm-text max-w-4xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="border-b border-wm-border/50 pb-4">
        <h2 className="text-2xl font-black tracking-wide text-wm-texth flex items-center gap-2">
          <Award className="text-wm-accent" size={24} /> Community Voting & Polls
        </h2>
        <p className="text-xs text-wm-text/60">Pilih opsi terbaik versimu untuk menentukan juara kategori pop-culture terfavorit.</p>
      </div>

      {/* Polls List */}
      <div className="space-y-6">
        {polls.length > 0 ? (
          polls.map((poll) => {
            const hasVoted = poll.user_voted_option_id !== null;

            return (
              <div
                key={poll.id}
                className="rounded-2xl border border-wm-border bg-wm-card p-6 space-y-6 shadow-sm relative"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-wm-border/50 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-wm-texth">{poll.title}</h3>
                    <p className="text-xs text-wm-text/70">{poll.description}</p>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2 text-2xs text-wm-text/50 font-bold uppercase tracking-wider">
                    <Calendar size={12} />
                    <span>
                      {poll.is_active
                        ? `Berakhir: ${new Date(poll.ends_at).toLocaleDateString("id-ID")}`
                        : "Berakhir / Ditutup"}
                    </span>
                  </div>
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {poll.options.map((option) => {
                    const isUserChoice = poll.user_voted_option_id === option.id;
                    // Calculate percentage
                    const votePercentage = poll.total_votes
                      ? Math.round((option.votes_count / poll.total_votes) * 100)
                      : 0;

                    return (
                      <div key={option.id} className="relative">
                        {/* If user voted or poll closed: Show percentage progress bar */}
                        {hasVoted || !poll.is_active ? (
                          <div
                            className={`relative flex items-center justify-between rounded-xl border p-4 text-xs font-bold transition overflow-hidden ${
                              isUserChoice
                                ? "border-wm-mint/30 text-wm-mint"
                                : "border-wm-border bg-wm-bg/40 text-wm-text"
                            }`}
                          >
                            {/* Color fill background */}
                            <div
                              className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                                isUserChoice ? "bg-wm-mint/10" : "bg-wm-text/5"
                              }`}
                              style={{ width: `${votePercentage}%` }}
                            ></div>

                            <span className="relative z-10 flex items-center gap-2">
                              {isUserChoice && <CheckCircle2 size={14} className="text-wm-mint" />}
                              <span>{option.option_text}</span>
                            </span>
                            <span className="relative z-10 font-black text-xs text-wm-texth">
                              {votePercentage}% ({option.votes_count} suara)
                            </span>
                          </div>
                        ) : (
                          /* If active and user hasn't voted: Clickable buttons */
                          <button
                            onClick={() => handleVoteSubmit(poll.id, option.id)}
                            disabled={submittingVoteId !== null}
                            className="w-full flex items-center justify-between rounded-xl border border-wm-border bg-wm-bg p-4 text-xs text-wm-text hover:border-wm-mint hover:bg-wm-card hover:text-wm-texth transition duration-200 text-left active:scale-99 cursor-pointer shadow-sm"
                          >
                            <span>{option.option_text}</span>
                            <div className="h-5 w-5 rounded-full border border-wm-border flex items-center justify-center group-hover:border-wm-mint">
                              <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-wm-mint"></span>
                            </div>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer status summary */}
                <div className="flex items-center justify-between text-2xs text-wm-text/50 px-1 border-t border-wm-border/40 pt-3">
                  <span>Total Pemilih: <strong>{poll.total_votes}</strong></span>
                  {hasVoted && (
                    <span className="text-wm-mint font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Terimakasih sudah berpartisipasi</span>
                    </span>
                  )}
                  {!hasVoted && poll.is_active && !token && (
                    <span className="text-wm-text/50 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>Harus login untuk memilih</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-wm-border bg-wm-card/10 border-dashed text-wm-text/50">
            <p className="text-sm">Belum ada polling aktif saat ini.</p>
          </div>
        )}
      </div>

    </div>
  );
}
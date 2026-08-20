import { create } from 'zustand';
import API from '../services/api';
import toast from 'react-hot-toast';

const useWatchlistStore = create((set, get) => ({
  watchlistItems: [],
  loading: false,

  // Fetch all watchlist items for logged in user
  fetchWatchlist: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ watchlistItems: [] });
      return;
    }
    try {
      set({ loading: true });
      const res = await API.get('/watchlist');
      const data = res.data || [];
      set({ watchlistItems: Array.isArray(data) ? data : (data.data || []) });
    } catch (err) {
      console.error("Error fetching watchlist:", err);
    } finally {
      set({ loading: false });
    }
  },

  // Check if contentId is in watchlist
  isWatchlisted: (contentId) => {
    if (!contentId) return false;
    const items = get().watchlistItems;
    return items.some(item => {
      const cId = item.content_id || item.content?.id;
      return String(cId) === String(contentId);
    });
  },

  // Get item watchlist detail
  getWatchlistItem: (contentId) => {
    if (!contentId) return null;
    const items = get().watchlistItems;
    return items.find(item => {
      const cId = item.content_id || item.content?.id;
      return String(cId) === String(contentId);
    }) || null;
  },

  // Add or update watchlist item
  saveToWatchlist: async (contentId, payload) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Silakan login terlebih dahulu!');
      return false;
    }
    try {
      const res = await API.post('/watchlist', {
        content_id: contentId,
        status: payload.status || 'Plan to Watch',
        personal_rating: payload.rating || 10,
        notes: payload.notes || ''
      });
      // Refresh local watchlist state
      await get().fetchWatchlist();
      toast.success('Berhasil disimpan ke Watchlist!');
      return true;
    } catch (err) {
      console.error("Error saving to watchlist:", err);
      toast.error('Gagal menyimpan ke Watchlist!');
      return false;
    }
  }
}));

export default useWatchlistStore;

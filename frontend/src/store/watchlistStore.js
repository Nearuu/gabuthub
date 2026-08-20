import { create } from 'zustand';
import API from '../services/api';
import toast from 'react-hot-toast';

const useWatchlistStore = create((set, get) => ({
  watchlistItems: [],
  loading: false,

  // Get strictly isolated user key for localStorage
  getUserStorageKey: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return 'watchlist_guest';
    try {
      const u = JSON.parse(userStr);
      return `watchlist_user_${u.id || u.username || u.email}`;
    } catch (e) {
      return 'watchlist_guest';
    }
  },

  // Fetch watchlist murni per-user (SELAIN USER YANG SUDAH ISI -> AWALNYA MURNI KOSONG 0)
  fetchWatchlist: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ watchlistItems: [] });
      return;
    }

    const key = get().getUserStorageKey();

    // 1. Fetch from API Backend
    try {
      set({ loading: true });
      const res = await API.get('/watchlist');
      if (Array.isArray(res.data) && res.data.length > 0) {
        set({ watchlistItems: res.data });
        localStorage.setItem(key, JSON.stringify(res.data));
        set({ loading: false });
        return;
      }
    } catch (err) {}

    // 2. Strict LocalStorage Isolation (DEFAULT 100% EMPTY [] FOR ANY NEW USER)
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        set({ watchlistItems: JSON.parse(stored) });
      } catch (e) {
        set({ watchlistItems: [] });
      }
    } else {
      // ABSOLUTELY ZERO / EMPTY FOR ALL NEW USERS
      localStorage.setItem(key, JSON.stringify([]));
      set({ watchlistItems: [] });
    }
    set({ loading: false });
  },

  // Check if contentId is in THIS USER's watchlist
  isWatchlisted: (contentId) => {
    if (!contentId) return false;
    const items = get().watchlistItems || [];
    return items.some(item => {
      const cId = item.content_id || item.id || item.content?.id;
      return String(cId) === String(contentId);
    });
  },

  // Add or update watchlist item for THIS USER
  saveToWatchlist: async (content, payload) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Silakan login terlebih dahulu untuk menyimpan ke Watchlist!');
      return false;
    }

    const key = get().getUserStorageKey();
    const currentList = get().watchlistItems || [];
    const contentId = content.id || content.content_id;

    const newItem = {
      id: contentId,
      content_id: contentId,
      title: content.title,
      type: content.type,
      poster_url: content.poster_url,
      avg_rating: content.avg_rating || content.rating || 10,
      pivot: {
        status: payload?.status || 'Plan to Watch',
        personal_rating: payload?.rating || 10,
        notes: payload?.notes || ''
      },
      status: payload?.status || 'Plan to Watch',
      personal_rating: payload?.rating || 10,
      notes: payload?.notes || ''
    };

    const filtered = currentList.filter(i => String(i.content_id || i.id) !== String(contentId));
    const updatedList = [newItem, ...filtered];

    try {
      await API.post('/watchlist', {
        content_id: contentId,
        status: payload?.status || 'Plan to Watch',
        personal_rating: payload?.rating || 10,
        notes: payload?.notes || ''
      });
    } catch (e) {}

    localStorage.setItem(key, JSON.stringify(updatedList));
    set({ watchlistItems: updatedList });

    toast.success(`"${content.title}" berhasil ditambahkan ke Watchlist Anda!`);
    return true;
  },

  // Remove item from THIS USER's watchlist
  removeFromWatchlist: async (contentId) => {
    const key = get().getUserStorageKey();
    const currentList = get().watchlistItems || [];

    try {
      await API.delete(`/watchlist/${contentId}`);
    } catch (e) {}

    const updatedList = currentList.filter(i => String(i.content_id || i.id) !== String(contentId));
    localStorage.setItem(key, JSON.stringify(updatedList));
    set({ watchlistItems: updatedList });
    toast.success('Berhasil dihapus dari Watchlist Anda!');
  }
}));

export default useWatchlistStore;

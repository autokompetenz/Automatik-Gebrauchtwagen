import { create } from 'zustand';

// ─── Theme Store ────────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('ak_theme') || 'light';
if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
else document.documentElement.removeAttribute('data-theme');

export const useThemeStore = create((set) => ({
  theme: savedTheme,
  toggle: () => {
    set((s) => {
      const newTheme = s.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ak_theme', newTheme);
      if (newTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
      return { theme: newTheme };
    });
  },
}));

// ─── Language Store ────────────────────────────────────────────────────────
export const useLangStore = create((set) => ({
  lang: localStorage.getItem('ak_lang') || 'fr',
  setLang: (lang) => {
    localStorage.setItem('ak_lang', lang);
    document.documentElement.lang = lang;
    set({ lang });
  },
}));

// ─── Auth Store ────────────────────────────────────────────────────────────
export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('ak_user') || 'null'),
  token: localStorage.getItem('ak_token') || null,
  isAuthenticated: !!localStorage.getItem('ak_token'),

  login: (user, token) => {
    localStorage.setItem('ak_token', token);
    localStorage.setItem('ak_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('ak_token');
    localStorage.removeItem('ak_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (updates) => {
    const updated = { ...get().user, ...updates };
    localStorage.setItem('ak_user', JSON.stringify(updated));
    set({ user: updated });
  },
  isAdmin: () => get().user?.role === 'ADMIN',
}));

// ─── Cart Store (localStorage, sans compte client) ──────────────────────────
const CART_KEY = 'ak_cart';
const loadCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
};
const saveCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));
const withTotals = (items) => ({
  cartItems: items,
  cartCount: items.reduce((s, i) => s + i.quantity, 0),
  total: items.reduce((s, i) => s + (i.car?.price || 0) * i.quantity, 0),
});

export const useCartStore = create((set, get) => ({
  ...withTotals(loadCart()),
  loading: false,

  fetchCart: () => set(withTotals(loadCart())),
  fetchCount: () => {},
  addItem: async (car, paymentType = 'full') => {
    const items = loadCart();
    const existing = items.find(i => i.carId === car.id);
    if (existing) existing.quantity += 1;
    else items.push({ id: car.id, carId: car.id, quantity: 1, paymentType, car });
    saveCart(items);
    set(withTotals(items));
  },
  removeItem: async (carId) => {
    const items = loadCart().filter(i => i.carId !== carId);
    saveCart(items);
    set(withTotals(items));
  },
  clear: () => { saveCart([]); set(withTotals([])); },
}));

// ─── Toast Store ───────────────────────────────────────────────────────────
let toastId = 0;
export const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (message, type = 'success', duration = 3800) => {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => set({ toasts: get().toasts.filter(t => t.id !== id) }), duration);
    return id;
  },
  removeToast: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) }),
}));
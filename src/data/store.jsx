import React, { createContext, useContext, useMemo, useReducer, useCallback } from 'react';
import {
  PRODUCTS, SELLERS, PROVIDERS, ORDERS, THREADS, VOUCHERS, HUBS, ACCOUNTS,
} from './mock';

const StoreCtx = createContext(null);

/* ------------------------------------------------------------------ */
/*  Initial state                                                      */
/* ------------------------------------------------------------------ */
const initial = {
  // sesi - account null berarti pengunjung belum masuk
  account: null,
  user: { name: 'Tamu', email: '', country: 'Indonesia' },
  sellerId: 's2',             // toko milik akun pembeli yang sedang masuk

  // catalogue
  products: PRODUCTS,
  sellers: SELLERS,
  providers: PROVIDERS,
  hubs: HUBS,
  orders: ORDERS,
  threads: THREADS,
  vouchers: VOUCHERS,

  // seller shipping preferences: providerId -> enabled
  sellerShipping: { 'p-fedex': true, 'p-dhl': true, 'p-ems': true, 'p-ups': false, 'p-aramex': false },
  sellerHub: 'h2',
  handlingDays: 2,

  // buyer shopping
  cart: [
    { productId: 'pr01', qty: 24, variant: 'Krem / All size' },
    { productId: 'pr15', qty: 10, variant: 'Hitam / M' },
  ],
  wishlist: ['pr20', 'pr04'],
  voucher: null,
  lastOrderId: null,

  toasts: [],
};

/* ------------------------------------------------------------------ */
/*  Reducer                                                           */
/* ------------------------------------------------------------------ */
function reducer(state, a) {
  switch (a.type) {
    /* ---- sesi ---- */
    case 'auth:login':
      return {
        ...state,
        account: a.account,
        user: { name: a.account.name, email: a.account.email, country: a.account.country },
        sellerId: a.account.sellerId || state.sellerId,
      };
    case 'auth:logout':
      return { ...state, account: null, user: { name: 'Tamu', email: '', country: 'Indonesia' } };

    /* ---- cart ---- */
    case 'cart:add': {
      const i = state.cart.findIndex(c => c.productId === a.productId && c.variant === a.variant);
      const cart = i >= 0
        ? state.cart.map((c, k) => (k === i ? { ...c, qty: c.qty + a.qty } : c))
        : [...state.cart, { productId: a.productId, qty: a.qty, variant: a.variant }];
      return { ...state, cart };
    }
    case 'cart:qty':
      return { ...state, cart: state.cart.map((c, k) => (k === a.index ? { ...c, qty: Math.max(1, a.qty) } : c)) };
    case 'cart:remove':
      return { ...state, cart: state.cart.filter((_, k) => k !== a.index) };
    case 'cart:clear':
      return { ...state, cart: [], voucher: null };

    case 'wishlist:toggle':
      return {
        ...state,
        wishlist: state.wishlist.includes(a.productId)
          ? state.wishlist.filter(p => p !== a.productId)
          : [...state.wishlist, a.productId],
      };

    case 'voucher:apply':
      return { ...state, voucher: a.voucher };
    case 'voucher:clear':
      return { ...state, voucher: null };

    /* ---- orders ---- */
    case 'order:create':
      return { ...state, orders: [a.order, ...state.orders], cart: [], voucher: null, lastOrderId: a.order.id };
    case 'order:status':
      return {
        ...state,
        orders: state.orders.map(o => {
          if (o.id !== a.orderId) return o;
          const stage = a.stage ?? o.stage;
          return {
            ...o, status: a.status, stage, awb: a.awb ?? o.awb,
            tracking: o.tracking.map((t, i) => ({
              ...t, state: i < stage ? 'done' : i === stage ? 'active' : 'pending',
            })),
          };
        }),
      };

    /* ---- products ---- */
    case 'product:create':
      return { ...state, products: [a.product, ...state.products] };
    case 'product:update':
      return { ...state, products: state.products.map(p => (p.id === a.product.id ? { ...p, ...a.product } : p)) };
    case 'product:delete':
      return { ...state, products: state.products.filter(p => p.id !== a.productId) };

    /* ---- sellers (admin) ---- */
    case 'seller:update':
      return { ...state, sellers: state.sellers.map(s => (s.id === a.seller.id ? { ...s, ...a.seller } : s)) };
    case 'seller:delete':
      return {
        ...state,
        sellers: state.sellers.filter(s => s.id !== a.sellerId),
        products: state.products.filter(p => p.sellerId !== a.sellerId),
      };

    /* ---- providers (admin) ---- */
    case 'provider:create':
      return { ...state, providers: [...state.providers, a.provider] };
    case 'provider:update':
      return { ...state, providers: state.providers.map(p => (p.id === a.provider.id ? { ...p, ...a.provider } : p)) };
    case 'provider:delete':
      return {
        ...state,
        providers: state.providers.filter(p => p.id !== a.providerId),
        sellerShipping: Object.fromEntries(Object.entries(state.sellerShipping).filter(([k]) => k !== a.providerId)),
      };

    /* ---- seller shipping prefs ---- */
    case 'shipping:toggle':
      return { ...state, sellerShipping: { ...state.sellerShipping, [a.providerId]: a.on } };
    case 'shipping:hub':
      return { ...state, sellerHub: a.hubId };
    case 'shipping:handling':
      return { ...state, handlingDays: a.days };

    /* ---- messaging ---- */
    case 'thread:send':
      return {
        ...state,
        threads: state.threads.map(t => (t.id === a.threadId
          ? { ...t, unread: 0, last: 'now', messages: [...t.messages, { from: 'me', text: a.text, time: a.time }] }
          : t)),
      };
    case 'thread:read':
      return { ...state, threads: state.threads.map(t => (t.id === a.threadId ? { ...t, unread: 0 } : t)) };
    case 'thread:create':
      return { ...state, threads: [a.thread, ...state.threads] };

    /* ---- toasts ---- */
    case 'toast:push':
      return { ...state, toasts: [...state.toasts, { id: Date.now() + Math.random(), ...a.toast }] };
    case 'toast:pop':
      return { ...state, toasts: state.toasts.filter(t => t.id !== a.id) };

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  Provider                                                          */
/* ------------------------------------------------------------------ */
export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const toast = useCallback((text, tone = 'ok') => {
    dispatch({ type: 'toast:push', toast: { text, tone } });
  }, []);

  const helpers = useMemo(() => ({
    product: id => state.products.find(p => p.id === id),
    seller: id => state.sellers.find(s => s.id === id),
    provider: id => state.providers.find(p => p.id === id),
    hub: id => state.hubs.find(h => h.id === id),
    cartCount: state.cart.reduce((a, c) => a + c.qty, 0),
    cartLines: state.cart.map((c, index) => {
      const p = state.products.find(x => x.id === c.productId);
      return { ...c, index, product: p, lineTotal: p ? p.price * c.qty : 0 };
    }),
    enabledProviders: state.providers.filter(p => p.active && state.sellerShipping[p.id]),
    sellerOrders: state.orders.filter(o => o.sellerId === state.sellerId),
    isAuthed: Boolean(state.account),
    isAdmin: state.account?.role === 'admin',
    isBuyer: state.account?.role === 'buyer',
    hasStore: Boolean(state.account?.sellerId),
  }), [state]);

  const subtotal = helpers.cartLines.reduce((a, l) => a + l.lineTotal, 0);

  const value = { state, dispatch, toast, subtotal, ...helpers };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                */
/* ------------------------------------------------------------------ */
export const usd = n => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const usd0 = n => '$' + Math.round(Number(n || 0)).toLocaleString('en-US');
export const num = n => Number(n || 0).toLocaleString('en-US');

export function quote(providerId, providers, weightKg) {
  const p = providers.find(x => x.id === providerId);
  if (!p) return 0;
  return +(p.baseRate + p.perKg * Math.max(0.5, weightKg)).toFixed(2);
}

/**
 * Pemeriksaan kredensial sementara untuk prototipe.
 * Diganti pemanggilan API autentikasi begitu backend tersedia.
 */
export function authenticate(username, password, role) {
  const hit = ACCOUNTS.find(a => a.username.toLowerCase() === String(username).trim().toLowerCase());
  if (!hit || hit.password !== password) return { ok: false, reason: 'Username atau kata sandi salah.' };
  if (role && hit.role !== role) {
    return {
      ok: false,
      reason: role === 'admin'
        ? 'Akun ini bukan akun super admin.'
        : 'Gunakan halaman masuk super admin untuk akun ini.',
    };
  }
  return { ok: true, account: hit };
}

export function discountFor(voucher, subtotal, shipping) {
  if (!voucher) return { productOff: 0, shipOff: 0 };
  if (subtotal < voucher.minSpend) return { productOff: 0, shipOff: 0 };
  if (voucher.type === 'shipping') return { productOff: 0, shipOff: Math.min(shipping, voucher.maxOff) };
  if (voucher.type === 'percent') return { productOff: Math.min(subtotal * voucher.value / 100, voucher.maxOff), shipOff: 0 };
  return { productOff: Math.min(voucher.value, voucher.maxOff), shipOff: 0 };
}

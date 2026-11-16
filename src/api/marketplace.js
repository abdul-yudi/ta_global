import { api, getToken, setToken, apiBaseUrl } from '../api/client';

export const authenticate = async (email, password, role) => {
  try {
    const r = await api('/auth/login', { method: 'POST', body: { email, password }, auth: false });
    if (role && r.user.role !== role) {
      return { ok: false, reason: role === 'admin' ? 'Akun ini bukan akun super admin.' : 'Gunakan halaman masuk super admin untuk akun ini.' };
    }
    setToken(r.token);
    return { ok: true, account: r.user };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
};

export async function loadInitialData() {
  const token = Boolean(getToken());
  const [products, categories, providers, hubs, vouchers, sellers, orders, threads] = await Promise.all([
    api(token ? '/products?page=1&pageSize=200&includeInactive=true' : '/products?page=1&pageSize=200', { auth: token }),
    api('/categories', { auth: false }),
    api('/admin/providers', { auth: false }).catch(() => []),
    api('/admin/hubs', { auth: false }).catch(() => []),
    api('/admin/vouchers', { auth: false }).catch(() => []),
    api('/public/sellers', { auth: false }).catch(() => []),
    token ? api('/orders').catch(() => []) : Promise.resolve([]),
    token ? api('/threads').catch(() => []) : Promise.resolve([])
  ]);
  return { products: products.map(mapProduct), categories, providers, hubs, vouchers, sellers: sellers.map(mapSeller), orders: orders.map(mapOrder), threads };
}

const mapProduct = p => ({
  ...p,
  id: p.legacyId || p.id,
  dbId: p.dbId || p.id,
  sellerId: p.sellerId || 's1',
  title: p.title || p.name,
  category: p.category || p.categoryName || '',
  desc: p.desc || p.description || '',
  images: (p.images || []).map(img => img.startsWith('/') && !img.startsWith('//') ? `${apiBaseUrl.replace('/api', '')}${img}` : img),
  variants: p.variants || [],
  specs: p.specs || [],
  tags: p.tags || []
});

const mapSeller = s => ({
  ...s,
  id: String(s.id).startsWith('s') ? String(s.id) : `s${s.id}`,
  joined: s.joined || String(s.joinedAtUtc || '').slice(0, 10),
  rating: s.rating || 0,
  reviews: s.reviews || 0,
  products: s.products || 0,
  sales30d: s.sales30d || 0,
  responseRate: s.responseRate || 0,
  shipOnTime: s.shipOnTime || 0
});

const mapOrder = o => ({
  ...o,
  id: o.id || o.orderNumber,
  sellerId: String(o.sellerId).startsWith('s') ? String(o.sellerId) : `s${o.sellerId}`,
  buyer: o.buyer || o.buyerName,
  provider: o.provider || o.providerId,
  payment: o.payment || 'Belum dibayar',
  address: o.address || o.city || '',
  placed: o.placed || String(o.placedAtUtc || '').slice(0, 16).replace('T', ' '),
  items: (o.items || []).map(i => ({ ...i, qty: i.qty || i.quantity, productId: i.productId || i.dbProductId })),
  tracking: o.tracking || [{
    title: o.status || 'awaiting_acceptance',
    note: o.awb && o.awb !== '-' ? `Resi ${o.awb}` : 'Menunggu konfirmasi penjual',
    place: o.city || '',
    time: o.placed || '-'
  }]
});

const numericId = id => {
  const n = Number(String(id).replace(/^pr|^s/i, ''));
  if (!Number.isInteger(n) || n <= 0) throw new Error(`ID ${id} belum ada di backend.`);
  return n;
};

const toProduct = p => ({ ...p, categoryId: p.categoryId || Number(String(p.category || '').replace(/^c/, '')) || 1 });

export const apiActions = {
  register: async f => {
    const r = await api('/auth/register', {
      method: 'POST',
      auth: false,
      body: { name: f.name, username: f.username, email: f.email, password: f.password, country: f.country, storeName: f.store || null }
    });
    setToken(r.token);
    return r.user;
  },
  createProduct: async p => mapProduct(await api('/products', { method: 'POST', body: toProduct(p) })),
  updateProduct: async p => mapProduct(await api(`/products/${p.dbId || numericId(p.id)}`, { method: 'PUT', body: toProduct(p) })),
  deleteProduct: id => api(`/products/${numericId(id)}`, { method: 'DELETE' }),

  updateSeller: async s => mapSeller(await api(`/admin/sellers/${numericId(s.id)}`, { method: 'PUT', body: s })),
  updateMySeller: async s => mapSeller(await api('/sellers/me', { method: 'PUT', body: s })),
  deleteSeller: id => api(`/admin/sellers/${numericId(id)}`, { method: 'DELETE' }),

  updateProvider: async p => {
    const all = await api('/admin/providers');
    return api('/admin/providers', { method: 'PUT', body: all.some(x => x.id === p.id) ? all.map(x => x.id === p.id ? { ...x, ...p } : x) : [...all, p] });
  },
  deleteProvider: async id => api('/admin/providers', { method: 'PUT', body: (await api('/admin/providers')).filter(x => x.id !== id) }),

  createOrder: async o => mapOrder(await api('/orders', {
    method: 'POST',
    body: {
      country: o.country,
      city: o.city,
      address: o.address,
      providerId: o.providerId || o.provider,
      total: o.total,
      note: o.note || null,
      items: o.items.map(i => ({ productId: Number(i.productId || i.dbProductId), quantity: Number(i.qty || i.quantity), variant: i.variant || '' }))
    }
  })),
  updateOrder: async (id, status, stage = 0, awb) => mapOrder(await api(`/orders/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status, stage, awb: awb || null } })),

  updateProfile: body => api('/account/profile', { method: 'PUT', body }),
  updateState: body => api('/account/state', { method: 'PUT', body }),

  sendMessage: (id, text) => api(`/threads/${id}/messages`, { method: 'POST', body: { text } }),
  markRead: id => api(`/threads/${id}/read`, { method: 'POST' }),
  createThread: body => api('/threads', { method: 'POST', body }),
  createAdminThread: body => api('/admin/messages', { method: 'POST', body }),
  adminMarkRead: id => api(`/admin/messages/${id}`, { method: 'PUT', body: {} }),

  uploadImage: async file => {
    const fd = new FormData();
    fd.append('file', file);
    return await api('/upload', { method: 'POST', body: fd });
  },

  getSellerAnalytics: () => api('/sellers/me/analytics'),
  getAdminAnalytics: () => api('/admin/analytics'),

  getProductReviews: id => api(`/products/${numericId(id)}/reviews`, { auth: false }),
  createProductReview: (id, body) => api(`/products/${numericId(id)}/reviews`, { method: 'POST', body }),

  createDropoffManifest: body => api('/seller/dropoff/manifest', { method: 'POST', body }),
  getDropoffManifests: () => api('/seller/dropoff/manifests'),

  getCarrierLogs: () => api('/admin/integrations/logs'),
  testCarrier: body => api('/admin/integrations/test', { method: 'POST', body })
};

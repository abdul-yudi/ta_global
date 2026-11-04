// =====================================================================
// Data tiruan TAGlobal - pengganti API sampai backend tersedia
// =====================================================================

/* ---------- Gambar placeholder lokal (tanpa koneksi internet) ---------- */
const PALETTES = [
  ['#e8e2d6', '#b8863b'], ['#dde8e2', '#0b3d2c'], ['#e4e7ec', '#4b5260'],
  ['#f2e3e5', '#b4293a'], ['#e3e9f2', '#1d4f8a'], ['#efe8dc', '#8a5a00'],
  ['#e6e9e4', '#1d6f4f'], ['#ece4ef', '#5b3b6e'],
];

export function placeholder(seed, label = '', ratio = 1) {
  let h = 0;
  for (let i = 0; i < String(seed).length; i++) h = (h * 31 + String(seed).charCodeAt(i)) % 9973;
  const [bg, fg] = PALETTES[h % PALETTES.length];
  const w = 600, hh = Math.round(600 / ratio);
  const initials = (label || String(seed)).replace(/[^A-Za-z0-9 ]/g, '').split(' ')
    .filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${hh}" viewBox="0 0 ${w} ${hh}">
<rect width="${w}" height="${hh}" fill="${bg}"/>
<g fill="none" stroke="${fg}" stroke-opacity=".18" stroke-width="1.2">
${Array.from({ length: 9 }, (_, i) => `<circle cx="${(h * (i + 3)) % w}" cy="${(h * (i + 7)) % hh}" r="${28 + ((h + i * 13) % 70)}"/>`).join('')}
</g>
<rect x="0" y="${hh - 4}" width="${w}" height="4" fill="${fg}" fill-opacity=".5"/>
<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
 font-family="Segoe UI, sans-serif" font-size="${Math.round(hh / 5)}" font-weight="700"
 fill="${fg}" fill-opacity=".55" letter-spacing="2">${initials}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* ---------- Kategori ---------- */
export const CATEGORIES = [
  { id: 'c1', name: 'Fashion Wanita', icon: 'bi-bag-heart', sub: ['Dress', 'Blus', 'Abaya & Gamis', 'Rok', 'Outerwear'] },
  { id: 'c2', name: 'Fashion Pria', icon: 'bi-person-vcard', sub: ['Kemeja', 'Koko & Kurta', 'Celana', 'Jaket'] },
  { id: 'c3', name: 'Hijab & Kerudung', icon: 'bi-flower2', sub: ['Pashmina', 'Hijab Instan', 'Segi Empat', 'Inner'] },
  { id: 'c4', name: 'Kain & Tekstil', icon: 'bi-layers', sub: ['Batik', 'Roll Katun', 'Sutra', 'Renda', 'Linen'] },
  { id: 'c5', name: 'Anak & Bayi', icon: 'bi-balloon', sub: ['Setelan Anak Perempuan', 'Setelan Anak Laki-laki', 'Pakaian Bayi'] },
  { id: 'c6', name: 'Tas & Aksesori', icon: 'bi-handbag', sub: ['Tote', 'Selempang', 'Ikat Pinggang', 'Perhiasan'] },
  { id: 'c7', name: 'Perlengkapan Ibadah', icon: 'bi-moon-stars', sub: ['Mukena', 'Sarung', 'Peci', 'Sajadah'] },
  { id: 'c8', name: 'Paket Grosir', icon: 'bi-box-seam', sub: ['Lot Campur', 'Lot Grade A', 'Overstock'] },
];

export const COUNTRIES = [
  'Indonesia', 'Amerika Serikat', 'Inggris', 'Arab Saudi', 'Uni Emirat Arab', 'Malaysia',
  'Singapura', 'Australia', 'Jerman', 'Belanda', 'Jepang', 'Korea Selatan', 'Kanada',
  'Prancis', 'Turki', 'Qatar', 'Brunei', 'Nigeria', 'Afrika Selatan',
];

/* ---------- Jasa pengiriman (dikelola super admin) ---------- */
export const PROVIDERS = [
  {
    id: 'p-fedex', name: 'FedEx', code: 'FEDEX', logo: 'FEDEX', active: true,
    service: 'International Priority', etaMin: 3, etaMax: 6, baseRate: 24.5, perKg: 7.2,
    apiStatus: 'connected', apiMode: 'production', apiKey: 'fx_live_8842••••9031',
    endpoint: 'https://apis.fedex.com/rate/v1', webhook: 'https://api.taglobal.id/hooks/fedex',
    countries: 212, lastSync: '2026-11-04 08:12', volume30d: 1842, tracking: 'https://www.fedex.com/fedextrack/?trknbr=',
  },
  {
    id: 'p-dhl', name: 'DHL Express', code: 'DHL', logo: 'DHL', active: true,
    service: 'Express Worldwide', etaMin: 2, etaMax: 5, baseRate: 27.9, perKg: 8.1,
    apiStatus: 'connected', apiMode: 'production', apiKey: 'dhl_live_1177••••4420',
    endpoint: 'https://express.api.dhl.com/mydhlapi/rates', webhook: 'https://api.taglobal.id/hooks/dhl',
    countries: 220, lastSync: '2026-11-04 08:30', volume30d: 2410, tracking: 'https://www.dhl.com/track?id=',
  },
  {
    id: 'p-ems', name: 'EMS Pos Indonesia', code: 'EMS', logo: 'EMS', active: true,
    service: 'EMS International', etaMin: 6, etaMax: 14, baseRate: 11.4, perKg: 4.6,
    apiStatus: 'connected', apiMode: 'sandbox', apiKey: 'ems_sbx_5590••••1183',
    endpoint: 'https://api.posindonesia.co.id/ems/v2/rate', webhook: 'https://api.taglobal.id/hooks/ems',
    countries: 184, lastSync: '2026-11-03 21:44', volume30d: 3156, tracking: 'https://ems.posindonesia.co.id/track/',
  },
  {
    id: 'p-ups', name: 'UPS', code: 'UPS', logo: 'UPS', active: true,
    service: 'Worldwide Saver', etaMin: 3, etaMax: 7, baseRate: 23.2, perKg: 6.9,
    apiStatus: 'error', apiMode: 'production', apiKey: 'ups_live_3310••••7765',
    endpoint: 'https://onlinetools.ups.com/api/rating/v1', webhook: 'https://api.taglobal.id/hooks/ups',
    countries: 198, lastSync: '2026-11-01 02:10', volume30d: 612, tracking: 'https://www.ups.com/track?tracknum=',
  },
  {
    id: 'p-aramex', name: 'Aramex', code: 'ARMX', logo: 'ARMX', active: false,
    service: 'Priority Parcel', etaMin: 4, etaMax: 9, baseRate: 18.8, perKg: 5.8,
    apiStatus: 'not_connected', apiMode: 'sandbox', apiKey: '',
    endpoint: '', webhook: '',
    countries: 66, lastSync: '-', volume30d: 0, tracking: 'https://www.aramex.com/track?ShipmentNumber=',
  },
];

/* ---------- Gerai penerimaan paket ---------- */
export const HUBS = [
  { id: 'h1', name: 'TAGlobal Gerai - Blok A Tanah Abang', address: 'Blok A Lt. Dasar, Jl. KH Mas Mansyur, Jakarta Pusat', open: '08:00 - 17:00', cutoff: '15:00', sellers: 418, intake30d: 3940, status: 'open' },
  { id: 'h2', name: 'TAGlobal Gerai - Blok B Tanah Abang', address: 'Blok B Lt. 1, Jl. Fachrudin, Jakarta Pusat', open: '08:00 - 17:00', cutoff: '15:00', sellers: 265, intake30d: 2110, status: 'open' },
  { id: 'h3', name: 'TAGlobal Gerai - Metro Tanah Abang', address: 'Metro TA Lt. 2, Jl. Kebon Jati, Jakarta Pusat', open: '09:00 - 18:00', cutoff: '16:00', sellers: 191, intake30d: 1486, status: 'open' },
  { id: 'h4', name: 'TAGlobal Hub - Ekspor Cengkareng', address: 'Jl. Husein Sastranegara, Jakarta Barat', open: '24 jam', cutoff: '20:00', sellers: 0, intake30d: 7512, status: 'hub' },
];

/* ---------- Penjual ---------- */
export const SELLERS = [
  { id: 's1', name: 'Nusantara Textile', owner: 'Hadi Pranoto', block: 'Blok A - 2F / 112', joined: '2024-03-11', rating: 4.8, reviews: 2104, products: 42, sales30d: 18420, status: 'verified', country: 'Indonesia', responseRate: 98, shipOnTime: 96, email: 'hadi@nusantaratextile.id', phone: '+62 812 1100 2233' },
  { id: 's2', name: 'Toko Ani Hijab', owner: 'Ani Rahmawati', block: 'Blok B - 1F / 040', joined: '2024-06-02', rating: 4.9, reviews: 3390, products: 68, sales30d: 24110, status: 'verified', country: 'Indonesia', responseRate: 99, shipOnTime: 97, email: 'ani@tokoani.id', phone: '+62 813 4455 7788' },
  { id: 's3', name: 'Batik Pusaka Jaya', owner: 'Rudi Hartono', block: 'Metro TA - 2F / 017', joined: '2023-11-20', rating: 4.7, reviews: 1562, products: 35, sales30d: 12730, status: 'verified', country: 'Indonesia', responseRate: 94, shipOnTime: 92, email: 'rudi@batikpusaka.id', phone: '+62 811 9900 1122' },
  { id: 's4', name: 'Kids Corner TA', owner: 'Dewi Lestari', block: 'Blok A - 3F / 208', joined: '2025-01-15', rating: 4.6, reviews: 644, products: 51, sales30d: 8360, status: 'pending', country: 'Indonesia', responseRate: 88, shipOnTime: 90, email: 'dewi@kidscornerta.id', phone: '+62 857 2233 4455' },
  { id: 's5', name: 'Mukena Rahma', owner: 'Rahmawati', block: 'Blok B - 2F / 091', joined: '2024-09-30', rating: 4.9, reviews: 1188, products: 24, sales30d: 10290, status: 'verified', country: 'Indonesia', responseRate: 97, shipOnTime: 99, email: 'rahma@mukenarahma.id', phone: '+62 821 6677 8899' },
  { id: 's6', name: 'Grosir Murah Sentosa', owner: 'Agus Santoso', block: 'Blok A - 1F / 004', joined: '2025-08-04', rating: 4.1, reviews: 96, products: 19, sales30d: 2140, status: 'suspended', country: 'Indonesia', responseRate: 61, shipOnTime: 70, email: 'agus@sentosa.id', phone: '+62 896 1234 5566' },
];

/* ---------- Produk ---------- */
const P = (id, sellerId, title, cat, sub, price, old, moq, sold, rating, reviews, stock, weight, status, tags) => ({
  id, sellerId, title, category: cat, sub, price, oldPrice: old, moq, sold, rating, reviews, stock,
  weight, status, tags,
  images: [placeholder(id + 'a', title), placeholder(id + 'b', title), placeholder(id + 'c', title), placeholder(id + 'd', title)],
  sku: 'TA-' + id.toUpperCase(),
  variants: [
    { name: 'Ukuran', options: ['S', 'M', 'L', 'XL'] },
    { name: 'Warna', options: ['Hitam', 'Krem', 'Navy', 'Maroon'] },
  ],
  desc: `${title} diproduksi oleh workshop Tanah Abang dengan finishing kualitas ekspor. Kain sudah pre-shrunk, warnanya tidak luntur, dan diperiksa satu per satu sebelum sampai di loket gerai TAGlobal. Harga grosir berlaku mulai ${moq} pcs ke atas; ukuran dan warna boleh dicampur dalam satu karton.`,
  specs: [
    ['Bahan', 'Katun campuran premium'], ['Asal', 'Tanah Abang, Jakarta - Indonesia'],
    ['Minimum order', `${moq} pcs`], ['Berat satuan', `${weight} kg`],
    ['Kemasan', 'Plastik + karton ekspor'], ['Kode bea cukai', '6204.42.00'],
  ],
});

export const PRODUCTS = [
  P('pr01', 's2', 'Hijab Pashmina Voal Premium - Finishing Lembut, 20 Pilihan Warna', 'Hijab & Kerudung', 'Pashmina', 4.6, 7.2, 12, 8420, 4.9, 1204, 2400, 0.12, 'active', ['Terlaris', 'Ready Stock']),
  P('pr02', 's1', 'Kain Katun Twill Roll - 60 inci, Kualitas Ekspor (per yard)', 'Kain & Tekstil', 'Roll Katun', 2.9, null, 50, 3190, 4.8, 410, 9800, 0.35, 'active', ['Grosir']),
  P('pr03', 's3', 'Kemeja Batik Tulis Pria - Lengan Panjang', 'Fashion Pria', 'Kemeja', 18.4, 24.0, 6, 1260, 4.7, 322, 540, 0.42, 'active', ['Buatan Tangan']),
  P('pr04', 's5', 'Mukena Bali Rayon Dua Potong Lengkap dengan Tas', 'Perlengkapan Ibadah', 'Mukena', 12.8, 16.5, 6, 2740, 4.9, 688, 860, 0.55, 'active', ['Terlaris']),
  P('pr05', 's2', 'Hijab Instan Bergo Jersey - Harian, Adem', 'Hijab & Kerudung', 'Hijab Instan', 3.8, 5.5, 12, 6110, 4.8, 940, 3100, 0.1, 'active', ['Ready Stock']),
  P('pr06', 's1', 'Kain Renda Bordir - Kualitas Pengantin, Potongan 3 Yard', 'Kain & Tekstil', 'Renda', 9.6, 13.0, 10, 870, 4.6, 164, 420, 0.3, 'active', []),
  P('pr07', 's4', 'Setelan Gamis Anak Perempuan + Hijab - Usia 4-10', 'Anak & Bayi', 'Setelan Anak Perempuan', 8.2, 11.4, 6, 1540, 4.6, 288, 700, 0.38, 'active', ['Baru']),
  P('pr08', 's3', 'Sarung Batik Cap - Motif Klasik Pekalongan', 'Perlengkapan Ibadah', 'Sarung', 7.4, null, 12, 980, 4.5, 142, 1200, 0.4, 'active', []),
  P('pr09', 's2', 'Kerudung Segi Empat Satin Premium - Seri Motif 2026', 'Hijab & Kerudung', 'Segi Empat', 5.2, 6.9, 12, 3380, 4.7, 512, 1900, 0.09, 'active', []),
  P('pr10', 's1', 'Kain Linen Look Roll - Anti Kusut (per yard)', 'Kain & Tekstil', 'Linen', 3.6, null, 50, 2110, 4.7, 266, 7400, 0.32, 'active', ['Grosir']),
  P('pr11', 's5', 'Mukena Katun Jepang Bordir - Ukuran Dewasa', 'Perlengkapan Ibadah', 'Mukena', 19.9, 25.5, 4, 1320, 4.9, 390, 380, 0.68, 'active', ['Premium']),
  P('pr12', 's3', 'Dress Lilit Batik - Potongan Modern, Warna Sogan', 'Fashion Wanita', 'Dress', 16.8, 22.4, 6, 1140, 4.6, 214, 460, 0.45, 'active', []),
  P('pr13', 's4', 'Setelan Koko Anak + Peci - Koleksi Lebaran', 'Anak & Bayi', 'Setelan Anak Laki-laki', 9.4, 12.8, 6, 1290, 4.5, 198, 620, 0.4, 'active', []),
  P('pr14', 's1', 'Kain Sutra Charmeuse - 45 inci, Berkilau (per yard)', 'Kain & Tekstil', 'Sutra', 7.8, null, 30, 640, 4.8, 92, 2200, 0.28, 'draft', []),
  P('pr15', 's2', 'Inner Ninja Hijab - Katun Stretch, Paket Lusinan', 'Hijab & Kerudung', 'Inner', 6.4, 8.8, 5, 4260, 4.8, 604, 1500, 0.22, 'active', ['Paket Lusin']),
  P('pr16', 's6', 'Lot Grosir Campur - 50 pcs Blus Aneka Grade A', 'Paket Grosir', 'Lot Campur', 94.0, 130.0, 1, 212, 4.0, 38, 60, 9.5, 'review', ['Lot']),
  P('pr17', 's1', 'Kain Rayon Motif - Seri Bunga (per yard)', 'Kain & Tekstil', 'Roll Katun', 2.4, 3.2, 50, 2860, 4.6, 318, 8600, 0.26, 'active', []),
  P('pr18', 's5', 'Sajadah Travel Lipat dengan Tas Jinjing', 'Perlengkapan Ibadah', 'Sajadah', 6.9, 9.4, 10, 1870, 4.7, 254, 980, 0.3, 'active', []),
  P('pr19', 's3', 'Tas Tote Batik Lapis Kanvas - Buatan Tangan', 'Tas & Aksesori', 'Tote', 11.2, null, 6, 720, 4.5, 118, 340, 0.36, 'active', []),
  P('pr20', 's2', 'Abaya Crepe Potongan Longgar - Gaya Dubai Hitam', 'Fashion Wanita', 'Abaya & Gamis', 21.5, 28.0, 4, 1960, 4.8, 436, 520, 0.6, 'active', ['Terlaris']),
  P('pr21', 's4', 'Romper Bayi Katun Isi 3 - Lembut di Kulit', 'Anak & Bayi', 'Pakaian Bayi', 7.6, 10.2, 6, 1410, 4.6, 206, 880, 0.24, 'active', []),
  P('pr22', 's6', 'Paket Overstock - 30 pcs Baju Anak Campur', 'Paket Grosir', 'Overstock', 58.0, 85.0, 1, 86, 3.9, 21, 40, 6.2, 'rejected', ['Lot']),
  P('pr23', 's1', 'Kain Denim 12oz Roll - Raw Indigo (per yard)', 'Kain & Tekstil', 'Roll Katun', 5.4, null, 40, 1120, 4.7, 148, 3400, 0.5, 'active', []),
  P('pr24', 's5', 'Peci Rajut Premium - Hitam Klasik', 'Perlengkapan Ibadah', 'Peci', 4.2, 5.6, 12, 2240, 4.7, 288, 1700, 0.08, 'active', []),
];

/* ---------- Voucher ---------- */
export const VOUCHERS = [
  { code: 'TANAHABANG10', type: 'percent', value: 10, minSpend: 50, maxOff: 20, label: 'Diskon 10% untuk pesanan di atas $50', scope: 'Seluruh marketplace', expiry: '2026-12-31' },
  { code: 'NEWBUYER5', type: 'fixed', value: 5, minSpend: 25, maxOff: 5, label: 'Potongan $5 untuk pesanan pertama', scope: 'Pembeli baru', expiry: '2026-12-31' },
  { code: 'FREESHIP', type: 'shipping', value: 100, minSpend: 120, maxOff: 30, label: 'Gratis ongkir internasional di atas $120', scope: 'EMS & FedEx', expiry: '2026-11-30' },
  { code: 'HIJAB15', type: 'percent', value: 15, minSpend: 80, maxOff: 25, label: 'Diskon 15% kategori hijab', scope: 'Hijab & Kerudung', expiry: '2026-11-20' },
];

/* ---------- Pesanan ---------- */
const TRACK_TEMPLATE = [
  ['Pesanan dibuat', 'Pembayaran diotorisasi, menunggu konfirmasi penjual', 'Jakarta, ID'],
  ['Penjual menerima', 'Penjual sedang menyiapkan paket Anda', 'Tanah Abang, ID'],
  ['Diantar ke gerai', 'Paket dipindai di TAGlobal Gerai Blok A', 'Jakarta Pusat, ID'],
  ['Diserahkan ke kurir', 'Diambil untuk pengangkutan internasional', 'Hub Cengkareng, ID'],
  ['Berangkat dari asal', 'Penerbangan berangkat dari Soekarno-Hatta (CGK)', 'CGK, ID'],
  ['Proses bea cukai', 'Clearance impor sedang berjalan', 'Negara tujuan'],
  ['Sedang diantar', 'Kurir sedang mengantar paket Anda', 'Kota tujuan'],
  ['Terkirim', 'Ditandatangani penerima', 'Kota tujuan'],
];

function buildTracking(stage) {
  const base = new Date('2026-10-24T09:12:00');
  return TRACK_TEMPLATE.map((t, i) => ({
    title: t[0], note: t[1], place: t[2],
    time: new Date(base.getTime() + i * 26 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
    state: i < stage ? 'done' : i === stage ? 'active' : 'pending',
  }));
}

/** Linimasa untuk pesanan baru yang dibuat di halaman checkout. */
export function freshTracking(country, city) {
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
  return TRACK_TEMPLATE.map((t, i) => ({
    title: t[0], note: t[1],
    place: t[2] === 'Negara tujuan' ? country : t[2] === 'Kota tujuan' ? city : t[2],
    time: i === 0 ? now : '-',
    state: i === 0 ? 'active' : 'pending',
  }));
}

const O = (id, buyer, country, city, sellerId, items, status, stage, provider, total, placed, awb) => ({
  id, buyer, country, city, sellerId, items, status, stage, provider, total, placed, awb,
  payment: 'Visa •••• 4242', tracking: buildTracking(stage),
  address: `${city}, ${country}`, weight: items.reduce((a, b) => a + b.qty * 0.2, 0).toFixed(2),
});

export const ORDERS = [
  O('TA-24081', 'Amina Yusuf', 'Uni Emirat Arab', 'Dubai', 's2', [{ productId: 'pr01', qty: 24, variant: 'Krem / All size' }, { productId: 'pr15', qty: 10, variant: 'Hitam / M' }], 'awaiting_acceptance', 0, 'p-dhl', 186.4, '2026-11-04 07:40', '-'),
  O('TA-24080', 'Mark Dawson', 'Amerika Serikat', 'Austin', 's1', [{ productId: 'pr02', qty: 120, variant: 'Natural / 60 inci' }], 'awaiting_acceptance', 0, 'p-fedex', 372.5, '2026-11-04 06:05', '-'),
  O('TA-24076', 'Nur Aisyah', 'Malaysia', 'Kuala Lumpur', 's5', [{ productId: 'pr04', qty: 12, variant: 'Dusty Pink / Dewasa' }], 'to_dropoff', 1, 'p-ems', 158.2, '2026-11-03 20:18', '-'),
  O('TA-24071', 'Fatima Al-Harbi', 'Arab Saudi', 'Riyadh', 's2', [{ productId: 'pr20', qty: 8, variant: 'Hitam / L' }], 'at_hub', 2, 'p-dhl', 198.6, '2026-11-02 14:52', 'DHL8841220931'),
  O('TA-24066', 'Lena Fischer', 'Jerman', 'Munich', 's3', [{ productId: 'pr03', qty: 10, variant: 'Sogan / L' }, { productId: 'pr19', qty: 6, variant: 'Indigo' }], 'in_transit', 4, 'p-fedex', 252.0, '2026-10-31 11:20', 'FX772109884412'),
  O('TA-24059', 'Hiroshi Tanaka', 'Jepang', 'Osaka', 's1', [{ productId: 'pr17', qty: 80, variant: 'Bunga A / 45 inci' }], 'in_transit', 5, 'p-ems', 212.4, '2026-10-29 09:02', 'EE118345567ID'),
  O('TA-24048', 'Sarah Bennett', 'Inggris', 'Manchester', 's2', [{ productId: 'pr05', qty: 36, variant: 'Campur / All size' }], 'out_for_delivery', 6, 'p-dhl', 148.8, '2026-10-26 16:34', 'DHL5520119843'),
  O('TA-24039', 'Daniel Kim', 'Korea Selatan', 'Seoul', 's5', [{ productId: 'pr11', qty: 6, variant: 'Putih / Dewasa' }], 'delivered', 7, 'p-fedex', 139.4, '2026-10-22 10:11', 'FX118820094421'),
  O('TA-24031', 'Grace Mwangi', 'Nigeria', 'Lagos', 's3', [{ productId: 'pr12', qty: 12, variant: 'Sogan / M' }], 'delivered', 7, 'p-ems', 214.6, '2026-10-19 13:48', 'EE994120338ID'),
  O('TA-24022', 'Omar Haddad', 'Qatar', 'Doha', 's4', [{ productId: 'pr07', qty: 18, variant: 'Mauve / Usia 6' }], 'cancelled', 0, 'p-dhl', 156.2, '2026-10-16 08:25', '-'),
];

export const ORDER_STATUS = {
  awaiting_acceptance: { label: 'Menunggu konfirmasi', cls: 'ta-badge-warn' },
  to_dropoff: { label: 'Siap diantar', cls: 'ta-badge-info' },
  at_hub: { label: 'Di gerai / hub', cls: 'ta-badge-info' },
  in_transit: { label: 'Dalam pengiriman', cls: 'ta-badge-accent' },
  out_for_delivery: { label: 'Sedang diantar', cls: 'ta-badge-accent' },
  delivered: { label: 'Terkirim', cls: 'ta-badge-ok' },
  cancelled: { label: 'Dibatalkan', cls: 'ta-badge-danger' },
};

/* ---------- Percakapan ---------- */
export const THREADS = [
  {
    id: 't1', with: 'Toko Ani Hijab', role: 'seller', subject: 'Pesanan TA-24081 - campur warna',
    party: 'buyer:Amina Yusuf', unread: 2, last: '09:41', online: true,
    messages: [
      { from: 'them', text: 'Halo, apakah 24 pcs bisa dipecah jadi 12 krem dan 12 dusty rose?', time: '09:32' },
      { from: 'me', text: 'Bisa, campur warna dalam satu karton tidak masalah. Saya catat di packing list.', time: '09:36' },
      { from: 'them', text: 'Baik. Untuk ke Dubai, kurir tercepat yang mana ya?', time: '09:40' },
      { from: 'them', text: 'Apakah invoice untuk bea cukai disertakan di dalam kardus?', time: '09:41' },
    ],
  },
  {
    id: 't2', with: 'CS TAGlobal', role: 'admin', subject: 'Permintaan dokumen bea cukai',
    party: 'buyer:Amina Yusuf', unread: 0, last: 'Kemarin', online: true,
    messages: [
      { from: 'me', text: 'Kiriman saya butuh invoice komersial lengkap dengan kode HS. Bisa diterbitkan?', time: '14:02' },
      { from: 'them', text: 'Tentu. Hub kami melampirkan invoice komersial 3 rangkap di setiap paket internasional. PDF untuk TA-24071 sudah kami kirim ke email Anda.', time: '14:18' },
      { from: 'me', text: 'Sudah saya terima, terima kasih.', time: '14:25' },
    ],
  },
  {
    id: 't3', with: 'Mark Dawson', role: 'buyer', subject: 'Pesanan TA-24080 - lebar kain roll',
    party: 'seller:Nusantara Textile', unread: 1, last: '06:12',
    messages: [
      { from: 'them', text: 'Lebar 60 inci itu lebar terpakai atau sudah termasuk pinggiran kain?', time: '06:08' },
      { from: 'me', text: 'Lebar terpakai 58 inci, pinggiran kain sudah termasuk dalam ukuran 60 inci.', time: '06:10' },
      { from: 'them', text: 'Baik, tolong diproses 120 yard.', time: '06:12' },
    ],
  },
  {
    id: 't4', with: 'Nur Aisyah', role: 'buyer', subject: 'Pesanan TA-24076 - pengiriman ke KL',
    party: 'seller:Mukena Rahma', unread: 0, last: '2 hari lalu',
    messages: [
      { from: 'them', text: 'Bisa dikirim sebelum Jumat? Saya butuh untuk acara.', time: '19:44' },
      { from: 'me', text: 'Besok pagi paketnya saya antar ke gerai, jauh sebelum cut-off pukul 15:00.', time: '20:02' },
    ],
  },
  {
    id: 't5', with: 'Admin TAGlobal', role: 'admin', subject: 'Peninjauan produk - pr16',
    party: 'seller:Grosir Murah Sentosa', unread: 1, last: '3 hari lalu',
    messages: [
      { from: 'them', text: 'Produk lot grosir Anda ditahan untuk ditinjau: foto harus menampilkan barang campuran yang sebenarnya, bukan foto stok.', time: '10:20' },
      { from: 'me', text: 'Baik, akan saya foto ulang dan ajukan kembali.', time: '11:05' },
    ],
  },
];

/* ---------- Data analitik ---------- */
export const SELLER_ANALYTICS = {
  revenueSeries: [820, 960, 1180, 1040, 1420, 1680, 1510, 1890, 2140, 1980, 2460, 2820, 2610, 3080],
  ordersSeries: [12, 15, 18, 16, 22, 26, 24, 29, 33, 31, 38, 44, 41, 48],
  visitorsSeries: [410, 480, 530, 505, 620, 710, 680, 790, 860, 820, 960, 1080, 1020, 1190],
  labels: ['22 Okt', '23 Okt', '24 Okt', '25 Okt', '26 Okt', '27 Okt', '28 Okt', '29 Okt', '30 Okt', '31 Okt', '1 Nov', '2 Nov', '3 Nov', '4 Nov'],
  topCountries: [
    { country: 'Amerika Serikat', orders: 142, revenue: 6820 },
    { country: 'Arab Saudi', orders: 118, revenue: 5940 },
    { country: 'Malaysia', orders: 96, revenue: 3410 },
    { country: 'Inggris', orders: 74, revenue: 3180 },
    { country: 'Uni Emirat Arab', orders: 68, revenue: 3020 },
    { country: 'Jerman', orders: 41, revenue: 1860 },
  ],
  providerSplit: [
    { name: 'DHL Express', value: 38, color: '#0b3d2c' },
    { name: 'EMS', value: 31, color: '#b8863b' },
    { name: 'FedEx', value: 24, color: '#1d4f8a' },
    { name: 'UPS', value: 7, color: '#868e9c' },
  ],
  funnel: [
    { step: 'Dilihat', value: 24180 },
    { step: 'Masuk keranjang', value: 4820 },
    { step: 'Mulai checkout', value: 1940 },
    { step: 'Pesanan dibayar', value: 1218 },
  ],
};

export const ADMIN_ANALYTICS = {
  gmvSeries: [41200, 44800, 48100, 46200, 52400, 58900, 55100, 61800, 68400, 64900, 72600, 79400, 76200, 84100],
  labels: SELLER_ANALYTICS.labels,
  newSellers: [4, 6, 3, 5, 8, 7, 6, 9, 11, 8, 12, 14, 10, 13],
  categorySplit: [
    { name: 'Hijab & Kerudung', value: 28, color: '#0b3d2c' },
    { name: 'Kain & Tekstil', value: 24, color: '#b8863b' },
    { name: 'Fashion Wanita', value: 19, color: '#1d4f8a' },
    { name: 'Perlengkapan Ibadah', value: 15, color: '#1d6f4f' },
    { name: 'Lainnya', value: 14, color: '#868e9c' },
  ],
};

/* ---------- Akun demo ---------- */
/**
 * Kredensial sementara untuk prototipe. Diganti autentikasi backend nanti —
 * jangan pernah menyimpan kata sandi apa adanya di sistem produksi.
 */
export const ACCOUNTS = [
  {
    username: 'tokoani', password: 'password123', role: 'buyer',
    name: 'Ani Rahmawati', email: 'ani@tokoani.id', country: 'Indonesia',
    sellerId: 's2', storeName: 'Toko Ani Hijab',
  },
  {
    username: 'admin', password: 'password123', role: 'admin',
    name: 'Super Admin', email: 'ops@taglobal.id', country: 'Indonesia',
    sellerId: null, storeName: null,
  },
];

export const DEMO_HINT = {
  buyer: { username: 'tokoani', password: 'password123' },
  admin: { username: 'admin', password: 'password123' },
};

/* ---------- Ulasan ---------- */
export const REVIEWS = [
  { id: 'r1', productId: 'pr01', buyer: 'Amina Y.', country: 'Uni Emirat Arab', rating: 5, date: '2026-10-28', text: 'Bahannya persis seperti deskripsi, warna kremnya cantik. Dari Jakarta sampai Dubai hanya empat hari pakai DHL.', variant: 'Krem / All size' },
  { id: 'r2', productId: 'pr01', buyer: 'Sarah B.', country: 'Inggris', rating: 5, date: '2026-10-21', text: 'Pesan 48 pcs untuk toko saya. Kualitasnya seragam di seluruh batch, tidak ada benang yang lepas.', variant: 'Campur / All size' },
  { id: 'r3', productId: 'pr01', buyer: 'Nur A.', country: 'Malaysia', rating: 4, date: '2026-10-14', text: 'Harganya sepadan. EMS memakan waktu delapan hari, masih wajar untuk harga segini.', variant: 'Navy / All size' },
  { id: 'r4', productId: 'pr01', buyer: 'Grace M.', country: 'Nigeria', rating: 5, date: '2026-10-02', text: 'Penjual membalas dalam hitungan menit dan mengemas semuanya rapi dalam satu karton.', variant: 'Hitam / All size' },
];

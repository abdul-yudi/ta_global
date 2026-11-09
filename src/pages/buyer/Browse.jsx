import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore, num, usd, quote } from '../../data/store';
import { CATEGORIES, COUNTRIES } from '../../data/mock';
import ProductCard from '../../components/ProductCard';
import { Collapse, Pagination, Empty, Rating } from '../../components/ui';

const PER_PAGE = 12;
const SORTS = [
  { id: 'best', label: 'Paling sesuai' },
  { id: 'sold', label: 'Jumlah pesanan' },
  { id: 'new', label: 'Terbaru' },
  { id: 'low', label: 'Harga terendah' },
  { id: 'high', label: 'Harga tertinggi' },
  { id: 'rating', label: 'Rating' },
];

export default function Browse() {
  const { state, seller } = useStore();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const cat = params.get('cat') || '';
  const sellerId = params.get('seller') || '';
  const sort = params.get('sort') || 'best';

  const [price, setPrice] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState(0);
  const [subs, setSubs] = useState([]);
  const [shipTo, setShipTo] = useState('Indonesia');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [page, setPage] = useState(1);
  const [view, setView] = useState('grid');

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next);
    setPage(1);
  };

  const results = useMemo(() => {
    let list = state.products.filter(p => p.status === 'active');
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(needle)
        || p.category.toLowerCase().includes(needle)
        || p.sub.toLowerCase().includes(needle));
    }
    if (cat) list = list.filter(p => p.category === cat);
    if (sellerId) list = list.filter(p => p.sellerId === sellerId);
    if (subs.length) list = list.filter(p => subs.includes(p.sub));
    if (price.min) list = list.filter(p => p.price >= +price.min);
    if (price.max) list = list.filter(p => p.price <= +price.max);
    if (minRating) list = list.filter(p => p.rating >= minRating);
    if (onlyVerified) list = list.filter(p => seller(p.sellerId)?.status === 'verified');

    const by = {
      sold: (a, b) => b.sold - a.sold,
      new: (a, b) => b.id.localeCompare(a.id),
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      best: (a, b) => b.sold * b.rating - a.sold * a.rating,
    };
    return [...list].sort(by[sort] || by.best);
  }, [state.products, q, cat, sellerId, subs, price, minRating, onlyVerified, sort, seller]);

  const pages = Math.ceil(results.length / PER_PAGE) || 1;
  const slice = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const subList = cat ? (CATEGORIES.find(c => c.name === cat)?.sub || []) : [];
  const shopFor = sellerId ? seller(sellerId) : null;

  const activeFilters = [
    q && { k: 'q', label: `â€œ${q}â€` },
    cat && { k: 'cat', label: cat },
    sellerId && { k: 'seller', label: shopFor?.name },
  ].filter(Boolean);

  return (
    <main className="container py-4">
      {/* breadcrumb */}
      <nav className="ta-xs ta-faint mb-3">
        <Link to="/" className="ta-link-quiet">Beranda</Link>
        <i className="bi bi-chevron-right mx-1" style={{ fontSize: '.6rem' }} />
        <span>{cat || (q ? `Pencarian: ${q}` : 'Semua kategori')}</span>
      </nav>

      {shopFor && (
        <div className="ta-card ta-card-pad mb-3 d-flex align-items-center gap-3 flex-wrap">
          <span className="ta-avatar ta-avatar-lg">{shopFor.name.slice(0, 2).toUpperCase()}</span>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2">
              <h2 style={{ fontSize: '1.05rem', margin: 0 }}>{shopFor.name}</h2>
              {shopFor.status === 'verified' && <span className="ta-crest"><i className="bi bi-patch-check-fill" />Terverifikasi</span>}
            </div>
            <div className="ta-xs ta-faint">{shopFor.block} Â· {shopFor.country} Â· bergabung {shopFor.joined}</div>
          </div>
          <div className="d-flex gap-4 ta-sm">
            <div><div className="ta-xs ta-faint">Rating</div><Rating value={shopFor.rating} /></div>
            <div><div className="ta-xs ta-faint">Ketepatan kirim</div><strong>{shopFor.shipOnTime}%</strong></div>
            <div><div className="ta-xs ta-faint">Balas chat</div><strong>{shopFor.responseRate}%</strong></div>
          </div>
          <Link to="/messages" className="btn btn-ta-outline btn-sm"><i className="bi bi-chat-dots me-1" />Chat kios</Link>
        </div>
      )}

      <div className="row g-3">
        {/* ---------------- panel filter ---------------- */}
        <div className="col-lg-3">
          <div className="ta-card ta-sticky-side">
            <div className="ta-card-head">
              <h6>Filter</h6>
              <button className="btn btn-ta-ghost btn-sm" onClick={() => {
                setSubs([]); setPrice({ min: '', max: '' }); setMinRating(0); setOnlyVerified(false); setShipTo('Indonesia');
                setParams(new URLSearchParams()); setPage(1);
              }}>Atur ulang</button>
            </div>

            <Collapse title="Kategori">
              <div className="d-grid gap-1">
                <button className={`ta-chip ${!cat ? 'active' : ''}`} onClick={() => setParam('cat', '')}>Semua kategori</button>
                {CATEGORIES.map(c => (
                  <button key={c.id} className={`ta-chip ${cat === c.name ? 'active' : ''}`}
                    onClick={() => { setParam('cat', c.name); setSubs([]); }}>
                    <i className={`bi ${c.icon}`} />{c.name}
                  </button>
                ))}
              </div>
            </Collapse>

            {subList.length > 0 && (
              <Collapse title="Sub-kategori">
                {subList.map(s => (
                  <div className="form-check" key={s}>
                    <input className="form-check-input" type="checkbox" id={`sub-${s}`} checked={subs.includes(s)}
                      onChange={e => { setSubs(v => e.target.checked ? [...v, s] : v.filter(x => x !== s)); setPage(1); }} />
                    <label className="form-check-label" htmlFor={`sub-${s}`}>{s}</label>
                  </div>
                ))}
              </Collapse>
            )}

            <Collapse title="Harga (USD / satuan)">
              <div className="d-flex align-items-center gap-2">
                <input className="form-control form-control-sm" placeholder="Min" value={price.min}
                  onChange={e => { setPrice(p => ({ ...p, min: e.target.value.replace(/\D/g, '') })); setPage(1); }} />
                <span className="ta-faint">â€“</span>
                <input className="form-control form-control-sm" placeholder="Maks" value={price.max}
                  onChange={e => { setPrice(p => ({ ...p, max: e.target.value.replace(/\D/g, '') })); setPage(1); }} />
              </div>
              <div className="d-flex gap-1 mt-2 flex-wrap">
                {[['0', '5'], ['5', '15'], ['15', '40'], ['40', '']].map(([a, b]) => (
                  <button key={a} className="ta-chip" onClick={() => { setPrice({ min: a, max: b }); setPage(1); }}>
                    ${a}{b ? `â€“$${b}` : '+'}
                  </button>
                ))}
              </div>
            </Collapse>

            <Collapse title="Rating penjual">
              {[4.5, 4, 3.5, 0].map(r => (
                <div className="form-check" key={r}>
                  <input className="form-check-input" type="radio" name="rating" id={`r${r}`} checked={minRating === r}
                    onChange={() => { setMinRating(r); setPage(1); }} />
                  <label className="form-check-label d-flex align-items-center gap-1" htmlFor={`r${r}`}>
                    {r ? <>{r}<i className="bi bi-star-fill ta-stars" /> ke atas</> : 'Semua rating'}
                  </label>
                </div>
              ))}
            </Collapse>

            <Collapse title="Estimasi pengiriman" defaultOpen={false}>
              <label className="form-label">Dikirim ke</label>
              <select className="form-select form-select-sm mb-3" value={shipTo} onChange={e => setShipTo(e.target.value)}>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <div className="ta-xs ta-faint mb-2">Perkiraan untuk paket 1 kg ke {shipTo}</div>
              {state.providers.filter(p => p.active).map(p => (
                <div key={p.id} className="d-flex align-items-center gap-2 py-1">
                  <span className="ta-logo-chip">{p.logo}</span>
                  <span className="ta-xs flex-grow-1">{p.etaMin}-{p.etaMax} hari</span>
                  <span className="ta-xs fw-semibold">{usd(quote(p.id, state.providers, 1))}</span>
                </div>
              ))}
              <div className="ta-xs ta-faint mt-2">Tarif final dihitung ulang saat checkout.</div>
            </Collapse>

            <Collapse title="Status penjual" defaultOpen={false}>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="verified" checked={onlyVerified}
                  onChange={e => { setOnlyVerified(e.target.checked); setPage(1); }} />
                <label className="form-check-label" htmlFor="verified">Hanya kios terverifikasi</label>
              </div>
            </Collapse>
          </div>
        </div>

        {/* ---------------- hasil ---------------- */}
        <div className="col-lg-9">
          <div className="ta-card ta-card-pad mb-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div>
              <div className="fw-semibold">{num(results.length)} produk</div>
              <div className="ta-xs ta-faint">
                {activeFilters.length
                  ? <>Disaring berdasarkan {activeFilters.map(f => f.label).join(' Â· ')}</>
                  : 'Dari seluruh kios Tanah Abang yang terverifikasi'}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {activeFilters.map(f => (
                <button key={f.k} className="ta-chip active" onClick={() => setParam(f.k, '')}>
                  {f.label}<i className="bi bi-x" />
                </button>
              ))}
              <select className="form-select form-select-sm" style={{ width: 186 }} value={sort}
                onChange={e => setParam('sort', e.target.value)}>
                {SORTS.map(s => <option key={s.id} value={s.id}>Urutkan: {s.label}</option>)}
              </select>
              <div className="btn-group">
                <button className={`btn btn-sm ${view === 'grid' ? 'btn-ta' : 'btn-ta-outline'}`} onClick={() => setView('grid')} aria-label="Tampilan grid">
                  <i className="bi bi-grid" />
                </button>
                <button className={`btn btn-sm ${view === 'list' ? 'btn-ta' : 'btn-ta-outline'}`} onClick={() => setView('list')} aria-label="Tampilan daftar">
                  <i className="bi bi-list-ul" />
                </button>
              </div>
            </div>
          </div>

          {slice.length === 0 && (
            <div className="ta-card">
              <Empty icon="bi-search" title="Tidak ada produk yang cocok dengan filter ini"
                sub="Coba lebarkan rentang harga atau hapus filter kategori.">
                <button className="btn btn-ta btn-sm" onClick={() => { setParams(new URLSearchParams()); setSubs([]); setPrice({ min: '', max: '' }); setMinRating(0); }}>
                  Hapus semua filter
                </button>
              </Empty>
            </div>
          )}

          {view === 'grid' ? (
            <div className="row g-3">
              {slice.map(p => <div key={p.id} className="col-6 col-md-4 col-xl-3"><ProductCard product={p} /></div>)}
            </div>
          ) : (
            <div className="d-grid gap-2">
              {slice.map(p => {
                const s = seller(p.sellerId);
                return (
                  <div key={p.id} className="ta-card ta-card-pad d-flex gap-3">
                    <Link to={`/product/${p.id}`} style={{ flex: 'none' }}>
                      <img src={p.images[0]} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 'var(--ta-radius-sm)' }} />
                    </Link>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <Link to={`/product/${p.id}`} className="fw-semibold d-block" style={{ color: 'var(--ta-ink)' }}>{p.title}</Link>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <Rating value={p.rating} count={p.reviews} />
                        <span className="ta-xs ta-faint">Â· {num(p.sold)} terjual</span>
                      </div>
                      <div className="ta-sm ta-muted mt-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.desc}
                      </div>
                      <div className="d-flex gap-2 mt-2 flex-wrap">
                        <span className="ta-badge ta-badge-neutral"><i className="bi bi-shop" />{s?.name}</span>
                        <span className="ta-badge ta-badge-neutral">MOQ {p.moq}</span>
                        <span className="ta-badge ta-badge-neutral">{p.weight} kg / satuan</span>
                      </div>
                    </div>
                    <div className="text-end" style={{ flex: 'none', width: 150 }}>
                      <div className="ta-price">${p.price.toFixed(2)}</div>
                      {p.oldPrice && <div className="ta-price-old">${p.oldPrice.toFixed(2)}</div>}
                      <div className="ta-xs ta-faint mb-2">/ satuan</div>
                      <Link to={`/product/${p.id}`} className="btn btn-ta btn-sm w-100">Lihat</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Pagination page={page} pages={pages} onPage={setPage} />
        </div>
      </div>
    </main>
  );
}



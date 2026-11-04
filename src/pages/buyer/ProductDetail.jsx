import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useStore, usd, num, quote } from '../../data/store';
import { REVIEWS, COUNTRIES } from '../../data/mock';
import ProductCard from '../../components/ProductCard';
import { Rating, QtyStepper, ProviderLogo, Empty } from '../../components/ui';

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { state, product, seller, dispatch, toast } = useStore();
  const p = product(id);

  const [img, setImg] = useState(0);
  const [variant, setVariant] = useState({});
  const [qty, setQty] = useState(p?.moq || 1);
  const [dest, setDest] = useState(state.user.country);
  const [carrier, setCarrier] = useState('p-dhl');
  const [tab, setTab] = useState('desc');

  if (!p) {
    return <main className="container py-5"><div className="ta-card"><Empty icon="bi-box" title="Produk tidak ditemukan" /></div></main>;
  }

  const s = seller(p.sellerId);
  const saved = state.wishlist.includes(p.id);
  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const reviews = REVIEWS.filter(r => r.productId === p.id);
  const related = state.products.filter(x => x.category === p.category && x.id !== p.id && x.status === 'active').slice(0, 6);
  const availableProviders = state.providers.filter(x => x.active && state.sellerShipping[x.id]);
  const shipCost = quote(carrier, state.providers, p.weight * qty);
  const prov = state.providers.find(x => x.id === carrier);
  const variantLabel = p.variants.map(v => variant[v.name]).filter(Boolean).join(' / ') || 'Standar';
  const tiers = [
    { from: p.moq, to: p.moq * 5 - 1, price: p.price },
    { from: p.moq * 5, to: p.moq * 20 - 1, price: +(p.price * 0.94).toFixed(2) },
    { from: p.moq * 20, to: null, price: +(p.price * 0.88).toFixed(2) },
  ];
  const unit = tiers.slice().reverse().find(t => qty >= t.from)?.price ?? p.price;

  const addToCart = goCheckout => {
    if (qty < p.moq) { toast(`Minimum pemesanan ${p.moq} pcs`, 'warn'); return; }
    dispatch({ type: 'cart:add', productId: p.id, qty, variant: variantLabel });
    toast(`${qty} × ${p.title.slice(0, 28)}… masuk keranjang`);
    if (goCheckout) nav('/cart');
  };

  return (
    <main className="container py-4">
      <nav className="ta-xs ta-faint mb-3">
        <Link to="/" className="ta-link-quiet">Beranda</Link>
        <i className="bi bi-chevron-right mx-1" style={{ fontSize: '.6rem' }} />
        <Link to={`/search?cat=${encodeURIComponent(p.category)}`} className="ta-link-quiet">{p.category}</Link>
        <i className="bi bi-chevron-right mx-1" style={{ fontSize: '.6rem' }} />
        <span>{p.sub}</span>
      </nav>

      <div className="row g-4">
        {/* ---------------- galeri ---------------- */}
        <div className="col-lg-5">
          <div className="ta-card" style={{ overflow: 'hidden' }}>
            <div style={{ position: 'relative', aspectRatio: '1/1', background: 'var(--ta-line-soft)' }}>
              <img src={p.images[img]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {off > 0 && <span className="ta-ribbon" style={{ fontSize: '.8rem', padding: '.2rem .5rem' }}>-{off}% grosir</span>}
            </div>
            <div className="d-flex gap-2 p-3">
              {p.images.map((src, i) => (
                <button key={i} onClick={() => setImg(i)} className="p-0"
                  style={{
                    border: i === img ? '2px solid var(--ta-brand)' : '1px solid var(--ta-line)',
                    borderRadius: 'var(--ta-radius-sm)', overflow: 'hidden', background: 'none', width: 60, height: 60,
                  }} aria-label={`Foto ${i + 1}`}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          <div className="ta-card ta-card-pad mt-3">
            <div className="ta-eyebrow mb-2">Jaminan pembeli</div>
            {[
              ['bi-shield-check', 'Dana kembali penuh bila paket hilang di perjalanan'],
              ['bi-arrow-repeat', 'Masa retur 14 hari untuk barang cacat'],
              ['bi-file-earmark-text', 'Invoice komersial & kode HS disertakan'],
            ].map(([i, t]) => (
              <div key={t} className="d-flex gap-2 ta-sm py-1">
                <i className={`bi ${i}`} style={{ color: 'var(--ta-brand)' }} />
                <span className="ta-muted">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- kotak pembelian ---------------- */}
        <div className="col-lg-7">
          <div className="d-flex gap-2 mb-2 flex-wrap">
            {p.tags.map(t => <span key={t} className="ta-badge ta-badge-accent">{t}</span>)}
            <span className="ta-badge ta-badge-neutral">SKU {p.sku}</span>
          </div>
          <h1 style={{ fontSize: '1.375rem', lineHeight: 1.35 }}>{p.title}</h1>

          <div className="d-flex align-items-center gap-3 mt-2 mb-3 flex-wrap">
            <Rating value={p.rating} count={p.reviews} />
            <span className="ta-sm ta-faint">{num(p.sold)} terjual ke seluruh dunia</span>
            <span className="ta-sm ta-faint">·</span>
            <span className="ta-sm ta-faint">stok {num(p.stock)}</span>
          </div>

          {/* tingkatan harga */}
          <div className="ta-card ta-card-pad" style={{ background: '#fbfcfd' }}>
            <div className="row g-3">
              {tiers.map(t => {
                const on = unit === t.price;
                return (
                  <div key={t.from} className="col-4">
                    <div className="ta-xs ta-faint">{t.to ? `${t.from} – ${t.to} pcs` : `${t.from}+ pcs`}</div>
                    <div className="ta-price" style={{ color: on ? 'var(--ta-brand)' : 'var(--ta-ink)' }}>{usd(t.price)}</div>
                    {on && <div className="ta-xs fw-semibold" style={{ color: 'var(--ta-brand)' }}>Harga Anda</div>}
                  </div>
                );
              })}
            </div>
            <hr className="ta-sep my-3" />
            <div className="d-flex justify-content-between ta-sm">
              <span className="ta-muted">Minimum pemesanan</span>
              <strong>{p.moq} pcs</strong>
            </div>
          </div>

          {/* varian */}
          <div className="mt-4">
            {p.variants.map(v => (
              <div key={v.name} className="mb-3">
                <div className="d-flex align-items-baseline gap-2 mb-2">
                  <span className="form-label mb-0">{v.name}</span>
                  <span className="ta-xs ta-faint">{variant[v.name] || 'pilih salah satu'}</span>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {v.options.map(o => (
                    <button key={o} className={`ta-chip ${variant[v.name] === o ? 'active' : ''}`}
                      onClick={() => setVariant(x => ({ ...x, [v.name]: o }))}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* jumlah + total */}
          <div className="row g-3 align-items-end">
            <div className="col-auto">
              <label className="form-label">Jumlah</label>
              <QtyStepper value={qty} onChange={setQty} min={1} max={p.stock} step={p.moq} />
              <div className="ta-xs ta-faint mt-1">disarankan kelipatan {p.moq}</div>
            </div>
            <div className="col">
              <label className="form-label">Subtotal pesanan</label>
              <div className="ta-display" style={{ fontSize: '1.5rem' }}>{usd(unit * qty)}</div>
              <div className="ta-xs ta-faint">{qty} × {usd(unit)} · {(p.weight * qty).toFixed(2)} kg</div>
            </div>
          </div>

          {/* estimasi ongkir */}
          <div className="ta-card mt-4">
            <div className="ta-card-head"><h6><i className="bi bi-truck me-2" />Estimasi ongkos kirim</h6>
              <span className="ta-xs ta-faint">tarif dari API kurir</span></div>
            <div className="ta-card-pad">
              <div className="row g-2 mb-3">
                <div className="col-sm-7">
                  <label className="form-label">Dikirim ke</label>
                  <select className="form-select form-select-sm" value={dest} onChange={e => setDest(e.target.value)}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-sm-5">
                  <label className="form-label">Berat dihitung</label>
                  <input className="form-control form-control-sm" readOnly value={`${(p.weight * qty).toFixed(2)} kg`} />
                </div>
              </div>
              <div className="d-grid gap-2">
                {availableProviders.map(x => {
                  const cost = quote(x.id, state.providers, p.weight * qty);
                  return (
                    <label key={x.id} className={`ta-ship-option d-flex align-items-center gap-3 ${carrier === x.id ? 'active' : ''}`}>
                      <input className="form-check-input mt-0" type="radio" name="carrier" checked={carrier === x.id}
                        onChange={() => setCarrier(x.id)} />
                      <ProviderLogo code={x.logo} />
                      <div className="flex-grow-1">
                        <div className="ta-sm fw-semibold">{x.name}</div>
                        <div className="ta-xs ta-faint">{x.service} · {x.etaMin}-{x.etaMax} hari kerja</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-semibold">{usd(cost)}</div>
                        <div className="ta-xs ta-faint">ke {dest.split(' ')[0]}</div>
                      </div>
                    </label>
                  );
                })}
                {!availableProviders.length && <div className="ta-sm ta-faint">Kios ini belum mengaktifkan kurir mana pun.</div>}
              </div>
              <div className="d-flex justify-content-between mt-3 pt-3 ta-sm" style={{ borderTop: '1px solid var(--ta-line-soft)' }}>
                <span className="ta-muted">Perkiraan total sampai tujuan</span>
                <strong>{usd(unit * qty + shipCost)}</strong>
              </div>
              <div className="ta-xs ta-faint mt-1">
                Belum termasuk bea masuk negara tujuan. {prov?.name} mengantar dalam {prov?.etaMin}-{prov?.etaMax} hari kerja setelah paket dipindai di gerai.
              </div>
            </div>
          </div>

          {/* tombol aksi */}
          <div className="d-flex gap-2 mt-4 flex-wrap">
            <button className="btn btn-ta btn-lg flex-grow-1" onClick={() => addToCart(true)}>
              <i className="bi bi-lightning-charge-fill me-1" />Beli sekarang
            </button>
            <button className="btn btn-ta-outline btn-lg flex-grow-1" onClick={() => addToCart(false)}>
              <i className="bi bi-cart-plus me-1" />Masukkan keranjang
            </button>
            <button className="btn btn-ta-outline btn-lg" onClick={() => {
              dispatch({ type: 'wishlist:toggle', productId: p.id });
              toast(saved ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist', 'info');
            }} aria-label="Wishlist">
              <i className={`bi ${saved ? 'bi-heart-fill' : 'bi-heart'}`} style={{ color: saved ? 'var(--ta-danger)' : undefined }} />
            </button>
          </div>

          {/* kartu penjual */}
          <div className="ta-card ta-card-pad mt-3 d-flex align-items-center gap-3 flex-wrap">
            <span className="ta-avatar ta-avatar-lg">{s.name.slice(0, 2).toUpperCase()}</span>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="d-flex align-items-center gap-2">
                <Link to={`/search?seller=${s.id}`} className="fw-semibold" style={{ color: 'var(--ta-ink)' }}>{s.name}</Link>
                {s.status === 'verified' && <span className="ta-crest"><i className="bi bi-patch-check-fill" />Terverifikasi</span>}
              </div>
              <div className="ta-xs ta-faint">{s.block} · dikirim dari Jakarta, Indonesia</div>
            </div>
            <div className="d-flex gap-3 ta-xs text-center">
              <div><div className="fw-bold" style={{ fontSize: '.95rem' }}>{s.rating}</div><div className="ta-faint">rating</div></div>
              <div><div className="fw-bold" style={{ fontSize: '.95rem' }}>{s.shipOnTime}%</div><div className="ta-faint">tepat waktu</div></div>
              <div><div className="fw-bold" style={{ fontSize: '.95rem' }}>{s.responseRate}%</div><div className="ta-faint">balas chat</div></div>
            </div>
            <Link to="/messages" className="btn btn-ta-outline btn-sm"><i className="bi bi-chat-dots me-1" />Chat</Link>
          </div>
        </div>
      </div>

      {/* ---------------- tab detail ---------------- */}
      <div className="ta-card mt-4">
        <div className="ta-tabs mb-0 px-3 pt-2">
          {[['desc', 'Deskripsi'], ['specs', 'Spesifikasi'], ['ship', 'Pengiriman & bea cukai'], ['rev', `Ulasan (${p.reviews})`]].map(([k, l]) => (
            <button key={k} className={`ta-tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="ta-card-pad">
          {tab === 'desc' && (
            <div style={{ maxWidth: 820 }}>
              <p className="ta-muted">{p.desc}</p>
              <p className="ta-muted mb-0">
                Semua barang diperiksa di kios dan diperiksa ulang di gerai TAGlobal sebelum diekspor.
                Campur ukuran dan warna dalam satu karton diperbolehkan tanpa biaya tambahan. Untuk pesanan
                di atas {p.moq * 20} pcs, hubungi penjual untuk penawaran khusus dan penandaan karton tersendiri.
              </p>
              <div className="row g-3 mt-4">
                {p.images.map((src, i) => (
                  <div key={i} className="col-6 col-md-3">
                    <img src={src} alt="" className="w-100" style={{ borderRadius: 'var(--ta-radius-sm)', border: '1px solid var(--ta-line)' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'specs' && (
            <div className="row g-4" style={{ maxWidth: 760 }}>
              <div className="col-md-6">
                <dl className="mb-0">
                  {p.specs.map(([k, v]) => (
                    <div key={k} className="ta-kv" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                      <dt>{k}</dt><dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="col-md-6">
                <dl className="mb-0">
                  <div className="ta-kv" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}><dt>Kategori</dt><dd>{p.category}</dd></div>
                  <div className="ta-kv" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}><dt>Sub-kategori</dt><dd>{p.sub}</dd></div>
                  <div className="ta-kv" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}><dt>Stok tersedia</dt><dd>{num(p.stock)} pcs</dd></div>
                  <div className="ta-kv" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}><dt>Varian</dt><dd>{p.variants.map(v => v.options.length).reduce((a, b) => a * b)} kombinasi</dd></div>
                  <div className="ta-kv"><dt>Waktu proses</dt><dd>{state.handlingDays} hari</dd></div>
                </dl>
              </div>
            </div>
          )}
          {tab === 'ship' && (
            <div style={{ maxWidth: 820 }}>
              <div className="table-responsive">
                <table className="ta-table">
                  <thead><tr><th>Kurir</th><th>Layanan</th><th>Estimasi</th><th>0,5 kg pertama</th><th>Per kg lanjutan</th><th>Pelacakan</th></tr></thead>
                  <tbody>
                    {availableProviders.map(x => (
                      <tr key={x.id}>
                        <td><div className="d-flex align-items-center gap-2"><ProviderLogo code={x.logo} /><strong>{x.name}</strong></div></td>
                        <td className="ta-muted">{x.service}</td>
                        <td>{x.etaMin}-{x.etaMax} hari</td>
                        <td>{usd(x.baseRate)}</td>
                        <td>{usd(x.perKg)}</td>
                        <td><span className="ta-badge ta-badge-ok">Sampai tujuan</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="row g-3 mt-4">
                {[
                  ['bi-file-earmark-text', 'Dokumen bea cukai', 'Invoice komersial, packing list dan deklarasi kode HS dibuat TAGlobal dan ditempel pada karton.'],
                  ['bi-shop-window', 'Konsolidasi di gerai', 'Penjual mengantar paket ke gerai di bloknya; hub kami mengonsolidasi dan menyerahkan ke kurir sore harinya.'],
                  ['bi-cash-coin', 'Bea masuk & pajak', 'Dikirim dengan skema DAP — bea masuk dan PPN lokal dibayar pembeli saat barang tiba.'],
                ].map(([i, t, d]) => (
                  <div key={t} className="col-md-4">
                    <i className={`bi ${i}`} style={{ fontSize: '1.3rem', color: 'var(--ta-brand)' }} />
                    <div className="fw-semibold mt-2">{t}</div>
                    <div className="ta-sm ta-muted">{d}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'rev' && (
            <div className="row g-4">
              <div className="col-lg-3">
                <div className="ta-display">{p.rating.toFixed(1)}</div>
                <Rating value={p.rating} />
                <div className="ta-xs ta-faint mt-1">{num(p.reviews)} ulasan terverifikasi</div>
                <div className="mt-3">
                  {[5, 4, 3, 2, 1].map(st => {
                    const pct = st === 5 ? 78 : st === 4 ? 16 : st === 3 ? 4 : st === 2 ? 1 : 1;
                    return (
                      <div key={st} className="d-flex align-items-center gap-2 py-1">
                        <span className="ta-xs" style={{ width: 28 }}>{st} <i className="bi bi-star-fill ta-stars" /></span>
                        <span className="ta-barrow-track"><span className="ta-barrow-fill" style={{ width: `${pct}%` }} /></span>
                        <span className="ta-xs ta-faint" style={{ width: 30, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="col-lg-9">
                {reviews.length === 0 && <Empty icon="bi-chat-square-quote" title="Belum ada ulasan tertulis untuk produk ini" />}
                {reviews.map(r => (
                  <div key={r.id} className="pb-3 mb-3" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="ta-avatar">{r.buyer.slice(0, 2).toUpperCase()}</span>
                      <div>
                        <div className="ta-sm fw-semibold">{r.buyer} <span className="ta-xs ta-faint fw-normal">· {r.country}</span></div>
                        <Rating value={r.rating} />
                      </div>
                      <span className="ms-auto ta-xs ta-faint">{r.date}</span>
                    </div>
                    <div className="ta-sm ta-muted mt-2">{r.text}</div>
                    <div className="ta-xs ta-faint mt-1">Varian: {r.variant}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- produk terkait ---------------- */}
      <div className="mt-5">
        <h2 style={{ fontSize: '1.125rem' }} className="mb-3">Lainnya dari {p.category}</h2>
        <div className="row g-3">
          {related.map(x => <div key={x.id} className="col-6 col-md-4 col-lg-2"><ProductCard product={x} /></div>)}
        </div>
      </div>
    </main>
  );
}

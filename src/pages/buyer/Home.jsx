import React from 'react';
import { Link } from 'react-router-dom';
import { useStore, num } from '../../data/store';
import { CATEGORIES, HUBS } from '../../data/mock';
import ProductCard from '../../components/ProductCard';
import { Rating, MarketCrest } from '../../components/ui';

function SectionHead({ title, sub, to }) {
  return (
    <div className="d-flex align-items-end justify-content-between mb-3">
      <div>
        <h2 className="ta-sec-title" style={{ fontSize: '1.125rem', margin: 0 }}>{title}</h2>
        {sub && <div className="ta-sm ta-faint mt-1">{sub}</div>}
      </div>
      {to && <Link to={to} className="ta-sm fw-semibold">Lihat semua <i className="bi bi-chevron-right" style={{ fontSize: '.7rem' }} /></Link>}
    </div>
  );
}

export default function Home() {
  const { state } = useStore();
  const active = state.products.filter(p => p.status === 'active');
  const deals = active.filter(p => p.oldPrice).slice(0, 6);
  const best = [...active].sort((a, b) => b.sold - a.sold).slice(0, 12);
  const topSellers = [...state.sellers].filter(s => s.status === 'verified').sort((a, b) => b.sales30d - a.sales30d).slice(0, 4);

  return (
    <main className="container py-4">

      {/* ---------------- hero ---------------- */}
      <div className="row g-3">
        <div className="col-lg-3 d-none d-lg-block">
          <div className="ta-card h-100" style={{ overflow: 'hidden' }}>
            <div className="ta-card-head"><h6>Kategori</h6></div>
            <div>
              {CATEGORIES.map(c => (
                <Link key={c.id} to={`/search?cat=${encodeURIComponent(c.name)}`}
                  className="d-flex align-items-center gap-2 px-3 py-2 ta-link-quiet ta-sm"
                  style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                  <i className={`bi ${c.icon}`} style={{ width: 18, color: 'var(--ta-brand)' }} />
                  <span className="flex-grow-1 text-truncate">{c.name}</span>
                  <i className="bi bi-chevron-right ta-faint" style={{ fontSize: '.65rem' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="ta-hero ta-lattice ta-archband h-100 p-4 p-xl-5 d-flex flex-column justify-content-center">
            <div className="d-flex align-items-center gap-2 mb-2">
              <MarketCrest size={34} color="var(--ta-accent)" />
              <div className="ta-hero-kicker mb-0">Tanah Abang Â· Jakarta</div>
            </div>
            <h1 className="ta-display text-white mb-2" style={{ maxWidth: 420 }}>
              Pasar tekstil terbesar Asia Tenggara, dikirim sampai ke rumah Anda
            </h1>
            <p className="mb-4" style={{ color: 'rgba(255,255,255,.78)', maxWidth: 440 }}>
              Harga grosir langsung dari kios. Kemasan siap ekspor, DHL Â· FedEx Â· EMS
              ditangani jaringan gerai kami. Menjangkau 180+ negara tujuan.
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <Link to="/search" className="btn btn-ta-accent btn-lg">Mulai belanja</Link>
              <Link to="/seller" className="btn btn-lg"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.35)', color: '#fff' }}>
                Jualan di TAGlobal
              </Link>
            </div>
            <div className="d-flex gap-4 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,.14)' }}>
              {[['1.074', 'Penjual terverifikasi'], ['38rb+', 'Produk'], ['180+', 'Negara']].map(([v, l]) => (
                <div key={l}>
                  <div className="text-white fw-bold" style={{ fontSize: '1.15rem' }}>{v}</div>
                  <div className="ta-xs" style={{ color: 'rgba(255,255,255,.6)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-3">
          <div className="d-grid gap-3 h-100">
            <div className="ta-card ta-card-pad">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="ta-avatar"><i className="bi bi-person" /></span>
                <div>
                  <div className="ta-sm fw-semibold">Selamat datang kembali</div>
                  <div className="ta-xs ta-faint">{state.user.email}</div>
                </div>
              </div>
              <div className="d-grid gap-2">
                <Link to="/orders" className="btn btn-ta btn-sm">Pesanan saya</Link>
                <Link to="/track" className="btn btn-ta-outline btn-sm">Lacak paket</Link>
              </div>
            </div>
            <div className="ta-card ta-card-pad" style={{ background: 'var(--ta-accent-soft)', borderColor: '#eedfc2' }}>
              <div className="ta-eyebrow" style={{ color: 'var(--ta-accent)' }}>Voucher</div>
              <div className="fw-bold mt-1" style={{ fontSize: '1.05rem' }}>Diskon 10% di atas $50</div>
              <div className="ta-xs ta-muted mb-2">Seluruh marketplace Â· berlaku sampai 31 Des 2026</div>
              <div className="ta-code-box bg-white">TANAHABANG10</div>
            </div>
            <div className="ta-card ta-card-pad">
              <div className="ta-eyebrow mb-2">Mitra pengiriman</div>
              <div className="d-flex gap-2 flex-wrap">
                {state.providers.filter(p => p.active).map(p => <span key={p.id} className="ta-logo-chip">{p.logo}</span>)}
              </div>
              <div className="ta-xs ta-faint mt-2">Tarif langsung saat checkout</div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- strip kepercayaan ---------------- */}
      <div className="ta-card mt-3">
        <div className="row g-0">
          {[
            ['bi-shield-check', 'Jaminan pembeli', 'Dana kembali bila paket tidak sampai'],
            ['bi-truck', 'Banyak pilihan kurir', 'DHL, FedEx, EMS dan UPS saat checkout'],
            ['bi-shop-window', 'Jaringan gerai', 'Penjual tinggal antar, kami yang ekspor'],
            ['bi-credit-card-2-front', 'Visa & Mastercard', 'Pembayaran dengan 3-D Secure'],
          ].map(([icon, t, s], i) => (
            <div key={t} className="col-6 col-lg-3 d-flex align-items-center gap-3 p-3"
              style={{ borderRight: i < 3 ? '1px solid var(--ta-line-soft)' : 'none' }}>
              <i className={`bi ${icon}`} style={{ fontSize: '1.4rem', color: 'var(--ta-brand)' }} />
              <div>
                <div className="ta-sm fw-semibold">{t}</div>
                <div className="ta-xs ta-faint">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- promo ---------------- */}
      <div className="mt-5">
        <SectionHead title="Promo grosir minggu ini" sub="Lot diskon dari kios terverifikasi" to="/search?sort=best" />
        <div className="row g-3">
          {deals.map(p => (
            <div key={p.id} className="col-6 col-md-4 col-lg-2"><ProductCard product={p} /></div>
          ))}
        </div>
      </div>

      {/* ---------------- kategori ---------------- */}
      <div className="mt-5">
        <SectionHead title="Belanja per kategori" sub="Semua yang dijual di lantai pasar, tertata rapi" />
        <div className="row g-3">
          {CATEGORIES.map(c => (
            <div key={c.id} className="col-6 col-md-3">
              <Link to={`/search?cat=${encodeURIComponent(c.name)}`} className="ta-card ta-card-category ta-cat-tile d-block h-100 p-2" style={{ overflow: 'hidden' }}>
                <div className="ta-arch-top">
                  <img src={c.image} alt="" style={{ width: '100%', height: 104, objectFit: 'cover', display: 'block' }} />
                </div>
                <div className="px-2 pt-2 pb-1 text-center">
                  <div className="fw-semibold ta-sm">{c.name}</div>
                  <div className="ta-xs ta-faint text-truncate">{c.sub.slice(0, 3).join(' · ')}</div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- terlaris ---------------- */}
      <div className="mt-5">
        <SectionHead title="Terlaris di seluruh dunia" sub="Diurutkan dari jumlah unit diekspor 30 hari terakhir" to="/search" />
        <div className="row g-3">
          {best.map(p => (
            <div key={p.id} className="col-6 col-md-4 col-lg-2"><ProductCard product={p} /></div>
          ))}
        </div>
      </div>

      {/* ---------------- kios terbaik ---------------- */}
      <div className="mt-5">
        <SectionHead title="Kios dengan rating terbaik" sub="Pedagang terverifikasi dengan rekam jejak ekspor" />
        <div className="row g-3">
          {topSellers.map(s => (
            <div key={s.id} className="col-md-6 col-lg-3">
              <div className="ta-card ta-card-pad h-100">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="ta-avatar ta-avatar-lg">{s.name.slice(0, 2).toUpperCase()}</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-semibold ta-sm text-truncate">{s.name}</div>
                    <div className="ta-xs ta-faint text-truncate">{s.block}</div>
                  </div>
                </div>
                <Rating value={s.rating} count={s.reviews} />
                <hr className="ta-sep my-3" />
                <div className="d-flex justify-content-between ta-xs ta-muted">
                  <span>{s.products} produk</span>
                  <span>{num(s.sales30d)} terjual / 30h</span>
                </div>
                <Link to={`/search?seller=${s.id}`} className="btn btn-ta-outline btn-sm w-100 mt-3">Kunjungi kios</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- alur pengiriman ---------------- */}
      <div className="mt-5">
        <SectionHead title="Bagaimana paket sampai ke Anda" sub="Dari kios di Tanah Abang sampai alamat Anda" />
        <div className="ta-card ta-card-pad">
          <div className="row g-4">
            {[
              ['01', 'Anda pesan & bayar', 'Visa atau Mastercard dengan 3-D Secure. Dana ditahan sampai penjual menerima pesanan.'],
              ['02', 'Penjual mengemas', 'Kios memastikan stok dan mengemas dengan bahan kualitas ekspor.'],
              ['03', 'Antar ke gerai', 'Penjual membawa paket ke loket TAGlobal terdekat sebelum pukul 15:00.'],
              ['04', 'Kami ekspor & lacak', 'Hub mengonsolidasi, kurir menjemput, Anda memantau setiap pemindaian.'],
            ].map(([n, t, d]) => (
              <div key={n} className="col-md-6 col-lg-3">
                <div className="ta-eyebrow" style={{ color: 'var(--ta-accent)' }}>{n}</div>
                <div className="fw-semibold mt-1">{t}</div>
                <div className="ta-sm ta-muted mt-1">{d}</div>
              </div>
            ))}
          </div>
          <div className="ta-rule my-4"><i /></div>
          <div className="ta-eyebrow mb-2">Loket gerai kami</div>
          <div className="row g-2">
            {HUBS.map(h => (
              <div key={h.id} className="col-md-6 col-lg-3">
                <div className="ta-flat p-3 h-100">
                  <div className="ta-sm fw-semibold">{h.name.replace('TAGlobal ', '')}</div>
                  <div className="ta-xs ta-faint mt-1">{h.address}</div>
                  <div className="ta-xs ta-muted mt-2"><i className="bi bi-clock me-1" />{h.open} Â· cut-off {h.cutoff}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- wishlist ---------------- */}
      <div className="mt-5">
        <SectionHead title="Disimpan untuk nanti" sub="Barang di wishlist Anda" to="/account" />
        <div className="row g-3">
          {state.wishlist.map(id => {
            const p = state.products.find(x => x.id === id);
            return p ? <div key={id} className="col-6 col-md-4 col-lg-2"><ProductCard product={p} /></div> : null;
          })}
          {!state.wishlist.length && (
            <div className="col-12"><div className="ta-card"><div className="ta-empty"><i className="bi bi-heart" />Belum ada barang yang disimpan</div></div></div>
          )}
        </div>
      </div>

      {/* ---------------- ajakan penjual ---------------- */}
      <div className="ta-cream-panel mt-5 p-4 p-lg-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-2">
              <MarketCrest size={26} color="var(--ta-brand)" opacity={0.8} />
              <div className="ta-eyebrow mb-0" style={{ color: 'var(--ta-brand)' }}>Untuk pedagang Tanah Abang</div>
            </div>
            <h3 className="mt-2 mb-2">Kios Anda, kini terbuka untuk 180 negara</h3>
            <p className="ta-muted mb-0" style={{ maxWidth: 620 }}>
              Unggah katalog Anda, pilih kurir yang ingin ditawarkan, lalu antar pesanan yang sudah
              dikemas ke gerai di blok Anda. TAGlobal mengurus dokumen ekspor, data bea cukai dan pelacakan.
              Pencairan dana setiap Senin ke rekening bank Indonesia Anda.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <Link to="/seller" className="btn btn-ta btn-lg">Buka Toko Saya</Link>
            <div className="ta-xs ta-faint mt-2">Tanpa biaya pasang iklan Â· komisi 4% per pesanan</div>
          </div>
        </div>
      </div>
    </main>
  );
}


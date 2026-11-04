import React, { useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import $ from 'jquery';
import { useStore } from '../data/store';
import { CATEGORIES } from '../data/mock';
import { useClickOutside, Toasts, MarketCrest } from '../components/ui';
import AuthModal from '../components/AuthModal';

/** Menu akun di kanan atas: memicu popup saat belum masuk. */
function AccountMenu({ onLogin }) {
  const { state, isAuthed, hasStore, dispatch, toast } = useStore();
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const nav = useNavigate();
  useClickOutside(box, () => setOpen(false));

  if (!isAuthed) {
    return (
      <button className="ta-nav-icon border-0 bg-transparent" onClick={onLogin}>
        <i className="bi bi-person" />
        <span className="d-none d-lg-block">Masuk</span>
      </button>
    );
  }

  const go = to => { setOpen(false); nav(to); };

  return (
    <div className="position-relative" ref={box}>
      <button className="ta-nav-icon border-0 bg-transparent" onClick={() => setOpen(o => !o)}>
        <i className="bi bi-person-check" />
        <span className="d-none d-lg-block text-truncate" style={{ maxWidth: 72 }}>
          {state.account.name.split(' ')[0]}
        </span>
      </button>
      {open && (
        <div className="ta-card position-absolute end-0 mt-1" style={{ zIndex: 1045, width: 230, boxShadow: '0 8px 28px rgba(20,22,26,.12)' }}>
          <div className="p-3" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
            <div className="d-flex align-items-center gap-2">
              <span className="ta-avatar">{state.account.name.slice(0, 2).toUpperCase()}</span>
              <div style={{ minWidth: 0 }}>
                <div className="ta-sm fw-semibold text-truncate">{state.account.name}</div>
                <div className="ta-xs ta-faint text-truncate">{state.account.email}</div>
              </div>
            </div>
          </div>
          {hasStore && (
            <button className="ta-side-link w-100" style={{ borderRadius: 0 }} onClick={() => go('/seller')}>
              <i className="bi bi-shop" />
              <span className="flex-grow-1 text-start">Toko Saya</span>
              <span className="ta-badge ta-badge-accent" style={{ fontSize: '.656rem' }}>Penjual</span>
            </button>
          )}
          {!hasStore && (
            <button className="ta-side-link w-100" style={{ borderRadius: 0 }}
              onClick={() => { setOpen(false); toast('Pendaftaran toko dibuka (prototipe)', 'info'); }}>
              <i className="bi bi-shop-window" />
              <span className="flex-grow-1 text-start">Buka toko</span>
            </button>
          )}
          <button className="ta-side-link w-100" style={{ borderRadius: 0 }} onClick={() => go('/account')}>
            <i className="bi bi-person" /><span className="flex-grow-1 text-start">Akun saya</span>
          </button>
          <button className="ta-side-link w-100" style={{ borderRadius: 0 }} onClick={() => go('/orders')}>
            <i className="bi bi-box-seam" /><span className="flex-grow-1 text-start">Pesanan saya</span>
          </button>
          <button className="ta-side-link w-100" style={{ borderRadius: 0 }} onClick={() => go('/messages')}>
            <i className="bi bi-chat-dots" /><span className="flex-grow-1 text-start">Pesan</span>
          </button>
          <button className="ta-side-link w-100" style={{ borderRadius: 0, color: 'var(--ta-danger)' }}
            onClick={() => { setOpen(false); dispatch({ type: 'auth:logout' }); toast('Anda telah keluar', 'info'); nav('/'); }}>
            <i className="bi bi-box-arrow-right" /><span className="flex-grow-1 text-start">Keluar</span>
          </button>
        </div>
      )}
    </div>
  );
}

function SearchBox() {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const nav = useNavigate();
  useClickOutside(box, () => setOpen(false));

  const hits = q.trim().length < 2 ? [] : state.products
    .filter(p => p.status === 'active' && p.title.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 6);

  const go = e => {
    e.preventDefault();
    setOpen(false);
    // jQuery blur supaya keyboard ponsel tertutup saat pencarian dikirim
    $(box.current).find('input').trigger('blur');
    nav(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="position-relative flex-grow-1" ref={box}>
      <form className="input-group ta-search" onSubmit={go} role="search">
        <input
          className="form-control" placeholder="Cari hijab, batik, kain roll, paket grosir…"
          value={q} onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)} aria-label="Cari produk"
        />
        <button className="btn btn-ta px-3" type="submit" aria-label="Cari">
          <i className="bi bi-search" />
        </button>
      </form>
      {open && hits.length > 0 && (
        <div className="ta-card position-absolute w-100 mt-1" style={{ zIndex: 1040, boxShadow: '0 8px 28px rgba(20,22,26,.1)' }}>
          {hits.map(p => (
            <Link key={p.id} to={`/product/${p.id}`} onClick={() => setOpen(false)}
              className="d-flex align-items-center gap-2 px-3 py-2 ta-link-quiet"
              style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
              <img src={p.images[0]} className="ta-thumb" alt="" style={{ width: 32, height: 32 }} />
              <span className="ta-sm text-truncate">{p.title}</span>
            </Link>
          ))}
          <button className="btn btn-ta-ghost btn-sm w-100" onClick={go}>
            Lihat semua hasil untuk “{q}”
          </button>
        </div>
      )}
    </div>
  );
}

export default function StoreLayout() {
  const { cartCount, state, isAuthed, hasStore } = useStore();
  const [authOpen, setAuthOpen] = useState(false);
  const unread = state.threads.reduce((a, t) => a + (t.unread || 0), 0);

  return (
    <>
      {/* ------- strip atas ------- */}
      <div className="ta-topbar py-1">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <span><i className="bi bi-geo-alt me-1" />Kirim ke: <strong className="text-white">{state.user.country}</strong></span>
            <span className="d-none d-md-inline"><i className="bi bi-translate me-1" />ID / USD</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            {isAuthed ? (
              <>
                {hasStore && <Link to="/seller" className="d-none d-sm-inline"><i className="bi bi-shop me-1" />Toko Saya</Link>}
                <span className="d-none d-sm-inline">Halo, {state.account.name.split(' ')[0]}</span>
              </>
            ) : (
              <button className="btn btn-ta-ghost btn-sm p-0 border-0"
                style={{ color: 'rgba(255,255,255,.82)', fontSize: '.75rem' }}
                onClick={() => setAuthOpen(true)}>
                Masuk / Daftar
              </button>
            )}
            <Link to="/help">Bantuan</Link>
          </div>
        </div>
      </div>

      {/* ------- navigasi utama ------- */}
      <div className="ta-nav py-2 sticky-top">
        <div className="container d-flex align-items-center gap-3">
          <Link to="/" className="ta-logo">TA<span>Global</span></Link>
          <SearchBox />
          <div className="d-flex align-items-center">
            <Link to="/messages" className="ta-nav-icon position-relative">
              <i className="bi bi-chat-dots" />
              <span className="d-none d-lg-block">Pesan</span>
              {unread > 0 && <span className="ta-cart-dot">{unread}</span>}
            </Link>
            <Link to="/orders" className="ta-nav-icon d-none d-md-inline-flex">
              <i className="bi bi-box-seam" />
              <span className="d-none d-lg-block">Pesanan</span>
            </Link>
            <AccountMenu onLogin={() => setAuthOpen(true)} />
            <Link to="/cart" className="ta-nav-icon position-relative">
              <i className="bi bi-cart3" />
              <span className="d-none d-lg-block">Keranjang</span>
              {cartCount > 0 && <span className="ta-cart-dot">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* ------- bar kategori ------- */}
      <div className="ta-catbar">
        <div className="container ta-scroll-x">
          <div className="d-flex gap-4" style={{ whiteSpace: 'nowrap' }}>
            <NavLink to="/search" className="fw-semibold" style={{ color: 'var(--ta-brand)' }}>
              <i className="bi bi-grid-3x3-gap me-1" />Semua kategori
            </NavLink>
            {CATEGORIES.slice(0, 6).map(c => (
              <Link key={c.id} to={`/search?cat=${encodeURIComponent(c.name)}`}>{c.name}</Link>
            ))}
            <Link to="/search?sort=best" style={{ color: 'var(--ta-accent)' }}>Promo grosir</Link>
          </div>
        </div>
      </div>

      <Outlet />

      {/* ------- footer ------- */}
      <footer className="ta-footer">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <MarketCrest size={30} color="var(--ta-brand)" opacity={0.85} />
                <div className="ta-logo">TA<span>Global</span></div>
              </div>
              <p className="ta-sm ta-muted mb-3" style={{ maxWidth: 320 }}>
                Pintu ekspor bagi pedagang Tanah Abang. Unggah sekali, jangkau 180+ negara,
                antar paket ke gerai terdekat, sisanya kami yang urus.
              </p>
              <div className="d-flex gap-2">
                <span className="ta-logo-chip">VISA</span>
                <span className="ta-logo-chip">MC</span>
                <span className="ta-logo-chip">DHL</span>
                <span className="ta-logo-chip">FEDEX</span>
                <span className="ta-logo-chip">EMS</span>
              </div>
            </div>
            <div className="col-6 col-lg-2">
              <h6>Belanja</h6>
              <Link to="/search">Semua kategori</Link>
              <Link to="/orders">Pesanan saya</Link>
              <Link to="/track">Lacak paket</Link>
              <Link to="/help">Jaminan pembeli</Link>
            </div>
            <div className="col-6 col-lg-2">
              <h6>Jualan</h6>
              {isAuthed
                ? <Link to="/seller">Toko Saya</Link>
                : <button className="btn btn-ta-ghost btn-sm p-0 border-0 ta-sm" onClick={() => setAuthOpen(true)}>Buka toko</button>}
              <Link to="/help">Cara mulai berjualan</Link>
              <Link to="/help">Biaya &amp; komisi</Link>
              <Link to="/help">Panduan gerai</Link>
            </div>
            <div className="col-6 col-lg-2">
              <h6>Perusahaan</h6>
              <Link to="/help">Tentang TAGlobal</Link>
              <Link to="/help">Lokasi gerai</Link>
              <Link to="/help">Karier</Link>
              <Link to="/help">Kontak</Link>
            </div>
            <div className="col-6 col-lg-2">
              <h6>Bantuan</h6>
              <Link to="/messages">Hubungi CS</Link>
              <Link to="/help">Pengiriman &amp; bea cukai</Link>
              <Link to="/help">Pengembalian barang</Link>
              <Link to="/help">Syarat &amp; privasi</Link>
            </div>
          </div>
          <hr className="ta-sep my-4" />
          <div className="d-flex justify-content-between flex-wrap gap-2 ta-xs ta-faint">
            <span>© 2026 TAGlobal Marketplace · PT Tanah Abang Global Niaga, Jakarta</span>
            <span>Prototipe frontend · data tiruan</span>
          </div>
        </div>
      </footer>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <Toasts />
    </>
  );
}

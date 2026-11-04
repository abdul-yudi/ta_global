import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, usd, num } from '../../data/store';
import { COUNTRIES } from '../../data/mock';
import ProductCard from '../../components/ProductCard';
import { StatusBadge, Empty } from '../../components/ui';

const TABS = [
  { id: 'profile', label: 'Profil', icon: 'bi-person' },
  { id: 'address', label: 'Alamat', icon: 'bi-geo-alt' },
  { id: 'cards', label: 'Metode pembayaran', icon: 'bi-credit-card' },
  { id: 'vouchers', label: 'Voucher', icon: 'bi-ticket-perforated' },
  { id: 'wishlist', label: 'Wishlist', icon: 'bi-heart' },
];

export default function Account() {
  const { state, toast, dispatch, isAuthed, hasStore } = useStore();
  const nav = useNavigate();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ ...state.user, phone: '+971 50 123 4567', company: 'Yusuf Boutique FZE' });

  const spent = state.orders.reduce((a, o) => a + o.total, 0);

  return (
    <main className="container py-4">
      <div className="row g-3">
        <div className="col-lg-3">
          <div className="ta-card ta-card-pad text-center">
            <span className="ta-avatar ta-avatar-lg mx-auto" style={{ width: 64, height: 64, fontSize: '1.2rem' }}>
              {state.user.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="fw-semibold mt-2">{state.user.name}</div>
            <div className="ta-xs ta-faint">{state.user.email}</div>
            <span className="ta-badge ta-badge-ok mt-2"><i className="bi bi-patch-check-fill" />Pembeli terverifikasi</span>
            <hr className="ta-sep my-3" />
            <div className="row g-2 text-center">
              <div className="col-6">
                <div className="fw-bold">{state.orders.length}</div>
                <div className="ta-xs ta-faint">pesanan</div>
              </div>
              <div className="col-6">
                <div className="fw-bold">{usd(spent).replace('.00', '')}</div>
                <div className="ta-xs ta-faint">total belanja</div>
              </div>
            </div>
          </div>

          <div className="ta-card mt-3" style={{ overflow: 'hidden' }}>
            {TABS.map(t => (
              <button key={t.id} className={`ta-side-link w-100 ${tab === t.id ? 'active' : ''}`}
                style={{ borderRadius: 0 }} onClick={() => setTab(t.id)}>
                <i className={`bi ${t.icon}`} />{t.label}
              </button>
            ))}
            <Link to="/orders" className="ta-side-link" style={{ borderRadius: 0 }}><i className="bi bi-box-seam" />Pesanan saya</Link>
            <Link to="/messages" className="ta-side-link" style={{ borderRadius: 0 }}><i className="bi bi-chat-dots" />Pesan</Link>
            {hasStore && (
              <Link to="/seller" className="ta-side-link" style={{ borderRadius: 0 }}>
                <i className="bi bi-shop" />Toko Saya
              </Link>
            )}
            {isAuthed && (
              <button className="ta-side-link w-100" style={{ borderRadius: 0, color: 'var(--ta-danger)' }}
                onClick={() => { dispatch({ type: 'auth:logout' }); toast('Anda telah keluar', 'info'); nav('/'); }}>
                <i className="bi bi-box-arrow-right" />Keluar
              </button>
            )}
          </div>
        </div>

        <div className="col-lg-9">
          {tab === 'profile' && (
            <div className="ta-card">
              <div className="ta-card-head"><h6>Profil</h6>
                <button className="btn btn-ta btn-sm" onClick={() => toast('Profil disimpan')}>Simpan perubahan</button></div>
              <div className="ta-card-pad">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nama lengkap</label>
                    <input className="form-control" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Nama perusahaan / toko</label>
                    <input className="form-control" value={profile.company} onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input className="form-control" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Telepon</label>
                    <input className="form-control" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Negara</label>
                    <select className="form-select" value={profile.country} onChange={e => setProfile(p => ({ ...p, country: e.target.value }))}>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tipe pembeli</label>
                    <select className="form-select" defaultValue="Grosir / reseller">
                      <option>Grosir / reseller</option>
                      <option>Butik eceran</option>
                      <option>Pemakaian pribadi</option>
                    </select>
                  </div>
                </div>
                <hr className="ta-sep my-4" />
                <div className="ta-eyebrow mb-2">Notifikasi</div>
                {[
                  ['Status pesanan dan pemindaian kurir', true],
                  ['Pesan dari penjual', true],
                  ['Info voucher dan promo grosir', false],
                  ['Buletin bulanan', false],
                ].map(([l, on]) => (
                  <div className="ta-toggle-row" key={l}>
                    <span className="ta-sm">{l}</span>
                    <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" defaultChecked={on} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'address' && (
            <div className="ta-card">
              <div className="ta-card-head"><h6>Alamat pengiriman</h6>
                <button className="btn btn-ta btn-sm" onClick={() => toast('Formulir alamat dibuka (prototipe)', 'info')}>
                  <i className="bi bi-plus-lg me-1" />Tambah alamat</button></div>
              <div className="ta-card-pad d-grid gap-2">
                {[
                  { label: 'Rumah', name: 'Amina Yusuf', line: 'Villa 24, Al Barsha 2, Dubai, Uni Emirat Arab', def: true },
                  { label: 'Gudang', name: 'Yusuf Boutique FZE', line: 'Unit B12, Jebel Ali Free Zone, Dubai, Uni Emirat Arab', def: false },
                ].map(a => (
                  <div key={a.label} className="ta-flat p-3 d-flex gap-3 align-items-start">
                    <i className="bi bi-geo-alt-fill" style={{ color: 'var(--ta-brand)' }} />
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold ta-sm">{a.label}</span>
                        {a.def && <span className="ta-badge ta-badge-ok">Utama</span>}
                      </div>
                      <div className="ta-sm">{a.name}</div>
                      <div className="ta-xs ta-faint">{a.line}</div>
                    </div>
                    <div className="d-flex gap-1">
                      <button className="btn btn-ta-outline btn-sm" onClick={() => toast('Ubah alamat (prototipe)', 'info')}><i className="bi bi-pencil" /></button>
                      <button className="btn btn-ta-danger btn-sm" onClick={() => toast('Alamat dihapus', 'warn')}><i className="bi bi-trash" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'cards' && (
            <div className="ta-card">
              <div className="ta-card-head"><h6>Metode pembayaran</h6>
                <button className="btn btn-ta btn-sm" onClick={() => toast('Formulir kartu dibuka (prototipe)', 'info')}>
                  <i className="bi bi-plus-lg me-1" />Tambah kartu</button></div>
              <div className="ta-card-pad d-grid gap-2">
                {[['VISA', 'Visa •••• 4242', '09/29', true], ['MC', 'Mastercard •••• 8810', '03/28', false]].map(([chip, label, exp, def]) => (
                  <div key={label} className="ta-flat p-3 d-flex align-items-center gap-3">
                    <span className="ta-logo-chip">{chip}</span>
                    <div className="flex-grow-1">
                      <div className="ta-sm fw-semibold">{label}</div>
                      <div className="ta-xs ta-faint">Berlaku sampai {exp}</div>
                    </div>
                    {def && <span className="ta-badge ta-badge-ok">Utama</span>}
                    <button className="btn btn-ta-danger btn-sm" onClick={() => toast('Kartu dihapus', 'warn')}><i className="bi bi-trash" /></button>
                  </div>
                ))}
                <div className="ta-flat p-3 ta-xs ta-muted">
                  <i className="bi bi-shield-lock me-1" />
                  Kartu ditokenisasi oleh payment gateway. TAGlobal hanya menyimpan empat digit terakhir.
                </div>
              </div>
            </div>
          )}

          {tab === 'vouchers' && (
            <div className="ta-card">
              <div className="ta-card-head"><h6>Voucher saya</h6></div>
              <div className="ta-card-pad row g-3">
                {state.vouchers.map(v => (
                  <div className="col-md-6" key={v.code}>
                    <div className="ta-flat p-3 h-100 d-flex gap-3">
                      <i className="bi bi-ticket-perforated-fill" style={{ fontSize: '1.4rem', color: 'var(--ta-accent)' }} />
                      <div>
                        <div className="fw-semibold">{v.code}</div>
                        <div className="ta-sm ta-muted">{v.label}</div>
                        <div className="ta-xs ta-faint mt-1">{v.scope} · min. belanja {usd(v.minSpend)} · sampai {v.expiry}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'wishlist' && (
            <div className="ta-card">
              <div className="ta-card-head"><h6>Wishlist</h6><span className="ta-xs ta-faint">{state.wishlist.length} barang</span></div>
              <div className="ta-card-pad">
                {!state.wishlist.length && <Empty icon="bi-heart" title="Belum ada barang yang disimpan" />}
                <div className="row g-3">
                  {state.wishlist.map(id => {
                    const p = state.products.find(x => x.id === id);
                    return p ? <div key={id} className="col-6 col-md-4 col-lg-3"><ProductCard product={p} /></div> : null;
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="ta-card mt-3">
            <div className="ta-card-head"><h6>Pesanan terbaru</h6><Link to="/orders" className="ta-xs">Lihat semua</Link></div>
            <div className="table-responsive">
              <table className="ta-table">
                <thead><tr><th>Pesanan</th><th>Jumlah</th><th>Total</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {state.orders.slice(0, 5).map(o => (
                    <tr key={o.id}>
                      <td className="ta-mono fw-semibold">{o.id}</td>
                      <td className="ta-sm">{num(o.items.reduce((a, i) => a + i.qty, 0))} pcs</td>
                      <td>{usd(o.total)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="text-end"><Link to={`/track/${o.id}`} className="btn btn-ta-outline btn-sm">Lacak</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, usd, num } from '../../data/store';
import { PageHead, Card, Empty, Modal, ConfirmDialog, Rating, useTableFilter } from '../../components/ui';

const STATUS_CLS = { verified: 'ta-badge-ok', pending: 'ta-badge-warn', suspended: 'ta-badge-danger' };
const STATUS_ID = { verified: 'terverifikasi', pending: 'menunggu', suspended: 'ditangguhkan' };
const PRODUCT_STATUS_ID = { active: 'tayang', draft: 'draf', review: 'ditinjau', rejected: 'ditolak' };

export default function AdminSellers() {
  const { state, dispatch, toast } = useStore();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const [view, setView] = useState(null);
  const [msg, setMsg] = useState(null);
  const [msgText, setMsgText] = useState('');

  useTableFilter('#admin-sellers', q);

  const list = state.sellers.filter(s => tab === 'all' || s.status === tab);
  const count = id => (id === 'all' ? state.sellers.length : state.sellers.filter(s => s.status === id).length);
  const productsOf = sid => state.products.filter(p => p.sellerId === sid);

  const save = async () => {
    await dispatch({ type: 'seller:update', seller: edit });
    toast(`${edit.name} diperbarui`);
    setEdit(null);
  };

  return (
    <>
      <PageHead eyebrow="Marketplace" title="Penjual"
        sub="Pantau setiap toko beserta katalognya â€” ubah, tangguhkan atau hapus">
        <div className="input-group input-group-sm" style={{ width: 250 }}>
          <span className="input-group-text"><i className="bi bi-search" /></span>
          <input className="form-control" placeholder="Cari nama, pemilik, blok" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <button className="btn btn-ta-outline btn-sm" onClick={() => toast('Ekspor data penjual diantrekan (prototipe)', 'info')}>
          <i className="bi bi-download me-1" />Ekspor
        </button>
      </PageHead>

      <div className="row g-3 mb-3">
        {[
          ['Total penjual', state.sellers.length, 'bi-shop'],
          ['Terverifikasi', count('verified'), 'bi-patch-check'],
          ['Menunggu verifikasi', count('pending'), 'bi-hourglass-split'],
          ['Ditangguhkan', count('suspended'), 'bi-slash-circle'],
        ].map(([l, v, i]) => (
          <div className="col-6 col-xl-3" key={l}>
            <div className="ta-stat d-flex align-items-center gap-3">
              <i className={`bi ${i}`} style={{ fontSize: '1.4rem', color: 'var(--ta-brand)' }} />
              <div>
                <div className="ta-stat-label">{l}</div>
                <div className="ta-stat-value" style={{ fontSize: '1.3rem', margin: 0 }}>{v}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="ta-tabs">
        {[['all', 'Semua'], ['verified', 'Terverifikasi'], ['pending', 'Menunggu'], ['suspended', 'Ditangguhkan']].map(([id, l]) => (
          <button key={id} className={`ta-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
            {l} <span className="ta-tab-n">({count(id)})</span>
          </button>
        ))}
      </div>

      <Card pad={false} title="Daftar penjual">
        {!list.length && <Empty icon="bi-shop" title="Tidak ada penjual di tampilan ini" />}
        {list.length > 0 && (
          <div className="ta-table-wrap">
            <table className="ta-table" id="admin-sellers">
              <thead>
                <tr><th>Penjual</th><th>Blok</th><th>Bergabung</th><th>Produk</th><th>Terjual 30h</th><th>Rating</th>
                  <th>Ketepatan</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {list.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="ta-avatar">{s.name.slice(0, 2).toUpperCase()}</span>
                        <div style={{ minWidth: 0 }}>
                          <div className="ta-sm fw-semibold">{s.name}</div>
                          <div className="ta-xs ta-faint">{s.owner} Â· {s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="ta-xs ta-faint">{s.block}</td>
                    <td className="ta-xs ta-faint">{s.joined}</td>
                    <td className="ta-num">{productsOf(s.id).length}</td>
                    <td className="ta-num">{num(s.sales30d)}</td>
                    <td><Rating value={s.rating} /></td>
                    <td>
                      <span className={`ta-badge ${s.shipOnTime >= 95 ? 'ta-badge-ok' : s.shipOnTime >= 85 ? 'ta-badge-warn' : 'ta-badge-danger'}`}>
                        {s.shipOnTime}%
                      </span>
                    </td>
                    <td><span className={`ta-badge ${STATUS_CLS[s.status]}`}>{STATUS_ID[s.status]}</span></td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <button className="btn btn-ta-ghost btn-sm" title="Katalog" onClick={() => setView(s)}>
                          <i className="bi bi-box-seam" />
                        </button>
                        <button className="btn btn-ta-ghost btn-sm" title="Kirim pesan" onClick={() => { setMsg(s); setMsgText(''); }}>
                          <i className="bi bi-chat-dots" />
                        </button>
                        <button className="btn btn-ta-outline btn-sm" title="Ubah" onClick={() => setEdit({ ...s })}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn btn-ta-danger btn-sm" title="Hapus" onClick={() => setDel(s)}>
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ---------- edit seller ---------- */}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Ubah ${edit?.name || ''}`} size="modal-lg"
        footer={(
          <>
            <button className="btn btn-ta-outline btn-sm" onClick={() => setEdit(null)}>Batal</button>
            <button className="btn btn-ta btn-sm" onClick={save}>Simpan perubahan</button>
          </>
        )}>
        {edit && (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nama toko</label>
              <input className="form-control" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Pemilik</label>
              <input className="form-control" value={edit.owner} onChange={e => setEdit({ ...edit, owner: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Blok / kios</label>
              <input className="form-control" value={edit.block} onChange={e => setEdit({ ...edit, block: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Status</label>
              <select className="form-select" value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value })}>
                <option value="verified">Terverifikasi</option>
                <option value="pending">Menunggu verifikasi</option>
                <option value="suspended">Ditangguhkan</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" value={edit.email} onChange={e => setEdit({ ...edit, email: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Telepon</label>
              <input className="form-control" value={edit.phone} onChange={e => setEdit({ ...edit, phone: e.target.value })} />
            </div>
            <div className="col-12">
              <div className="ta-flat p-3">
                <div className="ta-eyebrow mb-2">Catatan moderasi</div>
                <textarea className="form-control" rows="3"
                  placeholder="Catatan internal â€” tidak terlihat oleh penjual" />
              </div>
            </div>
            {edit.status === 'suspended' && (
              <div className="col-12">
                <div className="ta-flat p-2 ta-xs" style={{ background: 'var(--ta-danger-soft)', borderColor: '#f3d2d7' }}>
                  <i className="bi bi-exclamation-triangle me-1" />
                  Menangguhkan toko langsung menyembunyikan semua produknya dan memblokir pesanan baru.
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ---------- seller catalogue ---------- */}
      <Modal open={!!view} onClose={() => setView(null)} title={`Katalog â€” ${view?.name || ''}`} size="modal-xl">
        {view && (
          <>
            <div className="row g-3 mb-3">
              <div className="col-md-3"><div className="ta-stat-label">Produk</div><div className="fw-bold">{productsOf(view.id).length}</div></div>
              <div className="col-md-3"><div className="ta-stat-label">Tayang</div><div className="fw-bold">{productsOf(view.id).filter(p => p.status === 'active').length}</div></div>
              <div className="col-md-3"><div className="ta-stat-label">Terjual 30h</div><div className="fw-bold">{num(view.sales30d)}</div></div>
              <div className="col-md-3"><div className="ta-stat-label">Rating</div><div className="fw-bold">{view.rating}</div></div>
            </div>
            <div className="ta-table-wrap ta-flat">
              <table className="ta-table">
                <thead><tr><th>Produk</th><th>Harga</th><th>Stok</th><th>Terjual</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {productsOf(view.id).map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img src={p.images[0]} alt="" className="ta-thumb" />
                          <div style={{ maxWidth: 320 }}>
                            <div className="ta-sm fw-semibold text-truncate">{p.title}</div>
                            <div className="ta-xs ta-faint">{p.sku} Â· {p.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="fw-semibold">{usd(p.price)}</td>
                      <td className="ta-num">{num(p.stock)}</td>
                      <td className="ta-num">{num(p.sold)}</td>
                      <td>
                        <span className={`ta-badge ${p.status === 'active' ? 'ta-badge-ok' : p.status === 'review' ? 'ta-badge-warn' : p.status === 'rejected' ? 'ta-badge-danger' : 'ta-badge-neutral'}`}>
                          {PRODUCT_STATUS_ID[p.status]}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          <Link to={`/product/${p.id}`} className="btn btn-ta-ghost btn-sm"><i className="bi bi-eye" /></Link>
                          <button className="btn btn-ta-danger btn-sm"
                            onClick={() => { dispatch({ type: 'product:delete', productId: p.id }); toast('Produk dihapus oleh admin', 'warn'); }}>
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!productsOf(view.id).length && <tr><td colSpan="6"><div className="ta-empty ta-sm">Toko ini belum punya produk</div></td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal>

      {/* ---------- message seller ---------- */}
      <Modal open={!!msg} onClose={() => setMsg(null)} title={`Kirim pesan ke ${msg?.name || ''}`}
        footer={(
          <>
            <button className="btn btn-ta-outline btn-sm" onClick={() => setMsg(null)}>Batal</button>
            <button className="btn btn-ta btn-sm" onClick={() => {
              dispatch({
                type: 'thread:create',
                thread: {
                  id: 't' + Date.now(), with: msg.name, role: 'seller', subject: 'Pesan dari Admin TAGlobal',
                  party: `admin:${msg.id}`, unread: 0, last: 'baru saja', online: false,
                  messages: [{ from: 'me', text: msgText || 'Halo, ini tim TAGlobal.', time: new Date().toTimeString().slice(0, 5) }],
                },
              });
              toast(`Pesan terkirim ke ${msg.name}`);
              setMsg(null);
            }}>
              <i className="bi bi-send me-1" />Kirim pesan
            </button>
          </>
        )}>
        <div className="ta-sm ta-muted mb-3">
          Dikirim ke kotak masuk penjual dan ke email {msg?.email}.
        </div>
        <label className="form-label">Perihal</label>
        <select className="form-select mb-3">
          <option>Pemberitahuan umum</option>
          <option>Peringatan kualitas produk</option>
          <option>Peringatan performa pengiriman</option>
          <option>Pembaruan verifikasi</option>
          <option>Pemberitahuan pencairan dana</option>
        </select>
        <label className="form-label">Pesan</label>
        <textarea className="form-control" rows="5" value={msgText} onChange={e => setMsgText(e.target.value)}
          placeholder="Tulis pesan untuk penjualâ€¦" />
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)}
        title="Hapus penjual ini?"
        body={`${del?.name} beserta ${del ? productsOf(del.id).length : 0} produknya akan dihapus dari marketplace. Pesanan yang sudah selesai tetap disimpan untuk pembukuan.`}
        confirmLabel="Hapus penjual"
        onConfirm={() => { dispatch({ type: 'seller:delete', sellerId: del.id }); toast(`${del.name} dihapus`, 'warn'); setDel(null); }} />
    </>
  );
}




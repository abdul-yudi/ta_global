import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, usd, num } from '../../data/store';
import { CATEGORIES } from '../../data/mock';
import { PageHead, Card, Empty, Modal, ConfirmDialog, Pagination, useTableFilter } from '../../components/ui';

const PER = 12;
const ST = {
  active: 'ta-badge-ok', draft: 'ta-badge-neutral', review: 'ta-badge-warn', rejected: 'ta-badge-danger',
};
const ST_ID = { active: 'tayang', draft: 'draf', review: 'ditinjau', rejected: 'ditolak' };

export default function AdminProducts() {
  const { state, seller, dispatch, toast } = useStore();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [sel, setSel] = useState([]);
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const [page, setPage] = useState(1);

  useTableFilter('#admin-products', q);

  const filtered = state.products.filter(p => (tab === 'all' || p.status === tab) && (!cat || p.category === cat));
  const pages = Math.ceil(filtered.length / PER) || 1;
  const rows = filtered.slice((page - 1) * PER, page * PER);
  const count = id => (id === 'all' ? state.products.length : state.products.filter(p => p.status === id).length);

  const setStatus = (p, status, label) => {
    dispatch({ type: 'product:update', product: { id: p.id, status } });
    toast(`${p.title.slice(0, 30)}â€¦ ${label}`, status === 'rejected' ? 'warn' : 'ok');
  };

  return (
    <>
      <PageHead eyebrow="Marketplace" title="Produk"
        sub="Seluruh produk dari semua toko â€” moderasi, ubah atau hapus">
        <select className="form-select form-select-sm" style={{ width: 190 }} value={cat}
          onChange={e => { setCat(e.target.value); setPage(1); }}>
          <option value="">Semua kategori</option>
          {CATEGORIES.map(c => <option key={c.id}>{c.name}</option>)}
        </select>
        <div className="input-group input-group-sm" style={{ width: 240 }}>
          <span className="input-group-text"><i className="bi bi-search" /></span>
          <input className="form-control" placeholder="Cari nama, SKU, penjual" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </PageHead>

      <div className="row g-3 mb-3">
        {[
          ['Total produk', count('all'), 'bi-box-seam'],
          ['Tayang', count('active'), 'bi-check-circle'],
          ['Ditinjau', count('review'), 'bi-hourglass-split'],
          ['Ditolak', count('rejected'), 'bi-x-circle'],
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
        {[['all', 'Semua'], ['active', 'Tayang'], ['review', 'Ditinjau'], ['rejected', 'Ditolak'], ['draft', 'Draf']].map(([id, l]) => (
          <button key={id} className={`ta-tab ${tab === id ? 'active' : ''}`} onClick={() => { setTab(id); setPage(1); setSel([]); }}>
            {l} <span className="ta-tab-n">({count(id)})</span>
          </button>
        ))}
      </div>

      <Card pad={false} title={sel.length ? `${sel.length} dipilih` : 'Daftar produk'}
        action={sel.length > 0 && (
          <div className="d-flex gap-2">
            <button className="btn btn-ta-outline btn-sm" onClick={() => {
              sel.forEach(id => dispatch({ type: 'product:update', product: { id, status: 'active' } }));
              toast(`${sel.length} produk disetujui`); setSel([]);
            }}><i className="bi bi-check-lg me-1" />Setujui</button>
            <button className="btn btn-ta-outline btn-sm" onClick={() => {
              sel.forEach(id => dispatch({ type: 'product:update', product: { id, status: 'review' } }));
              toast(`${sel.length} produk ditahan untuk ditinjau`, 'info'); setSel([]);
            }}><i className="bi bi-hourglass me-1" />Tahan</button>
            <button className="btn btn-ta-danger btn-sm" onClick={() => {
              sel.forEach(id => dispatch({ type: 'product:delete', productId: id }));
              toast(`${sel.length} produk dihapus`, 'warn'); setSel([]);
            }}><i className="bi bi-trash me-1" />Hapus</button>
          </div>
        )}>
        {!rows.length && <Empty icon="bi-box-seam" title="Tidak ada produk di tampilan ini" />}
        {rows.length > 0 && (
          <div className="ta-table-wrap">
            <table className="ta-table" id="admin-products">
              <thead>
                <tr>
                  <th style={{ width: 34 }}>
                    <input className="form-check-input" type="checkbox"
                      checked={sel.length === rows.length && rows.length > 0}
                      onChange={e => setSel(e.target.checked ? rows.map(r => r.id) : [])} />
                  </th>
                  <th>Produk</th><th>Penjual</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Terjual</th><th>Status</th><th />
                </tr>
              </thead>
              <tbody>
                {rows.map(p => {
                  const s = seller(p.sellerId);
                  return (
                    <tr key={p.id}>
                      <td>
                        <input className="form-check-input" type="checkbox" checked={sel.includes(p.id)}
                          onChange={e => setSel(v => e.target.checked ? [...v, p.id] : v.filter(x => x !== p.id))} />
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img src={p.images[0]} alt="" className="ta-thumb" />
                          <div style={{ minWidth: 0, maxWidth: 260 }}>
                            <div className="ta-sm fw-semibold text-truncate">{p.title}</div>
                            <div className="ta-xs ta-faint">{p.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Link to={`/search?seller=${p.sellerId}`} className="ta-xs">{s?.name}</Link>
                        <div className="ta-xs ta-faint">{s?.block}</div>
                      </td>
                      <td className="ta-xs ta-faint">{p.category}<div>{p.sub}</div></td>
                      <td className="fw-semibold">{usd(p.price)}</td>
                      <td className="ta-num">{num(p.stock)}</td>
                      <td className="ta-num">{num(p.sold)}</td>
                      <td><span className={`ta-badge ${ST[p.status]}`}>{ST_ID[p.status]}</span></td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          {p.status === 'review' && (
                            <>
                              <button className="btn btn-ta btn-sm" title="Setujui" onClick={() => setStatus(p, 'active', 'disetujui dan tayang')}>
                                <i className="bi bi-check-lg" />
                              </button>
                              <button className="btn btn-ta-danger btn-sm" title="Tolak" onClick={() => setStatus(p, 'rejected', 'ditolak')}>
                                <i className="bi bi-x-lg" />
                              </button>
                            </>
                          )}
                          <Link to={`/product/${p.id}`} className="btn btn-ta-ghost btn-sm" title="Lihat"><i className="bi bi-eye" /></Link>
                          <button className="btn btn-ta-outline btn-sm" title="Ubah" onClick={() => setEdit({ ...p })}><i className="bi bi-pencil" /></button>
                          <button className="btn btn-ta-danger btn-sm" title="Hapus" onClick={() => setDel(p)}><i className="bi bi-trash" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination page={page} pages={pages} onPage={setPage} />

      {/* ---------- edit listing ---------- */}
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Ubah produk (hak akses admin)" size="modal-lg"
        footer={(
          <>
            <button className="btn btn-ta-outline btn-sm" onClick={() => setEdit(null)}>Batal</button>
            <button className="btn btn-ta btn-sm" onClick={() => {
              dispatch({ type: 'product:update', product: edit });
              toast('Produk diperbarui â€” penjual diberi tahu adanya perubahan oleh admin');
              setEdit(null);
            }}>Simpan perubahan</button>
          </>
        )}>
        {edit && (
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Nama produk</label>
              <input className="form-control" value={edit.title} onChange={e => setEdit({ ...edit, title: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Harga (USD)</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input className="form-control ta-num" value={edit.price}
                  onChange={e => setEdit({ ...edit, price: +e.target.value.replace(/[^\d.]/g, '') || 0 })} />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Stok</label>
              <input className="form-control ta-num" value={edit.stock}
                onChange={e => setEdit({ ...edit, stock: +e.target.value.replace(/\D/g, '') || 0 })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select className="form-select" value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value })}>
                <option value="active">Tayang</option>
                <option value="review">Ditinjau</option>
                <option value="rejected">Ditolak</option>
                <option value="draft">Draf</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Kategori</label>
              <select className="form-select" value={edit.category} onChange={e => setEdit({ ...edit, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">MOQ</label>
              <input className="form-control ta-num" value={edit.moq}
                onChange={e => setEdit({ ...edit, moq: +e.target.value.replace(/\D/g, '') || 1 })} />
            </div>
            <div className="col-12">
              <label className="form-label">Deskripsi</label>
              <textarea className="form-control" rows="4" value={edit.desc} onChange={e => setEdit({ ...edit, desc: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="form-label">Alasan perubahan (dikirim ke penjual)</label>
              <input className="form-control" placeholder="mis. klaim diskon yang menyesatkan dihapus" />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Hapus produk ini?"
        body={`â€œ${del?.title}â€ akan dihapus dari marketplace dan penjual akan diberi tahu.`}
        confirmLabel="Hapus"
        onConfirm={() => { dispatch({ type: 'product:delete', productId: del.id }); toast('Produk dihapus', 'warn'); setDel(null); }} />
    </>
  );
}




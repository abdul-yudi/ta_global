import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, usd, num } from '../../data/store';
import { PageHead, Card, Empty, ConfirmDialog, Pagination, useTableFilter } from '../../components/ui';

const STATUS = {
  active: { label: 'Tayang', cls: 'ta-badge-ok' },
  draft: { label: 'Draf', cls: 'ta-badge-neutral' },
  review: { label: 'Ditinjau', cls: 'ta-badge-warn' },
  rejected: { label: 'Ditolak', cls: 'ta-badge-danger' },
};
const PER = 10;

export default function SellerProducts() {
  const { state, dispatch, toast } = useStore();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState([]);
  const [del, setDel] = useState(null);
  const [page, setPage] = useState(1);

  const mine = state.products.filter(p => p.sellerId === state.sellerId);
  const filtered = mine.filter(p => tab === 'all' || p.status === tab);
  const pages = Math.ceil(filtered.length / PER) || 1;
  const rows = filtered.slice((page - 1) * PER, page * PER);

  // jQuery live filter across the rendered rows
  useTableFilter('#seller-products', q);

  const count = id => (id === 'all' ? mine.length : mine.filter(p => p.status === id).length);
  const toggleAll = on => setSel(on ? rows.map(r => r.id) : []);

  return (
    <>
      <PageHead eyebrow="Katalog" title="Produk" sub={`${mine.length} produk di toko Anda`}>
        <button className="btn btn-ta-outline" onClick={() => toast('Template CSV massal diunduh (prototipe)', 'info')}>
          <i className="bi bi-filetype-csv me-1" />Unggah massal
        </button>
        <Link to="/seller/products/new" className="btn btn-ta"><i className="bi bi-plus-lg me-1" />Unggah produk</Link>
      </PageHead>

      <div className="ta-tabs">
        {[['all', 'Semua'], ['active', 'Tayang'], ['draft', 'Draf'], ['review', 'Ditinjau'], ['rejected', 'Ditolak']].map(([id, label]) => (
          <button key={id} className={`ta-tab ${tab === id ? 'active' : ''}`} onClick={() => { setTab(id); setPage(1); }}>
            {label} <span className="ta-tab-n">({count(id)})</span>
          </button>
        ))}
      </div>

      <Card pad={false}
        title={sel.length ? `${sel.length} dipilih` : 'Daftar produk'}
        action={(
          <div className="d-flex gap-2">
            {sel.length > 0 ? (
              <>
                <button className="btn btn-ta-outline btn-sm" onClick={() => { toast(`${sel.length} produk dijadikan draf`, 'info'); setSel([]); }}>
                  <i className="bi bi-pause-circle me-1" />Hentikan tayang
                </button>
                <button className="btn btn-ta-danger btn-sm" onClick={() => { sel.forEach(id => dispatch({ type: 'product:delete', productId: id })); toast(`${sel.length} produk dihapus`, 'warn'); setSel([]); }}>
                  <i className="bi bi-trash me-1" />Hapus
                </button>
              </>
            ) : (
              <div className="input-group input-group-sm" style={{ width: 240 }}>
                <span className="input-group-text"><i className="bi bi-search" /></span>
                <input className="form-control" placeholder="Cari nama atau SKU" value={q} onChange={e => setQ(e.target.value)} />
              </div>
            )}
          </div>
        )}>
        {!rows.length && <Empty icon="bi-box" title="Belum ada produk di tampilan ini"
          sub="Unggah produk pertama Anda untuk mulai berjualan ke seluruh dunia.">
          <Link to="/seller/products/new" className="btn btn-ta btn-sm">Unggah produk</Link>
        </Empty>}

        {rows.length > 0 && (
          <div className="ta-table-wrap">
            <table className="ta-table" id="seller-products">
              <thead>
                <tr>
                  <th style={{ width: 34 }}>
                    <input className="form-check-input" type="checkbox"
                      checked={sel.length === rows.length && rows.length > 0}
                      onChange={e => toggleAll(e.target.checked)} />
                  </th>
                  <th>Produk</th><th>Harga</th><th>MOQ</th><th>Stok</th><th>Terjual</th><th>Rating</th><th>Status</th><th />
                </tr>
              </thead>
              <tbody>
                {rows.map(p => {
                  const st = STATUS[p.status];
                  return (
                    <tr key={p.id}>
                      <td>
                        <input className="form-check-input" type="checkbox" checked={sel.includes(p.id)}
                          onChange={e => setSel(v => e.target.checked ? [...v, p.id] : v.filter(x => x !== p.id))} />
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img src={p.images[0]} alt="" className="ta-thumb" />
                          <div style={{ minWidth: 0, maxWidth: 300 }}>
                            <div className="ta-sm fw-semibold text-truncate">{p.title}</div>
                            <div className="ta-xs ta-faint">{p.sku} · {p.category}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">{usd(p.price)}</div>
                        {p.oldPrice && <div className="ta-price-old">{usd(p.oldPrice)}</div>}
                      </td>
                      <td className="ta-num">{p.moq}</td>
                      <td>
                        <span className={p.stock < 600 ? 'fw-semibold' : ''} style={{ color: p.stock < 600 ? 'var(--ta-warn)' : undefined }}>
                          {num(p.stock)}
                        </span>
                      </td>
                      <td className="ta-num">{num(p.sold)}</td>
                      <td className="ta-sm"><i className="bi bi-star-fill ta-stars me-1" />{p.rating}</td>
                      <td><span className={`ta-badge ${st.cls}`}>{st.label}</span></td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          <Link to={`/product/${p.id}`} className="btn btn-ta-ghost btn-sm" title="Lihat di etalase">
                            <i className="bi bi-eye" />
                          </Link>
                          <Link to={`/seller/products/${p.id}/edit`} className="btn btn-ta-outline btn-sm" title="Ubah">
                            <i className="bi bi-pencil" />
                          </Link>
                          <button className="btn btn-ta-danger btn-sm" title="Hapus" onClick={() => setDel(p)}>
                            <i className="bi bi-trash" />
                          </button>
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

      <ConfirmDialog open={!!del} onClose={() => setDel(null)}
        title="Hapus produk ini?"
        body={`“${del?.title}” akan dihapus dari etalase. Pesanan yang sudah berjalan tidak terpengaruh.`}
        confirmLabel="Hapus"
        onConfirm={() => { dispatch({ type: 'product:delete', productId: del.id }); toast('Produk dihapus', 'warn'); setDel(null); }} />
    </>
  );
}

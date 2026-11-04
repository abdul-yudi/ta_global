import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, usd, num } from '../../data/store';
import { ORDER_STATUS } from '../../data/mock';
import { PageHead, Card, StatusBadge, ProviderLogo, Empty, Modal, useTableFilter } from '../../components/ui';

export default function AdminOrders() {
  const { state, seller, provider, product, toast } = useStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [detail, setDetail] = useState(null);

  useTableFilter('#admin-orders', q);

  const list = state.orders.filter(o => !status || o.status === status);
  const gmv = state.orders.reduce((a, o) => a + o.total, 0);

  return (
    <>
      <PageHead eyebrow="Marketplace" title="Pesanan"
        sub="Seluruh transaksi di platform, lengkap dengan status dana dan kurir">
        <select className="form-select form-select-sm" style={{ width: 190 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Semua status</option>
          {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="input-group input-group-sm" style={{ width: 240 }}>
          <span className="input-group-text"><i className="bi bi-search" /></span>
          <input className="form-control" placeholder="Pesanan, pembeli, resi" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </PageHead>

      <div className="row g-3 mb-3">
        {[
          ['Pesanan terdaftar', state.orders.length, 'bi-receipt'],
          ['Total nilai', usd(gmv), 'bi-cash-stack'],
          ['Dana ditahan', usd(state.orders.filter(o => ['awaiting_acceptance', 'to_dropoff'].includes(o.status)).reduce((a, o) => a + o.total, 0)), 'bi-safe'],
          ['Sengketa terbuka', 0, 'bi-exclamation-diamond'],
        ].map(([l, v, i]) => (
          <div className="col-6 col-xl-3" key={l}>
            <div className="ta-stat d-flex align-items-center gap-3">
              <i className={`bi ${i}`} style={{ fontSize: '1.4rem', color: 'var(--ta-brand)' }} />
              <div>
                <div className="ta-stat-label">{l}</div>
                <div className="ta-stat-value" style={{ fontSize: '1.2rem', margin: 0 }}>{v}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card pad={false} title="Daftar pesanan">
        {!list.length && <Empty icon="bi-receipt" title="Tidak ada pesanan yang cocok dengan filter ini" />}
        {list.length > 0 && (
          <div className="ta-table-wrap">
            <table className="ta-table" id="admin-orders">
              <thead>
                <tr><th>Pesanan</th><th>Pembeli</th><th>Penjual</th><th>Jumlah</th><th>Kurir / resi</th>
                  <th>Total</th><th>Komisi</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {list.map(o => (
                  <tr key={o.id}>
                    <td><div className="ta-mono fw-semibold">{o.id}</div><div className="ta-xs ta-faint">{o.placed}</div></td>
                    <td><div className="ta-sm">{o.buyer}</div><div className="ta-xs ta-faint">{o.city}, {o.country}</div></td>
                    <td><Link to={`/search?seller=${o.sellerId}`} className="ta-xs">{seller(o.sellerId)?.name}</Link></td>
                    <td className="ta-num ta-sm">{num(o.items.reduce((a, i) => a + i.qty, 0))} pcs</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <ProviderLogo code={provider(o.provider)?.logo} />
                        <span className="ta-xs ta-mono ta-faint">{o.awb}</span>
                      </div>
                    </td>
                    <td className="fw-semibold">{usd(o.total)}</td>
                    <td className="ta-sm" style={{ color: 'var(--ta-ok)' }}>{usd(o.total * 0.04)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <button className="btn btn-ta-outline btn-sm" onClick={() => setDetail(o)} title="Detail"><i className="bi bi-list-ul" /></button>
                        <Link to={`/track/${o.id}`} className="btn btn-ta-ghost btn-sm" title="Lacak"><i className="bi bi-geo" /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Pesanan ${detail?.id || ''}`} size="modal-lg"
        footer={(
          <>
            <button className="btn btn-ta-outline btn-sm" onClick={() => toast('Alur pengembalian dana dibuka (prototipe)', 'info')}>
              <i className="bi bi-arrow-counterclockwise me-1" />Kembalikan dana
            </button>
            <button className="btn btn-ta btn-sm" onClick={() => setDetail(null)}>Tutup</button>
          </>
        )}>
        {detail && (
          <>
            <div className="row g-3 mb-3">
              <div className="col-md-4"><div className="ta-eyebrow mb-1">Status</div><StatusBadge status={detail.status} /></div>
              <div className="col-md-4"><div className="ta-eyebrow mb-1">Pembayaran</div><div className="ta-sm">{detail.payment}</div></div>
              <div className="col-md-4"><div className="ta-eyebrow mb-1">Dana</div>
                <span className={`ta-badge ${['delivered'].includes(detail.status) ? 'ta-badge-ok' : 'ta-badge-info'}`}>
                  {detail.status === 'delivered' ? 'sudah dicairkan' : 'ditahan'}
                </span>
              </div>
              <div className="col-md-6"><div className="ta-eyebrow mb-1">Pembeli</div>
                <div className="ta-sm">{detail.buyer}</div><div className="ta-xs ta-faint">{detail.address}</div></div>
              <div className="col-md-6"><div className="ta-eyebrow mb-1">Penjual</div>
                <div className="ta-sm">{seller(detail.sellerId)?.name}</div>
                <div className="ta-xs ta-faint">{seller(detail.sellerId)?.block}</div></div>
            </div>
            <div className="ta-eyebrow mb-2">Barang</div>
            {detail.items.map(it => {
              const p = product(it.productId);
              return p ? (
                <div key={it.productId + it.variant} className="d-flex gap-2 py-2" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                  <img src={p.images[0]} alt="" className="ta-thumb" />
                  <div className="flex-grow-1">
                    <div className="ta-sm">{p.title}</div>
                    <div className="ta-xs ta-faint">{it.variant} · {it.qty} pcs</div>
                  </div>
                  <div className="ta-sm fw-semibold">{usd(p.price * it.qty)}</div>
                </div>
              ) : null;
            })}
            <div className="ta-eyebrow mt-3 mb-2">Riwayat kurir</div>
            <ul className="ta-timeline">
              {detail.tracking.map((t, i) => (
                  <li key={i} className={t.state}>
                    <div className="d-flex justify-content-between">
                      <span className={`ta-sm ${t.state === 'pending' ? 'ta-faint' : 'fw-semibold'}`}>{t.title}</span>
                      <span className="ta-xs ta-faint ta-mono">{t.time}</span>
                    </div>
                    <div className="ta-xs ta-faint">{t.place}</div>
                  </li>
              ))}
            </ul>
          </>
        )}
      </Modal>
    </>
  );
}

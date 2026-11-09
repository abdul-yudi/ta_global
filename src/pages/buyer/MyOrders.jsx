import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, usd } from '../../data/store';
import { StatusBadge, Empty, ProviderLogo, Modal } from '../../components/ui';

const TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'awaiting_acceptance', label: 'Menunggu konfirmasi' },
  { id: 'in_transit', label: 'Dalam pengiriman' },
  { id: 'delivered', label: 'Terkirim' },
  { id: 'cancelled', label: 'Dibatalkan' },
];

export default function MyOrders() {
  const { state, seller, provider, product, toast } = useStore();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [review, setReview] = useState(null);
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');

  const transit = ['to_dropoff', 'at_hub', 'in_transit', 'out_for_delivery'];
  const list = state.orders.filter(o => {
    const byTab = tab === 'all' ? true : tab === 'in_transit' ? transit.includes(o.status) : o.status === tab;
    const byQ = !q || o.id.toLowerCase().includes(q.toLowerCase()) || o.awb.toLowerCase().includes(q.toLowerCase());
    return byTab && byQ;
  });

  const count = id => (id === 'all' ? state.orders.length
    : id === 'in_transit' ? state.orders.filter(o => transit.includes(o.status)).length
      : state.orders.filter(o => o.status === id).length);

  return (
    <main className="container py-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h1 style={{ fontSize: '1.375rem', margin: 0 }}>Pesanan saya</h1>
          <div className="ta-sm ta-faint">Semua yang Anda beli dari lantai pasar</div>
        </div>
        <div className="d-flex gap-2">
          <div className="input-group" style={{ width: 260 }}>
            <span className="input-group-text"><i className="bi bi-search" /></span>
            <input className="form-control" placeholder="Nomor pesanan atau resi" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Link to="/track" className="btn btn-ta-outline"><i className="bi bi-geo me-1" />Lacak</Link>
        </div>
      </div>

      <div className="ta-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`ta-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label} <span className="ta-tab-n">({count(t.id)})</span>
          </button>
        ))}
      </div>

      {!list.length && <div className="ta-card"><Empty icon="bi-box-seam" title="Tidak ada pesanan di tampilan ini" /></div>}

      <div className="d-grid gap-3">
        {list.map(o => {
          const s = seller(o.sellerId) || {name:"Penjual"};
          const pv = provider(o.provider) || {name:"Kurir",logo:"TA",service:"",tracking:""};
          const stepNow = o.tracking?.find(t => t.state === 'active') || o.tracking?.[o.tracking.length - 1] || {title:o.status,note:"Status pesanan",place:o.city,time:o.placed,state:"active"};
          return (
            <div key={o.id} className="ta-card">
              <div className="ta-card-head">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <span className="ta-mono fw-semibold">{o.id}</span>
                  <StatusBadge status={o.status} />
                  <span className="ta-xs ta-faint">dibuat {o.placed}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="ta-avatar" style={{ width: 26, height: 26, fontSize: '.65rem' }}>{s?.name.slice(0, 2).toUpperCase()}</span>
                  <Link to={`/search?seller=${o.sellerId}`} className="ta-sm">{s?.name}</Link>
                </div>
              </div>

              <div className="ta-card-pad">
                <div className="row g-3">
                  <div className="col-lg-7">
                    {o.items.map(it => {
                      const p = product(it.productId);
                      return p ? (
                        <div key={it.productId + it.variant} className="d-flex gap-3 py-2">
                          <Link to={`/product/${p.id}`} style={{ flex: 'none' }}>
                            <img src={p.images[0]} alt="" className="ta-thumb-lg" />
                          </Link>
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <Link to={`/product/${p.id}`} className="ta-sm fw-semibold d-block text-truncate" style={{ color: 'var(--ta-ink)' }}>
                              {p.title}
                            </Link>
                            <div className="ta-xs ta-faint">{it.variant} Â· {it.qty} pcs Ã— {usd(p.price)}</div>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="col-lg-5">
                    <div className="ta-flat p-3 h-100">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <ProviderLogo code={pv?.logo} />
                        <div className="ta-xs">
                          <div className="fw-semibold">{pv?.name}</div>
                          <div className="ta-faint ta-mono">{o.awb !== '-' ? o.awb : 'resi belum terbit'}</div>
                        </div>
                      </div>
                      <div className="ta-xs ta-muted">
                        <i className="bi bi-geo-alt me-1" />{o.address}
                      </div>
                      <div className="ta-xs ta-muted mt-1">
                        <i className="bi bi-activity me-1" />{stepNow?.title} â€” {stepNow?.place}
                      </div>
                      <hr className="ta-sep my-2" />
                      <div className="d-flex justify-content-between ta-sm">
                        <span className="ta-faint">Total pesanan</span>
                        <strong>{usd(o.total)}</strong>
                      </div>
                      <div className="ta-xs ta-faint">{o.payment}</div>
                    </div>
                  </div>
                </div>

                <hr className="ta-sep my-3" />
                <div className="d-flex gap-2 flex-wrap">
                  <Link to={`/track/${o.id}`} className="btn btn-ta btn-sm"><i className="bi bi-geo me-1" />Lacak paket</Link>
                  <Link to="/messages" className="btn btn-ta-outline btn-sm"><i className="bi bi-chat-dots me-1" />Hubungi penjual</Link>
                  {o.status === 'delivered' && (
                    <button className="btn btn-ta-outline btn-sm" onClick={() => { setReview(o); setStars(5); setText(''); }}>
                      <i className="bi bi-star me-1" />Beri ulasan
                    </button>
                  )}
                  {o.status === 'delivered' && (
                    <button className="btn btn-ta-outline btn-sm" onClick={() => toast('Formulir pengembalian barang dibuka (prototipe)', 'info')}>
                      <i className="bi bi-arrow-counterclockwise me-1" />Ajukan retur
                    </button>
                  )}
                  {o.status === 'awaiting_acceptance' && (
                    <button className="btn btn-ta-danger btn-sm" onClick={() => toast('Permintaan pembatalan dikirim ke penjual', 'warn')}>
                      <i className="bi bi-x-circle me-1" />Batalkan pesanan
                    </button>
                  )}
                  <button className="btn btn-ta-ghost btn-sm ms-auto" onClick={() => toast('Invoice PDF dibuat (prototipe)', 'info')}>
                    <i className="bi bi-file-earmark-pdf me-1" />Invoice
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!review} onClose={() => setReview(null)} title={`Ulasan pesanan ${review?.id || ''}`}
        footer={(
          <>
            <button className="btn btn-ta-outline btn-sm" onClick={() => setReview(null)}>Batal</button>
            <button className="btn btn-ta btn-sm" onClick={() => { setReview(null); toast('Terima kasih â€” ulasan Anda sudah tayang'); }}>
              Kirim ulasan
            </button>
          </>
        )}>
        <div className="mb-3">
          <label className="form-label">Rating Anda</label>
          <div className="d-flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} className="btn btn-ta-ghost p-1" onClick={() => setStars(n)} aria-label={`${n} bintang`}>
                <i className={`bi ${n <= stars ? 'bi-star-fill' : 'bi-star'}`} style={{ color: 'var(--ta-accent)', fontSize: '1.2rem' }} />
              </button>
            ))}
          </div>
        </div>
        <label className="form-label">Apa yang perlu diketahui pembeli lain?</label>
        <textarea className="form-control" rows="4" value={text} onChange={e => setText(e.target.value)}
          placeholder="Kualitas bahan, pengemasan, kecepatan kios mengirimâ€¦" />
      </Modal>
    </main>
  );
}


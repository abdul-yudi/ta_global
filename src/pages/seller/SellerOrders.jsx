import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, usd, num } from '../../data/store';
import { PageHead, Card, StatusBadge, ProviderLogo, Empty, Modal, FakeQR } from '../../components/ui';

const TABS = [
  { id: 'awaiting_acceptance', label: 'Baru' },
  { id: 'to_dropoff', label: 'Dikemas & diantar' },
  { id: 'at_hub', label: 'Di gerai' },
  { id: 'shipped', label: 'Dikirim' },
  { id: 'all', label: 'Semua' },
];

export default function SellerOrders() {
  const { state, sellerOrders, product, provider, hub, dispatch, toast } = useStore();
  const [tab, setTab] = useState('awaiting_acceptance');
  const [q, setQ] = useState('');
  const [detail, setDetail] = useState(null);
  const [label, setLabel] = useState(null);
  const [reject, setReject] = useState(null);
  const [reason, setReason] = useState('Stok habis');

  const shipped = ['in_transit', 'out_for_delivery', 'delivered'];
  const list = sellerOrders.filter(o => {
    const byTab = tab === 'all' ? true : tab === 'shipped' ? shipped.includes(o.status) : o.status === tab;
    const byQ = !q || o.id.toLowerCase().includes(q.toLowerCase()) || o.buyer.toLowerCase().includes(q.toLowerCase());
    return byTab && byQ;
  });

  const count = id => (id === 'all' ? sellerOrders.length
    : id === 'shipped' ? sellerOrders.filter(o => shipped.includes(o.status)).length
      : sellerOrders.filter(o => o.status === id).length);

  const accept = o => {
    dispatch({ type: 'order:status', orderId: o.id, status: 'to_dropoff', stage: 1 });
    toast(`${o.id} diterima — kemas dan antar ke gerai sebelum pukul 15:00`);
  };
  const markDropped = o => {
    const awb = (provider(o.provider)?.code || 'TA') + Math.floor(1000000000 + Math.random() * 8999999999);
    dispatch({ type: 'order:status', orderId: o.id, status: 'at_hub', stage: 2, awb });
    toast(`${o.id} dipindai di gerai — nomor resi ${awb} terbit`);
  };

  return (
    <>
      <PageHead eyebrow="Pengiriman" title="Pesanan" sub="Terima, kemas, lalu antar ke gerai">
        <div className="input-group input-group-sm" style={{ width: 240 }}>
          <span className="input-group-text"><i className="bi bi-search" /></span>
          <input className="form-control" placeholder="Nomor pesanan atau pembeli" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <Link to="/seller/dropoff" className="btn btn-ta"><i className="bi bi-shop-window me-1" />Manifes antar</Link>
      </PageHead>

      <div className="row g-3 mb-3">
        {[
          ['Pesanan baru', count('awaiting_acceptance'), 'bi-bell'],
          ['Dikemas & diantar', count('to_dropoff'), 'bi-box-seam'],
          ['Di gerai / hub', count('at_hub'), 'bi-shop-window'],
          ['Dikirim (30 hari)', count('shipped'), 'bi-airplane'],
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
        {TABS.map(t => (
          <button key={t.id} className={`ta-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label} <span className="ta-tab-n">({count(t.id)})</span>
          </button>
        ))}
      </div>

      {!list.length && <Card pad={false}><Empty icon="bi-receipt" title="Tidak ada pesanan di antrean ini"
        sub="Pesanan baru muncul di sini begitu pembeli menyelesaikan pembayaran." /></Card>}

      <div className="d-grid gap-3">
        {list.map(o => {
          const pv = provider(o.provider);
          const pcs = o.items.reduce((a, i) => a + i.qty, 0);
          return (
            <div key={o.id} className="ta-card">
              <div className="ta-card-head">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <span className="ta-mono fw-semibold">{o.id}</span>
                  <StatusBadge status={o.status} />
                  <span className="ta-xs ta-faint">{o.placed}</span>
                  {o.status === 'awaiting_acceptance' && (
                    <span className="ta-badge ta-badge-danger"><i className="bi bi-clock" />konfirmasi dalam 24 jam</span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <ProviderLogo code={pv?.logo} />
                  <span className="ta-xs ta-faint ta-mono">{o.awb}</span>
                </div>
              </div>

              <div className="ta-card-pad">
                <div className="row g-3">
                  <div className="col-lg-6">
                    {o.items.map(it => {
                      const p = product(it.productId);
                      return p ? (
                        <div key={it.productId + it.variant} className="d-flex gap-3 py-2">
                          <img src={p.images[0]} alt="" className="ta-thumb-lg" />
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="ta-sm fw-semibold">{p.title}</div>
                            <div className="ta-xs ta-faint">{p.sku} · {it.variant}</div>
                            <div className="ta-xs ta-muted mt-1">
                              <strong>{it.qty} pcs</strong> × {usd(p.price)} · sisa stok setelah kirim {num(Math.max(0, p.stock - it.qty))}
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="col-lg-3">
                    <div className="ta-eyebrow mb-1">Dikirim ke</div>
                    <div className="ta-sm fw-semibold">{o.buyer}</div>
                    <div className="ta-xs ta-muted">{o.address}</div>
                    <div className="ta-eyebrow mt-3 mb-1">Kurir pilihan pembeli</div>
                    <div className="ta-sm">{pv?.name}</div>
                    <div className="ta-xs ta-faint">{pv?.service} · {pv?.etaMin}-{pv?.etaMax} hari</div>
                  </div>
                  <div className="col-lg-3">
                    <div className="ta-flat p-3">
                      <div className="ta-kv"><dt>Jumlah</dt><dd>{num(pcs)} pcs</dd></div>
                      <div className="ta-kv"><dt>Berat</dt><dd>{o.weight} kg</dd></div>
                      <div className="ta-kv"><dt>Nilai pesanan</dt><dd>{usd(o.total)}</dd></div>
                      <div className="ta-kv"><dt>Diterima penjual</dt><dd style={{ color: 'var(--ta-ok)' }}>{usd(o.total * 0.96)}</dd></div>
                      <div className="ta-xs ta-faint mt-1">setelah komisi 4%</div>
                    </div>
                  </div>
                </div>

                {o.note && (
                  <div className="ta-flat p-2 mt-3 ta-xs" style={{ background: 'var(--ta-warn-soft)', borderColor: '#f0dfbe' }}>
                    <i className="bi bi-chat-left-quote me-1" /><strong>Catatan pembeli:</strong> {o.note}
                  </div>
                )}

                <hr className="ta-sep my-3" />
                <div className="d-flex gap-2 flex-wrap">
                  {o.status === 'awaiting_acceptance' && (
                    <>
                      <button className="btn btn-ta btn-sm" onClick={() => accept(o)}>
                        <i className="bi bi-check-lg me-1" />Terima pesanan
                      </button>
                      <button className="btn btn-ta-danger btn-sm" onClick={() => setReject(o)}>
                        <i className="bi bi-x-lg me-1" />Tolak
                      </button>
                    </>
                  )}
                  {o.status === 'to_dropoff' && (
                    <>
                      <button className="btn btn-ta btn-sm" onClick={() => setLabel(o)}>
                        <i className="bi bi-upc-scan me-1" />Cetak label antar
                      </button>
                      <button className="btn btn-ta-outline btn-sm" onClick={() => markDropped(o)}>
                        <i className="bi bi-shop-window me-1" />Tandai sudah diantar
                      </button>
                    </>
                  )}
                  {o.status === 'at_hub' && (
                    <span className="ta-badge ta-badge-info">
                      <i className="bi bi-hourglass-split" />Menunggu penjemputan kurir di hub
                    </span>
                  )}
                  <button className="btn btn-ta-outline btn-sm" onClick={() => setDetail(o)}>
                    <i className="bi bi-list-ul me-1" />Detail
                  </button>
                  <Link to="/seller/messages" className="btn btn-ta-outline btn-sm">
                    <i className="bi bi-chat-dots me-1" />Chat pembeli
                  </Link>
                  <Link to={`/track/${o.id}`} className="btn btn-ta-ghost btn-sm ms-auto">
                    <i className="bi bi-geo me-1" />Lacak paket
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- decline modal ---------- */}
      <Modal open={!!reject} onClose={() => setReject(null)} title={`Tolak pesanan ${reject?.id || ''}`}
        footer={(
          <>
            <button className="btn btn-ta-outline btn-sm" onClick={() => setReject(null)}>Batal</button>
            <button className="btn btn-ta-danger btn-sm" onClick={() => {
              dispatch({ type: 'order:status', orderId: reject.id, status: 'cancelled', stage: 0 });
              toast(`${reject.id} ditolak — dana pembeli dikembalikan penuh`, 'warn');
              setReject(null);
            }}>Tolak &amp; kembalikan dana</button>
          </>
        )}>
        <div className="ta-sm ta-muted mb-3">
          Menolak pesanan langsung mengembalikan dana pembeli dan menambah tingkat pembatalan toko Anda.
        </div>
        <label className="form-label">Alasan</label>
        <select className="form-select mb-3" value={reason} onChange={e => setReason(e.target.value)}>
          <option>Stok habis</option>
          <option>Warna atau ukuran tidak tersedia lagi</option>
          <option>Pembeli minta dibatalkan</option>
          <option>Tidak sanggup memenuhi jumlah pesanan</option>
        </select>
        <label className="form-label">Pesan untuk pembeli</label>
        <textarea className="form-control" rows="3" defaultValue="Mohon maaf, warna ini baru saja habis di toko. Saya punya warna yang mirip — boleh saya kirim fotonya?" />
      </Modal>

      {/* ---------- label modal ---------- */}
      <Modal open={!!label} onClose={() => setLabel(null)} title="Label antar ke gerai" size="modal-lg"
        footer={(
          <>
            <button className="btn btn-ta-outline btn-sm" onClick={() => setLabel(null)}>Tutup</button>
            <button className="btn btn-ta btn-sm" onClick={() => { toast('Label dikirim ke printer (prototipe)', 'info'); setLabel(null); }}>
              <i className="bi bi-printer me-1" />Cetak label
            </button>
          </>
        )}>
        {label && (
          <div className="ta-flat p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="ta-logo" style={{ fontSize: '1rem' }}>TA<span>Global</span></div>
                <div className="ta-xs ta-faint">Manifes antar ke gerai</div>
              </div>
              <div className="text-end">
                <div className="ta-mono fw-bold">{label.id}</div>
                <div className="ta-xs ta-faint">{label.placed}</div>
              </div>
            </div>
            <hr className="ta-sep my-3" />
            <div className="row g-3">
              <div className="col-7">
                <div className="ta-eyebrow mb-1">Kirim ke</div>
                <div className="fw-semibold">{label.buyer}</div>
                <div className="ta-sm ta-muted">{label.address}</div>
                <div className="ta-eyebrow mt-3 mb-1">Kurir</div>
                <div className="d-flex align-items-center gap-2">
                  <ProviderLogo code={provider(label.provider)?.logo} />
                  <span className="ta-sm">{provider(label.provider)?.name} · {provider(label.provider)?.service}</span>
                </div>
                <div className="ta-eyebrow mt-3 mb-1">Antar ke</div>
                <div className="ta-sm">{hub(state.sellerHub)?.name}</div>
                <div className="ta-xs ta-faint">{hub(state.sellerHub)?.address} · cut-off {hub(state.sellerHub)?.cutoff}</div>
              </div>
              <div className="col-5 text-center">
                <FakeQR seed={label.id} />
                <div className="ta-mono ta-xs mt-2">{label.id}</div>
                <div className="ta-xs ta-faint">Tunjukkan kode ini di loket</div>
              </div>
            </div>
            <hr className="ta-sep my-3" />
            <div className="row g-2 ta-xs">
              <div className="col-3"><div className="ta-faint">Jumlah</div><strong>{label.items.reduce((a, i) => a + i.qty, 0)} pcs</strong></div>
              <div className="col-3"><div className="ta-faint">Berat</div><strong>{label.weight} kg</strong></div>
              <div className="col-3"><div className="ta-faint">Nilai barang</div><strong>{usd(label.total)}</strong></div>
              <div className="col-3"><div className="ta-faint">Penjual</div><strong>{state.sellerId.toUpperCase()}</strong></div>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- detail modal ---------- */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Pesanan ${detail?.id || ''}`} size="modal-lg">
        {detail && (
          <>
            <div className="row g-3 mb-3">
              <div className="col-md-4"><div className="ta-eyebrow mb-1">Status</div><StatusBadge status={detail.status} /></div>
              <div className="col-md-4"><div className="ta-eyebrow mb-1">Pembayaran</div><div className="ta-sm">{detail.payment}</div></div>
              <div className="col-md-4"><div className="ta-eyebrow mb-1">Dibuat</div><div className="ta-sm ta-mono">{detail.placed}</div></div>
            </div>
            <div className="ta-eyebrow mb-2">Riwayat pengiriman</div>
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

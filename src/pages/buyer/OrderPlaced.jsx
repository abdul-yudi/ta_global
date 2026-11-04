import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore, usd } from '../../data/store';
import { Steps, Empty, ProviderLogo } from '../../components/ui';

export default function OrderPlaced() {
  const { id } = useParams();
  const { state, seller, provider, product } = useStore();
  const order = state.orders.find(o => o.id === id);

  if (!order) {
    return <main className="container py-5"><div className="ta-card"><Empty icon="bi-receipt" title="Pesanan tidak ditemukan" /></div></main>;
  }
  const s = seller(order.sellerId);
  const pv = provider(order.provider);

  return (
    <main className="container py-4">
      <div className="mb-4"><Steps steps={['Keranjang', 'Checkout', 'Pembayaran', 'Selesai']} current={3} /></div>

      <div className="row g-3 justify-content-center">
        <div className="col-lg-8">
          <div className="ta-card ta-card-pad text-center" style={{ padding: '2.5rem 1.5rem' }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: '2.6rem', color: 'var(--ta-ok)' }} />
            <h1 className="ta-display mt-3 mb-1" style={{ fontSize: '1.6rem' }}>Pembayaran berhasil</h1>
            <p className="ta-muted mb-0">
              Pesanan <strong className="ta-mono">{order.id}</strong> sudah diteruskan ke {s.name}.
              Anda akan diberi tahu begitu kios mengonfirmasi dan mengemas pesanannya.
            </p>
            <div className="d-flex gap-2 justify-content-center mt-4 flex-wrap">
              <Link to={`/track/${order.id}`} className="btn btn-ta">Lacak pesanan ini</Link>
              <Link to="/orders" className="btn btn-ta-outline">Semua pesanan saya</Link>
              <Link to="/search" className="btn btn-ta-outline">Lanjut belanja</Link>
            </div>
          </div>

          <div className="ta-card mt-3">
            <div className="ta-card-head"><h6>Detail pesanan</h6>
              <span className="ta-badge ta-badge-warn">Menunggu konfirmasi penjual</span></div>
            <div className="ta-card-pad">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="ta-eyebrow mb-2">Dikirim ke</div>
                  <div className="ta-sm">
                    <strong>{order.buyer}</strong><br />
                    {order.address}
                  </div>
                  <div className="ta-eyebrow mt-3 mb-2">Kurir</div>
                  <div className="d-flex align-items-center gap-2">
                    <ProviderLogo code={pv?.logo} />
                    <div className="ta-sm">
                      <strong>{pv?.name}</strong><br />
                      <span className="ta-faint">{pv?.service} · {pv?.etaMin}-{pv?.etaMax} hari kerja</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="ta-eyebrow mb-2">Pembayaran</div>
                  <div className="ta-sm">{order.payment}<br /><span className="ta-faint">Ditahan sampai paket diterima gerai</span></div>
                  <div className="ta-eyebrow mt-3 mb-2">Dibuat</div>
                  <div className="ta-sm ta-mono">{order.placed}</div>
                </div>
              </div>

              <hr className="ta-sep my-3" />
              {order.items.map(it => {
                const p = product(it.productId);
                return p ? (
                  <div key={it.productId + it.variant} className="d-flex gap-3 py-2">
                    <img src={p.images[0]} alt="" className="ta-thumb-lg" />
                    <div className="flex-grow-1">
                      <div className="ta-sm fw-semibold">{p.title}</div>
                      <div className="ta-xs ta-faint">{it.variant} · {it.qty} pcs</div>
                    </div>
                    <div className="fw-semibold">{usd(p.price * it.qty)}</div>
                  </div>
                ) : null;
              })}
              <hr className="ta-sep my-3" />
              <div className="d-flex justify-content-between">
                <span className="fw-semibold">Total dibayar</span>
                <span className="ta-display" style={{ fontSize: '1.3rem' }}>{usd(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="ta-card ta-card-pad mt-3">
            <div className="ta-eyebrow mb-3">Langkah berikutnya</div>
            <div className="row g-3">
              {[
                ['bi-clock-history', 'Konfirmasi penjual', 'Sebagian besar kios Tanah Abang mengonfirmasi dalam 4 jam kerja.'],
                ['bi-shop-window', 'Antar ke gerai', 'Paket dipindai di gerai yang ada di blok penjual.'],
                ['bi-airplane', 'Ekspor & pelacakan', `${pv?.name} menjemput dari hub kami dan nomor resi Anda aktif.`],
              ].map(([i, t, d]) => (
                <div key={t} className="col-md-4">
                  <i className={`bi ${i}`} style={{ fontSize: '1.2rem', color: 'var(--ta-brand)' }} />
                  <div className="fw-semibold ta-sm mt-2">{t}</div>
                  <div className="ta-xs ta-muted">{d}</div>
                </div>
              ))}
            </div>
            <hr className="ta-sep my-3" />
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span className="ta-sm ta-muted">Ada pertanyaan tentang pesanan ini?</span>
              <Link to="/messages" className="btn btn-ta-outline btn-sm"><i className="bi bi-chat-dots me-1" />Chat {s.name}</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

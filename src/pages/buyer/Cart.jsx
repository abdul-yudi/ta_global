import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, usd, discountFor } from '../../data/store';
import { QtyStepper, Empty, Steps } from '../../components/ui';
import ProductCard from '../../components/ProductCard';

export default function Cart() {
  const { state, cartLines, subtotal, seller, dispatch, toast } = useStore();
  const nav = useNavigate();
  const [code, setCode] = useState(state.voucher?.code || '');

  const groups = cartLines.reduce((acc, l) => {
    if (!l.product) return acc;
    (acc[l.product.sellerId] = acc[l.product.sellerId] || []).push(l);
    return acc;
  }, {});

  const estShipping = Object.keys(groups).length * 24.5;
  const { productOff } = discountFor(state.voucher, subtotal, estShipping);

  const applyVoucher = e => {
    e.preventDefault();
    const v = state.vouchers.find(x => x.code.toLowerCase() === code.trim().toLowerCase());
    if (!v) { toast(`Voucher “${code}” tidak dikenali`, 'danger'); return; }
    if (subtotal < v.minSpend) { toast(`${v.code} butuh minimum belanja ${usd(v.minSpend)}`, 'warn'); return; }
    dispatch({ type: 'voucher:apply', voucher: v });
    toast(`${v.code} dipakai — ${v.label}`);
  };

  if (!cartLines.length) {
    return (
      <main className="container py-5">
        <div className="ta-card">
          <Empty icon="bi-cart3" title="Keranjang Anda masih kosong" sub="Jelajahi lantai pasar dan tambahkan beberapa lot.">
            <Link to="/search" className="btn btn-ta">Mulai belanja</Link>
          </Empty>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <div className="mb-4"><Steps steps={['Keranjang', 'Checkout', 'Pembayaran', 'Selesai']} current={0} /></div>
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h1 style={{ fontSize: '1.375rem', margin: 0 }}>Keranjang belanja</h1>
            <button className="btn btn-ta-ghost btn-sm" onClick={() => { dispatch({ type: 'cart:clear' }); toast('Keranjang dikosongkan', 'info'); }}>
              <i className="bi bi-trash me-1" />Kosongkan
            </button>
          </div>

          {Object.entries(groups).map(([sid, lines]) => {
            const s = seller(sid);
            const groupTotal = lines.reduce((a, l) => a + l.lineTotal, 0);
            return (
              <div key={sid} className="ta-card mb-3">
                <div className="ta-card-head">
                  <div className="d-flex align-items-center gap-2">
                    <span className="ta-avatar">{s.name.slice(0, 2).toUpperCase()}</span>
                    <div>
                      <Link to={`/search?seller=${sid}`} className="ta-sm fw-semibold" style={{ color: 'var(--ta-ink)' }}>{s.name}</Link>
                      <div className="ta-xs ta-faint">{s.block} · dikirim dari Jakarta</div>
                    </div>
                  </div>
                  <Link to="/messages" className="btn btn-ta-ghost btn-sm"><i className="bi bi-chat-dots" /></Link>
                </div>

                {lines.map(l => (
                  <div key={`${l.productId}-${l.variant}`} className="d-flex gap-3 p-3" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                    <Link to={`/product/${l.productId}`} style={{ flex: 'none' }}>
                      <img src={l.product.images[0]} alt="" className="ta-thumb-lg" style={{ width: 84, height: 84 }} />
                    </Link>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <Link to={`/product/${l.productId}`} className="ta-sm fw-semibold d-block" style={{ color: 'var(--ta-ink)' }}>
                        {l.product.title}
                      </Link>
                      <div className="ta-xs ta-faint mt-1">Varian: {l.variant} · {l.product.weight} kg/satuan</div>
                      <div className="d-flex align-items-center gap-3 mt-2">
                        <QtyStepper value={l.qty} onChange={q => dispatch({ type: 'cart:qty', index: l.index, qty: q })}
                          min={l.product.moq} max={l.product.stock} />
                        <button className="btn btn-ta-ghost btn-sm" onClick={() => { dispatch({ type: 'cart:remove', index: l.index }); toast('Barang dihapus', 'info'); }}>
                          <i className="bi bi-trash me-1" />Hapus
                        </button>
                        <button className="btn btn-ta-ghost btn-sm" onClick={() => dispatch({ type: 'wishlist:toggle', productId: l.productId })}>
                          <i className="bi bi-heart me-1" />Simpan
                        </button>
                      </div>
                      {l.qty < l.product.moq && (
                        <div className="ta-badge ta-badge-warn mt-2"><i className="bi bi-exclamation-triangle" />Di bawah MOQ {l.product.moq}</div>
                      )}
                    </div>
                    <div className="text-end" style={{ flex: 'none' }}>
                      <div className="fw-semibold">{usd(l.lineTotal)}</div>
                      <div className="ta-xs ta-faint">{usd(l.product.price)} / satuan</div>
                    </div>
                  </div>
                ))}

                <div className="d-flex justify-content-between align-items-center px-3 py-2 ta-sm" style={{ background: '#fbfcfd' }}>
                  <span className="ta-faint">
                    <i className="bi bi-box-seam me-1" />
                    {lines.reduce((a, l) => a + l.qty * l.product.weight, 0).toFixed(2)} kg · satu karton gabungan
                  </span>
                  <span>Subtotal kios <strong className="ms-1">{usd(groupTotal)}</strong></span>
                </div>
              </div>
            );
          })}

          <div className="ta-card ta-card-pad">
            <div className="ta-eyebrow mb-2">Sering dibeli bersama isi keranjang Anda</div>
            <div className="row g-3">
              {state.products.filter(p => p.status === 'active').slice(6, 12).map(p => (
                <div key={p.id} className="col-6 col-md-4 col-lg-2"><ProductCard product={p} compact /></div>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- ringkasan ---------------- */}
        <div className="col-lg-4">
          <div className="ta-sticky-side d-grid gap-3">
            <div className="ta-card">
              <div className="ta-card-head"><h6>Ringkasan pesanan</h6></div>
              <div className="ta-card-pad">
                <dl className="mb-0">
                  <div className="ta-kv"><dt>Barang ({cartLines.reduce((a, l) => a + l.qty, 0)} pcs)</dt><dd>{usd(subtotal)}</dd></div>
                  <div className="ta-kv"><dt>Jumlah pengiriman</dt><dd>{Object.keys(groups).length} kios</dd></div>
                  <div className="ta-kv"><dt>Ongkos kirim</dt><dd className="ta-faint">dihitung saat checkout</dd></div>
                  {productOff > 0 && (
                    <div className="ta-kv"><dt>Voucher {state.voucher.code}</dt><dd style={{ color: 'var(--ta-ok)' }}>−{usd(productOff)}</dd></div>
                  )}
                </dl>
                <hr className="ta-sep my-3" />
                <div className="d-flex justify-content-between align-items-baseline">
                  <span className="fw-semibold">Perkiraan subtotal</span>
                  <span className="ta-display" style={{ fontSize: '1.35rem' }}>{usd(subtotal - productOff)}</span>
                </div>
                <button className="btn btn-ta btn-lg w-100 mt-3" onClick={() => nav('/checkout')}>
                  Lanjut ke checkout <i className="bi bi-arrow-right ms-1" />
                </button>
                <Link to="/search" className="btn btn-ta-outline w-100 mt-2">Lanjut belanja</Link>
              </div>
            </div>

            <div className="ta-card">
              <div className="ta-card-head"><h6>Kode voucher</h6></div>
              <div className="ta-card-pad">
                <form className="input-group" onSubmit={applyVoucher}>
                  <input className="form-control" placeholder="Masukkan kode" value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())} />
                  <button className="btn btn-ta-outline" type="submit">Pakai</button>
                </form>
                {state.voucher && (
                  <div className="ta-flat p-2 mt-2 d-flex align-items-center gap-2" style={{ background: 'var(--ta-ok-soft)', borderColor: '#cfe6da' }}>
                    <i className="bi bi-ticket-perforated-fill" style={{ color: 'var(--ta-ok)' }} />
                    <div className="flex-grow-1">
                      <div className="ta-sm fw-semibold">{state.voucher.code}</div>
                      <div className="ta-xs ta-muted">{state.voucher.label}</div>
                    </div>
                    <button className="btn-close" style={{ fontSize: '.6rem' }}
                      onClick={() => { dispatch({ type: 'voucher:clear' }); setCode(''); }} aria-label="Lepas voucher" />
                  </div>
                )}
                <div className="ta-eyebrow mt-3 mb-2">Tersedia untuk Anda</div>
                <div className="d-grid gap-2">
                  {state.vouchers.map(v => (
                    <button key={v.code} className="ta-flat p-2 text-start d-flex gap-2 align-items-center"
                      onClick={() => { setCode(v.code); dispatch({ type: 'voucher:apply', voucher: v }); toast(`${v.code} dipakai`); }}>
                      <i className="bi bi-ticket-perforated" style={{ color: 'var(--ta-accent)' }} />
                      <span className="flex-grow-1">
                        <span className="ta-sm fw-semibold d-block">{v.code}</span>
                        <span className="ta-xs ta-faint">{v.label}</span>
                      </span>
                      <span className="ta-xs fw-semibold" style={{ color: 'var(--ta-brand)' }}>Pakai</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="ta-card ta-card-pad">
              <div className="d-flex gap-2 ta-sm">
                <i className="bi bi-credit-card-2-front" style={{ color: 'var(--ta-brand)' }} />
                <div>
                  <div className="fw-semibold">Kami menerima</div>
                  <div className="d-flex gap-2 mt-2">
                    <span className="ta-logo-chip">VISA</span>
                    <span className="ta-logo-chip">MC</span>
                    <span className="ta-logo-chip">AMEX</span>
                  </div>
                  <div className="ta-xs ta-faint mt-2">3-D Secure · ditagih dalam USD</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

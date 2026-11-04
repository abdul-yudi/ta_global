import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, usd, quote, discountFor } from '../../data/store';
import { COUNTRIES, freshTracking } from '../../data/mock';
import { Steps, ProviderLogo, Empty } from '../../components/ui';

const CARD_BRANDS = [
  { id: 'visa', label: 'Visa', chip: 'VISA' },
  { id: 'mastercard', label: 'Mastercard', chip: 'MC' },
];

export default function Checkout() {
  const { state, cartLines, subtotal, seller, dispatch, toast } = useStore();
  const nav = useNavigate();

  const [addr, setAddr] = useState({
    name: state.user.name, phone: '+971 50 123 4567', email: state.user.email,
    line1: 'Villa 24, Al Barsha 2', line2: 'Dekat Mall of the Emirates',
    city: 'Dubai', state: 'Dubai', zip: '00000', country: state.user.country,
  });
  const [carriers, setCarriers] = useState({});
  const [pay, setPay] = useState('visa');
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvc: '', save: true });
  const [code, setCode] = useState(state.voucher?.code || '');
  const [terms, setTerms] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const groups = useMemo(() => cartLines.reduce((acc, l) => {
    if (!l.product) return acc;
    (acc[l.product.sellerId] = acc[l.product.sellerId] || []).push(l);
    return acc;
  }, {}), [cartLines]);

  const available = state.providers.filter(p => p.active && state.sellerShipping[p.id]);
  const pickCarrier = sid => carriers[sid] || available[0]?.id;

  const shipRows = Object.entries(groups).map(([sid, lines]) => {
    const kg = lines.reduce((a, l) => a + l.qty * l.product.weight, 0);
    const pid = pickCarrier(sid);
    return { sid, lines, kg, pid, cost: quote(pid, state.providers, kg) };
  });
  const shipping = shipRows.reduce((a, r) => a + r.cost, 0);
  const { productOff, shipOff } = discountFor(state.voucher, subtotal, shipping);
  const insurance = +(subtotal * 0.01).toFixed(2);
  const total = Math.max(0, subtotal - productOff + shipping - shipOff + insurance);

  const applyVoucher = e => {
    e.preventDefault();
    const v = state.vouchers.find(x => x.code.toLowerCase() === code.trim().toLowerCase());
    if (!v) { toast(`Voucher “${code}” tidak dikenali`, 'danger'); return; }
    if (subtotal < v.minSpend) { toast(`${v.code} butuh minimum belanja ${usd(v.minSpend)}`, 'warn'); return; }
    dispatch({ type: 'voucher:apply', voucher: v });
    toast(`${v.code} dipakai`);
  };

  const placeOrder = () => {
    if (!terms) { toast('Centang persetujuan syarat untuk melanjutkan', 'warn'); return; }
    if (card.number.replace(/\s/g, '').length < 15) { toast('Masukkan nomor kartu yang valid', 'warn'); return; }
    if (!card.name || card.exp.length < 5 || card.cvc.length < 3) { toast('Lengkapi data kartu', 'warn'); return; }
    setSubmitting(true);

    const first = shipRows[0];
    const id = 'TA-' + Math.floor(24100 + Math.random() * 800);
    const order = {
      id,
      buyer: addr.name, country: addr.country, city: addr.city,
      sellerId: first.sid,
      items: first.lines.map(l => ({ productId: l.productId, qty: l.qty, variant: l.variant })),
      status: 'awaiting_acceptance', stage: 0, provider: first.pid,
      total: +total.toFixed(2),
      placed: new Date().toISOString().slice(0, 16).replace('T', ' '),
      awb: '-', address: `${addr.line1}, ${addr.city}, ${addr.country}`,
      payment: `${pay === 'visa' ? 'Visa' : 'Mastercard'} •••• ${card.number.replace(/\D/g, '').slice(-4) || '0000'}`,
      weight: first.kg.toFixed(2),
      note,
      tracking: freshTracking(addr.country, addr.city),
    };
    dispatch({ type: 'order:create', order });
    toast(`Pesanan ${id} dibuat — pembayaran diotorisasi`);
    nav(`/order-placed/${id}`);
  };

  if (!cartLines.length) {
    return (
      <main className="container py-5">
        <div className="ta-card"><Empty icon="bi-bag" title="Tidak ada yang bisa di-checkout" sub="Keranjang Anda masih kosong.">
          <Link to="/search" className="btn btn-ta">Jelajahi produk</Link>
        </Empty></div>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <div className="mb-4"><Steps steps={['Keranjang', 'Checkout', 'Pembayaran', 'Selesai']} current={1} /></div>
      <h1 style={{ fontSize: '1.375rem' }} className="mb-3">Checkout</h1>

      <div className="row g-3">
        <div className="col-lg-8 d-grid gap-3">
          {/* ---------- 1. alamat ---------- */}
          <div className="ta-card">
            <div className="ta-card-head"><h6><span className="ta-badge ta-badge-neutral me-2">1</span>Alamat pengiriman</h6>
              <span className="ta-xs ta-faint">Tujuan internasional</span></div>
            <div className="ta-card-pad">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nama lengkap penerima</label>
                  <input className="form-control" value={addr.name} onChange={e => setAddr(a => ({ ...a, name: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Telepon (dengan kode negara)</label>
                  <input className="form-control" value={addr.phone} onChange={e => setAddr(a => ({ ...a, phone: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label">Email untuk info pengiriman</label>
                  <input className="form-control" type="email" value={addr.email} onChange={e => setAddr(a => ({ ...a, email: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label">Alamat baris 1</label>
                  <input className="form-control" value={addr.line1} onChange={e => setAddr(a => ({ ...a, line1: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label">Alamat baris 2 <span className="ta-faint fw-normal">(opsional)</span></label>
                  <input className="form-control" value={addr.line2} onChange={e => setAddr(a => ({ ...a, line2: e.target.value }))} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Kota</label>
                  <input className="form-control" value={addr.city} onChange={e => setAddr(a => ({ ...a, city: e.target.value }))} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Provinsi / negara bagian</label>
                  <input className="form-control" value={addr.state} onChange={e => setAddr(a => ({ ...a, state: e.target.value }))} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Kode pos</label>
                  <input className="form-control" value={addr.zip} onChange={e => setAddr(a => ({ ...a, zip: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Negara</label>
                  <select className="form-select" value={addr.country} onChange={e => setAddr(a => ({ ...a, country: e.target.value }))}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <div className="ta-flat p-2 ta-xs ta-muted w-100">
                    <i className="bi bi-info-circle me-1" />
                    Bea masuk dan PPN lokal ditagih kurir saat barang tiba (skema DAP).
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- 2. pengiriman ---------- */}
          <div className="ta-card">
            <div className="ta-card-head"><h6><span className="ta-badge ta-badge-neutral me-2">2</span>Metode pengiriman</h6>
              <span className="ta-xs ta-faint">{shipRows.length} pengiriman dari kios</span></div>
            <div className="ta-card-pad d-grid gap-4">
              {shipRows.map(r => {
                const s = seller(r.sid);
                return (
                  <div key={r.sid}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="ta-avatar">{s.name.slice(0, 2).toUpperCase()}</span>
                      <div className="flex-grow-1">
                        <div className="ta-sm fw-semibold">{s.name}</div>
                        <div className="ta-xs ta-faint">
                          {r.lines.length} jenis barang · {r.kg.toFixed(2)} kg · waktu proses {state.handlingDays} hari
                        </div>
                      </div>
                    </div>
                    <div className="d-grid gap-2">
                      {available.map(p => {
                        const cost = quote(p.id, state.providers, r.kg);
                        const on = r.pid === p.id;
                        return (
                          <label key={p.id} className={`ta-ship-option d-flex align-items-center gap-3 ${on ? 'active' : ''}`}>
                            <input className="form-check-input mt-0" type="radio" name={`ship-${r.sid}`} checked={on}
                              onChange={() => setCarriers(c => ({ ...c, [r.sid]: p.id }))} />
                            <ProviderLogo code={p.logo} />
                            <div className="flex-grow-1">
                              <div className="ta-sm fw-semibold">{p.name} · {p.service}</div>
                              <div className="ta-xs ta-faint">
                                Tiba dalam {p.etaMin + state.handlingDays}-{p.etaMax + state.handlingDays} hari · pelacakan sampai tujuan
                                {p.apiMode === 'sandbox' && <span className="ta-badge ta-badge-warn ms-2">tarif uji coba</span>}
                              </div>
                            </div>
                            <div className="fw-semibold">{usd(cost)}</div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div>
                <label className="form-label">Catatan untuk penjual <span className="ta-faint fw-normal">(opsional)</span></label>
                <textarea className="form-control" rows="2" value={note} onChange={e => setNote(e.target.value)}
                  placeholder="mis. campur 12 krem dan 12 dusty rose, tandai karton dengan nama toko saya" />
              </div>
            </div>
          </div>

          {/* ---------- 3. pembayaran ---------- */}
          <div className="ta-card">
            <div className="ta-card-head"><h6><span className="ta-badge ta-badge-neutral me-2">3</span>Metode pembayaran</h6>
              <span className="ta-badge ta-badge-ok"><i className="bi bi-lock-fill" />3-D Secure</span></div>
            <div className="ta-card-pad">
              <div className="row g-2 mb-3">
                {CARD_BRANDS.map(b => (
                  <div className="col-sm-6" key={b.id}>
                    <label className={`ta-pay-option d-flex align-items-center gap-3 h-100 ${pay === b.id ? 'active' : ''}`}>
                      <input className="form-check-input mt-0" type="radio" name="pay" checked={pay === b.id} onChange={() => setPay(b.id)} />
                      <span className="ta-logo-chip">{b.chip}</span>
                      <span>
                        <span className="ta-sm fw-semibold d-block">{b.label}</span>
                        <span className="ta-xs ta-faint">Kartu kredit atau debit</span>
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="row g-3">
                <div className="col-md-7">
                  <label className="form-label">Nomor kartu</label>
                  <div className="input-group">
                    <input className="form-control ta-num" inputMode="numeric" placeholder="0000 0000 0000 0000"
                      value={card.number}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setCard(c => ({ ...c, number: digits.replace(/(.{4})/g, '$1 ').trim() }));
                      }} />
                    <span className="input-group-text"><i className="bi bi-credit-card-2-front" /></span>
                  </div>
                  <div className="form-text">Gunakan kartu uji coba Anda sendiri selama payment gateway masih sandbox.</div>
                </div>
                <div className="col-md-5">
                  <label className="form-label">Nama di kartu</label>
                  <input className="form-control" value={card.name} placeholder="Sesuai yang tercetak di kartu"
                    onChange={e => setCard(c => ({ ...c, name: e.target.value }))} />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label">Masa berlaku</label>
                  <input className="form-control ta-num" placeholder="BB/TT" value={card.exp}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                      setCard(c => ({ ...c, exp: v }));
                    }} />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label">CVC</label>
                  <input className="form-control ta-num" placeholder="123" value={card.cvc}
                    onChange={e => setCard(c => ({ ...c, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="savecard" checked={card.save}
                      onChange={e => setCard(c => ({ ...c, save: e.target.checked }))} />
                    <label className="form-check-label" htmlFor="savecard">Simpan kartu ini agar checkout lebih cepat</label>
                  </div>
                </div>
              </div>

              <hr className="ta-sep my-3" />
              <div className="d-flex align-items-start gap-2 ta-xs ta-faint">
                <i className="bi bi-shield-lock" />
                <span>
                  Data kartu ditokenisasi oleh payment gateway; TAGlobal tidak pernah menyimpan nomor lengkapnya.
                  Dana ditahan di rekening penampungan dan baru dilepas ke penjual setelah gerai mengonfirmasi penerimaan paket.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- ringkasan ---------- */}
        <div className="col-lg-4">
          <div className="ta-sticky-side d-grid gap-3">
            <div className="ta-card">
              <div className="ta-card-head"><h6>Total pesanan</h6><Link to="/cart" className="ta-xs">Ubah keranjang</Link></div>
              <div className="ta-card-pad">
                {shipRows.map(r => (
                  <div key={r.sid} className="pb-2 mb-2" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                    <div className="ta-xs ta-faint mb-1">{seller(r.sid).name}</div>
                    {r.lines.map(l => (
                      <div key={l.variant + l.productId} className="d-flex gap-2 py-1">
                        <img src={l.product.images[0]} alt="" className="ta-thumb" />
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="ta-xs text-truncate">{l.product.title}</div>
                          <div className="ta-xs ta-faint">{l.qty} × {usd(l.product.price)} · {l.variant}</div>
                        </div>
                        <div className="ta-sm fw-semibold">{usd(l.lineTotal)}</div>
                      </div>
                    ))}
                  </div>
                ))}

                <form className="input-group mb-3" onSubmit={applyVoucher}>
                  <input className="form-control" placeholder="Kode voucher" value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())} />
                  <button className="btn btn-ta-outline" type="submit">Pakai</button>
                </form>

                <dl className="mb-0">
                  <div className="ta-kv"><dt>Subtotal</dt><dd>{usd(subtotal)}</dd></div>
                  <div className="ta-kv"><dt>Ongkir internasional</dt><dd>{usd(shipping)}</dd></div>
                  <div className="ta-kv"><dt>Asuransi kiriman (1%)</dt><dd>{usd(insurance)}</dd></div>
                  {productOff > 0 && <div className="ta-kv"><dt>Voucher {state.voucher.code}</dt><dd style={{ color: 'var(--ta-ok)' }}>−{usd(productOff)}</dd></div>}
                  {shipOff > 0 && <div className="ta-kv"><dt>Voucher ongkir</dt><dd style={{ color: 'var(--ta-ok)' }}>−{usd(shipOff)}</dd></div>}
                  <div className="ta-kv"><dt>Bea masuk</dt><dd className="ta-faint">dibayar saat barang tiba</dd></div>
                </dl>
                <hr className="ta-sep my-3" />
                <div className="d-flex justify-content-between align-items-baseline">
                  <span className="fw-semibold">Total dibayar sekarang</span>
                  <span className="ta-display" style={{ fontSize: '1.4rem' }}>{usd(total)}</span>
                </div>
                <div className="ta-xs ta-faint text-end">ditagih dalam USD</div>

                <div className="form-check mt-3">
                  <input className="form-check-input" type="checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)} />
                  <label className="form-check-label ta-xs" htmlFor="terms">
                    Saya menyetujui syarat pembeli, deklarasi ekspor dan kebijakan pengembalian dana TAGlobal.
                  </label>
                </div>

                <button className="btn btn-ta btn-lg w-100 mt-3" disabled={submitting} onClick={placeOrder}>
                  <i className="bi bi-lock-fill me-1" />
                  {submitting ? 'Memproses…' : `Bayar ${usd(total)}`}
                </button>
                <div className="d-flex justify-content-center gap-2 mt-2">
                  <span className="ta-logo-chip">VISA</span>
                  <span className="ta-logo-chip">MC</span>
                  <span className="ta-logo-chip">3DS</span>
                </div>
              </div>
            </div>

            <div className="ta-card ta-card-pad ta-xs ta-muted">
              <div className="fw-semibold ta-sm mb-2">Setelah ini</div>
              <ol className="mb-0 ps-3">
                <li>Penjual mengonfirmasi stok (biasanya dalam beberapa jam).</li>
                <li>Paket dikemas lalu diantar ke gerai TAGlobal.</li>
                <li>Nomor resi muncul di halaman Pesanan begitu kurir menjemput.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

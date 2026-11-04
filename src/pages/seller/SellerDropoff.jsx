import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, usd, num } from '../../data/store';
import { PageHead, Card, StatusBadge, ProviderLogo, Empty, FakeQR, Modal } from '../../components/ui';

export default function SellerDropoff() {
  const { state, sellerOrders, provider, hub, product, dispatch, toast } = useStore();
  const [sel, setSel] = useState([]);
  const [manifest, setManifest] = useState(null);
  const [slot, setSlot] = useState('Hari ini 13:00 - 15:00');

  const ready = sellerOrders.filter(o => o.status === 'to_dropoff');
  const atHub = sellerOrders.filter(o => o.status === 'at_hub');
  const myHub = hub(state.sellerHub);
  const selected = ready.filter(o => sel.includes(o.id));
  const totalWeight = selected.reduce((a, o) => a + parseFloat(o.weight), 0);

  const createManifest = () => {
    if (!sel.length) { toast('Pilih minimal satu paket', 'warn'); return; }
    setManifest({
      code: 'DO-' + Math.floor(100000 + Math.random() * 899999),
      orders: selected, slot, hub: myHub,
    });
  };

  const confirmDrop = () => {
    manifest.orders.forEach(o => {
      const awb = (provider(o.provider)?.code || 'TA') + Math.floor(1000000000 + Math.random() * 8999999999);
      dispatch({ type: 'order:status', orderId: o.id, status: 'at_hub', stage: 2, awb });
    });
    toast(`${manifest.orders.length} paket diterima di ${myHub.name.replace('TAGlobal Gerai - ', '')}`);
    setManifest(null);
    setSel([]);
  };

  return (
    <>
      <PageHead eyebrow="Pengiriman" title="Antar ke gerai"
        sub="Bawa paket yang sudah dikemas ke loket TAGlobal di blok Anda — urusan ekspor kami yang tangani">
        <Link to="/seller/orders" className="btn btn-ta-outline">Kembali ke pesanan</Link>
        <button className="btn btn-ta" onClick={createManifest} disabled={!sel.length}>
          <i className="bi bi-upc-scan me-1" />Buat kode antar ({sel.length})
        </button>
      </PageHead>

      <div className="row g-3">
        <div className="col-xl-8 d-grid gap-3">
          {/* ---------- ready to drop ---------- */}
          <Card title={`Siap diantar (${ready.length})`} pad={false}
            action={ready.length > 0 && (
              <button className="btn btn-ta-ghost btn-sm" onClick={() => setSel(sel.length === ready.length ? [] : ready.map(o => o.id))}>
                {sel.length === ready.length ? 'Batalkan pilihan' : 'Pilih semua'}
              </button>
            )}>
            {!ready.length && <Empty icon="bi-box-seam" title="Belum ada paket yang menunggu"
              sub="Terima pesanan dulu, kemas, lalu paketnya muncul di sini.">
              <Link to="/seller/orders" className="btn btn-ta btn-sm">Buka pesanan</Link>
            </Empty>}

            {ready.map(o => (
              <label key={o.id} className="d-flex gap-3 p-3" style={{ borderBottom: '1px solid var(--ta-line-soft)', cursor: 'pointer' }}>
                <input className="form-check-input mt-1" type="checkbox" checked={sel.includes(o.id)}
                  onChange={e => setSel(v => e.target.checked ? [...v, o.id] : v.filter(x => x !== o.id))} />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="ta-mono fw-semibold">{o.id}</span>
                    <StatusBadge status={o.status} />
                    <span className="ta-xs ta-faint">diterima {o.placed}</span>
                  </div>
                  <div className="d-flex gap-2 mt-2 align-items-center">
                    {o.items.map(it => {
                      const p = product(it.productId);
                      return p ? <img key={it.productId} src={p.images[0]} alt="" className="ta-thumb" /> : null;
                    })}
                    <div className="ta-xs ta-muted">
                      {o.items.reduce((a, i) => a + i.qty, 0)} pcs · {o.weight} kg · ke {o.city}, {o.country}
                    </div>
                  </div>
                </div>
                <div className="text-end" style={{ flex: 'none' }}>
                  <div className="d-flex align-items-center gap-2 justify-content-end">
                    <ProviderLogo code={provider(o.provider)?.logo} />
                  </div>
                  <div className="ta-xs ta-faint mt-1">{provider(o.provider)?.service}</div>
                  <div className="fw-semibold ta-sm mt-1">{usd(o.total)}</div>
                </div>
              </label>
            ))}
          </Card>

          {/* ---------- at hub ---------- */}
          <Card title={`Sudah diterima gerai (${atHub.length})`} pad={false}>
            {!atHub.length && <div className="p-3 ta-sm ta-faint">Belum ada paket di loket saat ini.</div>}
            {atHub.length > 0 && (
              <div className="ta-table-wrap">
                <table className="ta-table">
                  <thead><tr><th>Pesanan</th><th>Resi</th><th>Kurir</th><th>Tujuan</th><th>Berat</th><th>Status</th></tr></thead>
                  <tbody>
                    {atHub.map(o => (
                      <tr key={o.id}>
                        <td className="ta-mono fw-semibold">{o.id}</td>
                        <td className="ta-mono ta-xs">{o.awb}</td>
                        <td><ProviderLogo code={provider(o.provider)?.logo} /></td>
                        <td className="ta-sm">{o.city}, {o.country}</td>
                        <td className="ta-num">{o.weight} kg</td>
                        <td><StatusBadge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* ---------- packing guide ---------- */}
          <Card title="Aturan pengemasan untuk ekspor">
            <div className="row g-4">
              {[
                ['bi-box', 'Kardus dua lapis', 'Pakai kardus ekspor untuk paket di atas 5 kg. Plastik polybag hanya untuk barang lunak di bawah 2 kg.'],
                ['bi-tag', 'Satu label per paket', 'Cetak label antar dan tempel rata di sisi terlebar. Jangan menutupi kode QR.'],
                ['bi-droplet', 'Pelindung lembap', 'Tekstil harus dibungkus plastik sebelum dikardus — udara lembap di hub bisa menodai kain terang.'],
                ['bi-clock', 'Cut-off 15:00', `${myHub?.name.replace('TAGlobal Gerai - ', '')} menutup penerimaan pukul ${myHub?.cutoff}. Lewat jam itu paket berangkat hari kerja berikutnya.`],
              ].map(([i, t, d]) => (
                <div key={t} className="col-md-6 d-flex gap-3">
                  <i className={`bi ${i}`} style={{ fontSize: '1.3rem', color: 'var(--ta-brand)' }} />
                  <div>
                    <div className="fw-semibold ta-sm">{t}</div>
                    <div className="ta-xs ta-muted">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ---------- side ---------- */}
        <div className="col-xl-4">
          <div className="ta-sticky-side d-grid gap-3">
            <Card title="Gerai tujuan Anda">
              <div className="d-flex gap-2 align-items-start">
                <i className="bi bi-shop-window" style={{ fontSize: '1.4rem', color: 'var(--ta-brand)' }} />
                <div>
                  <div className="fw-semibold">{myHub?.name.replace('TAGlobal Gerai - ', '')}</div>
                  <div className="ta-xs ta-muted">{myHub?.address}</div>
                </div>
              </div>
              <hr className="ta-sep my-3" />
              <div className="ta-kv"><dt>Jam buka</dt><dd>{myHub?.open}</dd></div>
              <div className="ta-kv"><dt>Batas penerimaan</dt><dd>{myHub?.cutoff}</dd></div>
              <div className="ta-kv"><dt>Penjual dilayani</dt><dd>{num(myHub?.sellers)}</dd></div>
              <div className="ta-kv"><dt>Paket / 30 hari</dt><dd>{num(myHub?.intake30d)}</dd></div>
              <label className="form-label mt-3">Ganti gerai tujuan</label>
              <select className="form-select form-select-sm" value={state.sellerHub}
                onChange={e => { dispatch({ type: 'shipping:hub', hubId: e.target.value }); toast('Gerai utama diperbarui'); }}>
                {state.hubs.filter(h => h.status === 'open').map(h => (
                  <option key={h.id} value={h.id}>{h.name.replace('TAGlobal Gerai - ', '')}</option>
                ))}
              </select>
            </Card>

            <Card title="Dipilih untuk antaran ini">
              {!selected.length && <div className="ta-sm ta-faint">Centang paket yang akan Anda bawa ke loket.</div>}
              {selected.length > 0 && (
                <>
                  <div className="ta-kv"><dt>Jumlah paket</dt><dd>{selected.length}</dd></div>
                  <div className="ta-kv"><dt>Total berat</dt><dd>{totalWeight.toFixed(2)} kg</dd></div>
                  <div className="ta-kv"><dt>Nilai barang</dt><dd>{usd(selected.reduce((a, o) => a + o.total, 0))}</dd></div>
                  <div className="ta-kv"><dt>Kurir</dt>
                    <dd>{[...new Set(selected.map(o => provider(o.provider)?.code))].join(', ')}</dd></div>
                  <label className="form-label mt-3">Jadwal antar</label>
                  <select className="form-select form-select-sm mb-3" value={slot} onChange={e => setSlot(e.target.value)}>
                    <option>Hari ini 09:00 - 11:00</option>
                    <option>Hari ini 11:00 - 13:00</option>
                    <option>Hari ini 13:00 - 15:00</option>
                    <option>Besok 09:00 - 11:00</option>
                  </select>
                  <button className="btn btn-ta w-100" onClick={createManifest}>
                    <i className="bi bi-upc-scan me-1" />Buat kode antar
                  </button>
                </>
              )}
            </Card>

            <Card title="Cara kerja di loket">
              <ol className="ps-3 mb-0 ta-sm ta-muted">
                <li className="mb-2">Buat satu kode antar untuk semua paket dalam satu kali antaran.</li>
                <li className="mb-2">Tunjukkan QR di loket — petugas memindainya sekali.</li>
                <li className="mb-2">Tiap paket ditimbang, difoto dan diberi nomor resi.</li>
                <li className="mb-2">Hub mengonsolidasi dan menyerahkan ke kurir sore harinya.</li>
                <li>Dana Anda dicairkan setelah pemindaian tercatat.</li>
              </ol>
            </Card>
          </div>
        </div>
      </div>

      {/* ---------- manifest modal ---------- */}
      <Modal open={!!manifest} onClose={() => setManifest(null)} title="Kode antar" size="modal-lg"
        footer={(
          <>
            <button className="btn btn-ta-outline btn-sm" onClick={() => setManifest(null)}>Tutup</button>
            <button className="btn btn-ta-outline btn-sm" onClick={() => toast('Manifes dikirim ke printer (prototipe)', 'info')}>
              <i className="bi bi-printer me-1" />Cetak manifes
            </button>
            <button className="btn btn-ta btn-sm" onClick={confirmDrop}>
              <i className="bi bi-check-lg me-1" />Konfirmasi pindai loket
            </button>
          </>
        )}>
        {manifest && (
          <div className="ta-flat p-4">
            <div className="row g-4 align-items-center">
              <div className="col-md-4 text-center">
                <FakeQR seed={manifest.code} />
                <div className="ta-mono fw-bold mt-2">{manifest.code}</div>
                <div className="ta-xs ta-faint">Tunjukkan di loket</div>
              </div>
              <div className="col-md-8">
                <div className="ta-eyebrow mb-1">Diantar ke</div>
                <div className="fw-semibold">{manifest.hub?.name}</div>
                <div className="ta-xs ta-muted">{manifest.hub?.address}</div>
                <div className="row g-2 mt-3 ta-sm">
                  <div className="col-6"><div className="ta-xs ta-faint">Jadwal</div><strong>{manifest.slot}</strong></div>
                  <div className="col-6"><div className="ta-xs ta-faint">Jumlah paket</div><strong>{manifest.orders.length}</strong></div>
                  <div className="col-6"><div className="ta-xs ta-faint">Total berat</div><strong>{totalWeight.toFixed(2)} kg</strong></div>
                  <div className="col-6"><div className="ta-xs ta-faint">Penjual</div><strong>{state.sellerId.toUpperCase()}</strong></div>
                </div>
              </div>
            </div>
            <hr className="ta-sep my-3" />
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead><tr><th>#</th><th>Pesanan</th><th>Tujuan</th><th>Kurir</th><th>Berat</th></tr></thead>
                <tbody>
                  {manifest.orders.map((o, i) => (
                    <tr key={o.id}>
                      <td className="ta-faint">{i + 1}</td>
                      <td className="ta-mono fw-semibold">{o.id}</td>
                      <td className="ta-sm">{o.city}, {o.country}</td>
                      <td><ProviderLogo code={provider(o.provider)?.logo} /></td>
                      <td className="ta-num">{o.weight} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

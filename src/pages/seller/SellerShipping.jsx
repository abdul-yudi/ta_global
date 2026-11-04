import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, usd, num, quote } from '../../data/store';
import { COUNTRIES } from '../../data/mock';
import { PageHead, Card, ProviderLogo, Empty } from '../../components/ui';

export default function SellerShipping() {
  const { state, dispatch, toast, hub } = useStore();
  const [testWeight, setTestWeight] = useState(1.5);
  const [testDest, setTestDest] = useState('United States');
  const [freeOver, setFreeOver] = useState(250);
  const [freeShip, setFreeShip] = useState(true);

  const enabled = state.providers.filter(p => p.active && state.sellerShipping[p.id]);
  const offered = state.providers.filter(p => p.active);
  const inactive = state.providers.filter(p => !p.active);

  return (
    <>
      <PageHead eyebrow="Pengiriman" title="Pengaturan kirim"
        sub="Pilih jasa kirim yang boleh dipakai pembeli. Daftar jasa kirimnya ditentukan super admin.">
        <Link to="/seller/dropoff" className="btn btn-ta-outline"><i className="bi bi-shop-window me-1" />Antar ke gerai</Link>
        <button className="btn btn-ta" onClick={() => toast('Pengaturan pengiriman disimpan')}>
          <i className="bi bi-check-lg me-1" />Simpan pengaturan
        </button>
      </PageHead>

      <div className="row g-3">
        <div className="col-xl-8 d-grid gap-3">
          {/* ---------- carrier toggles ---------- */}
          <Card title="Jasa kirim yang tampil ke pembeli" pad={false}
            action={<span className="ta-xs ta-faint">{enabled.length} dari {offered.length} aktif</span>}>
            {offered.map(p => {
              const on = !!state.sellerShipping[p.id];
              return (
                <div key={p.id} className="p-3" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <ProviderLogo code={p.logo} />
                    <div className="flex-grow-1" style={{ minWidth: 180 }}>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold">{p.name}</span>
                        {p.apiMode === 'sandbox' && <span className="ta-badge ta-badge-warn">tarif uji coba</span>}
                        {p.apiStatus === 'error' && <span className="ta-badge ta-badge-danger">API bermasalah</span>}
                      </div>
                      <div className="ta-xs ta-faint">{p.service} · {p.countries} negara · {p.etaMin}-{p.etaMax} hari kerja</div>
                    </div>
                    <div className="text-end d-none d-md-block" style={{ width: 130 }}>
                      <div className="ta-xs ta-faint">0,5 kg pertama</div>
                      <div className="fw-semibold">{usd(p.baseRate)}</div>
                    </div>
                    <div className="text-end d-none d-md-block" style={{ width: 120 }}>
                      <div className="ta-xs ta-faint">per kg berikutnya</div>
                      <div className="fw-semibold">{usd(p.perKg)}</div>
                    </div>
                    <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" checked={on}
                        onChange={e => {
                          dispatch({ type: 'shipping:toggle', providerId: p.id, on: e.target.checked });
                          toast(`${p.name} ${e.target.checked ? 'diaktifkan' : 'dinonaktifkan'} untuk toko Anda`, e.target.checked ? 'ok' : 'info');
                        }} />
                    </div>
                  </div>
                  {on && (
                    <div className="row g-2 mt-3 ps-md-5">
                      <div className="col-md-4">
                        <label className="form-label">Biaya penanganan</label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">$</span>
                          <input className="form-control ta-num" defaultValue="0.00" />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Berat maksimum paket</label>
                        <div className="input-group input-group-sm">
                          <input className="form-control ta-num" defaultValue="30" />
                          <span className="input-group-text">kg</span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Negara dikecualikan</label>
                        <select className="form-select form-select-sm">
                          <option>Tidak ada — kirim ke semua</option>
                          <option>Kecualikan 1 negara</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {!offered.length && <Empty icon="bi-truck" title="Belum ada jasa kirim yang aktif di marketplace" />}
          </Card>

          {/* ---------- not available ---------- */}
          {inactive.length > 0 && (
            <Card title="Tidak tersedia di marketplace" pad={false}>
              {inactive.map(p => (
                <div key={p.id} className="d-flex align-items-center gap-3 p-3" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                  <ProviderLogo code={p.logo} />
                  <div className="flex-grow-1">
                    <div className="ta-sm fw-semibold ta-faint">{p.name}</div>
                    <div className="ta-xs ta-faint">{p.service} · {p.countries} negara</div>
                  </div>
                  <span className="ta-badge ta-badge-neutral">dinonaktifkan admin</span>
                </div>
              ))}
              <div className="p-3 ta-xs ta-faint">
                Jasa kirim didaftarkan secara terpusat. Ajukan permintaan lewat
                {' '}<Link to="/seller/messages">pesan ke CS TAGlobal</Link>.
              </div>
            </Card>
          )}

          {/* ---------- handling & free shipping ---------- */}
          <Card title="Waktu proses & gratis ongkir">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Waktu proses (hari)</label>
                <select className="form-select" value={state.handlingDays}
                  onChange={e => { dispatch({ type: 'shipping:handling', days: +e.target.value }); toast('Waktu proses diperbarui'); }}>
                  {[1, 2, 3, 4, 5].map(d => <option key={d} value={d}>{d} hari</option>)}
                </select>
                <div className="form-text">Ditambahkan ke estimasi kurir yang dilihat pembeli.</div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Gerai utama</label>
                <select className="form-select" value={state.sellerHub}
                  onChange={e => { dispatch({ type: 'shipping:hub', hubId: e.target.value }); toast('Gerai utama diperbarui'); }}>
                  {state.hubs.filter(h => h.status === 'open').map(h => (
                    <option key={h.id} value={h.id}>{h.name.replace('TAGlobal Gerai - ', '')}</option>
                  ))}
                </select>
                <div className="form-text">Batas penerimaan {hub(state.sellerHub)?.cutoff} setiap hari.</div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Batas gratis ongkir</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input className="form-control ta-num" value={freeOver} disabled={!freeShip}
                    onChange={e => setFreeOver(e.target.value.replace(/\D/g, ''))} />
                </div>
                <div className="form-check form-switch mt-2">
                  <input className="form-check-input" type="checkbox" id="freeship" checked={freeShip}
                    onChange={e => setFreeShip(e.target.checked)} />
                  <label className="form-check-label ta-xs" htmlFor="freeship">Gratis ongkir EMS di atas nilai ini</label>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ---------- side rail ---------- */}
        <div className="col-xl-4">
          <div className="ta-sticky-side d-grid gap-3">
            <Card title="Kalkulator ongkir">
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label">Berat (kg)</label>
                  <input className="form-control form-control-sm ta-num" value={testWeight}
                    onChange={e => setTestWeight(e.target.value.replace(/[^\d.]/g, ''))} />
                </div>
                <div className="col-6">
                  <label className="form-label">Tujuan</label>
                  <select className="form-select form-select-sm" value={testDest} onChange={e => setTestDest(e.target.value)}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {enabled.length === 0 && <div className="ta-sm ta-faint">Aktifkan jasa kirim untuk melihat tarifnya.</div>}
              {enabled.map(p => (
                <div key={p.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                  <ProviderLogo code={p.logo} />
                  <div className="flex-grow-1">
                    <div className="ta-xs fw-semibold">{p.name}</div>
                    <div className="ta-xs ta-faint">total {p.etaMin + state.handlingDays}-{p.etaMax + state.handlingDays} hari</div>
                  </div>
                  <strong className="ta-sm">{usd(quote(p.id, state.providers, parseFloat(testWeight) || 0.5))}</strong>
                </div>
              ))}
              <div className="ta-xs ta-faint mt-2">
                Tarif diambil dari API kurir yang diatur admin. Pembeli melihat angka yang persis sama.
              </div>
            </Card>

            <Card title="Performa pengiriman Anda">
              {[
                ['Ketepatan antar ke gerai', '96%', 96],
                ['Paket bulan ini', '318', 70],
                ['Rata-rata berat per paket', '1,4 kg', 40],
                ['Retur / tidak terkirim', '0,6%', 6],
              ].map(([l, v, pct]) => (
                <div key={l} className="mb-3">
                  <div className="d-flex justify-content-between ta-sm mb-1"><span className="ta-muted">{l}</span><strong>{v}</strong></div>
                  <div className="ta-barrow-track"><span className="ta-barrow-fill" style={{ width: `${pct}%` }} /></div>
                </div>
              ))}
            </Card>

            <Card title="Pemakaian kurir — 30 hari">
              {state.providers.filter(p => p.active).map(p => {
                const max = Math.max(...state.providers.map(x => x.volume30d)) || 1;
                return (
                  <div key={p.id} className="d-flex align-items-center gap-2 py-1">
                    <span className="ta-xs" style={{ width: 54 }}>{p.code}</span>
                    <span className="ta-barrow-track"><span className="ta-barrow-fill" style={{ width: `${(p.volume30d / max) * 100}%` }} /></span>
                    <span className="ta-xs ta-num" style={{ width: 46, textAlign: 'right' }}>{num(p.volume30d)}</span>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

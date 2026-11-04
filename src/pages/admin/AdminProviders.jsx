import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, usd, num } from '../../data/store';
import { PageHead, Card, ProviderLogo, Empty, Modal, ConfirmDialog } from '../../components/ui';

const blank = {
  name: '', code: '', logo: '', service: '', etaMin: 3, etaMax: 7,
  baseRate: '', perKg: '', countries: '', active: true,
  apiStatus: 'not_connected', apiMode: 'sandbox', apiKey: '', endpoint: '', webhook: '',
  tracking: '', volume30d: 0, lastSync: '-',
};

export default function AdminProviders() {
  const { state, dispatch, toast } = useStore();
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);

  const save = () => {
    if (!form.name || !form.code) { toast('Nama dan kode wajib diisi', 'warn'); return; }
    const payload = {
      ...form,
      id: form.id || 'p-' + form.code.toLowerCase().replace(/\W/g, ''),
      logo: form.logo || form.code.toUpperCase().slice(0, 5),
      baseRate: +form.baseRate || 0, perKg: +form.perKg || 0,
      countries: +form.countries || 0, etaMin: +form.etaMin, etaMax: +form.etaMax,
    };
    dispatch({ type: form.id ? 'provider:update' : 'provider:create', provider: payload });
    if (!form.id) dispatch({ type: 'shipping:toggle', providerId: payload.id, on: false });
    toast(form.id ? `${payload.name} diperbarui` : `${payload.name} ditambahkan ke marketplace`);
    setForm(null);
  };

  return (
    <>
      <PageHead eyebrow="Logistik" title="Jasa pengiriman"
        sub="Kurir yang tersedia untuk seluruh marketplace. Penjual hanya bisa memakai yang aktif di sini.">
        <Link to="/admin/integrations" className="btn btn-ta-outline"><i className="bi bi-plug me-1" />Integrasi API</Link>
        <button className="btn btn-ta" onClick={() => setForm({ ...blank })}>
          <i className="bi bi-plus-lg me-1" />Tambah jasa kirim
        </button>
      </PageHead>

      <div className="row g-3 mb-3">
        {[
          ['Jasa kirim', state.providers.length, 'bi-truck'],
          ['Aktif', state.providers.filter(p => p.active).length, 'bi-check-circle'],
          ['API tersambung', state.providers.filter(p => p.apiStatus === 'connected').length, 'bi-plug'],
          ['Paket / 30 hari', num(state.providers.reduce((a, p) => a + p.volume30d, 0)), 'bi-box-seam'],
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

      <Card pad={false} title="Katalog kurir">
        {!state.providers.length && <Empty icon="bi-truck" title="Belum ada jasa kirim yang dikonfigurasi"
          sub="Tambahkan FedEx, DHL atau EMS agar penjual bisa menawarkan pengiriman internasional.">
          <button className="btn btn-ta btn-sm" onClick={() => setForm({ ...blank })}>Tambah jasa kirim</button>
        </Empty>}

        {state.providers.map(p => (
          <div key={p.id} className="p-3" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <ProviderLogo code={p.logo} />
              <div style={{ minWidth: 190 }}>
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-semibold">{p.name}</span>
                  <span className="ta-badge ta-badge-neutral ta-mono">{p.code}</span>
                </div>
                <div className="ta-xs ta-faint">{p.service || 'layanan belum diisi'}</div>
              </div>

              <div className="d-none d-lg-block" style={{ width: 110 }}>
                <div className="ta-xs ta-faint">estimasi</div>
                <div className="ta-sm">{p.etaMin}-{p.etaMax} hari</div>
              </div>
              <div className="d-none d-lg-block" style={{ width: 110 }}>
                <div className="ta-xs ta-faint">0,5 kg pertama</div>
                <div className="ta-sm fw-semibold">{usd(p.baseRate)}</div>
              </div>
              <div className="d-none d-lg-block" style={{ width: 100 }}>
                <div className="ta-xs ta-faint">per kg lanjutan</div>
                <div className="ta-sm fw-semibold">{usd(p.perKg)}</div>
              </div>
              <div className="d-none d-xl-block" style={{ width: 90 }}>
                <div className="ta-xs ta-faint">negara</div>
                <div className="ta-sm">{p.countries}</div>
              </div>
              <div className="d-none d-xl-block" style={{ width: 100 }}>
                <div className="ta-xs ta-faint">volume 30h</div>
                <div className="ta-sm">{num(p.volume30d)}</div>
              </div>

              <div style={{ width: 120 }}>
                <div className="ta-xs ta-faint">API</div>
                <span className={`ta-badge ${p.apiStatus === 'connected' ? 'ta-badge-ok'
                  : p.apiStatus === 'error' ? 'ta-badge-danger' : 'ta-badge-neutral'}`}>
                  {p.apiStatus === 'connected' ? (p.apiMode === 'sandbox' ? 'sandbox' : 'live') : p.apiStatus === 'error' ? 'error' : 'belum diatur'}
                </span>
              </div>

              <div className="ms-auto d-flex align-items-center gap-2">
                <div className="form-check form-switch mb-0" title={p.active ? 'Aktif untuk penjual' : 'Disembunyikan dari penjual'}>
                  <input className="form-check-input" type="checkbox" checked={p.active}
                    onChange={e => {
                      dispatch({ type: 'provider:update', provider: { id: p.id, active: e.target.checked } });
                      toast(`${p.name} ${e.target.checked ? 'diaktifkan' : 'dinonaktifkan'} untuk seluruh marketplace`, e.target.checked ? 'ok' : 'warn');
                    }} />
                </div>
                <Link to="/admin/integrations" className="btn btn-ta-ghost btn-sm" title="Pengaturan API"><i className="bi bi-plug" /></Link>
                <button className="btn btn-ta-outline btn-sm" title="Ubah" onClick={() => setForm({ ...p })}><i className="bi bi-pencil" /></button>
                <button className="btn btn-ta-danger btn-sm" title="Hapus" onClick={() => setDel(p)}><i className="bi bi-trash" /></button>
              </div>
            </div>
            {!p.active && (
              <div className="ta-xs ta-faint mt-2 ps-5">
                <i className="bi bi-info-circle me-1" />
                Disembunyikan dari pengaturan kirim semua penjual dan dari halaman checkout.
              </div>
            )}
          </div>
        ))}
      </Card>

      <div className="row g-3 mt-3">
        <div className="col-lg-6">
          <Card title="Perbandingan tarif" pad={false}>
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead><tr><th>Kurir</th><th>0,5 kg</th><th>1 kg</th><th>5 kg</th><th>10 kg</th><th>20 kg</th></tr></thead>
                <tbody>
                  {state.providers.filter(p => p.active).map(p => (
                    <tr key={p.id}>
                      <td><div className="d-flex align-items-center gap-2"><ProviderLogo code={p.logo} /><span className="ta-xs">{p.code}</span></div></td>
                      {[0.5, 1, 5, 10, 20].map(kg => (
                        <td key={kg} className="ta-num ta-sm">{usd(p.baseRate + p.perKg * kg)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 ta-xs ta-faint">
              Tarif indikatif. Bila API tersambung, tarif langsung dari kurir menggantikan tabel ini di checkout.
            </div>
          </Card>
        </div>
        <div className="col-lg-6">
          <Card title="Pemakaian oleh penjual">
            {state.providers.map(p => {
              const on = state.sellerShipping[p.id];
              return (
                <div key={p.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                  <ProviderLogo code={p.logo} />
                  <div className="flex-grow-1">
                    <div className="ta-sm fw-semibold">{p.name}</div>
                    <div className="ta-xs ta-faint">
                      {p.active ? `dipakai ${p.id === 'p-ems' ? '91' : p.id === 'p-dhl' ? '78' : p.id === 'p-fedex' ? '64' : '12'}% penjual` : 'tidak aktif'}
                    </div>
                  </div>
                  <span className={`ta-badge ${on ? 'ta-badge-ok' : 'ta-badge-neutral'}`}>
                    {on ? 'penjual demo: aktif' : 'penjual demo: mati'}
                  </span>
                </div>
              );
            })}
          </Card>
        </div>
      </div>

      {/* ---------- add / edit ---------- */}
      <Modal open={!!form} onClose={() => setForm(null)} size="modal-lg"
        title={form?.id ? `Ubah ${form.name}` : 'Tambah jasa pengiriman'}
        footer={(
          <>
            <button className="btn btn-ta-outline btn-sm" onClick={() => setForm(null)}>Batal</button>
            <button className="btn btn-ta btn-sm" onClick={save}>{form?.id ? 'Simpan perubahan' : 'Tambah'}</button>
          </>
        )}>
        {form && (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nama jasa kirim</label>
              <input className="form-control" value={form.name} placeholder="mis. Aramex"
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Kode</label>
              <input className="form-control ta-mono" value={form.code} placeholder="ARMX"
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Teks badge</label>
              <input className="form-control" value={form.logo} placeholder="ARMX" maxLength={5}
                onChange={e => setForm({ ...form, logo: e.target.value.toUpperCase() })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Nama layanan</label>
              <input className="form-control" value={form.service} placeholder="Priority Parcel"
                onChange={e => setForm({ ...form, service: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Estimasi min (hari)</label>
              <input className="form-control ta-num" value={form.etaMin}
                onChange={e => setForm({ ...form, etaMin: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Estimasi maks (hari)</label>
              <input className="form-control ta-num" value={form.etaMax}
                onChange={e => setForm({ ...form, etaMax: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Tarif dasar (0,5 kg pertama)</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input className="form-control ta-num" value={form.baseRate}
                  onChange={e => setForm({ ...form, baseRate: e.target.value.replace(/[^\d.]/g, '') })} />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Tarif per kg lanjutan</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input className="form-control ta-num" value={form.perKg}
                  onChange={e => setForm({ ...form, perKg: e.target.value.replace(/[^\d.]/g, '') })} />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Jumlah negara tujuan</label>
              <input className="form-control ta-num" value={form.countries}
                onChange={e => setForm({ ...form, countries: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div className="col-12">
              <label className="form-label">Awalan URL pelacakan</label>
              <input className="form-control ta-mono" value={form.tracking} placeholder="https://kurir.com/track?no="
                onChange={e => setForm({ ...form, tracking: e.target.value })} />
              <div className="form-text">Nomor resi ditempelkan di belakang URL ini pada halaman pelacakan pembeli.</div>
            </div>
            <div className="col-12">
              <div className="ta-flat p-3">
                <div className="ta-toggle-row" style={{ borderBottom: 0 }}>
                  <div>
                    <div className="ta-sm fw-semibold">Aktif di marketplace</div>
                    <div className="ta-xs ta-faint">Bila dimatikan, tidak ada penjual yang bisa menawarkannya dan kurir ini hilang dari checkout.</div>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input className="form-check-input" type="checkbox" checked={form.active}
                      onChange={e => setForm({ ...form, active: e.target.checked })} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 ta-xs ta-faint">
              <i className="bi bi-info-circle me-1" />
              Sambungkan API tarif dan pelacakan setelah disimpan, di halaman
              {' '}<Link to="/admin/integrations">integrasi API</Link>.
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Hapus jasa kirim ini?"
        body={`${del?.name} akan dihapus dari marketplace. Penjual kehilangan opsi ini dan kurir ini hilang dari checkout. Pengiriman yang sedang berjalan tetap memakai nomor resi dan tautan pelacakannya.`}
        confirmLabel="Hapus jasa kirim"
        onConfirm={() => { dispatch({ type: 'provider:delete', providerId: del.id }); toast(`${del.name} dihapus`, 'warn'); setDel(null); }} />
    </>
  );
}

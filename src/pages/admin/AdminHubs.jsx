import React, { useState } from 'react';
import { useStore, num } from '../../data/store';
import { PageHead, Card, Empty, Modal, BarRow } from '../../components/ui';

export default function AdminHubs() {
  const { state, toast } = useStore();
  const [form, setForm] = useState(null);

  const maxIntake = Math.max(...state.hubs.map(h => h.intake30d));

  return (
    <>
      <PageHead eyebrow="Logistik" title="Gerai &amp; hub"
        sub="Loket penerimaan paket di dalam pasar dan hub ekspor yang mengonsolidasikannya">
        <button className="btn btn-ta" onClick={() => setForm({ name: '', address: '', open: '08:00 - 17:00', cutoff: '15:00', status: 'open' })}>
          <i className="bi bi-plus-lg me-1" />Tambah gerai
        </button>
      </PageHead>

      <div className="row g-3 mb-3">
        {[
          ['Loket gerai', state.hubs.filter(h => h.status === 'open').length, 'bi-shop-window'],
          ['Hub ekspor', state.hubs.filter(h => h.status === 'hub').length, 'bi-building'],
          ['Penjual dilayani', num(state.hubs.reduce((a, h) => a + h.sellers, 0)), 'bi-people'],
          ['Paket / 30 hari', num(state.hubs.reduce((a, h) => a + h.intake30d, 0)), 'bi-box-seam'],
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

      <div className="row g-3">
        <div className="col-xl-8">
          <Card title="Jaringan" pad={false}>
            {!state.hubs.length && <Empty icon="bi-shop-window" title="Belum ada titik penerimaan paket" />}
            {state.hubs.map(h => (
              <div key={h.id} className="p-3" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                <div className="d-flex gap-3 flex-wrap align-items-start">
                  <i className={`bi ${h.status === 'hub' ? 'bi-building' : 'bi-shop-window'}`}
                    style={{ fontSize: '1.4rem', color: 'var(--ta-brand)' }} />
                  <div className="flex-grow-1" style={{ minWidth: 220 }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="fw-semibold">{h.name}</span>
                      <span className={`ta-badge ${h.status === 'hub' ? 'ta-badge-info' : 'ta-badge-ok'}`}>
                        {h.status === 'hub' ? 'hub ekspor' : 'buka'}
                      </span>
                    </div>
                    <div className="ta-xs ta-faint">{h.address}</div>
                    <div className="ta-xs ta-muted mt-1">
                      <i className="bi bi-clock me-1" />{h.open} · batas penerimaan {h.cutoff}
                    </div>
                  </div>
                  <div className="d-none d-md-block" style={{ width: 110 }}>
                    <div className="ta-xs ta-faint">penjual</div>
                    <div className="ta-sm fw-semibold">{num(h.sellers)}</div>
                  </div>
                  <div className="d-none d-md-block" style={{ width: 120 }}>
                    <div className="ta-xs ta-faint">paket / 30 hari</div>
                    <div className="ta-sm fw-semibold">{num(h.intake30d)}</div>
                  </div>
                  <div className="d-flex gap-1">
                    <button className="btn btn-ta-outline btn-sm" onClick={() => setForm({ ...h })}><i className="bi bi-pencil" /></button>
                    <button className="btn btn-ta-danger btn-sm" onClick={() => toast(`${h.name} akan dihapus (prototipe menjaga jaringan tetap utuh)`, 'warn')}>
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div className="col-xl-4 d-grid gap-3">
          <Card title="Porsi penerimaan — 30 hari">
            {state.hubs.map(h => (
              <BarRow key={h.id} label={h.name.replace('TAGlobal ', '').replace('Gerai - ', '')} value={h.intake30d} max={maxIntake} />
            ))}
          </Card>
          <Card title="Hari ini di loket">
            {[
              ['Paket diterima', '412'],
              ['Menunggu dijemput kurir', '118'],
              ['Diserahkan hari ini', '294'],
              ['Ditolak saat penerimaan', '6'],
              ['Rata-rata terima ke serah', '7,2 jam'],
            ].map(([l, v]) => (
              <div key={l} className="ta-kv" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                <dt>{l}</dt><dd>{v}</dd>
              </div>
            ))}
          </Card>
          <Card title="Alasan paket ditolak">
            {[['Pengemasan kurang kuat', 58], ['Label tidak terbaca', 22], ['Melebihi berat layanan', 12], ['Barang terlarang', 8]].map(([l, pct]) => (
              <div key={l} className="mb-2">
                <div className="d-flex justify-content-between ta-xs mb-1"><span className="ta-muted">{l}</span><strong>{pct}%</strong></div>
                <div className="ta-barrow-track"><span className="ta-barrow-fill" style={{ width: `${pct}%` }} /></div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? `Ubah ${form.name}` : 'Tambah titik penerimaan'}
        footer={(
          <>
            <button className="btn btn-ta-outline btn-sm" onClick={() => setForm(null)}>Batal</button>
            <button className="btn btn-ta btn-sm" onClick={() => { toast(form?.id ? 'Gerai diperbarui' : 'Gerai ditambahkan ke jaringan'); setForm(null); }}>
              Simpan
            </button>
          </>
        )}>
        {form && (
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Nama</label>
              <input className="form-control" value={form.name} placeholder="TAGlobal Gerai - Blok F"
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="form-label">Alamat</label>
              <input className="form-control" value={form.address} placeholder="Blok F Lt. 1, Jl. …, Jakarta Pusat"
                onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Jam buka</label>
              <input className="form-control" value={form.open} onChange={e => setForm({ ...form, open: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Batas penerimaan</label>
              <input className="form-control" value={form.cutoff} onChange={e => setForm({ ...form, cutoff: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Tipe</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="open">Loket gerai</option>
                <option value="hub">Hub ekspor</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

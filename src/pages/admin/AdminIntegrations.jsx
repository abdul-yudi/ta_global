import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, num } from '../../data/store';
import { PageHead, Card, ProviderLogo, Empty, Modal } from '../../components/ui';

const LOGS = [
  ['08:30:12', 'DHL', 'POST /mydhlapi/rates', 200, '184 ms'],
  ['08:30:09', 'EMS', 'POST /ems/v2/rate', 200, '612 ms'],
  ['08:29:58', 'FEDEX', 'POST /rate/v1', 200, '221 ms'],
  ['08:29:44', 'UPS', 'POST /api/rating/v1', 401, '98 ms'],
  ['08:29:31', 'DHL', 'GET /track/shipments', 200, '156 ms'],
  ['08:29:02', 'FEDEX', 'GET /track/v1/trackingnumbers', 200, '203 ms'],
  ['08:28:40', 'UPS', 'POST /api/rating/v1', 401, '104 ms'],
  ['08:28:11', 'EMS', 'GET /ems/v2/track', 200, '740 ms'],
];

const API_STATUS_ID = { connected: 'tersambung', error: 'gagal', not_connected: 'belum diatur' };

export default function AdminIntegrations() {
  const { state, dispatch, toast } = useStore();
  const [sel, setSel] = useState(state.providers[0]?.id);
  const [draft, setDraft] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const p = state.providers.find(x => x.id === sel) || state.providers[0];

  const openEditor = () => setDraft({
    id: p.id, endpoint: p.endpoint, webhook: p.webhook, apiKey: '', apiMode: p.apiMode,
    accountNo: '', meterNo: '', secret: '',
  });

  const saveCreds = () => {
    dispatch({
      type: 'provider:update',
      provider: {
        id: draft.id, endpoint: draft.endpoint, webhook: draft.webhook, apiMode: draft.apiMode,
        apiStatus: draft.apiKey || p.apiKey ? 'connected' : 'not_connected',
        apiKey: draft.apiKey ? `${p.code.toLowerCase()}_${draft.apiMode === 'production' ? 'live' : 'sbx'}_${draft.apiKey.slice(0, 4)}••••${draft.apiKey.slice(-4)}` : p.apiKey,
        lastSync: new Date().toISOString().slice(0, 16).replace('T', ' '),
      },
    });
    toast(`Kredensial ${p.name} disimpan — koneksi tersambung kembali`);
    setDraft(null);
  };

  const runTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      const ok = p.apiStatus !== 'error' && p.apiStatus !== 'not_connected';
      setTestResult(ok
        ? { ok: true, text: 'Tarif diterima: $27.90 untuk 1,0 kg ke Dubai, AE · 184 ms' }
        : { ok: false, text: 'HTTP 401 — kredensial ditolak kurir. Periksa API key dan nomor akun.' });
    }, 700);
  };

  if (!p) {
    return (
      <>
        <PageHead eyebrow="Logistik" title="Integrasi API" />
        <Card><Empty icon="bi-plug" title="Belum ada jasa kirim yang bisa dikonfigurasi"
          sub="Tambahkan jasa pengiriman terlebih dahulu."><Link to="/admin/providers" className="btn btn-ta btn-sm">Tambah jasa kirim</Link></Empty></Card>
      </>
    );
  }

  return (
    <>
      <PageHead eyebrow="Logistik" title="Integrasi API"
        sub="Tarif, pembuatan label dan webhook pelacakan untuk tiap kurir">
        <Link to="/admin/providers" className="btn btn-ta-outline"><i className="bi bi-truck me-1" />Jasa kirim</Link>
        <button className="btn btn-ta" onClick={() => toast('Semua koneksi kurir disinkronkan ulang')}>
          <i className="bi bi-arrow-repeat me-1" />Sinkron ulang semua
        </button>
      </PageHead>

      <div className="row g-3">
        {/* ---------- carrier picker ---------- */}
        <div className="col-lg-3">
          <Card title="Kurir" pad={false}>
            {state.providers.map(x => (
              <button key={x.id} className={`ta-side-link w-100 ${sel === x.id ? 'active' : ''}`}
                style={{ borderRadius: 0 }} onClick={() => { setSel(x.id); setTestResult(null); }}>
                <ProviderLogo code={x.logo} />
                <span className="flex-grow-1 text-start" style={{ minWidth: 0 }}>
                  <span className="d-block text-truncate">{x.name}</span>
                </span>
                <span className="ta-dot" style={{
                  background: x.apiStatus === 'connected' ? 'var(--ta-ok)'
                    : x.apiStatus === 'error' ? 'var(--ta-danger)' : 'var(--ta-ink-faint)',
                }} />
              </button>
            ))}
          </Card>

          <Card title="Kesehatan koneksi" className="mt-3">
            {state.providers.map(x => (
              <div key={x.id} className="d-flex justify-content-between align-items-center py-1">
                <span className="ta-xs">{x.code}</span>
                <span className={`ta-badge ${x.apiStatus === 'connected' ? 'ta-badge-ok'
                  : x.apiStatus === 'error' ? 'ta-badge-danger' : 'ta-badge-neutral'}`}>
                  {x.apiStatus === 'connected' ? 'sehat' : x.apiStatus === 'error' ? 'bermasalah' : 'belum diatur'}
                </span>
              </div>
            ))}
          </Card>
        </div>

        {/* ---------- detail ---------- */}
        <div className="col-lg-9 d-grid gap-3">
          <Card title={`${p.name} — koneksi`}
            action={(
              <div className="d-flex gap-2">
                <button className="btn btn-ta-outline btn-sm" onClick={runTest} disabled={testing}>
                  <i className="bi bi-activity me-1" />{testing ? 'Menguji…' : 'Uji koneksi'}
                </button>
                <button className="btn btn-ta btn-sm" onClick={openEditor}>
                  <i className="bi bi-key me-1" />Ubah kredensial
                </button>
              </div>
            )}>
            {p.apiStatus === 'error' && (
              <div className="ta-flat p-3 mb-3 d-flex gap-2" style={{ background: 'var(--ta-danger-soft)', borderColor: '#f3d2d7' }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ color: 'var(--ta-danger)' }} />
                <div className="ta-sm">
                  <strong>Autentikasi gagal.</strong> Tarif kurir ini kembali memakai tabel statis,
                  sehingga pembeli bisa melihat harga yang tidak mutakhir. Ganti API key untuk memulihkan tarif langsung.
                </div>
              </div>
            )}
            {testResult && (
              <div className="ta-flat p-3 mb-3 d-flex gap-2"
                style={{ background: testResult.ok ? 'var(--ta-ok-soft)' : 'var(--ta-danger-soft)', borderColor: testResult.ok ? '#cfe6da' : '#f3d2d7' }}>
                <i className={`bi ${testResult.ok ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}
                  style={{ color: testResult.ok ? 'var(--ta-ok)' : 'var(--ta-danger)' }} />
                <div className="ta-sm ta-mono">{testResult.text}</div>
              </div>
            )}

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Lingkungan</label>
                <div className="d-flex gap-2">
                  {['sandbox', 'production'].map(m => (
                    <button key={m} className={`ta-chip ${p.apiMode === m ? 'active' : ''}`}
                      onClick={() => {
                        dispatch({ type: 'provider:update', provider: { id: p.id, apiMode: m } });
                        toast(`${p.name} dialihkan ke ${m}`, m === 'production' ? 'warn' : 'info');
                      }}>
                      {m === 'sandbox' ? 'Sandbox / uji coba' : 'Produksi / live'}
                    </button>
                  ))}
                </div>
                <div className="form-text">
                  Tarif sandbox ditandai jelas sebagai tarif uji coba di halaman checkout.
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">API key</label>
                <div className="input-group">
                  <input className="form-control ta-mono" value={p.apiKey || 'belum dikonfigurasi'} readOnly />
                  <button className="btn btn-ta-outline" onClick={() => toast('Permintaan ganti key dikirim ke portal kurir', 'info')}>
                    Ganti
                  </button>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label">Endpoint tarif</label>
                <input className="form-control ta-mono" value={p.endpoint || 'belum dikonfigurasi'} readOnly />
              </div>
              <div className="col-12">
                <label className="form-label">Webhook pelacakan (kami menerima scan di sini)</label>
                <div className="input-group">
                  <input className="form-control ta-mono" value={p.webhook || 'belum dikonfigurasi'} readOnly />
                  <button className="btn btn-ta-outline" onClick={() => toast('URL webhook disalin', 'info')}>
                    <i className="bi bi-clipboard" />
                  </button>
                </div>
                <div className="form-text">Daftarkan URL ini di portal developer kurir agar event pemindaian terkirim ke kami.</div>
              </div>
            </div>

            <hr className="ta-sep my-3" />
            <div className="row g-3">
              {[
                ['Status', API_STATUS_ID[p.apiStatus] || p.apiStatus],
                ['Sinkron berhasil terakhir', p.lastSync],
                ['Paket / 30 hari', num(p.volume30d)],
                ['Negara dilayani', p.countries],
              ].map(([l, v]) => (
                <div key={l} className="col-6 col-md-3">
                  <div className="ta-xs ta-faint">{l}</div>
                  <div className="ta-sm fw-semibold">{v}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Fitur yang aktif untuk kurir ini">
            {[
              ['Tarif langsung', 'Tarif di checkout diambil langsung dari kurir.', true],
              ['Pembuatan label', 'Nomor resi dan label PDF dibuat saat paket masuk gerai.', true],
              ['Webhook pelacakan', 'Event pemindaian dikirim ke linimasa pembeli.', true],
              ['Pemesanan penjemputan', 'Hub otomatis meminta jadwal penjemputan.', p.code === 'DHL' || p.code === 'FEDEX'],
              ['Dokumen bea cukai elektronik', 'Invoice dan kode HS dikirim secara elektronik.', p.code !== 'EMS'],
              ['Estimasi bea masuk', 'Memperkirakan bea dan pajak di checkout.', false],
            ].map(([t, d, on]) => (
              <div className="ta-toggle-row" key={t}>
                <div>
                  <div className="ta-sm fw-semibold">{t}</div>
                  <div className="ta-xs ta-faint">{d}</div>
                </div>
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" defaultChecked={on}
                    onChange={e => toast(`${t} ${e.target.checked ? 'diaktifkan' : 'dinonaktifkan'} untuk ${p.name}`, 'info')} />
                </div>
              </div>
            ))}
          </Card>

          <Card title="Panggilan API terakhir" pad={false}
            action={<button className="btn btn-ta-ghost btn-sm" onClick={() => toast('Log lengkap diekspor (prototipe)', 'info')}>
              <i className="bi bi-download me-1" />Ekspor log</button>}>
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead><tr><th>Waktu</th><th>Kurir</th><th>Permintaan</th><th>Status</th><th>Latensi</th></tr></thead>
                <tbody>
                  {LOGS.map((l, i) => (
                    <tr key={i}>
                      <td className="ta-mono ta-xs">{l[0]}</td>
                      <td><span className="ta-logo-chip">{l[1]}</span></td>
                      <td className="ta-mono ta-xs ta-muted">{l[2]}</td>
                      <td>
                        <span className={`ta-badge ${l[3] === 200 ? 'ta-badge-ok' : 'ta-badge-danger'}`}>{l[3]}</span>
                      </td>
                      <td className="ta-num ta-xs">{l[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* ---------- credentials modal ---------- */}
      <Modal open={!!draft} onClose={() => setDraft(null)} size="modal-lg" title={`Kredensial ${p.name}`}
        footer={(
          <>
            <button className="btn btn-ta-outline btn-sm" onClick={() => setDraft(null)}>Batal</button>
            <button className="btn btn-ta btn-sm" onClick={saveCreds}>Simpan &amp; sambungkan</button>
          </>
        )}>
        {draft && (
          <>
            <div className="ta-flat p-2 mb-3 ta-xs ta-muted">
              <i className="bi bi-shield-lock me-1" />
              Kredensial disimpan terenkripsi dan tidak pernah ditampilkan ke penjual. Setelah disimpan hanya versi tersamar yang terlihat.
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Lingkungan</label>
                <select className="form-select" value={draft.apiMode} onChange={e => setDraft({ ...draft, apiMode: e.target.value })}>
                  <option value="sandbox">Sandbox / uji coba</option>
                  <option value="production">Produksi / live</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">API key / client ID</label>
                <input className="form-control ta-mono" value={draft.apiKey} placeholder="tempel key dari kurir"
                  onChange={e => setDraft({ ...draft, apiKey: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">API secret</label>
                <input className="form-control ta-mono" type="password" value={draft.secret} placeholder="••••••••"
                  onChange={e => setDraft({ ...draft, secret: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Nomor akun</label>
                <input className="form-control ta-mono" value={draft.accountNo}
                  onChange={e => setDraft({ ...draft, accountNo: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Nomor meter</label>
                <input className="form-control ta-mono" value={draft.meterNo}
                  onChange={e => setDraft({ ...draft, meterNo: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label">Endpoint tarif</label>
                <input className="form-control ta-mono" value={draft.endpoint}
                  onChange={e => setDraft({ ...draft, endpoint: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label">URL webhook pelacakan</label>
                <input className="form-control ta-mono" value={draft.webhook}
                  onChange={e => setDraft({ ...draft, webhook: e.target.value })} />
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

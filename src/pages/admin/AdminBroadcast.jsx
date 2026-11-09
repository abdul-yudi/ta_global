import React, { useState } from 'react';
import { useStore, num } from '../../data/store';
import { COUNTRIES, CATEGORIES } from '../../data/mock';
import { PageHead, Card, Modal } from '../../components/ui';
import { api } from '../../api/client';

const SENT = [
  ['2026-11-01 09:00', 'Semua penjual', 'Kalender ekspor Ramadan 2027', 1074, '68%'],
  ['2026-10-24 14:30', 'Pembeli â€” kawasan Teluk', 'Gratis ongkir DHL di atas $120 minggu ini', 8412, '42%'],
  ['2026-10-18 08:15', 'Penjual â€” Blok A', 'Perubahan jam buka loket gerai', 418, '81%'],
  ['2026-10-09 11:00', 'Semua pembeli', 'Perubahan aturan bea cukai untuk kiriman Uni Eropa', 23190, '37%'],
];

export default function AdminBroadcast() {
  const { state, toast } = useStore();
  const [aud, setAud] = useState('sellers');
  const [filters, setFilters] = useState({ status: '', block: '', category: '', country: '' });
  const [msg, setMsg] = useState({ subject: '', body: '', channel: ['inbox', 'email'], schedule: 'now' });
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const reach = aud === 'sellers'
    ? state.sellers.filter(s => !filters.status || s.status === filters.status).length * 179
    : 23190;
  const audLabel = aud === 'sellers' ? 'penjual' : 'pembeli';

  const toggleChannel = c => setMsg(m => ({
    ...m, channel: m.channel.includes(c) ? m.channel.filter(x => x !== c) : [...m.channel, c],
  }));

  return (
    <>
      <PageHead eyebrow="Komunikasi" title="Siaran"
        sub="Kirim pengumuman ke segmen penjual atau pembeli tertentu">
        <button className="btn btn-ta-outline" onClick={() => setPreview(true)}>
          <i className="bi bi-eye me-1" />Pratinjau
        </button>
        <button className="btn btn-ta" disabled={sending} onClick={async () => {
          if (!msg.subject || !msg.body) { toast('Perihal dan isi pesan wajib diisi', 'warn'); return; }
          setSending(true);
          try { const result = await api('/admin/broadcast', { method: 'POST', body: { subject: msg.subject, message: msg.body, audience: aud } }); toast(`Siaran terkirim ke ${num(result.delivered)} akun`); }
          catch (error) { toast(error.message, 'danger'); }
          finally { setSending(false); }
        }}>
          <i className="bi bi-send me-1" />{sending ? 'Mengirim…' : 'Kirim siaran'}
        </button>
      </PageHead>

      <div className="row g-3">
        <div className="col-xl-8 d-grid gap-3">
          <Card title="1 Â· Penerima">
            <div className="row g-2 mb-3">
              {[['sellers', 'Penjual', 'bi-shop', 'Toko yang berjualan di marketplace'],
                ['buyers', 'Pembeli', 'bi-bag', 'Pelanggan yang pernah memesan']].map(([id, t, i, d]) => (
                <div className="col-sm-6" key={id}>
                  <label className={`ta-pay-option d-flex align-items-center gap-3 h-100 ${aud === id ? 'active' : ''}`}>
                    <input className="form-check-input mt-0" type="radio" name="aud" checked={aud === id} onChange={() => setAud(id)} />
                    <i className={`bi ${i}`} style={{ fontSize: '1.2rem', color: 'var(--ta-brand)' }} />
                    <span>
                      <span className="ta-sm fw-semibold d-block">{t}</span>
                      <span className="ta-xs ta-faint">{d}</span>
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <div className="row g-3">
              {aud === 'sellers' ? (
                <>
                  <div className="col-md-4">
                    <label className="form-label">Status verifikasi</label>
                    <select className="form-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                      <option value="">Semua penjual</option>
                      <option value="verified">Hanya terverifikasi</option>
                      <option value="pending">Menunggu verifikasi</option>
                      <option value="suspended">Ditangguhkan</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Pasar / blok</label>
                    <select className="form-select" value={filters.block} onChange={e => setFilters({ ...filters, block: e.target.value })}>
                      <option value="">Semua blok</option>
                      <option>Blok A Tanah Abang</option>
                      <option>Blok B Tanah Abang</option>
                      <option>Metro Tanah Abang</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Kategori utama</label>
                    <select className="form-select" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                      <option value="">Semua kategori</option>
                      {CATEGORIES.map(c => <option key={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-md-4">
                    <label className="form-label">Negara</label>
                    <select className="form-select" value={filters.country} onChange={e => setFilters({ ...filters, country: e.target.value })}>
                      <option value="">Semua negara</option>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Riwayat pesanan</label>
                    <select className="form-select">
                      <option>Semua pembeli</option>
                      <option>Memesan dalam 30 hari terakhir</option>
                      <option>Pembeli berulang (2+ pesanan)</option>
                      <option>Belum pernah memesan</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Kategori yang dibeli</label>
                    <select className="form-select">
                      <option>Semua kategori</option>
                      {CATEGORIES.map(c => <option key={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="ta-flat p-3 mt-3 d-flex align-items-center gap-3">
              <i className="bi bi-people-fill" style={{ fontSize: '1.3rem', color: 'var(--ta-brand)' }} />
              <div>
                <div className="fw-semibold">{num(reach)} penerima</div>
                <div className="ta-xs ta-faint">diperkirakan dari filter segmen saat ini</div>
              </div>
            </div>
          </Card>

          <Card title="2 Â· Isi pesan">
            <label className="form-label">Perihal</label>
            <input className="form-control mb-3" value={msg.subject} maxLength={90}
              placeholder={aud === 'sellers' ? 'Jasa kirim baru tersedia: Aramex' : 'Gratis ongkir DHL di atas $120 minggu ini'}
              onChange={e => setMsg({ ...msg, subject: e.target.value })} />
            <label className="form-label">Isi pesan</label>
            <textarea className="form-control mb-3" rows="8" value={msg.body}
              placeholder="Tulis pengumumannya. Buat ringkas â€” pratinjau kotak masuk hanya menampilkan 120 karakter pertama."
              onChange={e => setMsg({ ...msg, body: e.target.value })} />
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Saluran pengiriman</label>
                {[['inbox', 'Kotak masuk aplikasi'], ['email', 'Email'], ['push', 'Notifikasi push'], ['wa', 'WhatsApp (khusus penjual)']].map(([id, l]) => (
                  <div className="form-check" key={id}>
                    <input className="form-check-input" type="checkbox" id={`ch-${id}`}
                      checked={msg.channel.includes(id)} onChange={() => toggleChannel(id)}
                      disabled={id === 'wa' && aud !== 'sellers'} />
                    <label className="form-check-label" htmlFor={`ch-${id}`}>{l}</label>
                  </div>
                ))}
              </div>
              <div className="col-md-6">
                <label className="form-label">Jadwal</label>
                <select className="form-select mb-2" value={msg.schedule} onChange={e => setMsg({ ...msg, schedule: e.target.value })}>
                  <option value="now">Kirim sekarang</option>
                  <option value="later">Jadwalkan nanti</option>
                </select>
                {msg.schedule === 'later' && (
                  <div className="row g-2">
                    <div className="col-7"><input className="form-control" type="date" defaultValue="2026-11-05" /></div>
                    <div className="col-5"><input className="form-control" type="time" defaultValue="09:00" /></div>
                  </div>
                )}
                <div className="form-text">Penjual paling banyak membaca pesan antara pukul 08:00 dan 10:00 WIB.</div>
              </div>
            </div>
          </Card>

          <Card title="Riwayat siaran" pad={false}>
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead><tr><th>Dikirim</th><th>Penerima</th><th>Perihal</th><th>Jumlah</th><th>Dibuka</th></tr></thead>
                <tbody>
                  {SENT.map(r => (
                    <tr key={r[0]}>
                      <td className="ta-mono ta-xs">{r[0]}</td>
                      <td><span className="ta-badge ta-badge-neutral">{r[1]}</span></td>
                      <td className="ta-sm">{r[2]}</td>
                      <td className="ta-num ta-sm">{num(r[3])}</td>
                      <td><span className="ta-badge ta-badge-ok">{r[4]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="col-xl-4">
          <div className="ta-sticky-side d-grid gap-3">
            <Card title="Pratinjau kotak masuk">
              <div className="ta-flat p-3">
                <div className="d-flex gap-2">
                  <span className="ta-avatar">TA</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="ta-sm fw-semibold">{aud === 'sellers' ? 'Admin TAGlobal' : 'CS TAGlobal'}</div>
                    <div className="ta-xs fw-semibold mt-1">{msg.subject || 'Perihal Anda muncul di sini'}</div>
                    <div className="ta-xs ta-faint mt-1">
                      {(msg.body || 'Beberapa baris pertama pesan Anda tampil di daftar kotak masuk penerima, jadi tulis informasi terpenting di awal.').slice(0, 130)}
                      {msg.body.length > 130 ? 'â€¦' : ''}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Template">
              {[
                ['Jasa kirim baru tersedia', 'Kami menambahkan {kurir} ke marketplace. Aktifkan di Pengaturan kirim agar bisa ditawarkan ke pembeli Anda.'],
                ['Perubahan jam gerai', 'Mulai {tanggal}, loket {gerai} menutup penerimaan pukul {jam}. Mohon sesuaikan jadwal antar Anda.'],
                ['Pengingat kualitas produk', 'Produk dengan foto kurang dari tiga buah konversinya 40% lebih rendah. Mohon tinjau katalog Anda.'],
                ['Promo ongkos kirim', 'Gratis ongkir {kurir} untuk pesanan di atas ${nilai} sampai {tanggal}.'],
              ].map(([t, b]) => (
                <button key={t} className="ta-flat p-2 w-100 text-start mb-2"
                  onClick={() => { setMsg(m => ({ ...m, subject: t, body: b })); toast('Template dimuat', 'info'); }}>
                  <div className="ta-sm fw-semibold">{t}</div>
                  <div className="ta-xs ta-faint text-truncate">{b}</div>
                </button>
              ))}
            </Card>

            <Card title="Aturan pengiriman">
              <div className="ta-xs ta-muted">
                <p>Siaran promosi dibatasi dua kali per segmen tiap minggu. Pemberitahuan operasional
                  (gangguan kurir, gerai tutup, perubahan bea cukai) dikecualikan.</p>
                <p className="mb-0">Penerima yang mematikan notifikasi promosi tetap menerima pemberitahuan
                  operasional, tetapi tidak dihitung dalam siaran promosi.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal open={preview} onClose={() => setPreview(false)} size="modal-lg" title="Pratinjau siaran"
        footer={<button className="btn btn-ta btn-sm" onClick={() => setPreview(false)}>Tutup</button>}>
        <div className="ta-flat p-4">
          <div className="ta-logo mb-3" style={{ fontSize: '1.1rem' }}>TA<span>Global</span></div>
          <h5 style={{ fontSize: '1.05rem' }}>{msg.subject || 'Perihal Anda'}</h5>
          <div className="ta-sm ta-muted" style={{ whiteSpace: 'pre-wrap' }}>
            {msg.body || 'Isi pesan Anda tampil di sini persis seperti yang dilihat penerima.'}
          </div>
          <hr className="ta-sep my-3" />
          <div className="ta-xs ta-faint">
            Dikirim ke {num(reach)} {audLabel} Â· saluran: {msg.channel.join(', ') || 'belum dipilih'} Â·
            {msg.schedule === 'now' ? ' langsung' : ' terjadwal'}
          </div>
        </div>
      </Modal>
    </>
  );
}





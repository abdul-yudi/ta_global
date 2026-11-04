import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../data/store';
import { HUBS } from '../../data/mock';
import { ProviderLogo } from '../../components/ui';

const FAQ = [
  ['Berapa lama pengiriman internasional?',
    'Lama perjalanan tergantung kurir yang Anda pilih saat checkout: DHL Express 2-5 hari kerja, FedEx International Priority 3-6 hari, UPS Worldwide Saver 3-7 hari dan EMS 6-14 hari. Tambahkan waktu proses penjual (1-3 hari) yang tertera di halaman produk.'],
  ['Siapa yang membayar bea masuk dan pajak?',
    'Kiriman berangkat dari Jakarta dengan skema DAP, artinya bea masuk dan PPN lokal ditagih kurir saat barang tiba. Invoice komersial yang kami lampirkan mencantumkan nilai transaksi sebenarnya dan kode HS agar proses bea cukai berjalan lancar.'],
  ['Bagaimana kalau paket saya hilang?',
    'Setiap pesanan dilindungi asuransi kiriman 1%. Jika kurir menyatakan paket hilang, TAGlobal mengembalikan seluruh nilai pesanan termasuk ongkos kirim ke metode pembayaran awal Anda.'],
  ['Bisakah memesan di bawah minimum order?',
    'MOQ ditentukan masing-masing kios. Hubungi penjual lebih dulu — banyak yang menerima pesanan percobaan lebih kecil dengan harga satuan sedikit lebih tinggi.'],
  ['Bagaimana penjual diverifikasi?',
    'Setiap kios menyerahkan izin dagang pasar, identitas pemilik dan nomor bloknya. Tim kami mengunjungi kios sebelum lencana Terverifikasi diberikan, dan lencana itu dicabut bila ketepatan kirimnya turun di bawah 85%.'],
  ['Metode pembayaran apa yang diterima?',
    'Kartu kredit atau debit Visa dan Mastercard, diproses dengan 3-D Secure. Dana ditahan di rekening penampungan dan baru dilepas ke penjual setelah gerai memindai paketnya.'],
  ['Bisakah barang diretur?',
    'Barang cacat atau salah kirim dapat diretur dalam 14 hari sejak diterima. Buka kasusnya dari halaman Pesanan Saya; tim CS kami menjadi penengah antara Anda dan kios.'],
  ['Apakah mengirim ke negara saya?',
    'Saat ini kami menjangkau 180+ negara. Bila negara tujuan Anda belum ada di daftar checkout, hubungi CS dan kami akan mengecek cakupan kurirnya.'],
];

export default function Help() {
  const { state } = useStore();
  const [open, setOpen] = useState(0);
  const [q, setQ] = useState('');

  const list = FAQ.filter(([t, b]) => !q || (t + b).toLowerCase().includes(q.toLowerCase()));

  return (
    <main className="container py-4">
      <div className="ta-card ta-card-pad mb-3" style={{ background: 'var(--ta-brand-soft)', borderColor: '#d6e4dd' }}>
        <div className="row align-items-center g-3">
          <div className="col-lg-7">
            <div className="ta-eyebrow" style={{ color: 'var(--ta-brand)' }}>Pusat bantuan</div>
            <h1 style={{ fontSize: '1.5rem' }} className="mt-1 mb-2">Ada yang bisa kami bantu?</h1>
            <div className="input-group" style={{ maxWidth: 440 }}>
              <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
              <input className="form-control" placeholder="Cari pengiriman, bea cukai, refund…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
          </div>
          <div className="col-lg-5">
            <div className="row g-2">
              {[['bi-chat-dots', 'Hubungi CS', '/messages'], ['bi-geo', 'Lacak paket', '/track'], ['bi-box-seam', 'Pesanan saya', '/orders']].map(([i, t, to]) => (
                <div className="col-4" key={t}>
                  <Link to={to} className="ta-card ta-card-pad d-block text-center h-100">
                    <i className={`bi ${i}`} style={{ fontSize: '1.3rem', color: 'var(--ta-brand)' }} />
                    <div className="ta-xs fw-semibold mt-1">{t}</div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="ta-card">
            <div className="ta-card-head"><h6>Pertanyaan yang sering diajukan</h6><span className="ta-xs ta-faint">{list.length} artikel</span></div>
            <div>
              {list.map(([t, b], i) => (
                <div key={t} style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                  <button className="btn btn-ta-ghost w-100 text-start d-flex justify-content-between align-items-center px-3 py-3"
                    onClick={() => setOpen(open === i ? -1 : i)}>
                    <span className="ta-sm fw-semibold" style={{ color: 'var(--ta-ink)' }}>{t}</span>
                    <i className={`bi ${open === i ? 'bi-dash' : 'bi-plus'} ta-faint`} />
                  </button>
                  {open === i && <div className="px-3 pb-3 ta-sm ta-muted" style={{ maxWidth: 720 }}>{b}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="ta-card mt-3">
            <div className="ta-card-head"><h6>Tabel layanan kurir</h6></div>
            <div className="table-responsive">
              <table className="ta-table">
                <thead><tr><th>Kurir</th><th>Layanan</th><th>Estimasi</th><th>Negara</th><th>Pelacakan</th></tr></thead>
                <tbody>
                  {state.providers.filter(p => p.active).map(p => (
                    <tr key={p.id}>
                      <td><div className="d-flex align-items-center gap-2"><ProviderLogo code={p.logo} /><strong>{p.name}</strong></div></td>
                      <td className="ta-muted">{p.service}</td>
                      <td>{p.etaMin}-{p.etaMax} hari kerja</td>
                      <td>{p.countries}</td>
                      <td><span className="ta-badge ta-badge-ok">Pemindaian langsung</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4 d-grid gap-3">
          <div className="ta-card">
            <div className="ta-card-head"><h6>Buat tiket</h6></div>
            <div className="ta-card-pad">
              <label className="form-label">Topik</label>
              <select className="form-select mb-3">
                <option>Di mana paket saya?</option>
                <option>Pertanyaan bea cukai / pajak</option>
                <option>Barang salah atau rusak</option>
                <option>Status pengembalian dana</option>
                <option>Penjual tidak merespons</option>
              </select>
              <label className="form-label">Nomor pesanan</label>
              <input className="form-control mb-3" placeholder="TA-24066" />
              <label className="form-label">Jelaskan masalahnya</label>
              <textarea className="form-control mb-3" rows="4" placeholder="Ceritakan apa yang terjadi…" />
              <Link to="/messages" className="btn btn-ta w-100">Kirim ke CS</Link>
              <div className="ta-xs ta-faint mt-2">Rata-rata balasan pertama: 2 jam (07.00-23.00 WIB)</div>
            </div>
          </div>

          <div className="ta-card">
            <div className="ta-card-head"><h6>Jaringan gerai &amp; hub</h6></div>
            <div className="ta-card-pad d-grid gap-2">
              {HUBS.map(h => (
                <div key={h.id} className="ta-flat p-2">
                  <div className="ta-sm fw-semibold">{h.name.replace('TAGlobal ', '')}</div>
                  <div className="ta-xs ta-faint">{h.address}</div>
                  <div className="ta-xs ta-muted mt-1"><i className="bi bi-clock me-1" />{h.open}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

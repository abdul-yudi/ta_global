import React, { useState } from 'react';
import { useStore, usd, num } from '../../data/store';
import { PageHead, Card, Rating } from '../../components/ui';

export default function SellerSettings() {
  const { state, seller, dispatch, toast } = useStore();
  const me = seller(state.sellerId);
  const [tab, setTab] = useState('store');
  const [f, setF] = useState({
    name: me.name, owner: me.owner, block: me.block, email: me.email, phone: me.phone,
    about: 'Spesialis hijab dan kerudung di lantai 1 Blok B. Produksi sendiri dan memasok butik di kawasan Teluk serta Asia Tenggara.',
    bank: 'BCA', account: '••••••4821', holder: me.owner, npwp: '09.254.118.7-021.000',
    vacation: false, autoAccept: true,
  });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  return (
    <>
      <PageHead eyebrow="Relasi" title="Pengaturan toko" sub={`${me.name} · ${me.block}`}>
        <button className="btn btn-ta" onClick={() => {
          dispatch({ type: 'seller:update', seller: { id: me.id, name: f.name, owner: f.owner, block: f.block, email: f.email, phone: f.phone } });
          toast('Pengaturan toko disimpan');
        }}>
          <i className="bi bi-check-lg me-1" />Simpan perubahan
        </button>
      </PageHead>

      <div className="ta-tabs">
        {[['store', 'Profil toko'], ['payout', 'Pencairan & pajak'], ['policy', 'Kebijakan'], ['account', 'Akun']].map(([id, l]) => (
          <button key={id} className={`ta-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{l}</button>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-xl-8 d-grid gap-3">
          {tab === 'store' && (
            <>
              <Card title="Profil toko">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nama toko</label>
                    <input className="form-control" value={f.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Nama pemilik</label>
                    <input className="form-control" value={f.owner} onChange={e => set('owner', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Nomor kios / blok</label>
                    <input className="form-control" value={f.block} onChange={e => set('block', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Pasar</label>
                    <select className="form-select" defaultValue="Blok B Tanah Abang">
                      <option>Blok A Tanah Abang</option>
                      <option>Blok B Tanah Abang</option>
                      <option>Metro Tanah Abang</option>
                      <option>Pasar Tasik</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input className="form-control" value={f.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">WhatsApp / telepon</label>
                    <input className="form-control" value={f.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Tentang toko</label>
                    <textarea className="form-control" rows="4" value={f.about} onChange={e => set('about', e.target.value)} />
                    <div className="form-text">Tampil di halaman toko Anda. Sebutkan kapasitas produksi dan spesialisasi.</div>
                  </div>
                </div>
              </Card>

              <Card title="Preferensi operasional">
                <div className="ta-toggle-row">
                  <div>
                    <div className="ta-sm fw-semibold">Terima pesanan otomatis bila stok cukup</div>
                    <div className="ta-xs ta-faint">Pesanan langsung dikonfirmasi saat stok mencukupi jumlahnya.</div>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input className="form-check-input" type="checkbox" checked={f.autoAccept}
                      onChange={e => set('autoAccept', e.target.checked)} />
                  </div>
                </div>
                <div className="ta-toggle-row">
                  <div>
                    <div className="ta-sm fw-semibold">Mode libur</div>
                    <div className="ta-xs ta-faint">Menyembunyikan semua produk dan menghentikan pesanan baru. Pesanan berjalan tetap aktif.</div>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input className="form-check-input" type="checkbox" checked={f.vacation}
                      onChange={e => { set('vacation', e.target.checked); toast(e.target.checked ? 'Mode libur aktif — produk disembunyikan' : 'Mode libur dimatikan', 'info'); }} />
                  </div>
                </div>
                <div className="ta-toggle-row">
                  <div>
                    <div className="ta-sm fw-semibold">Terima pesanan custom / made-to-order</div>
                    <div className="ta-xs ta-faint">Pembeli bisa mengirim permintaan spesifikasi di atas MOQ Anda.</div>
                  </div>
                  <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                </div>
              </Card>
            </>
          )}

          {tab === 'payout' && (
            <>
              <Card title="Rekening pencairan">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Bank</label>
                    <select className="form-select" value={f.bank} onChange={e => set('bank', e.target.value)}>
                      {['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Permata'].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Nomor rekening</label>
                    <input className="form-control ta-mono" value={f.account} readOnly />
                    <div className="form-text">Disamarkan demi keamanan — hubungi CS untuk mengubah.</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Nama pemilik rekening</label>
                    <input className="form-control" value={f.holder} onChange={e => set('holder', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">NPWP</label>
                    <input className="form-control ta-mono" value={f.npwp} onChange={e => set('npwp', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Jadwal pencairan</label>
                    <select className="form-select" defaultValue="Mingguan — setiap Senin">
                      <option>Mingguan — setiap Senin</option>
                      <option>Dua mingguan</option>
                      <option>Bulanan</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card title="Riwayat pencairan" pad={false}>
                <div className="ta-table-wrap">
                  <table className="ta-table">
                    <thead><tr><th>Periode</th><th>Pesanan</th><th>Bruto</th><th>Komisi</th><th>Diterima</th><th>Status</th></tr></thead>
                    <tbody>
                      {[
                        ['27 Okt – 2 Nov', 44, 10420.5, 'Cair'],
                        ['20 Okt – 26 Okt', 38, 8940.0, 'Cair'],
                        ['13 Okt – 19 Okt', 41, 9612.4, 'Cair'],
                        ['3 Nov – 9 Nov', 29, 8771.4, 'Terjadwal'],
                      ].map(([per, ord, gross, st]) => (
                        <tr key={per}>
                          <td className="ta-sm">{per}</td>
                          <td className="ta-num">{ord}</td>
                          <td className="ta-num">{usd(gross)}</td>
                          <td className="ta-num ta-faint">−{usd(gross * 0.04)}</td>
                          <td className="ta-num fw-semibold">{usd(gross * 0.96)}</td>
                          <td><span className={`ta-badge ${st === 'Cair' ? 'ta-badge-ok' : 'ta-badge-info'}`}>{st}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {tab === 'policy' && (
            <>
              <Card title="Kebijakan retur & pengembalian dana">
                <label className="form-label">Masa retur</label>
                <select className="form-select mb-3" defaultValue="14 hari sejak diterima (standar marketplace)">
                  <option>14 hari sejak diterima (standar marketplace)</option>
                  <option>7 hari sejak diterima</option>
                  <option>Hanya barang cacat</option>
                </select>
                <label className="form-label">Teks kebijakan yang dilihat pembeli</label>
                <textarea className="form-control" rows="5"
                  defaultValue="Barang cacat atau salah kirim dapat diretur dalam 14 hari sejak diterima. Ongkos retur ditanggung penjual bila kesalahan ada pada kami. Kain potongan dan pesanan custom tidak dapat diretur kecuali cacat." />
              </Card>
              <Card title="Ketentuan grosir">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">MOQ bawaan</label>
                    <input className="form-control ta-num" defaultValue="12" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Boleh pesan sampel</label>
                    <select className="form-select"><option>Ya, 1-3 pcs dengan harga eceran</option><option>Tidak</option></select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Penawaran khusus di atas</label>
                    <input className="form-control ta-num" defaultValue="500" />
                  </div>
                </div>
              </Card>
            </>
          )}

          {tab === 'account' && (
            <>
              <Card title="Masuk & keamanan">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Email untuk masuk</label>
                    <input className="form-control" value={f.email} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Ganti kata sandi</label>
                    <input className="form-control" type="password" placeholder="Kata sandi baru" />
                  </div>
                </div>
                <div className="ta-toggle-row mt-3">
                  <div>
                    <div className="ta-sm fw-semibold">Verifikasi dua langkah</div>
                    <div className="ta-xs ta-faint">Kode sekali pakai via WhatsApp setiap masuk dari perangkat baru.</div>
                  </div>
                  <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                </div>
              </Card>
              <Card title="Akses karyawan">
                <div className="ta-table-wrap">
                  <table className="ta-table">
                    <thead><tr><th>Nama</th><th>Peran</th><th>Terakhir aktif</th><th /></tr></thead>
                    <tbody>
                      {[['Siti Mahmudah', 'Pemilik', 'sekarang'], ['Dimas P.', 'Penanganan pesanan', '2 jam lalu'], ['Rina W.', 'Editor katalog', 'kemarin']].map(([n, r, a]) => (
                        <tr key={n}>
                          <td className="ta-sm fw-semibold">{n}</td>
                          <td><span className="ta-badge ta-badge-neutral">{r}</span></td>
                          <td className="ta-xs ta-faint">{a}</td>
                          <td className="text-end">
                            {r !== 'Pemilik' && <button className="btn btn-ta-danger btn-sm" onClick={() => toast(`${n} dihapus dari daftar karyawan`, 'warn')}><i className="bi bi-trash" /></button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-ta-outline btn-sm mt-3" onClick={() => toast('Form undangan dibuka (prototipe)', 'info')}>
                  <i className="bi bi-person-plus me-1" />Undang karyawan
                </button>
              </Card>
            </>
          )}
        </div>

        <div className="col-xl-4">
          <div className="ta-sticky-side d-grid gap-3">
            <Card title="Status toko">
              <div className="d-flex align-items-center gap-3 mb-3">
                <span className="ta-avatar ta-avatar-lg">{me.name.slice(0, 2).toUpperCase()}</span>
                <div>
                  <div className="fw-semibold">{me.name}</div>
                  <span className="ta-badge ta-badge-ok"><i className="bi bi-patch-check-fill" />Terverifikasi</span>
                </div>
              </div>
              <div className="ta-kv"><dt>Rating</dt><dd><Rating value={me.rating} count={me.reviews} /></dd></div>
              <div className="ta-kv"><dt>Produk tayang</dt><dd>{state.products.filter(p => p.sellerId === me.id && p.status === 'active').length}</dd></div>
              <div className="ta-kv"><dt>Terjual / 30 hari</dt><dd>{num(me.sales30d)} pcs</dd></div>
              <div className="ta-kv"><dt>Bergabung sejak</dt><dd>{me.joined}</dd></div>
            </Card>
            <Card title="Dokumen verifikasi">
              {[['Surat izin kios', 'terverifikasi'], ['KTP pemilik', 'terverifikasi'], ['Kartu NPWP', 'terverifikasi'], ['Rekening koran', 'terverifikasi']].map(([d, st]) => (
                <div key={d} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                  <span className="ta-sm"><i className="bi bi-file-earmark-check me-2 ta-faint" />{d}</span>
                  <span className="ta-badge ta-badge-ok">{st}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

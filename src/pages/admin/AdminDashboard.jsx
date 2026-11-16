import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore, usd, usd0, num } from '../../data/store';
import { ADMIN_ANALYTICS } from '../../data/mock';
import { PageHead, Stat, Card, AreaChart, BarChart, Donut, BarRow, StatusBadge, ProviderLogo } from '../../components/ui';
import { apiActions } from '../../api/marketplace';

const SELLER_STATUS_ID = { verified: 'terverifikasi', pending: 'menunggu', suspended: 'ditangguhkan' };

export default function AdminDashboard() {
  const { state, seller } = useStore();
  const [data, setData] = useState(ADMIN_ANALYTICS);

  useEffect(() => {
    let active = true;
    apiActions.getAdminAnalytics()
      .then(res => { if (active && res) setData(res); })
      .catch(err => console.error('Failed to load admin analytics', err));
    return () => { active = false; };
  }, []);

  const a = data || ADMIN_ANALYTICS;
  const labels = a.labels || ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
  const gmvSeries = a.gmvSeries?.length ? a.gmvSeries : Array(7).fill(0);
  const newSellers = a.newSellers?.length ? a.newSellers : a.sellersSeries?.length ? a.sellersSeries : Array(7).fill(0);
  const categorySplit = a.categorySplit || [];
  const gmv = gmvSeries.reduce((x, y) => x + y, 0);
  const avgDailyGmv = gmvSeries.length > 0 ? gmv / gmvSeries.length : 0;

  const pendingSellers = state.sellers.filter(s => s.status === 'pending');
  const reviewProducts = state.products.filter(p => p.status === 'review' || p.status === 'rejected');
  const brokenApis = state.providers.filter(p => p.apiStatus === 'error');
  const maxHub = state.hubs.length ? Math.max(...state.hubs.map(h => h.intake30d || 0), 1) : 1;

  return (
    <>
      <PageHead eyebrow="Super Admin" title="Ringkasan marketplace"
        sub="Pusat kendali dan performa marketplace ekspor TA Global">
        <Link to="/admin/broadcast" className="btn btn-ta-outline"><i className="bi bi-megaphone me-1" />Siaran</Link>
        <Link to="/admin/providers" className="btn btn-ta"><i className="bi bi-truck me-1" />Jasa kirim</Link>
      </PageHead>

      {/* ---------- alerts ---------- */}
      {(pendingSellers.length > 0 || reviewProducts.length > 0 || brokenApis.length > 0) && (
        <div className="row g-3 mb-3">
          {pendingSellers.length > 0 && (
            <div className="col-md-4">
              <div className="ta-card ta-card-pad d-flex align-items-center gap-3" style={{ background: 'var(--ta-warn-soft)', borderColor: '#f0dfbe' }}>
                <i className="bi bi-person-check" style={{ fontSize: '1.3rem', color: 'var(--ta-warn)' }} />
                <div className="flex-grow-1">
                  <div className="ta-sm fw-semibold">{pendingSellers.length} penjual menunggu verifikasi</div>
                  <div className="ta-xs ta-muted">Dokumen sudah masuk, kunjungan kios belum dilakukan</div>
                </div>
                <Link to="/admin/sellers" className="btn btn-ta btn-sm">Tinjau</Link>
              </div>
            </div>
          )}
          {reviewProducts.length > 0 && (
            <div className="col-md-4">
              <div className="ta-card ta-card-pad d-flex align-items-center gap-3" style={{ background: 'var(--ta-info-soft)', borderColor: '#d2e0f0' }}>
                <i className="bi bi-box-seam" style={{ fontSize: '1.3rem', color: 'var(--ta-info)' }} />
                <div className="flex-grow-1">
                  <div className="ta-sm fw-semibold">{reviewProducts.length} produk dalam moderasi</div>
                  <div className="ta-xs ta-muted">Ditandai oleh pemeriksaan foto otomatis</div>
                </div>
                <Link to="/admin/products" className="btn btn-ta btn-sm">Moderasi</Link>
              </div>
            </div>
          )}
          {brokenApis.length > 0 && (
            <div className="col-md-4">
              <div className="ta-card ta-card-pad d-flex align-items-center gap-3" style={{ background: 'var(--ta-danger-soft)', borderColor: '#f3d2d7' }}>
                <i className="bi bi-plug" style={{ fontSize: '1.3rem', color: 'var(--ta-danger)' }} />
                <div className="flex-grow-1">
                  <div className="ta-sm fw-semibold">API {brokenApis[0].name} gagal</div>
                  <div className="ta-xs ta-muted">Tarif kembali memakai tabel statis</div>
                </div>
                <Link to="/admin/integrations" className="btn btn-ta btn-sm">Perbaiki</Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------- KPIs ---------- */}
      <div className="row g-3 mb-3">
        <div className="col-md-6 col-xl-3"><Stat label="GMV — 14 hari" value={usd0(gmv)} delta="14,2%" hint="vs periode sebelumnya" icon="bi-graph-up" /></div>
        <div className="col-md-6 col-xl-3"><Stat label="Pendapatan komisi" value={usd0(gmv * 0.04)} delta="14,2%" hint="komisi 4%" icon="bi-percent" /></div>
        <div className="col-md-6 col-xl-3"><Stat label="Penjual aktif" value={num(state.sellers.filter(s => s.status === 'verified').length * 179 || 179)} delta="13 baru" hint="minggu ini" icon="bi-shop" /></div>
        <div className="col-md-6 col-xl-3"><Stat label="Paket diekspor" value={num(14286)} delta="9,8%" hint="30 hari terakhir" icon="bi-airplane" /></div>
      </div>

      <div className="row g-3">
        <div className="col-xl-8">
          <Card title="Nilai transaksi bruto — 14 hari terakhir" pad={false}
            action={<span className="ta-xs ta-faint">USD, seluruh toko</span>}>
            <div className="p-3">
              <AreaChart series={gmvSeries} labels={labels} color="#0b3d2c" fmt={v => `$${(v / 1000).toFixed(0)}rb`} height={230} />
            </div>
            <div className="row g-0" style={{ borderTop: '1px solid var(--ta-line-soft)' }}>
              {[
                ['Rata-rata GMV harian', usd0(avgDailyGmv)],
                ['Pesanan / hari', num(1842)],
                ['Rata-rata keranjang', usd(46.2)],
                ['Tarif komisi', '4,0%'],
              ].map(([l, v], i) => (
                <div key={l} className="col-6 col-lg-3 p-3" style={{ borderRight: i < 3 ? '1px solid var(--ta-line-soft)' : 'none' }}>
                  <div className="ta-xs ta-faint">{l}</div>
                  <div className="fw-bold ta-num" style={{ fontSize: '1.05rem' }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-xl-4">
          <Card title="GMV per kategori">
            <Donut data={categorySplit} center={{ value: usd0(gmv / 1000) + 'rb', label: 'GMV 14 hari' }} />
          </Card>
        </div>

        <div className="col-xl-4">
          <Card title="Penjual baru bergabung" pad={false}>
            <div className="p-3"><BarChart series={newSellers} labels={labels} color="#b8863b" height={160} /></div>
          </Card>
        </div>

        <div className="col-xl-4">
          <Card title="Performa jasa kirim" pad={false}>
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead><tr><th>Kurir</th><th>Vol. 30h</th><th>API</th></tr></thead>
                <tbody>
                  {state.providers.map(p => (
                    <tr key={p.id}>
                      <td><div className="d-flex align-items-center gap-2"><ProviderLogo code={p.logo} />
                        <span className="ta-xs">{p.name}</span></div></td>
                      <td className="ta-num ta-sm">{num(p.volume30d)}</td>
                      <td>
                        <span className={`ta-badge ${p.apiStatus === 'connected' ? 'ta-badge-ok'
                          : p.apiStatus === 'error' ? 'ta-badge-danger' : 'ta-badge-neutral'}`}>
                          {p.apiStatus === 'connected' ? 'aktif' : p.apiStatus === 'error' ? 'error' : 'mati'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3"><Link to="/admin/providers" className="btn btn-ta-outline btn-sm w-100">Kelola jasa kirim</Link></div>
          </Card>
        </div>

        <div className="col-xl-4">
          <Card title="Penerimaan gerai — 30 hari">
            {state.hubs.map(h => (
              <BarRow key={h.id} label={h.name.replace('TAGlobal ', '').replace('Gerai - ', '')}
                value={h.intake30d} max={maxHub} />
            ))}
            <hr className="ta-sep my-3" />
            <Link to="/admin/hubs" className="btn btn-ta-outline btn-sm w-100">Kelola jaringan gerai</Link>
          </Card>
        </div>

        <div className="col-xl-7">
          <Card title="Penjual teratas berdasarkan volume 30 hari" pad={false}
            action={<Link to="/admin/sellers" className="ta-xs">Semua penjual</Link>}>
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead><tr><th>Penjual</th><th>Blok</th><th>Produk</th><th>Terjual 30h</th><th>Rating</th><th>Status</th></tr></thead>
                <tbody>
                  {[...state.sellers].sort((x, y) => y.sales30d - x.sales30d).map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="ta-avatar" style={{ width: 28, height: 28, fontSize: '.65rem' }}>{s.name.slice(0, 2).toUpperCase()}</span>
                          <div>
                            <div className="ta-sm fw-semibold">{s.name}</div>
                            <div className="ta-xs ta-faint">{s.owner}</div>
                          </div>
                        </div>
                      </td>
                      <td className="ta-xs ta-faint">{s.block}</td>
                      <td className="ta-num">{s.products}</td>
                      <td className="ta-num">{num(s.sales30d)}</td>
                      <td className="ta-sm"><i className="bi bi-star-fill ta-stars me-1" />{s.rating}</td>
                      <td>
                        <span className={`ta-badge ${s.status === 'verified' ? 'ta-badge-ok' : s.status === 'pending' ? 'ta-badge-warn' : 'ta-badge-danger'}`}>
                          {SELLER_STATUS_ID[s.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="col-xl-5">
          <Card title="Pesanan terbaru di seluruh marketplace" pad={false}
            action={<Link to="/admin/orders" className="ta-xs">Semua pesanan</Link>}>
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead><tr><th>Pesanan</th><th>Penjual</th><th>Tujuan</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {state.orders.slice(0, 8).map(o => (
                    <tr key={o.id}>
                      <td className="ta-mono ta-xs fw-semibold">{o.id}</td>
                      <td className="ta-xs">{seller(o.sellerId)?.name}</td>
                      <td className="ta-xs ta-faint">{o.country}</td>
                      <td className="ta-sm">{usd(o.total)}</td>
                      <td><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
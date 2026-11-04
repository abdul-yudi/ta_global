import React from 'react';
import { Link } from 'react-router-dom';
import { useStore, usd, usd0, num } from '../../data/store';
import { SELLER_ANALYTICS } from '../../data/mock';
import { PageHead, Stat, Card, AreaChart, Donut, BarRow, StatusBadge, ProviderLogo, Empty } from '../../components/ui';

export default function SellerDashboard() {
  const { state, sellerOrders, product, seller, hub } = useStore();
  const me = seller(state.sellerId);
  const a = SELLER_ANALYTICS;

  const myProducts = state.products.filter(p => p.sellerId === state.sellerId);
  const pending = sellerOrders.filter(o => o.status === 'awaiting_acceptance');
  const toDrop = sellerOrders.filter(o => o.status === 'to_dropoff');
  const revenue = a.revenueSeries[a.revenueSeries.length - 1];
  const unread = state.threads.reduce((x, t) => x + (t.unread || 0), 0);
  const lowStock = myProducts.filter(p => p.stock < 600);
  const maxCountry = Math.max(...a.topCountries.map(c => c.revenue));

  return (
    <>
      <PageHead eyebrow="Pusat Penjual" title={`Selamat datang, ${me?.owner.split(' ')[0]}`}
        sub={`${me?.name} · ${me?.block} · bergabung ${me?.joined}`}>
        <Link to="/seller/products/new" className="btn btn-ta"><i className="bi bi-plus-lg me-1" />Unggah produk</Link>
        <Link to="/seller/dropoff" className="btn btn-ta-outline"><i className="bi bi-shop-window me-1" />Antar paket</Link>
      </PageHead>

      {/* ---------- action strip ---------- */}
      {(pending.length > 0 || toDrop.length > 0) && (
        <div className="ta-card ta-card-pad mb-3" style={{ background: 'var(--ta-warn-soft)', borderColor: '#f0dfbe' }}>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <i className="bi bi-bell-fill" style={{ fontSize: '1.2rem', color: 'var(--ta-warn)' }} />
            <div className="flex-grow-1">
              <div className="fw-semibold ta-sm">Ada pekerjaan yang menunggu</div>
              <div className="ta-xs ta-muted">
                {pending.length} pesanan menunggu konfirmasi Anda
                {toDrop.length > 0 && <> · {toDrop.length} paket siap diantar ke gerai</>}
                {unread > 0 && <> · {unread} pesan belum dibaca</>}
              </div>
            </div>
            <Link to="/seller/orders" className="btn btn-ta btn-sm">Lihat pesanan</Link>
          </div>
        </div>
      )}

      {/* ---------- KPIs ---------- */}
      <div className="row g-3 mb-3">
        <div className="col-md-6 col-xl-3"><Stat label="Omzet hari ini" value={usd0(revenue)} delta="18,0%" hint="vs kemarin" icon="bi-cash-stack" /></div>
        <div className="col-md-6 col-xl-3"><Stat label="Pesanan hari ini" value={a.ordersSeries[a.ordersSeries.length - 1]} delta="17,1%" hint="vs kemarin" icon="bi-receipt" /></div>
        <div className="col-md-6 col-xl-3"><Stat label="Pengunjung toko" value={num(a.visitorsSeries[a.visitorsSeries.length - 1])} delta="16,7%" hint="unik / 24 jam" icon="bi-people" /></div>
        <div className="col-md-6 col-xl-3"><Stat label="Konversi" value="5,04%" delta="0,4 poin" deltaDir="down" hint="dilihat ke dibayar" icon="bi-funnel" /></div>
      </div>

      <div className="row g-3">
        {/* ---------- revenue chart ---------- */}
        <div className="col-xl-8">
          <Card title="Omzet & pesanan — 14 hari terakhir" pad={false}
            action={<Link to="/seller/analytics" className="ta-xs">Analitik lengkap <i className="bi bi-chevron-right" style={{ fontSize: '.6rem' }} /></Link>}>
            <div className="p-3">
              <AreaChart series={a.revenueSeries} labels={a.labels} fmt={v => `$${v / 1000 >= 1 ? (v / 1000).toFixed(0) + 'rb' : v}`} />
            </div>
            <div className="row g-0" style={{ borderTop: '1px solid var(--ta-line-soft)' }}>
              {[
                ['Omzet 14 hari', usd0(a.revenueSeries.reduce((x, y) => x + y, 0))],
                ['Pesanan 14 hari', num(a.ordersSeries.reduce((x, y) => x + y, 0))],
                ['Rata-rata nilai pesanan', usd(a.revenueSeries.reduce((x, y) => x + y, 0) / a.ordersSeries.reduce((x, y) => x + y, 0))],
                ['Pembeli berulang', '31%'],
              ].map(([l, v], i) => (
                <div key={l} className="col-6 col-lg-3 p-3" style={{ borderRight: i < 3 ? '1px solid var(--ta-line-soft)' : 'none' }}>
                  <div className="ta-xs ta-faint">{l}</div>
                  <div className="fw-bold ta-num" style={{ fontSize: '1.05rem' }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ---------- store health ---------- */}
        <div className="col-xl-4">
          <Card title="Kesehatan toko">
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="ta-avatar ta-avatar-lg">{me?.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <div className="fw-semibold">{me?.name}</div>
                <span className="ta-badge ta-badge-ok"><i className="bi bi-patch-check-fill" />Toko terverifikasi</span>
              </div>
            </div>
            {[
              ['Rating', `${me?.rating} / 5,0`, (me?.rating / 5) * 100],
              ['Ketepatan kirim', `${me?.shipOnTime}%`, me?.shipOnTime],
              ['Tingkat balas chat', `${me?.responseRate}%`, me?.responseRate],
              ['Tingkat komplain', '0,4%', 4],
            ].map(([l, v, pct]) => (
              <div key={l} className="mb-3">
                <div className="d-flex justify-content-between ta-sm mb-1">
                  <span className="ta-muted">{l}</span><strong>{v}</strong>
                </div>
                <div className="ta-barrow-track"><span className="ta-barrow-fill" style={{ width: `${pct}%` }} /></div>
              </div>
            ))}
            <hr className="ta-sep my-3" />
            <div className="ta-kv"><dt>Gerai utama</dt><dd className="ta-xs">{hub(state.sellerHub)?.name.replace('TAGlobal Gerai - ', '')}</dd></div>
            <div className="ta-kv"><dt>Jasa kirim aktif</dt><dd>{Object.values(state.sellerShipping).filter(Boolean).length} dari {state.providers.length}</dd></div>
            <div className="ta-kv"><dt>Pencairan berikutnya</dt><dd>Sen 9 Nov · {usd(8420.5)}</dd></div>
            <Link to="/seller/settings" className="btn btn-ta-outline btn-sm w-100 mt-3">Pengaturan toko</Link>
          </Card>
        </div>

        {/* ---------- orders needing action ---------- */}
        <div className="col-xl-8">
          <Card title="Pesanan yang menunggu Anda" pad={false}
            action={<Link to="/seller/orders" className="ta-xs">Semua pesanan</Link>}>
            {!sellerOrders.length && <Empty icon="bi-receipt" title="Belum ada pesanan" />}
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead><tr><th>Pesanan</th><th>Pembeli</th><th>Barang</th><th>Kurir</th><th>Total</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {sellerOrders.slice(0, 6).map(o => (
                    <tr key={o.id}>
                      <td><div className="ta-mono fw-semibold">{o.id}</div><div className="ta-xs ta-faint">{o.placed}</div></td>
                      <td><div className="ta-sm">{o.buyer}</div><div className="ta-xs ta-faint">{o.city}, {o.country}</div></td>
                      <td>
                        <div className="d-flex gap-1">
                          {o.items.slice(0, 2).map(it => {
                            const p = product(it.productId);
                            return p ? <img key={it.productId} src={p.images[0]} alt="" className="ta-thumb" style={{ width: 30, height: 30 }} /> : null;
                          })}
                        </div>
                        <div className="ta-xs ta-faint mt-1">{o.items.reduce((x, i) => x + i.qty, 0)} pcs</div>
                      </td>
                      <td><ProviderLogo code={state.providers.find(p => p.id === o.provider)?.logo} /></td>
                      <td className="fw-semibold">{usd(o.total)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="text-end">
                        <Link to="/seller/orders" className="btn btn-ta-outline btn-sm">
                          {o.status === 'awaiting_acceptance' ? 'Terima' : 'Buka'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ---------- carrier split ---------- */}
        <div className="col-xl-4">
          <Card title="Komposisi kurir — 30 hari">
            <Donut data={a.providerSplit} center={{ value: num(1218), label: 'paket' }} />
            <hr className="ta-sep my-3" />
            <Link to="/seller/shipping" className="btn btn-ta-outline btn-sm w-100">
              <i className="bi bi-truck me-1" />Atur jasa kirim
            </Link>
          </Card>
        </div>

        {/* ---------- top destinations ---------- */}
        <div className="col-xl-5">
          <Card title="Negara tujuan teratas">
            {a.topCountries.map(c => (
              <BarRow key={c.country} label={c.country} value={c.revenue} max={maxCountry} right={usd0(c.revenue)} />
            ))}
          </Card>
        </div>

        {/* ---------- best products ---------- */}
        <div className="col-xl-4">
          <Card title="Produk terlaris" pad={false}>
            {[...myProducts].sort((x, y) => y.sold - x.sold).slice(0, 5).map((p, i) => (
              <div key={p.id} className="d-flex align-items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                <span className="ta-faint ta-xs fw-bold" style={{ width: 14 }}>{i + 1}</span>
                <img src={p.images[0]} alt="" className="ta-thumb" style={{ width: 34, height: 34 }} />
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="ta-xs fw-semibold text-truncate">{p.title}</div>
                  <div className="ta-xs ta-faint">{num(p.sold)} terjual · {usd(p.price)}</div>
                </div>
                <Link to={`/seller/products/${p.id}/edit`} className="btn btn-ta-ghost btn-sm"><i className="bi bi-pencil" /></Link>
              </div>
            ))}
          </Card>
        </div>

        {/* ---------- inventory alerts ---------- */}
        <div className="col-xl-3">
          <Card title="Peringatan stok">
            {!lowStock.length && <div className="ta-sm ta-faint">Semua produk stoknya masih aman.</div>}
            {lowStock.slice(0, 5).map(p => (
              <div key={p.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ color: 'var(--ta-warn)' }} />
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="ta-xs text-truncate">{p.title}</div>
                  <div className="ta-xs ta-faint">sisa {num(p.stock)} pcs</div>
                </div>
              </div>
            ))}
            <Link to="/seller/products" className="btn btn-ta-outline btn-sm w-100 mt-3">Kelola stok</Link>
          </Card>
        </div>
      </div>
    </>
  );
}

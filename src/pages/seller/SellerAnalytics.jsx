import React, { useState } from 'react';
import { useStore, usd, usd0, num } from '../../data/store';
import { SELLER_ANALYTICS } from '../../data/mock';
import { PageHead, Stat, Card, AreaChart, BarChart, Donut, BarRow } from '../../components/ui';

const RANGES = ['Hari ini', '7 hari', '14 hari', '30 hari', '90 hari'];
const METRICS = [
  { id: 'revenue', label: 'Omzet', series: 'revenueSeries', fmt: v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'rb' : v}` },
  { id: 'orders', label: 'Pesanan', series: 'ordersSeries', fmt: v => v },
  { id: 'visitors', label: 'Pengunjung', series: 'visitorsSeries', fmt: v => v },
];

export default function SellerAnalytics() {
  const { state } = useStore();
  const a = SELLER_ANALYTICS;
  const [range, setRange] = useState('14 hari');
  const [metric, setMetric] = useState('revenue');
  const m = METRICS.find(x => x.id === metric);

  const myProducts = state.products.filter(p => p.sellerId === state.sellerId);
  const maxCountry = Math.max(...a.topCountries.map(c => c.revenue));
  const maxFunnel = a.funnel[0].value;

  return (
    <>
      <PageHead eyebrow="Pusat Penjual" title="Analitik" sub="Trafik, konversi dan performa ekspor toko Anda">
        <select className="form-select form-select-sm" style={{ width: 130 }} value={range} onChange={e => setRange(e.target.value)}>
          {RANGES.map(r => <option key={r}>{r}</option>)}
        </select>
        <button className="btn btn-ta-outline btn-sm"><i className="bi bi-download me-1" />Ekspor CSV</button>
      </PageHead>

      <div className="row g-3 mb-3">
        <div className="col-md-6 col-xl-3"><Stat label="Omzet kotor" value={usd0(a.revenueSeries.reduce((x, y) => x + y, 0))} delta="23,4%" hint={range} icon="bi-cash-stack" /></div>
        <div className="col-md-6 col-xl-3"><Stat label="Pesanan dibayar" value={num(a.ordersSeries.reduce((x, y) => x + y, 0))} delta="19,8%" hint={range} icon="bi-receipt" /></div>
        <div className="col-md-6 col-xl-3"><Stat label="Rata-rata nilai pesanan" value={usd(a.revenueSeries.reduce((x, y) => x + y, 0) / a.ordersSeries.reduce((x, y) => x + y, 0))} delta="3,1%" hint={range} icon="bi-tag" /></div>
        <div className="col-md-6 col-xl-3"><Stat label="Tingkat refund" value="0,8%" delta="0,2 poin" deltaDir="down" hint="makin kecil makin baik" icon="bi-arrow-counterclockwise" /></div>
      </div>

      <div className="row g-3">
        <div className="col-xl-8">
          <Card title={`Tren ${m.label.toLowerCase()}`} pad={false}
            action={(
              <div className="btn-group">
                {METRICS.map(x => (
                  <button key={x.id} className={`btn btn-sm ${metric === x.id ? 'btn-ta' : 'btn-ta-outline'}`}
                    onClick={() => setMetric(x.id)}>{x.label}</button>
                ))}
              </div>
            )}>
            <div className="p-3">
              <AreaChart series={a[m.series]} labels={a.labels} fmt={m.fmt} height={230} />
            </div>
          </Card>
        </div>

        <div className="col-xl-4">
          <Card title="Corong konversi">
            {a.funnel.map((f, i) => (
              <div key={f.step} className="mb-3">
                <div className="d-flex justify-content-between ta-sm mb-1">
                  <span className="ta-muted">{f.step}</span>
                  <span><strong className="ta-num">{num(f.value)}</strong>
                    {i > 0 && <span className="ta-xs ta-faint ms-1">({((f.value / a.funnel[i - 1].value) * 100).toFixed(1)}%)</span>}</span>
                </div>
                <div className="ta-barrow-track"><span className="ta-barrow-fill" style={{ width: `${(f.value / maxFunnel) * 100}%` }} /></div>
              </div>
            ))}
            <hr className="ta-sep my-3" />
            <div className="ta-kv"><dt>Dilihat → keranjang</dt><dd>19,9%</dd></div>
            <div className="ta-kv"><dt>Keranjang → dibayar</dt><dd>25,3%</dd></div>
            <div className="ta-kv"><dt>Konversi keseluruhan</dt><dd>5,04%</dd></div>
          </Card>
        </div>

        <div className="col-xl-6">
          <Card title="Pesanan per hari" pad={false}>
            <div className="p-3"><BarChart series={a.ordersSeries} labels={a.labels} /></div>
          </Card>
        </div>

        <div className="col-xl-6">
          <Card title="Komposisi kurir">
            <Donut data={a.providerSplit} center={{ value: num(1218), label: 'paket' }} />
          </Card>
        </div>

        <div className="col-xl-6">
          <Card title="Omzet per negara tujuan" pad={false}>
            <div className="p-3">
              {a.topCountries.map(c => (
                <BarRow key={c.country} label={c.country} value={c.revenue} max={maxCountry} right={usd0(c.revenue)} />
              ))}
            </div>
            <div className="ta-table-wrap" style={{ borderTop: '1px solid var(--ta-line-soft)' }}>
              <table className="ta-table">
                <thead><tr><th>Negara</th><th>Pesanan</th><th>Omzet</th><th>Rata-rata</th></tr></thead>
                <tbody>
                  {a.topCountries.map(c => (
                    <tr key={c.country}>
                      <td className="ta-sm">{c.country}</td>
                      <td className="ta-num">{c.orders}</td>
                      <td className="ta-num">{usd0(c.revenue)}</td>
                      <td className="ta-num">{usd(c.revenue / c.orders)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="col-xl-6">
          <Card title="Performa produk" pad={false}>
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead><tr><th>Produk</th><th>Dilihat</th><th>Terjual</th><th>Omzet</th><th>Konv.</th></tr></thead>
                <tbody>
                  {[...myProducts].sort((x, y) => y.sold - x.sold).map(p => {
                    const views = Math.round(p.sold * 4.4);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img src={p.images[0]} alt="" className="ta-thumb" style={{ width: 30, height: 30 }} />
                            <span className="ta-xs text-truncate" style={{ maxWidth: 200 }}>{p.title}</span>
                          </div>
                        </td>
                        <td className="ta-num ta-sm">{num(views)}</td>
                        <td className="ta-num ta-sm">{num(p.sold)}</td>
                        <td className="ta-num ta-sm">{usd0(p.sold * p.price)}</td>
                        <td><span className="ta-badge ta-badge-neutral">{((p.sold / views) * 100).toFixed(1)}%</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="col-12">
          <Card title="Metrik operasional">
            <div className="row g-4">
              {[
                ['Rata-rata waktu proses', '1,6 hari', 'dari konfirmasi sampai diantar ke gerai'],
                ['Gerai ke kurir', '7,2 jam', 'kecepatan konsolidasi di hub'],
                ['Rata-rata waktu kirim', '4,8 hari', 'dari scan gerai sampai diterima'],
                ['Balasan chat pertama', '14 menit', 'median pada jam kerja'],
                ['Tingkat pembatalan', '1,1%', 'pembatalan oleh penjual'],
                ['Tingkat sengketa', '0,3%', 'kasus per 100 pesanan'],
              ].map(([l, v, d]) => (
                <div key={l} className="col-md-6 col-xl-2">
                  <div className="ta-stat-label">{l}</div>
                  <div className="ta-stat-value" style={{ fontSize: '1.25rem' }}>{v}</div>
                  <div className="ta-xs ta-faint">{d}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

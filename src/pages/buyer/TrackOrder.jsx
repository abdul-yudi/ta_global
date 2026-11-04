import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useStore, usd } from '../../data/store';
import { ProviderLogo, StatusBadge, Empty } from '../../components/ui';

export default function TrackOrder() {
  const { id } = useParams();
  const nav = useNavigate();
  const { state, seller, provider, product } = useStore();
  const [q, setQ] = useState(id || '');

  const order = state.orders.find(o => o.id === id);

  const search = e => {
    e.preventDefault();
    const hit = state.orders.find(o => o.id.toLowerCase() === q.trim().toLowerCase()
      || o.awb.toLowerCase() === q.trim().toLowerCase());
    nav(hit ? `/track/${hit.id}` : `/track/${q.trim().toUpperCase()}`);
  };

  return (
    <main className="container py-4">
      <div className="row g-3 justify-content-center">
        <div className="col-lg-9">
          <div className="ta-card ta-card-pad">
            <div className="row g-3 align-items-end">
              <div className="col-md-8">
                <label className="form-label">Lacak paket Anda</label>
                <form className="input-group" onSubmit={search}>
                  <span className="input-group-text"><i className="bi bi-geo" /></span>
                  <input className="form-control" placeholder="Nomor pesanan (TA-24066) atau nomor resi" value={q}
                    onChange={e => setQ(e.target.value)} />
                  <button className="btn btn-ta" type="submit">Lacak</button>
                </form>
              </div>
              <div className="col-md-4">
                <div className="ta-xs ta-faint">
                  Pelacakan disatukan untuk DHL, FedEx, EMS dan UPS — satu linimasa, semua pemindaian.
                </div>
              </div>
            </div>
          </div>

          {!id && (
            <div className="ta-card mt-3">
              <div className="ta-card-head"><h6>Pengiriman Anda yang aktif</h6></div>
              <div className="table-responsive">
                <table className="ta-table">
                  <thead><tr><th>Pesanan</th><th>Kurir</th><th>Resi</th><th>Tujuan</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {state.orders.filter(o => o.status !== 'cancelled').map(o => (
                      <tr key={o.id}>
                        <td className="ta-mono fw-semibold">{o.id}</td>
                        <td><div className="d-flex align-items-center gap-2"><ProviderLogo code={provider(o.provider)?.logo} />
                          <span className="ta-xs">{provider(o.provider)?.name}</span></div></td>
                        <td className="ta-mono ta-xs">{o.awb}</td>
                        <td className="ta-sm">{o.city}, {o.country}</td>
                        <td><StatusBadge status={o.status} /></td>
                        <td className="text-end"><Link to={`/track/${o.id}`} className="btn btn-ta-outline btn-sm">Linimasa</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {id && !order && (
            <div className="ta-card mt-3">
              <Empty icon="bi-question-circle" title={`Tidak ditemukan untuk “${id}”`}
                sub="Periksa kembali nomor pesanan atau nomor resi, atau buka daftar pesanan Anda.">
                <Link to="/orders" className="btn btn-ta btn-sm">Pesanan saya</Link>
              </Empty>
            </div>
          )}

          {order && (
            <>
              <div className="ta-card mt-3">
                <div className="ta-card-head">
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <h6 className="mb-0 ta-mono">{order.id}</h6>
                    <StatusBadge status={order.status} />
                  </div>
                  <Link to="/orders" className="ta-xs">Semua pesanan</Link>
                </div>
                <div className="ta-card-pad">
                  <div className="row g-4">
                    <div className="col-md-3">
                      <div className="ta-eyebrow mb-1">Kurir</div>
                      <div className="d-flex align-items-center gap-2">
                        <ProviderLogo code={provider(order.provider)?.logo} />
                        <span className="ta-sm fw-semibold">{provider(order.provider)?.name}</span>
                      </div>
                      <div className="ta-xs ta-faint mt-1">{provider(order.provider)?.service}</div>
                    </div>
                    <div className="col-md-3">
                      <div className="ta-eyebrow mb-1">Nomor resi</div>
                      <div className="ta-mono ta-sm">{order.awb}</div>
                      {order.awb !== '-' && (
                        <a className="ta-xs" href={`${provider(order.provider)?.tracking}${order.awb}`} target="_blank" rel="noreferrer">
                          Buka di situs kurir <i className="bi bi-box-arrow-up-right" style={{ fontSize: '.65rem' }} />
                        </a>
                      )}
                    </div>
                    <div className="col-md-3">
                      <div className="ta-eyebrow mb-1">Tujuan</div>
                      <div className="ta-sm">{order.address}</div>
                    </div>
                    <div className="col-md-3">
                      <div className="ta-eyebrow mb-1">Berat / nilai</div>
                      <div className="ta-sm">{order.weight} kg · {usd(order.total)}</div>
                      <div className="ta-xs ta-faint">{order.payment}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3 mt-0">
                <div className="col-lg-7">
                  <div className="ta-card h-100">
                    <div className="ta-card-head"><h6>Linimasa pengiriman</h6>
                      <span className="ta-xs ta-faint">pembaruan diambil dari API kurir</span></div>
                    <div className="ta-card-pad">
                      <ul className="ta-timeline">
                        {order.tracking.map((t, i) => (
                          <li key={i} className={t.state}>
                            <div className="d-flex justify-content-between gap-2 flex-wrap">
                              <span className={`ta-sm ${t.state === 'pending' ? 'ta-faint' : 'fw-semibold'}`}>{t.title}</span>
                              <span className="ta-xs ta-faint ta-mono">{t.time}</span>
                            </div>
                            <div className={`ta-xs ${t.state === 'pending' ? 'ta-faint' : 'ta-muted'}`}>{t.note}</div>
                            <div className="ta-xs ta-faint"><i className="bi bi-geo-alt me-1" />{t.place}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-lg-5 d-grid gap-3">
                  <div className="ta-card">
                    <div className="ta-card-head"><h6>Isi paket</h6></div>
                    <div className="ta-card-pad">
                      {order.items.map(it => {
                        const p = product(it.productId);
                        return p ? (
                          <div key={it.productId + it.variant} className="d-flex gap-2 py-2">
                            <img src={p.images[0]} alt="" className="ta-thumb" />
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <div className="ta-xs fw-semibold text-truncate">{p.title}</div>
                              <div className="ta-xs ta-faint">{it.variant} · {it.qty} pcs</div>
                            </div>
                          </div>
                        ) : null;
                      })}
                      <hr className="ta-sep my-2" />
                      <div className="ta-xs ta-faint">
                        Dikirim oleh {seller(order.sellerId)?.name} · {seller(order.sellerId)?.block}
                      </div>
                    </div>
                  </div>

                  <div className="ta-card ta-card-pad">
                    <div className="ta-eyebrow mb-2">Butuh bantuan soal paket ini?</div>
                    <div className="d-grid gap-2">
                      <Link to="/messages" className="btn btn-ta-outline btn-sm"><i className="bi bi-chat-dots me-1" />Chat penjual</Link>
                      <Link to="/messages" className="btn btn-ta-outline btn-sm"><i className="bi bi-headset me-1" />Hubungi CS TAGlobal</Link>
                      <Link to="/help" className="btn btn-ta-ghost btn-sm">Panduan bea cukai &amp; pajak</Link>
                    </div>
                  </div>

                  <div className="ta-card ta-card-pad" style={{ background: '#fbfcfd' }}>
                    <div className="ta-eyebrow mb-2">Dokumen ekspor</div>
                    {[['Invoice komersial', 'INV-' + order.id], ['Packing list', 'PL-' + order.id], ['Air waybill', order.awb]].map(([t, n]) => (
                      <div key={t} className="d-flex justify-content-between align-items-center py-1">
                        <span className="ta-sm"><i className="bi bi-file-earmark-text me-2 ta-faint" />{t}</span>
                        <span className="ta-xs ta-mono ta-faint">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

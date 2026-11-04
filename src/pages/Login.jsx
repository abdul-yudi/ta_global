import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { MarketCrest } from '../components/ui';

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'var(--ta-canvas)' }}>
      <div className="container py-5">
        <div className="row g-0 justify-content-center">
          <div className="col-lg-9">
            <div className="ta-card" style={{ overflow: 'hidden' }}>
              <div className="row g-0">
                {/* ---------- panel brand ---------- */}
                <div className="col-lg-5 p-4 p-lg-5 d-flex flex-column ta-hero ta-lattice" style={{ borderRadius: 0 }}>
                  <Link to="/" className="ta-logo mb-4" style={{ color: '#fff' }}>TA<span>Global</span></Link>
                  <MarketCrest size={40} color="var(--ta-accent)" />
                  <div className="ta-hero-kicker mt-3 mb-2">Tanah Abang · Jakarta</div>
                  <h1 className="text-white mb-3" style={{ fontSize: '1.5rem', letterSpacing: '-.02em' }}>
                    Satu pasar. Semua negara.
                  </h1>
                  <p className="mb-4" style={{ color: 'rgba(255,255,255,.75)', fontSize: '.875rem' }}>
                    Satu akun untuk belanja sekaligus berjualan. Buka toko Anda kapan saja,
                    pilih kurir sendiri, antar paket ke gerai, dana cair setiap Senin.
                  </p>
                  <div className="mt-auto d-grid gap-2">
                    {[['bi-globe2', '180+ negara tujuan'],
                      ['bi-truck', 'DHL · FedEx · EMS · UPS'],
                      ['bi-shield-check', 'Dana ditahan sampai paket diterima']].map(([i, t]) => (
                      <div key={t} className="d-flex align-items-center gap-2" style={{ color: 'rgba(255,255,255,.85)', fontSize: '.813rem' }}>
                        <i className={`bi ${i}`} style={{ color: 'var(--ta-accent)' }} />{t}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ---------- formulir ---------- */}
                <div className="col-lg-7 p-4 p-lg-5">
                  <h2 style={{ fontSize: '1.25rem' }} className="mb-1">Masuk ke akun Anda</h2>
                  <p className="ta-sm ta-muted mb-4">Belum punya akun? Pilih tab Daftar di bawah.</p>
                  <AuthForm role="buyer" onDone={() => nav(next)} />
                </div>
              </div>
            </div>
            <div className="text-center ta-xs ta-faint mt-3">
              © 2026 TAGlobal Marketplace · PT Tanah Abang Global Niaga
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

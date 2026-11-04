import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { Toasts, MarketCrest } from '../components/ui';

/** Halaman masuk terpisah untuk super admin (/superadmin). */
export default function SuperAdminLogin() {
  const nav = useNavigate();

  return (
    <div className="min-vh-100 d-flex align-items-center ta-lattice"
      style={{ background: 'linear-gradient(160deg, var(--ta-brand) 0%, var(--ta-brand-deep) 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div className="text-center mb-4">
              <div className="d-flex justify-content-center mb-2">
                <MarketCrest size={40} color="var(--ta-accent)" />
              </div>
              <Link to="/" className="ta-logo justify-content-center" style={{ color: '#fff', fontSize: '1.4rem' }}>
                TA<span>Global</span>
              </Link>
              <div className="ta-hero-kicker mt-2">Konsol Super Admin</div>
            </div>

            <div className="ta-card ta-card-pad" style={{ padding: '1.75rem' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="ta-avatar" style={{ background: 'var(--ta-info-soft)', color: 'var(--ta-info)', borderColor: '#d2e0f0' }}>
                  <i className="bi bi-shield-lock" />
                </span>
                <div>
                  <h1 style={{ fontSize: '1.1rem', margin: 0 }}>Masuk super admin</h1>
                  <div className="ta-xs ta-faint">Akses terbatas untuk tim operasional TAGlobal</div>
                </div>
              </div>

              <AuthForm role="admin" compact onDone={() => nav('/admin')} />
            </div>

            <div className="text-center mt-3">
              <Link to="/" className="ta-xs" style={{ color: 'rgba(255,255,255,.7)' }}>
                <i className="bi bi-arrow-left me-1" />Kembali ke etalase
              </Link>
            </div>
            <div className="text-center ta-xs mt-2" style={{ color: 'rgba(255,255,255,.45)' }}>
              Semua aktivitas di konsol ini dicatat.
            </div>
          </div>
        </div>
      </div>
      <Toasts />
    </div>
  );
}

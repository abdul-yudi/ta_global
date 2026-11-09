import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { Toasts, MarketCrest } from '../components/ui';

/**
 * Halaman masuk terpisah untuk Super Admin (/superadmin)
 * Mengusung tema konsol pengelola pasar Tanah Abang
 */
export default function SuperAdminLogin() {
  const nav = useNavigate();

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-between py-4 ta-lattice"
      style={{
        background: 'linear-gradient(160deg, #104832 0%, #07251a 100%)',
        position: 'relative'
      }}
    >
      {/* Tombol kembali di pojok atas */}
      <div className="container">
        <Link
          to="/"
          className="d-inline-flex align-items-center gap-2 ta-sm text-decoration-none px-3 py-2 rounded-2"
          style={{
            color: 'rgba(255,255,255,.85)',
            background: 'rgba(255,255,255,.08)',
            border: '1px solid rgba(255,255,255,.15)'
          }}
        >
          <i className="bi bi-arrow-left" />
          <span>Kembali ke Etalase TAGlobal</span>
        </Link>
      </div>

      <div className="container my-auto py-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5 col-xl-4">
            {/* Header Lambang Pasar */}
            <div className="text-center mb-4">
              <div className="d-flex justify-content-center mb-3">
                <div className="ta-auth-medallion" style={{ width: 68, height: 68 }}>
                  <MarketCrest size={42} color="var(--ta-accent)" />
                </div>
              </div>
              <Link to="/" className="ta-logo justify-content-center text-white" style={{ fontSize: '1.5rem' }}>
                TA<span style={{ color: 'var(--ta-accent)' }}>Global</span>
              </Link>
              <div
                className="ta-auth-badge mx-auto mt-2"
                style={{
                  background: 'rgba(187, 143, 51, 0.16)',
                  color: 'var(--ta-accent)'
                }}
              >
                <i className="bi bi-shield-shaded" />
                Konsol Operasional Super Admin
              </div>
            </div>

            {/* Kartu Autentikasi Admin */}
            <div
              className="ta-auth-card p-4 p-md-4"
              style={{
                borderTop: '3.5px solid var(--ta-accent)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)'
              }}
            >
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--ta-line-soft)' }}>
                <span
                  className="ta-avatar ta-avatar-lg"
                  style={{
                    background: 'var(--ta-brand-soft)',
                    color: 'var(--ta-brand)',
                    borderColor: '#cfded6'
                  }}
                >
                  <i className="bi bi-shield-lock fs-5" />
                </span>
                <div>
                  <h1 style={{ fontSize: '1.15rem', fontWeight: 650, margin: 0 }}>Masuk Super Admin</h1>
                  <div className="ta-xs ta-muted mt-0.5">Akses khusus tim manajemen & pengelola pasar</div>
                </div>
              </div>

              <AuthForm role="admin" compact onDone={() => nav('/admin')} />
            </div>

            {/* Catatan Audit Keamanan */}
            <div className="text-center mt-3">
              <div className="ta-xs" style={{ color: 'rgba(255,255,255,.6)' }}>
                <i className="bi bi-shield-check me-1 text-warning" />
                Koneksi terenkripsi. Semua upaya masuk dan aktivitas dicatat ke log audit sistem.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Konsol */}
      <div className="container text-center ta-xs" style={{ color: 'rgba(255,255,255,.45)' }}>
        PT Tanah Abang Global Niaga · Pengelola Pusat Grosir Blok A Jakarta
      </div>

      <Toasts />
    </div>
  );
}

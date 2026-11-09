import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { MarketCrest } from '../components/ui';

/**
 * Halaman Masuk & Pendaftaran Terpadu TAGlobal
 * Mengusung tema arsitektural dan budaya Pusat Grosir Blok A Tanah Abang:
 * - Hijau giok mendalam (--ta-brand, --ta-brand-deep)
 * - Kisi belah ketupat fasad (.ta-lattice)
 * - Trim emas & ornamen lengkung Blok A (.ta-rule, .ta-crest, MarketCrest)
 * - Dinding krem hangat (--ta-canvas, --ta-cream)
 */
export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-between py-4"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #f4efe2 0%, var(--ta-canvas) 70%)'
      }}
    >
      {/* ---------- Bar navigasi atas ---------- */}
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <Link to="/" className="ta-auth-nav-link">
            <i className="bi bi-arrow-left" />
            <span>Kembali ke Etalase</span>
          </Link>
          <div className="d-flex align-items-center gap-3">
            <span className="ta-crest d-none d-sm-inline-flex">
              <i className="bi bi-geo-alt-fill" style={{ color: 'var(--ta-accent)' }} />
              Blok A · Tanah Abang
            </span>
            <Link to="/help" className="ta-sm ta-muted text-decoration-none">
              <i className="bi bi-question-circle me-1" />
              Bantuan
            </Link>
          </div>
        </div>
      </div>

      {/* ---------- Kartu utama autentikasi ---------- */}
      <div className="container my-auto">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-11" style={{ maxWidth: 1040 }}>
            <div className="ta-auth-card">
              <div className="row g-0">
                {/* ========== PANEL BRAND & WARISAN PASAR (KIRI) ========== */}
                <div className="col-lg-5 p-4 p-xl-5 ta-auth-hero ta-lattice">
                  {/* Bagian atas: Logo & Lambang Lengkung */}
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <Link to="/" className="ta-logo text-white" style={{ fontSize: '1.45rem' }}>
                        TA<span style={{ color: 'var(--ta-accent)' }}>Global</span>
                      </Link>
                      <div className="ta-auth-medallion">
                        <MarketCrest size={34} color="var(--ta-accent)" />
                      </div>
                    </div>

                    <div className="ta-auth-badge mb-3">
                      <i className="bi bi-award-fill" />
                      Pusat Grosir Tanah Abang · Blok A
                    </div>

                    <h1 className="text-white mb-3" style={{ fontSize: '1.65rem', fontWeight: 650, letterSpacing: '-.025em', lineHeight: 1.3 }}>
                      Gerbang Ekspor Grosir Indonesia ke Seluruh Dunia
                    </h1>

                    <p className="mb-4" style={{ color: 'rgba(255, 255, 255, .78)', fontSize: '.875rem', lineHeight: 1.6 }}>
                      Hubungkan langsung ribuan kios tekstil, busana muslim, batik, dan konveksi Tanah Abang
                      dengan pembeli internasional di 180+ negara dalam satu sistem terintegrasi.
                    </p>
                  </div>

                  {/* Fitur Utama */}
                  <div className="d-grid gap-2 mb-4">
                    <div className="ta-auth-feature-box">
                      <div className="ta-auth-feature-icon">
                        <i className="bi bi-globe2" />
                      </div>
                      <div>
                        <div className="text-white fw-semibold ta-sm">Ekspor ke 180+ Negara</div>
                        <div className="ta-xs" style={{ color: 'rgba(255, 255, 255, .7)' }}>
                          DHL · FedEx · Pos Indonesia EMS · UPS langsung dari hub Blok A
                        </div>
                      </div>
                    </div>

                    <div className="ta-auth-feature-box">
                      <div className="ta-auth-feature-icon">
                        <i className="bi bi-shield-check" />
                      </div>
                      <div>
                        <div className="text-white fw-semibold ta-sm">TAGlobal Escrow Protection</div>
                        <div className="ta-xs" style={{ color: 'rgba(255, 255, 255, .7)' }}>
                          Dana ditahan aman di rekening bersama sampai pesanan diterima
                        </div>
                      </div>
                    </div>

                    <div className="ta-auth-feature-box">
                      <div className="ta-auth-feature-icon">
                        <i className="bi bi-shop" />
                      </div>
                      <div>
                        <div className="text-white fw-semibold ta-sm">Satu Akun Multi-Fungsi</div>
                        <div className="ta-xs" style={{ color: 'rgba(255, 255, 255, .7)' }}>
                          Beli ecer/grosir sekaligus buka toko ekspor tanpa biaya admin pendaftaran
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kapsul Statistik Kredibilitas */}
                  <div className="mt-auto pt-3 border-top" style={{ borderColor: 'rgba(255, 255, 255, .15)' }}>
                    <div className="d-flex gap-2">
                      <div className="ta-auth-stat-card">
                        <div className="fw-bold text-white fs-6">180+</div>
                        <div className="ta-xs" style={{ color: 'rgba(255, 255, 255, .65)' }}>Negara</div>
                      </div>
                      <div className="ta-auth-stat-card">
                        <div className="fw-bold text-white fs-6">3 Gerai</div>
                        <div className="ta-xs" style={{ color: 'rgba(255, 255, 255, .65)' }}>Blok A, B & Metro</div>
                      </div>
                      <div className="ta-auth-stat-card">
                        <div className="fw-bold text-white fs-6">100%</div>
                        <div className="ta-xs" style={{ color: 'rgba(255, 255, 255, .65)' }}>Garansi Escrow</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========== PANEL FORMULIR AUTENTIKASI (KANAN) ========== */}
                <div className="col-lg-7 p-4 p-md-5 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="ta-eyebrow" style={{ color: 'var(--ta-accent)' }}>
                        Portal Pengguna Terpadu
                      </div>
                      <span className="ta-crest">
                        <i className="bi bi-check2-circle text-success" />
                        Aman & Terverifikasi
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.45rem', fontWeight: 650, letterSpacing: '-.02em' }} className="mb-1">
                      Selamat Datang di TAGlobal
                    </h2>
                    <p className="ta-sm ta-muted mb-4">
                      Masuk untuk melanjutkan transaksi, kelola pesanan ekspor, atau pantau kiriman Anda.
                    </p>

                    {/* Formulir Autentikasi */}
                    <AuthForm role="buyer" onDone={() => nav(next)} />
                  </div>

                  {/* Bagian bawah formulir */}
                  <div className="mt-4 pt-3 border-top" style={{ borderColor: 'var(--ta-line-soft)' }}>
                    {/* Garis pemisah ornamen emas */}
                    <div className="ta-rule mb-3">
                      <i />
                    </div>

                    {/* Jaminan Keamanan */}
                    <div className="ta-auth-trust-bar mb-3">
                      <span>
                        <i className="bi bi-lock-fill me-1" style={{ color: 'var(--ta-accent)' }} />
                        Enkripsi SSL 256-Bit
                      </span>
                      <span>
                        <i className="bi bi-building-check me-1" style={{ color: 'var(--ta-brand)' }} />
                        Pusat Grosir Resmi Tanah Abang
                      </span>
                      <span>
                        <i className="bi bi-headset me-1" style={{ color: 'var(--ta-accent)' }} />
                        Dukungan Ekspor 24/7
                      </span>
                    </div>

                    {/* Tautan Super Admin */}
                    <div className="text-center pt-2">
                      <Link
                        to="/superadmin"
                        className="ta-xs text-decoration-none fw-semibold"
                        style={{ color: 'var(--ta-ink-faint)' }}
                      >
                        <i className="bi bi-shield-lock me-1" />
                        Masuk sebagai Pengelola Pasar (Super Admin)
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hak Cipta & Info Fasad */}
            <div className="text-center ta-xs ta-faint mt-4">
              <div>© 2026 TAGlobal Marketplace · PT Tanah Abang Global Niaga</div>
              <div className="mt-1" style={{ opacity: .8 }}>
                Gedung Pusat Grosir Tanah Abang Blok A, Jl. KH. Mas Mansyur, Jakarta Pusat 10250 · Hub Logistik Ekspor Cengkareng
              </div>
            </div>
          </div>
        </div>
      </div>

      <div />
    </div>
  );
}

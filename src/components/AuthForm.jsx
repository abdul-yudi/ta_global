import React, { useState } from 'react';
import { useStore } from '../data/store';
import { authenticate, apiActions } from '../api/marketplace';
import { COUNTRIES } from '../data/mock';

/**
 * Formulir masuk / daftar yang dipakai ulang oleh popup etalase,
 * halaman /login (pembeli & pedagang) dan halaman /superadmin.
 * Mengikuti palet fasad Blok A Tanah Abang (hijau giok, krem, trim emas).
 */
export default function AuthForm({ role = 'buyer', onDone, compact = false }) {
  const { dispatch, toast } = useStore();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', name: '', email: '', country: 'Indonesia', store: '', agree: true });
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    setForgotMsg(false);
    setBusy(true);
    try {
      if (mode === 'register') {
        if (!form.name || !form.username || !form.email || form.password.length < 8) {
          throw new Error('Nama, username, dan email wajib diisi; kata sandi minimal 8 karakter.');
        }
        if (!form.agree) {
          throw new Error('Harap setujui syarat layanan untuk membuat akun TAGlobal.');
        }
        const account = await apiActions.register(form);
        await dispatch({ type: 'auth:login', account });
        toast(`Akun berhasil dibuat — selamat datang, ${form.name.split(' ')[0]}`);
        onDone?.('buyer');
        return;
      }

      const result = await authenticate(form.email, form.password, role);
      if (!result.ok) throw new Error(result.reason);
      await dispatch({ type: 'auth:login', account: result.account });
      toast(`Selamat datang kembali, ${result.account.name.split(' ')[0]}`);
      onDone?.(result.account.role);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {role === 'buyer' && (
        <div className="ta-auth-tabs mb-4">
          <button
            type="button"
            className={`ta-auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setForgotMsg(false); }}
          >
            <i className="bi bi-box-arrow-in-right" />
            <span>Masuk ke Akun</span>
          </button>
          <button
            type="button"
            className={`ta-auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); setForgotMsg(false); }}
          >
            <i className="bi bi-person-plus" />
            <span>Daftar Akun Baru</span>
            <span className="ta-badge ta-badge-accent py-0 px-1" style={{ fontSize: '.65rem' }}>Gratis</span>
          </button>
        </div>
      )}

      <form onSubmit={submit}>
        {mode === 'register' && (
          <>
            <div className="mb-3">
              <label className="form-label">Nama Lengkap</label>
              <div className="ta-input-wrap">
                <input
                  className="form-control"
                  value={form.name}
                  placeholder="Contoh: Budi Darmawan"
                  required={mode === 'register'}
                  onChange={e => set('name', e.target.value)}
                />
                <i className="bi bi-person ta-input-icon" />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label className="form-label">Alamat Email</label>
                <div className="ta-input-wrap">
                  <input
                    className="form-control"
                    type="email"
                    value={form.email}
                    placeholder="nama@email.com"
                    required
                    onChange={e => set('email', e.target.value)}
                  />
                  <i className="bi bi-envelope ta-input-icon" />
                </div>
              </div>
              <div className="col-sm-6">
                <label className="form-label">Negara Domisili</label>
                <div className="ta-input-wrap">
                  <select
                    className="form-select"
                    value={form.country}
                    onChange={e => set('country', e.target.value)}
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <i className="bi bi-globe ta-input-icon" />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Username</label>
              <div className="ta-input-wrap">
                <input
                  className="form-control"
                  value={form.username}
                  autoComplete="username"
                  required
                  placeholder="username_anda"
                  onChange={e => set('username', e.target.value)}
                />
                <i className="bi bi-at ta-input-icon" />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label mb-0">
                  Nama Toko <span className="ta-faint fw-normal">(Opsional)</span>
                </label>
                <span className="ta-xs ta-faint">Bisa dibuka kapan saja</span>
              </div>
              <div className="ta-input-wrap">
                <input
                  className="form-control"
                  value={form.store}
                  placeholder="Isi jika Anda juga ingin mengekspor produk"
                  onChange={e => set('store', e.target.value)}
                />
                <i className="bi bi-shop ta-input-icon" />
              </div>
              <div className="form-text mt-1">
                <i className="bi bi-info-circle me-1" />
                Satu akun TAGlobal berlaku ganda: untuk belanja grosir/eceran sekaligus menjual produk Anda.
              </div>
            </div>
          </>
        )}

        {mode === 'login' && (
          <div className="mb-3">
            <label className="form-label">Email atau Username</label>
            <div className="ta-input-wrap">
              <input
                className="form-control"
                type="text"
                value={form.email}
                autoComplete="username"
                required
                placeholder="nama@email.com atau username"
                onChange={e => set('email', e.target.value)}
              />
              <i className="bi bi-person ta-input-icon" />
            </div>
          </div>
        )}

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label className="form-label mb-0">Kata Sandi</label>
            {mode === 'login' && (
              <a
                href="#!"
                className="ta-xs fw-semibold"
                style={{ color: 'var(--ta-accent)' }}
                onClick={e => { e.preventDefault(); setForgotMsg(m => !m); }}
              >
                Lupa kata sandi?
              </a>
            )}
          </div>
          <div className="ta-input-wrap">
            <input
              className="form-control pe-5"
              type={show ? 'text' : 'password'}
              value={form.password}
              required
              minLength={mode === 'register' ? 8 : 1}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              onChange={e => set('password', e.target.value)}
            />
            <i className="bi bi-lock ta-input-icon" />
            <button
              className="ta-auth-eye-btn"
              type="button"
              onClick={() => setShow(s => !s)}
              aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              <i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
          {mode === 'register' && (
            <div className="form-text mt-1">
              <i className="bi bi-shield-check me-1" />
              Minimal 8 karakter kombinasi huruf dan angka.
            </div>
          )}
        </div>

        {forgotMsg && mode === 'login' && (
          <div className="ta-cream-panel p-3 mb-3 d-flex gap-2 ta-sm align-items-start">
            <i className="bi bi-info-circle-fill text-warning mt-1 fs-6 flex-none" />
            <div>
              <div className="fw-semibold mb-1">Bantuan Pemulihan Kata Sandi</div>
              <div className="ta-muted">
                Untuk menjaga keamanan akun transaksi internasional Anda, silakan hubungi pusat bantuan TAGlobal di
                gerai Blok A / Metro atau email ke <strong>bantuan@taglobal.id</strong>.
              </div>
            </div>
          </div>
        )}

        {mode === 'login' ? (
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" id={`remember-${role}`} defaultChecked />
            <label className="form-check-label ta-sm" htmlFor={`remember-${role}`}>
              Tetap masuk di perangkat ini
            </label>
          </div>
        ) : (
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="agree"
              checked={form.agree}
              onChange={e => set('agree', e.target.checked)}
            />
            <label className="form-check-label ta-xs" htmlFor="agree">
              Saya menyetujui{' '}
              <a href="#!" onClick={e => e.preventDefault()} style={{ color: 'var(--ta-accent)', textDecoration: 'underline' }}>
                Syarat Layanan Perdagangan
              </a>{' '}
              dan{' '}
              <a href="#!" onClick={e => e.preventDefault()} style={{ color: 'var(--ta-accent)', textDecoration: 'underline' }}>
                Kebijakan Privasi
              </a>{' '}
              TAGlobal Pasar Grosir Tanah Abang.
            </label>
          </div>
        )}

        {error && (
          <div
            className="p-3 mb-3 d-flex align-items-center gap-2 ta-sm"
            style={{
              background: 'var(--ta-danger-soft)',
              border: '1px solid #f3d2d7',
              borderRadius: 'var(--ta-radius-sm)',
              color: 'var(--ta-danger)'
            }}
          >
            <i className="bi bi-exclamation-triangle-fill fs-6 flex-none" />
            <span>{error}</span>
          </div>
        )}

        <button
          className={`btn btn-ta w-100 ${compact ? '' : 'btn-lg'} d-flex align-items-center justify-content-center gap-2`}
          type="submit"
          disabled={busy}
          style={{
            fontWeight: 650,
            letterSpacing: '-.01em',
            boxShadow: '0 2px 8px rgba(18, 84, 58, .2)'
          }}
        >
          {busy ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              <span>Memproses...</span>
            </>
          ) : mode === 'login' ? (
            <>
              <span>Masuk ke Akun</span>
              <i className="bi bi-arrow-right" />
            </>
          ) : (
            <>
              <span>Daftar Akun Sekarang</span>
              <i className="bi bi-arrow-right" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

import React, { useState } from 'react';
import { useStore, authenticate } from '../data/store';
import { DEMO_HINT, COUNTRIES } from '../data/mock';

/**
 * Formulir masuk / daftar yang dipakai ulang oleh popup etalase,
 * halaman /login (pembeli) dan halaman /superadmin.
 */
export default function AuthForm({ role = 'buyer', onDone, compact = false }) {
  const { dispatch, toast } = useStore();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', name: '', email: '', country: 'Indonesia', store: '', agree: true });
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const hint = role === 'admin' ? DEMO_HINT.admin : DEMO_HINT.buyer;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = e => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!form.name || !form.username || !form.password) {
        setError('Nama, username dan kata sandi wajib diisi.');
        return;
      }
      // Prototipe: pendaftaran langsung memakai akun demo pembeli
      const demo = authenticate(DEMO_HINT.buyer.username, DEMO_HINT.buyer.password, 'buyer');
      dispatch({ type: 'auth:login', account: { ...demo.account, name: form.name } });
      toast(`Akun dibuat — selamat datang, ${form.name.split(' ')[0]}`);
      onDone?.('buyer');
      return;
    }

    const res = authenticate(form.username, form.password, role);
    if (!res.ok) { setError(res.reason); return; }
    dispatch({ type: 'auth:login', account: res.account });
    toast(`Selamat datang, ${res.account.name.split(' ')[0]}`);
    onDone?.(res.account.role);
  };

  const fillDemo = () => {
    setForm(f => ({ ...f, username: hint.username, password: hint.password }));
    setError('');
  };

  return (
    <>
      {role === 'buyer' && (
        <div className="ta-tabs mb-3">
          <button type="button" className={`ta-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}>Masuk</button>
          <button type="button" className={`ta-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}>Daftar</button>
        </div>
      )}

      <form onSubmit={submit}>
        {mode === 'register' && (
          <>
            <div className="mb-3">
              <label className="form-label">Nama lengkap</label>
              <input className="form-control" value={form.name} placeholder="Nama Anda"
                onChange={e => set('name', e.target.value)} />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-sm-6">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={form.email} placeholder="nama@email.com"
                  onChange={e => set('email', e.target.value)} />
              </div>
              <div className="col-sm-6">
                <label className="form-label">Negara</label>
                <select className="form-select" value={form.country} onChange={e => set('country', e.target.value)}>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Nama toko <span className="ta-faint fw-normal">(opsional)</span></label>
              <input className="form-control" value={form.store} placeholder="Isi bila Anda juga ingin berjualan"
                onChange={e => set('store', e.target.value)} />
              <div className="form-text">Setiap pembeli bisa membuka toko sendiri kapan saja.</div>
            </div>
          </>
        )}

        <div className="mb-3">
          <label className="form-label">Username</label>
          <input className="form-control" value={form.username} autoComplete="username"
            placeholder={role === 'admin' ? 'username admin' : 'username Anda'}
            onChange={e => set('username', e.target.value)} />
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between">
            <label className="form-label">Kata sandi</label>
            {mode === 'login' && <a href="#!" className="ta-xs" onClick={e => e.preventDefault()}>Lupa kata sandi?</a>}
          </div>
          <div className="input-group">
            <input className="form-control" type={show ? 'text' : 'password'} value={form.password}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="••••••••"
              onChange={e => set('password', e.target.value)} />
            <button className="btn btn-ta-outline" type="button" onClick={() => setShow(s => !s)}
              aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
              <i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
        </div>

        {mode === 'login' ? (
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" id={`remember-${role}`} defaultChecked />
            <label className="form-check-label" htmlFor={`remember-${role}`}>Tetap masuk di perangkat ini</label>
          </div>
        ) : (
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" id="agree" checked={form.agree}
              onChange={e => set('agree', e.target.checked)} />
            <label className="form-check-label ta-xs" htmlFor="agree">
              Saya menyetujui syarat layanan dan kebijakan privasi TAGlobal.
            </label>
          </div>
        )}

        {error && (
          <div className="ta-flat p-2 mb-3 d-flex gap-2 ta-sm"
            style={{ background: 'var(--ta-danger-soft)', borderColor: '#f3d2d7', color: 'var(--ta-danger)' }}>
            <i className="bi bi-exclamation-circle-fill" />
            <span>{error}</span>
          </div>
        )}

        <button className={`btn btn-ta w-100 ${compact ? '' : 'btn-lg'}`} type="submit">
          {mode === 'login' ? 'Masuk' : 'Buat akun'} <i className="bi bi-arrow-right ms-1" />
        </button>
      </form>

      {/* ---------- hint akun sementara ---------- */}
      <div className="ta-flat p-3 mt-3" style={{ background: '#fbfcfd' }}>
        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
          <span className="ta-eyebrow mb-0">Akun demo sementara</span>
          <button type="button" className="btn btn-ta-ghost btn-sm py-0" onClick={fillDemo}>Isi otomatis</button>
        </div>
        <div className="d-flex justify-content-between ta-sm py-1" style={{ borderBottom: '1px solid var(--ta-line-soft)' }}>
          <span className="ta-muted">{role === 'admin' ? 'Super admin' : 'Pembeli / penjual'}</span>
          <span className="ta-mono">{hint.username} / {hint.password}</span>
        </div>
        <div className="ta-xs ta-faint mt-2">
          {role === 'admin'
            ? 'Akun pembeli tidak bisa masuk lewat halaman ini.'
            : <>Super admin masuk lewat halaman terpisah di <span className="ta-mono">/superadmin</span>.</>}
        </div>
      </div>
    </>
  );
}

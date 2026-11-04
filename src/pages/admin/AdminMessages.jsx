import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../data/store';
import { PageHead, Modal } from '../../components/ui';
import Chat from '../../components/Chat';

export default function AdminMessages() {
  const { state, dispatch, toast } = useStore();
  const [compose, setCompose] = useState(false);
  const [to, setTo] = useState({ kind: 'seller', id: 's1', subject: 'Pemberitahuan umum', text: '' });

  const send = () => {
    const name = to.kind === 'seller'
      ? state.sellers.find(s => s.id === to.id)?.name
      : state.orders.find(o => o.buyer === to.id)?.buyer || to.id;
    dispatch({
      type: 'thread:create',
      thread: {
        id: 't' + Date.now(), with: name, role: to.kind, subject: to.subject,
        party: `admin:${to.id}`, unread: 0, last: 'baru saja', online: false,
        messages: [{ from: 'me', text: to.text || 'Halo, ini tim TAGlobal.', time: new Date().toTimeString().slice(0, 5) }],
      },
    });
    toast(`Pesan terkirim ke ${name}`);
    setCompose(false);
    setTo(t => ({ ...t, text: '' }));
  };

  const buyers = [...new Set(state.orders.map(o => o.buyer))];

  return (
    <>
      <PageHead eyebrow="Komunikasi" title="Pesan"
        sub="Kotak masuk customer service — percakapan dengan penjual dan pembeli">
        <Link to="/admin/broadcast" className="btn btn-ta-outline"><i className="bi bi-megaphone me-1" />Siaran</Link>
        <button className="btn btn-ta" onClick={() => setCompose(true)}>
          <i className="bi bi-pencil-square me-1" />Pesan baru
        </button>
      </PageHead>

      <div className="row g-3 mb-3">
        {[
          ['Percakapan terbuka', state.threads.length, 'bi-chat-square-text'],
          ['Belum dibaca', state.threads.reduce((a, t) => a + (t.unread || 0), 0), 'bi-envelope'],
          ['Median balasan pertama', '2j 04m', 'bi-stopwatch'],
          ['Kepuasan layanan', '94%', 'bi-emoji-smile'],
        ].map(([l, v, i]) => (
          <div className="col-6 col-xl-3" key={l}>
            <div className="ta-stat d-flex align-items-center gap-3">
              <i className={`bi ${i}`} style={{ fontSize: '1.4rem', color: 'var(--ta-brand)' }} />
              <div>
                <div className="ta-stat-label">{l}</div>
                <div className="ta-stat-value" style={{ fontSize: '1.3rem', margin: 0 }}>{v}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Chat role="admin" />

      <Modal open={compose} onClose={() => setCompose(false)} size="modal-lg" title="Pesan baru"
        footer={(
          <>
            <button className="btn btn-ta-outline btn-sm" onClick={() => setCompose(false)}>Batal</button>
            <button className="btn btn-ta btn-sm" onClick={send}><i className="bi bi-send me-1" />Kirim</button>
          </>
        )}>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Jenis penerima</label>
            <select className="form-select" value={to.kind}
              onChange={e => setTo({ ...to, kind: e.target.value, id: e.target.value === 'seller' ? 's1' : buyers[0] })}>
              <option value="seller">Penjual</option>
              <option value="buyer">Pembeli</option>
            </select>
          </div>
          <div className="col-md-8">
            <label className="form-label">Penerima</label>
            <select className="form-select" value={to.id} onChange={e => setTo({ ...to, id: e.target.value })}>
              {to.kind === 'seller'
                ? state.sellers.map(s => <option key={s.id} value={s.id}>{s.name} — {s.owner} ({s.block})</option>)
                : buyers.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Perihal</label>
            <select className="form-select" value={to.subject} onChange={e => setTo({ ...to, subject: e.target.value })}>
              {to.kind === 'seller' ? (
                <>
                  <option>Pemberitahuan umum</option>
                  <option>Peringatan kualitas produk</option>
                  <option>Peringatan performa pengiriman</option>
                  <option>Pembaruan verifikasi</option>
                  <option>Pemberitahuan pencairan dana</option>
                </>
              ) : (
                <>
                  <option>Pemberitahuan umum</option>
                  <option>Pembaruan pesanan</option>
                  <option>Permintaan dokumen bea cukai</option>
                  <option>Status pengembalian dana</option>
                  <option>Penyelesaian sengketa</option>
                </>
              )}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Pesan</label>
            <textarea className="form-control" rows="6" value={to.text}
              onChange={e => setTo({ ...to, text: e.target.value })}
              placeholder="Tulis pesan Anda…" />
            <div className="form-text">Dikirim ke kotak masuk aplikasi dan diteruskan ke email.</div>
          </div>
          <div className="col-12">
            <div className="ta-flat p-2 ta-xs ta-muted">
              <i className="bi bi-info-circle me-1" />
              Pesan admin ditandai “CS TAGlobal” di kotak masuk penerima dan tidak dapat mereka hapus.
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

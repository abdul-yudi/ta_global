import React, { useEffect, useRef, useState } from 'react';
import $ from 'jquery';
import { useStore } from '../data/store';
import { Empty } from './ui';

const QUICK = {
  buyer: ['Apakah barangnya ready stock?', 'Bisa campur warna dalam satu karton?', 'Kurir tercepat ke negara saya apa?', 'Boleh minta harga grosir untuk 500 pcs?'],
  seller: ['Stok ready, hari ini bisa saya packing.', 'Saya antar ke gerai sebelum cut-off 15:00.', 'Campur warna dalam satu karton tidak masalah.', 'Ini harga grosir untuk jumlah tersebut.'],
  admin: ['Foto listing Anda perlu diperjelas.', 'Invoice komersial sudah kami kirim via email.', 'Mohon balas pesan pembeli dalam 24 jam.', 'Pencairan dana sudah kami kirim ke rekening Anda.'],
};

/* Teks antarmuka chat */
const T = {
  searchPh: 'Cari percakapan', noMatch: 'Tidak ada hasil', none: 'Belum ada percakapan',
  online: 'Sedang online', about: s => `Percakapan tentang ${s}`, writePh: 'Tulis pesan…',
  send: 'Kirim', attach: 'Detail pesanan dilampirkan ke percakapan', report: 'Percakapan dilaporkan ke CS TAGlobal',
  picker: 'Pemilih gambar (prototipe)', sent: 'Pesan terkirim',
  footer: 'Lakukan percakapan di dalam TAGlobal — pembayaran di luar platform tidak dilindungi jaminan pembeli.',
  roleAdmin: 'CS TAGlobal', roleSeller: 'Penjual', roleBuyer: 'Pembeli',
};

export default function Chat({ role = 'buyer', filter }) {
  const { state, dispatch, toast } = useStore();
  const t = T;
  const threads = filter ? state.threads.filter(filter) : state.threads;
  const [activeId, setActiveId] = useState(threads[0]?.id);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [onThread, setOnThread] = useState(false);
  const feed = useRef(null);

  const active = threads.find(x => x.id === activeId) || threads[0];

  useEffect(() => {
    if (active) dispatch({ type: 'thread:read', threadId: active.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  // jQuery keeps the feed pinned to the newest message
  useEffect(() => {
    if (feed.current) $(feed.current).scrollTop(feed.current.scrollHeight);
  }, [active?.messages.length, active?.id]);

  const send = e => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    const now = new Date().toTimeString().slice(0, 5);
    dispatch({ type: 'thread:send', threadId: active.id, text: text.trim(), time: now });
    setText('');
    toast(t.sent, 'ok');
  };

  const shown = threads.filter(x => !search
    || x.with.toLowerCase().includes(search.toLowerCase())
    || x.subject.toLowerCase().includes(search.toLowerCase()));

  if (!threads.length) {
    return <div className="ta-card"><Empty icon="bi-chat-dots" title={t.none} /></div>;
  }

  const roleLabel = r => (r === 'admin' ? t.roleAdmin : r === 'seller' ? t.roleSeller : t.roleBuyer);

  return (
    <div className="ta-card" style={{ overflow: 'hidden' }}>
      <div className={`ta-chat-wrap ${onThread ? 'on-thread' : ''}`}>
        {/* ---------- thread list ---------- */}
        <div className="ta-chat-list">
          <div className="p-2" style={{ borderBottom: '1px solid var(--ta-line)' }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text"><i className="bi bi-search" /></span>
              <input className="form-control" placeholder={t.searchPh} value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          {shown.map(x => (
            <div key={x.id} className={`ta-chat-item ${active?.id === x.id ? 'active' : ''}`}
              onClick={() => { setActiveId(x.id); setOnThread(true); }}>
              <span className="ta-avatar position-relative">
                {x.with.slice(0, 2).toUpperCase()}
                {x.online && <span className="ta-dot" style={{ background: 'var(--ta-ok)', position: 'absolute', bottom: 0, right: 0, border: '1.5px solid #fff' }} />}
              </span>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div className="d-flex justify-content-between gap-2">
                  <span className="ta-sm fw-semibold text-truncate">{x.with}</span>
                  <span className="ta-xs ta-faint" style={{ flex: 'none' }}>{x.last}</span>
                </div>
                <div className="ta-xs ta-faint text-truncate">{x.subject}</div>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className={`ta-badge ${x.role === 'admin' ? 'ta-badge-info' : x.role === 'seller' ? 'ta-badge-accent' : 'ta-badge-neutral'}`}
                    style={{ fontSize: '.656rem' }}>
                    {roleLabel(x.role)}
                  </span>
                  {x.unread > 0 && <span className="ta-pill-count" style={{ marginLeft: 0 }}>{x.unread}</span>}
                </div>
              </div>
            </div>
          ))}
          {!shown.length && <div className="ta-empty ta-sm">{t.noMatch}</div>}
        </div>

        {/* ---------- thread body ---------- */}
        <div className="ta-chat-body">
          {active && (
            <>
              <div className="ta-chat-head">
                <button className="btn btn-ta-ghost btn-sm d-lg-none" onClick={() => setOnThread(false)} aria-label="Back">
                  <i className="bi bi-chevron-left" />
                </button>
                <span className="ta-avatar">{active.with.slice(0, 2).toUpperCase()}</span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="ta-sm fw-semibold text-truncate">{active.with}</div>
                  <div className="ta-xs ta-faint text-truncate">
                    {active.online ? <><span className="ta-dot me-1" style={{ background: 'var(--ta-ok)' }} />{t.online} · </> : ''}
                    {active.subject}
                  </div>
                </div>
                <div className="d-flex gap-1">
                  <button className="btn btn-ta-outline btn-sm" onClick={() => toast(t.attach, 'info')}>
                    <i className="bi bi-paperclip" />
                  </button>
                  <button className="btn btn-ta-outline btn-sm" onClick={() => toast(t.report, 'warn')}>
                    <i className="bi bi-flag" />
                  </button>
                </div>
              </div>

              <div className="ta-chat-feed" ref={feed}>
                <span className="ta-chat-day">{t.about(active.subject)}</span>
                {active.messages.map((m, i) => (
                  <div key={i} className={`ta-bubble ${m.from === 'me' ? 'ta-bubble-out' : 'ta-bubble-in'}`}>
                    <div>{m.text}</div>
                    <div className="ta-bubble-time">
                      {m.time}{m.from === 'me' && <i className="bi bi-check2-all ms-1" />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="ta-chat-compose">
                <div className="d-flex gap-1 mb-2 ta-scroll-x">
                  {(QUICK[role] || QUICK.buyer).map(qr => (
                    <button key={qr} className="ta-chip" style={{ whiteSpace: 'nowrap' }} onClick={() => setText(qr)}>{qr}</button>
                  ))}
                </div>
                <form className="input-group" onSubmit={send}>
                  <button type="button" className="btn btn-ta-outline" onClick={() => toast(t.picker, 'info')} aria-label="Attach">
                    <i className="bi bi-image" />
                  </button>
                  <input className="form-control" placeholder={t.writePh} value={text} onChange={e => setText(e.target.value)} />
                  <button className="btn btn-ta" type="submit"><i className="bi bi-send me-1" />{t.send}</button>
                </form>
                <div className="ta-xs ta-faint mt-1">{t.footer}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

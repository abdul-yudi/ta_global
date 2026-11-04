import React, { useEffect, useRef, useState } from 'react';
import $ from 'jquery';
import { Tooltip } from 'bootstrap';
import { useStore, num } from '../data/store';
import { ORDER_STATUS } from '../data/mock';

/* ------------------------------------------------------------------ */
/*  jQuery-powered helpers                                            */
/* ------------------------------------------------------------------ */

/** Initialise Bootstrap tooltips on every [data-bs-toggle="tooltip"] inside scope. */
export function useTooltips(deps = []) {
  useEffect(() => {
    const nodes = $('[data-bs-toggle="tooltip"]').toArray();
    const made = nodes.map(n => Tooltip.getOrCreateInstance(n, { trigger: 'hover focus' }));
    return () => made.forEach(t => { try { t.dispose(); } catch (e) { /* already gone */ } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** jQuery live filter over a table: hides rows that do not contain the needle. */
export function useTableFilter(tableSel, needle) {
  useEffect(() => {
    const q = String(needle || '').toLowerCase().trim();
    $(tableSel).find('tbody tr').each(function () {
      const hit = !q || $(this).text().toLowerCase().indexOf(q) > -1;
      $(this).toggle(hit);
    });
  }, [tableSel, needle]);
}

/* ------------------------------------------------------------------ */
/*  Primitives                                                        */
/* ------------------------------------------------------------------ */
export function PageHead({ eyebrow, title, sub, children }) {
  return (
    <div className="ta-page-head">
      <div>
        {eyebrow && <div className="ta-eyebrow mb-1">{eyebrow}</div>}
        <h1>{title}</h1>
        {sub && <div className="ta-muted ta-sm">{sub}</div>}
      </div>
      {children && <div className="d-flex gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

export function Card({ title, action, children, pad = true, className = '' }) {
  return (
    <div className={`ta-card ${className}`}>
      {(title || action) && (
        <div className="ta-card-head">
          <h6>{title}</h6>
          {action}
        </div>
      )}
      <div className={pad ? 'ta-card-pad' : ''}>{children}</div>
    </div>
  );
}

export function Stat({ label, value, delta, deltaDir = 'up', hint, icon }) {
  return (
    <div className="ta-stat">
      <div className="d-flex justify-content-between align-items-start">
        <div className="ta-stat-label">{label}</div>
        {icon && <i className={`bi ${icon} ta-faint`} />}
      </div>
      <div className="ta-stat-value">{value}</div>
      <div className="d-flex align-items-center gap-2">
        {delta != null && (
          <span className={`ta-delta ${deltaDir === 'up' ? 'ta-delta-up' : 'ta-delta-down'}`}>
            <i className={`bi ${deltaDir === 'up' ? 'bi-arrow-up-short' : 'bi-arrow-down-short'}`} />{delta}
          </span>
        )}
        {hint && <span className="ta-xs ta-faint">{hint}</span>}
      </div>
    </div>
  );
}

export function Rating({ value, count, size }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="d-inline-flex align-items-center gap-1">
      <span className="ta-stars" style={size ? { fontSize: size } : undefined}>
        {[0, 1, 2, 3, 4].map(i => (
          <i key={i} className={`bi ${i < full ? 'bi-star-fill' : i === full && half ? 'bi-star-half' : 'bi-star'}`} />
        ))}
      </span>
      <span className="ta-xs ta-faint">{value.toFixed(1)}{count != null && ` (${num(count)})`}</span>
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = ORDER_STATUS[status] || { label: status, cls: 'ta-badge-neutral' };
  return <span className={`ta-badge ${s.cls}`}>{s.label}</span>;
}

export function Empty({ icon = 'bi-inbox', title, sub, children }) {
  return (
    <div className="ta-empty">
      <i className={`bi ${icon}`} />
      <div className="fw-semibold" style={{ color: 'var(--ta-ink-soft)' }}>{title}</div>
      {sub && <div className="ta-sm mt-1">{sub}</div>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function ProviderLogo({ code }) {
  return <span className="ta-logo-chip">{code}</span>;
}

/**
 * Lambang lengkung + kipas teratai, mengikuti ornamen puncak fasad
 * Pusat Grosir Blok A Tanah Abang. Statis, tanpa animasi.
 */
export function MarketCrest({ size = 44, color = 'currentColor', opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img"
      aria-label="Lambang Tanah Abang" style={{ opacity, flex: 'none' }}>
      <path d="M8 60V30C8 15 18 5 32 5s24 10 24 25v30" stroke={color} strokeWidth="2.2" />
      <path d="M18 60V32c0-9 6-15 14-15s14 6 14 15v28" stroke={color} strokeWidth="1.3" strokeOpacity=".65" />
      <path d="M32 24l4.5 6.5L32 37l-4.5-6.5z" fill={color} fillOpacity=".85" />
      <path d="M32 41c-5 0-9 3.5-10.5 8h21C41 44.5 37 41 32 41z" fill={color} fillOpacity=".5" />
      <path d="M23 49c0-4 4-7 9-7s9 3 9 7" stroke={color} strokeWidth="1.2" strokeOpacity=".7" />
      <circle cx="32" cy="13" r="2.6" fill={color} />
    </svg>
  );
}

export function Steps({ steps, current }) {
  return (
    <div className="ta-steps">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`ta-step ${i < current ? 'done' : i === current ? 'current' : ''}`}>
            <span className="ta-step-dot">{i < current ? <i className="bi bi-check-lg" /> : i + 1}</span>
            <span className="d-none d-sm-inline">{s}</span>
          </div>
          {i < steps.length - 1 && <span className="ta-step-bar" />}
        </React.Fragment>
      ))}
    </div>
  );
}

export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const list = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) list.push(i);
    else if (list[list.length - 1] !== '…') list.push('…');
  }
  return (
    <nav className="d-flex justify-content-center gap-1 mt-4">
      <button className="btn btn-sm btn-ta-outline" disabled={page === 1} onClick={() => onPage(page - 1)}>
        <i className="bi bi-chevron-left" />
      </button>
      {list.map((n, i) => n === '…'
        ? <span key={`e${i}`} className="px-2 ta-faint align-self-center">…</span>
        : (
          <button key={n} onClick={() => onPage(n)}
            className={`btn btn-sm ${n === page ? 'btn-ta' : 'btn-ta-outline'}`} style={{ minWidth: 34 }}>
            {n}
          </button>
        ))}
      <button className="btn btn-sm btn-ta-outline" disabled={page === pages} onClick={() => onPage(page + 1)}>
        <i className="bi bi-chevron-right" />
      </button>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Charts - hand-rolled static SVG, no animation, no chart library   */
/* ------------------------------------------------------------------ */
export function AreaChart({ series, labels, height = 190, color = '#0b3d2c', fmt = v => v }) {
  const w = 760, h = height, pad = { t: 14, r: 10, b: 24, l: 44 };
  const max = Math.max(...series) * 1.12, min = 0;
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const x = i => pad.l + (iw * i) / (series.length - 1);
  const y = v => pad.t + ih - ((v - min) / (max - min)) * ih;
  const line = series.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(series.length - 1).toFixed(1)},${pad.t + ih} L${pad.l},${pad.t + ih} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => min + (max - min) * f);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="#f0f2f5" strokeWidth="1" />
          <text x={pad.l - 8} y={y(t) + 3.5} textAnchor="end" fontSize="9.5" fill="#868e9c">{fmt(Math.round(t))}</text>
        </g>
      ))}
      <path d={area} fill={color} fillOpacity=".07" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {series.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === series.length - 1 ? 3.6 : 2}
          fill={i === series.length - 1 ? color : '#fff'} stroke={color} strokeWidth="1.4" />
      ))}
      {labels.map((l, i) => (i % 2 === 0 || i === labels.length - 1) && (
        <text key={l} x={x(i)} y={h - 7} textAnchor="middle" fontSize="9.5" fill="#868e9c">{l}</text>
      ))}
    </svg>
  );
}

export function BarChart({ series, labels, height = 180, color = '#0b3d2c', fmt = v => v }) {
  const w = 760, h = height, pad = { t: 14, r: 10, b: 24, l: 40 };
  const max = Math.max(...series) * 1.15;
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const bw = (iw / series.length) * 0.58;
  const ticks = [0, 0.5, 1].map(f => max * f);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={pad.t + ih - (t / max) * ih} y2={pad.t + ih - (t / max) * ih} stroke="#f0f2f5" />
          <text x={pad.l - 7} y={pad.t + ih - (t / max) * ih + 3.5} textAnchor="end" fontSize="9.5" fill="#868e9c">{fmt(Math.round(t))}</text>
        </g>
      ))}
      {series.map((v, i) => {
        const cx = pad.l + (iw / series.length) * (i + 0.5);
        const bh = (v / max) * ih;
        return <rect key={i} x={cx - bw / 2} y={pad.t + ih - bh} width={bw} height={bh} rx="2.5"
          fill={color} fillOpacity={i === series.length - 1 ? 1 : 0.72} />;
      })}
      {labels.map((l, i) => (i % 2 === 0 || i === labels.length - 1) && (
        <text key={l} x={pad.l + (iw / series.length) * (i + 0.5)} y={h - 7} textAnchor="middle" fontSize="9.5" fill="#868e9c">{l}</text>
      ))}
    </svg>
  );
}

export function Donut({ data, size = 168, thickness = 22, center }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="d-flex align-items-center gap-4 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f2f5" strokeWidth={thickness} />
          {data.map(d => {
            const len = (d.value / total) * c;
            const el = (
              <circle key={d.name} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color}
                strokeWidth={thickness} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} />
            );
            acc += len;
            return el;
          })}
        </g>
        {center && (
          <>
            <text x="50%" y="47%" textAnchor="middle" fontSize="19" fontWeight="650" fill="#14161a">{center.value}</text>
            <text x="50%" y="60%" textAnchor="middle" fontSize="10" fill="#868e9c">{center.label}</text>
          </>
        )}
      </svg>
      <div className="flex-grow-1" style={{ minWidth: 150 }}>
        {data.map(d => (
          <div key={d.name} className="d-flex align-items-center gap-2 py-1">
            <span className="ta-dot" style={{ background: d.color }} />
            <span className="ta-sm flex-grow-1">{d.name}</span>
            <span className="ta-sm fw-semibold ta-num">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarRow({ label, value, max, right }) {
  return (
    <div className="ta-barrow py-2">
      <span style={{ width: 150 }} className="text-truncate">{label}</span>
      <span className="ta-barrow-track"><span className="ta-barrow-fill" style={{ width: `${(value / max) * 100}%` }} /></span>
      <span className="ta-num fw-semibold" style={{ width: 72, textAlign: 'right' }}>{right ?? num(value)}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toasts                                                            */
/* ------------------------------------------------------------------ */
export function Toasts() {
  const { state, dispatch } = useStore();
  const timers = useRef({});
  useEffect(() => {
    state.toasts.forEach(t => {
      if (timers.current[t.id]) return;
      timers.current[t.id] = setTimeout(() => {
        dispatch({ type: 'toast:pop', id: t.id });
        delete timers.current[t.id];
      }, 3200);
    });
  }, [state.toasts, dispatch]);

  if (!state.toasts.length) return null;
  const icon = { ok: 'bi-check-circle-fill', warn: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill', danger: 'bi-x-circle-fill' };
  const colour = { ok: 'var(--ta-ok)', warn: 'var(--ta-warn)', info: 'var(--ta-info)', danger: 'var(--ta-danger)' };
  return (
    <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 2000, width: 320, display: 'grid', gap: 8 }}>
      {state.toasts.map(t => (
        <div key={t.id} className="ta-card d-flex align-items-start gap-2 p-3" style={{ boxShadow: '0 6px 24px rgba(20,22,26,.12)' }}>
          <i className={`bi ${icon[t.tone] || icon.ok}`} style={{ color: colour[t.tone] || colour.ok }} />
          <div className="ta-sm flex-grow-1">{t.text}</div>
          <button className="btn-close btn-close-sm" style={{ fontSize: '.6rem' }}
            onClick={() => dispatch({ type: 'toast:pop', id: t.id })} aria-label="Dismiss" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal (controlled, Bootstrap markup without the JS plugin)        */
/* ------------------------------------------------------------------ */
export function Modal({ open, onClose, title, children, footer, size = '' }) {
  useEffect(() => {
    $('body').css('overflow', open ? 'hidden' : '');
    return () => $('body').css('overflow', '');
  }, [open]);
  if (!open) return null;
  return (
    <>
      <div className="modal-backdrop show" style={{ zIndex: 1055 }} onClick={onClose} />
      <div className="modal d-block" style={{ zIndex: 1060 }} role="dialog" aria-modal="true">
        <div className={`modal-dialog ${size} modal-dialog-centered`}>
          <div className="modal-content" style={{ border: '1px solid var(--ta-line)', borderRadius: 'var(--ta-radius)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--ta-line-soft)', padding: '.9rem 1.15rem' }}>
              <h6 className="modal-title mb-0" style={{ fontSize: '.95rem', fontWeight: 650 }}>{title}</h6>
              <button className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body" style={{ padding: '1.15rem' }}>{children}</div>
            {footer && <div className="modal-footer" style={{ borderTop: '1px solid var(--ta-line-soft)', padding: '.8rem 1.15rem' }}>{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Fake QR block (for drop-off labels)                               */
/* ------------------------------------------------------------------ */
export function FakeQR({ seed = 'TA' }) {
  const cells = [];
  let h = 7;
  for (let i = 0; i < String(seed).length; i++) h = (h * 33 + String(seed).charCodeAt(i)) % 65521;
  for (let i = 0; i < 64; i++) {
    const corner = (i % 8 < 3 && i < 24) || (i % 8 > 4 && i < 24) || (i % 8 < 3 && i >= 40);
    const on = corner ? (i % 8 === 1 || Math.floor(i / 8) % 2 === 0) : ((h >> (i % 15)) + i * 7) % 3 !== 0;
    cells.push(on);
  }
  return <div className="ta-qr">{cells.map((on, i) => <i key={i} className={on ? '' : 'off'} />)}</div>;
}

/* ------------------------------------------------------------------ */
/*  Quantity stepper                                                  */
/* ------------------------------------------------------------------ */
export function QtyStepper({ value, onChange, min = 1, max = 99999, step = 1 }) {
  return (
    <div className="input-group" style={{ width: 128 }}>
      <button className="btn btn-ta-outline btn-sm" onClick={() => onChange(Math.max(min, value - step))} aria-label="Decrease">
        <i className="bi bi-dash" />
      </button>
      <input className="form-control form-control-sm text-center ta-num" value={value}
        onChange={e => {
          const v = parseInt(e.target.value.replace(/\D/g, ''), 10);
          onChange(Number.isNaN(v) ? min : Math.min(max, Math.max(min, v)));
        }} />
      <button className="btn btn-ta-outline btn-sm" onClick={() => onChange(Math.min(max, value + step))} aria-label="Increase">
        <i className="bi bi-plus" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small inline confirm used across dashboards                       */
/* ------------------------------------------------------------------ */
export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = 'Delete', danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={(
        <>
          <button className="btn btn-ta-outline btn-sm" onClick={onClose}>Cancel</button>
          <button className={`btn btn-sm ${danger ? 'btn-ta-danger' : 'btn-ta'}`} onClick={onConfirm}>{confirmLabel}</button>
        </>
      )}>
      <div className="ta-sm ta-muted">{body}</div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Search field with jQuery-driven suggestion dropdown               */
/* ------------------------------------------------------------------ */
export function useClickOutside(ref, onOut) {
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onOut(); };
    $(document).on('mousedown', handler);
    return () => $(document).off('mousedown', handler);
  }, [ref, onOut]);
}

export function Collapse({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="ta-filter-group">
      <button className="btn btn-ta-ghost w-100 d-flex justify-content-between align-items-center p-0 ta-filter-title mb-0"
        onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'} ta-faint`} style={{ fontSize: '.75rem' }} />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

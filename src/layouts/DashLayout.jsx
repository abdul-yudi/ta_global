import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../data/store';
import { Toasts } from '../components/ui';

const SELLER_NAV = [
  {
    label: 'Ringkasan', items: [
      { to: '/seller', icon: 'bi-speedometer2', text: 'Dasbor', end: true },
      { to: '/seller/analytics', icon: 'bi-graph-up-arrow', text: 'Analitik' },
    ],
  },
  {
    label: 'Katalog', items: [
      { to: '/seller/products', icon: 'bi-box', text: 'Produk' },
      { to: '/seller/products/new', icon: 'bi-plus-square', text: 'Unggah produk' },
    ],
  },
  {
    label: 'Pengiriman', items: [
      { to: '/seller/orders', icon: 'bi-receipt', text: 'Pesanan', badge: 'newOrders' },
      { to: '/seller/dropoff', icon: 'bi-shop-window', text: 'Antar ke gerai' },
      { to: '/seller/shipping', icon: 'bi-truck', text: 'Pengaturan kirim' },
    ],
  },
  {
    label: 'Relasi', items: [
      { to: '/seller/messages', icon: 'bi-chat-dots', text: 'Pesan', badge: 'unread' },
      { to: '/seller/settings', icon: 'bi-gear', text: 'Pengaturan toko' },
    ],
  },
];

const ADMIN_NAV = [
  {
    label: 'Ringkasan', items: [
      { to: '/admin', icon: 'bi-speedometer2', text: 'Dasbor', end: true },
    ],
  },
  {
    label: 'Marketplace', items: [
      { to: '/admin/sellers', icon: 'bi-shop', text: 'Penjual' },
      { to: '/admin/products', icon: 'bi-box-seam', text: 'Produk' },
      { to: '/admin/orders', icon: 'bi-receipt-cutoff', text: 'Pesanan' },
    ],
  },
  {
    label: 'Logistik', items: [
      { to: '/admin/providers', icon: 'bi-truck', text: 'Jasa pengiriman' },
      { to: '/admin/integrations', icon: 'bi-plug', text: 'Integrasi API' },
      { to: '/admin/hubs', icon: 'bi-shop-window', text: 'Gerai & hub' },
    ],
  },
  {
    label: 'Komunikasi', items: [
      { to: '/admin/messages', icon: 'bi-chat-square-text', text: 'Pesan' },
      { to: '/admin/broadcast', icon: 'bi-megaphone', text: 'Siaran' },
    ],
  },
];

export default function DashLayout({ variant }) {
  const { state, seller, isAdmin, hasStore, dispatch, toast } = useStore();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const goTo = useNavigate();
  const isSeller = variant === 'seller';
  const nav = isSeller ? SELLER_NAV : ADMIN_NAV;
  const me = seller(state.sellerId);

  const counts = {
    newOrders: state.orders.filter(o => o.sellerId === state.sellerId && o.status === 'awaiting_acceptance').length,
    unread: state.threads.reduce((a, t) => a + (t.unread || 0), 0),
  };

  return (
    <div className="ta-shell">
      <aside className={`ta-side ${open ? 'open' : ''}`}>
        <div className="ta-side-brand d-flex align-items-center justify-content-between">
          <Link to="/" className="ta-logo" style={{ fontSize: '1.1rem' }}>TA<span>Global</span></Link>
          <span className={`ta-badge ${isSeller ? 'ta-badge-accent' : 'ta-badge-info'}`}>
            {isSeller ? 'Penjual' : 'Admin'}
          </span>
        </div>

        <div className="ta-side-scroll">
          {nav.map(group => (
            <div key={group.label}>
              <div className="ta-side-label">{group.label}</div>
              {group.items.map(it => (
                <NavLink key={it.to} to={it.to} end={it.end}
                  className={({ isActive }) => `ta-side-link ${isActive ? 'active' : ''}`}
                  onClick={() => setOpen(false)}>
                  <i className={`bi ${it.icon}`} />
                  <span>{it.text}</span>
                  {it.badge && counts[it.badge] > 0 && <span className="ta-pill-count">{counts[it.badge]}</span>}
                </NavLink>
              ))}
            </div>
          ))}
          <div className="ta-side-label">Ganti tampilan</div>
          {isSeller && isAdmin && (
            <Link to="/admin" className="ta-side-link">
              <i className="bi bi-arrow-left-right" />
              <span>Konsol admin</span>
            </Link>
          )}
          {!isSeller && hasStore && (
            <Link to="/seller" className="ta-side-link">
              <i className="bi bi-shop" />
              <span>Toko Saya</span>
            </Link>
          )}
          <Link to="/" className="ta-side-link">
            <i className="bi bi-bag" />
            <span>Etalase pembeli</span>
          </Link>
        </div>

        <div className="ta-side-foot d-flex align-items-center gap-2">
          <span className="ta-avatar">{isSeller ? (me?.name || 'S').slice(0, 2).toUpperCase() : 'AD'}</span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="ta-sm fw-semibold text-truncate">
              {isSeller ? me?.name : (state.account?.name || 'Super Admin')}
            </div>
            <div className="ta-xs ta-faint text-truncate">
              {isSeller ? me?.block : (state.account?.email || 'ops@taglobal.id')}
            </div>
          </div>
          <button className="btn btn-ta-ghost btn-sm px-2" title="Keluar"
            onClick={() => {
              dispatch({ type: 'auth:logout' });
              toast('Anda telah keluar', 'info');
              goTo(isSeller ? '/' : '/superadmin');
            }}>
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </aside>

      {open && (
        <div onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,26,.35)', zIndex: 1040 }} />
      )}

      <div className="ta-main">
        <div className="ta-topstrip">
          <button className="btn btn-ta-outline btn-sm d-lg-none" onClick={() => setOpen(true)} aria-label="Buka menu">
            <i className="bi bi-list" />
          </button>
          <div className="ta-sm ta-faint text-truncate flex-grow-1">
            <i className="bi bi-house-door me-1" />
            {isSeller ? 'Toko Saya' : 'Super Admin'}
            <i className="bi bi-chevron-right mx-1" style={{ fontSize: '.65rem' }} />
            <span className="ta-muted">{loc.pathname.replace(/^\/(seller|admin)\/?/, '') || 'dasbor'}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link to={isSeller ? '/seller/messages' : '/admin/messages'} className="btn btn-ta-outline btn-sm position-relative">
              <i className="bi bi-bell" />
              {counts.unread > 0 && <span className="ta-cart-dot" style={{ top: -6, right: -6 }}>{counts.unread}</span>}
            </Link>
            {isSeller
              ? <Link to="/seller/products/new" className="btn btn-ta btn-sm"><i className="bi bi-plus-lg me-1" />Produk baru</Link>
              : <Link to="/admin/broadcast" className="btn btn-ta btn-sm"><i className="bi bi-megaphone me-1" />Siaran</Link>}
          </div>
        </div>

        <div className="ta-content">
          <Outlet />
        </div>
      </div>

      <Toasts />
    </div>
  );
}

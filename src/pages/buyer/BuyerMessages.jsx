import React from 'react';
import { Link } from 'react-router-dom';
import Chat from '../../components/Chat';

export default function BuyerMessages() {
  return (
    <main className="container py-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h1 style={{ fontSize: '1.375rem', margin: 0 }}>Pesan</h1>
          <div className="ta-sm ta-faint">Hubungi kios tempat Anda belanja, atau customer service TAGlobal</div>
        </div>
        <div className="d-flex gap-2">
          <Link to="/orders" className="btn btn-ta-outline btn-sm"><i className="bi bi-box-seam me-1" />Pesanan saya</Link>
          <Link to="/help" className="btn btn-ta btn-sm"><i className="bi bi-headset me-1" />Buat tiket CS</Link>
        </div>
      </div>
      <Chat role="buyer" filter={t => t.party.startsWith('buyer:')} />
    </main>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { PageHead } from '../../components/ui';
import Chat from '../../components/Chat';

export default function SellerMessages() {
  return (
    <>
      <PageHead eyebrow="Relasi" title="Pesan"
        sub="Pertanyaan pembeli dan pemberitahuan dari admin TAGlobal — median balasan pertama 14 menit">
        <Link to="/seller/orders" className="btn btn-ta-outline"><i className="bi bi-receipt me-1" />Pesanan</Link>
      </PageHead>
      <Chat role="seller" filter={t => t.party.startsWith('seller:')} />
    </>
  );
}

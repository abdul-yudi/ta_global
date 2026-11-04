import React from 'react';
import { Link } from 'react-router-dom';
import { useStore, usd, num } from '../data/store';
import { Rating } from './ui';

export default function ProductCard({ product, compact = false }) {
  const { seller, state, dispatch, toast } = useStore();
  const s = seller(product.sellerId);
  const saved = state.wishlist.includes(product.id);
  const off = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <div className="ta-prod">
      <Link to={`/product/${product.id}`} className="ta-prod-img">
        <img src={product.images[0]} alt={product.title} loading="lazy" />
        {off > 0 && <span className="ta-ribbon">-{off}%</span>}
        {!off && product.tags?.[0] && <span className="ta-ribbon-alt">{product.tags[0]}</span>}
        <button
          className="btn btn-sm"
          style={{
            position: 'absolute', top: 6, right: 6, width: 30, height: 30, padding: 0,
            borderRadius: 999, background: '#fff', border: '1px solid var(--ta-line)',
            color: saved ? 'var(--ta-danger)' : 'var(--ta-ink-faint)',
          }}
          onClick={e => {
            e.preventDefault();
            dispatch({ type: 'wishlist:toggle', productId: product.id });
            toast(saved ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist', 'info');
          }}
          aria-label="Simpan ke wishlist"
        >
          <i className={`bi ${saved ? 'bi-heart-fill' : 'bi-heart'}`} style={{ fontSize: '.8rem' }} />
        </button>
      </Link>
      <div className="ta-prod-body">
        <div className="d-flex align-items-baseline gap-2">
          <span className="ta-price">{usd(product.price)}</span>
          {product.oldPrice && <span className="ta-price-old">{usd(product.oldPrice)}</span>}
        </div>
        <Link to={`/product/${product.id}`} className="ta-prod-title">{product.title}</Link>
        {!compact && (
          <>
            <div className="d-flex align-items-center gap-2">
              <Rating value={product.rating} />
              <span className="ta-xs ta-faint">· {num(product.sold)} terjual</span>
            </div>
            <div className="ta-xs ta-faint d-flex align-items-center gap-1 mt-auto pt-1">
              <i className="bi bi-shop" />
              <span className="text-truncate">{s?.name}</span>
            </div>
            <div className="ta-xs ta-muted">MOQ {product.moq} pcs · kirim ke seluruh dunia</div>
          </>
        )}
      </div>
    </div>
  );
}

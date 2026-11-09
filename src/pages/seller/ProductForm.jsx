import React, { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useStore, usd } from '../../data/store';
import { CATEGORIES, placeholder } from '../../data/mock';
import { PageHead, Card, ProviderLogo } from '../../components/ui';

const emptyProduct = {
  title: '', category: CATEGORIES[0].name, sub: CATEGORIES[0].sub[0], sku: '',
  price: '', oldPrice: '', moq: 12, stock: '', weight: '', status: 'active',
  desc: '', hs: '6204.42.00', origin: 'Tanah Abang, Jakarta - Indonesia',
  material: '', dims: { l: '', w: '', h: '' },
  variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL'] }, { name: 'Color', options: ['Black', 'Cream'] }],
  tiers: [{ from: 12, price: '' }, { from: 60, price: '' }, { from: 240, price: '' }],
  tags: [],
};

export default function ProductForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const { state, product, dispatch, toast } = useStore();
  const editing = Boolean(id);
  const existing = id ? product(id) : null;

  const [f, setF] = useState(() => {
    if (!existing) return emptyProduct;
    return {
      ...emptyProduct,
      title: existing.title, category: existing.category, sub: existing.sub, sku: existing.sku,
      price: existing.price, oldPrice: existing.oldPrice || '', moq: existing.moq,
      stock: existing.stock, weight: existing.weight, status: existing.status,
      desc: existing.desc, material: existing.specs?.[0]?.[1] || '',
      variants: existing.variants, tags: existing.tags || [],
      tiers: [
        { from: existing.moq, price: existing.price },
        { from: existing.moq * 5, price: +(existing.price * 0.94).toFixed(2) },
        { from: existing.moq * 20, price: +(existing.price * 0.88).toFixed(2) },
      ],
    };
  });
  const [images, setImages] = useState(existing ? existing.images : []);
  const [carriers, setCarriers] = useState(state.sellerShipping);
  const [newTag, setNewTag] = useState('');

  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const subs = useMemo(() => CATEGORIES.find(c => c.name === f.category)?.sub || [], [f.category]);

  const completion = useMemo(() => {
    const checks = [f.title.length > 10, !!f.price, images.length >= 2, f.desc.length > 40, !!f.stock, !!f.weight];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [f, images]);

  const addMockImage = () => {
    setImages(im => [...im, placeholder(f.title + im.length + Math.random(), f.title || 'TA')]);
    toast('Foto ditambahkan ke galeri', 'info');
  };

  const save = async status => {
    if (!f.title || !f.price) { toast('Nama produk dan harga wajib diisi', 'warn'); return; }
    const payload = {
      id: existing?.id || 'pr' + Math.floor(Math.random() * 9000 + 1000),
      sellerId: state.sellerId,
      title: f.title, category: f.category, sub: f.sub,
      price: +f.price, oldPrice: f.oldPrice ? +f.oldPrice : null,
      moq: +f.moq, stock: +f.stock || 0, weight: +f.weight || 0.2,
      sold: existing?.sold || 0, rating: existing?.rating || 0, reviews: existing?.reviews || 0,
      status, tags: f.tags, desc: f.desc,
      sku: f.sku || 'TA-' + (existing?.id || 'NEW').toUpperCase(),
      images: images.length ? images : [placeholder(f.title, f.title)],
      variants: f.variants,
      specs: [
        ['Material', f.material || 'Premium cotton blend'],
        ['Origin', f.origin],
        ['Minimum order', `${f.moq} piece(s)`],
        ['Unit weight', `${f.weight || 0.2} kg`],
        ['Packaging', 'Poly bag + export carton'],
        ['Customs code', f.hs],
      ],
    };
    await dispatch({ type: editing ? 'product:update' : 'product:create', product: payload });
    toast(editing ? 'Produk diperbarui' : status === 'draft' ? 'Disimpan sebagai draf' : 'Produk tayang di etalase');
    nav('/seller/products');
  };

  return (
    <>
      <PageHead eyebrow={editing ? 'Katalog Â· ubah' : 'Katalog Â· produk baru'}
        title={editing ? 'Ubah produk' : 'Unggah produk'}
        sub="Semua yang dibutuhkan pembeli di luar negeri â€” foto, harga grosir, berat dan data bea cukai.">
        <Link to="/seller/products" className="btn btn-ta-outline">Batal</Link>
        <button className="btn btn-ta-outline" onClick={() => save('draft')}>Simpan draf</button>
        <button className="btn btn-ta" onClick={() => save('active')}>
          <i className="bi bi-upload me-1" />{editing ? 'Simpan perubahan' : 'Tayangkan produk'}
        </button>
      </PageHead>

      <div className="row g-3">
        <div className="col-xl-8 d-grid gap-3">
          {/* ---------- basics ---------- */}
          <Card title="1 Â· Informasi dasar">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Nama produk</label>
                <input className="form-control" value={f.title} maxLength={140}
                  placeholder="mis. Premium Voal Pashmina Hijab â€” Soft Finish, 20 Pilihan Warna"
                  onChange={e => set('title', e.target.value)} />
                <div className="form-text d-flex justify-content-between">
                  <span>Tulis bahan dulu, lalu modelnya, lalu jumlah pilihan warnanya.</span>
                  <span>{f.title.length}/140</span>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Kategori</label>
                <select className="form-select" value={f.category}
                  onChange={e => { set('category', e.target.value); set('sub', CATEGORIES.find(c => c.name === e.target.value).sub[0]); }}>
                  {CATEGORIES.map(c => <option key={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Sub-kategori</label>
                <select className="form-select" value={f.sub} onChange={e => set('sub', e.target.value)}>
                  {subs.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">SKU Anda <span className="ta-faint fw-normal">(opsional)</span></label>
                <input className="form-control" value={f.sku} placeholder="TA-PASHMINA-01" onChange={e => set('sku', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Bahan utama</label>
                <input className="form-control" value={f.material} placeholder="Voal katun 100%" onChange={e => set('material', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label">Deskripsi</label>
                <textarea className="form-control" rows="6" value={f.desc}
                  placeholder="Jelaskan bahan, jahitan, cara cuci, ketahanan warna dan isi satu kartonâ€¦"
                  onChange={e => set('desc', e.target.value)} />
                <div className="form-text">Pembeli di luar negeri tidak bisa memegang kainnya â€” sebutkan gramasi, kelenturan dan ketebalan.</div>
              </div>
              <div className="col-12">
                <label className="form-label">Label unggulan</label>
                <div className="d-flex gap-2 flex-wrap mb-2">
                  {f.tags.map(t => (
                    <span key={t} className="ta-chip active">
                      {t}
                      <button className="btn btn-ta-ghost p-0 ms-1" style={{ lineHeight: 1 }}
                        onClick={() => set('tags', f.tags.filter(x => x !== t))} aria-label={`Hapus ${t}`}>
                        <i className="bi bi-x" />
                      </button>
                    </span>
                  ))}
                  {!f.tags.length && <span className="ta-xs ta-faint">Belum ada label</span>}
                </div>
                <div className="input-group" style={{ maxWidth: 340 }}>
                  <input className="form-control form-control-sm" placeholder="Ready Stock, Best Seller, Grosirâ€¦"
                    value={newTag} onChange={e => setNewTag(e.target.value)} />
                  <button className="btn btn-ta-outline btn-sm" onClick={() => { if (newTag.trim()) { set('tags', [...f.tags, newTag.trim()]); setNewTag(''); } }}>
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* ---------- media ---------- */}
          <Card title="2 Â· Foto & media" action={<span className="ta-xs ta-faint">{images.length}/8 foto</span>}>
            <div className="ta-dropzone mb-3" onClick={addMockImage} role="button">
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: '1.6rem' }} />
              <div className="fw-semibold mt-2">Tarik foto ke sini atau klik untuk menambah</div>
              <div className="ta-xs ta-faint">JPG atau PNG, rasio 1:1, minimal 800Ã—800 px, latar putih atau netral</div>
            </div>
            <div className="row g-2">
              {images.map((src, i) => (
                <div className="col-4 col-md-3" key={i}>
                  <div style={{ position: 'relative' }}>
                    <img src={src} alt="" className="w-100"
                      style={{ aspectRatio: '1/1', objectFit: 'cover', borderRadius: 'var(--ta-radius-sm)', border: '1px solid var(--ta-line)' }} />
                    {i === 0 && <span className="ta-ribbon-alt">Utama</span>}
                    <button className="btn btn-sm"
                      style={{ position: 'absolute', top: 4, right: 4, background: '#fff', border: '1px solid var(--ta-line)', borderRadius: 999, width: 26, height: 26, padding: 0 }}
                      onClick={() => setImages(im => im.filter((_, k) => k !== i))} aria-label="Hapus foto">
                      <i className="bi bi-x" style={{ fontSize: '.75rem' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <hr className="ta-sep my-3" />
            <label className="form-label">URL video produk <span className="ta-faint fw-normal">(opsional)</span></label>
            <input className="form-control" placeholder="https://â€¦" />
            <div className="form-text">Klip 15 detik yang memperlihatkan jatuhnya kain terbukti menaikkan konversi tekstil.</div>
          </Card>

          {/* ---------- pricing ---------- */}
          <Card title="3 Â· Harga & stok">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Harga satuan (USD)</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input className="form-control ta-num" value={f.price} inputMode="decimal"
                    onChange={e => set('price', e.target.value.replace(/[^\d.]/g, ''))} />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Harga coret <span className="ta-faint fw-normal">(opsional)</span></label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input className="form-control ta-num" value={f.oldPrice} inputMode="decimal"
                    onChange={e => set('oldPrice', e.target.value.replace(/[^\d.]/g, ''))} />
                </div>
                <div className="form-text">Tampil sebagai harga dicoret dengan label diskon.</div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Minimum order (MOQ)</label>
                <input className="form-control ta-num" value={f.moq} inputMode="numeric"
                  onChange={e => set('moq', e.target.value.replace(/\D/g, ''))} />
              </div>

              <div className="col-12">
                <label className="form-label">Tingkatan harga grosir</label>
                <div className="ta-table-wrap ta-flat">
                  <table className="ta-table">
                    <thead><tr><th>Mulai dari jumlah</th><th>Harga satuan</th><th>Diskon</th><th /></tr></thead>
                    <tbody>
                      {f.tiers.map((t, i) => (
                        <tr key={i}>
                          <td style={{ width: 170 }}>
                            <input className="form-control form-control-sm ta-num" value={t.from}
                              onChange={e => {
                                const v = e.target.value.replace(/\D/g, '');
                                set('tiers', f.tiers.map((x, k) => (k === i ? { ...x, from: v } : x)));
                              }} />
                          </td>
                          <td style={{ width: 170 }}>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text">$</span>
                              <input className="form-control ta-num" value={t.price}
                                onChange={e => {
                                  const v = e.target.value.replace(/[^\d.]/g, '');
                                  set('tiers', f.tiers.map((x, k) => (k === i ? { ...x, price: v } : x)));
                                }} />
                            </div>
                          </td>
                          <td className="ta-sm ta-faint">
                            {f.price && t.price ? `${Math.max(0, Math.round((1 - t.price / f.price) * 100))}% dari harga normal` : 'â€”'}
                          </td>
                          <td className="text-end">
                            <button className="btn btn-ta-ghost btn-sm" onClick={() => set('tiers', f.tiers.filter((_, k) => k !== i))}>
                              <i className="bi bi-trash" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-ta-outline btn-sm mt-2" onClick={() => set('tiers', [...f.tiers, { from: '', price: '' }])}>
                  <i className="bi bi-plus-lg me-1" />Tambah tingkatan
                </button>
              </div>

              <div className="col-md-6">
                <label className="form-label">Stok tersedia (pcs)</label>
                <input className="form-control ta-num" value={f.stock} inputMode="numeric"
                  onChange={e => set('stock', e.target.value.replace(/\D/g, ''))} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Status produk</label>
                <select className="form-select" value={f.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Tayang di etalase</option>
                  <option value="draft">Draf (disembunyikan)</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">Varian</label>
                {f.variants.map((v, i) => (
                  <div className="row g-2 mb-2" key={i}>
                    <div className="col-md-3">
                      <input className="form-control form-control-sm" value={v.name} placeholder="Nama varian"
                        onChange={e => set('variants', f.variants.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} />
                    </div>
                    <div className="col-md-8">
                      <input className="form-control form-control-sm" value={v.options.join(', ')} placeholder="Pilihan dipisah koma"
                        onChange={e => set('variants', f.variants.map((x, k) => (k === i ? { ...x, options: e.target.value.split(',').map(s => s.trim()) } : x)))} />
                    </div>
                    <div className="col-md-1">
                      <button className="btn btn-ta-ghost btn-sm" onClick={() => set('variants', f.variants.filter((_, k) => k !== i))}>
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                ))}
                <button className="btn btn-ta-outline btn-sm" onClick={() => set('variants', [...f.variants, { name: '', options: [] }])}>
                  <i className="bi bi-plus-lg me-1" />Tambah jenis varian
                </button>
                <div className="form-text">
                  {f.variants.reduce((a, v) => a * Math.max(1, v.options.filter(Boolean).length), 1)} kombinasi varian akan dibuat.
                </div>
              </div>
            </div>
          </Card>

          {/* ---------- logistics ---------- */}
          <Card title="4 Â· Pengiriman & bea cukai">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Berat satuan (kg)</label>
                <input className="form-control ta-num" value={f.weight} inputMode="decimal"
                  onChange={e => set('weight', e.target.value.replace(/[^\d.]/g, ''))} />
              </div>
              <div className="col-md-9">
                <label className="form-label">Dimensi setelah dikemas (cm)</label>
                <div className="row g-2">
                  {[['l', 'P'], ['w', 'L'], ['h', 'T']].map(([k, lbl]) => (
                    <div className="col-4" key={k}>
                      <div className="input-group">
                        <span className="input-group-text">{lbl}</span>
                        <input className="form-control ta-num" value={f.dims[k]}
                          onChange={e => set('dims', { ...f.dims, [k]: e.target.value.replace(/\D/g, '') })} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Kode HS / bea cukai</label>
                <input className="form-control ta-mono" value={f.hs} onChange={e => set('hs', e.target.value)} />
                <div className="form-text">Dipakai pada invoice komersial setiap ekspor.</div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Negara asal barang</label>
                <input className="form-control" value={f.origin} onChange={e => set('origin', e.target.value)} />
              </div>

              <div className="col-12">
                <label className="form-label">Jasa kirim untuk produk ini</label>
                <div className="ta-flat px-3">
                  {state.providers.filter(p => p.active).map(p => (
                    <div className="ta-toggle-row" key={p.id}>
                      <div className="d-flex align-items-center gap-2">
                        <ProviderLogo code={p.logo} />
                        <div>
                          <div className="ta-sm fw-semibold">{p.name}</div>
                          <div className="ta-xs ta-faint">
                            {p.service} Â· {p.etaMin}-{p.etaMax} hari Â· mulai {usd(p.baseRate)}
                          </div>
                        </div>
                      </div>
                      <div className="form-check form-switch mb-0">
                        <input className="form-check-input" type="checkbox" checked={!!carriers[p.id]}
                          onChange={e => setCarriers(c => ({ ...c, [p.id]: e.target.checked }))} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="form-text">
                  Hanya jasa kirim yang diaktifkan super admin yang muncul di sini.
                  Pengaturan bawaan diambil dari <Link to="/seller/shipping">pengaturan kirim Anda</Link>.
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ---------- side rail ---------- */}
        <div className="col-xl-4">
          <div className="ta-sticky-side d-grid gap-3">
            <Card title="Kelengkapan produk">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="ta-display" style={{ fontSize: '1.6rem' }}>{completion}%</div>
                <div className="flex-grow-1">
                  <div className="ta-barrow-track"><span className="ta-barrow-fill" style={{ width: `${completion}%` }} /></div>
                  <div className="ta-xs ta-faint mt-1">lengkap</div>
                </div>
              </div>
              {[
                ['Nama produk jelas (min. 10 karakter)', f.title.length > 10],
                ['Minimal 2 foto', images.length >= 2],
                ['Harga satuan diisi', !!f.price],
                ['Deskripsi lebih dari 40 karakter', f.desc.length > 40],
                ['Jumlah stok diisi', !!f.stock],
                ['Berat satuan diisi', !!f.weight],
              ].map(([l, ok]) => (
                <div key={l} className="d-flex align-items-center gap-2 py-1 ta-sm">
                  <i className={`bi ${ok ? 'bi-check-circle-fill' : 'bi-circle'}`}
                    style={{ color: ok ? 'var(--ta-ok)' : 'var(--ta-ink-faint)' }} />
                  <span className={ok ? '' : 'ta-faint'}>{l}</span>
                </div>
              ))}
            </Card>

            <Card title="Pratinjau di etalase">
              <div className="ta-prod" style={{ maxWidth: 230 }}>
                <div className="ta-prod-img">
                  <img src={images[0] || placeholder('empty', 'TA')} alt="" />
                  {f.oldPrice && f.price && (
                    <span className="ta-ribbon">-{Math.max(0, Math.round((1 - f.price / f.oldPrice) * 100))}%</span>
                  )}
                </div>
                <div className="ta-prod-body">
                  <div className="d-flex align-items-baseline gap-2">
                    <span className="ta-price">{f.price ? usd(+f.price) : '$0.00'}</span>
                    {f.oldPrice && <span className="ta-price-old">{usd(+f.oldPrice)}</span>}
                  </div>
                  <div className="ta-prod-title">{f.title || 'Nama produk Anda muncul di sini'}</div>
                  <div className="ta-xs ta-faint">MOQ {f.moq || 1} pcs Â· kirim ke seluruh dunia</div>
                </div>
              </div>
            </Card>

            <Card title="Ceklist ekspor">
              {[
                ['Kode HS diisi', !!f.hs],
                ['Berat untuk hitung ongkir', !!f.weight],
                ['Minimal satu jasa kirim aktif', Object.values(carriers).some(Boolean)],
                ['Negara asal diisi', !!f.origin],
              ].map(([l, ok]) => (
                <div key={l} className="d-flex align-items-center gap-2 py-1 ta-sm">
                  <i className={`bi ${ok ? 'bi-check-circle-fill' : 'bi-exclamation-circle'}`}
                    style={{ color: ok ? 'var(--ta-ok)' : 'var(--ta-warn)' }} />
                  <span>{l}</span>
                </div>
              ))}
              <hr className="ta-sep my-3" />
              <div className="ta-xs ta-muted">
                Produk langsung tayang. Tim admin melakukan pemeriksaan acak dan dapat mengembalikan
                produk ke status ditinjau bila foto atau klaimnya menyesatkan.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}




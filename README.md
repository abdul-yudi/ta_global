# TAGlobal — Marketplace Tanah Abang (prototipe frontend)

Marketplace ekspor untuk pedagang Tanah Abang: penjual memasang stoknya, pembeli dari mana pun
memesan dan membayar dengan kartu, lalu paket diantar ke loket *gerai* TAGlobal di dalam pasar
untuk dikonsolidasi dan dikirim ke luar negeri.

Repositori ini **baru alur frontend** — semua layar berjalan di atas data tiruan yang disimpan
di state React. Belum ada backend, basis data, pembayaran, maupun panggilan API kurir sungguhan.

## Teknologi

- React 18 + React Router 6 (server pengembangan / build Vite)
- Bootstrap 5 + Bootstrap Icons, dengan lapisan tema sendiri di `src/styles/theme.css`
- jQuery 3 — saran pencarian, auto-scroll chat, filter tabel langsung, tooltip, kunci scroll modal
- Grafik digambar sendiri dengan SVG inline (tanpa pustaka grafik, tanpa animasi di mana pun)

## Tampilan

Palet dan motifnya mengambil dari fasad Pusat Grosir Blok A Tanah Abang: hijau giok, krem
mentega, dan trim emas. Motifnya ada di `src/styles/theme.css` bagian "Motif Blok A":

- `.ta-lattice` — tekstur belah ketupat seperti panel hijau di dinding gedung
- `.ta-archband` — deret lengkung runcing meniru barisan jendela
- `.ta-arch-top` — bingkai foto berujung lengkung untuk ubin kategori
- `.ta-rule`, `.ta-sec-title`, `.ta-cream-panel`, `.ta-crest` — garis emas, judul bagian, panel krem, lencana kios
- `<MarketCrest />` di `src/components/ui.jsx` — ornamen puncak fasad sebagai SVG

## Menjalankan

```bash
npm install
```

```bash
npm run dev
```

Buka `http://localhost:5173`. `npm run build` menghasilkan bundel statis di `dist/`.

## Akun demo

Seluruh antarmuka memakai Bahasa Indonesia. Satu akun dipakai untuk belanja **dan** berjualan.

| Peran | Halaman masuk | Username | Kata sandi |
| --- | --- | --- | --- |
| Pembeli / penjual | popup "Masuk / Daftar" di etalase, atau `/login` | `tokoani` | `password123` |
| Super admin | `/superadmin` | `admin` | `password123` |

Kredensial ini juga ditampilkan sebagai hint di bawah setiap formulir, lengkap dengan tombol
"Isi otomatis". Daftarkan di `src/data/mock.js` → `ACCOUNTS` dan `DEMO_HINT`.

Tautan super admin sengaja tidak ditampilkan di etalase — masuk lewat URL `/superadmin`.
Akun pembeli ditolak di halaman itu, dan sebaliknya.

## Tiga konsol

| Peran | Entry | Isi |
| --- | --- | --- |
| Pembeli | `/` | Etalase, pencarian & filter, detail produk, keranjang, checkout, pesanan, pelacakan, pesan, akun, bantuan |
| Penjual ("Toko Saya") | `/seller` | Dasbor, analitik, produk, unggah produk, pesanan, antar ke gerai, pengaturan kirim, pesan, pengaturan toko |
| Super admin | `/admin` | Dasbor, penjual, produk, pesanan, jasa pengiriman, integrasi API, gerai & hub, pesan, siaran |

Setelah pembeli masuk, menu akun di kanan atas menampilkan **Toko Saya** yang membuka konsol
penjual untuk toko miliknya (`account.sellerId`). Pembeli tanpa toko melihat opsi "Buka toko".

### Penjagaan rute

- `/orders`, `/messages`, `/account` → `/login?next=<tujuan>` bila belum masuk
- `/seller/*` → `/login?next=…` bila belum masuk, atau `/account` bila akun belum punya toko
- `/admin/*` → `/superadmin` bila bukan akun admin

Nama produk, kategori dan nama toko tersimpan dalam Bahasa Indonesia di `mock.js`; nama kurir
(DHL, FedEx, EMS, UPS) dan nama layanannya tetap seperti aslinya.

## Alur yang layak dicoba

1. **Belanja** — `/product/pr01` → pilih varian dan jumlah (perhatikan harga grosirnya ikut turun) →
   bandingkan tarif kurir → masukkan keranjang → `/cart` pakai voucher `TANAHABANG10` → checkout →
   bayar → konfirmasi pesanan → `/track/<id>`.
2. **Proses pesanan** — masuk sebagai `tokoani`, buka **Toko Saya** → `/seller/orders` →
   *Terima pesanan* → *Cetak label antar* → `/seller/dropoff` pilih paket → *Buat kode antar* →
   *Konfirmasi pindai loket*. Pesanan mendapat nomor resi dan pindah ke "Di gerai" pada
   linimasa pelacakan pembeli.
3. **Pasang produk** — `/seller/products/new` — foto, tingkatan harga grosir, varian, berat, kode HS
   dan sakelar kurir per produk. Panel samping menilai kelengkapan dan menampilkan pratinjau kartunya.
4. **Jasa kirim** — masuk di `/superadmin` sebagai `admin`, lalu `/admin/providers` untuk menambah,
   menghapus, atau menyalakan kurir untuk seluruh marketplace; `/admin/integrations` menyimpan
   kredensial, lingkungan (sandbox/produksi), webhook, sakelar fitur dan log panggilan API. Kurir
   yang dimatikan di sini hilang dari pengaturan penjual dan dari checkout.
5. **Moderasi & pesan** — `/admin/sellers` untuk memeriksa katalog kios, mengubah, menangguhkan atau
   menghapusnya; `/admin/messages` dan `/admin/broadcast` untuk mengirim ke satu penjual/pembeli atau
   ke segmen tertentu.

## Voucher yang berfungsi

`TANAHABANG10` (10% di atas $50, maks $20) · `NEWBUYER5` ($5 di atas $25) ·
`FREESHIP` (gratis ongkir di atas $120) · `HIJAB15` (15% kategori hijab, di atas $80)

## Susunan berkas

```
src/
  main.jsx            bootstrap + jQuery global, akar router
  App.jsx             seluruh rute dan penjagaan akses
  data/mock.js        penjual, produk, pesanan, kurir, gerai, voucher, analitik, akun, gambar SVG
  data/store.jsx      context + reducer React (sesi, keranjang, pesanan, katalog, kurir, pesan) dan helper mata uang
  layouts/            StoreLayout (rangka etalase), DashLayout (rangka penjual + admin)
  components/         ui.jsx (kartu, statistik, grafik, modal, toast, MarketCrest), ProductCard, Chat, AuthForm, AuthModal
  pages/buyer/        Home, Browse, ProductDetail, Cart, Checkout, OrderPlaced, MyOrders, TrackOrder, BuyerMessages, Account, Help
  pages/seller/       SellerDashboard, SellerAnalytics, SellerProducts, ProductForm, SellerOrders, SellerDropoff, SellerShipping, SellerMessages, SellerSettings
  pages/admin/        AdminDashboard, AdminSellers, AdminProducts, AdminOrders, AdminProviders, AdminIntegrations, AdminHubs, AdminMessages, AdminBroadcast
```

## Catatan sebelum menyambung backend

- State berada di `src/data/store.jsx` dan **ter-reset saat halaman dimuat ulang penuh** — berpindah
  lewat tautan di dalam aplikasi tetap menyimpannya. Ganti aksi reducer dengan panggilan API dan
  bentuknya tetap sama.
- Gambar produk dibuat lokal sebagai SVG data URI (`placeholder()` di `mock.js`), jadi prototipe ini
  tidak butuh koneksi maupun berkas gambar.
- Autentikasi masih perbandingan string biasa di `authenticate()` (`src/data/store.jsx`) terhadap
  `ACCOUNTS`. Ganti dengan sesi/JWT sungguhan sebelum rilis — kata sandi tidak boleh disimpan atau
  dibandingkan apa adanya, dan blok hint akun demo harus dicabut.
- Kolom kartu di checkout masih input biasa. Versi sungguhan wajib menyerahkan data kartu langsung
  ke hosted field atau SDK payment gateway — jangan pernah dikirim ke server sendiri.
- Tarif kurir berasal dari `quote()` di `store.jsx` (tarif dasar + per kg). Ganti dengan API tarif
  sungguhan begitu `/admin/integrations` berisi kredensial asli.
- `vite.config.js` memakai `base: './'`. Menyajikan hasil build dari XAMPP juga perlu aturan rewrite
  yang mengarahkan path tak dikenal ke `index.html`, kalau tidak tautan dalam seperti
  `/seller/orders` akan 404 saat di-refresh.

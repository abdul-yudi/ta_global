// Marketplace entities are fetched from PostgreSQL-backed API.
export const PRODUCTS=[];
export const PROVIDERS=[];
export const SELLERS=[];
export const ORDERS=[];
export const THREADS=[];
export const VOUCHERS=[];
export const HUBS=[];
export const CATEGORIES=[
{id:'c1',name:'Fashion Wanita',icon:'bi-bag-heart',image:'/images/categories/fashion-wanita.jpg',sub:['Dress','Blus','Abaya & Gamis','Rok','Outerwear']},
{id:'c2',name:'Fashion Pria',icon:'bi-person-vcard',image:'/images/categories/fashion-pria.jpg',sub:['Kemeja','Koko & Kurta','Celana','Jaket']},
{id:'c3',name:'Hijab & Kerudung',icon:'bi-flower2',image:'/images/categories/hijab-kerudung.jpg',sub:['Pashmina','Hijab Instan','Segi Empat','Inner']},
{id:'c4',name:'Kain & Tekstil',icon:'bi-layers',image:'/images/categories/kain-tekstil.jpg',sub:['Batik','Roll Katun','Sutra','Renda','Linen']},
{id:'c5',name:'Anak & Bayi',icon:'bi-balloon',image:'/images/categories/anak-bayi.jpg',sub:['Setelan Anak Perempuan','Setelan Anak Laki-laki','Pakaian Bayi']},
{id:'c6',name:'Tas & Aksesori',icon:'bi-handbag',image:'/images/categories/tas-aksesori.jpg',sub:['Tote','Selempang','Ikat Pinggang','Perhiasan']},
{id:'c7',name:'Perlengkapan Ibadah',icon:'bi-moon-stars',image:'/images/categories/perlengkapan-ibadah.jpg',sub:['Mukena','Sarung','Peci','Sajadah']},
{id:'c8',name:'Paket Grosir',icon:'bi-box-seam',image:'/images/categories/paket-grosir.jpg',sub:['Lot Campur','Lot Grade A','Overstock']}];
export const COUNTRIES=['Indonesia','Amerika Serikat','Inggris','Arab Saudi','Uni Emirat Arab','Malaysia','Singapura','Australia','Jerman','Belanda','Jepang','Korea Selatan','Kanada','Prancis','Turki','Qatar','Brunei','Nigeria','Afrika Selatan'];
export const REVIEWS=[];
export const SELLER_ANALYTICS={revenueSeries:Array(14).fill(0),ordersSeries:Array(14).fill(0),visitorsSeries:Array(14).fill(0),topCountries:[],funnel:[{value:1}],categoryShare:[],months:[]};
export const ADMIN_ANALYTICS={gmvSeries:Array(7).fill(0),ordersSeries:Array(7).fill(0),buyersSeries:Array(7).fill(0),sellersSeries:Array(7).fill(0),ordersByStatus:{},topCountries:[],funnel:[{value:1},{value:0}],categoryShare:[],dailySeries:Array(7).fill(0),months:[]};
export const ACCOUNTS=[];
export const DEMO_HINT={buyer:{username:'',password:''},admin:{username:'',password:''}};
export function placeholder(seed,label=''){return `https://placehold.co/600x600?text=${encodeURIComponent(label||seed)}`;}
export function freshTracking(country,city){return[{title:'Pesanan dibuat',note:'Menunggu diproses penjual',place:city,time:new Date().toISOString(),state:'active'}];}
export const ORDER_STATUS={awaiting_acceptance:{label:'Menunggu konfirmasi',cls:'ta-badge-warn'},to_dropoff:{label:'Siap diantar',cls:'ta-badge-info'},at_hub:{label:'Di gerai / hub',cls:'ta-badge-info'},in_transit:{label:'Dalam pengiriman',cls:'ta-badge-accent'},out_for_delivery:{label:'Sedang diantar',cls:'ta-badge-accent'},delivered:{label:'Terkirim',cls:'ta-badge-ok'},cancelled:{label:'Dibatalkan',cls:'ta-badge-danger'}};

import React,{useEffect,useState} from 'react';
import {Link,useParams,useNavigate} from 'react-router-dom';
import {useStore,usd} from '../../data/store';
import {api} from '../../api/client';
import {ProviderLogo,StatusBadge,Empty} from '../../components/ui';

export default function TrackOrder(){
 const{id}=useParams();const nav=useNavigate();const{state,seller,provider,product}=useStore();const[q,setQ]=useState(id||'');const[remote,setRemote]=useState(null);
 useEffect(()=>{if(id&&!state.orders.some(o=>o.id===id))api(`/public/orders/${encodeURIComponent(id)}`,{auth:false}).then(setRemote).catch(()=>setRemote(null));},[id,state.orders]);
 const order=state.orders.find(o=>o.id===id)||remote;
 const search=e=>{e.preventDefault();const hit=state.orders.find(o=>o.id.toLowerCase()===q.trim().toLowerCase()||o.awb?.toLowerCase()===q.trim().toLowerCase());nav(hit?`/track/${hit.id}`:`/track/${q.trim().toUpperCase()}`);};
 return <main className="container py-4"><div className="row g-3 justify-content-center"><div className="col-lg-9"><div className="ta-card ta-card-pad"><h1 style={{fontSize:'1.4rem'}}>Lacak pesanan</h1><form className="input-group" onSubmit={search}><input className="form-control" placeholder="Nomor pesanan atau resi" value={q} onChange={e=>setQ(e.target.value)}/><button className="btn btn-ta">Cari</button></form>{!order&&<div className="mt-4"><Empty icon="bi-geo-alt" title={id?'Pesanan tidak ditemukan':'Masukkan nomor pesanan untuk melacak'}/></div>}{order&&<div className="mt-4"><div className="d-flex justify-content-between"><strong>{order.id}</strong><StatusBadge status={order.status}/></div><p>{order.address}</p><p>Kurir: {provider(order.provider)?.name||order.provider}; resi: {order.awb||'Belum tersedia'}</p>{order.items?.map(i=><div key={i.productId+i.variant}>{product(i.productId)?.title||i.title||i.productName} — {i.qty||i.quantity} pcs</div>)}<ol className="mt-4">{(order.tracking||[]).map((t,i)=><li key={i}><strong>{t.title}</strong> — {t.note} {t.time!=='-'?`(${t.time})`:''}</li>)}</ol></div>}</div></div></div></main>;
}

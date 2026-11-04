import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { useStore } from './data/store';

import StoreLayout from './layouts/StoreLayout';
import DashLayout from './layouts/DashLayout';

/* pembeli */
import Home from './pages/buyer/Home';
import Browse from './pages/buyer/Browse';
import ProductDetail from './pages/buyer/ProductDetail';
import Cart from './pages/buyer/Cart';
import Checkout from './pages/buyer/Checkout';
import OrderPlaced from './pages/buyer/OrderPlaced';
import MyOrders from './pages/buyer/MyOrders';
import TrackOrder from './pages/buyer/TrackOrder';
import BuyerMessages from './pages/buyer/BuyerMessages';
import Account from './pages/buyer/Account';
import Help from './pages/buyer/Help';
import Login from './pages/Login';
import SuperAdminLogin from './pages/SuperAdminLogin';

/* penjual */
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerAnalytics from './pages/seller/SellerAnalytics';
import SellerProducts from './pages/seller/SellerProducts';
import ProductForm from './pages/seller/ProductForm';
import SellerOrders from './pages/seller/SellerOrders';
import SellerDropoff from './pages/seller/SellerDropoff';
import SellerShipping from './pages/seller/SellerShipping';
import SellerMessages from './pages/seller/SellerMessages';
import SellerSettings from './pages/seller/SellerSettings';

/* super admin */
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSellers from './pages/admin/AdminSellers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProviders from './pages/admin/AdminProviders';
import AdminIntegrations from './pages/admin/AdminIntegrations';
import AdminHubs from './pages/admin/AdminHubs';
import AdminMessages from './pages/admin/AdminMessages';
import AdminBroadcast from './pages/admin/AdminBroadcast';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/** Halaman pribadi pembeli: pesanan, pesan dan akun. */
function RequireLogin({ children }) {
  const { isAuthed } = useStore();
  const loc = useLocation();
  if (!isAuthed) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  return children;
}

/** Konsol penjual hanya untuk akun yang sudah masuk dan punya toko. */
function RequireStore({ children }) {
  const { isAuthed, hasStore } = useStore();
  const loc = useLocation();
  if (!isAuthed) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (!hasStore) return <Navigate to="/account" replace />;
  return children;
}

/** Konsol super admin hanya untuk akun admin, lewat /superadmin. */
function RequireAdmin({ children }) {
  const { isAdmin } = useStore();
  if (!isAdmin) return <Navigate to="/superadmin" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/superadmin" element={<SuperAdminLogin />} />

        {/* ---------------- Etalase (pembeli) ---------------- */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Browse />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-placed/:id" element={<OrderPlaced />} />
          <Route path="/orders" element={<RequireLogin><MyOrders /></RequireLogin>} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/track/:id" element={<TrackOrder />} />
          <Route path="/messages" element={<RequireLogin><BuyerMessages /></RequireLogin>} />
          <Route path="/account" element={<RequireLogin><Account /></RequireLogin>} />
          <Route path="/help" element={<Help />} />
        </Route>

        {/* ---------------- Toko Saya (penjual) ---------------- */}
        <Route path="/seller" element={<RequireStore><DashLayout variant="seller" /></RequireStore>}>
          <Route index element={<SellerDashboard />} />
          <Route path="analytics" element={<SellerAnalytics />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="dropoff" element={<SellerDropoff />} />
          <Route path="shipping" element={<SellerShipping />} />
          <Route path="messages" element={<SellerMessages />} />
          <Route path="settings" element={<SellerSettings />} />
        </Route>

        {/* ---------------- Super Admin ---------------- */}
        <Route path="/admin" element={<RequireAdmin><DashLayout variant="admin" /></RequireAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="integrations" element={<AdminIntegrations />} />
          <Route path="hubs" element={<AdminHubs />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="broadcast" element={<AdminBroadcast />} />
        </Route>

        <Route path="*" element={
          <div className="container py-5 text-center">
            <h1 className="ta-display">404</h1>
            <p className="ta-muted">Halaman ini belum ada di prototipe.</p>
            <Link to="/" className="btn btn-ta">Kembali ke etalase</Link>
          </div>
        } />
      </Routes>
    </>
  );
}

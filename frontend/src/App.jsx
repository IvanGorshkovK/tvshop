import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import Home from './pages/Home.jsx'
import Catalog from './pages/Catalog.jsx'
import ProductPage from './pages/ProductPage.jsx'
import ComparePage from './pages/ComparePage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'
import DeliveryPage from './pages/DeliveryPage.jsx'
import InstallPage from './pages/InstallPage.jsx'
import PaymentPage from './pages/PaymentPage.jsx'
import WarrantyPage from './pages/WarrantyPage.jsx'
import NotFound from './pages/NotFound.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import Products from './pages/admin/Products.jsx'
import ProductForm from './pages/admin/ProductForm.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'
import AdminCounterparties from './pages/admin/AdminCounterparties.jsx'
import AdminAudit from './pages/admin/AdminAudit.jsx'
import AdminSite from './pages/admin/AdminSite.jsx'
import AdminFilters from './pages/admin/AdminFilters.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/install" element={<InstallPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/warranty" element={<WarrantyPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="counterparties" element={<AdminCounterparties />} />
        <Route path="audit" element={<AdminAudit />} />
        <Route path="site" element={<AdminSite />} />
        <Route path="filters" element={<AdminFilters />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
    </Routes>
  )
}

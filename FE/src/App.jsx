import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'
import { ToastProvider } from './contexts/toast-context'
import { AdminGuard } from './components/guards/AdminGuard'
import { AuthGuard } from './components/guards/AuthGuard'

const HomePage = lazy(() => import('./page/Hompage'))
const SignInPage = lazy(() => import('./page/SignIn'))
const SignUpPage = lazy(() => import('./page/Signup'))
const ForgotPasswordPage = lazy(() => import('./page/ForgotPassword'))
const ResetPasswordPage = lazy(() => import('./page/ResetPassword'))
const UserProfilePage = lazy(() => import('./page/Profile'))
const SubscriptionPage = lazy(() => import('./page/Subscription.tsx'))
const DiscoveryPage = lazy(() => import('./page/Discovery'))
const CollectionsPage = lazy(() => import('./page/Collections'))
const ProductDetailPage = lazy(() => import('./page/ProductDetail'))
const AIRoomPlannerPage = lazy(() => import('./page/AIRoomPlanner'))

// Admin pages
const AdminLayout = lazy(() => import('./page/Admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./page/Admin/AdminDashboard'))
const AdminUserManagement = lazy(() => import('./page/Admin/UserManagement'))
const AdminSubscriptionPlans = lazy(() => import('./page/Admin/SubscriptionPlans'))
const AdminProductInventory = lazy(() => import('./page/Admin/ProductInventory'))

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route
              path="/ai-room-planner"
              element={
                <AuthGuard>
                  <AIRoomPlannerPage />
                </AuthGuard>
              }
            />
            <Route path="/new-arrivals" element={<Navigate to="/discovery" replace />} />
            {/* Redirect old cart/checkout URLs to home */}
            <Route path="/cart" element={<Navigate to="/" replace />} />
            <Route path="/checkout" element={<Navigate to="/" replace />} />

            {/* Admin routes — super admin only */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUserManagement />} />
              <Route path="subscriptions" element={<AdminSubscriptionPlans />} />
              <Route path="products" element={<AdminProductInventory />} />
            </Route>

            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  )
}

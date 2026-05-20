import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'
import { CartProvider } from './contexts/cart-context'
import { ToastProvider } from './contexts/toast-context'

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
const CartPage = lazy(() => import('./page/Cart'))
const CheckoutPage = lazy(() => import('./page/Checkout'))

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
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
              <Route path="/ai-room-planner" element={<AIRoomPlannerPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/new-arrivals" element={<Navigate to="/discovery" replace />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}

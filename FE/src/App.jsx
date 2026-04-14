import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'

const HomePage = lazy(() => import('./page/Hompage'))
const SignInPage = lazy(() => import('./page/SignIn'))
const SignUpPage = lazy(() => import('./page/Signup'))
const ForgotPasswordPage = lazy(() => import('./page/ForgotPassword'))
const ResetPasswordPage = lazy(() => import('./page/ResetPassword'))

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

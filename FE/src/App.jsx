import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const HomePage = lazy(() => import('./page/Hompage'))
const SignInPage = lazy(() => import('./page/SignIn'))

export default function App() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  )
}

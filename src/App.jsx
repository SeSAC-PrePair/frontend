import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppProvider, useAppState } from './context/AppStateContext'
import LandingPage from './pages/Landing'
import AuthPage from './pages/Auth'
import CoachPage from './pages/Coach'
import SettingsPage from './pages/Settings'
import RewardsOverview from './pages/rewards/RewardsOverview'
import RewardShop from './pages/rewards/RewardShop'
import PurchaseComplete from './pages/rewards/PurchaseComplete'
import PurchaseHistory from './pages/rewards/PurchaseHistory'
import AnswerPage from './pages/Answer'
import AppLayout from './layouts/AppLayout'
import './index.css'
import SignupSuccessPage from "./pages/SignupSuccessPage.jsx";

function AppRoutes() {
  function ProtectedRoute({ children }) {
    const { user } = useAppState()
    const location = useLocation()

    if (!user) {
      return <Navigate to="/auth" replace state={{ from: location.pathname }} />
    }

    return children
  }

  function ProtectedOutlet() {
    return (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    )
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="auth" element={<AuthPage />} />
          <Route path="/signup-success" element={<SignupSuccessPage />} />
        <Route
          path="coach"
          element={
            <ProtectedRoute>
              <CoachPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="rewards" element={<ProtectedOutlet />}>
          <Route index element={<RewardsOverview />} />
          <Route path="shop" element={<RewardShop />} />
          <Route path="complete" element={<PurchaseComplete />} />
          <Route path="history" element={<PurchaseHistory />} />
        </Route>
        <Route
          path="answer/:dispatchId?"
          element={
            <ProtectedRoute>
              <AnswerPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}

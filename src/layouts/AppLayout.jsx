import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'

const navItems = [
  { to: '/coach', label: 'AI 코칭' },
  { to: '/rewards', label: '리워드 허브' },
  { to: '/rewards/shop', label: '리워드샵' },
  { to: '/settings', label: '개인 설정' },
]

const activeLinkClass = ({ isActive }) => (isActive ? 'nav__link nav__link--active' : 'nav__link')

export default function AppLayout() {
  const location = useLocation()
  const { user } = useAppState()

  const isLanding = location.pathname === '/'
  const isAuth = location.pathname.startsWith('/auth')

  return (
    <div className="shell">
      <div className="shell__glow" aria-hidden="true" />
      <header className={`shell__header ${isLanding ? 'is-transparent' : ''}`}>
        <div className="shell__brand">
          <Link to="/" className="brand">
            <span className="brand__symbol">◎</span>
            <span className="brand__meta">
              <strong>Interview Orbit</strong>
              <span>AI Interview Coaching Studio</span>
            </span>
          </Link>
        </div>

        {!isAuth && (
          <nav className="shell__nav">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={activeLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="shell__actions">
          {user ? (
            <Link to="/settings" className="user-chip">
              <span className="user-chip__avatar" aria-hidden="true">
                {user.avatar || '✨'}
              </span>
              <div className="user-chip__meta">
                <strong>{user.name}</strong>
                <span>
                  {user.points.toLocaleString()} pts · {user.tier}
                </span>
              </div>
            </Link>
          ) : (
            <Link to="/auth" className="cta-button">
              로그인 / 회원가입
            </Link>
          )}
        </div>
      </header>

      <main className="shell__main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="shell__page"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="shell__footer">
        <span>© {new Date().getFullYear()} Interview Orbit · AI가 돕는 면접 루틴</span>
        <span>Beta • Feedback welcome</span>
      </footer>
    </div>
  )
}

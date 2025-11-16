import { useEffect, useState } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import '../styles/layouts/AppLayout.css'
import brandLogo from '/src/assets/b01fa81ce7a959934e8f78fc6344081972afd0ae.png' // 1. 로고 파일 import

const navItems = [
    { to: '/rewards', label: 'home' },
    { to: '/coach', label: 'interview' },
    { to: '/rewards/shop', label: 'reward' },
    { to: '/settings', label: 'settings' },
]

const activeLinkClass = ({ isActive }) => (isActive ? 'nav__link nav__link--active' : 'nav__link')

export default function AppLayout() {
    const location = useLocation()
    const { user } = useAppState()
    const [isNavOpen, setIsNavOpen] = useState(false)

    const isLanding = location.pathname === '/'
    const isAuth = location.pathname.startsWith('/auth')
    const showNavElements = !isLanding && !isAuth && user

    useEffect(() => {
        setIsNavOpen(false)
    }, [location.pathname])

    return (
        <div className="shell">
            <div className="shell__glow" aria-hidden="true" />

            <header className={`shell__header ${isLanding ? 'is-transparent' : ''}`}>
                <div className="shell__brand">
                    <Link to="/" className="brand">
                        <img src={brandLogo} alt="PrePair 로고" className="brand__symbol" />
                        <span className="brand__meta">
              <strong>PrePair</strong>
            </span>
                    </Link>
                </div>

                <nav
                    id="primary-navigation"
                    className={`shell__nav ${isNavOpen ? 'is-open' : ''}`}
                    aria-label="주요 메뉴"
                >
                    {showNavElements &&
                        navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={activeLinkClass}
                                end
                            >
                                {item.label}
                            </NavLink>
                        ))}
                </nav>

                <div className="shell__actions">
                    {showNavElements && (
                        <button
                            type="button"
                            className="menu-toggle"
                            aria-controls="primary-navigation"
                            aria-expanded={isNavOpen}
                            onClick={() => setIsNavOpen((prev) => !prev)}
                        >
              <span className="menu-toggle__icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
                            <span className="sr-only">{isNavOpen ? '메뉴 닫기' : '메뉴 열기'}</span>
                        </button>
                    )}

                    {!user && (
                        <>
                            <Link to="/auth?mode=login" className="cta-button cta-button--ghost">
                                로그인
                            </Link>
                            <Link to="/auth?mode=signup" className="cta-button cta-button--primary">
                                회원가입
                            </Link>
                        </>
                    )}
                </div>
            </header>

            <main className="shell__main">
                <AnimatePresence mode="wait">
                    <Motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="shell__page"
                    >
                        <Outlet />
                    </Motion.div>
                </AnimatePresence>
            </main>

            <footer className="shell__footer">
                <div className="footer__column footer__brand">
                    <span className="footer__logo">매일매일</span>
                    <p>Copyright © {new Date().getFullYear()} 매일매일. All rights reserved.</p>
                </div>
                <div className="footer__column">
                    <strong>Contact</strong>
                    <a href="mailto:team.maeilmail@gmail.com">team.maeilmail@gmail.com</a>
                </div>
                <div className="footer__column">
                    <strong>Socials</strong>
                    <a href="https" target="_blank" rel="noopener noreferrer">Velog</a>
                    <a href="https" target="_blank" rel="noopener noreferrer">Github</a>
                </div>
                <div className="footer__column">
                    <strong>Etc</strong>
                    <Link to="/about-us">팀 소개</Link>
                    <Link to="/feedback">서비스 피드백</Link>
                </div>
            </footer>

        </div>
    )
}
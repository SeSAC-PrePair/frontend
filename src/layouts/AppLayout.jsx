import { useEffect, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import '../styles/layouts/AppLayout.css'
import brandLogo from '/src/assets/b01fa81ce7a959934e8f78fc6344081972afd0ae.png' // 1. 로고 파일 import

const navItems = [
    { to: '/rewards', label: 'Home' },
    { to: '/coach', label: 'Interview' },
    { to: '/rewards/shop', label: 'Reward' },
    { to: '/settings', label: 'Settings' },
]

const activeLinkClass = ({ isActive }) => (isActive ? 'nav__link nav__link--active' : 'nav__link')

export default function AppLayout() {
    const location = useLocation()
    const { user } = useAppState()
    const [isNavOpen, setIsNavOpen] = useState(false)

    const isLanding = location.pathname === '/'
    const isAuth = location.pathname.startsWith('/auth')
    const showNavElements = !isLanding && !isAuth && user
    const showAuthCtas = isLanding || !user

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

                    {showAuthCtas && (
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
                <Motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="shell__page"
                >
                    <Outlet />
                </Motion.div>
            </main>

            <footer className="shell__footer">
                {user ? (
                    <>
                        <div className="footer__column footer__brand">
                            <span className="footer__logo">PrePair</span>
                            <p>AI 기반 면접 코칭 플랫폼으로 취업 준비생의 성공적인 커리어를 응원합니다.</p>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#9ca3af' }}>
                                Ollama LLM 기반 실시간 피드백 · PWA 지원 · 메일/카톡 알림
                            </p>
                        </div>
                        <div className="footer__bottom">
                            <span>Copyright © {new Date().getFullYear()} PrePair. All rights reserved.</span>
                            <a href="mailto:team.maeilmail@gmail.com">team.maeilmail@gmail.com</a>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="footer__column footer__brand">
                            <span className="footer__logo">PrePair</span>
                            <p>AI 기반 면접 코칭 플랫폼으로<br/>취업 준비생의 성공적인 커리어를 응원합니다.</p>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#9ca3af' }}>
                                Ollama LLM 기반 실시간 피드백<br/>
                                PWA 지원 · 메일/카톡 알림 · 포인트 리워드
                            </p>
                        </div>
                        <div className="footer__column">
                            <strong>Product</strong>
                            <Link to="/auth?mode=signup">회원가입</Link>
                            <Link to="/auth?mode=login">로그인</Link>
                            <a href="#features">기능 소개</a>
                            <a href="#how-it-works">사용 방법</a>
                        </div>
                        <div className="footer__column">
                            <strong>Company</strong>
                            <Link to="/about-us">팀 소개</Link>
                            <Link to="/feedback">서비스 피드백</Link>
                            <a href="mailto:team.maeilmail@gmail.com">Contact</a>
                            <a href="/careers">채용 정보</a>
                        </div>
                        <div className="footer__column">
                            <strong>Community</strong>
                            <a href="https://github.com/SeSAC-PrePair" target="_blank" rel="noopener noreferrer">GitHub</a>
                            <a href="https://velog.io/@prepair" target="_blank" rel="noopener noreferrer">Tech Blog</a>
                            <a href="https://instagram.com/prepair_official" target="_blank" rel="noopener noreferrer">Instagram</a>
                            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        </div>

                        <div className="footer__bottom">
                            <span>Copyright © {new Date().getFullYear()} PrePair. All rights reserved. | Powered by Ollama & React</span>
                            <div className="footer__bottom-links">
                                <a href="/terms">이용약관</a>
                                <a href="/privacy">개인정보처리방침</a>
                                <a href="/faq">FAQ</a>
                                <a href="mailto:team.maeilmail@gmail.com">team.maeilmail@gmail.com</a>
                            </div>
                        </div>
                    </>
                )}
            </footer>

        </div>
    )
}

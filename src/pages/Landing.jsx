import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import robotLogo from '../assets/logo.png'
import '../styles/pages/Landing.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const solutions = [
    {
        icon: '💬',
        title: '매일 텍스트 면접',
        description: '매일 도착하는 맞춤 면접 질문으로 꾸준한 연습'
    },
    {
        icon: '🤖',
        title: 'AI 피드백',
        description: 'AI 기반의 면접 분석 및 개선점 제시'
    },
    {
        icon: '🎁',
        title: '리워드 상점',
        description: '포인트를 모아 실제 혜택으로 교환'
    },
    {
        icon: '🎥',
        title: '3D 화상 면접',
        description: '면접을 위한 가상공간에서 실전 연습'
    },
]

export default function LandingPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [logoUrl, setLogoUrl] = useState(`${robotLogo}?v=${Date.now()}`)
    useEffect(() => {
        const img = new Image()
        img.onload = () => {
            setLogoUrl(`${robotLogo}?v=${Date.now()}`)
        }
        img.src = robotLogo
    }, [])

    // 카카오 인증 완료 후 Settings로 리다이렉트
    useEffect(() => {
        const kakaoSuccess = searchParams.get('kakao') === 'success'
        const email = searchParams.get('email')
        
        if (kakaoSuccess && email) {
            // localStorage에서 Settings에서 왔는지 확인
            const pendingAuth = localStorage.getItem('pendingKakaoAuth')
            if (pendingAuth) {
                try {
                    const data = JSON.parse(pendingAuth)
                    if (data.from === 'settings' && data.email === email) {
                        console.log('[Landing] Settings에서 온 카카오 인증 완료 - Settings로 리다이렉트')
                        localStorage.removeItem('pendingKakaoAuth')
                        navigate(`/settings?kakao=success&email=${encodeURIComponent(email)}`, { replace: true })
                        return
                    }
                } catch (e) {
                    console.error('[Landing] pendingKakaoAuth 파싱 오류:', e)
                }
            }
        }
    }, [searchParams, navigate])

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger)
        
        // 초기 상태 설정 (GSAP가 제어)
        gsap.set('.robot-image', { opacity: 0, scale: 0.8 })
        gsap.set('.hero-title-main, .hero-title-sub', { opacity: 0, y: 30 })
        gsap.set('.problem-title, .stat-label, .stat-number, .problem-description', { opacity: 0, y: 30 })
        gsap.set('.solution-card', { opacity: 0, y: 40 })
        gsap.set('.cta-title, .cta-description, .cta-button', { opacity: 0, y: 30 })
        
        // DOM이 완전히 렌더링될 때까지 대기
        const timer = setTimeout(() => {
          // Hero 섹션: 페이지 로드 시 즉시 애니메이션
          const heroTl = gsap.timeline({ defaults: { ease: "power2.out" } })
          heroTl.to('.robot-image', {
            opacity: 1,
            scale: 1,
            duration: 1
          })
          .to('.hero-title-main', {
            opacity: 1,
            y: 0,
            duration: 0.8
          }, "-=0.6")
          .to('.hero-title-sub', {
            opacity: 1,
            y: 0,
            duration: 0.8
          }, "-=0.6")
        }, 50)

        // Problem 섹션 애니메이션
        gsap.to('.problem-title', {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.problem-section',
            start: 'top 80%',
            once: true
          }
        })

        gsap.to('.stat-label', {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.2,
          scrollTrigger: {
            trigger: '.problem-section',
            start: 'top 80%',
            once: true
          }
        })

        // 숫자 카운팅 애니메이션
        const statNumberEl = document.querySelector('.stat-number')
        if (statNumberEl) {
          gsap.to('.stat-number', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.2,
            scrollTrigger: {
              trigger: '.problem-section',
              start: 'top 80%',
              once: true
            }
          })
          
          // 숫자 카운팅 애니메이션
          gsap.fromTo({ value: 0 }, 
            { value: 0 },
            {
              value: 71.9,
              duration: 1,
              ease: "power1.out",
              snap: { value: 0.1 },
              delay: 0.2,
              scrollTrigger: {
                trigger: '.problem-section',
                start: 'top 80%',
                once: true
              },
              onUpdate: function() {
                if (statNumberEl) {
                  statNumberEl.textContent = this.targets()[0].value.toFixed(1) + '%'
                }
              }
            }
          )
        }

        gsap.to('.problem-description', {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.4,
          scrollTrigger: {
            trigger: '.problem-section',
            start: 'top 80%',
            once: true
          }
        })

        // Solution 섹션 애니메이션
        gsap.set('.solution-robot-image', { opacity: 0, scale: 0.8, x: 50 })
        
        // 로봇 애니메이션 (오른쪽)
        gsap.to('.solution-robot-image', {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.solution-section',
            start: 'top 80%',
            once: true
          }
        })

        // 카드 애니메이션
        gsap.to('.solution-card', {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.solution-section',
            start: 'top 80%',
            once: true
          }
        })

        // 로봇 설명 애니메이션 
        let robotExplainTl = null
        let isHovering = false
        const cardHandlers = [] 
        
        const createRobotAnimation = () => {
          const robotEl = document.querySelector('.solution-robot-image')
          if (!robotEl) return null
          
          return gsap.timeline({ 
            repeat: -1,
            repeatDelay: 3,
            paused: false,
            scrollTrigger: {
              trigger: '.solution-section',
              start: 'top 50%',
              end: 'bottom top',
              toggleActions: 'play pause resume pause'
            }
          })
          .to('.solution-robot-image', {
            y: -15,
            duration: 0.8,
            ease: "power2.inOut"
          })
          .to('.solution-robot-image', {
            rotation: 8,
            duration: 0.4,
            ease: "power2.inOut"
          })
          .to('.solution-robot-image', {
            rotation: -8,
            duration: 0.4,
            ease: "power2.inOut"
          })
          .to('.solution-robot-image', {
            rotation: 0,
            y: 0,
            duration: 0.8,
            ease: "power2.inOut"
          })
        }

        
        const initRobotAnimation = () => {
          robotExplainTl = createRobotAnimation()
        }
        
        setTimeout(initRobotAnimation, 500)

        
        const initCardHoverHandlers = () => {
          const solutionCards = document.querySelectorAll('.solution-card')
          const robotEl = document.querySelector('.solution-robot-image')
          
          if (!robotEl || solutionCards.length === 0) {
            setTimeout(initCardHoverHandlers, 100)
            return
          }
          
          const cardHandlers = []
          
          solutionCards.forEach((card, idx) => {

            const isTopRow = idx < 2 
            
            const handleMouseEnter = () => {
              if (robotEl && !isHovering) {
                isHovering = true
                
                if (robotExplainTl) {
                  robotExplainTl.pause()
                }
                
                const currentTransform = gsap.getProperty(robotEl, "y") || 0
                

                const rotation = isTopRow ? 15 : -20

                gsap.to(robotEl, {
                  rotation: rotation,
                  scale: 1.05,
                  y: currentTransform,
                  duration: 0.4,
                  ease: "power2.out"
                })
              }
            }
            
            const handleMouseLeave = () => {
              if (robotEl && isHovering) {
                isHovering = false
                
                const currentY = gsap.getProperty(robotEl, "y") || 0
                
                // 원래 위치로 복귀
                gsap.to(robotEl, {
                  rotation: 0,
                  scale: 1,
                  y: currentY,
                  duration: 0.4,
                  ease: "power2.out",
                  onComplete: () => {
                    if (robotExplainTl && !isHovering) {
                      robotExplainTl.restart()
                    }
                  }
                })
              }
            }
            
            card.addEventListener('mouseenter', handleMouseEnter)
            card.addEventListener('mouseleave', handleMouseLeave)
            
            cardHandlers.push({ card, handleMouseEnter, handleMouseLeave })
          })
          
          return cardHandlers
        }
        
        setTimeout(() => {
          const handlers = initCardHoverHandlers()
          if (handlers && handlers.length > 0) {
            cardHandlers.length = 0 
            cardHandlers.push(...handlers)
          }
        }, 600)

        gsap.to('.cta-title', {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.cta-section',
            start: 'top 80%',
            once: true
          }
        })

        gsap.to('.cta-description', {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.2,
          scrollTrigger: {
            trigger: '.cta-section',
            start: 'top 80%',
            once: true
          }
        })

        gsap.to('.cta-button', {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1,
          delay: 0.4,
          scrollTrigger: {
            trigger: '.cta-section',
            start: 'top 80%',
            once: true
          }
        })

        // 스크롤 스냅
        const sections = gsap.utils.toArray('.hero-section, .problem-section, .solution-section, .cta-section')
        let currentSection = 0
        let isScrolling = false

        const goToSection = (index) => {
          if (isScrolling || !sections[index]) return
          isScrolling = true

          const targetY = sections[index].offsetTop
          
          gsap.to({ scrollY: window.scrollY }, {
            scrollY: targetY,
            duration: 1.2,
            ease: "power2.inOut",
            onUpdate: function() {
              window.scrollTo(0, this.targets()[0].scrollY)
            },
            onComplete: () => {
              isScrolling = false
            }
          })
        }

        const handleWheel = (e) => {
          if (isScrolling) {
            e.preventDefault()
            return
          }

          const delta = e.deltaY
          
          if (delta > 0 && currentSection < sections.length - 1) {

            currentSection++
            goToSection(currentSection)
            e.preventDefault()
          } else if (delta < 0 && currentSection > 0) {
            
            currentSection--
            goToSection(currentSection)
            e.preventDefault()
          }
        }

        
        window.addEventListener('wheel', handleWheel, { passive: false })

        
        const updateCurrentSection = () => {
          const scrollY = window.scrollY
          const windowHeight = window.innerHeight
          currentSection = Math.round(scrollY / windowHeight)
        }
        updateCurrentSection()

        
        let scrollTimeout
        const handleScroll = () => {
          clearTimeout(scrollTimeout)
          scrollTimeout = setTimeout(() => {
            if (!isScrolling) {
              updateCurrentSection()
            }
          }, 100)
        }
        window.addEventListener('scroll', handleScroll)
        
        return () => {
          clearTimeout(timer)
          ScrollTrigger.getAll().forEach(trigger => trigger.kill())
          window.removeEventListener('wheel', handleWheel)
          window.removeEventListener('scroll', handleScroll)
          
          if (robotExplainTl) {
            robotExplainTl.kill()
          }
          
          cardHandlers.forEach(({ card, handleMouseEnter, handleMouseLeave }) => {
            card.removeEventListener('mouseenter', handleMouseEnter)
            card.removeEventListener('mouseleave', handleMouseLeave)
          })
        }
      }, [])


    return (
        <div className="landing-new">
            {/* Section 1: Hero - 캐릭터와 서비스 이름 */}
            <section className="hero-section" data-section="hero">
                <div className="hero-container">
                    <div className="hero-robot">
                        <img src={logoUrl} alt="PrePair AI" className="robot-image" key={logoUrl} />
                    </div>
                    <h1 className="hero-title">
                        <span className="hero-title-main">PrePair</span>
                        <span className="hero-title-sub">완벽한 면접 준비, AI 파트너</span>
                    </h1>
                </div>
            </section>

            {/* Section 2: Problem - 문제 상황 */}
            <section className="problem-section" data-section="problem">
                <div className="problem-container">
                    <h2 className="problem-title">막막한 면접, 언제까지?</h2>
                    <div className="problem-stat">
                        <span className="stat-label">취업 준비 과정에서 면접이 가장 어렵다</span>
                        <span className="stat-number">71.9%</span>
                        
                        <p className="problem-description">안잡핏 면접 실태 조사, 2025</p>
                    </div>
                </div>
            </section>

            {/* Section 3: Solution - 솔루션 카드 */}
            <section className="solution-section" data-section="solution">
                <div className="solution-container">
                    <div className="solution-content">
                        <div className="solution-grid">
                            {solutions.map((solution, idx) => (
                                <div key={idx} className="solution-card" data-card-index={idx}>
                                    <div className="solution-card-icon">{solution.icon}</div>
                                    <h3 className="solution-card-title">{solution.title}</h3>
                                    <p className="solution-card-description">{solution.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="solution-robot">
                            <img src={logoUrl} alt="PrePair AI Robot" className="solution-robot-image" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: CTA - Call to Action */}
            <section className="cta-section" data-section="cta">
                <div className="cta-container">
                    <h2 className="cta-title">면접 준비를 습관으로!</h2>
                    <p className="cta-description">지금 바로 시작해보세요</p>
                    <div className="cta-buttons">
                        <Link to="/auth?mode=signup" className="cta-button cta-button--primary">
                            지금 시작하기
                        </Link>
                        <Link to="/auth?mode=signup" className="cta-button cta-button--secondary">
                            플랜 구독하기
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

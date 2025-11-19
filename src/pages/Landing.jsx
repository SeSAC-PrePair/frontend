import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import robotLogo from '../assets/b01fa81ce7a959934e8f78fc6344081972afd0ae.png'
import '../styles/pages/Landing.css'

const benefits = [
    {
        icon: '🎯',
        title: '직무 맞춤 질문',
        description: '개발, 기획, 마케팅 등 내 직무에 최적화된 AI 생성 면접 질문'
    },
    {
        icon: '📬',
        title: '매일 도착하는 알림',
        description: '메일 또는 카카오톡으로 원하는 시간에 자동 발송'
    },
    {
        icon: '🤖',
        title: 'AI 실시간 피드백',
        description: 'Ollama LLM 기반 즉시 분석 및 개선점 제시'
    },
    {
        icon: '🎁',
        title: '리워드 시스템',
        description: '꾸준한 연습으로 포인트를 모아 실제 혜택으로 교환'
    },
]

const howItWorks = [
    {
        step: '01',
        title: '회원가입 및 직무 설정',
        description: '이메일로 간편하게 가입하고, 내 직무와 알림 방식을 선택하세요.',
        icon: '✍️'
    },
    {
        step: '02',
        title: '매일 면접 질문 수신',
        description: '설정한 시간에 AI가 생성한 면접 질문이 메일이나 카톡으로 도착합니다.',
        icon: '📬'
    },
    {
        step: '03',
        title: '답변 작성 및 제출',
        description: '받은 질문에 대한 답변을 작성하고 제출하세요.',
        icon: '💭'
    },
    {
        step: '04',
        title: 'AI 피드백 & 리워드',
        description: 'AI가 즉시 분석한 피드백과 점수를 확인하고, 포인트를 받으세요.',
        icon: '🎯'
    },
]

const testimonials = [
    {
        name: '김개발',
        role: '프론트엔드 개발자',
        company: '스타트업',
        text: '매일 꾸준히 면접 질문을 받으니 실전 감각이 늘었어요. AI 피드백도 구체적이고 도움이 됩니다!',
        rating: 5
    },
    {
        name: '박기획',
        role: 'PM',
        company: 'IT 기업',
        text: '카톡으로 받아서 부담 없이 답변하고, 포인트까지 쌓여서 동기부여가 확실해요.',
        rating: 5
    },
    {
        name: '이마케팅',
        role: '마케터',
        company: '광고 에이전시',
        text: 'Ollama LLM 피드백이 정말 날카로워요. 면접 준비하면서 논리력도 많이 늘었습니다.',
        rating: 5
    },
]

const jobPostings = [
    { company: '네이버', position: '프론트엔드 개발자', type: '정규직', logo: '🟢' },
    { company: '카카오', position: 'PM/기획자', type: '정규직', logo: '🟡' },
    { company: '토스', position: '백엔드 개발자', type: '정규직', logo: '🔵' },
    { company: '배달의민족', position: 'UX 디자이너', type: '정규직', logo: '🩵' },
    { company: '쿠팡', position: '데이터 분석가', type: '정규직', logo: '🟠' },
    { company: '라인', position: 'iOS 개발자', type: '정규직', logo: '🟢' },
    { company: '당근마켓', position: 'Android 개발자', type: '정규직', logo: '🥕' },
    { company: '야놀자', position: '마케터', type: '정규직', logo: '🔴' },
]

export default function LandingPage() {
    const isMobile = useMediaQuery('(max-width: 768px)')
    const benefitsRef = useRef(null)
    const howStepsRef = useRef(null)
    const [benefitIndex, setBenefitIndex] = useState(0)
    const [howIndex, setHowIndex] = useState(0)

    const handleScroll = (ref, setIndex, itemCount) => {
        if (!ref.current) return
        const scrollLeft = ref.current.scrollLeft
        const itemWidth = ref.current.scrollWidth / itemCount
        const newIndex = Math.round(scrollLeft / itemWidth)
        setIndex(newIndex)
    }

    return (
        <div className="landing-new">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span>AI 기반 맞춤형 면접 코치 플랫폼</span>
                    </div>
                    <h1 className="hero-title">
                        <span className="hero-title__line">완벽한 면접 준비를 위한 AI 파트너,</span>
                        <span className="highlight">PrePair</span>
                    </h1>
                    <p className="hero-description">
                        AI가 생성한 맞춤 면접 질문을 매일 받아보고,<br />
                        실시간 피드백으로 면접 실력을 키워보세요.
                    </p>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <strong>1,000+</strong>
                            <span>활성 사용자</span>
                        </div>
                        <div className="stat-item">
                            <strong>10,000+</strong>
                            <span>생성된 질문</span>
                        </div>
                        <div className="stat-item">
                            <strong>95%</strong>
                            <span>만족도</span>
                        </div>
                    </div>
                    <div className="hero-cta">
                        <Link to="/auth?mode=signup" className="btn btn--primary btn--large">
                            무료로 시작하기
                        </Link>
                        <Link to="/auth?mode=login" className="btn btn--secondary btn--large">
                            로그인
                        </Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-showcase">
                        {/* 중앙 로고 */}
                        <div className="showcase-logo">
                            <img src={robotLogo} alt="PrePair AI" />
                        </div>

                        {/* 궤도 링 */}
                        <div className="showcase-orbit showcase-orbit--1"></div>
                        <div className="showcase-orbit showcase-orbit--2"></div>

                        {/* 떠다니는 아이콘들 */}
                        <div className="showcase-item showcase-item--1">
                            <span>📬</span>
                            <small>매일 질문</small>
                        </div>
                        <div className="showcase-item showcase-item--2">
                            <span>🤖</span>
                            <small>AI 피드백</small>
                        </div>
                        <div className="showcase-item showcase-item--3">
                            <span>📈</span>
                            <small>성장 기록</small>
                        </div>
                        <div className="showcase-item showcase-item--4">
                            <span>🎁</span>
                            <small>리워드</small>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <div className="section-header">
                    <h2>PrePair만의 특별한 장점</h2>
                    <p>AI 기반 맞춤 코칭으로 면접 준비를 더 효과적으로</p>
                </div>
                <div
                    className="benefits-grid"
                    ref={benefitsRef}
                    onScroll={() => handleScroll(benefitsRef, setBenefitIndex, benefits.length)}
                >
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="benefit-card">
                            <div className="benefit-icon">{benefit.icon}</div>
                            <h3>{benefit.title}</h3>
                            <p>{benefit.description}</p>
                        </div>
                    ))}
                </div>
                {isMobile && (
                    <div className="carousel-dots">
                        {benefits.map((_, idx) => (
                            <span
                                key={idx}
                                className={`carousel-dot ${idx === benefitIndex ? 'is-active' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* How It Works Section */}
            <section className="how-section">
                <div className="section-header">
                    <h2>PrePair 사용 방법</h2>
                    <p>간단한 4단계로 시작하는 면접 준비</p>
                </div>
                <div
                    className="how-steps"
                    ref={howStepsRef}
                    onScroll={() => handleScroll(howStepsRef, setHowIndex, howItWorks.length)}
                >
                    {howItWorks.map((item, idx) => (
                        <div key={idx} className="how-step">
                            <div className="step-number">{item.step}</div>
                            <div className="step-icon">{item.icon}</div>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>
                    ))}
                </div>
                {isMobile && (
                    <div className="carousel-dots">
                        {howItWorks.map((_, idx) => (
                            <span
                                key={idx}
                                className={`carousel-dot ${idx === howIndex ? 'is-active' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Testimonials Section */}
            <section className="testimonial-section">
                <div className="section-header">
                    <h2>사용자 후기</h2>
                    <p>PrePair와 함께 면접을 준비한 사용자들의 이야기</p>
                </div>
                <div className="testimonial-slider">
                    <div className="testimonial-track">
                        {[...testimonials, ...testimonials].map((testimonial, idx) => (
                            <div key={idx} className="testimonial-card">
                                <div className="testimonial-rating">
                                    {'⭐'.repeat(testimonial.rating)}
                                </div>
                                <p className="testimonial-text">"{testimonial.text}"</p>
                                <div className="testimonial-author">
                                    <strong>{testimonial.name}</strong>
                                    <span>{testimonial.role} · {testimonial.company}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Job Postings Banner */}
            <section className="job-banner-section">
                <div className="section-header">
                    <h2>지금 채용 중인 기업들</h2>
                    <p>PrePair와 함께 면접 준비하고 꿈의 기업에 도전하세요</p>
                </div>
                <div className="job-banner">
                    <div className="job-banner__track">
                        {[...jobPostings, ...jobPostings].map((job, idx) => (
                            <div key={idx} className="job-card">
                                <span className="job-card__logo">{job.logo}</span>
                                <div className="job-card__info">
                                    <strong>{job.company}</strong>
                                    <span>{job.position}</span>
                                </div>
                                <span className="job-card__type">{job.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

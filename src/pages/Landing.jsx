import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import robotLogo from '../assets/b01fa81ce7a959934e8f78fc6344081972afd0ae.png'
import { fetchJobPostings, getEmploymentTypeText } from '../utils/worknetApi'
import '../styles/pages/Landing.css'

const benefits = [
    {
        icon: '🎯',
        title: '직무 맞춤 질문',
        description: '개발, 기획, 마케팅 등 내 직무에 최적화된 AI 생성 면접 질문'
    },
    {
        icon: '🔔',
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
        icon: '📨'
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
        icon: '✍️'
    },
    {
        step: '04',
        title: 'AI 피드백 & 리워드',
        description: 'AI가 즉시 분석한 피드백과 점수를 확인하고, 포인트를 받으세요.',
        icon: '🤖'
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

// 기본 채용정보 (API 호출 실패 시 사용)
const defaultJobPostings = [
    { company: '하이퍼레일', position: '프론트엔드 개발자', type: '정규직' },
    { company: '골든치즈', position: 'PM/기획자', type: '정규직' },
    { company: '체스테크', position: '백엔드 개발자', type: '정규직' },
    { company: '플러피랩', position: 'UX 디자이너', type: '정규직' },
    { company: '버거테크', position: '데이터 분석가', type: '정규직' },
    { company: '카모빌', position: 'iOS 개발자', type: '정규직' },
    { company: '프레시캐롯', position: 'Android 개발자', type: '정규직' },
    { company: '타겟랩', position: '마케터', type: '정규직' },
]

export default function LandingPage() {
    const isMobile = useMediaQuery('(max-width: 768px)')
    const benefitsRef = useRef(null)
    const howStepsRef = useRef(null)
    const [benefitIndex, setBenefitIndex] = useState(0)
    const [howIndex, setHowIndex] = useState(0)
    const [jobPostings, setJobPostings] = useState(defaultJobPostings)
    const [isLoadingJobs, setIsLoadingJobs] = useState(true)

    const handleScroll = (ref, setIndex, itemCount) => {
        if (!ref.current) return
        const scrollLeft = ref.current.scrollLeft
        const itemWidth = ref.current.scrollWidth / itemCount
        const newIndex = Math.round(scrollLeft / itemWidth)
        setIndex(newIndex)
    }

    // 워크넷 API에서 채용정보 가져오기
    useEffect(() => {
        const loadJobPostings = async () => {
            try {
                setIsLoadingJobs(true)
                const jobs = await fetchJobPostings({
                    display: 20, // 더 많은 채용정보를 가져와서 무한 스크롤 효과를 위해
                })
                
                // API 데이터를 컴포넌트에서 사용할 형식으로 변환
                const formattedJobs = jobs.map((job) => ({
                    company: job.company || job.empBusiNm || '공채기업',
                    position: job.title || job.empWantedTitle || '채용공고',
                    type: job.type || job.empWantedTypeNm || '정규직',
                    region: job.region || job.coClcdNm || '',
                    salary: job.sal || '',
                    wantedInfoUrl: job.wantedInfoUrl || job.empWantedHomepgDetail || job.empWantedMobileUrl || '#',
                }))
                
                if (formattedJobs.length > 0) {
                    setJobPostings(formattedJobs)
                }
            } catch (error) {
                console.error('채용정보 로딩 실패:', error)
                // 에러 발생 시 기본 데이터 사용 (이미 defaultJobPostings로 설정됨)
            } finally {
                setIsLoadingJobs(false)
            }
        }
        
        loadJobPostings()
    }, [])

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
                        {/* 배경 그라데이션 원 */}
                        <div className="showcase-glow showcase-glow--1"></div>
                        <div className="showcase-glow showcase-glow--2"></div>
                        <div className="showcase-glow showcase-glow--3"></div>
                        
                        {/* 원형 링들 */}
                        <div className="showcase-ring showcase-ring--1"></div>
                        <div className="showcase-ring showcase-ring--2"></div>
                        <div className="showcase-ring showcase-ring--3"></div>
                        
                        {/* 파티클 효과 */}
                        <div className="showcase-particle showcase-particle--1"></div>
                        <div className="showcase-particle showcase-particle--2"></div>
                        <div className="showcase-particle showcase-particle--3"></div>
                        <div className="showcase-particle showcase-particle--4"></div>
                        <div className="showcase-particle showcase-particle--5"></div>
                        <div className="showcase-particle showcase-particle--6"></div>
                        
                        {/* 중앙 로봇 */}
                        <div className="showcase-robot">
                            <div className="robot-glow"></div>
                            <img src={robotLogo} alt="PrePair AI" />
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
                    {isLoadingJobs ? (
                        <div className="job-loading">채용정보를 불러오는 중...</div>
                    ) : (
                        <div className="job-banner__track">
                            {[...jobPostings, ...jobPostings].map((job, idx) => (
                                <a
                                    key={`${job.company}-${idx}`}
                                    href={job.wantedInfoUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="job-card"
                                >
                                    <div className="job-card__info">
                                        <strong>{job.company}</strong>
                                        <span>{job.position}</span>
                                        {job.region && <span className="job-card__region">{job.region}</span>}
                                    </div>
                                    <span className="job-card__type">{job.type}</span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

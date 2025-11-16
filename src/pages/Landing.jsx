import '../styles/pages/Landing.css'
import {Link} from 'react-router-dom'
import useMediaQuery from '../hooks/useMediaQuery'
import robotLogo from '../assets/b01fa81ce7a959934e8f78fc6344081972afd0ae.png'

// === 1. 서비스 설명에 맞게 피처 타일 내용 수정 ===
const featureTiles = [
    {
        badge: '🎯 맞춤 직군 설정',
        title: '내 커리어에 맞춘 첫 단계',
        description: '개발, 기획, 마케팅, 디자인 등 내 직무에 딱 맞는 면접 시뮬레이션을 설정하세요.',
    },
    {
        badge: '🤖 AI 맞춤 질문',
        title: '매일 만나는 면접관',
        description: '선택한 직군에 맞춰 AI가 생성한 핵심 질문을 매일 카톡이나 이메일로 보내드려요.',
    },
    {
        badge: '💡 실시간 AI 피드백',
        title: '가장 스마트한 코칭',
        description: '내 답변을 등록하면, AI 코치가 즉각적으로 상세한 피드백과 개선점을 제안해 줍니다.',
    },
    {
        badge: '💯 점수 & 리워드',
        title: '실력이 되는 보상',
        description: 'AI가 매긴 0~100점 점수로 실력을 확인하고, 쌓인 포인트로 커피/상품권도 교환해요!',
    },
]


const stepCards = [
    {
        id: 'home',
        title: '홈 화면',
        description: '오늘의 질문, 누적 점수, 1년 잔디를 한눈에 확인하고 루틴을 이어갑니다.',
        image: '/showcase/home.png',
    },
    {
        id: 'interview',
        title: 'AI 질문',
        description: '매일 도착한 질문에 5분 투자. 간단한 텍스트로도 스스로 설명해보는 습관을 만듭니다.',
        image: '/showcase/interview.png',
    },
    {
        id: 'feedback',
        title: 'AI 피드백',
        description: '잘한 점 · 개선점 · 추천 학습으로 즉시 복기하고, 제출 답변까지 함께 확인합니다.',
        image: '/showcase/ai-feedback.png',
    },
    {
        id: 'reward',
        title: '리워드',
        description: '축적된 포인트는 리워드샵에서 즉시 교환하며 동기부여를 유지합니다.',
        image: '/showcase/reward-shop.png',
    },
]

export default function LandingPage() {

    const isMobile = useMediaQuery('(max-width: 720px)')

    return (
        <div className="landing landing--refresh">
            {/* HERO with big mockup image */}

            <section className="landing-features">
            <section className="landing-hero2">
                <div className="hero2-copy">
                    <h1>완벽한 면접 준비를 위한 <br></br>AI 파트너, PrePair</h1>
                    <p>질문 → 작성 → 피드백 → 리워드. 인터뷰 루틴을 한 곳에서 자연스럽게 이어가세요.</p>
                </div>
                <div className="hero2-visual">
                    <img src={robotLogo} alt="PrePair 로봇 캐릭터" style={{width: 320, height: 'auto', display: 'block'}} />
                </div>
            </section>

                {/* === 3. 수정된 피처 타일이 자동 적용 === */}
                <div className="landing-feature-grid">
                    {featureTiles.map((tile) => (
                        <article key={tile.title}>
                            <span>{tile.badge}</span>
                            <strong>{tile.title}</strong>
                            <p>{tile.description}</p>
                        </article>
                    ))}
                </div>
            </section>

        

            {/* 모바일: 바로 시작하기 CTA, 데스크톱: 사용 가이드 섹션 */}
            {isMobile ? (
                            
                    <Link to="/auth?mode=signup" className="cta-button cta-button--primary">바로 시작하기</Link>
                            ) : (
                <section className="landing-stories">
                    <header className="stories__header">
                        <div>
                            <h2>✅ PrePair, 이렇게 사용해요</h2>
                            <p>로봇 코치와 함께 매일 한 걸음, 인터뷰 감각을 자연스럽게 끌어올립니다.</p>
                        </div>
                    </header>
                    {stepCards.map((s, idx) => (
                        <article key={s.id} className={`step-card ${idx % 2 === 1 ? 'is-alt' : ''}`}>
                            <div className="step-visual">
                                <img
                                    src={s.image}
                                    alt={`${s.title} 화면`}
                                    style={{ width: 1920, maxWidth: '100%', height: 'auto', display: 'block' }}
                                />
                            </div>
                            <div className="step-copy">
                                <span className="step-index">{idx + 1}</span>
                                <h3>{s.title}</h3>
                                <p>{s.description}</p>
                            </div>
                        </article>
                    ))}
                </section>
            )}

    

            {/* 기존 배너 섹션 (변경 없음) */}
            <section className="landing-ticker">
                <div className="landing-ticker__wrap">
                    <span>✨ <strong>삼성전자</strong>에서 신입 AI 엔지니어 공고를 올렸어요!</span>
                    <span>✨ <strong>Kakao</strong>에서 UX/UI 디자이너를 채용합니다.</span>
                    <span>✨ <strong>(주)PrePair</strong>에서 프론트엔드 개발자를 찾습니다.</span>
                    {/* Ticker 애니메이션을 위한 복제본 */}
                    <span>✨ <strong>삼성전자</strong>에서 신입 AI 엔지니어 공고를 올렸어요!</span>
                    <span>✨ <strong>Kakao</strong>에서 UX/UI 디자이너를 채용합니다.</span>
                    <span>✨ <strong>(주)PrePair</strong>에서 프론트엔드 개발자를 찾습니다.</span>
                </div>
            </section>

        </div>
    )
}
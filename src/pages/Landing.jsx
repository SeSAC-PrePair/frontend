import { motion as Motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import '../styles/pages/Landing.css'

const featureCards = [
  {
    title: 'AI 피드백 캔버스',
    description: '답변을 제출하면, 구조·명료성·깊이·스토리텔링 4가지 룰에 맞춰 AI가 정량/정성 피드백을 제공합니다.',
    accent: '01',
  },
  {
    title: '실시간 점수 보정',
    description: '우리 팀이 설계한 평가 규칙으로 점수를 재정렬하고, 즉시 다음 질문과 학습 루틴을 추천받아요.',
    accent: '02',
  },
  {
    title: '리워드 & 잔디',
    description: '획득한 포인트로 커피, 러닝 크레딧을 구매하고, Github 잔디처럼 성실함을 시각화해 보세요.',
    accent: '03',
  },
]

const steps = [
  { label: '로그인 / 회원가입', detail: '희망 분야, 목표, 질문 빈도를 입력' },
  { label: 'AI 면접 코칭', detail: '맞춤 질문에 답변하고, 피드백 확인' },
  { label: '점수 & 리워드', detail: '룰 기반 점수 확인 후 리워드샵 이용' },
]

const container = {
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function LandingPage() {
  return (
    <div className="landing">
        <section className="landing__hero">
          <Motion.div
            className="landing__headline"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="tag">AI Interview Coaching Platform</span>
            <h1>
              면접 루틴을 Orbit처럼
              <br />
              세련되고 간결하게.
            </h1>
            <p>
              Toss, 제미나이 스타일의 인터페이스에서 AI 코치가 질문을 제시하고, 점수화된 피드백과 리워드를 한 번에
              경험하세요.
            </p>
            <div className="landing__cta">
              <Link to="/auth" className="cta-button cta-button--primary">
                지금 시작하기
              </Link>
              <Link to="/rewards" className="cta-button cta-button--ghost">
                리워드 살펴보기
              </Link>
            </div>
          </Motion.div>

          <Motion.div
            className="landing__preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
          >
            <div className="preview-card preview-card--coach">
              <div className="preview-card__header">
                <span>오늘의 질문</span>
                <strong>웹 성능 최적화를 위해 Core Web Vitals를 개선했던 사례를 설명해주세요.</strong>
              </div>
              <div className="preview-card__body">
                <p>
                  AI 코치가 <strong>구조 · 명료성 · 깊이 · 스토리텔링</strong> 네 가지 지표로 답변을 점수화합니다.
                </p>
                <div className="preview-stats">
                  <div>
                    <span>총점</span>
                    <strong>88</strong>
                  </div>
                  <div>
                    <span>획득 포인트</span>
                    <strong>+52</strong>
                  </div>
                  <div>
                    <span>추천 리워드</span>
                    <strong>드립백 커피</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="preview-card preview-card--rewards">
              <span className="preview-pill">리워드샵</span>
              <strong>카페인 부스트 패키지</strong>
              <p>포인트로 커피, 스낵, 러닝 크레딧을 교환하고 루틴을 유지하세요.</p>
              <button type="button">지금 교환</button>
            </div>
          </Motion.div>
        </section>

        <Motion.section className="landing__features" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {featureCards.map((feature) => (
            <Motion.article key={feature.title} className="feature-card" variants={item}>
              <span className="feature-card__accent">{feature.accent}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </Motion.article>
          ))}
        </Motion.section>

        <section className="landing__steps">
          <header>
            <h2>당신만의 인터뷰 궤도에 진입하세요</h2>
            <p>회원가입부터 리워드 적립까지 단 3단계</p>
          </header>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <Motion.div
                key={step.label}
                className="step-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <span className="step-card__index">{index + 1}</span>
                <strong>{step.label}</strong>
                <p>{step.detail}</p>
              </Motion.div>
            ))}
          </div>
        </section>
      </div>
    )
  }

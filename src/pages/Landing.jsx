import { motion as Motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal'
import useMediaQuery from '../hooks/useMediaQuery'
import '../styles/pages/Landing.css'

const featureHighlights = [
  { title: '맞춤 AI 질문', description: '선택한 직업군과 목표에 꼭 맞는 질문과 스크립트를 선별해요.' },
  { title: '즉시 발송', description: '회원가입과 동시에 첫 질문을 메일로 보내고, 루틴을 자동으로 시작합니다.' },
  { title: '보상 루프', description: 'AI 피드백 점수를 모아 편의점 · 카페 · 도서 쿠폰으로 교환하세요.' },
]

const processSteps = [
  {
    label: '01. 계정 만들기',
    detail: '이메일과 비밀번호, 이름만으로 1분 내 가입 완료',
  },
  {
    label: '02. 직업·관심 선택',
    detail: '4개 직업군 + 자유 입력 칸으로 세부 목표를 기록',
  },
  {
    label: '03. 질문 주기 설정',
    detail: '주 5회(월~금 11시) 또는 주 1회(월 11시) 메일 발송',
  },
  {
    label: '04. 첫 질문 도착',
    detail: 'AI가 바로 질문을 보내고, 답변하러 가기 버튼 제공',
  },
]

const jobClusters = [
  {
    title: '🎤 사람을 직접 상대하는 직업군',
    caption: '소통력·태도·인상을 보는 면접을 대비하세요.',
    items: ['서비스직 · 항공승무원', '호텔리어 · 리셉션', 'CS 상담원', '공무원 민원직'],
  },
  {
    title: '💼 협업과 리더십 직업군',
    caption: '조직 적합성과 리더십 사고방식을 준비해요.',
    items: ['프로젝트 매니저', '팀·파트 리더', 'HR · 경영기획', '스타트업 개발 리더'],
  },
  {
    title: '🧠 창의/논리 표현 직업군',
    caption: '사고력과 스토리텔링을 강조하는 면접 루틴.',
    items: ['마케팅 · 광고', '디자인 · 브랜딩', '기획 · 컨설팅', '언론 · 방송'],
  },
  {
    title: '⚙️ 기술/연구 직업군',
    caption: '문제 접근과 협업 커뮤니케이션도 함께 준비.',
    items: ['소프트웨어 개발', '연구개발(R&D)', 'IT 스타트업 직군', '엔지니어링 포지션'],
  },
]

const cadenceOptions = [
  {
    title: '매일 1회 루틴',
    schedule: '월~금 오전 11시',
    detail: '아침 루틴처럼 짧고 꾸준히 연습하고 싶을 때 적합해요.',
  },
  {
    title: '주 1회 루틴',
    schedule: '매주 월요일 오전 11시',
    detail: '깊이 있는 답변을 한 주에 한 번 정리하고 싶다면 추천드려요.',
  },
]

const boardPosts = [
  { company: 'NAVYON', role: '프론트엔드 엔지니어', tag: '주니어 · 하이브리드' },
  { company: 'CLOUDAIR', role: '항공사 客실승무원', tag: '서비스 · 글로벌' },
  { company: 'BRIGHT HR', role: 'HR 비즈니스 파트너', tag: '리더십 · 풀타임' },
]

const infoCards = [
  {
    key: 'features',
    badge: 'Flow',
    title: '맞춤 질문 루틴',
    description: 'AI 질문 · 피드백 · 리워드가 한 흐름으로 이어지는 방식을 살펴보세요.',
    icon: '✨',
  },
  {
    key: 'onboarding',
    badge: 'Journey',
    title: '가입 여정 4단계',
    description: '계정 생성부터 첫 질문 도착까지 필요한 단계만 추려서 정리했어요.',
    icon: '🧭',
  },
  {
    key: 'jobs',
    badge: 'Career',
    title: '직업군 / 직무 추천',
    description: '관심 직무를 묶어서 보여주고, 세부 목표 입력 팁도 함께 안내합니다.',
    icon: '👥',
  },
  {
    key: 'cadence',
    badge: 'Schedule',
    title: '알림 루틴 & 채널',
    description: '발송 빈도, 채널, 오늘의 채용 공고까지 한 번에 확인하세요.',
    icon: '⏰',
  },
]

export default function LandingPage() {
  const isMobile = useMediaQuery('(max-width: 720px)')
  const [activeModal, setActiveModal] = useState(null)

  const modalMeta = useMemo(
    () => ({
      features: {
        title: 'PrePair 핵심 기능',
        size: 'md',
        render: () => (
          <div className="landing__modal-grid">
            {featureHighlights.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        ),
      },
      onboarding: {
        title: '가입 여정 4단계',
        size: 'md',
        render: () => (
          <ol className="landing__modal-steps">
            {processSteps.map((step) => (
              <li key={step.label}>
                <span>{step.label}</span>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        ),
      },
      jobs: {
        title: '직업군 & 추천 직무',
        size: 'lg',
        render: () => (
          <div className="landing__modal-grid landing__modal-grid--jobs">
            {jobClusters.map((cluster) => (
              <article key={cluster.title}>
                <strong>{cluster.title}</strong>
                <span>{cluster.caption}</span>
                <ul>
                  {cluster.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ),
      },
      cadence: {
        title: '알림 루틴 & 채널',
        size: 'md',
        render: () => (
          <div className="landing__modal-grid landing__modal-grid--cadence">
            <section>
              <h3>발송 루틴</h3>
              <ul>
                {cadenceOptions.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <span>{item.schedule}</span>
                    <p>{item.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3>알림 채널</h3>
              <ul>
                <li>
                  <strong>메일 (기본)</strong>
                  <p>가입 즉시 첫 질문이 메일로 도착하고, 루틴과 함께 자동 발송됩니다.</p>
                </li>
                <li>
                  <strong>카카오톡 알림 (선택)</strong>
                  <p>같은 시간에 카카오톡으로 질문 알림을 받아 빠르게 확인하세요.</p>
                </li>
              </ul>
            </section>
            <section>
              <h3>오늘의 채용 공고</h3>
              <ul className="landing__modal-board">
                {boardPosts.map((post) => (
                  <li key={post.company}>
                    <strong>{post.company}</strong>
                    <span>{post.role}</span>
                    <small>{post.tag}</small>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ),
      },
    }),
    [],
  )

  const activeModalMeta = activeModal ? modalMeta[activeModal] : null

  const closeModal = () => setActiveModal(null)
  const openModal = (type) => setActiveModal(type)

  return (
    <div className="landing">
      <Motion.section
        className="landing__hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="landing__hero-copy">
          <span className="landing__pre"># PrePair · 프리페어</span>
          <h1>
            완벽한 면접 준비를 위한
            <br />
            AI 파트너, <span>PrePair</span>
          </h1>
          <p>
            Prepare + Pair. AI와 짝을 이루어 내 면접 루틴을 설계하세요. 회원가입만 하면 직업 맞춤 질문이 메일로 도착하고,
            답변·피드백·리워드가 하나의 흐름으로 이어집니다.
          </p>

            <ul className="landing__hero-points">
              {featureHighlights.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>

            <div className="landing__cta">
              <Link to="/auth?mode=signup" className="cta-button cta-button--primary">
                지금 프리페어 시작하기
              </Link>
              <Link to="/auth?mode=login" className="cta-button cta-button--ghost">
                이미 계정이 있어요
              </Link>
            </div>

            {isMobile && (
              <button type="button" className="landing__hero-inline" onClick={() => openModal('features')}>
                핵심 기능 한 눈에 보기
              </button>
            )}
          </div>

          {!isMobile && (
            <Motion.aside
              className="landing__hero-card"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              <div className="hero-card__header">
                <span>오늘의 채용 공고</span>
                <Link to="/auth?mode=signup">더 보기</Link>
              </div>
              <ul className="hero-card__board">
                {boardPosts.map((post) => (
                  <li key={post.company}>
                    <strong>{post.company}</strong>
                    <span>{post.role}</span>
                    <small>{post.tag}</small>
                  </li>
                ))}
              </ul>

              <div className="hero-card__deliver">
                <header>
                  <span>다음 발송 루틴</span>
                  <strong>월~금 오전 11시 메일 발송</strong>
                  <p>가입 즉시 첫 질문을 보내드리고, 알림은 기본적으로 메일로 나가요.</p>
                </header>
                <div className="hero-card__channels">
                  <span className="pill is-active">메일 (기본)</span>
                  <span className="pill">카카오톡 알림 (선택)</span>
                </div>
                <footer>
                  <p>AI가 직업군에 맞는 질문 JSON을 생성해 사용자별 DB로 저장합니다.</p>
                  <span>답변하러 가기 → PrePair 웹으로 콜백</span>
                </footer>
              </div>
            </Motion.aside>
          )}
        </Motion.section>

        <section className="landing__summary" aria-label="주요 기능 요약">
          <header>
            <span className="tag">Control Center</span>
            <h2>긴 스크롤 대신, 기능별 카드를 눌러 필요한 정보만 열람하세요.</h2>
            <p>가입 여정, 직업군, 질문 루틴 등 같은 기능끼리 묶어 두어 모달에서 즉시 확인할 수 있습니다.</p>
          </header>
          <div className="landing__info-grid">
            {infoCards.map((card) => (
              <button
                key={card.key}
                type="button"
                className="landing__info-card"
                onClick={() => openModal(card.key)}
              >
                <span className="landing__info-chip">
                  <span aria-hidden="true">{card.icon}</span>
                  {card.badge}
                </span>
                <strong>{card.title}</strong>
                <p>{card.description}</p>
                <span className="landing__info-link">전체 보기</span>
              </button>
            ))}
          </div>
        </section>

        <section className="landing__closing">
          <div>
            <h2>AI 피드백과 리워드로 연결되는 면접 루틴을 지금 시작하세요.</h2>
            <p>
              가입 후 나의 리워드 페이지에서 질문 주기를 언제든 수정하고, 받은 질문과 점수를 모두 다시 열람할 수 있습니다.
            </p>
          </div>
          <div className="landing__cta landing__cta--closing">
            <Link to="/auth?mode=signup" className="cta-button cta-button--primary">
              PrePair 무료 체험
            </Link>
            <Link to="/auth?mode=login" className="cta-button cta-button--ghost">
              로그인하고 리워드 확인
            </Link>
          </div>
        </section>

        {activeModalMeta && (
          <Modal
            open
            title={activeModalMeta.title}
            onClose={closeModal}
            size={activeModalMeta.size}
            footer={
              <Link to="/auth?mode=signup" className="cta-button cta-button--primary">
                지금 PrePair 시작하기
              </Link>
            }
          >
            {activeModalMeta.render()}
          </Modal>
        )}
      </div>
    )
  }
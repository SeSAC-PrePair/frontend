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
              <button type="button" className="landing__hero-inline" onClick={() => openModal('cadence')}>
                알림 루틴 전체 보기
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

        {isMobile && (
          <section className="landing__mobile-panels" aria-label="핵심 안내 빠른 보기">
            <button type="button" className="landing__mobile-card" onClick={() => openModal('features')}>
              <strong>핵심 기능</strong>
              <span>맞춤 질문과 리워드 흐름 요약</span>
            </button>
            <button type="button" className="landing__mobile-card" onClick={() => openModal('onboarding')}>
              <strong>가입 여정</strong>
              <span>가입부터 첫 질문 도착까지 4단계</span>
            </button>
            <button type="button" className="landing__mobile-card" onClick={() => openModal('jobs')}>
              <strong>직업군 추천</strong>
              <span>직무 클러스터와 추천 직업 묶음</span>
            </button>
            <button type="button" className="landing__mobile-card" onClick={() => openModal('cadence')}>
              <strong>알림 루틴</strong>
              <span>발송 시간 · 채널 · 채용 공고를 한 번에</span>
            </button>
          </section>
        )}

        <section className="landing__process landing__desktop-section">
        <header>
          <span className="tag">Onboarding Journey</span>
          <h2>회원가입부터 첫 질문 발송까지, 4단계</h2>
        </header>
        <div className="landing__process-grid">
          {processSteps.map((step) => (
            <article key={step.label}>
              <strong>{step.label}</strong>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

        <section className="landing__jobs landing__desktop-section">
        <header>
          <span className="tag">Career Tracks</span>
          <h2>직업군 버튼을 선택하면, 세부 직무까지 안내합니다.</h2>
          <p>가입 후 직업 버튼을 눌러 분야를 선택하고, 필요하면 기타 칸에 원하는 목표를 직접 입력하세요.</p>
        </header>
        <div className="landing__job-grid">
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
      </section>

        <section className="landing__cadence landing__desktop-section">
        <div className="landing__cadence-copy">
          <span className="tag">Question Cadence</span>
          <h2>빈도를 고르면, 정해진 시간에 알림이 도착합니다.</h2>
          <p>
            메일 발송은 기본 옵션이에요. 카카오톡 알림을 켜면 메일과 동시에 톡으로도 질문을 받아볼 수 있어요.
            <br />
            시간은 고정되어 있어 루틴을 쉽게 만들 수 있습니다.
          </p>
        </div>

        <div className="landing__cadence-cards">
          <div className="cadence-card">
            <strong>매일 1회 받기</strong>
            <span>월~금 매일 오전 11시, 메일 발송</span>
            <p>웨이크업 루틴처럼 꾸준한 연습이 필요할 때 추천해요.</p>
          </div>
          <div className="cadence-card">
            <strong>일주일에 1회 받기</strong>
            <span>매주 월요일 오전 11시, 메일 발송</span>
            <p>길게 작성하고 깊이 돌아보고 싶은 분에게 적합해요.</p>
          </div>
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

import { motion as Motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal'
import '../styles/pages/Landing.css'

const heroHighlights = ['직무별 인터뷰 질문 1,200+개', 'AI 피드백 요약과 포인트 적립', '메일 · 카카오톡 동시 발송']

const heroStats = [
  { label: '답변한 질문', value: '12개', caption: '최근 2주간 기록' },
  { label: '평균 점수', value: '78점', caption: 'AI 피드백 기준' },
  { label: '연속 일수', value: '5일', caption: '오늘도 루틴 성공' },
]

const activityWeeks = [
  [0, 1, 1, 0, 0, 2, 1],
  [0, 2, 3, 1, 0, 2, 0],
  [1, 2, 2, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 2, 2, 2, 1, 2, 1],
  [0, 2, 3, 2, 2, 1, 0],
  [0, 0, 1, 0, 0, 1, 0],
  [0, 2, 2, 1, 1, 2, 1],
  [0, 3, 3, 2, 1, 2, 1],
  [0, 1, 1, 0, 0, 1, 0],
  [0, 2, 2, 1, 1, 0, 0],
  [0, 1, 1, 0, 0, 1, 0],
]

const featureTiles = [
  {
    badge: 'Routine',
    title: '월~금 오전 11시 정기 발송',
    description: '팀의 아침 스탠드업처럼 매일 같은 시간에 질문이 도착합니다.',
  },
  {
    badge: 'Coach',
    title: '답변 스크립트 & 코칭',
    description: 'AI가 포인트를 짚어주고, 다시 쓰기를 위한 샘플을 제안해요.',
  },
  {
    badge: 'Rewards',
    title: '포인트 → 실물 리워드',
    description: '답변으로 얻게 된 점수는 편의점 · 카페 쿠폰으로 전환됩니다.',
  },
  {
    badge: 'Insights',
    title: '활동 잔디와 연속 알림',
    description: '12주간 루틴을 잔디로 시각화해 꾸준함을 바로 확인할 수 있어요.',
  },
]

const subscribeTracks = [
  { id: 'frontend', label: '프론트엔드' },
  { id: 'backend', label: '백엔드' },
  { id: 'product', label: '기획 · PM' },
]

const cadenceOptions = [
  { id: 'daily', label: '주 5회', description: '월-금 오전 11시' },
  { id: 'weekly', label: '주 1회', description: '월요일 오전 11시' },
]

export default function LandingPage() {
  const [isSubscribeOpen, setSubscribeOpen] = useState(false)
  const [selectedTracks, setSelectedTracks] = useState(['frontend'])
  const [selectedCadence, setSelectedCadence] = useState('daily')
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState('idle')

  const toggleTrack = (trackId) => {
    setSelectedTracks((prev) =>
      prev.includes(trackId) ? prev.filter((item) => item !== trackId) : [...prev, trackId],
    )
  }

  const isFormValid = email.includes('@') && selectedTracks.length > 0

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!isFormValid) return

    setFormState('success')
  }

  const closeModal = () => {
    setSubscribeOpen(false)
    setFormState('idle')
  }

  return (
    <div className="landing landing--refresh">
      <section className="landing-hero">
        <div className="landing-hero__copy">
          <span className="hero-label">Maeil Mail for Tech</span>
          <h1>
            매일 11시, 기술 면접 감각을 깨우는
            <br />
            한 통의 질문
          </h1>
          <p>
            긴 스크롤 없이 핵심만 정리된 대시보드로 질문·답변·리워드를 한눈에 확인하세요. 가입 전이라도 무료 구독을 신청하면
            샘플 질문이 바로 이메일로 도착합니다.
          </p>
          <div className="hero-actions">
            <button type="button" className="cta-button cta-button--primary" onClick={() => setSubscribeOpen(true)}>
              무료 구독 신청
            </button>
            <Link to="/auth?mode=signup" className="cta-button cta-button--ghost">
              서비스 가입하고 시작
            </Link>
          </div>
          <ul className="hero-highlights">
            {heroHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <Motion.div
          className="landing-hero__card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="reward-panel">
            <header>
              <div>
                <span>나의 리워드</span>
                <p>열심히 노력한 당신, 축하해요! 🎉</p>
              </div>
              <span className="reward-panel__badge">5일 연속</span>
            </header>
            <div className="reward-panel__points">
              <div>
                <small>누적 포인트</small>
                <strong>234</strong>
              </div>
              <div className="reward-panel__progress">
                <span style={{ width: '72%' }} />
              </div>
              <p>다음 리워드까지 66점 남음</p>
            </div>
            <div className="reward-panel__meta">
              <span>마지막 답변 · 어제 오후 8:12</span>
              <span>다음 발송 · 내일 오전 11:00</span>
            </div>
          </div>
        </Motion.div>
      </section>

      <section className="landing-metrics">
        {heroStats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.caption}</p>
          </article>
        ))}
      </section>

      <section className="landing-activity">
        <article className="activity-card">
          <header>
            <div>
              <span className="tag">활동 잔디</span>
              <h2>최근 12주간 답변 기록</h2>
            </div>
            <Link to="/rewards" className="activity-link">
              리워드 페이지 보기
            </Link>
          </header>
          <div className="activity-heatmap" role="img" aria-label="최근 12주간 활동 잔디">
            {activityWeeks.map((week, weekIndex) => (
              <div key={`week-${weekIndex}`} className="activity-week">
                {week.map((level, dayIndex) => (
                  <span key={`day-${weekIndex}-${dayIndex}`} className={`activity-dot activity-dot--${level}`} />
                ))}
              </div>
            ))}
          </div>
          <footer>
            <div className="activity-legend">
              <span>적음</span>
              <div>
                {[0, 1, 2, 3].map((level) => (
                  <span key={level} className={`activity-dot activity-dot--${level}`} />
                ))}
              </div>
              <span>많음</span>
            </div>
            <p>🔥 지금 5일 연속 답변 중 · 최장 연속 7일</p>
          </footer>
        </article>

        <div className="activity-side">
          <div className="streak-card">
            <span>다음 질문까지 남은 시간</span>
            <strong>11시간 12분</strong>
            <p>메일과 카카오톡으로 동시에 도착합니다.</p>
          </div>
          <div className="streak-card streak-card--muted">
            <span>추천 루틴</span>
            <strong>주 5회 · 오전 11시</strong>
            <p>시간을 바꾸고 싶다면 언제든 설정에서 수정할 수 있어요.</p>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <header>
          <p className="tag">One glance dashboard</p>
          <h2>클라이언트가 원하는 초기 페이지 톤앤매너를 그대로 옮겼어요.</h2>
          <p>질문 확인, 답변 예약, 리워드 현황까지 상단 카드만으로 파악할 수 있게 구성했습니다.</p>
        </header>
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

      <section className="landing-cta">
        <div>
          <h2>바쁜 팀을 위해 만든 인터뷰 루틴 메일링</h2>
          <p>무료 구독으로 시작한 뒤, 마음에 든다면 계정을 만들어 리워드와 코칭 기능을 활성화하세요.</p>
        </div>
        <div className="landing-cta__actions">
          <button type="button" className="cta-button cta-button--primary" onClick={() => setSubscribeOpen(true)}>
            구독 신청
          </button>
          <Link to="/auth?mode=login" className="cta-button cta-button--ghost">
            로그인하고 계속하기
          </Link>
        </div>
      </section>

      {isSubscribeOpen && (
        <Modal open title="매일메일 구독" size="sm" onClose={closeModal}>
          <form className="landing__subscribe-form" onSubmit={handleSubmit}>
            <fieldset>
              <legend>
                분야 <span>*중복 선택 가능</span>
              </legend>
              <div className="subscribe-options">
                {subscribeTracks.map((track) => {
                  const checked = selectedTracks.includes(track.id)
                  return (
                    <label key={track.id} className={`subscribe-check ${checked ? 'is-checked' : ''}`}>
                      <input
                        type="checkbox"
                        value={track.id}
                        checked={checked}
                        onChange={() => toggleTrack(track.id)}
                      />
                      <span>{track.label}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend>수신 빈도</legend>
              <div className="subscribe-options subscribe-options--inline">
                {cadenceOptions.map((option) => {
                  const selected = selectedCadence === option.id
                  return (
                    <label key={option.id} className={`subscribe-radio ${selected ? 'is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="cadence"
                        value={option.id}
                        checked={selected}
                        onChange={() => setSelectedCadence(option.id)}
                      />
                      <div>
                        <strong>{option.label}</strong>
                        <span>{option.description}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <label className="subscribe-field">
              이메일
              <input
                type="email"
                placeholder="johndoe@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <button type="submit" className="cta-button cta-button--primary" disabled={!isFormValid}>
              확인
            </button>
            {formState === 'success' && <p className="subscribe-success">웰컴 메일이 곧 도착합니다.</p>}
          </form>
        </Modal>
      )}
    </div>
  )
}
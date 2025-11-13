import { useMemo, useState } from 'react'
import './index.css'
import mascot from './assets/b01fa81ce7a959934e8f78fc6344081972afd0ae.png'

const stepDescriptors = [
  { id: 'auth', label: '가입', description: '이메일로 회원가입 또는 로그인' },
  { id: 'role', label: '관심 분야', description: '맞춤 질문을 위한 직업 선택' },
  { id: 'question', label: '답변 작성', description: 'AI가 제시한 질문에 답변' },
  { id: 'analysis', label: 'AI 분석', description: '점수와 피드백 확인' },
  { id: 'rewards', label: '리워드', description: '누적 포인트와 활동 기록' },
]

const newsletterTopics = [
  { id: 'frontend', label: '프론트엔드' },
  { id: 'backend', label: '백엔드' },
  { id: 'design', label: '디자인' },
  { id: 'product', label: '프로덕트' },
]

const newsletterFrequency = [
  { id: 'five', label: '주 5회', detail: '월-금' },
  { id: 'one', label: '주 1회', detail: '월요일' },
]

const roleOptions = [
  {
    id: 'developer',
    name: '개발자',
    icon: '👩‍💻',
    summary: '실무형 기술 질문과 코드 리뷰 시나리오',
  },
  {
    id: 'designer',
    name: '디자이너',
    icon: '🎨',
    summary: 'UI/UX 리서치와 비주얼 커뮤니케이션 질문',
  },
  {
    id: 'marketer',
    name: '마케터',
    icon: '📈',
    summary: '퍼포먼스, 브랜드 전략 질문과 분석 피드백',
  },
  {
    id: 'planner',
    name: '기획자',
    icon: '💡',
    summary: '문제 정의와 서비스 설계 인사이트 질문',
  },
  {
    id: 'pm',
    name: '기타',
    icon: '🎁',
    summary: '다른 직무도 AI가 질문을 큐레이션합니다',
  },
]

const interviewPrompt = {
  question: '데이터베이스에서 트랜잭션 격리 수준(Isolation Level)이란 무엇이며, 각 수준의 차이점을 설명해주세요.',
  description: '자유롭게 답변을 작성해주세요. AI가 피드백을 드릴게요!',
  tip: 'Tip: 구체적인 예시를 들어 설명하면 더 좋은 점수를 받을 수 있어요',
}

const analysisResult = {
  score: 78,
  positives: '트랜잭션 격리 수준의 개념을 정확하게 이해하고 계시네요. 각 레벨의 특징을 잘 설명하셨습니다.',
  improvements:
    '실제 사용 사례나 각 격리 수준을 선택하는 기준에 대한 설명을 추가하면 더 완벽한 답변이 될 것 같아요.',
  studies: ['MVCC (Multi-Version Concurrency Control)', 'Dirty Read', 'Phantom Read'],
  points: 78,
}

const rewardSnapshot = {
  totalPoints: 234,
  nextRewardGap: 66,
  metrics: [
    { label: '답변한 질문', value: '12개' },
    { label: '평균 점수', value: '78점' },
    { label: '연속 일수', value: '5일' },
  ],
}

const activityHeatmap = Array.from({ length: 12 }, (_, weekIndex) =>
  Array.from({ length: 7 }, (__, dayIndex) => {
    const base = (weekIndex + 1) * (dayIndex + 1)
    if (base % 5 === 0) return 0
    if (base % 3 === 0) return 2
    if (base % 2 === 0) return 1
    return 3
  }),
)

function Stepper({ current }) {
  return (
    <ol className="stepper" aria-label="온보딩 단계">
      {stepDescriptors.map((step, index) => {
        const state = index === current ? 'current' : index < current ? 'done' : 'todo'
        return (
          <li key={step.id} className={`stepper__item stepper__item--${state}`}>
            <span className="stepper__dot">
              <span>{index + 1}</span>
            </span>
            <div>
              <strong>{step.label}</strong>
              <small>{step.description}</small>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [authMode, setAuthMode] = useState('signup')
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [newsletterOpen, setNewsletterOpen] = useState(false)
  const [newsletterSelection, setNewsletterSelection] = useState({
    topics: ['frontend'],
    frequency: 'five',
  })
  const [selectedRole, setSelectedRole] = useState('developer')
  const [answer, setAnswer] = useState('')

  const currentDescriptor = stepDescriptors[currentStep]

  const canSubmitAuth = useMemo(() => {
    const emailValid = /\S+@\S+\.\S+/.test(authForm.email)
    const passwordValid = authForm.password.trim().length >= 6
    return emailValid && passwordValid
  }, [authForm])

  const canGoRole = Boolean(selectedRole)
  const canSubmitAnswer = answer.trim().length >= 40

  const handleNewsletterTopic = (topicId) => {
    setNewsletterSelection((prev) => {
      const already = prev.topics.includes(topicId)
      const topics = already ? prev.topics.filter((id) => id !== topicId) : [...prev.topics, topicId]
      return { ...prev, topics }
    })
  }

  const handleAuthSubmit = (event) => {
    event.preventDefault()
    if (!canSubmitAuth) return
    setCurrentStep(1)
  }

  const handleAnswerSubmit = () => {
    if (!canSubmitAnswer) return
    setCurrentStep(3)
  }

  const handleGoRewards = () => setCurrentStep(4)
  const handleGoBack = () => setCurrentStep((prev) => Math.max(0, prev - 1))

  const heatmapCounts = useMemo(() => {
    const flatten = activityHeatmap.flat()
    const max = Math.max(...flatten)
    const min = Math.min(...flatten)
    return { max, min }
  }, [])

  return (
    <div className="app">
      <div className="background" aria-hidden="true" />

      <header className="top-bar">
        <div className="brand">
          <div className="brand-avatar">
            <img src={mascot} alt="CareerBot 마스코트" />
          </div>
          <div className="brand-meta">
            <strong>CareerBot</strong>
            <span>당신의 AI 면접 도우미</span>
          </div>
        </div>

        <div className="top-actions">
          <button type="button" className="link-button" onClick={() => setNewsletterOpen(true)}>
            메일매일 구독
          </button>
          <span className="beta-badge">Beta</span>
        </div>
      </header>

      <main className="main">
        <Stepper current={currentStep} />

        <section className="card-shell" aria-labelledby="active-step-heading">
          <header className="card-heading">
            <h1 id="active-step-heading">{currentDescriptor.label}</h1>
            <p>{currentDescriptor.description}</p>
          </header>

          {currentStep === 0 && (
            <div className="auth-card">
              <div className="auth-intro">
                <div className="auth-avatar">
                  <img src={mascot} alt="CareerBot" />
                </div>
                <h2>CareerBot</h2>
                <p>AI가 개인 맞춤 면접 질문과 피드백을 매일 제공합니다.</p>
              </div>
              <form className="auth-form" onSubmit={handleAuthSubmit}>
                <label className="form-field">
                  <span>이메일</span>
                  <div className="input">
                    <span aria-hidden="true">📧</span>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={authForm.email}
                      onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))}
                      required
                    />
                  </div>
                </label>

                <label className="form-field">
                  <span>비밀번호</span>
                  <div className="input">
                    <span aria-hidden="true">🔒</span>
                    <input
                      type="password"
                      placeholder="6자 이상 입력"
                      value={authForm.password}
                      onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
                      required
                    />
                  </div>
                </label>

                <button className="primary-button" type="submit" disabled={!canSubmitAuth}>
                  {authMode === 'signup' ? '회원가입' : '로그인'}
                </button>
              </form>
              <p className="auth-footnote">
                {authMode === 'signup' ? '이미 계정이 있나요?' : '처음 방문하셨나요?'}{' '}
                <button
                  type="button"
                  className="link-inline"
                  onClick={() => setAuthMode((prev) => (prev === 'signup' ? 'login' : 'signup'))}
                >
                  {authMode === 'signup' ? '로그인' : '회원가입'}
                </button>
              </p>
            </div>
          )}

          {currentStep === 1 && (
            <div className="role-step">
              <header className="role-intro">
                <h2>당신의 직업 또는 관심 분야를 선택하세요</h2>
                <p>맞춤형 면접 질문을 준비해드릴게요.</p>
              </header>

              <div className="role-grid">
                {roleOptions.map((role) => {
                  const isActive = selectedRole === role.id
                  return (
                    <button
                      key={role.id}
                      type="button"
                      className={`role-card ${isActive ? 'is-active' : ''}`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <span className="role-icon" aria-hidden="true">
                        {role.icon}
                      </span>
                      <strong>{role.name}</strong>
                      <small>{role.summary}</small>
                    </button>
                  )
                })}
              </div>

              <div className="step-actions">
                <button type="button" className="ghost-button" onClick={handleGoBack}>
                  이전 단계
                </button>
                <button
                  type="button"
                  className="primary-button"
                  disabled={!canGoRole}
                  onClick={() => setCurrentStep(2)}
                >
                  다음으로
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="question-step">
              <header className="question-header">
                <span className="question-badge">오늘의 질문</span>
                <h2>{interviewPrompt.question}</h2>
                <p>{interviewPrompt.description}</p>
              </header>

              <label className="answer-area">
                <span className="visually-hidden">답변 작성</span>
                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="격리 수준 네 가지를 각각 설명하고, 프로젝트에서 어떤 상황에 적용했는지를 적어보세요."
                />
                <span className="answer-counter">{answer.trim().length} 글자</span>
              </label>

              <p className="question-tip">{interviewPrompt.tip}</p>

              <div className="step-actions">
                <button type="button" className="ghost-button" onClick={handleGoBack}>
                  이전 단계
                </button>
                <button type="button" className="primary-button" disabled={!canSubmitAnswer} onClick={handleAnswerSubmit}>
                  답변 제출하기
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="analysis-step">
              <div className="analysis-score">
                <span className="analysis-label">분석 완료!</span>
                <strong className="analysis-score__value">{analysisResult.score}</strong>
                <span className="analysis-score__unit">점</span>
              </div>

              <div className="analysis-block">
                <h3>AI 피드백</h3>
                <p>{analysisResult.positives}</p>
              </div>

              <div className="analysis-block analysis-block--warning">
                <h3>개선할 점</h3>
                <p>{analysisResult.improvements}</p>
              </div>

              <div className="analysis-block analysis-block--recommend">
                <h3>추천 학습</h3>
                <ul>
                  {analysisResult.studies.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="points-tile">
                <span className="points-label">획득한 포인트</span>
                <strong>+{analysisResult.points}</strong>
              </div>

              <div className="step-actions">
                <button type="button" className="ghost-button" onClick={handleGoBack}>
                  다시 작성하기
                </button>
                <button type="button" className="primary-button" onClick={handleGoRewards}>
                  리워드 보러 가기
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="rewards-step">
              <header className="reward-hero">
                <div>
                  <h2>나의 리워드</h2>
                  <p>열심히 노력한 당신, 축하해요! 🎉</p>
                </div>
                <div className="reward-score">
                  <strong>{rewardSnapshot.totalPoints}</strong>
                  <span>누적 포인트</span>
                  <small>다음 리워드까지 {rewardSnapshot.nextRewardGap}점 남음</small>
                </div>
              </header>

              <div className="reward-metrics">
                {rewardSnapshot.metrics.map((metric) => (
                  <article className="metric-card" key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </article>
                ))}
              </div>

              <section className="heatmap">
                <div className="heatmap-header">
                  <h3>나의 활동</h3>
                  <span>최근 12주간 답변 기록</span>
                </div>
                <div className="heatmap-grid" role="grid">
                  {activityHeatmap.map((week, weekIndex) => (
                    <div key={weekIndex} className="heatmap-column" role="row">
                      {week.map((value, dayIndex) => {
                        const intensity =
                          heatmapCounts.max === heatmapCounts.min
                            ? 3
                            : Math.round((value / heatmapCounts.max) * 3)
                        return (
                          <span
                            key={`${weekIndex}-${dayIndex}`}
                            className={`heatmap-cell heatmap-cell--${intensity}`}
                            role="gridcell"
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
                <footer className="heatmap-footer">
                  <span>적음</span>
                  <div className="heatmap-legend">
                    <span className="heatmap-cell heatmap-cell--0" />
                    <span className="heatmap-cell heatmap-cell--1" />
                    <span className="heatmap-cell heatmap-cell--2" />
                    <span className="heatmap-cell heatmap-cell--3" />
                  </div>
                  <span>많음</span>
                </footer>
              </section>

              <div className="step-actions">
                <button type="button" className="ghost-button" onClick={() => setCurrentStep(1)}>
                  분야 다시 선택
                </button>
                <button type="button" className="primary-button" onClick={() => setCurrentStep(0)}>
                  홈으로
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <small>© {new Date().getFullYear()} CareerBot. AI Interview Coach Beta.</small>
      </footer>

      {newsletterOpen && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="newsletter-heading">
          <div className="modal__backdrop" onClick={() => setNewsletterOpen(false)} />
          <div className="modal__content">
            <header className="modal__header">
              <h2 id="newsletter-heading">메일매일 구독</h2>
              <button type="button" aria-label="닫기" onClick={() => setNewsletterOpen(false)}>
                ✕
              </button>
            </header>

            <div className="modal__body">
              <section className="modal-block">
                <header>
                  <h3>분야</h3>
                  <span>*중복 선택 가능</span>
                </header>
                <div className="checkbox-grid">
                  {newsletterTopics.map((topic) => {
                    const checked = newsletterSelection.topics.includes(topic.id)
                    return (
                      <label key={topic.id} className={`checkbox ${checked ? 'is-checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleNewsletterTopic(topic.id)}
                        />
                        <span>{topic.label}</span>
                      </label>
                    )
                  })}
                </div>
              </section>

              <section className="modal-block">
                <header>
                  <h3>수신 빈도</h3>
                </header>
                <div className="radio-grid">
                  {newsletterFrequency.map((option) => {
                    const checked = newsletterSelection.frequency === option.id
                    return (
                      <label key={option.id} className={`radio ${checked ? 'is-checked' : ''}`}>
                        <input
                          type="radio"
                          name="newsletter-frequency"
                          value={option.id}
                          checked={checked}
                          onChange={() => setNewsletterSelection((prev) => ({ ...prev, frequency: option.id }))}
                        />
                        <span>{option.label}</span>
                        <small>{option.detail}</small>
                      </label>
                    )
                  })}
                </div>
              </section>

              <label className="form-field modal-field">
                <span>이메일</span>
                <input type="email" placeholder="johndoe@gmail.com" />
              </label>
            </div>

            <footer className="modal__footer">
              <button type="button" className="primary-button" onClick={() => setNewsletterOpen(false)}>
                확인
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}

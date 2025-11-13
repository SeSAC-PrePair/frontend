import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import '../styles/pages/Auth.css'

const desiredFields = ['프론트엔드', '백엔드', 'PM', '데이터', '디자인', '마케팅']

const questionCadenceOptions = [
  { id: 'daily', label: '매일 (주 5회)', detail: '짧은 루틴으로 매일 한 문제씩' },
  { id: 'semi', label: '격일 (주 3회)', detail: '복습 시간을 포함한 균형 루틴' },
  { id: 'weekly', label: '주 1회 집중', detail: '긴 답변과 딥다이브에 최적화' },
]

const focusAreas = ['프로덕트 전략', '시스템 설계', 'AI 서비스', '사용자 경험', '데이터 분석']

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function AuthPage() {
  const [mode, setMode] = useState('signup')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    desiredField: desiredFields[0],
    focusArea: focusAreas[0],
    goal: '',
    questionCadence: 'daily',
  })

  const navigate = useNavigate()
  const location = useLocation()
  const { user, login, signup } = useAppState()

  useEffect(() => {
    if (user) {
      navigate('/coach', { replace: true })
    }
  }, [navigate, user])

  const loginDisabled = useMemo(() => {
    return !/\S+@\S+\.\S+/.test(loginForm.email) || loginForm.password.trim().length < 6
  }, [loginForm])

  const signupDisabled = useMemo(() => {
    return (
      !/\S+@\S+\.\S+/.test(signupForm.email) ||
      signupForm.password.trim().length < 6 ||
      signupForm.goal.trim().length < 10 ||
      signupForm.name.trim().length < 2
    )
  }, [signupForm])

  const handleLogin = (event) => {
    event.preventDefault()
    if (loginDisabled) return
    login({ email: loginForm.email })
    const redirect = location.state?.from || '/coach'
    navigate(redirect, { replace: true })
  }

  const handleSignup = (event) => {
    event.preventDefault()
    if (signupDisabled) return
    const cadenceLabel = questionCadenceOptions.find((item) => item.id === signupForm.questionCadence)?.label
    signup({
      ...signupForm,
      questionCadenceLabel: cadenceLabel,
    })
    navigate('/coach', { replace: true })
  }

  const activeForm = mode === 'signup'

  return (
    <div className="auth">
      <motion.section className="auth__intro" variants={cardVariants} initial="hidden" animate="visible">
        <span className="tag">Personalized Onboarding</span>
        <h1>
          당신의 목표와 루틴을
          <br />
          알려주세요.
        </h1>
        <p>
          인터뷰 Orbit이 AI 코칭 강도를 맞추고, 잔디처럼 루틴을 기록하며, 포인트를 정산해 드릴게요. 모의 면접보다
          가볍게, 실전보다 실전답게.
        </p>
        <dl className="auth__summary">
          <div>
            <dt>맞춤 질문</dt>
            <dd>직무·목표 기반 큐레이션</dd>
          </div>
          <div>
            <dt>피드백 룰</dt>
            <dd>구조/명료/깊이/스토리</dd>
          </div>
          <div>
            <dt>리워드 샵</dt>
            <dd>커피 · 도서 · 크레딧 교환</dd>
          </div>
        </dl>
      </motion.section>

      <motion.section className="auth__form-card" variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.12 }}>
        <div className="auth__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeForm}
            className={`auth__tab ${activeForm ? 'is-active' : ''}`}
            onClick={() => setMode('signup')}
          >
            회원가입
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!activeForm}
            className={`auth__tab ${!activeForm ? 'is-active' : ''}`}
            onClick={() => setMode('login')}
          >
            로그인
          </button>
        </div>

        {activeForm ? (
          <form className="form" onSubmit={handleSignup}>
            <label className="form__field">
              <span>이름</span>
              <input
                type="text"
                placeholder="홍길동"
                value={signupForm.name}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </label>

            <label className="form__field">
              <span>이메일</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={signupForm.email}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </label>

            <label className="form__field">
              <span>비밀번호</span>
              <input
                type="password"
                placeholder="6자 이상 입력"
                value={signupForm.password}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </label>

            <div className="form__field form__field--split">
              <label>
                <span>희망 분야</span>
                <select
                  value={signupForm.desiredField}
                  onChange={(event) => setSignupForm((prev) => ({ ...prev, desiredField: event.target.value }))}
                >
                  {desiredFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>집중 영역</span>
                <select
                  value={signupForm.focusArea}
                  onChange={(event) => setSignupForm((prev) => ({ ...prev, focusArea: event.target.value }))}
                >
                  {focusAreas.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="form__field">
              <span>면접 목표</span>
              <textarea
                placeholder="내년 상반기 시리즈B 스타트업 프론트엔드 포지션 합격"
                value={signupForm.goal}
                onChange={(event) => setSignupForm((prev) => ({ ...prev, goal: event.target.value }))}
              />
            </label>

            <fieldset className="form__fieldset">
              <legend>질문 빈도</legend>
              <div className="form__radio-grid">
                {questionCadenceOptions.map((option) => {
                  const checked = signupForm.questionCadence === option.id
                  return (
                    <label key={option.id} className={`radio-tile ${checked ? 'is-checked' : ''}`}>
                      <input
                        type="radio"
                        name="question-cadence"
                        value={option.id}
                        checked={checked}
                        onChange={() => setSignupForm((prev) => ({ ...prev, questionCadence: option.id }))}
                      />
                      <div>
                        <strong>{option.label}</strong>
                        <span>{option.detail}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <button type="submit" className="cta-button cta-button--primary" disabled={signupDisabled}>
              회원가입 완료
            </button>
          </form>
        ) : (
          <form className="form" onSubmit={handleLogin}>
            <label className="form__field">
              <span>이메일</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </label>

            <label className="form__field">
              <span>비밀번호</span>
              <input
                type="password"
                placeholder="비밀번호"
                value={loginForm.password}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </label>

            <button type="submit" className="cta-button cta-button--primary" disabled={loginDisabled}>
              로그인
            </button>
          </form>
        )}
      </motion.section>
    </div>
  )
}

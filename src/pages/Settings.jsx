import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAppState } from '../context/AppStateContext'

const questionCadenceOptions = [
  { id: 'daily', label: '매일 (주 5회)', detail: '매일 아침 1문제', suggestion: '꾸준한 루틴이 필요할 때 추천' },
  { id: 'semi', label: '격일 (주 3회)', detail: '월·수·금', suggestion: '복습과 휴식의 밸런스' },
  { id: 'weekly', label: '주 1회 집중', detail: '일요일 심화 세션', suggestion: '장문의 답변과 회고에 최적' },
]

const focusAreas = ['프로덕트 전략', '시스템 설계', 'AI 서비스', '사용자 경험', '데이터 분석', '테크 리더십']

export default function SettingsPage() {
  const { user, updateSettings } = useAppState()
  const [form, setForm] = useState({
    goal: user?.goal ?? '',
    focusArea: user?.focusArea ?? focusAreas[0],
    questionCadence: user?.questionCadence ?? 'daily',
  })
  const [status, setStatus] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const cadenceMeta = questionCadenceOptions.find((item) => item.id === form.questionCadence)
    updateSettings({
      goal: form.goal,
      focusArea: form.focusArea,
      questionCadence: form.questionCadence,
      questionCadenceLabel: cadenceMeta?.label,
    })
    setStatus('저장되었습니다!')
    setTimeout(() => setStatus(''), 2400)
  }

  return (
    <div className="settings">
      <header className="settings__header">
        <div>
          <span className="tag">Personal Control Center</span>
          <h1>개인 설정</h1>
          <p>목표와 루틴을 조정하면 AI 코치가 난이도, 질문 스타일, 리워드 제안을 맞춰 드립니다.</p>
        </div>
        <motion.div className="settings__card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span>현재 잔여 포인트</span>
          <strong>{user?.points.toLocaleString()} pts</strong>
          <small>{user?.tier}</small>
        </motion.div>
      </header>

      <form className="settings__form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>목표</legend>
          <label className="form__field">
            <span>장기 목표</span>
            <textarea
              value={form.goal}
              onChange={(event) => setForm((prev) => ({ ...prev, goal: event.target.value }))}
              placeholder="6개월 내 글로벌 스타트업 PM 포지션 합격"
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>집중 영역</legend>
          <div className="form__select-row">
            {focusAreas.map((area) => {
              const active = form.focusArea === area
              return (
                <button
                  key={area}
                  type="button"
                  className={`pill ${active ? 'is-active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, focusArea: area }))}
                >
                  {area}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend>질문 빈도</legend>
          <div className="settings__cadence">
            {questionCadenceOptions.map((option) => {
              const checked = form.questionCadence === option.id
              return (
                <label key={option.id} className={`cadence-card ${checked ? 'is-checked' : ''}`}>
                  <input
                    type="radio"
                    name="question-cadence"
                    value={option.id}
                    checked={checked}
                    onChange={() => setForm((prev) => ({ ...prev, questionCadence: option.id }))}
                  />
                  <div>
                    <strong>{option.label}</strong>
                    <span>{option.detail}</span>
                    <small>{option.suggestion}</small>
                  </div>
                </label>
              )
            })}
          </div>
        </fieldset>

        <button type="submit" className="cta-button cta-button--primary">
          변경 사항 저장
        </button>
        {status && <p className="settings__status">{status}</p>}
      </form>
    </div>
  )
}

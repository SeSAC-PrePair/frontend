import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useAppState } from '../context/AppStateContext'
import '../styles/pages/Coach.css'

const highlightsPool = [
  '문제를 구조적으로 분해한 점',
  '데이터 기반 의사결정',
  '팀을 설득하는 커뮤니케이션',
  '실패를 통한 학습과 회고',
  '명확한 KPI 관리',
  '사용자 관점으로 바라본 인사이트',
]

const focusTagPool = ['Storytelling', 'Leadership', 'Metrics', 'Collaboration', 'Product Sense', 'Delivery']

function pickRandom(arr, count = 2) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export default function CoachPage() {
  const { user, currentQuestion, scoringRubric, lastFeedback, recordInterviewResult, scoreHistory } = useAppState()
  const [answer, setAnswer] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const minLength = 80

  const breakdownSummary = useMemo(() => {
    if (!result) return null
    const entries = Object.entries(result.breakdown)
    const top = entries.reduce(
      (acc, [id, value]) => {
        if (value > acc.value) return { id, value }
        return acc
      },
      { id: '', value: 0 },
    )
    const low = entries.reduce(
      (acc, [id, value]) => {
        if (acc.value === 0 || value < acc.value) return { id, value }
        return acc
      },
      { id: '', value: 0 },
    )
    return { top, low }
  }, [result])

  const handleEvaluate = () => {
    const trimmed = answer.trim()
    if (trimmed.length < minLength) {
      setError(`답변을 조금 더 자세히 작성해주세요. (최소 ${minLength}자)`)
      return
    }
    if (!currentQuestion) {
      setError('질문을 불러오고 있습니다. 잠시 후 다시 시도해주세요.')
      return
    }
    setError('')
    setIsEvaluating(true)

    setTimeout(() => {
      const baseScore = Math.min(98, Math.max(62, Math.round(60 + trimmed.length / 4 + Math.random() * 12)))
      const breakdown = scoringRubric.reduce((acc, item) => {
        const jitter = Math.random() * 8 - 4
        acc[item.id] = Math.min(98, Math.max(60, Math.round(baseScore * item.weight * 1.2 + jitter)))
        return acc
      }, {})
      const summary = `구체적인 사례를 중심으로 ${currentQuestion.tags?.[0] || '핵심 역량'}을 잘 드러냈어요. 숫자와 맥락이 균형 있게 포함됐습니다.`
      const highlights = pickRandom(highlightsPool, 3)
      const focusTags = pickRandom(focusTagPool, 2)

      const computed = {
        score: baseScore,
        breakdown,
        summary,
        highlights,
        focusTags,
        earnedPoints: Math.max(40, Math.round(baseScore * 0.6)),
      }

      setResult(computed)
      recordInterviewResult({
        score: computed.score,
        summary: computed.summary,
        highlights: computed.highlights,
        breakdown: computed.breakdown,
        focusTags: computed.focusTags,
        question: currentQuestion.prompt,
      })
      setIsEvaluating(false)
      setAnswer('')
    }, 900)
  }

  const latestHistory = scoreHistory.slice(0, 3)

  return (
    <div className="coach">
      <header className="coach__header">
        <div>
          <span className="tag">AI Interview Coach</span>
          <h1>
            {user?.name}님의 오늘의 인터뷰 질문
            <br />
            {currentQuestion?.role || user?.desiredField} 맞춤 큐레이션
          </h1>
        </div>
        <div className="coach__status">
          <article>
            <span>현재 목표</span>
            <strong>{user?.goal}</strong>
          </article>
          <article>
            <span>스코어</span>
            <strong>{scoreHistory[0]?.score ?? '--'}점</strong>
          </article>
          <article>
            <span>누적 포인트</span>
            <strong>{user?.points.toLocaleString()} pts</strong>
          </article>
        </div>
      </header>

      <section className="coach__grid">
        <motion.article className="coach__card coach__card--question" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="card-heading">
            <span>오늘의 질문</span>
            <div className="badges">
              {currentQuestion?.tags?.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <h2>{currentQuestion?.prompt}</h2>
          <p>{currentQuestion?.subPrompt}</p>
          <ul className="coach__tips">
            <li>도입-전개-결론 구조로 이야기해 보세요.</li>
            <li>숫자, 팀 이야기, 배운 점을 포함하면 가산점이 있어요.</li>
            <li>실패나 위기 상황이 있었다면 어떻게 회복했는지 적어보세요.</li>
          </ul>
        </motion.article>

        <motion.article className="coach__card coach__card--composer" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
          <header>
            <span>답변 작성</span>
            <small>{answer.trim().length}자 · 최소 {minLength}자</small>
          </header>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="상황(S) → 과제(T) → 행동(A) → 결과(R) 순서로 이야기해 주세요."
            rows={10}
          />
          {error && <p className="coach__error">{error}</p>}
          <button type="button" className="cta-button cta-button--primary" onClick={handleEvaluate} disabled={isEvaluating}>
            {isEvaluating ? 'AI가 분석 중...' : 'AI 피드백 받기'}
          </button>
        </motion.article>
      </section>

      <AnimatePresence>
        {result && (
          <motion.section
            className="coach__analysis"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.5 }}
          >
            <div className="analysis__score">
              <span>AI 평가</span>
              <strong>{result.score}</strong>
              <small>획득 포인트 +{result.earnedPoints}</small>
            </div>
            <div className="analysis__details">
              <div>
                <strong>피드백 요약</strong>
                <p>{result.summary}</p>
              </div>
              <div>
                <strong>하이라이트</strong>
                <ul>
                  {result.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>포커스 태그</strong>
                <div className="badge-row">
                  {result.focusTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="analysis__chart">
              <strong>룰 기반 점수</strong>
              <ul>
                {Object.entries(result.breakdown).map(([id, value]) => {
                  const rubric = scoringRubric.find((rule) => rule.id === id)
                  return (
                    <li key={id}>
                      <span>{rubric?.label}</span>
                      <div className="bar">
                        <span style={{ width: `${value}%` }}>{value}</span>
                      </div>
                    </li>
                  )
                })}
              </ul>
              {breakdownSummary && (
                <p className="analysis__insight">
                  가장 강한 영역은 <strong>{scoringRubric.find((rule) => rule.id === breakdownSummary.top.id)?.label}</strong>,
                  개선하면 좋은 영역은{' '}
                  <strong>{scoringRubric.find((rule) => rule.id === breakdownSummary.low.id)?.label}</strong> 입니다.
                </p>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="coach__rubric">
        <article>
          <h3>점수화 룰</h3>
          <p>AI가 생성한 피드백은, 우리가 정해둔 규칙으로 재평가되어 점수가 산출됩니다.</p>
          <ul>
            {scoringRubric.map((rule) => (
              <li key={rule.id}>
                <strong>
                  {rule.label} · <span>{Math.round(rule.weight * 100)}%</span>
                </strong>
                <p>{rule.rule}</p>
              </li>
            ))}
          </ul>
        </article>

        {lastFeedback && (
          <article className="coach__last">
            <h3>최근 분석 기록</h3>
            <div className="last-card">
              <span>점수</span>
              <strong>{lastFeedback.score}</strong>
              <p>{lastFeedback.summary}</p>
              <div className="badge-row">
                {lastFeedback.focusTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        )}
      </section>

      <section className="coach__history">
        <header>
          <h3>최근 답변 아카이브</h3>
          <p>AI 코치가 기록한 상위 3개의 세션</p>
        </header>
        <div className="history-grid">
          {latestHistory.map((entry) => (
            <article key={entry.id} className="history-card">
              <span>{new Date(entry.submittedAt).toLocaleDateString('ko-KR')}</span>
              <strong>{entry.question}</strong>
              <div className="history-card__meta">
                <span>{entry.score}점</span>
                <div className="badge-row">
                  {entry.focusTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <ul>
                {entry.highlights.slice(0, 2).map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

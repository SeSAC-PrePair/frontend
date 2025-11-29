import {AnimatePresence, motion as Motion} from 'framer-motion'
import {useMemo, useState, useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {useAppState} from '../context/AppStateContext'
import Modal from '../components/Modal'
import useMediaQuery from '../hooks/useMediaQuery'
import '../styles/pages/Coach.css'

const strengthsPool = [
    '구조를 선명하게 잡아서 답변이 안정적이에요.',
    '숫자와 임팩트를 함께 언급해 신뢰도가 높아요.',
    '팀과 이해관계자를 설득하는 흐름이 좋습니다.',
    '실패 경험을 솔직하게 공유해 몰입감을 줍니다.',
    '사용자 시각을 자연스럽게 녹여냈어요.',
]

const gapPool = [
    '배경 맥락을 조금 더 짧고 굵게 정리해보면 좋아요.',
    '리스크 대비 전략이 구체적이면 설득력이 높아집니다.',
    '각 단계의 본인 기여도를 한 문장씩 덧붙여 주세요.',
    '후속 성과를 정량 지표로 연결해보면 어떨까요?',
    '학습/회고 포인트를 한 줄로 정리해 주세요.',
]

const learningPool = [
    'STAR 구조로 90초 이내 답변을 연습해 보세요.',
    '최근 프로젝트 하나를 KPI와 리더십 각도로 재정리해 보세요.',
    '데이터 설득 멘트를 3가지 버전으로 만들어 두면 좋습니다.',
    '리스크 대응 프로세스를 다이어그램으로 그려보세요.',
    '추천 질문 리스트 5개를 뽑아 거울 인터뷰를 진행해 보세요.',
]

const highlightTagPool = [
    '문제 재정의 능력',
    '데이터 기반 의사결정',
    '팀 설득',
    '회고와 학습',
    '명확한 KPI 관리',
    '사용자 관점 인사이트',
]

const focusTagPool = ['Storytelling', 'Leadership', 'Metrics', 'Collaboration', 'Product Sense', 'Delivery']

const panelItems = [
    {id: 'practice', label: '인터뷰 하기'},
    {id: 'insights', label: 'AI 피드백'},
    {id: 'history', label: '기록'},
]

function pickRandom(arr, count = 2) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}

export default function CoachPage() {
    const {
        user,
        currentQuestion,
        scoringRubric,
        lastFeedback,
        recordInterviewResult,
        scoreHistory,
        sentQuestions,
    } = useAppState()
    const location = useLocation()
    const latestDispatch = sentQuestions?.[0] ?? null
    const [answer, setAnswer] = useState(latestDispatch?.answer ?? '')
    const [isEvaluating, setIsEvaluating] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [activePanel, setActivePanel] = useState(location.state?.panel || 'practice')
    const [selectedInsight, setSelectedInsight] = useState(null)
    const [showRubric, setShowRubric] = useState(false)
    const isMobile = useMediaQuery('(max-width: 720px)')

    const minLength = 80

    const safeScoreHistory = Array.isArray(scoreHistory) ? scoreHistory : []
    const latestHistory = safeScoreHistory.slice(0, 3)
    const formattedPoints = user?.points != null ? user.points.toLocaleString() : '0'
    const activeInsight = selectedInsight ?? result ?? lastFeedback ?? null
    const latestDispatchLocal = latestDispatch
    const questionContextLabel =
        latestDispatchLocal?.roleLabel || latestDispatchLocal?.jobTrackLabel || user?.desiredField || 'AI 질문'
    const questionDisplay = latestDispatchLocal ?? currentQuestion

    const breakdownSummary = useMemo(() => {
        if (!activeInsight?.breakdown) return null
        const entries = Object.entries(activeInsight.breakdown)

        const top = entries.reduce(
            (acc, [id, value]) => {
                if (value > acc.value) return {id, value}
                return acc
            },
            {id: '', value: 0},
        )

        const low = entries.reduce(
            (acc, [id, value]) => {
                if (acc.value === 0 || value < acc.value) return {id, value}
                return acc
            },
            {id: '', value: 0},
        )

        return {top, low}
    }, [activeInsight])

    useEffect(() => {
        // 최신 질문에 저장된 답변이 있으면 작성란에 미리 채움 (수정 시 리워드 미지급 정책 안내)
        if (!answer && latestDispatchLocal?.answer) {
            setAnswer(latestDispatchLocal.answer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latestDispatchLocal?.answer])

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
            const strengths = pickRandom(strengthsPool, 3)
            const gaps = pickRandom(gapPool, 2)
            const recommendations = pickRandom(learningPool, 2)
            const highlights = pickRandom(highlightTagPool, 3)
            const focusTags = pickRandom(focusTagPool, 2)

            const computed = {
                score: baseScore,
                breakdown,
                summary,
                strengths,
                gaps,
                recommendations,
                highlights,
                focusTags,
                earnedPoints: Math.max(40, Math.round(baseScore * 0.6)),
                answer: trimmed,
            }

            setResult(computed)
            recordInterviewResult({
                score: computed.score,
                summary: computed.summary,
                highlights: computed.highlights,
                breakdown: computed.breakdown,
                focusTags: computed.focusTags,
                question: currentQuestion.prompt,
                strengths: computed.strengths,
                gaps: computed.gaps,
                recommendations: computed.recommendations,
                answer: trimmed,
            })
            setIsEvaluating(false)
            setAnswer('')
            setActivePanel('insights')
            setShowRubric(false)
        }, 900)
    }

    return (
        <div className="coach">
              <header className="coach__intro">
                  <span className="tag">AI Interview Studio</span>
                  <h1>{user?.name}님의 인터뷰 스튜디오</h1>
                  <p>오늘의 질문을 차분히 해결하고 인터뷰 감각을 끌어올려 보세요.</p>
            </header>

            <nav className="coach__tabs" role="tablist" aria-label="코칭 패널 전환">
                {panelItems.map((panel) => (
                    <button
                        key={panel.id}
                        type="button"
                        role="tab"
                        aria-selected={activePanel === panel.id}
                        className={`coach__tab ${activePanel === panel.id ? 'is-active' : ''}`}
                        onClick={() => setActivePanel(panel.id)}
                    >
                        {panel.label}
                    </button>
                ))}
            </nav>

            <div className="coach__panels">
                <AnimatePresence mode="wait">
                    {activePanel === 'practice' && (
                        <Motion.section
                            key="practice-panel"
                            className="coach__panel"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -14}}
                            transition={{duration: 0.4, ease: 'easeOut'}}
                        >
                            <Motion.article
                                className="coach__card coach__card--question"
                                initial={{opacity: 0, y: 12}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.05, duration: 0.4, ease: 'easeOut'}}
                            >

                                <h2>Q. {questionDisplay?.prompt}</h2>
                                <ul>
                                    <li>STAR 구조로 답변을 설계하면 맥락이 분명해집니다.</li>
                                    <li>숫자, 팀워크, 배운 점을 꼭 포함해 주세요.</li>
                                </ul>
                            </Motion.article>

                            <Motion.article
                                className="coach__card coach__card--composer"
                                initial={{opacity: 0, y: 12}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.08, duration: 0.4, ease: 'easeOut'}}
                            >
                                <header>
                                    <span>답변 작성</span>
                                    <small>
                                        {answer.trim().length}자 · 최소 {minLength}자
                                    </small>
                                </header>
                                  <div className="coach__composer-body">
                                      <small className="coach__reward-note">
                                          최초 1회 제출에 한해 리워드가 지급되며, 이후 수정 제출 시 리워드는 제공되지 않습니다.
                                      </small>
                                      <textarea
                                          value={answer}
                                          onChange={(event) => setAnswer(event.target.value)}
                                          placeholder="상황(S) → 과제(T) → 행동(A) → 결과(R) 순서로 이야기해 주세요."
                                          rows={10}
                                          disabled={isEvaluating}
                                      />
                                      <AnimatePresence>
                                          {isEvaluating && (
                                              <Motion.div
                                                  key="analyzing-overlay"
                                                  className="coach__analyzing"
                                                  initial={{opacity: 0}}
                                                  animate={{opacity: 1}}
                                                  exit={{opacity: 0}}
                                                  transition={{duration: 0.3, ease: 'easeOut'}}
                                                  role="status"
                                                  aria-live="polite"
                                              >
                                                  <div className="coach__analyzing-orbs" aria-hidden="true">
                                                      <span />
                                                      <span />
                                                      <span />
                                                  </div>
                                                  <p>AI가 {questionContextLabel} 인터뷰 답변을 분석 중이에요.</p>
                                                  <small>톤, 구조, 데이터 포인트를 정밀하게 살펴보고 있습니다.</small>
                                              </Motion.div>
                                          )}
                                      </AnimatePresence>
                                  </div>
                                  {error && !isEvaluating && <p className="coach__error">{error}</p>}
                                <button
                                    type="button"
                                    className="cta-button cta-button--primary"
                                    onClick={handleEvaluate}
                                    disabled={isEvaluating || answer.trim().length < minLength}
                                >
                                    {isEvaluating ? 'AI가 분석 중...' : 'AI 피드백 받기'}
                                </button>
                            </Motion.article>
                        </Motion.section>
                    )}

                    {activePanel === 'insights' && (
                        <Motion.section
                            key="insights-panel"
                            className="coach__panel"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -14}}
                            transition={{duration: 0.4, ease: 'easeOut'}}
                        >
                            {activeInsight ? (
                                <div className="coach__insight">
                                    <div className="coach__insight-score">
                                        <span>AI 평가</span>
                                        <strong>{activeInsight.score} 점</strong>
                                    
                                    </div>

                                    <div className="coach__insight-body">
                                        <div>
                                              <strong>잘한 점</strong>
                                              <ul>
                                                  {(activeInsight.strengths ?? activeInsight.highlights ?? []).map((item) => (
                                                      <li key={item}>{item}</li>
                                                  ))}
                                              </ul>
                                          </div>
                                          {(activeInsight.gaps ?? []).length > 0 && (
                                              <div>
                                                  <strong>개선할 점</strong>
                                                  <ul>
                                                      {activeInsight.gaps.map((item) => (
                                                          <li key={item}>{item}</li>
                                                      ))}
                                                  </ul>
                                              </div>
                                          )}
                                          {(activeInsight.recommendations ?? activeInsight.focusTags ?? []).length > 0 && (
                                              <div>
                                                  <strong>추천 학습</strong>
                                                  <ul>
                                                      {(activeInsight.recommendations ?? activeInsight.focusTags).map((item) => (
                                                          <li key={item}>{item}</li>
                                                      ))}
                                                  </ul>
                                              </div>
                                          )}
                                    </div>

                                    

                                    

                                    <div className="coach__insight-meta">
                                        <article>
                                        <small>획득 포인트: <strong>{(activeInsight.earnedPoints ?? 0).toLocaleString()} 포인트</strong></small>
                                        </article>
                                    </div>

                                    {activeInsight.answer && (
                                        <div className="coach__submitted-answer">
                                            <strong>제출한 답변</strong>
                                            <p>{activeInsight.answer}</p>
                                        </div>
                                    )}

                                      

                                    {!isMobile && (
                                        <AnimatePresence>
                                            {showRubric && (
                                                <Motion.div
                                                    key="rubric-panel"
                                                    className="coach__rubric"
                                                    initial={{opacity: 0, y: 16}}
                                                    animate={{opacity: 1, y: 0}}
                                                    exit={{opacity: 0, y: -10}}
                                                    transition={{duration: 0.3, ease: 'easeOut'}}
                                                >
                                                    <ul>
                                                        {scoringRubric.map((rule) => (
                                                            <li key={rule.id}>
                                                                <strong>{rule.label}</strong>
                                                                <span>{Math.round(rule.weight * 100)}%</span>
                                                                <p>{rule.rule}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </Motion.div>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </div>
                            ) : (
                                      <div className="coach__empty">
                                          <strong>아직 확인할 피드백이 없어요.</strong>
                                          <p>인터뷰 탭에서 답변을 제출하면 AI가 즉시 분석해 드립니다.</p>
                                          <button type="button" className="cta-button"
                                                  onClick={() => setActivePanel('practice')}>
                                              인터뷰 하러 가기
                                          </button>
                                      </div>
                            )}
                        </Motion.section>
                    )}

                    {activePanel === 'history' && (
                        <Motion.section
                            key="history-panel"
                            className="coach__panel"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -14}}
                            transition={{duration: 0.4, ease: 'easeOut'}}
                        >
                            {latestHistory.length > 0 ? (
                                <div className="coach__history">
                                    {latestHistory.map((entry) => (
                                        <article
                                            key={entry.id}
                                            className="history-card"
                                            onClick={() => {
                                                setSelectedInsight(entry)
                                                setActivePanel('insights')
                                            }}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    setSelectedInsight(entry)
                                                    setActivePanel('insights')
                                                }
                                            }}
                                        >
                                            <header>
                                                <span>{new Date(entry.submittedAt).toLocaleDateString('ko-KR')}</span>
                                                <strong>{entry.score}점</strong>
                                            </header>
                                            <p>{entry.question}</p>
                                            {entry.focusTags?.length > 0 && (
                                                <div className="badge-row">
                                                    {entry.focusTags.map((tag) => (
                                                        <span key={tag}>{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {entry.highlights?.length > 0 && (
                                                <ul>
                                                    {entry.highlights.slice(0, 2).map((highlight) => (
                                                        <li key={highlight}>{highlight}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                  <div className="coach__empty">
                                      <strong>기록된 세션이 없어요.</strong>
                                      <p>첫 인터뷰 세션을 완료하면 여기서 최근 3개의 답변을 확인할 수 있어요.</p>
                                  </div>
                            )}
                        </Motion.section>
                    )}
                </AnimatePresence>
            </div>

            
        </div>
    )
}



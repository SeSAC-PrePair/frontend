import {AnimatePresence, motion as Motion} from 'framer-motion'
import {useMemo, useState} from 'react'
import {useAppState} from '../context/AppStateContext'
import Modal from '../components/Modal'
import useMediaQuery from '../hooks/useMediaQuery'
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

const panelItems = [
    {id: 'practice', label: '연습'},
    {id: 'insights', label: '피드백'},
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
    const [answer, setAnswer] = useState('')
    const [isEvaluating, setIsEvaluating] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [activePanel, setActivePanel] = useState('practice')
    const [showRubric, setShowRubric] = useState(false)
    const isMobile = useMediaQuery('(max-width: 720px)')

    const minLength = 80

    const safeScoreHistory = Array.isArray(scoreHistory) ? scoreHistory : []
    const latestHistory = safeScoreHistory.slice(0, 3)
    const formattedPoints = user?.points != null ? user.points.toLocaleString() : '0'
    const activeInsight = result ?? lastFeedback ?? null
    const latestDispatch = sentQuestions?.[0] ?? null
    const questionContextLabel =
        latestDispatch?.roleLabel || latestDispatch?.jobTrackLabel || user?.desiredField || 'AI 질문'
    const questionDisplay = latestDispatch ?? currentQuestion

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
            setActivePanel('insights')
            setShowRubric(false)
        }, 900)
    }

    return (
        <div className="coach">
            <header className="coach__intro">
                <span className="tag">AI Interview Coach</span>
                <h1>{user?.name}님의 인터뷰 연습 공간</h1>
                <p>오늘의 질문을 차분히 해결해 보세요.</p>
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
                                <textarea
                                    value={answer}
                                    onChange={(event) => setAnswer(event.target.value)}
                                    placeholder="상황(S) → 과제(T) → 행동(A) → 결과(R) 순서로 이야기해 주세요."
                                    rows={10}
                                />
                                {error && <p className="coach__error">{error}</p>}
                                <button
                                    type="button"
                                    className="cta-button cta-button--primary"
                                    onClick={handleEvaluate}
                                    disabled={isEvaluating}
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
                                            <strong>요약</strong>
                                            <p>{activeInsight.summary}</p>
                                        </div>
                                        {activeInsight.highlights?.length > 0 && (
                                            <div>
                                                <strong>하이라이트</strong>
                                                <ul>
                                                    {activeInsight.highlights.map((highlight) => (
                                                        <li key={highlight}>{highlight}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {activeInsight.focusTags?.length > 0 && (
                                            <div>
                                                <strong>포커스 태그</strong>
                                                <div className="badge-row">
                                                    {activeInsight.focusTags.map((tag) => (
                                                        <span key={tag}>{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {activeInsight.breakdown && (
                                        <div className="coach__insight-breakdown">
                                            <strong>룰 기반 점수</strong>
                                            <ul>
                                                {Object.entries(activeInsight.breakdown).map(([id, value]) => {
                                                    const rubric = scoringRubric.find((rule) => rule.id === id)
                                                    return (
                                                        <li key={id}>
                                                            <span>{rubric?.label}</span>
                                                            <div className="bar">
                                                                <span style={{width: `${value}%`}}>{value}</span>
                                                            </div>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                            {breakdownSummary && (
                                                <p className="coach__insight-note">
                                                    가장 강한 영역은{' '}
                                                    <strong>{scoringRubric.find((rule) => rule.id === breakdownSummary.top.id)?.label}</strong>,
                                                    {' '}
                                                    개선하면 좋은 영역은{' '}
                                                    <strong>{scoringRubric.find((rule) => rule.id === breakdownSummary.low.id)?.label}</strong> 입니다.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="coach__insight-meta">
                                        <article>
                                            <span>누적 포인트</span>
                                            <strong>{formattedPoints} pts</strong>
                                        </article>
                                    </div>

                                    <div className="coach__insight-actions">
                                        <button type="button" onClick={() => setShowRubric((prev) => !prev)}>
                                            {showRubric ? '점수화 룰 닫기' : '점수화 룰 보기'}
                                        </button>
                                    </div>

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
                                    <p>연습 탭에서 답변을 제출하면 AI가 즉시 분석해 드립니다.</p>
                                    <button type="button" className="cta-button"
                                            onClick={() => setActivePanel('practice')}>
                                        연습 탭으로 이동
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
                                        <article key={entry.id} className="history-card">
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
                                    <p>첫 연습을 완료하면 여기서 최근 3개의 답변을 확인할 수 있어요.</p>
                                </div>
                            )}
                        </Motion.section>
                    )}
                </AnimatePresence>
            </div>

            {isMobile && (
                <Modal
                    open={showRubric}
                    onClose={() => setShowRubric(false)}
                    title="점수화 룰 상세"
                    size="md"
                    footer={
                        <button type="button" className="cta-button cta-button--ghost"
                                onClick={() => setShowRubric(false)}>
                            닫기
                        </button>
                    }
                >
                    <ul className="coach__rubric-list">
                        {scoringRubric.map((rule) => (
                            <li key={rule.id}>
                                <strong>{rule.label}</strong>
                                <span>{Math.round(rule.weight * 100)}%</span>
                                <p>{rule.rule}</p>
                            </li>
                        ))}
                    </ul>
                </Modal>
            )}
        </div>
    )
}

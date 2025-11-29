import {AnimatePresence, motion as Motion} from 'framer-motion'
import {useMemo, useState, useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {useAppState} from '../context/AppStateContext'
import Modal from '../components/Modal'
import useMediaQuery from '../hooks/useMediaQuery'
import robotLogo from '../assets/b01fa81ce7a959934e8f78fc6344081972afd0ae.png'
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
    {id: 'practice', label: '오늘의 질문'},
    {id: 'history', label: '과거의 질문'},
    {id: 'repractice', label: '재피드백 받기'},
    {id: 'summary', label: '요약'},
]

function pickRandom(arr, count = 2) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}

// 육각형 그래프 컴포넌트
function HexagonChart({scores, size = 200, isMobile = false}) {
    const categories = [
        {id: 'proactivity', label: '적극성', angle: -90},
        {id: 'values', label: '가치관', angle: -30},
        {id: 'collaboration', label: '협동성', angle: 30},
        {id: 'workEthic', label: '작업관', angle: 90},
        {id: 'creativity', label: '창의력', angle: 150},
        {id: 'logicalThinking', label: '논리적 사고', angle: 210},
    ]

    // 모바일에서는 라벨을 위한 여유 공간 추가
    const padding = isMobile ? 50 : 40
    const chartSize = size - padding * 2
    const center = size / 2
    const maxRadius = chartSize * 0.35
    const gridLines = [0.2, 0.4, 0.6, 0.8, 1.0]
    const labelRadius = maxRadius + (isMobile ? 25 : 20)
    const labelFontSize = isMobile ? 10 : 12

    const getPoint = (angle, radius) => {
        const rad = (angle * Math.PI) / 180
        const x = center + radius * Math.cos(rad)
        const y = center + radius * Math.sin(rad)
        return {x, y}
    }

    const getPath = (values) => {
        return categories
            .map((cat, idx) => {
                const score = values[idx] || 0
                const radius = (score / 100) * maxRadius
                const point = getPoint(cat.angle, radius)
                return `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
            })
            .join(' ') + ' Z'
    }

    const dataPath = getPath(categories.map((cat) => scores[cat.id] || 0))

    return (
        <div className="hexagon-chart">
            <svg 
                width="100%" 
                height="100%" 
                viewBox={`0 0 ${size} ${size}`}
                preserveAspectRatio="xMidYMid meet"
                style={{maxWidth: '100%', height: 'auto'}}
            >
                {/* 그리드 라인 */}
                {gridLines.map((scale) => (
                    <polygon
                        key={scale}
                        points={categories
                            .map((cat) => {
                                const point = getPoint(cat.angle, maxRadius * scale)
                                return `${point.x},${point.y}`
                            })
                            .join(' ')}
                        fill="none"
                        stroke="rgba(64, 81, 115, 0.15)"
                        strokeWidth="1"
                    />
                ))}

                {/* 축 라인 */}
                {categories.map((cat) => {
                    const endPoint = getPoint(cat.angle, maxRadius)
                    return (
                        <line
                            key={cat.id}
                            x1={center}
                            y1={center}
                            x2={endPoint.x}
                            y2={endPoint.y}
                            stroke="rgba(64, 81, 115, 0.2)"
                            strokeWidth="1"
                        />
                    )
                })}

                {/* 데이터 영역 */}
                <Motion.path
                    d={dataPath}
                    fill="rgba(63, 123, 255, 0.25)"
                    stroke="rgba(63, 123, 255, 0.7)"
                    strokeWidth="2"
                    initial={{pathLength: 0, opacity: 0}}
                    animate={{pathLength: 1, opacity: 1}}
                    transition={{duration: 1.2, ease: 'easeOut'}}
                />

                {/* 라벨 */}
                {categories.map((cat) => {
                    const point = getPoint(cat.angle, labelRadius)
                    return (
                        <text
                            key={cat.id}
                            x={point.x}
                            y={point.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={labelFontSize}
                            fill="rgba(20, 31, 64, 0.7)"
                            fontWeight="500"
                        >
                            {cat.label}
                        </text>
                    )
                })}

                {/* 점수 표시 */}
                {categories.map((cat) => {
                    const score = scores[cat.id] || 0
                    const radius = (score / 100) * maxRadius
                    const point = getPoint(cat.angle, radius)
                    return (
                        <g key={`score-${cat.id}`}>
                            <Motion.circle
                                cx={point.x}
                                cy={point.y}
                                r="4"
                                fill="rgba(63, 123, 255, 0.9)"
                                initial={{scale: 0, opacity: 0}}
                                animate={{scale: 1, opacity: 1}}
                                transition={{duration: 0.5, delay: 0.8 + categories.indexOf(cat) * 0.1}}
                            />
                            <text
                                x={point.x}
                                y={point.y - 12}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="10"
                                fill="rgba(63, 123, 255, 0.9)"
                                fontWeight="600"
                            >
                                {Math.round(score)}
                            </text>
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}

// scoreHistory를 기반으로 6가지 카테고리 점수 계산
function calculateCategoryScores(scoreHistory) {
    if (!scoreHistory || scoreHistory.length === 0) {
        return {
            proactivity: 70,
            values: 75,
            collaboration: 68,
            workEthic: 72,
            creativity: 65,
            logicalThinking: 73,
        }
    }

    // breakdown 데이터를 기반으로 카테고리 점수 매핑
    // structure -> 논리적 사고, clarity -> 가치관, depth -> 작업관, story -> 창의력
    // 적극성과 협동성은 전체 점수와 breakdown의 평균으로 계산
    const totals = {
        proactivity: 0,
        values: 0,
        collaboration: 0,
        workEthic: 0,
        creativity: 0,
        logicalThinking: 0,
    }

    scoreHistory.forEach((entry) => {
        const breakdown = entry.breakdown || {}
        const overallScore = entry.score || 75

        // 매핑: structure -> 논리적 사고, clarity -> 가치관, depth -> 작업관, story -> 창의력
        totals.logicalThinking += breakdown.structure || overallScore
        totals.values += breakdown.clarity || overallScore
        totals.workEthic += breakdown.depth || overallScore
        totals.creativity += breakdown.story || overallScore

        // 적극성과 협동성은 전체 점수와 breakdown 평균의 조합
        const avgBreakdown = Object.values(breakdown).length > 0
            ? Object.values(breakdown).reduce((a, b) => a + b, 0) / Object.values(breakdown).length
            : overallScore
        totals.proactivity += (overallScore * 0.6 + avgBreakdown * 0.4)
        totals.collaboration += (overallScore * 0.5 + avgBreakdown * 0.5)
    })

    const count = scoreHistory.length
    return {
        proactivity: Math.round(totals.proactivity / count),
        values: Math.round(totals.values / count),
        collaboration: Math.round(totals.collaboration / count),
        workEthic: Math.round(totals.workEthic / count),
        creativity: Math.round(totals.creativity / count),
        logicalThinking: Math.round(totals.logicalThinking / count),
    }
}

// 강점과 약점 분석
function analyzeStrengthsAndWeaknesses(scores) {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const strengths = sorted.slice(0, 2)
    const weaknesses = sorted.slice(-2).reverse()

    const categoryLabels = {
        proactivity: '적극성',
        values: '가치관',
        collaboration: '협동성',
        workEthic: '작업관',
        creativity: '창의력',
        logicalThinking: '논리적 사고',
    }

    return {
        strengths: strengths.map(([key, value]) => ({
            category: categoryLabels[key] || key,
            score: value,
        })),
        weaknesses: weaknesses.map(([key, value]) => ({
            category: categoryLabels[key] || key,
            score: value,
        })),
    }
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
        deductPoints,
    } = useAppState()
    const location = useLocation()
    const latestDispatch = sentQuestions?.[0] ?? null
    const [answer, setAnswer] = useState(latestDispatch?.answer ?? '')
    const [rePracticeAnswer, setRePracticeAnswer] = useState('')
    const [isEvaluating, setIsEvaluating] = useState(false)
    const [result, setResult] = useState(null)
    const [rePracticeResult, setRePracticeResult] = useState(null)
    const [error, setError] = useState('')
    const [activePanel, setActivePanel] = useState(location.state?.panel || 'practice')
    const [rePracticeTarget, setRePracticeTarget] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showFeedbackModal, setShowFeedbackModal] = useState(false)
    const [modalFeedbackData, setModalFeedbackData] = useState(null)
    const [showAISuggestionModal, setShowAISuggestionModal] = useState(false)
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)
    const [suggestedAnswer, setSuggestedAnswer] = useState(null)
    const isMobile = useMediaQuery('(max-width: 720px)')

    const minLength = 80

    const safeScoreHistory = Array.isArray(scoreHistory) ? scoreHistory : []
    const formattedPoints = user?.points != null ? user.points.toLocaleString() : '0'
    const activeInsight = result ?? lastFeedback ?? null
    const latestDispatchLocal = latestDispatch
    const questionContextLabel =
        latestDispatchLocal?.roleLabel || latestDispatchLocal?.jobTrackLabel || user?.desiredField || 'AI 질문'
    const questionDisplay = latestDispatchLocal ?? currentQuestion
    
    // 한 번 제출했는지 확인 (result가 있거나 latestDispatch에 answeredAt이 있으면)
    const hasSubmittedOnce = result !== null || latestDispatchLocal?.answeredAt != null
    const canGetAISuggestion = hasSubmittedOnce && (user?.points ?? 0) >= 10
    // 재피드백 받기에서는 포인트 차감 없이 사용 가능
    const canGetRePracticeAISuggestion = rePracticeTarget !== null

    useEffect(() => {
        // 최신 질문에 저장된 답변이 있으면 작성란에 미리 채움 (가장 최근 답변으로 갱신)
        if (latestDispatchLocal?.answer) {
            setAnswer(latestDispatchLocal.answer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latestDispatchLocal?.answer])

    useEffect(() => {
        // 재피드백 받기 탭으로 이동할 때, rePracticeTarget이 없으면 답변 초기화
        if (activePanel === 'repractice' && !rePracticeTarget) {
            setRePracticeAnswer('')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePanel, rePracticeTarget])

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
            // 답변은 유지 (최신 답변으로 갱신됨)
            setModalFeedbackData(computed)
            setShowFeedbackModal(true)
        }, 900)
    }

    const generateAISuggestion = (question) => {
        // AI가 제안하는 답변 생성 (모의 데이터)
        const suggestions = [
            `상황(Situation): ${question?.tags?.[0] || '프로젝트'} 관련 경험에서, 팀과 함께 중요한 마일스톤을 달성해야 하는 상황이었습니다. 당시 ${question?.tags?.[1] || '비즈니스'} 목표를 달성하기 위해 명확한 전략이 필요했습니다.

과제(Task): 제가 맡은 역할은 ${question?.tags?.[2] || '프로젝트 관리'}와 팀원들과의 효과적인 커뮤니케이션이었습니다. 특히 제한된 리소스와 시간 내에 목표를 달성해야 했습니다.

행동(Action): 먼저 팀원들과 정기적인 미팅을 통해 목표를 공유하고, 각자의 역할을 명확히 정의했습니다. 데이터 기반으로 의사결정을 내리고, 주간 진행 상황을 추적했습니다. 문제가 발생했을 때는 즉시 대응하여 리스크를 최소화했습니다.

결과(Result): 결과적으로 목표를 120% 달성했으며, 팀 전체의 만족도가 크게 향상되었습니다. 이 경험을 통해 리더십과 협업 능력을 키울 수 있었고, 이후에도 유사한 프로젝트에서 성공적으로 적용할 수 있었습니다.`,
            
            `상황: ${question?.prompt || '질문'}에 대한 답변을 준비하면서, 가장 임팩트 있는 경험을 선택하는 것이 중요했습니다.

과제: STAR 구조를 활용하여 명확하고 설득력 있는 답변을 구성해야 했습니다. 특히 구체적인 숫자와 결과를 포함하여 신뢰성을 높이는 것이 목표였습니다.

행동: 먼저 관련 경험들을 정리하고, 가장 관련성이 높은 사례를 선택했습니다. 각 단계별로 구체적인 데이터와 지표를 포함했으며, 팀과의 협업 과정도 상세히 설명했습니다.

결과: 이를 통해 면접관에게 명확한 메시지를 전달할 수 있었고, 제 역량을 효과적으로 어필할 수 있었습니다.`,
        ]
        return suggestions[Math.floor(Math.random() * suggestions.length)]
    }

    const handleRequestAISuggestion = () => {
        if (!canGetAISuggestion) return
        setShowAISuggestionModal(true)
    }

    const handleConfirmAISuggestion = () => {
        if (!canGetAISuggestion && !canGetRePracticeAISuggestion) return
        
        const deductionResult = deductPoints(10)
        if (!deductionResult.success) {
            setError(deductionResult.reason || '포인트 차감에 실패했습니다.')
            setShowAISuggestionModal(false)
            return
        }

        setIsLoadingSuggestion(true)
        setShowAISuggestionModal(false)
        
        // AI 제안 답변 생성 시뮬레이션
        setTimeout(() => {
            const targetQuestion = rePracticeTarget || currentQuestion || questionDisplay
            const suggestedAnswer = generateAISuggestion(targetQuestion)
            if (rePracticeTarget) {
                setRePracticeAnswer(suggestedAnswer)
            } else {
                setAnswer(suggestedAnswer)
            }
            setIsLoadingSuggestion(false)
        }, 800)
    }

    const handleRequestRePracticeAISuggestion = () => {
        if (!canGetRePracticeAISuggestion) return
        
        setIsLoadingSuggestion(true)
        
        // AI 제안 답변 생성 시뮬레이션 (포인트 차감 없음)
        setTimeout(() => {
            const targetQuestion = rePracticeTarget || currentQuestion || questionDisplay
            const suggested = generateAISuggestion(targetQuestion)
            setSuggestedAnswer(suggested)
            setIsLoadingSuggestion(false)
            setShowAISuggestionModal(true)
        }, 800)
    }

    const handleRePracticeEvaluate = () => {
        const trimmed = rePracticeAnswer.trim()
        if (trimmed.length < minLength) {
            setError(`답변을 조금 더 자세히 작성해주세요. (최소 ${minLength}자)`)
            return
        }
        if (!rePracticeTarget) {
            setError('재피드백 받을 질문을 먼저 선택해주세요.')
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
            const summary = `연습 모드에서 ${rePracticeTarget.question} 답변을 다시 점검해 보았어요. 구조와 깊이를 중심으로 평가했습니다.`
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
                earnedPoints: 0,
                answer: rePracticeAnswer.trim(),
            }

            setRePracticeResult(computed)
            setIsEvaluating(false)
            setModalFeedbackData({...computed, isPractice: true})
            setShowFeedbackModal(true)
        }, 900)
    }

    return (
        <div className="coach">
            <header className="coach__intro">
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
                                <header className="coach__question-header">
                                    <h2>오늘의 질문</h2>
                                </header>
                                <div className="coach__question-body">
                                    <h3 className="coach__question-prompt">Q. {questionDisplay?.prompt}</h3>
                                </div>
                                <div className="coach__question-tips">
                                    <strong className="coach__question-tips-title">해결 팁</strong>
                                    <ul>
                                        <li>STAR 구조(Situation, Task, Action, Result)로 답변을 설계하면 맥락이 분명해집니다.</li>
                                        <li>구체적인 숫자, 팀워크 경험, 배운 점을 꼭 포함해 주세요.</li>
                                        <li>문제 상황을 명확히 정의하고, 본인이 기여한 역할을 강조하세요.</li>
                                        <li>결과를 정량적으로 표현하고, 그 과정에서 얻은 인사이트를 공유하세요.</li>
                                    </ul>
                                </div>
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
                                    <textarea
                                        value={answer}
                                        onChange={(event) => setAnswer(event.target.value)}
                                        placeholder="최초 1회 제출에 한해 리워드가 지급되며, 이후 수정 제출 시 리워드는 제공되지 않습니다."
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
                                                <div className="coach__analyzing-visual" aria-hidden="true">
                                                    <div className="coach__analyzing-robot">
                                                        <img src={robotLogo} alt="PrePair 로봇" />
                                                    </div>
                                                    <div className="coach__analyzing-orbs">
                                                        <span />
                                                        <span />
                                                        <span />
                                                    </div>
                                                </div>
                                                <p>AI가 {questionContextLabel} 인터뷰 답변을 분석 중이에요.</p>
                                                <small>AI가 당신의 답변을 정밀하게 살펴보고 있습니다.</small>
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

                    {activePanel === 'history' && (
                        <Motion.section
                            key="history-panel"
                            className="coach__panel"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -14}}
                            transition={{duration: 0.4, ease: 'easeOut'}}
                        >
                            {safeScoreHistory.length > 0 ? (
                                <>
                                    <div className="coach__history-search">
                                        <div className="coach__history-search-wrapper">
                                            <svg
                                                className="coach__history-search-icon"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="m21 21-4.35-4.35" />
                                            </svg>
                                            <input
                                                type="search"
                                                placeholder="질문 키워드로 과거의 질문"
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="coach__history">
                                        {safeScoreHistory
                                            .filter((entry) => {
                                                if (!searchTerm.trim()) return true
                                                const keyword = searchTerm.trim().toLowerCase()
                                                return (
                                                    entry.question?.toLowerCase().includes(keyword) ||
                                                    entry.answer?.toLowerCase().includes(keyword)
                                                )
                                            })
                                            .map((entry) => (
                                        <article
                                            key={entry.id}
                                            className="history-card"
                                        >
                                            <header>
                                                <span>{new Date(entry.submittedAt).toLocaleDateString('ko-KR')}</span>
                                                <strong>{entry.score != null ? `${entry.score}점` : '-'}</strong>
                                            </header>
                                            <p>{entry.question}</p>
                                            {entry.highlights?.length > 0 && (
                                                <ul>
                                                    {entry.highlights.slice(0, 2).map((highlight) => (
                                                        <li key={highlight}>{highlight}</li>
                                                    ))}
                                                </ul>
                                            )}
                                            <div className="history-card__actions">
                                                <button
                                                    type="button"
                                                    className="cta-button cta-button--ghost history-card__view-feedback"
                                                    onClick={() => {
                                                        setModalFeedbackData({
                                                            score: entry.score ?? 0,
                                                            strengths: entry.strengths ?? entry.highlights ?? [],
                                                            gaps: entry.gaps ?? [],
                                                            recommendations: entry.recommendations ?? entry.focusTags ?? [],
                                                            answer: entry.answer ?? '',
                                                            earnedPoints: entry.earnedPoints ?? 0,
                                                            isPractice: false,
                                                        })
                                                        setShowFeedbackModal(true)
                                                    }}
                                                >
                                                    과거에 받은 피드백 보기
                                                </button>
                                                <button
                                                    type="button"
                                                    className="cta-button cta-button--primary history-card__repractice"
                                                    onClick={() => {
                                                        setRePracticeTarget(entry)
                                                        setRePracticeResult(null)
                                                        setRePracticeAnswer('')
                                                        setError('')
                                                        setActivePanel('repractice')
                                                    }}
                                                >
                                                    재피드백 받기
                                                </button>
                                            </div>
                                        </article>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                  <div className="coach__empty">
                                      <strong>기록된 세션이 없어요.</strong>
                                      <p>첫 인터뷰 세션을 완료하면 여기서 과거의 질문과 답변을 확인할 수 있어요.</p>
                                  </div>
                            )}
                        </Motion.section>
                    )}
                    {activePanel === 'repractice' && (
                        <Motion.section
                            key="repractice-panel"
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
                                <header className="coach__question-header">
                                    <h2>재피드백 연습</h2>
                                </header>
                                {rePracticeTarget ? (
                                    <div className="coach__question-body">
                                        <h3 className="coach__question-prompt">Q. {rePracticeTarget.question}</h3>
                                        <p className="coach__question-subprompt">
                                            과거의 답변을 다시 다듬어 보고, AI에게 추가 피드백을 받아보세요. 이 모드에서는 리워드가
                                            지급되지 않고 순수 연습만 진행됩니다.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="coach__question-body">
                                        <p className="coach__question-subprompt">
                                            상단의 &quot;과거의 질문&quot; 탭에서 재피드백 받고 싶은 질문을 먼저 선택해주세요.
                                        </p>
                                    </div>
                                )}
                            </Motion.article>

                            <Motion.article
                                className="coach__card coach__card--composer"
                                initial={{opacity: 0, y: 12}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.08, duration: 0.4, ease: 'easeOut'}}
                            >
                                <header>
                                    <span>답변 다시 써보기</span>
                                    <small>
                                        {rePracticeAnswer.trim().length}자 · 최소 {minLength}자
                                    </small>
                                </header>
                                <div className="coach__composer-body">
                                    <small className="coach__reward-note">
                                        재피드백 연습에서는 포인트가 지급되지 않으며, 기록에도 반영되지 않습니다.
                                    </small>
                                    <textarea
                                        value={rePracticeAnswer}
                                        onChange={(event) => setRePracticeAnswer(event.target.value)}
                                        placeholder="이전 답변에서 아쉬웠던 부분을 보완해 보세요."
                                        rows={10}
                                        disabled={isEvaluating}
                                    />
                                    <AnimatePresence>
                                        {isEvaluating && (
                                            <Motion.div
                                                key="repractice-analyzing-overlay"
                                                className="coach__analyzing"
                                                initial={{opacity: 0}}
                                                animate={{opacity: 1}}
                                                exit={{opacity: 0}}
                                                transition={{duration: 0.3, ease: 'easeOut'}}
                                                role="status"
                                                aria-live="polite"
                                            >
                                                <div className="coach__analyzing-visual" aria-hidden="true">
                                                    <div className="coach__analyzing-robot">
                                                        <img src={robotLogo} alt="PrePair 로봇" />
                                                    </div>
                                                    <div className="coach__analyzing-orbs">
                                                        <span />
                                                        <span />
                                                        <span />
                                                    </div>
                                                </div>
                                                <p>AI가 선택한 과거 질문에 대한 연습 답변을 분석 중이에요.</p>
                                                <small>기존 피드백을 참고해 구조와 깊이를 다시 살펴보고 있습니다.</small>
                                            </Motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {error && !isEvaluating && <p className="coach__error">{error}</p>}
                                <div className="coach__composer-actions">
                                    <button
                                        type="button"
                                        className="cta-button cta-button--primary"
                                        onClick={handleRePracticeEvaluate}
                                        disabled={isEvaluating || rePracticeAnswer.trim().length < minLength || !rePracticeTarget}
                                    >
                                        {isEvaluating ? 'AI가 분석 중...' : 'AI 피드백 받기'}
                                    </button>
                                    {rePracticeTarget && (
                                        <button
                                            type="button"
                                            className="coach__ai-suggestion-icon-btn"
                                            onClick={handleRequestRePracticeAISuggestion}
                                            disabled={!canGetRePracticeAISuggestion || isEvaluating || isLoadingSuggestion}
                                            title="AI 답변 제안 받기"
                                            aria-label="AI 답변 제안 받기"
                                        >
                                            {isLoadingSuggestion ? (
                                                <span className="coach__ai-suggestion-loading">⋯</span>
                                            ) : (
                                                <span className="coach__ai-suggestion-icon">💡</span>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </Motion.article>

                        </Motion.section>
                    )}
                    {activePanel === 'summary' && (
                        <Motion.section
                            key="summary-panel"
                            className="coach__panel"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -14}}
                            transition={{duration: 0.4, ease: 'easeOut'}}
                        >
                            {safeScoreHistory.length > 0 ? (
                                <>
                                    <Motion.article
                                        className="coach__card coach__card--summary"
                                        initial={{opacity: 0, y: 12}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: 0.05, duration: 0.4, ease: 'easeOut'}}
                                    >
                                        <header className="coach__question-header">
                                            <h2>인터뷰 스킬 요약</h2>
                                        </header>
                                        <div className="coach__summary-content">
                                            {(() => {
                                                const categoryScores = calculateCategoryScores(safeScoreHistory)
                                                const analysis = analyzeStrengthsAndWeaknesses(categoryScores)
                                                return (
                                                    <>
                                                        <div className="coach__summary-chart">
                                                            <HexagonChart scores={categoryScores} size={isMobile ? 300 : 340} isMobile={isMobile} />
                                                        </div>
                                                        <div className="coach__summary-analysis">
                                                            <div className="coach__summary-section">
                                                                <h3>강점</h3>
                                                                <p>
                                                                    {analysis.strengths.map((s, idx) => (
                                                                        <span key={s.category}>
                                                                            <strong>{s.category}</strong> ({s.score}점)
                                                                            {idx < analysis.strengths.length - 1 ? ', ' : ''}
                                                                        </span>
                                                                    ))}
                                                                    영역에서 뛰어난 역량을 보여주고 있습니다. 특히{' '}
                                                                    <strong>{analysis.strengths[0]?.category}</strong>에서 높은 점수를 받았으며, 이는
                                                                    인터뷰에서 본인의 강점을 효과적으로 어필할 수 있는 영역입니다.
                                                                </p>
                                                            </div>
                                                            <div className="coach__summary-section">
                                                                <h3>개선이 필요한 부분</h3>
                                                                <p>
                                                                    {analysis.weaknesses.map((w, idx) => (
                                                                        <span key={w.category}>
                                                                            <strong>{w.category}</strong> ({w.score}점)
                                                                            {idx < analysis.weaknesses.length - 1 ? ', ' : ''}
                                                                        </span>
                                                                    ))}
                                                                    영역에서 추가적인 보완이 필요합니다. 특히{' '}
                                                                    <strong>{analysis.weaknesses[0]?.category}</strong> 영역을 집중적으로 개선한다면
                                                                    전체적인 인터뷰 역량이 크게 향상될 것입니다.
                                                                </p>
                                                            </div>
                                                        
                                                            <div className="coach__summary-section">
                                                                <h3>추천 학습</h3>
                                                                <ul>
                                                                    <li>
                                                                        <strong>{analysis.weaknesses[0]?.category}</strong> 관련 질문 리스트를 준비하고
                                                                        매일 한 가지씩 답변 연습하기
                                                                    </li>
                                                                    <li>
                                                                        STAR 구조를 활용한 90초 이내 답변 연습으로{' '}
                                                                        <strong>{analysis.weaknesses[1]?.category}</strong> 역량 강화
                                                                    </li>
                                                                    <li>
                                                                        과거 프로젝트 경험을{' '}
                                                                        <strong>{analysis.weaknesses[0]?.category}</strong> 관점에서 재정리하고
                                                                        정량적 지표와 함께 정리하기
                                                                    </li>
                                                                    <li>
                                                                        <strong>{analysis.strengths[0]?.category}</strong> 강점을 더욱 부각시킬 수 있는
                                                                        스토리텔링 기법 학습
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </Motion.article>
                                </>
                            ) : (
                                <div className="coach__empty">
                                    <strong>요약 데이터가 없어요.</strong>
                                    <p>인터뷰 세션을 완료하면 여기서 스킬 요약을 확인할 수 있어요.</p>
                                </div>
                            )}
                        </Motion.section>
                    )}
                </AnimatePresence>
            </div>

            <Modal
                open={showFeedbackModal}
                onClose={() => {
                    setShowFeedbackModal(false)
                    setModalFeedbackData(null)
                }}
                title={modalFeedbackData?.isPractice ? '연습용 AI 평가' : 'AI 평가'}
                size="lg"
            >
                {modalFeedbackData && (
                    <div className="coach__insight">
                        <div className="coach__insight-score">
                            <span>{modalFeedbackData.isPractice ? '연습용 AI 평가' : 'AI 평가'}</span>
                            <strong>{modalFeedbackData.score != null && modalFeedbackData.score > 0 ? `${modalFeedbackData.score} 점` : '-'}</strong>
                        </div>
                        <div className="coach__insight-body">
                            <div>
                                <strong>{modalFeedbackData.isPractice ? '이번 답변에서 좋아진 점' : '잘한 점'}</strong>
                                <ul>
                                    {(modalFeedbackData.strengths ?? modalFeedbackData.highlights ?? []).map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            {(modalFeedbackData.gaps ?? []).length > 0 && (
                                <div>
                                    <strong>{modalFeedbackData.isPractice ? '더 보완하면 좋은 부분' : '개선할 점'}</strong>
                                    <ul>
                                        {modalFeedbackData.gaps.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {(modalFeedbackData.recommendations ?? modalFeedbackData.focusTags ?? []).length > 0 && (
                                <div>
                                    <strong>{modalFeedbackData.isPractice ? '다음 연습 가이드' : '추천 학습'}</strong>
                                    <ul>
                                        {(modalFeedbackData.recommendations ?? modalFeedbackData.focusTags).map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {modalFeedbackData.answer && (
                            <div className="coach__submitted-answer coach__submitted-answer--scrollable">
                                <strong>{modalFeedbackData.isPractice ? '이번에 작성한 연습 답변' : '제출한 답변'}</strong>
                                <p>{modalFeedbackData.answer}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                open={showAISuggestionModal}
                onClose={() => {
                    setShowAISuggestionModal(false)
                    setSuggestedAnswer(null)
                }}
                title={suggestedAnswer ? "AI 답변 제안" : "AI 답변 제안 받기"}
                size={suggestedAnswer ? "lg" : "sm"}
            >
                {suggestedAnswer ? (
                    <div className="coach__suggestion-answer">
                        <p className="coach__suggestion-answer-intro">
                            AI가 제안하는 모범 답안입니다. 참고하여 답변을 작성해보세요.
                        </p>
                        <div className="coach__suggestion-answer-content">
                            <pre>{suggestedAnswer}</pre>
                        </div>
                        <div className="coach__suggestion-answer-actions">
                            <button
                                type="button"
                                className="cta-button cta-button--primary"
                                onClick={() => {
                                    if (rePracticeTarget) {
                                        setRePracticeAnswer(suggestedAnswer)
                                    } else {
                                        setAnswer(suggestedAnswer)
                                    }
                                    setShowAISuggestionModal(false)
                                    setSuggestedAnswer(null)
                                }}
                            >
                                이 답안으로 작성하기
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="coach__suggestion-confirm">
                        <p>
                            <strong>10포인트</strong>를 사용하여 AI가 제안하는 답변을 받아보시겠어요?
                        </p>
                        <p className="coach__suggestion-confirm-detail">
                            현재 보유 포인트: <strong>{formattedPoints} 포인트</strong>
                            <br />
                            사용 후 잔여 포인트: <strong>{Math.max(0, (user?.points ?? 0) - 10).toLocaleString()} 포인트</strong>
                        </p>
                        <div className="coach__suggestion-confirm-actions">
                            <button
                                type="button"
                                className="cta-button cta-button--ghost"
                                onClick={() => setShowAISuggestionModal(false)}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className="cta-button cta-button--primary"
                                onClick={handleConfirmAISuggestion}
                            >
                                확인 (10포인트 차감)
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}



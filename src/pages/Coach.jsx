import {AnimatePresence, motion as Motion} from 'framer-motion'
import {useMemo, useState, useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {useAppState} from '../context/AppStateContext'
import Modal from '../components/Modal'
import PointsRewardModal from '../components/PointsRewardModal'
import useMediaQuery from '../hooks/useMediaQuery'
import {generateFeedback, getSuggestedAnswer, getSummaryFeedback, getTodayQuestion} from '../utils/feedbackApi'
import robotLogo from '../assets/b01fa81ce7a959934e8f78fc6344081972afd0ae.png'
import '../styles/pages/Coach.css'

// 하드코딩된 풀 제거 - API 응답에서 직접 사용

const highlightTagPool = [
    '문제 재정의 능력',
    '데이터 기반 의사결정',
    '팀 설득',
    '회고와 학습',
    '명확한 KPI 관리',
    '사용자 관점 인사이트',
]

const focusTagPool = ['Storytelling', 'Leadership', 'Metrics', 'Collaboration', 'Product Sense', 'Delivery']

// historyId 순차 카운터 관리
function getNextHistoryId() {
    const STORAGE_KEY = 'prepair_history_counter'
    let counter = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0', 10)
    counter += 1
    sessionStorage.setItem(STORAGE_KEY, counter.toString())
    // 001, 002, 003 형식으로 포맷팅
    return `h-${String(counter).padStart(3, '0')}`
}

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
    const padding = isMobile ? 50 : 30
    const chartSize = size - padding * 2
    const center = size / 2
    const maxRadius = chartSize * 0.35
    const gridLines = [0.2, 0.4, 0.6, 0.8, 1.0]
    const labelRadius = maxRadius + (isMobile ? 25 : 20)
    const labelFontSize = isMobile ? 14 : 86

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
                        strokeWidth="2.7"
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
                            stroke="rgba(64, 81, 115, 0.4)"
                            strokeWidth="1.5"
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
                                fontSize={isMobile ? "12" : "54"}
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
    const [showPointsRewardModal, setShowPointsRewardModal] = useState(false)
    const [earnedPoints, setEarnedPoints] = useState(0)
    const [summaryData, setSummaryData] = useState(null)
    const [isLoadingSummary, setIsLoadingSummary] = useState(false)
    const [summaryError, setSummaryError] = useState('')
    const [todayQuestion, setTodayQuestion] = useState(null)
    const [isLoadingTodayQuestion, setIsLoadingTodayQuestion] = useState(false)
    const [todayQuestionError, setTodayQuestionError] = useState('')
    const isMobile = useMediaQuery('(max-width: 720px)')

    const minLength = 80

    const safeScoreHistory = Array.isArray(scoreHistory) ? scoreHistory : []
    const formattedPoints = user?.points != null ? user.points.toLocaleString() : '0'
    const activeInsight = result ?? lastFeedback ?? null
    const latestDispatchLocal = latestDispatch
    const questionContextLabel =
        latestDispatchLocal?.roleLabel || latestDispatchLocal?.jobTrackLabel || user?.desiredField || 'AI 질문'
    
    // 오늘의 질문 API에서 가져온 데이터를 우선 사용, 없으면 기존 로직 사용
    const questionDisplay = todayQuestion 
        ? {
            prompt: todayQuestion.question,
            question: todayQuestion.question,
            question_id: todayQuestion.question_id,
            answeredAt: todayQuestion.answered_at,
            status: todayQuestion.status,
            created_at: todayQuestion.created_at,
        }
        : (latestDispatchLocal ?? currentQuestion)
    
    // 한 번 제출했는지 확인 (result가 있거나 latestDispatch에 answeredAt이 있으면)
    const hasSubmittedOnce = result !== null || latestDispatchLocal?.answeredAt != null
    const canGetAISuggestion = hasSubmittedOnce && (user?.points ?? 0) >= 10
    // 재피드백 받기에서는 포인트 차감 없이 사용 가능
    const canGetRePracticeAISuggestion = rePracticeTarget !== null

    // 오늘의 질문 API 호출
    useEffect(() => {
        if (activePanel === 'practice' && user?.id) {
            // userId 확인: user.id가 UUID 형식인지 확인, 아니면 테스트용 userId 사용
            // API 스펙에 따르면 X-User-ID는 "u_edjks134n" 형식이므로, user.id를 그대로 사용하거나 폴백
            let userId = user.id
            
            // user.id가 없거나 빈 문자열인 경우에만 테스트용 ID 사용
            if (!userId || userId.trim() === '') {
                userId = 'u_edjks134n' // 테스트용 userId
                console.warn('[Coach] User ID가 없어 테스트용 ID를 사용합니다:', userId)
            }
            
            // 디버깅: 사용 중인 userId 로그
            console.log('[Coach Today Question] Using userId:', userId)
            console.log('[Coach Today Question] Original user.id:', user?.id)
            console.log('[Coach Today Question] User object:', user)
            
            setIsLoadingTodayQuestion(true)
            setTodayQuestionError('')
            
            getTodayQuestion(userId)
                .then((data) => {
                    console.log('[Coach Today Question] Success:', data)
                    setTodayQuestion(data)
                    setIsLoadingTodayQuestion(false)
                    
                    // answered_at이 있으면 이미 답변한 것으로 간주하고 답변 필드에 설정
                    if (data.answered_at && data.status === 'ANSWERED') {
                        // 이미 답변한 경우, 답변 내용은 API에서 가져와야 하지만
                        // 현재 API 응답에 answer 필드가 없으므로 일단 빈 문자열로 처리
                        // 필요시 별도 API 호출로 답변 내용을 가져올 수 있음
                    }
                })
                .catch((error) => {
                    console.error('[Coach Today Question] 오늘의 질문 가져오기 오류:', error)
                    console.error('[Coach Today Question] Error stack:', error.stack)
                    console.error('[Coach Today Question] Error name:', error.name)
                    setTodayQuestionError(error.message || '오늘의 질문을 불러오는데 실패했습니다.')
                    setIsLoadingTodayQuestion(false)
                    // 에러가 발생해도 기존 로직으로 폴백
                    setTodayQuestion(null)
                })
        } else if (activePanel === 'practice' && !user?.id) {
            // user.id가 없는 경우 에러 메시지 설정
            console.warn('[Coach Today Question] User ID가 없습니다.')
            setTodayQuestionError('로그인이 필요합니다.')
            setIsLoadingTodayQuestion(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePanel, user?.id])

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

    // 요약 탭에서 API 호출
    useEffect(() => {
        if (activePanel === 'summary') {
            // userId 확인: user.id가 UUID 형식인지 확인, 아니면 테스트용 userId 사용
            const userId = user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)
                ? user.id
                : '3f0a9a32-1c11-4c88-9e61-bb7121b6f9d1' // 테스트용 userId
            
            if (!userId) {
                setSummaryError('사용자 ID를 찾을 수 없습니다. 로그인 후 다시 시도해주세요.')
                setIsLoadingSummary(false)
                return
            }
            
            setIsLoadingSummary(true)
            setSummaryError('')
            
            // 디버깅: 사용 중인 userId 로그
            console.log('[Coach Summary] Using userId:', userId)
            console.log('[Coach Summary] Original user.id:', user?.id)
            
            getSummaryFeedback(userId)
                .then((data) => {
                    // 점수 범위 확인 및 변환 (0-5 범위를 0-100 범위로 변환)
                    const normalizeScore = (score) => {
                        if (score == null || score === undefined) return 0
                        // 점수가 5 이하이면 0-5 범위로 간주하고 100점 만점으로 변환
                        if (score <= 5) {
                            return (score / 5) * 100
                        }
                        // 이미 0-100 범위인 경우 그대로 사용
                        return Math.min(100, Math.max(0, score))
                    }
                    
                    // API 응답 필드명을 현재 코드에서 사용하는 필드명으로 매핑
                    const mappedScores = {
                        proactivity: normalizeScore(data.scores.proactivity),
                        logicalThinking: normalizeScore(data.scores.logicalThinking),
                        creativity: normalizeScore(data.scores.creativity),
                        workEthic: normalizeScore(data.scores.careerValues), // careerValues -> workEthic
                        collaboration: normalizeScore(data.scores.cooperation), // cooperation -> collaboration
                        values: normalizeScore(data.scores.coreValues), // coreValues -> values
                    }
                    
                    setSummaryData({
                        scores: mappedScores,
                        strengths: data.strengths || '',
                        improvements: data.improvements || '',
                        recommendations: data.recommendations || '',
                    })
                    setIsLoadingSummary(false)
                })
                .catch((error) => {
                    console.error('요약 피드백 가져오기 오류:', error)
                    setSummaryError(error.message || '요약 데이터를 불러오는데 실패했습니다.')
                    setIsLoadingSummary(false)
                })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePanel, user?.id])

    const handleEvaluate = async () => {
        const trimmed = answer.trim()
        if (trimmed.length < minLength) {
            setError(`답변을 조금 더 자세히 작성해주세요. (최소 ${minLength}자)`)
            return
        }
        if (!questionDisplay && !currentQuestion) {
            setError('질문을 불러오고 있습니다. 잠시 후 다시 시도해주세요.')
            return
        }
        setError('')
        setIsEvaluating(true)

        try {
            // API 호출 - historyId를 순차적으로 생성 (001, 002, 003...)
            const historyId = getNextHistoryId()
            // 오늘의 질문 API에서 가져온 경우 question 필드 사용, 아니면 prompt 사용
            const questionText = questionDisplay?.question || questionDisplay?.prompt || currentQuestion?.prompt
            const feedbackResponse = await generateFeedback(historyId, {
                question: questionText,
                answer: trimmed,
            })

            // API 응답을 기존 형식으로 변환
            const baseScore = feedbackResponse.score || 0
            const breakdown = scoringRubric.reduce((acc, item) => {
                // API에서 breakdown이 없으면 기본값 계산
                const jitter = Math.random() * 8 - 4
                acc[item.id] = Math.min(98, Math.max(60, Math.round(baseScore * item.weight * 1.2 + jitter)))
                return acc
            }, {})
            
            // API 응답에서 피드백 데이터 추출
            // feedback이 객체일 수도 있고 문자열일 수도 있음
            const feedbackData = feedbackResponse.feedback
            
            let strengths = []
            let gaps = []
            let recommendations = []
            
            if (typeof feedbackData === 'string' && feedbackData.trim()) {
                // feedback이 문자열인 경우 - 개선점으로 처리
                gaps = [feedbackData.trim()]
            } else if (feedbackData && typeof feedbackData === 'object') {
                // feedback이 객체인 경우 - API 문서 형식: { good, improvement, recommendation }
                const getFeedbackField = (fieldName) => {
                    const value = feedbackData[fieldName]
                    if (Array.isArray(value)) return value
                    if (typeof value === 'string' && value.trim()) {
                        // 문자열을 줄바꿈이나 쉼표로 분리
                        return value.split(/[,\n]/).map(s => s.trim()).filter(s => s)
                    }
                    return []
                }
                
                strengths = getFeedbackField('good') || getFeedbackField('strengths') || []
                gaps = getFeedbackField('improvement') || getFeedbackField('gaps') || []
                recommendations = getFeedbackField('recommendation') || getFeedbackField('recommendations') || []
            }
            
            // 최상위 레벨에서도 확인 (하위 호환성)
            const getArrayField = (obj, fieldName) => {
                const value = obj?.[fieldName]
                if (Array.isArray(value)) return value
                if (typeof value === 'string') {
                    return value.split(/[,\n]/).map(s => s.trim()).filter(s => s)
                }
                return []
            }
            
            // 최상위 레벨에 데이터가 있으면 우선 사용
            const finalStrengths = getArrayField(feedbackResponse, 'strengths').length > 0 
                ? getArrayField(feedbackResponse, 'strengths') 
                : strengths
            const finalGaps = getArrayField(feedbackResponse, 'gaps').length > 0 
                ? getArrayField(feedbackResponse, 'gaps') 
                : gaps
            const finalRecommendations = getArrayField(feedbackResponse, 'recommendations').length > 0 
                ? getArrayField(feedbackResponse, 'recommendations') 
                : recommendations
            
            // 최종 값 사용
            strengths = finalStrengths
            gaps = finalGaps
            recommendations = finalRecommendations
            
            // highlights와 focusTags는 API 응답에서 가져오거나 기본값 사용
            const highlights = Array.isArray(feedbackResponse.highlights) 
                ? feedbackResponse.highlights 
                : pickRandom(highlightTagPool, 3)
            const focusTags = Array.isArray(feedbackResponse.focusTags)
                ? feedbackResponse.focusTags
                : pickRandom(focusTagPool, 2)
            
            const summary = feedbackResponse.summary || feedbackData.summary || `구체적인 사례를 중심으로 ${questionDisplay?.tags?.[0] || currentQuestion?.tags?.[0] || '핵심 역량'}을 잘 드러냈어요.`

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
            const rewardInfo = recordInterviewResult({
                score: computed.score,
                summary: computed.summary,
                highlights: computed.highlights,
                breakdown: computed.breakdown,
                focusTags: computed.focusTags,
                question: questionText,
                strengths: computed.strengths,
                gaps: computed.gaps,
                recommendations: computed.recommendations,
                answer: trimmed,
            })
            setIsEvaluating(false)
            // 답변은 유지 (최신 답변으로 갱신됨)
            setModalFeedbackData(computed)
            
            // 포인트가 적립된 경우 팝업 표시
            if (rewardInfo && rewardInfo.earnedPoints > 0 && rewardInfo.isFirstToday) {
                setEarnedPoints(rewardInfo.earnedPoints)
                setShowPointsRewardModal(true)
            }
            
            setShowFeedbackModal(true)
        } catch (error) {
            console.error('피드백 생성 오류:', error)
            setError(error.message || '피드백 생성에 실패했습니다. 잠시 후 다시 시도해주세요.')
            setIsEvaluating(false)
        }
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

    const handleRequestRePracticeAISuggestion = async () => {
        if (!canGetRePracticeAISuggestion) return
        
        setIsLoadingSuggestion(true)
        setError('')
        
        try {
            const targetQuestion = rePracticeTarget || currentQuestion || questionDisplay
            const questionValue = targetQuestion?.question || targetQuestion?.prompt
            
            // 질문 필드 검증
            if (!questionValue || typeof questionValue !== 'string' || !questionValue.trim()) {
                setError('질문 정보가 없습니다. 다시 선택해주세요.')
                setIsLoadingSuggestion(false)
                return
            }
            
            // API 호출
            const response = await getSuggestedAnswer({
                question: questionValue.trim(),
            })
            
            // 응답에서 answer 추출
            const suggested = response.answer || ''
            
            if (!suggested || !suggested.trim()) {
                setError('추천 답안을 받을 수 없습니다. 잠시 후 다시 시도해주세요.')
                setIsLoadingSuggestion(false)
                return
            }
            
            setSuggestedAnswer(suggested)
            setIsLoadingSuggestion(false)
            setShowAISuggestionModal(true)
        } catch (error) {
            console.error('추천 답안 가져오기 오류:', error)
            setError(error.message || '추천 답안을 가져오는데 실패했습니다. 잠시 후 다시 시도해주세요.')
            setIsLoadingSuggestion(false)
        }
    }

    const handleRePracticeEvaluate = async () => {
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

        try {
            // API 호출 - historyId를 순차적으로 생성 (001, 002, 003...)
            const historyId = getNextHistoryId()
            
            // 질문 필드 검증 및 추출
            const questionValue = rePracticeTarget?.question
            
            // 디버깅: 전송할 데이터 확인
            console.log('[RePractice] rePracticeTarget:', rePracticeTarget)
            console.log('[RePractice] question:', questionValue)
            console.log('[RePractice] question type:', typeof questionValue)
            console.log('[RePractice] question length:', questionValue?.length)
            console.log('[RePractice] answer:', trimmed)
            console.log('[RePractice] answer length:', trimmed.length)
            
            // 질문 필드 검증 (null, undefined, 빈 문자열, 공백만 있는 경우)
            if (!questionValue || typeof questionValue !== 'string' || !questionValue.trim()) {
                console.error('[RePractice] Invalid question value:', questionValue)
                setError('질문 정보가 없습니다. 다시 선택해주세요.')
                setIsEvaluating(false)
                return
            }
            
            // 질문과 답변 모두 trim하여 전송
            const trimmedQuestion = questionValue.trim()
            
            // 최종 전송할 payload 확인
            const finalPayload = {
                question: trimmedQuestion,
                answer: trimmed,
            }
            
            console.log('[RePractice] ===== Final Payload Before API Call =====')
            console.log('[RePractice] historyId:', historyId)
            console.log('[RePractice] payload:', finalPayload)
            console.log('[RePractice] payload JSON:', JSON.stringify(finalPayload))
            console.log('[RePractice] question exists:', !!finalPayload.question)
            console.log('[RePractice] answer exists:', !!finalPayload.answer)
            console.log('[RePractice] question length:', finalPayload.question?.length)
            console.log('[RePractice] answer length:', finalPayload.answer?.length)
            console.log('[RePractice] =========================================')
            
            const feedbackResponse = await generateFeedback(historyId, finalPayload)

            // API 응답을 새로운 형식에 맞게 변환
            // 응답 형식: { question_id, user_id, question, created_at, answerd_at, answer, feedback: { good, improvement, recommendation }, score, status }
            const baseScore = feedbackResponse.score || 0
            const breakdown = scoringRubric.reduce((acc, item) => {
                // API에서 breakdown이 없으면 기본값 계산
                const jitter = Math.random() * 8 - 4
                acc[item.id] = Math.min(98, Math.max(60, Math.round(baseScore * item.weight * 1.2 + jitter)))
                return acc
            }, {})
            
            // 새로운 API 응답 형식에서 피드백 데이터 추출
            // feedback이 객체일 수도 있고 문자열일 수도 있음
            const feedbackData = feedbackResponse.feedback
            
            // feedback이 문자열인 경우와 객체인 경우 모두 처리
            let strengths = []
            let gaps = []
            let recommendations = []
            
            if (typeof feedbackData === 'string' && feedbackData.trim()) {
                // feedback이 문자열인 경우 - 개선점으로 처리
                gaps = [feedbackData.trim()]
            } else if (feedbackData && typeof feedbackData === 'object') {
                // feedback이 객체인 경우 - API 문서 형식: { good, improvement, recommendation }
                const getFeedbackField = (fieldName) => {
                    const value = feedbackData[fieldName]
                    if (Array.isArray(value)) return value
                    if (typeof value === 'string' && value.trim()) {
                        // 문자열을 줄바꿈이나 쉼표로 분리
                        return value.split(/[,\n]/).map(s => s.trim()).filter(s => s)
                    }
                    return []
                }
                
                strengths = getFeedbackField('good') || getFeedbackField('strengths') || []
                gaps = getFeedbackField('improvement') || getFeedbackField('gaps') || []
                recommendations = getFeedbackField('recommendation') || getFeedbackField('recommendations') || []
            }
            
            // 기존 형식과의 호환성을 위해 최상위 레벨에서도 확인
            const getArrayField = (obj, fieldName) => {
                const value = obj?.[fieldName]
                if (Array.isArray(value)) return value
                if (typeof value === 'string') {
                    return value.split(/[,\n]/).map(s => s.trim()).filter(s => s)
                }
                return []
            }
            
            // 최상위 레벨에 데이터가 있으면 우선 사용
            const finalStrengths = getArrayField(feedbackResponse, 'strengths').length > 0 
                ? getArrayField(feedbackResponse, 'strengths') 
                : strengths
            const finalGaps = getArrayField(feedbackResponse, 'gaps').length > 0 
                ? getArrayField(feedbackResponse, 'gaps') 
                : gaps
            const finalRecommendations = getArrayField(feedbackResponse, 'recommendations').length > 0 
                ? getArrayField(feedbackResponse, 'recommendations') 
                : recommendations
            
            // highlights와 focusTags는 API 응답에서 가져오거나 기본값 사용
            const highlights = Array.isArray(feedbackResponse.highlights) 
                ? feedbackResponse.highlights 
                : pickRandom(highlightTagPool, 3)
            const focusTags = Array.isArray(feedbackResponse.focusTags)
                ? feedbackResponse.focusTags
                : pickRandom(focusTagPool, 2)
            
            const summary = feedbackResponse.summary || `연습 모드에서 ${rePracticeTarget.question} 답변을 다시 점검해 보았어요. 구조와 깊이를 중심으로 평가했습니다.`

            const computed = {
                score: baseScore,
                breakdown,
                summary,
                strengths: finalStrengths,
                gaps: finalGaps,
                recommendations: finalRecommendations,
                highlights,
                focusTags,
                earnedPoints: 0,
                answer: rePracticeAnswer.trim(),
            }

            setRePracticeResult(computed)
            setIsEvaluating(false)
            setModalFeedbackData({...computed, isPractice: true})
            setShowFeedbackModal(true)
        } catch (error) {
            console.error('피드백 생성 오류:', error)
            setError(error.message || '피드백 생성에 실패했습니다. 잠시 후 다시 시도해주세요.')
            setIsEvaluating(false)
        }
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
                                {isLoadingTodayQuestion ? (
                                    <div className="coach__question-body">
                                        <p>오늘의 질문을 불러오는 중...</p>
                                    </div>
                                ) : todayQuestion ? (
                                    // API에서 가져온 질문 표시
                                    <div className="coach__question-body">
                                        <h3 className="coach__question-prompt">Q. {todayQuestion.question}</h3>
                                    </div>
                                ) : todayQuestionError ? (
                                    <div className="coach__question-body">
                                        <p className="coach__error">{todayQuestionError}</p>
                                        {questionDisplay?.prompt && questionDisplay !== currentQuestion && (
                                            <h3 className="coach__question-prompt">Q. {questionDisplay.prompt}</h3>
                                        )}
                                    </div>
                                ) : questionDisplay?.prompt || questionDisplay?.question ? (
                                    // 폴백: API 데이터가 없을 때만 기존 데이터 사용
                                    <div className="coach__question-body">
                                        <h3 className="coach__question-prompt">Q. {questionDisplay.prompt || questionDisplay.question}</h3>
                                    </div>
                                ) : (
                                    <div className="coach__question-body">
                                        <p>질문을 불러올 수 없습니다.</p>
                                    </div>
                                )}
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
                                                        // 질문 필드가 있는지 확인
                                                        if (!entry?.question || typeof entry.question !== 'string' || !entry.question.trim()) {
                                                            setError('질문 정보가 없는 항목입니다. 다른 질문을 선택해주세요.')
                                                            return
                                                        }
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
                            {isLoadingSummary ? (
                                <div className="coach__empty">
                                    <strong>요약 데이터를 불러오는 중...</strong>
                                    <p>잠시만 기다려주세요.</p>
                                </div>
                            ) : summaryError ? (
                                <div className="coach__empty">
                                    <strong>요약 데이터를 불러올 수 없습니다.</strong>
                                    <p>{summaryError}</p>
                                </div>
                            ) : summaryData ? (
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
                                            <div className="coach__summary-chart">
                                                <HexagonChart scores={summaryData.scores} size={isMobile ? 360 : 1820} isMobile={isMobile} />
                                            </div>
                                            <div className="coach__summary-analysis">
                                                <div className="coach__summary-section">
                                                    <h3>강점</h3>
                                                    <p>{summaryData.strengths || '강점 데이터가 없습니다.'}</p>
                                                </div>
                                                <div className="coach__summary-section">
                                                    <h3>개선이 필요한 부분</h3>
                                                    <p>{summaryData.improvements || '개선점 데이터가 없습니다.'}</p>
                                                </div>
                                                <div className="coach__summary-section">
                                                    <h3>추천 학습</h3>
                                                    {summaryData.recommendations ? (
                                                        <ul>
                                                            {summaryData.recommendations
                                                                .split(',')
                                                                .map((rec, idx) => rec.trim())
                                                                .filter((rec) => rec.length > 0)
                                                                .map((rec, idx) => (
                                                                    <li key={idx}>{rec}</li>
                                                                ))}
                                                        </ul>
                                                    ) : (
                                                        <p>추천 학습 데이터가 없습니다.</p>
                                                    )}
                                                </div>
                                            </div>
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
                        {modalFeedbackData.answer && (
                            <div className="coach__submitted-answer coach__submitted-answer--scrollable">
                                <strong>{modalFeedbackData.isPractice ? '이번에 작성한 연습 답변' : '제출한 답변'}</strong>
                                <p>{modalFeedbackData.answer}</p>
                            </div>
                        )}
                        <div className="coach__submitted-answer coach__feedback-section">
                            <strong>{modalFeedbackData.isPractice ? '이번 답변에서 좋아진 점' : '잘한 점'}</strong>
                            <p>
                                {(modalFeedbackData.strengths ?? modalFeedbackData.highlights ?? []).length > 0 ? (
                                    (modalFeedbackData.strengths ?? modalFeedbackData.highlights ?? []).join(', ')
                                ) : (
                                    '없음'
                                )}
                            </p>
                        </div>
                        <div className="coach__submitted-answer coach__feedback-section">
                            <strong>{modalFeedbackData.isPractice ? '더 보완하면 좋은 부분' : '개선할 점'}</strong>
                            <p>
                                {(modalFeedbackData.gaps ?? []).length > 0 ? (
                                    modalFeedbackData.gaps.join(', ')
                                ) : (
                                    '없음'
                                )}
                            </p>
                        </div>
                        <div className="coach__submitted-answer coach__feedback-section">
                            <strong>{modalFeedbackData.isPractice ? '다음 연습 가이드' : '추가 학습'}</strong>
                            <p>
                                {(modalFeedbackData.recommendations ?? modalFeedbackData.focusTags ?? []).length > 0 ? (
                                    (modalFeedbackData.recommendations ?? modalFeedbackData.focusTags).join(', ')
                                ) : (
                                    '없음'
                                )}
                            </p>
                        </div>
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

            <PointsRewardModal
                open={showPointsRewardModal}
                onClose={() => setShowPointsRewardModal(false)}
                points={earnedPoints}
            />
        </div>
    )
}



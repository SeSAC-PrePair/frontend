import {useEffect, useRef, useState, useMemo, useCallback} from 'react'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import ContributionHeatmap from '../../components/ContributionHeatmap'
import {useAppState} from '../../context/AppStateContext'
import {getTodayQuestion} from '../../utils/feedbackApi'
import {getUserSummary} from '../../utils/authApi'
import '../../styles/pages/Rewards.css'
import useMediaQuery from '../../hooks/useMediaQuery'

export default function RewardsOverview() {
    const location = useLocation()
    const navigate = useNavigate()
    const {user, activity, sentQuestions, scoreHistory} = useAppState()

    const [todayQuestion, setTodayQuestion] = useState(null)
    const [isLoadingTodayQuestion, setIsLoadingTodayQuestion] = useState(false)
    const [todayQuestionError, setTodayQuestionError] = useState('')
    
    // API 요약 데이터 상태
    const [summaryData, setSummaryData] = useState(null)
    const [isLoadingSummary, setIsLoadingSummary] = useState(false)
    const [summaryError, setSummaryError] = useState('')

    const redirectSource = location.state?.from
    const isMobile = useMediaQuery('(max-width: 720px)')

    // 연속 학습일수 계산 함수
    const calculateConsecutiveDays = (activities) => {
        if (!activities || activities.length === 0) return 0
        
        // answered_at을 날짜 기준으로 정렬 (최신순)
        const sortedActivities = [...activities]
            .filter(act => act.answered_at)
            .map(act => {
                const date = new Date(act.answered_at)
                date.setHours(0, 0, 0, 0)
                return date
            })
            .sort((a, b) => b.getTime() - a.getTime())
        
        if (sortedActivities.length === 0) return 0
        
        // 오늘 날짜 확인
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayTime = today.getTime()
        
        // 오늘 답변이 있는지 확인
        const hasTodayAnswer = sortedActivities.some(date => date.getTime() === todayTime)
        
        // 오늘 답변이 없으면 0 반환 (답변을 해야만 오늘 날짜를 카운트)
        if (!hasTodayAnswer) return 0
        
        // 연속일수 계산
        let consecutiveDays = 1
        let expectedDate = new Date(today)
        
        for (let i = 0; i < sortedActivities.length; i++) {
            const activityDate = sortedActivities[i]
            const expectedTime = expectedDate.getTime()
            const activityTime = activityDate.getTime()
            
            if (activityTime === expectedTime) {
                consecutiveDays++
                expectedDate.setDate(expectedDate.getDate() - 1)
            } else if (activityTime < expectedTime) {
                // 연속이 끊김
                break
            }
        }
        
        return consecutiveDays
    }

    // 로컬 기준 날짜 키 생성 헬퍼 (예: '2025-12-1')
    const getLocalDateKey = (date) => {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }

    // 활동 잔디 데이터 생성 함수
    const generateActivityHeatmap = (activities) => {
        // 1년치 잔디 생성 (52주)
        const weeks = 52
        const totalDays = weeks * 7
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // 오늘이 속한 주의 시작일(일요일) 계산
        const todayDayOfWeek = today.getDay() // 0=일요일, 6=토요일

        // 오늘이 마지막 주의 올바른 위치에 오도록 시작 날짜 계산
        // 52주 전의 일요일을 시작점으로 설정 (오늘이 마지막 주의 해당 요일에 위치)
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - (totalDays - 1) - todayDayOfWeek)
        startDate.setHours(0, 0, 0, 0)

        console.log('[generateActivityHeatmap] Input activities:', activities)
        console.log('[generateActivityHeatmap] Activities length:', activities?.length)
        console.log('[generateActivityHeatmap] Start date:', startDate)
        console.log('[generateActivityHeatmap] Today:', today)

        if (!activities || activities.length === 0) {
            console.log('[generateActivityHeatmap] No activities, returning empty heatmap')
            // 빈 잔디 반환 (1년치, 52주)
            return {
                data: Array.from({length: weeks}, () => Array(7).fill(0)),
                scoreMap: new Map(),
                startDate,
            }
        }
        
        // 날짜별 점수 정보를 맵으로 저장 (같은 날짜에 여러 답변이 있으면 최신 점수 사용)
        // 키는 로컬 날짜 문자열로 통일하여 타임존 이슈 방지
        const activityScoreMap = new Map()
        activities.forEach((act, index) => {
            // 다양한 필드명 시도 (answered_at, answeredAt, date 등)
            const answeredAt = act.answered_at || act.answeredAt || act.date || act.created_at || act.createdAt
            
            if (answeredAt) {
                const date = new Date(answeredAt)
                
                // 유효한 날짜인지 확인
                if (isNaN(date.getTime())) {
                    console.warn(`[generateActivityHeatmap] Invalid date at index ${index}:`, answeredAt, act)
                    return
                }
                
                // 날짜를 로컬 시간 기준으로 정규화 (시간 부분 제거)
                date.setHours(0, 0, 0, 0)
                
                const dateKey = getLocalDateKey(date)
                const score = act.score ?? act.points ?? 0
                
                console.log(`[generateActivityHeatmap] Activity ${index}:`, {
                    answeredAt,
                    parsedDate: date,
                    dateKey,
                    score
                })
                
                const existingScore = activityScoreMap.get(dateKey)
                if (!existingScore || new Date(answeredAt) > new Date(existingScore.answered_at)) {
                    activityScoreMap.set(dateKey, {
                        score: score,
                        answered_at: answeredAt,
                    })
                }
            } else {
                console.warn(`[generateActivityHeatmap] No answered_at field at index ${index}:`, act)
            }
        })
        
        console.log('[generateActivityHeatmap] Activity score map size:', activityScoreMap.size)
        console.log('[generateActivityHeatmap] Activity score map all keys:', Array.from(activityScoreMap.keys()))
        console.log('[generateActivityHeatmap] Activity score map entries:', Array.from(activityScoreMap.entries()))
        
        // 날짜 범위 확인
        const endDate = new Date(today)
        endDate.setHours(23, 59, 59, 999)
        console.log('[generateActivityHeatmap] Date range:', {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            today: today.toISOString(),
            totalDays
        })
        
        // 주 단위 배열 생성
        const heatmapData = []
        let filledCells = 0
        const matchedDates = []
        
        for (let week = 0; week < weeks; week++) {
            const weekData = []
            for (let day = 0; day < 7; day++) {
                const dayOffset = week * 7 + day
                const cellDate = new Date(startDate)
                cellDate.setDate(cellDate.getDate() + dayOffset)
                cellDate.setHours(0, 0, 0, 0)
                
                const dateKey = getLocalDateKey(cellDate)
                // 해당 날짜에 답변이 있으면 1, 없으면 0
                const hasActivity = activityScoreMap.has(dateKey)
                
                if (hasActivity) {
                    filledCells++
                    matchedDates.push(dateKey)
                }
                
                // 디버깅: 첫 번째 주의 첫 번째 날짜와 마지막 날짜만 로그
                if ((week === 0 && day === 0) || (week === weeks - 1 && day === 6)) {
                    console.log(`[generateActivityHeatmap] Cell [${week}][${day}]:`, {
                        cellDate: cellDate.toISOString(),
                        dateKey,
                        hasActivity,
                        inMap: activityScoreMap.has(dateKey)
                    })
                }
                
                weekData.push(hasActivity ? 1 : 0)
            }
            heatmapData.push(weekData)
        }

        console.log('[generateActivityHeatmap] Filled cells count:', filledCells)
        console.log('[generateActivityHeatmap] Matched dates:', matchedDates)
        console.log('[generateActivityHeatmap] Activity score map all keys:', Array.from(activityScoreMap.keys()))
        console.log('[generateActivityHeatmap] Heatmap data sample (first week):', heatmapData[0])

        // 안전장치: 오늘 날짜에 활동이 있다면 해당 칸을 반드시 1로 강제
        const todayKey = getLocalDateKey(today)
        if (activityScoreMap.has(todayKey)) {
            const diffDays = Math.round(
                (today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
            )
            if (diffDays >= 0 && diffDays < totalDays) {
                const todayWeek = Math.floor(diffDays / 7)
                const todayDay = diffDays % 7
                if (heatmapData[todayWeek]) {
                    heatmapData[todayWeek][todayDay] = 1
                }
            }
        }
        
        return {
            data: heatmapData,
            scoreMap: activityScoreMap,
            startDate,
        }
    }

    // API 데이터 기반 계산값
    const answerCount = summaryData?.answered_question_count 
        ? summaryData.answered_question_count.toLocaleString('ko-KR') 
        : (scoreHistory?.length ?? 0).toLocaleString('ko-KR')
    
    const pointsDisplay = summaryData?.points 
        ? summaryData.points.toLocaleString('ko-KR') 
        : '0'
    
    const pointsNumeric = summaryData?.points ?? 0
    const milestoneStep = 1000
    const currentIntoStep = pointsNumeric % milestoneStep
    const nextBonusAt = Math.ceil(pointsNumeric / milestoneStep) * milestoneStep || milestoneStep
    const remainingToBonus = Math.max(0, nextBonusAt - pointsNumeric)
    const progressPct = Math.min(100, Math.round((currentIntoStep / milestoneStep) * 100))
    
    const userName = summaryData?.name ?? user?.name ?? 'PrePair 사용자'
    
    // 활동 잔디 데이터 (API 데이터 우선, 없으면 기존 activity 사용)
    const activityHeatmapData = useMemo(() => {
        console.log('[RewardsOverview] activityHeatmapData useMemo - summaryData:', summaryData)
        console.log('[RewardsOverview] activityHeatmapData useMemo - summaryData?.activities:', summaryData?.activities)
        
        // 다양한 필드명 시도 (activities, activity_list, activityHistory 등)
        let activitiesArray = null
        if (summaryData) {
            activitiesArray = summaryData.activities || 
                            summaryData.activity_list || 
                            summaryData.activityHistory || 
                            summaryData.answers ||
                            summaryData.answer_history ||
                            (Array.isArray(summaryData) ? summaryData : null)
        }
        
        if (activitiesArray && Array.isArray(activitiesArray) && activitiesArray.length > 0) {
            console.log('[RewardsOverview] Using activities array for heatmap, length:', activitiesArray.length)
            const result = generateActivityHeatmap(activitiesArray)
            console.log('[RewardsOverview] Generated heatmap result:', {
                dataLength: result.data.length,
                scoreMapSize: result.scoreMap.size,
                startDate: result.startDate,
                filledCellsCount: result.data.flat().filter(v => v > 0).length
            })
            return result
        }
        
        console.log('[RewardsOverview] No valid activities found, falling back to activity from context')
        console.log('[RewardsOverview] Fallback activity length:', activity?.length)
        // 기존 activity 형식에 맞춰 변환
        return {
            data: activity,
            scoreMap: new Map(),
            startDate: null,
        }
    }, [summaryData, activity])
    
    const activityHeatmap = activityHeatmapData.data
    const activityScoreMap = activityHeatmapData.scoreMap
    const heatmapStartDate = activityHeatmapData.startDate
    
    // 오늘의 점수: 오늘의 질문에 처음으로 남긴 답변의 점수 사용
    const todayScore = useMemo(() => {
        // API에서 today_score가 있으면 사용
        if (summaryData?.today_score != null && summaryData.today_score !== '') {
            return summaryData.today_score.toLocaleString('ko-KR')
        }
        
        // 오늘의 질문에 답변이 있는 경우, 해당 답변의 점수 찾기
        if (todayQuestion?.answered_at && summaryData?.activities) {
            const answeredAt = new Date(todayQuestion.answered_at)
            answeredAt.setHours(0, 0, 0, 0)
            const answeredAtTime = answeredAt.getTime()
            
            // 오늘의 질문에 대한 첫 번째 답변 찾기
            const todayAnswers = summaryData.activities
                .filter(act => {
                    if (!act.answered_at) return false
                    const actDate = new Date(act.answered_at)
                    actDate.setHours(0, 0, 0, 0)
                    return actDate.getTime() === answeredAtTime
                })
                .sort((a, b) => new Date(a.answered_at) - new Date(b.answered_at))
            
            if (todayAnswers.length > 0 && todayAnswers[0].score != null) {
                return todayAnswers[0].score.toLocaleString('ko-KR')
            }
        }
        
        // 활동 데이터에서 오늘 날짜의 점수 찾기
        if (activityScoreMap && activityScoreMap.size > 0) {
            const today = new Date()
            const todayKey = getLocalDateKey(today)
            const todayActivity = activityScoreMap.get(todayKey)
            
            if (todayActivity && todayActivity.score != null) {
                return todayActivity.score.toLocaleString('ko-KR')
            }
        }
        
        // 둘 다 없으면 '-' 표시
        return '-'
    }, [summaryData?.today_score, summaryData?.activities, todayQuestion, activityScoreMap])
    
    // 연속 학습일수 계산 (활동잔디 데이터 기반 - 활동잔디와 일치하도록)
    const calculatedStreakDays = useMemo(() => {
        if (!activityScoreMap || activityScoreMap.size === 0) return 0
        
        const today = new Date()
        const todayKey = getLocalDateKey(today)
        
        // 오늘 답변이 있는지 확인
        if (!activityScoreMap.has(todayKey)) return 0
        
        // 연속일수 계산 (오늘부터 역순으로)
        let consecutiveDays = 1
        let checkDate = new Date(today)
        
        while (true) {
            checkDate.setDate(checkDate.getDate() - 1)
            const checkKey = getLocalDateKey(checkDate)
            
            if (activityScoreMap.has(checkKey)) {
                consecutiveDays++
            } else {
                break
            }
        }
        
        return consecutiveDays
    }, [activityScoreMap])
    
    // 연속 학습일수: 계산된 값 우선, 없으면 API 값 사용
    const streakDays = calculatedStreakDays > 0 ? calculatedStreakDays : (summaryData?.consecutive_days ?? 0)
    const streakEmoji =
        streakDays >= 30 ? '🔥🔥🔥' :
        streakDays >= 14 ? '🔥🔥' :
        streakDays >= 7 ? '🔥' :
        streakDays >= 3 ? '✨' : '🌱'
    
    // 2개월(≈9주) 단위로 잔디를 분할해 슬라이드로 표시
    const chunkSize = 9
    const activityChunks = isMobile
        ? Array.from({length: Math.ceil(activityHeatmap.length / chunkSize)}, (_, i) =>
            activityHeatmap.slice(i * chunkSize, i * chunkSize + chunkSize),
        )
        : [activityHeatmap]
    const [slideIdx, setSlideIdx] = useState(0)
    const sliderRef = useRef(null)

    const goToSlide = (nextIdx) => {
        const maxIdx = activityChunks.length - 1
        const clamped = Math.max(0, Math.min(maxIdx, nextIdx))
        setSlideIdx(clamped)
        const slider = sliderRef.current
        if (slider && slider.children[clamped]) {
            slider.children[clamped].scrollIntoView({behavior: 'smooth', inline: 'start', block: 'nearest'})
        }
    }

    useEffect(() => {
        if (redirectSource) {
            navigate(location.pathname, {replace: true})
        }
    }, [navigate, redirectSource, location.pathname])

    // 사용자 요약 정보를 가져오는 함수
    const fetchSummaryData = useCallback(() => {
        if (user?.id) {
            let userId = user.id
            
            if (!userId || userId.trim() === '') {
                userId = 'u_edjks134n' // 테스트용 userId
                console.warn('[RewardsOverview] User ID가 없어 테스트용 ID를 사용합니다:', userId)
            }
            
            setIsLoadingSummary(true)
            setSummaryError('')
            
            getUserSummary(userId)
                .then((data) => {
                    console.log('[RewardsOverview Summary] Success:', data)
                    console.log('[RewardsOverview Summary] Data structure:', {
                        hasActivities: !!data?.activities,
                        activitiesType: Array.isArray(data?.activities) ? 'array' : typeof data?.activities,
                        activitiesLength: Array.isArray(data?.activities) ? data.activities.length : 'N/A',
                        activitiesSample: Array.isArray(data?.activities) && data.activities.length > 0 ? data.activities[0] : null,
                        allKeys: data ? Object.keys(data) : []
                    })
                    setSummaryData(data)
                    setIsLoadingSummary(false)
                })
                .catch((error) => {
                    console.error('[RewardsOverview Summary] 요약 정보 가져오기 오류:', error)
                    setSummaryError(error.message || '요약 정보를 불러오는데 실패했습니다.')
                    setIsLoadingSummary(false)
                    // 에러가 발생해도 기존 로직으로 폴백
                    setSummaryData(null)
                })
        } else {
            setIsLoadingSummary(false)
            setSummaryData(null)
        }
    }, [user?.id])

    // 사용자 요약 정보 API 호출
    useEffect(() => {
        fetchSummaryData()
    }, [fetchSummaryData])

    // 페이지 포커스 시 데이터 새로고침 (답변 후 포인트 업데이트 반영)
    useEffect(() => {
        const handleFocus = () => {
            fetchSummaryData()
        }
        
        window.addEventListener('focus', handleFocus)
        return () => {
            window.removeEventListener('focus', handleFocus)
        }
    }, [fetchSummaryData])

    // 오늘의 질문 API 호출
    useEffect(() => {
        if (user?.id) {
            // userId 확인: user.id가 없으면 테스트용 userId 사용
            let userId = user.id
            
            // user.id가 없거나 빈 문자열인 경우에만 테스트용 ID 사용
            if (!userId || userId.trim() === '') {
                userId = 'u_edjks134n' // 테스트용 userId
                console.warn('[RewardsOverview] User ID가 없어 테스트용 ID를 사용합니다:', userId)
            }
            
            setIsLoadingTodayQuestion(true)
            setTodayQuestionError('')
            
            getTodayQuestion(userId)
                .then((data) => {
                    console.log('[RewardsOverview Today Question] Success:', data)
                    setTodayQuestion(data)
                    setIsLoadingTodayQuestion(false)
                })
                .catch((error) => {
                    console.error('[RewardsOverview Today Question] 오늘의 질문 가져오기 오류:', error)
                    setTodayQuestionError(error.message || '오늘의 질문을 불러오는데 실패했습니다.')
                    setIsLoadingTodayQuestion(false)
                    // 에러가 발생해도 기존 로직으로 폴백
                    setTodayQuestion(null)
                })
        } else {
            setIsLoadingTodayQuestion(false)
            setTodayQuestion(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])

    return (
        <div className="rewards">
            <header className="rewards__header">
                <div>
                    <h1>{userName}님의 마이페이지</h1>
                </div>
            </header>

            {isLoadingTodayQuestion ? (
                <section className="rewards__dispatch rewards__dispatch--main">
                    <header>
                        <h2>오늘의 질문</h2>
                    </header>
                    <article className="dispatch-card dispatch-card--empty">
                        <p>오늘의 질문을 불러오는 중...</p>
                    </article>
                </section>
            ) : todayQuestionError && !todayQuestion ? (
                // API 에러가 있는 경우
                <section className="rewards__dispatch rewards__dispatch--main">
                    <header>
                        <h2>오늘의 질문</h2>
                        <p className="rewards__error-text" style={{color: '#d32f2f', fontSize: '0.875rem'}}>
                            {todayQuestionError}
                        </p>
                    </header>
                    <article className="dispatch-card dispatch-card--empty">
                        <p>오늘의 질문을 불러올 수 없습니다.</p>
                        <Link to="/settings" className="cta-button cta-button--primary">
                            루틴 설정하러 가기
                        </Link>
                    </article>
                </section>
            ) : todayQuestion ? (
                // API에서 가져온 오늘의 질문 표시
                <section className="rewards__dispatch rewards__dispatch--main">
                    <header>
                        <h2>오늘의 질문</h2>
                    </header>
                    <article className="dispatch-card">
                        <div className="dispatch-card__row">
                            <div className="dispatch-card__content">
                                <h3>Q. {todayQuestion.question}</h3>
                                {todayQuestion.status === 'ANSWERED' && todayQuestion.answered_at && (
                                    <p style={{color: '#666', fontSize: '0.875rem', marginTop: '0.5rem'}}>
                                        답변 완료 ({new Date(todayQuestion.answered_at).toLocaleDateString('ko-KR')})
                                    </p>
                                )}
                            </div>
                            <div className="dispatch-card__actions">
                                <Link to="/coach" className="cta-button cta-button--primary">
                                    {todayQuestion.status === 'ANSWERED' ? '답변 보기' : '답변하러 가기'}
                                </Link>
                            </div>
                        </div>
                    </article>
                </section>
            ) : (
                // API 데이터가 없는 경우
                <section className="rewards__dispatch rewards__dispatch--main">
                    <header>
                        <h2>오늘의 질문</h2>
                        <p>아직 받은 질문이 없습니다. 설정에서 루틴을 시작하세요!</p>
                    </header>
                    <article className="dispatch-card dispatch-card--empty">
                        <p>오늘의 질문을 불러올 수 없습니다.</p>
                        <Link to="/settings" className="cta-button cta-button--primary">
                            루틴 설정하러 가기
                        </Link>
                    </article>
                </section>
            )}

            <section className="rewards__inline-stats" aria-live="polite">
                <Link to="/coach" state={{panel: 'history'}} className="inline-chip" style={{textDecoration: 'none'}}>
                    <span>답변한 질문</span>
                    <strong>{answerCount}개</strong>
                </Link>
                <div className="inline-chip">
                    <span>오늘의 점수</span>
                    <strong>{todayScore} 점</strong>
                </div>
            </section>

            <section className="rewards__heatmap">
                <header>
                    <div>
                        <h2>활동 잔디</h2>
                        <p>1년 동안의 기록</p>
                    </div>
                    <div className="rewards__streak-chip">
                        <span>연속 학습 {streakEmoji}</span>
                        <strong>{streakDays}일째</strong>
                    </div>
                </header>
                {isMobile ? (
                    <div className="heatmap-slider-wrap">
                        <button
                            type="button"
                            className="heatmap-nav-btn heatmap-nav-btn--prev"
                            aria-label="이전 기간"
                            onClick={() => goToSlide(slideIdx - 1)}
                            disabled={slideIdx === 0}
                        >
                            ‹
                        </button>
                        <div ref={sliderRef} className="heatmap-slider" aria-label="최근 1년 잔디 (2개월씩)">
                            {activityChunks.map((chunk, idx) => (
                                <div key={idx} className="heatmap-slide">
                                    {(() => {
                                        // Compute month range label for this chunk
                                        const totalWeeks = activityHeatmap.length
                                        const daysTotal = totalWeeks * 7
                                        const baseStart = heatmapStartDate
                                            ? new Date(heatmapStartDate)
                                            : (() => {
                                                const fallbackStart = new Date()
                                                fallbackStart.setHours(0, 0, 0, 0)
                                                fallbackStart.setDate(fallbackStart.getDate() - (daysTotal - 1))
                                                return fallbackStart
                                            })()
                                        const chunkStart = new Date(baseStart.getTime() + idx * chunkSize * 7 * 24 * 60 * 60 * 1000)
                                        const chunkEnd = new Date(chunkStart.getTime() + (chunk.length * 7 - 1) * 24 * 60 * 60 * 1000)
                                        const label = `${chunkStart.getMonth() + 1}월 ~ ${chunkEnd.getMonth() + 1}월`
                                        return <div className="heatmap-slide-label">{label}</div>
                                    })()}
                                    <ContributionHeatmap
                                        data={chunk}
                                        scoreMap={activityScoreMap}
                                        startDate={heatmapStartDate}
                                        startDateOffset={idx * chunkSize * 7}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="heatmap-nav-btn heatmap-nav-btn--next"
                            aria-label="다음 기간"
                            onClick={() => goToSlide(slideIdx + 1)}
                            disabled={slideIdx >= activityChunks.length - 1}
                        >
                            ›
                        </button>
                    </div>
                ) : (
                    <ContributionHeatmap
                        data={activityHeatmap}
                        scoreMap={activityScoreMap}
                        startDate={heatmapStartDate}
                    />
                )}
            </section>

            <section className="rewards__purchases">
                <header>
                    <div>
                        <h2>나의 구매 내역</h2>
                        <p>나의 리워드 교환 내역을 확인하세요.</p>
                    </div>
                    <div className="rewards__points-row">
                        <div className="rewards__points-chip">
                            <span>보유 포인트</span>
                            <strong>{pointsDisplay}</strong>
                        </div>
                        <div className="rewards__gauge" role="region" aria-label="보너스 게이지">
                            <div className="rewards__gauge-bar" aria-hidden="true">
                                <span style={{width: `${progressPct}%`}} />
                            </div>
                            <div className="rewards__gauge-meta">
                                <small>다음 보너스까지 {remainingToBonus.toLocaleString()} 포인트</small>
                                <small>{nextBonusAt.toLocaleString()} 포인트 도달 시 +100 포인트</small>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="rewards__purchases-cta">
                    <Link to="/rewards/history" className="cta-button cta-button--ghost">
                        교환 내역 보기
                    </Link>
                    <Link to="/rewards/shop" className="cta-button cta-button--primary">
                        리워드샵 가기
                    </Link>
                </div>
            </section>
        </div>
    )
}
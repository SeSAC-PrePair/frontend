import {useEffect, useRef, useState} from 'react'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import ContributionHeatmap from '../../components/ContributionHeatmap'
import {useAppState} from '../../context/AppStateContext'
import {getTodayQuestion} from '../../utils/feedbackApi'
import '../../styles/pages/Rewards.css'
import useMediaQuery from '../../hooks/useMediaQuery'

export default function RewardsOverview() {
    const location = useLocation()
    const navigate = useNavigate()
    const {user, activity, sentQuestions, scoreHistory} = useAppState()

    const [todayQuestion, setTodayQuestion] = useState(null)
    const [isLoadingTodayQuestion, setIsLoadingTodayQuestion] = useState(false)
    const [todayQuestionError, setTodayQuestionError] = useState('')

    // 기존 latestDispatch는 폴백으로 사용
    const latestDispatch = sentQuestions[0] ?? null
    const answerCount = (scoreHistory?.length ?? 0).toLocaleString('ko-KR')
    const pointsDisplay = user?.points?.toLocaleString() ?? '0'
    const pointsNumeric = user?.points ?? 0
    const milestoneStep = 1000
    const currentIntoStep = pointsNumeric % milestoneStep
    const nextBonusAt = Math.ceil(pointsNumeric / milestoneStep) * milestoneStep || milestoneStep
    const remainingToBonus = Math.max(0, nextBonusAt - pointsNumeric)
    const progressPct = Math.min(100, Math.round((currentIntoStep / milestoneStep) * 100))
    const latestEntry = scoreHistory?.[0] ?? null
    const isSameDay = (iso) => {
        if (!iso) return false
        const d = new Date(iso)
        const now = new Date()
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
    }
    const todayScore = isSameDay(latestEntry?.submittedAt) ? latestEntry.score.toLocaleString('ko-KR') : '-'
    const redirectSource = location.state?.from
    const streakDays = user?.streak ?? 0;
    const streakEmoji =
        streakDays >= 30 ? '🔥🔥🔥' :
        streakDays >= 14 ? '🔥🔥' :
        streakDays >= 7 ? '🔥' :
        streakDays >= 3 ? '✨' : '🌱'
    const isMobile = useMediaQuery('(max-width: 720px)')

    // 2개월(≈9주) 단위로 잔디를 분할해 슬라이드로 표시
    const chunkSize = 9
    const activityChunks = isMobile
        ? Array.from({length: Math.ceil(activity.length / chunkSize)}, (_, i) =>
            activity.slice(i * chunkSize, i * chunkSize + chunkSize),
        )
        : [activity]
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
                    <h1>{user?.name ?? 'PrePair 사용자'}님의 마이페이지</h1>
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
                // API 에러가 있고 폴백 데이터도 없는 경우
                <section className="rewards__dispatch rewards__dispatch--main">
                    <header>
                        <h2>오늘의 질문</h2>
                        {latestDispatch ? (
                            <>
                                <p className="rewards__error-text" style={{color: '#d32f2f', fontSize: '0.875rem'}}>
                                    {todayQuestionError} (기존 데이터 표시)
                                </p>
                            </>
                        ) : (
                            <p>아직 받은 질문이 없습니다. 설정에서 루틴을 시작하세요!</p>
                        )}
                    </header>
                    {latestDispatch ? (
                        <article className="dispatch-card">
                            <div className="dispatch-card__row">
                                <div className="dispatch-card__content">
                                    <h3>Q. {latestDispatch.prompt}</h3>
                                    <p>{latestDispatch.subPrompt}</p>
                                </div>
                                <div className="dispatch-card__actions">
                                    <Link to="/coach" className="cta-button cta-button--primary">
                                        답변하러 가기
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ) : (
                        <article className="dispatch-card dispatch-card--empty">
                            <p>받은 질문이 없습니다.</p>
                            <Link to="/settings" className="cta-button cta-button--primary">
                                루틴 설정하러 가기
                            </Link>
                        </article>
                    )}
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
            ) : latestDispatch ? (
                // API 데이터가 없지만 기존 데이터가 있는 경우 (폴백)
                <section className="rewards__dispatch rewards__dispatch--main">
                    <header>
                        <h2>오늘의 질문</h2>
                    </header>
                    <article className="dispatch-card">
                        <div className="dispatch-card__row">
                            <div className="dispatch-card__content">
                                <h3>Q. {latestDispatch.prompt}</h3>
                                <p>{latestDispatch.subPrompt}</p>
                            </div>
                            <div className="dispatch-card__actions">
                                <Link to="/coach" className="cta-button cta-button--primary">
                                    답변하러 가기
                                </Link>
                            </div>
                        </div>
                    </article>
                </section>
            ) : (
                // API 데이터도 없고 기존 데이터도 없는 경우
                <section className="rewards__dispatch rewards__dispatch--main">
                    <header>
                        <h2>오늘의 질문</h2>
                        <p>아직 받은 질문이 없습니다. 설정에서 루틴을 시작하세요!</p>
                    </header>
                    <article className="dispatch-card dispatch-card--empty">
                        <p>받은 질문이 없습니다.</p>
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
                                        const totalWeeks = activity.length
                                        const daysTotal = totalWeeks * 7
                                        const yearStart = new Date()
                                        yearStart.setHours(0, 0, 0, 0)
                                        yearStart.setDate(yearStart.getDate() - (daysTotal - 1))
                                        const chunkStart = new Date(yearStart.getTime() + idx * chunkSize * 7 * 24 * 60 * 60 * 1000)
                                        const chunkEnd = new Date(chunkStart.getTime() + (chunk.length * 7 - 1) * 24 * 60 * 60 * 1000)
                                        const label = `${chunkStart.getMonth() + 1}월 ~ ${chunkEnd.getMonth() + 1}월`
                                        return <div className="heatmap-slide-label">{label}</div>
                                    })()}
                                    <ContributionHeatmap data={chunk}/>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="heatmap-nav-btn heatmap-nav-btn--next"
                            aria-label="다음 기간"
                            onClick={() => goToSlide(slideIdx + 1)}
                            disabled={slideIdx === activityChunks.length - 1}
                        >
                            ›
                        </button>
                    </div>
                ) : (
                    <ContributionHeatmap data={activity}/>
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
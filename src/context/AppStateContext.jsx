import {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react'
import {
    cadenceMap,
    cadencePresets,
    jobTrackMap,
    jobTracks,
    notificationChannels as notificationChannelPresets,
} from '../constants/onboarding'

const AppStateContext = createContext(null)

const mockScoreHistory = [
    {
        id: 'session-008',
        question: '최근에 설계한 기능이 실패했을 때의 회고 과정을 설명해주세요.',
        score: 92,
        submittedAt: '2025-11-12T09:00:00.000Z',
        summary: '실패 원인을 데이터로 추적하고, 개선 로드맵을 제시한 점이 인상적입니다.',
        highlights: ['문제 재정의 능력', '팀 커뮤니케이션 전략', '재발 방지 플랜'],
        focusTags: ['Retro', 'Leadership', 'Learning Mindset'],
        strengths: ['데이터 근거로 원인을 규명했습니다.', '후속 로드맵을 명확히 설계했습니다.'],
        gaps: ['위기 당시 리스크 커뮤니케이션 절차가 다소 모호했습니다.'],
        recommendations: ['리스크 커뮤니케이션 스크립트를 미리 작성해 보세요.', '회고 회의 흐름을 3단계로 정리해 보세요.'],
        breakdown: {
            structure: 90,
            clarity: 94,
            depth: 93,
            story: 91,
        },
    },
    {
        id: 'session-007',
        question: '데이터 기반으로 제품 의사결정을 내린 경험을 설명해주세요.',
        score: 84,
        submittedAt: '2025-11-11T10:30:00.000Z',
        summary: '명확한 KPI를 두고 실험 설계를 진행한 정량 분석이 돋보입니다.',
        highlights: ['A/B 테스트 설계', '지표 읽는 방법', '팀 설득'],
        focusTags: ['Product Sense', 'Experiment'],
        strengths: ['실험 설계를 KPI에 직결시켰습니다.', '데이터 스토리텔링으로 팀을 설득했습니다.'],
        gaps: ['헬스 메트릭 대안이 조금 더 보강되면 좋습니다.'],
        recommendations: ['핵심/보조 지표를 구분해 스토리라인을 연습하세요.', '데이터 기반 설득 문장을 2~3개 준비해 보세요.'],
        breakdown: {
            structure: 82,
            clarity: 86,
            depth: 80,
            story: 88,
        },
    },
    {
        id: 'session-006',
        question: '서비스 지표가 급격히 하락했을 때 어떤 식의 원인 분석을 진행할 것인가요?',
        score: 76,
        submittedAt: '2025-11-10T08:20:00.000Z',
        summary: '이상 징후를 탐지하는 퍼널 진단 방법은 적절했으나, 후속 의사결정 근거가 조금 아쉬웠습니다.',
        highlights: ['퍼널 분석', '알람 설계'],
        focusTags: ['Diagnostics'],
        strengths: ['퍼널 전환율을 세분화해 진단했습니다.', '알람 기준을 명확히 설명했습니다.'],
        gaps: ['후속 실험 계획이 보다 구체적이면 설득력이 높아집니다.'],
        recommendations: ['이상 징후 대응 프로세스를 3단계로 정리해 보세요.', '추가 실험 아이디어를 숫자와 함께 제시해 보세요.'],
        breakdown: {
            structure: 72,
            clarity: 78,
            depth: 74,
            story: 80,
        },
    },
]

const questionBank = [
    {
        id: 'q-people-001',
        trackId: 'people',
        roleId: 'cabin-crew',
        prompt: '기내에서 예기치 못한 이슈를 해결했던 경험을 STAR 구조로 설명해 주세요.',
        subPrompt: '상황, 즉각적인 대응, 고객 반응, 배운 점을 순서대로 들려주세요.',
        tags: ['Customer Care', 'Communication', 'Poise'],
    },
    {
        id: 'q-people-002',
        trackId: 'people',
        roleId: 'csr',
        prompt: '클레임 고객을 만족시킨 경험이 있다면 상세히 설명해 주세요.',
        subPrompt: '고객의 초기 감정, 공감 방식, 해결 프로세스, 결과를 포함해주세요.',
        tags: ['Empathy', 'Conflict Resolution'],
    },
    {
        id: 'q-leadership-001',
        trackId: 'leadership',
        roleId: 'pm',
        prompt: '프로젝트 리더로서 위기 상황을 조율했던 순간을 회고해 주세요.',
        subPrompt: '문제 정의, 이해관계자 정렬, 의사결정, 학습을 중심으로 이야기하면 좋아요.',
        tags: ['Leadership', 'Stakeholder', 'Decision Making'],
    },
    {
        id: 'q-leadership-002',
        trackId: 'leadership',
        roleId: 'startup-dev',
        prompt: '스타트업에서 제품을 빠르게 고도화한 경험을 공유해주세요.',
        subPrompt: '우선순위, 커뮤니케이션, 실행 전략, 성과를 포함해 주세요.',
        tags: ['Product Strategy', 'Execution'],
    },
    {
        id: 'q-creative-001',
        trackId: 'creative',
        roleId: 'marketer',
        prompt: '가장 임팩트 있었던 캠페인 기획과 성과를 이야기해주세요.',
        subPrompt: '인사이트, 컨셉, 실행, 성과 지표, 배운 점을 짚어주세요.',
        tags: ['Storytelling', 'Creativity', 'Metrics'],
    },
    {
        id: 'q-creative-002',
        trackId: 'creative',
        roleId: 'designer',
        prompt: '디자인 시스템을 구축하거나 개편한 경험이 있다면 설명해 주세요.',
        subPrompt: '문제 정의, 의사결정 기준, 협업 구조, 결과를 담아주세요.',
        tags: ['Design System', 'Collaboration'],
    },
    {
        id: 'q-technical-001',
        trackId: 'technical',
        roleId: 'frontend',
        prompt: '웹 성능 병목을 발견하고 개선했던 사례를 공유해주세요.',
        subPrompt: '탐지 도구, 개선 실험, 성과, 커뮤니케이션 방식까지 포함해주세요.',
        tags: ['Performance', 'Engineering'],
    },
    {
        id: 'q-technical-002',
        trackId: 'technical',
        roleId: 'backend',
        prompt: '대규모 트래픽 증가에 대비해 시스템을 확장했던 경험을 설명해 주세요.',
        subPrompt: '문제 진단, 설계 선택, 리스크 관리, 결과를 중심으로 말해주세요.',
        tags: ['Architecture', 'Scalability'],
    },
    {
        id: 'q-technical-003',
        trackId: 'technical',
        roleId: 'rnd',
        prompt: '연구 프로젝트에서 실험 설계를 주도했던 경험을 들려주세요.',
        subPrompt: '가설 설정, 실험 방법, 결과 해석, 후속 학습을 포함하면 좋아요.',
        tags: ['Research', 'Analytical Thinking'],
    },
    {
        id: 'q-creative-003',
        trackId: 'creative',
        roleId: 'planner',
        prompt: '서비스 기획 단계에서 비즈니스 임팩트를 만든 사례를 소개해주세요.',
        subPrompt: '문제 정의, 리서치, 솔루션, 결과를 순차적으로 공유해주세요.',
        tags: ['Product Sense', 'Insight'],
    },
    {
        id: 'q-people-003',
        trackId: 'people',
        roleId: 'civil',
        prompt: '민원 응대 과정에서 제도를 개선했던 경험이 있다면 설명해주세요.',
        subPrompt: '민원 유형, 분석, 개선안, 만족도 변화를 포함하면 좋아요.',
        tags: ['Service Innovation', 'Policy'],
    },
    {
        id: 'q-leadership-003',
        trackId: 'leadership',
        roleId: 'hr',
        prompt: '조직문화를 개선하기 위해 설계한 프로그램이 있다면 공유해주세요.',
        subPrompt: '문제 인식, 설계, 실행, 성과, 배운 점을 이야기해주세요.',
        tags: ['Culture', 'HR Strategy'],
    },
]

const scoringRubric = [
    {
        id: 'structure',
        label: '구조화',
        rule: '질문에 맞는 MECE한 골격과 논리적인 진행으로 답변을 전개했는지 평가합니다.',
        weight: 0.25,
    },
    {
        id: 'clarity',
        label: '명료성',
        rule: '핵심 메시지가 명확하고 간결하게 전달되며, 용어 선택이 정확한지 확인합니다.',
        weight: 0.25,
    },
    {
        id: 'depth',
        label: '깊이',
        rule: '근거, 데이터, 인사이트, 배운 점 등 깊이 있는 내용이 포함되었는지 판단합니다.',
        weight: 0.3,
    },
    {
        id: 'story',
        label: '스토리텔링',
        rule: '서사, 감정선, 팀워크 등의 요소를 활용해 몰입감 있게 전달했는지 측정합니다.',
        weight: 0.2,
    },
]

const defaultActivity = Array.from({length: 53}, (_, weekIndex) =>
    Array.from({length: 7}, (_, dayIndex) => {
        const seed = (weekIndex + 2) * (dayIndex + 3)
        if (seed % 11 === 0) return 0
        if (seed % 5 === 0) return 4
        if (seed % 3 === 0) return 3
        if (seed % 2 === 0) return 2
        return 1
    }),
)

const defaultPurchases = [
    {
        id: 'purchase-001',
        rewardId: 'gs25-night-pack',
        name: 'GS25 야식 리셋팩',
        cost: 450,
        purchasedAt: '2025-11-05T07:00:00.000Z',
        deliveryStatus: '바코드 발급',
        usageStatus: 'ready',
        barcode: '9245 1180 6623 4471',
        pin: 'PP-311204',
        expiresAt: '2025-12-05T23:59:59.000Z',
        usedAt: null,
        memo: '',
    },
    {
        id: 'purchase-002',
        rewardId: 'cu-morning-coffee',
        name: 'CU 모닝 브루 세트',
        cost: 620,
        purchasedAt: '2025-11-02T06:40:00.000Z',
        deliveryStatus: 'PIN 번호 발급',
        usageStatus: 'ready',
        barcode: '7120 0041 9984 5512',
        pin: 'PP-773201',
        expiresAt: '2025-12-02T23:59:59.000Z',
        usedAt: null,
        memo: '',
    },
    {
        id: 'purchase-003',
        rewardId: 'mindfulness-pass',
        name: '마인드풀니스 클래스 패스',
        cost: 2400,
        purchasedAt: '2025-10-30T13:15:00.000Z',
        deliveryStatus: '바코드 발급',
        usageStatus: 'used',
        barcode: '6011 4523 1099 7744',
        pin: 'PP-128844',
        expiresAt: '2025-12-30T23:59:59.000Z',
        usedAt: '2025-11-08T15:00:00.000Z',
        memo: '',
    },
    {
        id: 'purchase-004',
        rewardId: 'app-store-5k',
        name: 'App Store · 구글플레이 5천원',
        cost: 700,
        purchasedAt: '2025-10-15T09:50:00.000Z',
        deliveryStatus: '기간 만료',
        usageStatus: 'expired',
        barcode: '3009 8420 6611 0744',
        pin: 'PP-660412',
        expiresAt: '2025-11-14T23:59:59.000Z',
        usedAt: null,
        memo: '기한 내 등록 필요',
    },
    {
        id: 'purchase-000',
        rewardId: 'book-culture-10k',
        name: '도서 문화 상품권 1만원',
        cost: 1000,
        purchasedAt: '2025-10-23T11:15:00.000Z',
        deliveryStatus: '사용 완료',
        usageStatus: 'used',
        barcode: '8810 4402 3324 9951',
        pin: 'PP-904411',
        expiresAt: '2026-10-23T23:59:59.000Z',
        usedAt: '2025-11-01T12:30:00.000Z',
        memo: '전자책 구매 시 사용',
    },
]

const defaultUserProfile = {
    id: 'user-001',
    name: '김하린',
    email: 'harin@careerbot.ai',
    desiredField: '프로덕트 매니저',
    jobTrackId: 'leadership',
    jobTrackLabel: jobTrackMap.leadership.label,
    jobRoleId: 'pm',
    jobRoleLabel: '프로젝트 매니저',
    customJobLabel: '',
    goal: '내년 상반기 글로벌 스타트업 PM 포지션 합격',
    focusArea: '프로덕트 전략',
    questionCadence: 'daily',
    questionCadenceLabel: cadenceMap.daily.label,
    questionSchedule: cadenceMap.daily.schedule,
    notificationChannels: notificationChannelPresets.filter((channel) => channel.isDefault).map((channel) => channel.id),
    avatar: '🌌',
    points: 620,
    streak: 9,
    tier: 'Growth Explorer',
    lastLoginAt: '2025-11-12T21:00:00.000Z',
}

const defaultChannels = notificationChannelPresets.filter((channel) => channel.isDefault).map((channel) => channel.id)

function generateMockBarcode() {
    return Array.from({length: 4}, () => String(Math.floor(1000 + Math.random() * 9000))).join(' ')
}

function generateMockPin() {
    return `PP-${Math.floor(100000 + Math.random() * 900000)}`
}

function calculateExpiry(days = 30) {
    const expires = new Date()
    expires.setDate(expires.getDate() + days)
    expires.setHours(23, 59, 59, 0)
    return expires.toISOString()
}

function getTrackLabel(trackId) {
    return jobTrackMap[trackId]?.label ?? trackId
}

function getRoleLabel(trackId, roleId) {
    const track = jobTrackMap[trackId]
    const role = track?.roles?.find((item) => item.id === roleId)
    return role?.label ?? roleId
}

function pickQuestionForProfile(profile, sequence = 0) {
    if (!profile) return null
    const trackId = profile.jobTrackId || profile.trackId
    const roleId = profile.jobRoleId || profile.roleId

    const pool = questionBank.filter((item) => {
        if (roleId && item.roleId === roleId) return true
        if (trackId && item.trackId === trackId) return true
        return false
    })

    const candidates = pool.length > 0 ? pool : questionBank
    const index = sequence % candidates.length
    return candidates[index]
}

function buildQuestionPacket({question, profile, channels, cadenceId}) {
    const uniqueChannels = Array.from(new Set([...defaultChannels, ...(channels || [])]))
    const cadence = cadenceMap[cadenceId] ?? null
    const trackLabel = getTrackLabel(question.trackId) || profile?.jobTrackLabel || profile?.desiredField || ''
    const roleLabel =
        getRoleLabel(question.trackId, question.roleId) || profile?.jobRoleLabel || profile?.desiredField || ''
    return {
        id: `dispatch-${Date.now()}`,
        questionId: question.id,
        prompt: question.prompt,
        subPrompt: question.subPrompt,
        tags: question.tags,
        jobTrackId: question.trackId,
        jobTrackLabel: trackLabel,
        roleId: question.roleId,
        roleLabel,
        cadenceId: cadenceId,
        cadenceLabel: cadence?.label ?? '',
        schedule: cadence?.schedule ?? '',
        channels: uniqueChannels,
        deliveredAt: new Date().toISOString(),
        userId: profile?.id,
        userEmail: profile?.email,
    }
}

function appendToHeatmap(activity) {
    const clone = activity.map((week) => [...week])
    const now = new Date()
    const day = now.getDay()
    const lastColumn = clone[clone.length - 1]
    lastColumn[day] = Math.min(4, lastColumn[day] + 1)
    return clone
}

export function AppProvider({children}) {
    const [user, setUser] = useState(null)
    const [scoreHistory, setScoreHistory] = useState(mockScoreHistory)
    const [activity, setActivity] = useState(defaultActivity)
    const [purchases, setPurchases] = useState(defaultPurchases)
    const [sentQuestions, setSentQuestions] = useState([])
    const [activeQuestion, setActiveQuestion] = useState(null)
    const [lastDispatch, setLastDispatch] = useState(null)
    const sequenceRef = useRef(0)

    const questionDispatchCount = sentQuestions.length

    const currentQuestion = useMemo(() => {
        if (activeQuestion) return activeQuestion
        if (!user) return null
        return pickQuestionForProfile(user, questionDispatchCount)
    }, [activeQuestion, questionDispatchCount, user])

    const lastFeedback = scoreHistory.length > 0 ? scoreHistory[0] : null

    const dispatchQuestion = useCallback(
        ({profile, channels, cadenceId, sequence} = {}) => {
            const baseProfile = profile ?? user
            if (!baseProfile) return null
            const baseCadence = cadenceId ?? baseProfile.questionCadence ?? cadencePresets[0].id
            const seq = sequence ?? sequenceRef.current
            const question = pickQuestionForProfile(baseProfile, seq)
            if (!question) return null

            const packet = buildQuestionPacket({
                question,
                profile: baseProfile,
                channels: channels ?? baseProfile.notificationChannels,
                cadenceId: baseCadence,
            })

            sequenceRef.current = seq + 1
            setActiveQuestion(question)
            setSentQuestions((prev) => [packet, ...prev])
            setLastDispatch(packet)
            return packet
        },
        [user],
    )

    const login = useCallback(
        ({email}) => {
            const fallback = {...defaultUserProfile, email: email || defaultUserProfile.email}
            setUser(fallback)
            setActiveQuestion(null)
            setSentQuestions([])
            setLastDispatch(null)
            sequenceRef.current = 0
            dispatchQuestion({
                profile: fallback,
                channels: fallback.notificationChannels,
                cadenceId: fallback.questionCadence,
                sequence: 0,
            })
            return fallback
        },
        [dispatchQuestion],
    )

    const signup = useCallback(
        (payload) => {
            const cadence = cadenceMap[payload.questionCadence] ?? cadencePresets[0]
            const trackLabel = getTrackLabel(payload.jobTrackId)
            const roleLabel =
                payload.jobRoleLabel || getRoleLabel(payload.jobTrackId, payload.jobRoleId) || trackLabel
            const mergedChannels =
                payload.notificationChannels && payload.notificationChannels.length > 0
                    ? Array.from(new Set([...defaultChannels, ...payload.notificationChannels]))
                    : defaultChannels

            const newProfile = {
                id: `user-${Date.now()}`,
                name: payload.name || 'PrePair 사용자',
                email: payload.email,
                desiredField: roleLabel,
                jobTrackId: payload.jobTrackId,
                jobTrackLabel: trackLabel,
                jobRoleId: payload.jobRoleId,
                jobRoleLabel: roleLabel,
                customJobLabel: payload.customJobLabel ?? '',
                goal: payload.goal,
                focusArea: payload.focusArea || '',
                questionCadence: cadence.id,
                questionCadenceLabel: cadence.label,
                questionSchedule: cadence.schedule,
                notificationChannels: mergedChannels,
                avatar: payload.avatar || '🚀',
                points: 520,
                streak: 1,
                tier: 'Trailblazer',
                lastLoginAt: new Date().toISOString(),
            }

            setUser(newProfile)
            setActiveQuestion(null)
            setSentQuestions([])
            setLastDispatch(null)
            sequenceRef.current = 0
            dispatchQuestion({
                profile: newProfile,
                channels: mergedChannels,
                cadenceId: cadence.id,
                sequence: 0,
            })
            return newProfile
        },
        [dispatchQuestion],
    )

    const logout = useCallback(() => {
        setUser(null)
        setActiveQuestion(null)
        setSentQuestions([])
        setLastDispatch(null)
        sequenceRef.current = 0
    }, [])

    const deleteAccount = useCallback(() => {
        setUser(null)
        setActiveQuestion(null)
        setSentQuestions([])
        setLastDispatch(null)
        setScoreHistory([])
        setActivity(defaultActivity)
        setPurchases([])
        sequenceRef.current = 0
    }, [])

    const updateSettings = useCallback((nextSettings) => {
        setUser((prev) => {
            if (!prev) return prev
            const cadence = nextSettings.questionCadence
                ? cadenceMap[nextSettings.questionCadence] ?? null
                : null
            return {
                ...prev,
                ...nextSettings,
                ...(cadence
                    ? {
                        questionCadence: cadence.id,
                        questionCadenceLabel: cadence.label,
                        questionSchedule: cadence.schedule,
                    }
                    : {}),
            }
        })
    }, [])

    const recordInterviewResult = useCallback(
        ({
             score,
             summary,
             highlights,
             breakdown,
             focusTags,
             question,
             strengths = [],
             gaps = [],
             recommendations = [],
             answer = '',
         }) => {
            const submittedAt = new Date().toISOString()

            setSentQuestions((prev) => {
                if (prev.length === 0) return prev
                const [latest, ...rest] = prev
                const alreadyAnswered = Boolean(latest.answeredAt)
                const bonus = Math.max(40, Math.round(score * 0.6))
                const earnedPoints = alreadyAnswered ? 0 : bonus
                const updated = {
                    ...latest,
                    answeredAt: submittedAt,
                    score,
                    answer,
                    earnedPoints,
                }
                return [updated, ...rest]
            })

            setScoreHistory((prev) => [
                {
                    id: `session-${Date.now()}`,
                    question,
                    score,
                    submittedAt,
                    summary,
                    highlights,
                    focusTags,
                    breakdown,
                    strengths,
                    gaps,
                    recommendations,
                    earnedPoints: Math.max(40, Math.round(score * 0.6)),
                    answer,
                },
                ...prev,
            ])

            setUser((prev) => {
                if (!prev) return prev
                const last = sentQuestions?.[0]
                const alreadyAnswered = last?.answeredAt != null
                const bonus = Math.max(40, Math.round(score * 0.6))
                const earned = alreadyAnswered ? 0 : bonus
                return {
                    ...prev,
                    points: prev.points + earned,
                    streak: prev.streak + 1,
                }
            })

            setActivity((prev) => appendToHeatmap(prev))
            dispatchQuestion()
        },
        [dispatchQuestion],
    )

    const redeemReward = useCallback(
        ({id, name, cost}) => {
            if (!user || user.points < cost) {
                return {success: false, reason: '포인트가 부족합니다.'}
            }

            setUser((prev) => {
                if (!prev) return prev
                return {...prev, points: prev.points - cost}
            })

            const record = {
                id: `${id}-${Date.now()}`,
                rewardId: id,
                name,
                cost,
                purchasedAt: new Date().toISOString(),
                deliveryStatus: '바코드 발급 완료',
                usageStatus: 'ready',
                barcode: generateMockBarcode(),
                pin: generateMockPin(),
                expiresAt: calculateExpiry(),
                usedAt: null,
                memo: '발급 즉시 사용 가능합니다.',
            }

            setPurchases((prev) => [record, ...prev])

            return {success: true, record}
        },
        [user],
    )

    const value = {
        user,
        login,
        signup,
        logout,
        deleteAccount,
        updateSettings,
        scoringRubric,
        currentQuestion,
        lastFeedback,
        scoreHistory,
        recordInterviewResult,
        activity,
        purchases,
        redeemReward,
        sentQuestions,
        lastDispatch,
        dispatchQuestion,
        jobTracks,
        cadencePresets,
        notificationChannelPresets,
    }

    return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
    const context = useContext(AppStateContext)
    if (!context) {
        throw new Error('useAppState must be used within AppProvider')
    }
    return context
}

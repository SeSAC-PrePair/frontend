import {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react'
import {
    cadenceMap,
    cadencePresets,
    jobTrackMap,
    jobTracks,
    jobData,
    notificationChannels as notificationChannelPresets,
} from '../constants/onboarding'
import {deleteUser} from '../utils/authApi'

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
    const [scoreHistory, setScoreHistory] = useState([])
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
        async ({email, password}) => {
            try {
                // API 요청 데이터 구성
                const requestData = {
                    email: email,
                    password: password,
                }

                // API 호출
                const response = await fetch('/api/auth/signin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                })

                // 에러 처리
                if (!response.ok) {
                    let errorData = {}
                    let errorText = ''
                    try {
                        errorText = await response.text()
                        if (errorText) {
                            errorData = JSON.parse(errorText)
                        }
                    } catch (e) {
                        console.error('[Login] Failed to parse error response:', e)
                        errorData = { raw: errorText }
                    }

                    if (response.status === 400) {
                        throw new Error(errorData.message || '이메일과 비밀번호는 필수 입력 항목입니다.')
                    } else if (response.status === 401) {
                        throw new Error(errorData.message || '이메일 또는 비밀번호가 올바르지 않습니다.')
                    } else {
                        throw new Error(errorData.message || `로그인에 실패했습니다. (${response.status})`)
                    }
                }

                // 성공 시 (201 Created 또는 200 OK) 응답 본문에서 user_id 가져오기
                let responseData = {}
                try {
                    // 응답 본문을 JSON으로 파싱
                    responseData = await response.json()
                } catch (e) {
                    console.error('[Login] Failed to parse response JSON:', e)
                    throw new Error('로그인 응답을 읽을 수 없습니다.')
                }

                // 응답 본문에서 user_id 추출 (우선순위: 응답 본문 > 헤더)
                const userId = responseData.user_id || response.headers.get('X-User-ID')
                
                if (!userId) {
                    console.error('[Login] Response data:', responseData)
                    console.error('[Login] Response headers:', Object.fromEntries(response.headers.entries()))
                    throw new Error('로그인 응답에서 사용자 ID를 받을 수 없습니다.')
                }

                // 로그인 성공 후 사용자 정보 설정
                // 응답 본문에서 받은 정보 사용
                const userProfile = {
                    ...defaultUserProfile,
                    id: userId,
                    email: responseData.email || email,
                    name: responseData.name || defaultUserProfile.name,
                }

                setUser(userProfile)
                setActiveQuestion(null)
                setSentQuestions([])
                setLastDispatch(null)
                sequenceRef.current = 0
                dispatchQuestion({
                    profile: userProfile,
                    channels: userProfile.notificationChannels,
                    cadenceId: userProfile.questionCadence,
                    sequence: 0,
                })
                
                return userProfile
            } catch (error) {
                // 에러를 다시 throw하여 호출하는 쪽에서 처리할 수 있도록 함
                throw error
            }
        },
        [dispatchQuestion],
    )

    const signup = useCallback(
        async (payload) => {
            try {
                // 기본 필수 필드 검증
                if (!payload.name || !payload.name.trim()) {
                    throw new Error('이름을 입력해주세요.')
                }
                if (!payload.email || !payload.email.trim()) {
                    throw new Error('이메일을 입력해주세요.')
                }
                if (!payload.password || !payload.password.trim()) {
                    throw new Error('비밀번호를 입력해주세요.')
                }

                // API 스펙에 맞게 데이터 변환
                const cadenceId = payload.cadence?.id || cadencePresets[0]?.id
                const cadence = cadenceMap[cadenceId] ?? cadencePresets[0]
                
                if (!cadence || !cadence.id) {
                    throw new Error('질문 주기를 선택해주세요.')
                }
                
                // job: 목표 직무 값 사용
                const job = payload.jobRole?.trim() || ''
                
                // schedule_type: cadence.id를 대문자로 변환 (예: "daily" -> "DAILY")
                const scheduleType = cadence.id.toUpperCase()
                
                // notification_type: 카카오톡 선택 시 "BOTH", 아니면 "EMAIL"
                const notificationType = payload.notificationKakao ? 'BOTH' : 'EMAIL'

                // 필수 필드 검증
                if (!job) {
                    throw new Error('목표 직무를 입력해주세요.')
                }
                if (!scheduleType || scheduleType.trim() === '') {
                    throw new Error('질문 주기를 선택해주세요.')
                }

                // API 요청 데이터 구성
                const requestData = {
                    name: payload.name,
                    email: payload.email,
                    password: payload.password,
                    settings: {
                        job: job,
                        schedule_type: scheduleType,
                        notification_type: notificationType,
                    },
                }

                // 디버깅: 요청 데이터 상세 로깅
                console.log('[Signup] Request data:', JSON.stringify(requestData, null, 2))
                console.log('[Signup] Payload:', payload)
                console.log('[Signup] Job:', job)
                console.log('[Signup] Schedule Type:', scheduleType)
                console.log('[Signup] Notification Kakao:', payload.notificationKakao)
                console.log('[Signup] Notification Type:', notificationType)

                // API 호출
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                })

                // 에러 처리
                if (!response.ok) {
                    let errorData = {}
                    let errorText = ''
                    try {
                        errorText = await response.text()
                        if (errorText) {
                            try {
                                errorData = JSON.parse(errorText)
                            } catch (parseError) {
                                // JSON 파싱 실패 시 텍스트 그대로 사용
                                errorData = { message: errorText || '알 수 없는 오류가 발생했습니다.' }
                            }
                        }
                    } catch (e) {
                        console.error('[Signup] Failed to read error response:', e)
                        errorData = { message: '서버 응답을 읽을 수 없습니다.' }
                    }
                    
                    // 디버깅: 에러 응답 상세 로깅
                    console.error('[Signup] ===== Error Response =====')
                    console.error('[Signup] Status:', response.status, response.statusText)
                    console.error('[Signup] Error Text:', errorText)
                    console.error('[Signup] Error Data:', errorData)
                    console.error('[Signup] Request Data:', JSON.stringify(requestData, null, 2))
                    console.error('[Signup] Request Headers:', {
                        'Content-Type': 'application/json',
                    })
                    console.error('[Signup] ===========================')
                    
                    if (response.status === 400) {
                        throw new Error(errorData.message || errorData.error || '입력 정보를 확인해주세요.')
                    } else if (response.status === 409) {
                        throw new Error(errorData.message || '이미 존재하는 이메일입니다.')
                    } else if (response.status === 500) {
                        // 500 오류의 경우 더 상세한 정보를 로깅하고 사용자에게 친절한 메시지 제공
                        const errorMessage = errorData.message || errorData.error || errorData.detail || errorData.raw || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
                        console.error('[Signup] 500 Internal Server Error - Full Details:', {
                            errorData,
                            errorText,
                            requestData,
                            payload,
                        })
                        throw new Error(`서버 오류가 발생했습니다: ${errorMessage}`)
                    } else {
                        throw new Error(errorData.message || errorData.error || `회원가입에 실패했습니다. (${response.status})`)
                    }
                }

                // API 응답에서 user_id 받기 (응답 본문 또는 헤더에서)
                const responseData = await response.json()
                const userId = responseData.user_id || response.headers.get('X-User-ID')

                if (!userId) {
                    console.error('[Signup] Response data:', responseData)
                    console.error('[Signup] Response headers:', Object.fromEntries(response.headers.entries()))
                    throw new Error('회원가입 응답에서 user_id를 받을 수 없습니다.')
                }

                // 모든 경우에 첫 인터뷰 질문 발송 (카카오 알림 선택 여부와 관계없이)
                // 카카오 알림은 나중에 설정에서 인증할 수 있음
                try {
                    const firstInterviewResponse = await fetch('/api/interviews/first', {
                        method: 'POST',
                        headers: {
                            'X-User-ID': userId,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({}),
                    })

                    if (!firstInterviewResponse.ok) {
                        let errorText = '';
                        let errorData = {};
                        try {
                            errorText = await firstInterviewResponse.text();
                            if (errorText) {
                                try {
                                    errorData = JSON.parse(errorText);
                                } catch (e) {
                                    errorData = { raw: errorText };
                                }
                            }
                        } catch (e) {
                            console.error('[Signup] Failed to read first API error response:', e);
                        }
                        
                        console.error('[Signup] 첫 인터뷰 질문 요청 실패:', {
                            status: firstInterviewResponse.status,
                            statusText: firstInterviewResponse.statusText,
                            errorData,
                            errorText,
                            userId,
                        });
                        // 에러가 발생해도 회원가입은 성공한 것으로 처리
                    } else {
                        console.log('[Signup] 첫 인터뷰 질문 발송 성공');
                    }
                } catch (error) {
                    console.error('[Signup] 첫 인터뷰 질문 요청 중 오류:', error);
                    // 에러가 발생해도 회원가입은 성공한 것으로 처리
                }

                // 성공 시 로컬 상태 업데이트
                const mergedChannels =
                    payload.notificationKakao
                        ? Array.from(new Set([...defaultChannels, 'kakao']))
                        : defaultChannels

                const newProfile = {
                    id: userId, // API에서 받은 user_id 사용
                    name: payload.name || 'PrePair 사용자',
                    email: payload.email,
                    desiredField: job,
                    jobTrackId: '',
                    jobTrackLabel: job,
                    jobRoleId: '',
                    jobRoleLabel: job,
                    customJobLabel: job,
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
                return { userId, user: newProfile }
            } catch (error) {
                // 에러를 다시 throw하여 호출하는 쪽에서 처리할 수 있도록 함
                throw error
            }
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

    const deleteAccount = useCallback(
        async (password) => {
            if (!user || !user.id) {
                throw new Error('사용자 정보를 찾을 수 없습니다.')
            }

            if (!password || typeof password !== 'string' || !password.trim()) {
                throw new Error('비밀번호를 입력해주세요.')
            }

            try {
                // 디버깅: 사용자 정보 확인
                console.log('[Delete Account] User object:', user)
                console.log('[Delete Account] User ID:', user.id)
                console.log('[Delete Account] User ID type:', typeof user.id)
                
                // API 호출
                await deleteUser(user.id, password)

                // 성공 시 로컬 상태 초기화
                setUser(null)
                setActiveQuestion(null)
                setSentQuestions([])
                setLastDispatch(null)
                setScoreHistory([])
                setActivity(defaultActivity)
                setPurchases([])
                sequenceRef.current = 0
            } catch (error) {
                // 에러를 다시 throw하여 호출하는 쪽에서 처리할 수 있도록 함
                throw error
            }
        },
        [user],
    )

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
             historyId = null, // 서버에서 제공하는 실제 historyId
         }) => {
            const submittedAt = new Date().toISOString()
            
            // 하루에 첫 번째 제출인지 확인하는 함수
            const isFirstSubmissionToday = () => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                today.setMilliseconds(0)
                
                // scoreHistory에서 오늘 날짜에 제출한 항목이 있는지 확인 (더 정확함)
                const hasSubmissionToday = scoreHistory.some((entry) => {
                    if (!entry.submittedAt) return false
                    const submittedDate = new Date(entry.submittedAt)
                    submittedDate.setHours(0, 0, 0, 0)
                    submittedDate.setMilliseconds(0)
                    return submittedDate.getTime() === today.getTime()
                })
                
                return !hasSubmissionToday
            }

            const isFirstToday = isFirstSubmissionToday()
            // 오늘의 질문에 최초로 답변해서 얻은 점수 == 획득 포인트
            const earnedPoints = isFirstToday ? score : 0

            setSentQuestions((prev) => {
                if (prev.length === 0) return prev
                const [latest, ...rest] = prev
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
                    id: `session-${Date.now()}`, // 클라이언트 ID (하위 호환성 유지)
                    historyId: historyId || null, // 서버에서 제공하는 실제 historyId
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
                    earnedPoints,
                    answer,
                },
                ...prev,
            ])

            setUser((prev) => {
                if (!prev) return prev
                return {
                    ...prev,
                    points: prev.points + earnedPoints,
                    streak: prev.streak + 1,
                }
            })

            setActivity((prev) => appendToHeatmap(prev))
            dispatchQuestion()
            
            // 포인트 적립 정보 반환 (팝업 표시용)
            return {
                earnedPoints,
                isFirstToday,
            }
        },
        [dispatchQuestion, scoreHistory],
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

    const deductPoints = useCallback(
        (amount) => {
            if (!user || user.points < amount) {
                return {success: false, reason: '포인트가 부족합니다.'}
            }

            setUser((prev) => {
                if (!prev) return prev
                return {...prev, points: prev.points - amount}
            })

            return {success: true, remainingPoints: user.points - amount}
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
        deductPoints,
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

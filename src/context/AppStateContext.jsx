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
import {redeemReward as redeemRewardApi} from '../utils/rewardsApi'

const AppStateContext = createContext(null)

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
    points: 0,
    streak: 9,
    tier: 'Growth Explorer',
    lastLoginAt: '2025-11-12T21:00:00.000Z',
}

const defaultChannels = notificationChannelPresets.filter((channel) => channel.isDefault).map((channel) => channel.id)

// 질문 뱅크 (현재는 빈 배열, 추후 API에서 가져오거나 다른 소스에서 로드)
const questionBank = []

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
    if (!questionBank || questionBank.length === 0) return null
    
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
                    } else if (response.status === 500) {
                        // 500 에러의 경우 특별한 에러 타입으로 표시
                        const error = new Error(errorData.message || '서버 오류가 발생했습니다.')
                        error.isServerError = true
                        error.statusCode = 500
                        throw error
                    } else {
                        // 기타 에러도 서버 오류로 간주할 수 있음
                        if (response.status >= 500) {
                            const error = new Error(errorData.message || `서버 오류가 발생했습니다. (${response.status})`)
                            error.isServerError = true
                            error.statusCode = response.status
                            throw error
                        }
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
                // 네트워크 에러 처리
                if (error instanceof TypeError && error.message.includes('fetch')) {
                    const networkError = new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
                    networkError.isNetworkError = true
                    throw networkError
                }
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
                
                // job: 사용자가 입력한 목표 직무
                const job = payload.jobRole ?? ''
                
                // schedule_type: cadence.id를 대문자로 변환 (예: "daily" -> "DAILY")
                const scheduleType = cadence.id.toUpperCase()
                
                // notification_type: 카카오 선택 시 'BOTH', 아니면 'EMAIL'
                const notificationType = payload.notificationKakao ? 'BOTH' : 'EMAIL'

                // 필수 필드 검증
                if (!job || job.trim() === '') {
                    throw new Error('목표 직무를 입력해주세요.')
                }
                if (!scheduleType || scheduleType.trim() === '') {
                    throw new Error('질문 주기를 선택해주세요.')
                }

                // API 요청 데이터 구성 (백엔드 명세에 맞게)
                const requestData = {
                    name: payload.name,
                    email: payload.email,
                    password: payload.password,
                    settings: {
                        job: job.trim(),
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
                        const error = new Error(errorMessage)
                        error.isServerError = true
                        error.statusCode = 500
                        throw error
                    } else {
                        // 기타 서버 오류 (502, 503 등)
                        if (response.status >= 500) {
                            const error = new Error(errorData.message || errorData.error || `서버 오류가 발생했습니다. (${response.status})`)
                            error.isServerError = true
                            error.statusCode = response.status
                            throw error
                        }
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

                // 카카오 알림을 선택하지 않은 경우에만 첫 인터뷰 질문 발송
                // 카카오 알림 선택 시에는 카카오 인증 완료 후 /first 요청 필요
                if (!payload.notificationKakao) {
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
                } else {
                    console.log('[Signup] 카카오 알림 선택됨 - 첫 인터뷰 질문 발송 건너뜀 (카카오 인증 완료 후 발송 예정)');
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
                    desiredField: job,  // 목표 직무
                    jobTrackId: 'other',
                    jobTrackLabel: job,  // 목표 직무
                    jobRoleId: '',
                    jobRoleLabel: job,  // 목표 직무
                    customJobLabel: job,  // 목표 직무
                    goal: payload.goal || job,  // 목표
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

                // 카카오 알림이 있든 없든 setUser() 호출
                setUser(newProfile)
                setActiveQuestion(null)
                setSentQuestions([])
                setLastDispatch(null)
                sequenceRef.current = 0

                // 카카오 알림 없는 경우에만 질문 발송
                if (!payload.notificationKakao) {
                    dispatchQuestion({
                        profile: newProfile,
                        channels: mergedChannels,
                        cadenceId: cadence.id,
                        sequence: 0,
                    })
                }
                
                return { userId, user: newProfile }
            } catch (error) {
                // 네트워크 에러 처리
                if (error instanceof TypeError && error.message.includes('fetch')) {
                    const networkError = new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
                    networkError.isNetworkError = true
                    throw networkError
                }
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
             earnedPoints: apiEarnedPoints = null,
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
            // API에서 받은 실제 포인트를 사용 (0이어도 그대로 사용)
            // API에서 포인트가 없으면 score를 그대로 포인트로 사용
            let earnedPoints = 0
            if (isFirstToday) {
                if (apiEarnedPoints !== null && apiEarnedPoints !== undefined) {
                    // API에서 실제 포인트가 있으면 사용 (0이어도 그대로 사용)
                    earnedPoints = apiEarnedPoints
                } else {
                    // API에서 포인트가 없으면 score를 그대로 포인트로 사용
                    earnedPoints = score
                }
            }
            
            console.log('[AppStateContext] recordInterviewResult:', {
                isFirstToday,
                apiEarnedPoints,
                score,
                earnedPoints,
            })

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
        async ({id, name, cost}) => {
            if (!user || !user.id) {
                return {success: false, reason: '로그인이 필요합니다.'}
            }

            if (!user.points || user.points < cost) {
                return {success: false, reason: '포인트가 부족합니다.'}
            }

            try {
                // 실제 API 호출
                console.log('[Redeem Reward] 리워드 교환 시작:', { userId: user.id, cost })
                const apiResponse = await redeemRewardApi(user.id, cost)
                
                console.log('[Redeem Reward] API 응답:', apiResponse)

                // API 응답에서 받은 remaining_points로 사용자 포인트 업데이트
                if (apiResponse.remaining_points !== undefined) {
                    setUser((prev) => {
                        if (!prev) return prev
                        return {...prev, points: apiResponse.remaining_points}
                    })
                    console.log('[Redeem Reward] 사용자 포인트 업데이트:', apiResponse.remaining_points)
                } else {
                    // API 응답에 remaining_points가 없으면 로컬에서 차감
                    setUser((prev) => {
                        if (!prev) return prev
                        return {...prev, points: prev.points - cost}
                    })
                    console.warn('[Redeem Reward] API 응답에 remaining_points가 없어 로컬에서 차감합니다.')
                }

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

                return {
                    success: true, 
                    record,
                    message: apiResponse.message || '리워드 교환이 완료되었습니다.',
                    remainingPoints: apiResponse.remaining_points
                }
            } catch (error) {
                console.error('[Redeem Reward] 리워드 교환 실패:', error)
                return {
                    success: false, 
                    reason: error.message || '리워드 교환에 실패했습니다. 잠시 후 다시 시도해주세요.'
                }
            }
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

    const updateUserPoints = useCallback(
        (points) => {
            if (typeof points !== 'number' || points < 0) {
                console.warn('[Update User Points] 유효하지 않은 포인트 값:', points)
                return
            }

            setUser((prev) => {
                if (!prev) return prev
                console.log('[Update User Points] 포인트 업데이트:', { before: prev.points, after: points })
                return {...prev, points: points}
            })
        },
        [],
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
        updateUserPoints,
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

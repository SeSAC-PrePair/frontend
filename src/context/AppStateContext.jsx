import { createContext, useContext, useMemo, useState } from 'react'

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
    id: 'q-front-001',
    role: '프론트엔드',
    prompt: '웹 성능 최적화를 위해 Core Web Vitals를 개선했던 사례를 구조적으로 설명해 주세요.',
    subPrompt: '측정 지표, 문제의 원인, 개선 실험, 정량/정성 결과를 순서대로 언급해 주세요.',
    tags: ['Performance', 'Frontend', 'Problem Solving'],
  },
  {
    id: 'q-front-002',
    role: '프론트엔드',
    prompt: '디자인 시스템을 구축하거나 고도화한 경험이 있다면, 어떤 기준으로 의사결정을 했는지 알려주세요.',
    subPrompt: '토큰 설계, 컴포넌트 구조, 접근성, 협업 방법을 포함해 설명하면 좋아요.',
    tags: ['Design System', 'Collaboration', 'Accessibility'],
  },
  {
    id: 'q-pm-001',
    role: 'PM',
    prompt: '신규 기능 런칭 전, 고객 여정을 어떻게 설계하고 검증했는지 사례를 공유해주세요.',
    subPrompt: '문제 정의 → 리서치 → MVP → 출시 이후 학습 순으로 이야기하면 좋아요.',
    tags: ['Journey Mapping', 'Product Discovery'],
  },
  {
    id: 'q-data-001',
    role: '데이터',
    prompt: '데이터 품질 이슈를 해결했던 경험과, 그 과정에서 배운 교훈을 알려주세요.',
    subPrompt: '탐지 방법, 우선순위 설정, 이해관계자 설득, 자동화 전략까지 포함하면 좋습니다.',
    tags: ['Data Quality', 'Automation', 'Stakeholder'],
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

const defaultActivity = Array.from({ length: 18 }, (_, weekIndex) =>
  Array.from({ length: 7 }, (_, dayIndex) => {
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
    id: 'reward-004',
    name: '리치 드립백 커피 세트',
    cost: 180,
    purchasedAt: '2025-11-05T07:00:00.000Z',
    deliveryStatus: '배송 중',
  },
  {
    id: 'reward-002',
    name: '프로덕트 서적 30% 할인 쿠폰',
    cost: 240,
    purchasedAt: '2025-10-23T11:15:00.000Z',
    deliveryStatus: '사용 완료',
  },
]

const defaultUserProfile = {
  id: 'user-001',
  name: '김하린',
  email: 'harin@careerbot.ai',
  desiredField: '프로덕트 매니저',
  goal: '내년 상반기 글로벌 스타트업 PM 포지션 합격',
  focusArea: '프로덕트 전략',
  questionCadence: 'daily',
  questionCadenceLabel: '매일 (주 5회)',
  avatar: '🌌',
  points: 620,
  streak: 9,
  tier: 'Growth Explorer',
  lastLoginAt: '2025-11-12T21:00:00.000Z',
}

function appendToHeatmap(activity) {
  const clone = activity.map((week) => [...week])
  const now = new Date()
  const day = now.getDay()
  const lastColumn = clone[clone.length - 1]
  lastColumn[day] = Math.min(4, lastColumn[day] + 1)
  return clone
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [scoreHistory, setScoreHistory] = useState(mockScoreHistory)
  const [activity, setActivity] = useState(defaultActivity)
  const [purchases, setPurchases] = useState(defaultPurchases)

  const currentQuestion = useMemo(() => {
    if (!user) return null
    const preferred = questionBank.filter((item) => item.role === user.desiredField || item.role === user.focusArea)
    if (preferred.length > 0) {
      return preferred[questionIndex % preferred.length]
    }
    return questionBank[questionIndex % questionBank.length]
  }, [questionIndex, user])

  const lastFeedback = scoreHistory.length > 0 ? scoreHistory[0] : null

  const login = ({ email }) => {
    const fallback = { ...defaultUserProfile, email: email || defaultUserProfile.email }
    setUser(fallback)
    return fallback
  }

  const signup = (payload) => {
    const newProfile = {
      id: `user-${Date.now()}`,
      name: payload.name || '커리어봇 사용자',
      email: payload.email,
      desiredField: payload.desiredField,
      goal: payload.goal,
      focusArea: payload.focusArea,
      questionCadence: payload.questionCadence,
      questionCadenceLabel: payload.questionCadenceLabel,
      avatar: payload.avatar || '🚀',
      points: 520,
      streak: 1,
      tier: 'Trailblazer',
      lastLoginAt: new Date().toISOString(),
    }
    setUser(newProfile)
    return newProfile
  }

  const logout = () => {
    setUser(null)
  }

  const updateSettings = (nextSettings) => {
    setUser((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        ...nextSettings,
      }
    })
  }

  const recordInterviewResult = ({ score, summary, highlights, breakdown, focusTags, question }) => {
    setScoreHistory((prev) => [
      {
        id: `session-${Date.now()}`,
        question,
        score,
        submittedAt: new Date().toISOString(),
        summary,
        highlights,
        focusTags,
        breakdown,
      },
      ...prev,
    ])

    setUser((prev) => {
      if (!prev) return prev
      const bonus = Math.max(40, Math.round(score * 0.6))
      return {
        ...prev,
        points: prev.points + bonus,
        streak: prev.streak + 1,
      }
    })

    setActivity((prev) => appendToHeatmap(prev))
    setQuestionIndex((prev) => prev + 1)
  }

  const redeemReward = ({ id, name, cost }) => {
    if (!user || user.points < cost) {
      return { success: false, reason: '포인트가 부족합니다.' }
    }

    setUser((prev) => {
      if (!prev) return prev
      return { ...prev, points: prev.points - cost }
    })

    const record = {
      id: `${id}-${Date.now()}`,
      name,
      cost,
      purchasedAt: new Date().toISOString(),
      deliveryStatus: '처리 중',
    }

    setPurchases((prev) => [record, ...prev])

    return { success: true, record }
  }

  const value = {
    user,
    login,
    signup,
    logout,
    updateSettings,
    scoringRubric,
    currentQuestion,
    lastFeedback,
    scoreHistory,
    recordInterviewResult,
    activity,
    purchases,
    redeemReward,
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

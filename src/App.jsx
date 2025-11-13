import { useState } from 'react'
import './index.css'
import mascot from './assets/b01fa81ce7a959934e8f78fc6344081972afd0ae.png'

const jobCategories = [
  {
    name: '프론트엔드 개발자',
    emoji: '🧩',
    cadence: '매일 오전 09:00',
    channel: '이메일 + 카카오 알림톡',
    description: 'UI 성능과 사용자 경험을 중심으로 한 시나리오 기반 질문으로 하루를 시작하세요.',
    preview: [
      '사용성 이슈를 발견하고 해결했던 경험을 설명해주세요.',
      '디자인 시스템과 일정이 충돌했을 때 어떻게 조율했나요?',
    ],
    highlight: '실시간 코드 리뷰 꼬리 질문',
  },
  {
    name: '프로덕트 매니저',
    emoji: '🛰️',
    cadence: '주 1회 월요일 08:30',
    channel: '카카오 알림톡',
    description: '시장 검증, 데이터 기반 의사결정 질문으로 주간 회고와 다음 스프린트를 설계합니다.',
    preview: [
      '핵심 지표가 떨어지는 상황에서 우선순위를 조정했던 사례를 말해주세요.',
      '고객 인터뷰 인사이트를 제품 방향에 반영한 방법은 무엇인가요?',
    ],
    highlight: 'OKR 정렬 코칭',
  },
  {
    name: '마케팅 매니저',
    emoji: '📣',
    cadence: '매주 수요일 10:00',
    channel: '이메일',
    description: '퍼포먼스와 브랜딩 균형을 점검하는 KPI 중심 질문을 큐레이션합니다.',
    preview: [
      '주요 캠페인에서 가장 크게 배운 점은 무엇인가요?',
      '리텐션 지표를 개선한 실험을 소개해주세요.',
    ],
    highlight: '채널 믹스 벤치마크',
  },
  {
    name: '데이터 분석가',
    emoji: '📊',
    cadence: '매일 저녁 19:00',
    channel: '이메일 + 슬랙',
    description: '실전 데이터 해석과 의사소통 능력을 평가하는 시나리오 질문을 제공합니다.',
    preview: [
      '데이터 품질 이슈를 해결한 경험을 들려주세요.',
      '비기술 이해관계자에게 복잡한 분석을 설명했던 사례는 무엇인가요?',
    ],
    highlight: '해석 스크립트 템플릿',
  },
]

const scheduleModes = {
  daily: {
    key: 'daily',
    label: '매일 5분 루틴',
    title: 'Daily Spark',
    description:
      '평일 오전 9시, 출근길에 딱 맞는 1문항을 전달합니다. AI가 전날 답변을 학습해 난이도와 꼬리 질문을 조정해요.',
    meta: ['완료까지 평균 4분 12초', '누적 응시율 86%', '카카오 알림 리마인드 2회'],
  },
  weekly: {
    key: 'weekly',
    label: '주간 집중 코칭',
    title: 'Weekly Deep Dive',
    description:
      '매주 월요일 아침, 한 주를 설계할 프리미엄 질문 3개 묶음을 전송합니다. 팀 리뷰 공유용 리포트도 함께 받아보세요.',
    meta: ['직무별 테마 큐레이션', '멘토 리뷰 초안 자동 생성', '팀 공유용 요약 PDF'],
  },
}

const featureHighlights = [
  {
    title: '맥락형 AI 질문 생성',
    description: '직무, 경력, 목표 회사를 입력하면 AI가 매일 새로운 질문을 생성해 드립니다.',
    detail: 'Resume + 최근 답변 패턴을 학습하여 난이도 자동 조절',
  },
  {
    title: '실시간 피드백 & 보이스 코치',
    description: '답변을 업로드하면 3초 내로 톤, 구조, 임팩트를 분석한 피드백을 제공합니다.',
    detail: 'STAR · PREP 규칙과 우리만의 평가 매트릭스로 세분화된 코칭',
  },
  {
    title: '리워드형 성장 루프',
    description: 'AI가 매긴 0~100점 점수로 커피, 구독권 등 맞춤 리워드를 바로 구매해요.',
    detail: '주간 리더보드 · 리포트로 팀 성장 데이터를 한눈에',
  },
]

const flowSteps = [
  {
    id: '01',
    title: '직업군 선택',
    description: '국내 40여 직군을 커버하는 질문 뱅크와 연결돼요.',
  },
  {
    id: '02',
    title: '채널 지정',
    description: '이메일 · 카카오톡 · 슬랙 중 원하는 채널로 예약 전송합니다.',
  },
  {
    id: '03',
    title: '답변 업로드',
    description: '텍스트, 음성, 영상 링크 모두 지원하고 AI가 바로 분석해요.',
  },
  {
    id: '04',
    title: 'AI 피드백 & 리워드',
    description: '피드백과 점수, 커피 리워드까지 한 번에 확인합니다.',
  },
]

const mockSession = {
  question: '팀 전체 성과를 위해 본인의 우선순위를 조정했던 경험을 설명해주세요.',
  context: '문제 정의 → 데이터 → 실행 → 임팩트 순으로 답변 구조를 추천해요.',
  coachTips: ['맥락 설명 15초 이내', '성과 수치를 명확하게', '리더십 행동 강조'],
  feedback: [
    {
      title: 'AI 피드백',
      body: '고객 문제 정의가 명확했어요. 실행 단계에서 팀 협업 방식을 한 줄 더 넣으면 설득력이 높아집니다.',
    },
    {
      title: '추가 코칭',
      body: '리스크를 어떻게 관리했는지, 수치와 행동을 연결해 마무리해보세요.',
    },
  ],
  rubric: [
    { label: '구조화', value: '92%', hint: 'STAR 커버리지 +3%' },
    { label: '톤 & 전달', value: '86%', hint: '속도 안정적 · 표정 코칭 제안' },
    { label: '임팩트', value: '80%', hint: '결과 수치 강화 필요' },
  ],
  followUp: '프로젝트 후 학습한 내용을 다음 스프린트에 어떻게 반영했나요?',
  score: 86,
}

const rewardItems = [
  {
    name: '아메리카노 Tall',
    icon: '☕️',
    cost: '4,500점',
    description: '오늘 받은 점수로 바로 교환 가능한 커피 기프티콘.',
    tag: '인기',
  },
  {
    name: '업무 툴 PRO 1개월',
    icon: '📅',
    cost: '24,000점',
    description: '팀 플로우를 정리하는 캘린더 & 노트툴 구독권.',
    tag: '팀추천',
  },
  {
    name: '크루 응원 키트',
    icon: '🎁',
    cost: '12,000점',
    description: '모의 면접 파트너와 함께 쓰는 굿즈 패키지.',
  },
  {
    name: 'AI 1:1 코칭 세션',
    icon: '🤖',
    cost: '35,000점',
    description: '전문 코치와 AI 분석을 결합한 30분 프리미엄 세션.',
  },
]

export default function App() {
  const [activeJob, setActiveJob] = useState(0)
  const [mode, setMode] = useState(scheduleModes.daily.key)

  const selectedJob = jobCategories[activeJob]
  const modeDetail = scheduleModes[mode]

  return (
    <div className="app">
      <div className="app__backdrop" aria-hidden="true">
        <span className="halo halo--one" />
        <span className="halo halo--two" />
        <span className="halo halo--three" />
      </div>

      <header className="app-header" id="home">
        <div className="logo">
          <span className="logo-symbol">AI</span>
          <span className="logo-name">Maeil Coach</span>
          <span className="logo-badge">Beta</span>
        </div>

        <nav className="main-nav" aria-label="Primary navigation">
          <a href="#roles">직업군</a>
          <a href="#features">서비스 소개</a>
          <a href="#coach">AI 코칭</a>
          <a href="#reward">리워드</a>
        </nav>

        <div className="header-actions">
          <button className="ghost-button" type="button">
            로그인
          </button>
          <button className="primary-button" type="button">
            무료로 시작하기
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="hero" id="hero">
          <div className="hero__copy">
            <span className="hero__tag">AI 기반 맞춤형 면접 코치</span>
            <h1>
              하루 5분, <br /> 직무별 맞춤 인터뷰 루틴
            </h1>
            <p>
              사용자의 직업군, 경력, 목표 회사까지 분석해 AI가 매일 혹은 주간 단위로 질문을 보내드려요.
              답변을 올리면 피드백·점수·리워드까지 한 번에.
            </p>

            <div className="hero__cta">
              <button className="primary-button" type="button">
                베타 신청하기
              </button>
              <button className="ghost-button ghost-button--tonal" type="button">
                소개서 다운로드
              </button>
            </div>

            <div className="hero__notify">
              <div className="notify-card">
                <span className="notify-icon">📮</span>
                <div>
                  <strong>이메일</strong>
                  <p>매일 오전 09:00 새로운 질문</p>
                </div>
              </div>
              <div className="notify-card notify-card--secondary">
                <span className="notify-icon">💬</span>
                <div>
                  <strong>카카오 알림톡</strong>
                  <p>퇴근 19:00 리마인드 알림 1회</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__mascot">
              <img src={mascot} alt="Maeil Coach 메인 캐릭터" />
              <span className="floating-badge floating-badge--top">AI가 방금 38개의 직무별 질문을 생성했어요</span>
              <span className="floating-badge floating-badge--bottom">맞춤 피드백까지 평균 3초</span>
            </div>
            <div className="hero__status">
              <div>
                <span className="status-label">오늘의 미션</span>
                <strong>프론트엔드 · 09:00 드랍</strong>
              </div>
              <div>
                <span className="status-label">평균 점수</span>
                <strong>82점</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="job-section" id="roles">
          <header className="section-heading">
            <span className="section-eyebrow">직업군 선택</span>
            <div>
              <h2>직업군에 따라 질문이 다르게 큐레이션돼요</h2>
              <p>메일과 카카오톡 중 원하는 채널을 고르고, 매일 혹은 주 1회 인터뷰 루틴을 설정하세요.</p>
            </div>
          </header>

          <div className="mode-switch" role="tablist" aria-label="질문 발송 주기 선택">
            {Object.values(scheduleModes).map((option) => (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={mode === option.key}
                className={`mode-pill ${mode === option.key ? 'is-active' : ''}`}
                onClick={() => setMode(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="job-layout">
            <div className="job-grid" role="listbox" aria-label="직업군 목록">
              {jobCategories.map((job, index) => (
                <button
                  key={job.name}
                  type="button"
                  role="option"
                  aria-selected={activeJob === index}
                  className={`job-card ${activeJob === index ? 'is-active' : ''}`}
                  onClick={() => setActiveJob(index)}
                >
                  <div className="job-card__header">
                    <span className="job-emoji" aria-hidden="true">
                      {job.emoji}
                    </span>
                    <span className="job-highlight">{job.highlight}</span>
                  </div>
                  <h3>{job.name}</h3>
                  <p>{job.description}</p>
                  <div className="job-meta">
                    <span>{job.cadence}</span>
                    <span>{job.channel}</span>
                  </div>
                </button>
              ))}
            </div>

            <article className="job-detail" aria-live="polite">
              <span className="job-detail__badge">{selectedJob.highlight}</span>
              <h3>{selectedJob.name}를 위한 질문 미리보기</h3>
              <p>{selectedJob.description}</p>
              <ul>
                {selectedJob.preview.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="job-detail__meta">
                <span>{selectedJob.cadence}</span>
                <span>{selectedJob.channel}</span>
              </div>
            </article>
          </div>

          <aside className="mode-detail">
            <h4>{modeDetail.title}</h4>
            <p>{modeDetail.description}</p>
            <div className="mode-detail__meta">
              {modeDetail.meta.map((item) => (
                <span className="meta-pill" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </aside>
        </section>

        <section className="feature-section" id="features">
          <header className="section-heading">
            <span className="section-eyebrow">Maeil Coach 핵심 기능</span>
            <div>
              <h2>AI가 질문을 만들고, 피드백을 주고, 점수까지 산출합니다</h2>
              <p>토스 · 제미나이 스타일의 미니멀한 인터페이스로, 필요한 정보만 빠르게 확인할 수 있어요.</p>
            </div>
          </header>

          <div className="feature-grid">
            {featureHighlights.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span>{feature.detail}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="flow-section">
          <header className="section-heading">
            <span className="section-eyebrow">온보딩 흐름</span>
            <div>
              <h2>가입 후 10분이면 나만의 질문 루틴 완성</h2>
              <p>실제 사용자 흐름을 목데이터로 구성했습니다. 모바일 화면에서도 직관적으로 확인할 수 있어요.</p>
            </div>
          </header>

          <div className="flow-list">
            {flowSteps.map((step) => (
              <div className="flow-step" key={step.id}>
                <span className="flow-step__id">{step.id}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="coach-section" id="coach">
          <header className="section-heading">
            <span className="section-eyebrow">AI 면접 코칭 체험</span>
            <div>
              <h2>질문, 답변, 피드백까지 한 화면에서</h2>
              <p>실제 세션 UI 목업입니다. 답변을 업로드하면 AI가 즉시 피드백과 0~100점 점수를 반환해요.</p>
            </div>
          </header>

          <div className="coach-layout">
            <div className="phone-frame">
              <div className="phone-status">
                <span className="status-dot" aria-hidden="true" />
                <span>AI Session · 03:12 진행 중</span>
                <span className="status-chip">카메라 Off</span>
              </div>

              <div className="phone-question">
                <span className="badge">오늘의 질문</span>
                <h3>{mockSession.question}</h3>
                <p>{mockSession.context}</p>
                <div className="tip-list">
                  {mockSession.coachTips.map((tip) => (
                    <span className="tip-pill" key={tip}>
                      {tip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="phone-actions">
                <button className="primary-button" type="button">
                  답변 녹음하기
                </button>
                <button className="ghost-button" type="button">
                  텍스트로 입력
                </button>
              </div>

              <div className="phone-feedback">
                {mockSession.feedback.map((item) => (
                  <div className="feedback-block" key={item.title}>
                    <h4>{item.title}</h4>
                    <p>{item.body}</p>
                  </div>
                ))}
                <div className="followup">
                  <span className="badge badge--soft">추가 꼬리 질문</span>
                  <p>{mockSession.followUp}</p>
                </div>
              </div>
            </div>

            <aside className="coach-insight">
              <div className="score-tile">
                <div className="score-circle">
                  <strong>{mockSession.score}</strong>
                  <span>오늘의 AI 점수</span>
                  <small>0~100점 단위로 리워드 적립</small>
                </div>
                <ul className="score-breakdown">
                  {mockSession.rubric.map((item) => (
                    <li key={item.label}>
                      <div>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                      <small>{item.hint}</small>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="insight-card">
                <h4>AI 코치가 제안하는 다음 스텝</h4>
                <ul>
                  <li>내일 오전 9시, 난이도 상향 질문 예약됨</li>
                  <li>답변 스크립트 템플릿 2개 자동 저장</li>
                  <li>팀 코치에게 요약 리포트 전송 완료</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section className="reward-section" id="reward">
          <header className="section-heading">
            <span className="section-eyebrow">리워드 샵</span>
            <div>
              <h2>AI 점수로 커피와 상품을 바로 교환해요</h2>
              <p>점수가 쌓이면 원하는 리워드를 선택해 즉시 교환할 수 있어요. 팀별 커스텀 리워드도 연결 가능합니다.</p>
            </div>
          </header>

          <div className="reward-grid">
            {rewardItems.map((reward) => (
              <article className="reward-card" key={reward.name}>
                <div className="reward-card__header">
                  <span className="reward-icon" aria-hidden="true">
                    {reward.icon}
                  </span>
                  {reward.tag ? <span className="reward-tag">{reward.tag}</span> : null}
                </div>
                <h3>{reward.name}</h3>
                <p>{reward.description}</p>
                <div className="reward-meta">
                  <span>{reward.cost}</span>
                  <button type="button" className="ghost-button">
                    교환하기
                  </button>
                </div>
              </article>
            ))}

            <article className="reward-card reward-card--cta">
              <h3>조직 맞춤 리워드 연결</h3>
              <p>사내 복지, 포인트 시스템과 연동해 팀만의 상점도 만들 수 있어요.</p>
              <button type="button" className="primary-button">
                리워드 제휴 문의
              </button>
            </article>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <div className="logo">
          <span className="logo-symbol">AI</span>
          <span className="logo-name">Maeil Coach</span>
        </div>
        <p>AI 기반 맞춤형 면접 코치 플랫폼. 매일 성장하는 면접 루틴을 경험해보세요.</p>
        <small>© {new Date().getFullYear()} Maeil Coach. All rights reserved.</small>
      </footer>
    </div>
  )
}

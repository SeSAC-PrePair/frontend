import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppStateContext'
import '../../styles/pages/RewardShop.css'

const catalog = [
  {
    id: 'coffee-bundle',
    name: '카페인 부스트 패키지',
    cost: 180,
    description: '드립백 5종 + 스낵, 새벽 러닝 전 워밍업에 최적화',
    badge: '인기',
    gradient: 'linear-gradient(135deg, rgba(93, 157, 255, 0.65), rgba(187, 221, 255, 0.65))',
  },
  {
    id: 'deep-work-notes',
    name: '딥워크 노트 세트',
    cost: 240,
    description: '인터뷰 인사이트를 기록하는 프리미엄 노트',
    badge: '신상',
    gradient: 'linear-gradient(135deg, rgba(255, 186, 222, 0.65), rgba(255, 228, 205, 0.65))',
  },
  {
    id: 'learning-credit',
    name: '러닝 크레딧 2만원권',
    cost: 320,
    description: '원하는 강의를 선택해서 학습하세요.',
    badge: '추천',
    gradient: 'linear-gradient(135deg, rgba(175, 255, 230, 0.65), rgba(122, 226, 247, 0.65))',
  },
  {
    id: 'focus-music',
    name: '포커스 뮤직 구독권 (1개월)',
    cost: 150,
    description: '집중을 돕는 음악 구독 서비스',
    badge: null,
    gradient: 'linear-gradient(135deg, rgba(255, 236, 185, 0.65), rgba(255, 205, 190, 0.65))',
  },
]

export default function RewardShop() {
  const { user, redeemReward } = useAppState()
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRedeem = (item) => {
    const response = redeemReward(item)
    if (!response.success) {
      setError(response.reason)
      setTimeout(() => setError(''), 2400)
      return
    }
    navigate('/rewards/complete', { state: { purchase: response.record, item } })
  }

  return (
    <div className="reward-shop">
      <header className="reward-shop__header">
        <div>
          <span className="tag">Reward Shop</span>
          <h1>포인트로 루틴을 보상하세요</h1>
          <p>AI 면접 코칭으로 적립한 포인트로 커피, 러닝 크레딧, 노트 등 다양한 리워드를 교환할 수 있어요.</p>
        </div>
        <div className="reward-shop__balance">
          <span>보유 포인트</span>
          <strong>{user?.points.toLocaleString()} pts</strong>
        </div>
      </header>

      {error && <p className="reward-shop__error">{error}</p>}

      <section className="reward-shop__grid">
        {catalog.map((item) => {
          const disabled = (user?.points ?? 0) < item.cost
          return (
            <article key={item.id} className={`reward-item ${disabled ? 'is-disabled' : ''}`}>
              {item.badge && <span className="reward-item__badge">{item.badge}</span>}
              <div className="reward-item__visual" style={{ backgroundImage: item.gradient }} aria-hidden="true" />
              <div className="reward-item__body">
                <strong>{item.name}</strong>
                <p>{item.description}</p>
                <div className="reward-item__footer">
                  <span>{item.cost} pts</span>
                  <button type="button" onClick={() => handleRedeem(item)} disabled={disabled}>
                    교환하기
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}

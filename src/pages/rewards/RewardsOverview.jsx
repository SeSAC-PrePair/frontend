import { motion } from 'framer-motion'
import ContributionHeatmap from '../../components/ContributionHeatmap'
import { useAppState } from '../../context/AppStateContext'
import { Link } from 'react-router-dom'

export default function RewardsOverview() {
  const { user, activity, scoreHistory, purchases } = useAppState()

  const lastScore = scoreHistory[0]
  const avgScore =
    scoreHistory.length > 0
      ? Math.round(scoreHistory.reduce((sum, entry) => sum + entry.score, 0) / scoreHistory.length)
      : 0
  const recentPurchases = purchases.slice(0, 2)

  return (
    <div className="rewards">
      <header className="rewards__header">
        <div>
          <span className="tag">Rewards Orbit</span>
          <h1>리워드 허브</h1>
          <p>성실하게 쌓은 점수로 커피, 러닝 크레딧, 굿즈를 교환하고 활동 잔디를 확인하세요.</p>
        </div>
        <div className="rewards__cta">
          <Link to="/rewards/shop" className="cta-button cta-button--primary">
            리워드샵 이동
          </Link>
          <Link to="/rewards/history" className="cta-button cta-button--ghost">
            구매 내역
          </Link>
        </div>
      </header>

      <section className="rewards__grid">
        <motion.article className="reward-card reward-card--points" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span>누적 포인트</span>
          <strong>{user?.points.toLocaleString()} pts</strong>
          <p>다음 티어까지 180 pts 남았습니다.</p>
        </motion.article>

        <motion.article className="reward-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <span>최근 점수</span>
          <strong>{lastScore?.score ?? '--'} 점</strong>
          <p>{lastScore?.summary ?? 'AI 코칭을 시작해보세요!'}</p>
        </motion.article>

        <motion.article className="reward-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <span>평균 점수</span>
          <strong>{avgScore} 점</strong>
          <p>최근 {scoreHistory.length}개의 답변 기준</p>
        </motion.article>
      </section>

      <section className="rewards__heatmap">
        <header>
          <div>
            <h2>활동 잔디</h2>
            <p>최근 {activity.length}주간 인터뷰 세션 기록</p>
          </div>
        </header>
        <ContributionHeatmap data={activity} />
      </section>

      <section className="rewards__purchases">
        <header>
          <h2>최근 리워드</h2>
          <p>포인트를 사용한 최신 구매 내역</p>
        </header>
        <div className="purchase-grid">
          {recentPurchases.map((purchase) => (
            <article key={purchase.id} className="purchase-card">
              <span>{new Date(purchase.purchasedAt).toLocaleDateString('ko-KR')}</span>
              <strong>{purchase.name}</strong>
              <div className="purchase-card__meta">
                <span>-{purchase.cost} pts</span>
                <span>{purchase.deliveryStatus}</span>
              </div>
            </article>
          ))}
          {recentPurchases.length === 0 && <p>아직 구매 내역이 없어요. 리워드샵에서 첫 리워드를 교환해보세요.</p>}
        </div>
      </section>
    </div>
  )
}

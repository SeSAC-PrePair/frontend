import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ContributionHeatmap from "../../components/ContributionHeatmap";
import RecentPurchases from "../../components/RecentPurchases";
import { useAppState } from "../../context/AppStateContext";
import "../../styles/pages/Rewards.css";

export default function RewardsOverview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, activity, sentQuestions, purchases } = useAppState();

  const latestDispatch = sentQuestions[0] ?? null;
  const redirectSource = location.state?.from;
  const hasPurchases = purchases.length > 0;
  const recentPurchaseCount = hasPurchases ? Math.min(3, purchases.length) : 0;
  const streakDays = user?.streak ?? 0;

  useEffect(() => {
    if (redirectSource) {
      navigate(location.pathname, { replace: true });
    }
  }, [navigate, redirectSource, location.pathname]);

  return (
    <div className="rewards">
      <header className="rewards__header">
        <div>
          <span className="tag">Home · PrePair</span>
          <h1>{user?.name ?? "PrePair 사용자"}님의 마이페이지</h1>
        </div>
        <div className="rewards__cta">
          <div className="rewards__points-chip">
            <span>보유 포인트</span>
            <strong>{user?.points?.toLocaleString() ?? "0"} pts</strong>
          </div>
        </div>
      </header>

      {latestDispatch ? (
        <section className="rewards__dispatch rewards__dispatch--main">
          <header>
            <h2>오늘의 질문</h2>
          </header>
          <article className="dispatch-card">
            <h3>Q. {latestDispatch.prompt}</h3>
            <p>{latestDispatch.subPrompt}</p>
            <div className="dispatch-card__tags">
              {latestDispatch.tags?.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="dispatch-card__actions">
              <Link to="/coach" className="cta-button cta-button--ghost">
                답변하러 가기
              </Link>
            </div>
          </article>
        </section>
      ) : (
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

      <section className="rewards__purchases">
        <header>
          <div>
            <h2>최근 구매 내역</h2>
            <p>가장 최근 {recentPurchaseCount}건의 리워드 교환을 확인하세요.</p>
          </div>
          <div className="rewards__purchases-actions">
            <Link
              to="/rewards/history"
              className="cta-button cta-button--ghost"
            >
              전체 내역 보기
            </Link>
            <Link to="/rewards/shop" className="rewards__text-link">
              리워드샵 가기
            </Link>
          </div>
        </header>

        <RecentPurchases purchases={purchases} limit={3} />
      </section>

      <section className="rewards__heatmap">
        <header>
          <div>
            <h2>활동 잔디</h2>
            <p>최근 {activity.length}주간 인터뷰 세션 기록</p>
          </div>
          <div className="rewards__streak-chip">
            <span>연속 학습</span>
            <strong>{streakDays}일째</strong>
          </div>
        </header>
        <ContributionHeatmap data={activity} />
      </section>
    </div>
  );
}

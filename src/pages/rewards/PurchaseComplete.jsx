import { Link, useLocation } from 'react-router-dom'
import '../../styles/pages/PurchaseComplete.css'

export default function PurchaseComplete() {
  const location = useLocation()
  const purchase = location.state?.purchase
  const item = location.state?.item

  return (
    <div className="purchase-complete">
      <header>
        <span className="tag">Purchase Complete</span>
        <h1>리워드 교환 완료!</h1>
        <p>루틴을 꾸준히 이어간 덕분에 멋진 리워드를 획득했어요.</p>
      </header>

      {purchase ? (
        <article className="purchase-complete__card">
          <span>구매 리워드</span>
          <strong>{item?.name}</strong>
          <p>{item?.description}</p>
          <div className="purchase-complete__meta">
            <span>-{purchase.cost} pts 사용</span>
            <span>{new Date(purchase.purchasedAt).toLocaleString('ko-KR')}</span>
            <span>상태: {purchase.deliveryStatus}</span>
          </div>
        </article>
      ) : (
        <article className="purchase-complete__card">
          <strong>최근 구매 정보를 찾을 수 없어요.</strong>
          <p>리워드샵에서 마음에 드는 리워드를 선택해보세요.</p>
        </article>
      )}

      <div className="purchase-complete__actions">
        <Link to="/rewards/shop" className="cta-button cta-button--ghost">
          리워드 계속 보기
        </Link>
        <Link to="/rewards/history" className="cta-button cta-button--primary">
          구매 내역 확인
        </Link>
      </div>
    </div>
  )
}

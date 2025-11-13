import { useAppState } from '../../context/AppStateContext'
import { Link } from 'react-router-dom'

export default function PurchaseHistory() {
  const { purchases } = useAppState()

  return (
    <div className="purchase-history">
      <header>
        <span className="tag">Purchase History</span>
        <h1>리워드 구매 내역</h1>
        <p>포인트로 교환한 리워드를 한눈에 확인하세요.</p>
      </header>

      {purchases.length === 0 ? (
        <div className="purchase-history__empty">
          <p>아직 구매 내역이 없어요.</p>
          <Link to="/rewards/shop" className="cta-button cta-button--primary">
            리워드샵으로 이동
          </Link>
        </div>
      ) : (
        <ul className="purchase-history__list">
          {purchases.map((purchase) => (
            <li key={purchase.id} className="purchase-history__item">
              <div>
                <strong>{purchase.name}</strong>
                <span>{new Date(purchase.purchasedAt).toLocaleString('ko-KR')}</span>
              </div>
              <div>
                <span className="purchase-history__cost">-{purchase.cost} pts</span>
                <span>{purchase.deliveryStatus}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

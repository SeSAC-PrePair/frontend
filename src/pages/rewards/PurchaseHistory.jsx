import { useAppState } from '../../context/AppStateContext'
import { Link } from 'react-router-dom'
import '../../styles/pages/PurchaseHistory.css'
import { formatDate, formatDateTime, getPurchaseUsageState } from './purchaseUtils'

export default function PurchaseHistory() {
  const { purchases } = useAppState()

  return (
    <div className="purchase-history">
      <header>
        <span className="tag">Purchase History</span>
        <h1>리워드 바코드 지갑</h1>
        <p>카테고리별로 구매한 리워드를 바코드와 함께 관리하세요.</p>
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
            {purchases.map((purchase) => {
              const { isUsed, usageLabel } = getPurchaseUsageState(purchase)

              return (
                <li key={purchase.id} className={`history-card history-card--${purchase.usageStatus ?? 'ready'}`}>
                  <div className="history-card__header">
                    <div>
                      <span className="history-card__label">{purchase.deliveryStatus}</span>
                      <strong className={isUsed ? 'history-card__title--used' : ''}>{purchase.name}</strong>
                      {purchase.memo && <p>{purchase.memo}</p>}
                    </div>
                    <span className="history-card__cost">-{purchase.cost.toLocaleString()} pts</span>
                  </div>

                <div className="history-card__barcode" role="group" aria-label={`${purchase.name} 바코드`}>
                  <div className="history-card__barcode-bars" aria-hidden="true" />
                  <span className="history-card__barcode-number">{purchase.barcode}</span>
                  {purchase.pin && <span className="history-card__barcode-pin">PIN {purchase.pin}</span>}
                </div>

                <dl className="history-card__meta">
                  <div>
                    <dt>구매</dt>
                    <dd>{formatDateTime(purchase.purchasedAt)}</dd>
                  </div>
                  <div>
                    <dt>사용 기한</dt>
                    <dd>{formatDate(purchase.expiresAt)}</dd>
                  </div>
                  <div>
                    <dt>사용 상태</dt>
                    <dd>{usageLabel}</dd>
                  </div>
                </dl>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

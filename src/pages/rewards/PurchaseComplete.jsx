import { Link, useLocation } from 'react-router-dom'
import '../../styles/pages/PurchaseComplete.css'

export default function PurchaseComplete() {
  const location = useLocation()
  const purchase = location.state?.purchase
  const item = location.state?.item

  const isUsed = purchase?.usageStatus === 'used' || Boolean(purchase?.usedAt)
  const expiresAt = purchase?.expiresAt ? new Date(purchase.expiresAt).toLocaleDateString('ko-KR') : '정보 없음'
  const purchasedAt = purchase?.purchasedAt ? new Date(purchase.purchasedAt).toLocaleString('ko-KR') : ''
  const usedAt = purchase?.usedAt ? new Date(purchase.usedAt).toLocaleString('ko-KR') : null

  return (
    <div className="purchase-complete">
      <header>
        <span className="tag">Purchase Complete</span>
        <h1>바코드가 발급되었어요</h1>
        <p>구매 확인 창 이후 바로 확인할 수 있는 전자 바우처를 준비했습니다.</p>
      </header>

      {purchase ? (
        <article className={`purchase-complete__card ${isUsed ? 'is-used' : ''}`}>
          <div className="purchase-complete__summary">
            <div>
              <span>구매 리워드</span>
              <strong>{item?.name ?? purchase.name}</strong>
              <p>{item?.description ?? purchase.memo ?? '구매한 리워드에 대한 상세 설명입니다.'}</p>
            </div>
            <span className="purchase-complete__cost">-{purchase.cost.toLocaleString()} pts</span>
          </div>

          <dl className="purchase-complete__meta-grid">
            <div>
              <dt>구매 일시</dt>
              <dd>{purchasedAt}</dd>
            </div>
            <div>
              <dt>사용 기한</dt>
              <dd>{expiresAt}</dd>
            </div>
            <div>
              <dt>상태</dt>
              <dd>{isUsed ? '사용 완료' : purchase.deliveryStatus}</dd>
            </div>
          </dl>

          <div className="purchase-complete__barcode" role="group" aria-label="리워드 바코드">
            <div className="purchase-complete__barcode-bars" aria-hidden="true" />
            <strong className="purchase-complete__barcode-number">{purchase.barcode}</strong>
            {purchase.pin && <span className="purchase-complete__barcode-pin">PIN {purchase.pin}</span>}
            <p aria-live="polite">{isUsed ? `이미 사용됨 (${usedAt})` : '사용 시 매장 직원에게 바로 보여주세요.'}</p>
          </div>

          {purchase.memo && <p className="purchase-complete__notice">{purchase.memo}</p>}
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

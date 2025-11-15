import {Link} from "react-router-dom";
import {
    getDateTimeParts,
    getPurchaseUsageState,
    normalizeDeliveryStatus,
} from "../pages/rewards/purchaseUtils";

export default function RecentPurchases({purchases = [], limit = 3}) {
    const recentPurchases = purchases.slice(0, limit);
    const hasPurchases = purchases.length > 0;

    if (!hasPurchases) {
        return (
            <div className="purchase-card purchase-card--empty">
                <p>아직 구매 내역이 없어요. 리워드샵에서 첫 리워드를 선택해 보세요.</p>
                <Link to="/rewards/shop" className="cta-button cta-button--primary">
                    리워드샵 둘러보기
                </Link>
            </div>
        );
    }

    return (
        <ul className="purchase-grid">
            {recentPurchases.map((purchase) => {
                const {usageLabel, usageTimestamp} = getPurchaseUsageState(purchase);
                const purchasedAtParts = getDateTimeParts(purchase.purchasedAt);
                const deliveryLabel = normalizeDeliveryStatus(purchase.deliveryStatus);

                return (
                    <li key={purchase.id} className="purchase-card">
                        <div className="purchase-card__meta">
                            <span>{deliveryLabel}</span>
                            <span className="purchase-card__date">
                                {purchasedAtParts ? (
                                    <>
                                        <span>{purchasedAtParts.date}</span>
                                        <span>{purchasedAtParts.time}</span>
                                    </>
                                ) : (
                                    <span>-</span>
                                )}
                            </span>
                        </div>
                        <strong>{purchase.name}</strong>
                        {purchase.memo && <p>{purchase.memo}</p>}
                        <div
                            className="purchase-card__barcode"
                            aria-label={`${purchase.name} 바코드`}
                        >
                            <div className="purchase-card__barcode-bars" aria-hidden="true"/>
                            <span className="purchase-card__barcode-number">{purchase.barcode}</span>
                        </div>
                        <div className="purchase-card__footer">
                            <span
                                className={`purchase-card__status purchase-card__status--${purchase.usageStatus ?? "ready"}`}
                            >
                                <span className="purchase-card__status-label">{usageLabel}</span>
                                {usageTimestamp && (
                                    <span className="purchase-card__status-meta">
                                        <span>{usageTimestamp.date}</span>
                                        <span>{usageTimestamp.time}</span>
                                    </span>
                                )}
                            </span>
                            <span className="purchase-card__cost">
                                -{purchase.cost.toLocaleString()} pts
                            </span>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

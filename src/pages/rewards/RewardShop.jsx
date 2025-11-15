import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import RecentPurchases from "../../components/RecentPurchases";
import { useAppState } from "../../context/AppStateContext";
import "../../styles/pages/Rewards.css";
import "../../styles/pages/RewardShop.css";

const rewardCatalog = [
  {
    id: "convenience",
    title: "편의점 · 즉시 리프레시",
    description:
      "퇴근길에 바로 쓰기 좋은 즉시 발급형 쿠폰으로 작은 루틴을 기분 좋게 마무리하세요.",
    meta: "즉시 발급 · 유통기한 30일",
    items: [
      {
        id: "gs25-night-pack",
        name: "GS25 야식 리셋팩",
        cost: 450,
        description:
          "삼각김밥 + 에너지바 + 아메리카노 구성으로 밤샘 준비에 단짠 보상.",
        badge: "즉시 발급",
        gradient: "linear-gradient(135deg, #f2e4ec, #c9dbf2)",
        perks: ["24시간 교환 가능", "바로 바코드 표시"],
      },
      {
        id: "cu-morning-coffee",
        name: "CU 모닝 브루 세트",
        cost: 620,
        description: "프리미엄 원두 커피 1잔과 초콜릿 바 1개 구성.",
        badge: "출근 추천",
        gradient: "linear-gradient(135deg, #f6f3ff, #e0f5ff)",
        perks: ["이른 아침 사용 OK", "영수증 필요 없음"],
      },
      {
        id: "seven-eleven-fresh",
        name: "세븐일레븐 프레시 보틀",
        cost: 380,
        description: "탄산수/이온음료/프로틴 드링크 중 택 1.",
        badge: "탑픽",
        gradient: "linear-gradient(135deg, #e7f8ff, #d8f2e5)",
        perks: ["당일 취소 가능", "냉장고 픽업"],
      },
    ],
  },
  {
    id: "shopping",
    title: "쇼핑 · 라이프 케어",
    description:
      "면접 준비에 필요한 스테이셔너리, 티켓, 라이프 케어 리워드를 모았습니다.",
    meta: "프리미엄 큐레이션",
    items: [
      {
        id: "stationery-kit",
        name: "모노 스테이셔너리 키트",
        cost: 1800,
        description: "하프문 노트 + 젤펜 3종 + 스터디 스티커 세트.",
        badge: "신규",
        gradient: "linear-gradient(135deg, #fff1e6, #ffdada)",
        perks: ["무료 배송", "선물 포장"],
      },
      {
        id: "mindfulness-pass",
        name: "마인드풀니스 클래스 패스",
        cost: 2400,
        description: "도심 명상 스튜디오 1회 체험권 (주말 사용 가능).",
        badge: "위클리 베스트",
        gradient: "linear-gradient(135deg, #e4f1ff, #d6e4ff)",
        perks: ["1:1 안내 메시지", "최대 2주 예약"],
      },
      {
        id: "premium-coffee-card",
        name: "스페셜티 커피 카드 (3잔)",
        cost: 3200,
        description: "서울 주요 로스터리 제휴, 매장 선택 후 사용.",
        badge: "핫픽",
        gradient: "linear-gradient(135deg, #fdf2ff, #fce8f2)",
        perks: ["일괄 바코드 제공", "친구와 공유 가능"],
      },
    ],
  },
  {
    id: "giftcard",
    title: "콘텐츠 · 상품권",
    description:
      "딥러닝을 도와줄 교육/콘텐츠 상품권부터 범용 디지털 기프트까지.",
    meta: "전자 바우처",
    items: [
      {
        id: "book-culture-10k",
        name: "도서 문화 상품권 1만원",
        cost: 1000,
        description: "전자책·오프라인 서점 어디서든 사용 가능한 기본템.",
        badge: "학습 필수",
        gradient: "linear-gradient(135deg, #e7f3ff, #c3dfff)",
        perks: ["즉시 PIN 발급", "사용 기한 1년"],
      },
      {
        id: "app-store-5k",
        name: "App Store · 구글플레이 5천원",
        cost: 700,
        description: "필요한 생산성 앱, 사전 준비해 두세요.",
        badge: "디지털",
        gradient: "linear-gradient(135deg, #eef8ff, #ddf0ff)",
        perks: ["즉시 코드 확인", "부분 사용 가능"],
      },
      {
        id: "netflix-1month",
        name: "OTT 1개월 패스",
        cost: 2300,
        description: "컨디션 조절을 위한 오프 타임, 넷플릭스/티빙 중 선택.",
        badge: "휴식 모드",
        gradient: "linear-gradient(135deg, #ffe7ef, #ffd7d7)",
        perks: ["교환 후 30일 이내 등록", "계정 공유 가능"],
      },
    ],
  },
];

export default function RewardShop() {
  const { user, redeemReward, purchases } = useAppState();
  const navigate = useNavigate();
  const [selectedReward, setSelectedReward] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(
    rewardCatalog[0]?.id ?? null,
  );
  const recentPurchaseCount = Math.min(3, purchases?.length ?? 0);

  const remainingPoints = useMemo(() => {
    if (!user || !selectedReward) return null;
    return user.points - selectedReward.cost;
  }, [selectedReward, user]);

  const activeCategory = useMemo(() => {
    if (!rewardCatalog.length) return null;
    return (
      rewardCatalog.find((category) => category.id === activeCategoryId) ??
      rewardCatalog[0]
    );
  }, [activeCategoryId]);

  const handleSelectReward = (item, category) => {
    if (!item) return;
    setSelectedReward({
      ...item,
      categoryTitle: category.title,
    });
    setModalError("");
    setModalOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward) return;
    const response = redeemReward(selectedReward);
    if (!response.success) {
      setModalError(response.reason);
      return;
    }
    setModalOpen(false);
    navigate("/rewards/complete", {
      state: { purchase: response.record, item: selectedReward },
    });
    setSelectedReward(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedReward(null);
    setModalError("");
  };

  return (
    <div className="reward-shop">
      <header className="reward-shop__header">
        <div>
          <span className="tag">Reward Shop</span>
          <h1>포인트로 일상을 더 촘촘하게</h1>
          <p>
            사진 없이도 정갈한 카드 UI로 각 카테고리를 한눈에 살펴보고, 루틴
            보상에 어울리는 리워드를 더 스마트하게 선택하세요.
          </p>
        </div>
        <div className="reward-shop__balance">
          <span>보유 포인트</span>
          <strong>{user?.points.toLocaleString()} pts</strong>
        </div>
      </header>

      {rewardCatalog.length > 0 && (
        <div
          className="reward-shop__filters"
          role="tablist"
          aria-label="리워드 카테고리 선택"
        >
          {rewardCatalog.map((category) => {
            const isActive = category.id === activeCategoryId;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`reward-chip ${isActive ? "is-active" : ""}`}
                onClick={() => setActiveCategoryId(category.id)}
              >
                <span>{category.meta}</span>
                <strong>{category.title}</strong>
              </button>
            );
          })}
        </div>
      )}

      <section className="reward-shop__categories" aria-live="polite">
        {activeCategory ? (
          <article key={activeCategory.id} className="reward-category">
            <header className="reward-category__header">
              <div>
                <p className="reward-category__meta">{activeCategory.meta}</p>
                <h2>{activeCategory.title}</h2>
                <p>{activeCategory.description}</p>
              </div>
            </header>
            <div className="reward-category__items">
              {activeCategory.items.map((item) => {
                const disabled = (user?.points ?? 0) < item.cost;
                return (
                  <div
                    key={item.id}
                    className={`reward-item ${disabled ? "is-disabled" : ""}`}
                  >
                    <div
                      className="reward-item__accent"
                      style={{ backgroundImage: item.gradient }}
                      aria-hidden="true"
                    />
                    <div className="reward-item__content">
                      <div className="reward-item__meta">
                        <span className="reward-item__category">
                          {activeCategory.title}
                        </span>
                        {item.badge && (
                          <span className="reward-item__badge">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <strong>{item.name}</strong>
                      <p>{item.description}</p>
                      {item.perks && (
                        <ul className="reward-item__perks">
                          {item.perks.map((perk) => (
                            <li key={perk}>{perk}</li>
                          ))}
                        </ul>
                      )}
                      <div className="reward-item__footer">
                        <span>{item.cost.toLocaleString()} pts</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectReward(item, activeCategory)
                          }
                          disabled={disabled}
                        >
                          교환하기
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ) : (
          <p className="reward-shop__empty">
            표시할 리워드 카테고리가 없습니다.
          </p>
        )}
      </section>

      <section className="reward-shop__recent">
        <header>
          <div>
            <h2>최근 구매 내역</h2>
            <p>
              가장 최근 {recentPurchaseCount}건의 리워드 교환을 바로 확인하세요.
            </p>
          </div>
          <div className="reward-shop__recent-actions">
            <Link
              to="/rewards/history"
              className="cta-button cta-button--ghost"
            >
              전체 내역 보기
            </Link>
          </div>
        </header>
        <RecentPurchases purchases={purchases} limit={3} />
      </section>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title="리워드 교환 확인"
        footer={
          <div className="redeem-confirm__actions">
            <button
              type="button"
              className="cta-button cta-button--ghost"
              onClick={handleCloseModal}
            >
              조금 더 둘러볼게요
            </button>
            <button
              type="button"
              className="cta-button cta-button--primary"
              onClick={handleConfirmRedeem}
              disabled={(remainingPoints ?? 0) < 0}
            >
              교환 확정
            </button>
          </div>
        }
      >
        {selectedReward && (
          <div className="redeem-confirm">
            <div className="redeem-confirm__summary">
              <span>{selectedReward.categoryTitle}</span>
              <strong>{selectedReward.name}</strong>
              <p>{selectedReward.description}</p>
            </div>
            <ul className="redeem-confirm__meta">
              <li>
                <span>필요 포인트</span>
                <strong>{selectedReward.cost.toLocaleString()} pts</strong>
              </li>
              <li>
                <span>교환 후 잔여 포인트</span>
                <strong>{remainingPoints?.toLocaleString()} pts</strong>
              </li>
            </ul>
            {modalError && (
              <p className="redeem-confirm__error">{modalError}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ko-KR') : '-')

export const formatDateTime = (value) => (value ? new Date(value).toLocaleString('ko-KR') : '-')

export function getPurchaseUsageState(purchase) {
  const isUsed = purchase?.usageStatus === 'used' || Boolean(purchase?.usedAt)
  const isExpired = purchase?.usageStatus === 'expired'
  const usageLabel = isUsed
    ? `사용 완료 · ${formatDateTime(purchase?.usedAt)}`
    : isExpired
      ? '기간 만료'
      : '사용 가능'

  return { isUsed, isExpired, usageLabel }
}

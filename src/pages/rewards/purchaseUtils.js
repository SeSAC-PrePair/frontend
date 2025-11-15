export const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ko-KR') : '-')

export const formatDateTime = (value) => (value ? new Date(value).toLocaleString('ko-KR') : '-')

export const getDateTimeParts = (value) => {
  if (!value) return null
  const date = new Date(value)
  return {
    date: date.toLocaleDateString('ko-KR'),
    time: date.toLocaleTimeString('ko-KR'),
  }
}

export function normalizeDeliveryStatus(status) {
  if (!status) return '바코드 발급'
  const compact = status.replace(/\s/g, '').toLowerCase()
  if (compact.includes('배송')) {
    return '배송'
  }
  return '바코드 발급'
}

export function getPurchaseUsageState(purchase) {
  const isUsed = purchase?.usageStatus === 'used' || Boolean(purchase?.usedAt)
  const isExpired = purchase?.usageStatus === 'expired'
  const usageLabel = isUsed ? '사용 완료' : isExpired ? '기간 만료' : '사용 가능'
  const usageTimestamp = isUsed ? getDateTimeParts(purchase?.usedAt) : null

  return { isUsed, isExpired, usageLabel, usageTimestamp }
}

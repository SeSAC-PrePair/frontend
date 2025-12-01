import './ContributionHeatmap.css'

export default function ContributionHeatmap({data, scoreMap = new Map(), startDate, startDateOffset = 0, startDayOfWeek = 0}) {
    if (!data || data.length === 0) {
        return null
    }

    const columns = data.length
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentYear = today.getFullYear()

    // 시작 날짜: 올해 1월 1일
    let effectiveStartDate
    if (startDate instanceof Date && !isNaN(startDate.getTime())) {
        effectiveStartDate = new Date(startDate.getTime())
        effectiveStartDate.setDate(effectiveStartDate.getDate() + startDateOffset)
        effectiveStartDate.setHours(0, 0, 0, 0)
    } else {
        effectiveStartDate = new Date(currentYear, 0, 1)
        effectiveStartDate.setHours(0, 0, 0, 0)
    }

    // 1월 1일의 요일 offset
    const effectiveStartDayOfWeek = startDayOfWeek || effectiveStartDate.getDay()

    // 날짜 포맷터: "2025년 11월 30일" 형식
    const formatDate = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${year}년 ${month}월 ${day}일`
    }

    return (
        <div className="heatmap-widget">
            <div className="heatmap-widget__grid" role="grid" style={{'--columns': columns}}>
                {data.map((week, weekIndex) => (
                    <div key={weekIndex} className="heatmap-widget__column" role="row">
                        {week.map((value, dayIndex) => {
                            // -1은 빈 칸 (1월 1일 이전 또는 12월 31일 이후)
                            if (value === -1) {
                                return (
                                    <span
                                        key={`${weekIndex}-${dayIndex}`}
                                        className="heatmap-widget__cell heatmap-level-empty"
                                        role="gridcell"
                                        aria-hidden="true"
                                    />
                                )
                            }

                            // 실제 날짜 계산
                            const dayOffset = weekIndex * 7 + dayIndex - effectiveStartDayOfWeek
                            const cellDate = new Date(effectiveStartDate)
                            cellDate.setDate(cellDate.getDate() + dayOffset)
                            cellDate.setHours(0, 0, 0, 0)

                            const dateLabel = formatDate(cellDate)

                            // 점수 정보 가져오기
                            const dateKey = `${cellDate.getFullYear()}-${cellDate.getMonth() + 1}-${cellDate.getDate()}`
                            const scoreInfo = scoreMap.get(dateKey)
                            const score = scoreInfo?.score ?? null

                            // 답변 여부
                            const hasAnswered = Number(value) > 0 || scoreInfo !== undefined
                            const level = hasAnswered ? 1 : 0

                            // 툴팁 텍스트 생성
                            let tooltip
                            if (hasAnswered && score !== null) {
                                tooltip = `${dateLabel} · ${score}점`
                            } else if (hasAnswered) {
                                tooltip = `${dateLabel} · 답변함`
                            } else {
                                tooltip = `${dateLabel} · 답변 안함`
                            }

                            const isTopRow = dayIndex <= 1

                            return (
                                <span
                                    key={`${weekIndex}-${dayIndex}`}
                                    className={`heatmap-widget__cell heatmap-level-${level}${isTopRow ? ' is-top-row' : ''}`}
                                    role="gridcell"
                                    aria-label={`${days[dayIndex]} · ${tooltip}`}
                                    data-tooltip={tooltip}
                                    tabIndex={0}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
            <div className="heatmap-widget__legend" aria-label="답변 여부 범례">
                <span>답변 안함</span>
                <span className="legend-swatch heatmap-level-0" aria-hidden="true" />
                <span className="legend-swatch heatmap-level-1" aria-hidden="true" />
                <span>답변함</span>
            </div>
        </div>
    )
}

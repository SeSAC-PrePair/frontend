import './ContributionHeatmap.css'

export default function ContributionHeatmap({data}) {
    if (!data || data.length === 0) {
        return null
    }

    const columns = data.length
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const totalDays = columns * 7
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    startDate.setDate(startDate.getDate() - (totalDays - 1))
    const dayMs = 24 * 60 * 60 * 1000
    const formatter = new Intl.DateTimeFormat('ko-KR', {month: 'numeric', day: 'numeric', weekday: 'short'})

    return (
        <div className="heatmap-widget">
            <div className="heatmap-widget__grid" role="grid" style={{'--columns': columns}}>
                {data.map((week, weekIndex) => (
                    <div key={weekIndex} className="heatmap-widget__column" role="row">
                        {week.map((value, dayIndex) => {
                            const offset = weekIndex * 7 + dayIndex
                            const cellDate = new Date(startDate.getTime() + offset * dayMs)
                            const dateLabel = formatter.format(cellDate)
                            const score = value * 25
                            const tooltip = `${dateLabel} · 활동 점수 ${score}`

                            return (
                                <span
                                    key={`${weekIndex}-${dayIndex}`}
                                    className="heatmap-widget__cell"
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
            <div className="heatmap-widget__legend" aria-hidden="true">
                <span>최근 활동</span>
                <span className="heatmap-widget__legend-dot" />
                <span>점수 확인</span>
            </div>
        </div>
    )
}

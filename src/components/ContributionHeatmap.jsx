export default function ContributionHeatmap({ data }) {
  if (!data || data.length === 0) {
    return null
  }

  const columns = data.length
  const days = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="heatmap-widget">
      <div className="heatmap-widget__grid" role="grid" style={{ '--columns': columns }}>
        {data.map((week, weekIndex) => (
          <div key={weekIndex} className="heatmap-widget__column" role="row">
            {week.map((value, dayIndex) => (
              <span
                key={`${weekIndex}-${dayIndex}`}
                className={`heatmap-widget__cell level-${value}`}
                role="gridcell"
                aria-label={`${days[dayIndex]} · 활동 레벨 ${value}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap-widget__legend">
        <span>Less</span>
        <div>
          <span className="heatmap-widget__cell level-0" aria-hidden="true" />
          <span className="heatmap-widget__cell level-1" aria-hidden="true" />
          <span className="heatmap-widget__cell level-2" aria-hidden="true" />
          <span className="heatmap-widget__cell level-3" aria-hidden="true" />
          <span className="heatmap-widget__cell level-4" aria-hidden="true" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

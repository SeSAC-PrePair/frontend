import { useEffect, useRef } from 'react'
import './ContributionHeatmap.css'

export default function ContributionHeatmap({data}) {
    const gridRef = useRef(null)

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
    const formatter = new Intl.DateTimeFormat('ko-KR', {month: 'long', day: 'numeric', weekday: 'short'})

    useEffect(() => {
        if (!gridRef.current) return

        const cells = gridRef.current.querySelectorAll('.heatmap-widget__cell')
        const isMobile = window.matchMedia('(max-width: 480px)').matches

        // 모바일 환경에서는 건들지 않음
        if (isMobile) return

        const adjustTooltip = (cell) => {
            const tooltip = cell.getAttribute('data-tooltip')
            if (!tooltip) return

            // 임시 요소로 tooltip 크기 측정
            const tempTooltip = document.createElement('div')
            tempTooltip.style.cssText = `
                position: absolute;
                visibility: hidden;
                white-space: nowrap;
                padding: 0.35rem 0.6rem;
                font-size: 0.7rem;
                font-family: inherit;
            `
            tempTooltip.textContent = tooltip
            document.body.appendChild(tempTooltip)
            const tooltipWidth = tempTooltip.offsetWidth
            const tooltipHeight = tempTooltip.offsetHeight
            document.body.removeChild(tempTooltip)

            const cellRect = cell.getBoundingClientRect()
            const isTopRow = cell.classList.contains('is-top-row')
            
            // tooltip의 수평 위치 계산 (셀 중앙 기준)
            let tooltipX = cellRect.left + cellRect.width / 2
            
            // viewport 경계 확인
            const viewportWidth = window.innerWidth
            const viewportPadding = 16 // viewport 양쪽 여백
            
            // tooltip이 왼쪽으로 잘리면
            if (tooltipX - tooltipWidth / 2 < viewportPadding) {
                tooltipX = viewportPadding + tooltipWidth / 2
            }
            // tooltip이 오른쪽으로 잘리면
            else if (tooltipX + tooltipWidth / 2 > viewportWidth - viewportPadding) {
                tooltipX = viewportWidth - viewportPadding - tooltipWidth / 2
            }
            
            // tooltip의 수직 위치 계산
            let tooltipY
            if (isTopRow) {
                // 위쪽 행: tooltip을 셀 아래에 배치
                tooltipY = cellRect.bottom + 8
            } else {
                // 아래쪽 행: tooltip을 셀 위에 배치
                tooltipY = cellRect.top - tooltipHeight - 8
            }
            
            // fixed 포지셔닝을 위한 viewport 기준 좌표 설정
            cell.style.setProperty('--tooltip-x', `${tooltipX}px`)
            cell.style.setProperty('--tooltip-y', `${tooltipY}px`)
        }

        const handleMouseEnter = (e) => {
            adjustTooltip(e.target)
        }

        const handleMouseMove = (e) => {
            adjustTooltip(e.target)
        }

        cells.forEach((cell) => {
            cell.addEventListener('mouseenter', handleMouseEnter)
            cell.addEventListener('mousemove', handleMouseMove)
        })

        return () => {
            cells.forEach((cell) => {
                cell.removeEventListener('mouseenter', handleMouseEnter)
                cell.removeEventListener('mousemove', handleMouseMove)
            })
        }
    }, [data])

    return (
        <div className="heatmap-widget">
            <div className="heatmap-widget__grid" ref={gridRef} role="grid" style={{'--columns': columns}}>
                {data.map((week, weekIndex) => (
                    <div key={weekIndex} className="heatmap-widget__column" role="row">
                        {week.map((value, dayIndex) => {
                            const offset = weekIndex * 7 + dayIndex
                            const cellDate = new Date(startDate.getTime() + offset * dayMs)
                            const dateLabel = formatter.format(cellDate)
                            // 답변 여부: 0 = 답변 안함, 1 = 답변함
                            const hasAnswered = Number(value) > 0 ? 1 : 0
                            const level = hasAnswered
                            const tooltip = hasAnswered ? `${dateLabel} · 답변함` : `${dateLabel} · 답변 안함`
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

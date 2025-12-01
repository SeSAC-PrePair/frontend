import { useEffect, useRef } from 'react'
import './ContributionHeatmap.css'

export default function ContributionHeatmap({data, scoreMap = new Map(), startDate, startDateOffset = 0}) {
    const gridRef = useRef(null)

    console.log('[ContributionHeatmap] Props:', {
        dataLength: data?.length,
        scoreMapSize: scoreMap?.size,
        startDate,
        startDateOffset
    })
    console.log('[ContributionHeatmap] Data sample (first week):', data?.[0])
    console.log('[ContributionHeatmap] ScoreMap keys (first 10):', scoreMap ? Array.from(scoreMap.keys()).slice(0, 10) : [])

    if (!data || data.length === 0) {
        console.warn('[ContributionHeatmap] No data provided')
        return null
    }

    const columns = data.length
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const totalDays = columns * 7
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 오늘이 속한 주의 시작일(일요일) 계산
    const todayDayOfWeek = today.getDay() // 0=일요일, 6=토요일
    
    // 시작 날짜: 상위에서 계산된 startDate가 있으면 사용, 없으면 기존 로직 사용
    let effectiveStartDate
    if (startDate instanceof Date && !isNaN(startDate.getTime())) {
        effectiveStartDate = new Date(startDate.getTime())
        effectiveStartDate.setDate(effectiveStartDate.getDate() + startDateOffset)
        effectiveStartDate.setHours(0, 0, 0, 0)
    } else {
        // generateActivityHeatmap과 동일한 로직 사용
        effectiveStartDate = new Date(today)
        effectiveStartDate.setDate(effectiveStartDate.getDate() - (totalDays - 1) - todayDayOfWeek + startDateOffset)
        effectiveStartDate.setHours(0, 0, 0, 0)
    }
    
    const dayMs = 24 * 60 * 60 * 1000
    const formatter = new Intl.DateTimeFormat('ko-KR', {month: 'long', day: 'numeric', weekday: 'short'})

    useEffect(() => {
        if (!gridRef.current) return

        const cells = gridRef.current.querySelectorAll('.heatmap-widget__cell')
        const isMobile = window.matchMedia('(max-width: 480px)').matches

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

        // 모바일 클릭 이벤트 핸들러
        const handleClick = (e) => {
            if (isMobile) {
                const cell = e.currentTarget
                const currentlyActive = gridRef.current?.querySelector('.heatmap-widget__cell.active')
                
                // 다른 셀의 active 클래스 제거
                if (currentlyActive && currentlyActive !== cell) {
                    currentlyActive.classList.remove('active')
                }
                
                // 현재 셀 토글
                if (cell.classList.contains('active')) {
                    cell.classList.remove('active')
                } else {
                    // 모바일에서는 툴팁을 셀 아래에 표시
                    const cellRect = cell.getBoundingClientRect()
                    const tooltipY = cellRect.bottom + 8
                    const tooltipX = cellRect.left + cellRect.width / 2
                    cell.style.setProperty('--tooltip-x', `${tooltipX}px`)
                    cell.style.setProperty('--tooltip-y', `${tooltipY}px`)
                    cell.classList.add('active')
                }
            }
        }

        // 외부 클릭 시 툴팁 닫기 (모바일)
        const handleDocumentClick = (e) => {
            if (isMobile && !e.target.closest('.heatmap-widget__cell')) {
                const activeCell = gridRef.current?.querySelector('.heatmap-widget__cell.active')
                if (activeCell) {
                    activeCell.classList.remove('active')
                }
            }
        }

        cells.forEach((cell) => {
            cell.addEventListener('mouseenter', handleMouseEnter)
            cell.addEventListener('mousemove', handleMouseMove)
            if (isMobile) {
                cell.addEventListener('click', handleClick)
            }
        })

        if (isMobile) {
            document.addEventListener('click', handleDocumentClick)
        }

        return () => {
            cells.forEach((cell) => {
                cell.removeEventListener('mouseenter', handleMouseEnter)
                cell.removeEventListener('mousemove', handleMouseMove)
                if (isMobile) {
                    cell.removeEventListener('click', handleClick)
                }
            })
            if (isMobile) {
                document.removeEventListener('click', handleDocumentClick)
            }
        }
    }, [data])

    return (
        <div className="heatmap-widget">
            <div className="heatmap-widget__grid" ref={gridRef} role="grid" style={{'--columns': columns}}>
                {data.map((week, weekIndex) => (
                    <div key={weekIndex} className="heatmap-widget__column" role="row">
                        {week.map((value, dayIndex) => {
                            const offset = weekIndex * 7 + dayIndex
                            const cellDate = new Date(effectiveStartDate.getTime() + offset * dayMs)
                            cellDate.setHours(0, 0, 0, 0)
                            const dateLabel = formatter.format(cellDate)
                            
                            // 점수 정보 가져오기
                            // 키는 로컬 날짜 문자열(RewardsOverview의 getLocalDateKey와 동일한 규칙 사용)
                            const dateKey = `${cellDate.getFullYear()}-${cellDate.getMonth() + 1}-${cellDate.getDate()}`
                            const scoreInfo = scoreMap.get(dateKey)
                            const score = scoreInfo?.score ?? null
                            
                            // 답변 여부: value가 1이거나 scoreMap에 데이터가 있으면 답변함
                            const hasAnswered = Number(value) > 0 || scoreInfo !== undefined ? 1 : 0
                            const level = hasAnswered
                            
                            // 디버깅: 첫 번째 주의 첫 번째 날짜만 로그
                            if (weekIndex === 0 && dayIndex === 0) {
                                console.log('[ContributionHeatmap] First cell debug:', {
                                    value,
                                    dateKey,
                                    scoreInfo,
                                    hasAnswered,
                                    level
                                })
                            }
                            
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

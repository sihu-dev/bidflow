/**
 * Mock PriceDisplay component for BIDFLOW
 */
interface PriceDisplayProps {
  price: number
  changePercent?: number
  size?: string
  showChange?: boolean
  className?: string
}

export function PriceDisplay({ price, changePercent, showChange = true, className }: PriceDisplayProps) {
  return (
    <div className={className}>
      <span>{price.toFixed(2)}</span>
      {showChange && changePercent !== undefined && (
        // 모노크롬: 밝기로 변화 방향 표시 (up=밝음, down=어두움)
        <span className={changePercent >= 0 ? 'text-neutral-300' : 'text-neutral-600'}>
          {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
        </span>
      )}
    </div>
  )
}

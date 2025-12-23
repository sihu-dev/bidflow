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
        <span className={changePercent >= 0 ? 'text-neutral-900' : 'text-neutral-600'}>
          {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
        </span>
      )}
    </div>
  )
}

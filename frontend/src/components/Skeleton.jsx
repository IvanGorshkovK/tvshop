export function Skeleton({ className = '', style }) {
  return <span className={`skeleton ${className}`.trim()} style={style} aria-hidden="true" />
}

export function ProductCardSkeleton() {
  return (
    <div className="card product-card product-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--media" />
      <div className="product-card__body">
        <Skeleton style={{ width: '38%', height: 11 }} />
        <Skeleton style={{ width: '90%', height: 16 }} />
        <Skeleton style={{ width: '62%', height: 16 }} />
        <Skeleton style={{ width: '48%', height: 14 }} />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

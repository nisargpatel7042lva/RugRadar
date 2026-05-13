export default function Skeleton({ rows = 5 }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 rounded mb-1 shimmer"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  )
}

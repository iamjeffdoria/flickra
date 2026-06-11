import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function PostSkeleton() {
  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e9eaf0">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            <Skeleton width={32} height={32} borderRadius={10} />
            <div>
              <Skeleton width={100} height={10} borderRadius={6} />
              <div className="mt-1">
                <Skeleton width={60} height={8} borderRadius={6} />
              </div>
            </div>
          </div>
          <Skeleton width={56} height={22} borderRadius={6} />
        </div>

        {/* Caption line */}
        <div className="px-3 pb-2">
          <Skeleton width="65%" height={9} borderRadius={6} />
        </div>

        {/* Image — full width, square */}
        <Skeleton width="100%" height={0} style={{ paddingBottom: '100%', display: 'block' }} />

        {/* Actions */}
        <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-50">
          <Skeleton width={54} height={28} borderRadius={8} />
          <Skeleton width={54} height={28} borderRadius={8} />
        </div>

      </div>
    </SkeletonTheme>
  )
}
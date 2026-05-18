"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function AdminStatCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminChartSkeleton({ title }: { title?: string }) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
      )}
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  )
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

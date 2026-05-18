"use client"

import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: { value: number; positive?: boolean }
}

export function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {trend && (
          <div
            className={`text-sm font-medium ${trend.positive !== false ? "text-green-600" : "text-red-600"}`}
          >
            {trend.positive !== false ? "+" : ""}{trend.value}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}

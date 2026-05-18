"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface AdminErrorProps {
  message?: string
  onRetry?: () => void
}

export function AdminError({ message = "Failed to load data", onRetry }: AdminErrorProps) {
  return (
    <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
      <CardContent className="flex items-center gap-4 p-6">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
        <div className="flex-1">
          <p className="font-medium text-red-800 dark:text-red-200">{message}</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            Check your connection and try again.
          </p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

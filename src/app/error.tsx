"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createLogger } from "@/lib/logger"

const logger = createLogger("error")

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations()

  useEffect(() => {
    logger.error("Page error:", error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="max-w-md border-red-500/50 bg-red-950/20">
        <CardHeader>
          <CardTitle className="text-red-400">{t("error") || "Ошибка"}</CardTitle>
          <CardDescription className="text-red-300/70">
            <p>{error.message || t("errorDescription") || "Произошла ошибка при загрузке"}</p>
            {error.digest && (
              <p className="mt-2 text-xs text-red-300/50">Error ID: {error.digest}</p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={reset} variant="outline" className="border-red-500/50 text-red-300">
            {t("tryAgain") || "Попробовать снова"}
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="secondary"
            className="bg-slate-800 text-slate-200"
          >
            {t("goHome") || "На главную"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

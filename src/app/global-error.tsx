"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createLogger } from "@/lib/logger"

const logger = createLogger("global-error")

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error("Global error:", error.message, error.stack)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
          <Card className="max-w-md border-red-500/50 bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-red-400">Критическая ошибка</CardTitle>
              <CardDescription className="text-red-300/70">
                <p>{error.message || "Произошла критическая ошибка приложения"}</p>
                {error.digest && (
                  <p className="mt-2 text-xs text-red-300/50">Error ID: {error.digest}</p>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                onClick={reset}
                variant="outline"
                className="border-red-500/50 text-red-300 hover:bg-red-950/50"
              >
                Попробовать снова
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="secondary"
                className="bg-slate-800 text-slate-200"
              >
                На главную
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}

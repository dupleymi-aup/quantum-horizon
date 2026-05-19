import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import { db } from "@/lib/db"
import { createLogger } from "@/lib/logger"
import { adminJson } from "@/lib/admin-response"
import { withRateLimit } from "@/lib/rate-limit"
import { withCsrf } from "@/lib/csrf"

const logger = createLogger("api:settings")

async function GETHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return adminJson({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await db.userSettings.findUnique({
      where: { userId: session.user.id },
    })

    return adminJson({ success: true, data: settings })
  } catch (error) {
    logger.error("Failed to fetch settings", { error })
    return adminJson({ error: "Internal server error" }, { status: 500 })
  }
}

async function PATCHHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return adminJson({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { theme, language, fontSize, reduceMotion, highContrast, showAnimations, soundEnabled, volume, autoSave } = body

    const settings = await db.userSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        theme: theme ?? "system",
        language: language ?? "ru",
        fontSize: fontSize ?? "normal",
        reduceMotion: reduceMotion ?? false,
        highContrast: highContrast ?? false,
        showAnimations: showAnimations ?? true,
        soundEnabled: soundEnabled ?? false,
        volume: volume ?? 50,
        autoSave: autoSave ?? true,
      },
      update: {
        ...(theme !== undefined && { theme }),
        ...(language !== undefined && { language }),
        ...(fontSize !== undefined && { fontSize }),
        ...(reduceMotion !== undefined && { reduceMotion }),
        ...(highContrast !== undefined && { highContrast }),
        ...(showAnimations !== undefined && { showAnimations }),
        ...(soundEnabled !== undefined && { soundEnabled }),
        ...(volume !== undefined && { volume }),
        ...(autoSave !== undefined && { autoSave }),
      },
    })

    return adminJson({ success: true, data: settings })
  } catch (error) {
    logger.error("Failed to update settings", { error })
    return adminJson({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withRateLimit(GETHandler)
export const PATCH = withCsrf(withRateLimit(PATCHHandler))

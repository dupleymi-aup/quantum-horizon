import { NextResponse } from "next/server"

/**
 * GET /api
 * API index — lists available endpoints
 */
export function GET() {
  return NextResponse.json({
    name: "Quantum Horizon API",
    version: "0.4.3",
    description: "Интерактивная образовательная платформа по физике",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        resetPassword: "POST /api/auth/reset-password",
        session: "GET /api/auth/[...nextauth]",
      },
      visualizations: {
        progress: "GET|POST /api/visualizations/progress",
        bookmarks: "GET|POST|DELETE /api/visualizations/bookmarks",
      },
      activity: {
        list: "GET /api/activity?limit=50&offset=0",
        create: "POST /api/activity",
      },
      achievements: {
        list: "GET /api/achievements",
        update: "POST /api/achievements",
        unlock: "POST /api/achievements { achievementId }",
      },
    },
    documentation: "/API.md",
  })
}

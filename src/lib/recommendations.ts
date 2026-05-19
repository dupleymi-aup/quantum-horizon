import { VISUALIZATIONS_REGISTRY, type VisualizationMeta } from "@/lib/visualizations-registry"

interface RecommendationInput {
  completedTopics: string[]
  bookmarkedTopics: string[]
  lowScoreTopics: string[] // topics where user scored poorly on quizzes
  currentTopic?: string
}

interface RecommendationScore {
  viz: VisualizationMeta
  score: number
  reason: string
}

/**
 * Рекомендует top 5 визуализаций на основе:
 * - completed: уже пройденные (низкий приоритет)
 * - bookmarked: в закладках (+30)
 * - lowScore: темы с низкими баллами (+40)
 * - prerequisites: если prerequisites выполнены (+20)
 * - not completed: не пройденные (+15)
 * - current: текущая тема (исключается)
 */
export function getRecommendations(input: RecommendationInput): RecommendationScore[] {
  const { completedTopics, bookmarkedTopics, lowScoreTopics, currentTopic } = input

  const scored: RecommendationScore[] = []

  for (const viz of VISUALIZATIONS_REGISTRY) {
    if (viz.id === currentTopic) continue

    let score = 0
    const reasons: string[] = []

    const isCompleted = completedTopics.includes(viz.id)
    const isBookmarked = bookmarkedTopics.includes(viz.id)
    const isLowScore = lowScoreTopics.includes(viz.id)

    // Prerequisites check
    const prereqsMet =
      !viz.prerequisites || viz.prerequisites.every((p) => completedTopics.includes(p))

    if (!prereqsMet && !isCompleted) {
      // Still show but with lower score — might motivate user
      score += 5
      reasons.push("has prerequisites")
    }

    if (isBookmarked) {
      score += 30
      reasons.push("bookmarked")
    }

    if (isLowScore) {
      score += 40
      reasons.push("needs improvement")
    }

    if (!isCompleted) {
      score += 15
      reasons.push("not yet explored")
    } else {
      score += 2 // small bonus for review
    }

    // Difficulty bonus: recommend slightly harder content
    if (viz.difficulty === "intermediate" && completedTopics.length > 5) {
      score += 10
    } else if (viz.difficulty === "advanced" && completedTopics.length > 10) {
      score += 15
    }

    scored.push({ viz, score, reason: reasons.join(", ") })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 5)
}

/**
 * Получить заголовок рекомендации для UI
 */
export function getRecommendationTitle(viz: VisualizationMeta, locale: string): string {
  return viz.title[locale as keyof typeof viz.title] ?? viz.title["en"] ?? viz.id
}

/**
 * Получить описание рекомендации для UI
 */
export function getRecommendationDescription(viz: VisualizationMeta, locale: string): string {
  return viz.description[locale as keyof typeof viz.description] ?? viz.description["en"] ?? ""
}

// ==================== TRANSLATIONS ====================
// Re-export translations from JSON files for backward compatibility
import ruTranslations from "@/i18n/messages/ru.json"
import enTranslations from "@/i18n/messages/en.json"
import zhTranslations from "@/i18n/messages/zh.json"
import heTranslations from "@/i18n/messages/he.json"

export type Language = "ru" | "en" | "zh" | "he"

// Используем ru как базовый тип, но разрешаем неполные переводы для других языков
export type Translation = typeof ruTranslations

export const translations: Record<Language, Partial<Translation>> = {
  ru: ruTranslations,
  en: enTranslations,
  zh: zhTranslations,
  he: heTranslations,
}

// Типизированные экспорты для прямого импорта
export { ruTranslations as ru, enTranslations as en, zhTranslations as zh, heTranslations as he }

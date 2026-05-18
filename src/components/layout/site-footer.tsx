interface SiteFooterProps {
  isDark: boolean
  locale: string
}

export function SiteFooter({ isDark, locale }: SiteFooterProps) {
  const shortcutHint = () => {
    switch (locale) {
      case "en":
        return "1-5 sections, M menu, Esc close"
      case "zh":
        return "1-5 章节，M 菜单，Esc 关闭"
      case "he":
        return "1-5 סעיפים, M תפריט, Esc סגור"
      default:
        return "1-5 разделы, M меню, Esc закрыть"
    }
  }

  return (
    <footer
      className={`mt-8 border-t py-6 transition-colors duration-300 ${
        isDark ? "border-white/10 bg-gray-950/50" : "border-gray-200/80 bg-white/50"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"}`}>
            © 2026 Quantum Horizon. Образовательный проект по физике
          </p>
          <p
            className={`flex items-center gap-2 text-xs ${
              isDark ? "text-gray-600" : "text-gray-500"
            }`}
          >
            <span className="rounded-md bg-purple-500/10 px-2 py-1 text-purple-400">⌨️</span>
            <span>{shortcutHint()}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

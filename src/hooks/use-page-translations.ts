import { useTranslations, useLocale } from "next-intl"
import { useMemo } from "react"

type Locale = "ru" | "en" | "zh" | "he"

interface Texts {
  about: string
  aboutDescription: string
  sections: string
  visualizations: string
  formulas: string
  settings: string
  language: string
  theme: string
  footer: string
  keyboard: string
  menu: string
  tools: string
  laboratory: string
  glossary: string
  periodicTable: string
  help: string
  flashcards: string
  practiceProblems: string
}

interface VisualizationLabels {
  waveFunction: string
  uncertainty: string
  tunneling: string
  timeDilation: string
  hrDiagram: string
  neutronStar: string
  blackHole: string
  whiteHole: string
  doubleSlit: string
  darkMatter: string
}

interface FormulaExamples {
  items: string[]
}

const TEXTS: Record<Locale, Texts> = {
  ru: {
    about: "📚 О проекте",
    aboutDescription: "Интерактивные визуализации физических явлений: от квантовой механики до космологии.",
    sections: "📖 Разделы",
    visualizations: "🔬 Визуализации",
    formulas: "📐 Формулы",
    settings: "⚙️ Настройки",
    language: "Язык",
    theme: "Тема",
    footer: "Создано с ❤️ для любителей физики",
    keyboard: "Клавиши: 1-4 разделы, M меню, Esc закрыть",
    menu: "Меню",
    tools: "🧪 Инструменты",
    laboratory: "Лаборатория",
    glossary: "Глоссарий",
    periodicTable: "Периодическая таблица",
    help: "Помощь",
    flashcards: "Карточки",
    practiceProblems: "Задачи",
  },
  en: {
    about: "📚 About",
    aboutDescription: "Interactive visualizations of physical phenomena: from quantum mechanics to cosmology.",
    sections: "📖 Sections",
    visualizations: "🔬 Visualizations",
    formulas: "📐 Formulas",
    settings: "⚙️ Settings",
    language: "Language",
    theme: "Theme",
    footer: "Made with ❤️ for physics enthusiasts",
    keyboard: "Keys: 1-4 sections, M menu, Esc close",
    menu: "Menu",
    tools: "🧪 Tools",
    laboratory: "Laboratory",
    glossary: "Glossary",
    periodicTable: "Periodic Table",
    help: "Help",
    flashcards: "Flashcards",
    practiceProblems: "Practice Problems",
  },
  zh: {
    about: "📚 关于项目",
    aboutDescription: "物理现象的交互式可视化：从量子力学到宇宙学。",
    sections: "📖 章节",
    visualizations: "🔬 可视化",
    formulas: "📐 公式",
    settings: "⚙️ 设置",
    language: "语言",
    theme: "主题",
    footer: "为物理爱好者用❤️制作",
    keyboard: "快捷键：1-4 章节，M 菜单，Esc 关闭",
    menu: "菜单",
    tools: "🧪 工具",
    laboratory: "实验室",
    glossary: "术语表",
    periodicTable: "元素周期表",
    help: "帮助",
    flashcards: "抽认卡",
    practiceProblems: "练习题",
  },
  he: {
    about: "📚 אודות",
    aboutDescription: "הדמיות אינטראקטיביות של תופעות פיזיקליות: ממכניקת הקוונטים ועד קוסמולוגיה.",
    sections: "📖 סעיפים",
    visualizations: "🔬 ויזואליזציות",
    formulas: "📐 נוסחאות",
    settings: "⚙️ הגדרות",
    language: "שפה",
    theme: "ערכת נושא",
    footer: "נבנה ב❤️ לחובבי פיזיקה",
    keyboard: "מקשים: 1-4 סעיפים, M תפריט, Esc סגור",
    menu: "תפריט",
    tools: "🧪 כלים",
    laboratory: "מעבדה",
    glossary: "מילון מונחים",
    periodicTable: "טבלה מחזורית",
    help: "עזרה",
    flashcards: "כרטיסי לימוד",
    practiceProblems: "תרגילים",
  },
}

const VISUALIZATION_LABELS: Record<Locale, VisualizationLabels> = {
  ru: {
    waveFunction: "Волновая функция",
    uncertainty: "Принцип неопределённости",
    tunneling: "Квантовое туннелирование",
    timeDilation: "Замедление времени",
    hrDiagram: "Диаграмма Г-Р",
    neutronStar: "Нейтронная звезда",
    blackHole: "Чёрная дыра",
    whiteHole: "Белая дыра",
    doubleSlit: "Двойная щель",
    darkMatter: "Тёмная материя",
  },
  en: {
    waveFunction: "Wave Function",
    uncertainty: "Uncertainty Principle",
    tunneling: "Quantum Tunneling",
    timeDilation: "Time Dilation",
    hrDiagram: "H-R Diagram",
    neutronStar: "Neutron Star",
    blackHole: "Black Hole",
    whiteHole: "White Hole",
    doubleSlit: "Double Slit",
    darkMatter: "Dark Matter",
  },
  zh: {
    waveFunction: "波函数",
    uncertainty: "不确定性原理",
    tunneling: "量子隧穿",
    timeDilation: "时间膨胀",
    hrDiagram: "赫罗图",
    neutronStar: "中子星",
    blackHole: "黑洞",
    whiteHole: "白洞",
    doubleSlit: "双缝实验",
    darkMatter: "暗物质",
  },
  he: {
    waveFunction: "פונקציית גל",
    uncertainty: "עיקרון אי-הוודאות",
    tunneling: "מינהור קוונטי",
    timeDilation: "התארכות זמן",
    hrDiagram: "דיאגרמת H-R",
    neutronStar: "כוכב נייטרון",
    blackHole: "חור שחור",
    whiteHole: "חור לבן",
    doubleSlit: "סדק כפול",
    darkMatter: "חומר אפל",
  },
}

const FORMULAS: FormulaExamples = {
  items: [
    "E = mc²",
    "Δx·Δp ≥ ℏ/2",
    "ψ(x,t) = Ae^(i(kx-ωt))",
    "R_s = 2GM/c²",
    "T_H = ℏc³/8πGMk_B",
    "γ = 1/√(1-v²/c²)",
  ],
}

export function usePageTranslations() {
  const t = useTranslations()
  const locale = useLocale()

  return useMemo(
    () => ({
      t,
      locale,
      getTexts: () => TEXTS[locale as Locale],
      getVisualizationLabels: () => VISUALIZATION_LABELS[locale as Locale],
      getFormulas: () => FORMULAS,
    }),
    [t, locale]
  )
}

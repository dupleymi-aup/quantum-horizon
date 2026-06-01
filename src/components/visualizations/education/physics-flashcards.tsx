"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { useLocale } from "next-intl"
import {
  Atom,
  Zap,
  Flame,
  Globe,
  Radio,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Lightbulb,
  Filter,
} from "lucide-react"

type Language = "ru" | "en" | "zh" | "he"
type Difficulty = "beginner" | "intermediate" | "advanced"
type Category = "quantum" | "relativity" | "thermodynamics" | "cosmology" | "electromagnetism"

interface Flashcard {
  id: number
  front: string
  back: string
  category: Category
  difficulty: Difficulty
  formula?: string
}

interface FlashcardTexts {
  title: string
  subtitle: string
  next: string
  previous: string
  shuffle: string
  reset: string
  flipped: string
  clickToFlip: string
  progress: string
  of: string
  category: string
  difficulty: string
  allCategories: string
  allDifficulties: string
  formula: string
  concept: string
  beginner: string
  intermediate: string
  advanced: string
  keyboardHint: string
  mastered: string
  learning: string
  markMastered: string
  markLearning: string
}

const CATEGORY_ICONS: Record<Category, typeof Atom> = {
  quantum: Atom,
  relativity: Zap,
  thermodynamics: Flame,
  cosmology: Globe,
  electromagnetism: Radio,
}

const CATEGORY_COLORS: Record<Category, { gradient: string; border: string; bg: string; text: string; badge: string }> =
  {
    quantum: {
      gradient: "from-purple-500 to-indigo-500",
      border: "border-purple-500/40",
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      badge: "bg-purple-500/20 text-purple-300",
    },
    relativity: {
      gradient: "from-blue-500 to-cyan-500",
      border: "border-blue-500/40",
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      badge: "bg-blue-500/20 text-blue-300",
    },
    thermodynamics: {
      gradient: "from-orange-500 to-red-500",
      border: "border-orange-500/40",
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      badge: "bg-orange-500/20 text-orange-300",
    },
    cosmology: {
      gradient: "from-teal-500 to-green-500",
      border: "border-teal-500/40",
      bg: "bg-teal-500/10",
      text: "text-teal-400",
      badge: "bg-teal-500/20 text-teal-300",
    },
    electromagnetism: {
      gradient: "from-yellow-500 to-orange-500",
      border: "border-yellow-500/40",
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      badge: "bg-yellow-500/20 text-yellow-300",
    },
  }

const DIFFICULTY_CONFIG: Record<Difficulty, { color: string; bg: string; dots: number }> = {
  beginner: { color: "text-green-400", bg: "bg-green-500/20", dots: 1 },
  intermediate: { color: "text-yellow-400", bg: "bg-yellow-500/20", dots: 2 },
  advanced: { color: "text-red-400", bg: "bg-red-500/20", dots: 3 },
}

const FLASHCARDS: Record<Language, Flashcard[]> = {
  ru: [
    // Quantum (6)
    {
      id: 1,
      front: "E = hν",
      back: "Энергия фотона пропорциональна его частоте. h = 6.626×10⁻³⁴ Дж·с — постоянная Планка, фундаментальная константа квантовой физики.",
      category: "quantum",
      difficulty: "beginner",
      formula: "E = hν",
    },
    {
      id: 2,
      front: "Принцип неопределённости Гейзенберга",
      back: "Невозможно одновременно точно измерить координату и импульс частицы. Это не ограничение приборов, а фундаментальное свойство природы.",
      category: "quantum",
      difficulty: "intermediate",
      formula: "Δx·Δp ≥ ℏ/2",
    },
    {
      id: 3,
      front: "Уравнение Шрёдингера",
      back: "Основное уравнение нерелятивистской квантовой механики, описывающее эволюцию волновой функции системы во времени.",
      category: "quantum",
      difficulty: "advanced",
      formula: "iℏ ∂ψ/∂t = Ĥψ",
    },
    {
      id: 4,
      front: "Квантовое туннелирование",
      back: "Явление прохождения частицы через потенциальный барьер, высота которого больше энергии частицы. Объясняет α-распад и работу туннельного микроскопа.",
      category: "quantum",
      difficulty: "intermediate",
      formula: "T ≈ exp(-2κL), κ = √(2m(V-E))/ℏ",
    },
    {
      id: 5,
      front: "Длина волны де Бройля",
      back: "Каждой движущейся частице соответствует волна с длиной, обратно пропорциональной импульсу. Связывает корпускулярные и волновые свойства материи.",
      category: "quantum",
      difficulty: "beginner",
      formula: "λ = h/p = h/(mv)",
    },
    {
      id: 6,
      front: "Спин электрона",
      back: "Внутренний угловой момент электрона, не связанный с его движением в пространстве. Проекция спина на любую ось принимает значения ±ℏ/2.",
      category: "quantum",
      difficulty: "advanced",
      formula: "s = 1/2, m_s = ±1/2",
    },
    // Relativity (5)
    {
      id: 7,
      front: "E = mc²",
      back: "Эквивалентность массы и энергии. Малая масса содержит колоссальную энергию — основа ядерной физики и энергетики.",
      category: "relativity",
      difficulty: "beginner",
      formula: "E = mc²",
    },
    {
      id: 8,
      front: "Лоренц-фактор",
      back: "Коэффициент, определяющий величину релятивистских эффектов. При v → c, γ → ∞, поэтому разогнать массивную частицу до скорости света невозможно.",
      category: "relativity",
      difficulty: "intermediate",
      formula: "γ = 1/√(1 - v²/c²)",
    },
    {
      id: 9,
      front: "Замедление времени",
      back: "Для движущегося объекта время течёт медленнее с точки зрения неподвижного наблюдателя. Подтверждено экспериментами с атомными часами на спутниках.",
      category: "relativity",
      difficulty: "intermediate",
      formula: "Δt = γΔt₀",
    },
    {
      id: 10,
      front: "Релятивистский импульс",
      back: "Импульс частицы растёт быстрее, чем скорость, из-за лоренц-фактора. При v → c импульс стремится к бесконечности.",
      category: "relativity",
      difficulty: "advanced",
      formula: "p = γmv = mv/√(1 - v²/c²)",
    },
    {
      id: 11,
      front: "Интервал Минковского",
      back: "Инвариантная величина в пространстве-времени. Если ds² < 0 — события причинно связаны; ds² > 0 — пространственноподобны.",
      category: "relativity",
      difficulty: "advanced",
      formula: "ds² = dx² + dy² + dz² - c²dt²",
    },
    // Thermodynamics (4)
    {
      id: 12,
      front: "Формула Больцмана",
      back: "Связывает энтропию с числом микросостояний системы. Энтропия — мера неупорядоченности. Второй закон: энтропия замкнутой системы не убывает.",
      category: "thermodynamics",
      difficulty: "beginner",
      formula: "S = k_B ln Ω",
    },
    {
      id: 13,
      front: "КПД цикла Карно",
      back: "Теоретический максимум эффективности любой тепловой машины. Зависит только от температур нагревателя и холодильника.",
      category: "thermodynamics",
      difficulty: "intermediate",
      formula: "η = 1 - T₂/T₁",
    },
    {
      id: 14,
      front: "Уравнение состояния идеального газа",
      back: "Связывает давление, объём, количество вещества и температуру идеального газа. Хорошее приближение для реальных газов при низком давлении.",
      category: "thermodynamics",
      difficulty: "beginner",
      formula: "PV = nRT",
    },
    {
      id: 15,
      front: "Третий закон термодинамики",
      back: "При приближении к абсолютному нулю энтропия идеального кристалла стремится к нулю. Абсолютный нуль недостижим за конечное число шагов.",
      category: "thermodynamics",
      difficulty: "advanced",
      formula: "lim(T→0) S = 0",
    },
    // Cosmology (4)
    {
      id: 16,
      front: "Радиус Шварцшильда",
      back: "Радиус сферы, при сжатии до которой масса становится чёрной дырой. За горизонтом событий ничто не может покинуть чёрную дыру.",
      category: "cosmology",
      difficulty: "beginner",
      formula: "R_s = 2GM/c²",
    },
    {
      id: 17,
      front: "Закон Хаббла",
      back: "Скорость удаления галактики пропорциональна расстоянию до неё. Открытие Хаббла (1929) стало первым свидетельством расширения Вселенной.",
      category: "cosmology",
      difficulty: "intermediate",
      formula: "v = H₀d, H₀ ≈ 70 (км/с)/Мпк",
    },
    {
      id: 18,
      front: "Излучение Хокинга",
      back: "Квантовое излучение чёрных дыр, возникающее из-за виртуальных частиц у горизонта событий. Чем меньше чёрная дыра, тем выше температура.",
      category: "cosmology",
      difficulty: "advanced",
      formula: "T = ℏc³/(8πGMk_B)",
    },
    {
      id: 19,
      front: "Реликтовое излучение (CMB)",
      back: "Остаточное электромагнитное излучение от эпохи рекомбинации (~380 000 лет после Большого взрыва). Температура 2.725 K, анизотропия ~10⁻⁵.",
      category: "cosmology",
      difficulty: "intermediate",
      formula: "T_CMB = 2.725 K",
    },
    // Electromagnetism (4)
    {
      id: 20,
      front: "Закон Кулона",
      back: "Сила электростатического взаимодействия между двумя точечными зарядами пропорциональна произведению зарядов и обратно пропорциональна квадрату расстояния.",
      category: "electromagnetism",
      difficulty: "beginner",
      formula: "F = k·q₁q₂/r², k ≈ 8.99×10⁹ Н·м²/Кл²",
    },
    {
      id: 21,
      front: "Закон Ома",
      back: "Сила тока в проводнике прямо пропорциональна напряжению и обратно пропорциональна сопротивлению. Основа электротехники.",
      category: "electromagnetism",
      difficulty: "beginner",
      formula: "I = U/R",
    },
    {
      id: 22,
      front: "Уравнения Максвелла",
      back: "Система из четырёх уравнений, описывающих все классические электромагнитные явления. Предсказали существование электромагнитных волн.",
      category: "electromagnetism",
      difficulty: "advanced",
      formula: "∇·E = ρ/ε₀, ∇·B = 0, ∇×E = -∂B/∂t, ∇×B = μ₀J + μ₀ε₀∂E/∂t",
    },
    {
      id: 23,
      front: "Электромагнитная волна",
      back: "Поперечная волна, распространяющаяся в вакууме со скоростью света. Электрическое и магнитное поля колеблются перпендикулярно друг другу.",
      category: "electromagnetism",
      difficulty: "intermediate",
      formula: "c = 1/√(μ₀ε₀) ≈ 3×10⁸ м/с",
    },
  ],
  en: [
    // Quantum (6)
    {
      id: 1,
      front: "E = hν",
      back: "Photon energy is proportional to its frequency. h = 6.626×10⁻³⁴ J·s is Planck's constant, a fundamental constant of quantum physics.",
      category: "quantum",
      difficulty: "beginner",
      formula: "E = hν",
    },
    {
      id: 2,
      front: "Heisenberg Uncertainty Principle",
      back: "It is impossible to simultaneously measure position and momentum with arbitrary precision. This is not a measurement limitation, but a fundamental property of nature.",
      category: "quantum",
      difficulty: "intermediate",
      formula: "Δx·Δp ≥ ℏ/2",
    },
    {
      id: 3,
      front: "Schrödinger Equation",
      back: "The fundamental equation of non-relativistic quantum mechanics, describing how the wave function of a system evolves over time.",
      category: "quantum",
      difficulty: "advanced",
      formula: "iℏ ∂ψ/∂t = Ĥψ",
    },
    {
      id: 4,
      front: "Quantum Tunneling",
      back: "A phenomenon where a particle passes through a potential barrier higher than its energy. Explains α-decay and the operation of tunneling microscopes.",
      category: "quantum",
      difficulty: "intermediate",
      formula: "T ≈ exp(-2κL), κ = √(2m(V-E))/ℏ",
    },
    {
      id: 5,
      front: "de Broglie Wavelength",
      back: "Every moving particle has an associated wavelength inversely proportional to its momentum. Connects the particle and wave properties of matter.",
      category: "quantum",
      difficulty: "beginner",
      formula: "λ = h/p = h/(mv)",
    },
    {
      id: 6,
      front: "Electron Spin",
      back: "Intrinsic angular momentum of the electron, not related to its motion in space. Spin projection on any axis takes values ±ℏ/2.",
      category: "quantum",
      difficulty: "advanced",
      formula: "s = 1/2, m_s = ±1/2",
    },
    // Relativity (5)
    {
      id: 7,
      front: "E = mc²",
      back: "Mass-energy equivalence. A small mass contains enormous energy — the foundation of nuclear physics and energy production.",
      category: "relativity",
      difficulty: "beginner",
      formula: "E = mc²",
    },
    {
      id: 8,
      front: "Lorentz Factor",
      back: "The coefficient determining the magnitude of relativistic effects. As v → c, γ → ∞, making it impossible to accelerate a massive particle to the speed of light.",
      category: "relativity",
      difficulty: "intermediate",
      formula: "γ = 1/√(1 - v²/c²)",
    },
    {
      id: 9,
      front: "Time Dilation",
      back: "For a moving object, time flows slower from the perspective of a stationary observer. Confirmed by experiments with atomic clocks on satellites.",
      category: "relativity",
      difficulty: "intermediate",
      formula: "Δt = γΔt₀",
    },
    {
      id: 10,
      front: "Relativistic Momentum",
      back: "Particle momentum grows faster than velocity due to the Lorentz factor. As v → c, momentum approaches infinity.",
      category: "relativity",
      difficulty: "advanced",
      formula: "p = γmv = mv/√(1 - v²/c²)",
    },
    {
      id: 11,
      front: "Minkowski Interval",
      back: "An invariant quantity in spacetime. If ds² < 0 — events are causally connected; if ds² > 0 — spacelike separated.",
      category: "relativity",
      difficulty: "advanced",
      formula: "ds² = dx² + dy² + dz² - c²dt²",
    },
    // Thermodynamics (4)
    {
      id: 12,
      front: "Boltzmann Formula",
      back: "Relates entropy to the number of microstates of a system. Entropy is a measure of disorder. Second law: entropy of a closed system never decreases.",
      category: "thermodynamics",
      difficulty: "beginner",
      formula: "S = k_B ln Ω",
    },
    {
      id: 13,
      front: "Carnot Efficiency",
      back: "The theoretical maximum efficiency of any heat engine. Depends only on the temperatures of the hot and cold reservoirs.",
      category: "thermodynamics",
      difficulty: "intermediate",
      formula: "η = 1 - T₂/T₁",
    },
    {
      id: 14,
      front: "Ideal Gas Law",
      back: "Relates pressure, volume, amount of substance, and temperature of an ideal gas. A good approximation for real gases at low pressure.",
      category: "thermodynamics",
      difficulty: "beginner",
      formula: "PV = nRT",
    },
    {
      id: 15,
      front: "Third Law of Thermodynamics",
      back: "As temperature approaches absolute zero, the entropy of a perfect crystal approaches zero. Absolute zero is unattainable in a finite number of steps.",
      category: "thermodynamics",
      difficulty: "advanced",
      formula: "lim(T→0) S = 0",
    },
    // Cosmology (4)
    {
      id: 16,
      front: "Schwarzschild Radius",
      back: "The radius of the sphere at which a mass becomes a black hole if compressed. Beyond the event horizon, nothing can escape.",
      category: "cosmology",
      difficulty: "beginner",
      formula: "R_s = 2GM/c²",
    },
    {
      id: 17,
      front: "Hubble's Law",
      back: "The recession velocity of a galaxy is proportional to its distance. Hubble's discovery (1929) was the first evidence of the expanding Universe.",
      category: "cosmology",
      difficulty: "intermediate",
      formula: "v = H₀d, H₀ ≈ 70 (km/s)/Mpc",
    },
    {
      id: 18,
      front: "Hawking Radiation",
      back: "Quantum radiation from black holes arising from virtual particles near the event horizon. The smaller the black hole, the higher its temperature.",
      category: "cosmology",
      difficulty: "advanced",
      formula: "T = ℏc³/(8πGMk_B)",
    },
    {
      id: 19,
      front: "Cosmic Microwave Background (CMB)",
      back: "Residual electromagnetic radiation from the recombination epoch (~380,000 years after the Big Bang). Temperature 2.725 K, anisotropy ~10⁻⁵.",
      category: "cosmology",
      difficulty: "intermediate",
      formula: "T_CMB = 2.725 K",
    },
    // Electromagnetism (4)
    {
      id: 20,
      front: "Coulomb's Law",
      back: "The electrostatic force between two point charges is proportional to the product of charges and inversely proportional to the square of the distance.",
      category: "electromagnetism",
      difficulty: "beginner",
      formula: "F = k·q₁q₂/r², k ≈ 8.99×10⁹ N·m²/C²",
    },
    {
      id: 21,
      front: "Ohm's Law",
      back: "Current in a conductor is directly proportional to voltage and inversely proportional to resistance. The foundation of electrical engineering.",
      category: "electromagnetism",
      difficulty: "beginner",
      formula: "I = U/R",
    },
    {
      id: 22,
      front: "Maxwell's Equations",
      back: "A system of four equations describing all classical electromagnetic phenomena. They predicted the existence of electromagnetic waves.",
      category: "electromagnetism",
      difficulty: "advanced",
      formula: "∇·E = ρ/ε₀, ∇·B = 0, ∇×E = -∂B/∂t, ∇×B = μ₀J + μ₀ε₀∂E/∂t",
    },
    {
      id: 23,
      front: "Electromagnetic Wave",
      back: "A transverse wave propagating in vacuum at the speed of light. Electric and magnetic fields oscillate perpendicular to each other.",
      category: "electromagnetism",
      difficulty: "intermediate",
      formula: "c = 1/√(μ₀ε₀) ≈ 3×10⁸ m/s",
    },
  ],
  zh: [
    {
      id: 1,
      front: "E = hν",
      back: "光子能量与其频率成正比。h = 6.626×10⁻³⁴ J·s 是普朗克常数，量子物理学的基本常数。",
      category: "quantum",
      difficulty: "beginner",
      formula: "E = hν",
    },
    {
      id: 7,
      front: "E = mc²",
      back: "质能等价。少量质量蕴含巨大能量——核物理和核能的基础。",
      category: "relativity",
      difficulty: "beginner",
      formula: "E = mc²",
    },
    {
      id: 2,
      front: "海森堡不确定性原理",
      back: "无法同时精确测量粒子的位置和动量。这不是测量限制，而是自然界的基本属性。",
      category: "quantum",
      difficulty: "intermediate",
      formula: "Δx·Δp ≥ ℏ/2",
    },
    {
      id: 12,
      front: "玻尔兹曼公式",
      back: "熵与系统微观状态数的关系。熵是无序度的度量。热力学第二定律：封闭系统的熵永不减少。",
      category: "thermodynamics",
      difficulty: "beginner",
      formula: "S = k_B ln Ω",
    },
    {
      id: 16,
      front: "史瓦西半径",
      back: "质量压缩到该半径内即成为黑洞。在事件视界之内，任何物质都无法逃逸。",
      category: "cosmology",
      difficulty: "beginner",
      formula: "R_s = 2GM/c²",
    },
  ],
  he: [
    {
      id: 1,
      front: "E = hν",
      back: "אנרגיית פוטון פרופורציונלית לתדירות שלו. h = 6.626×10⁻³⁴ J·s הוא קבוע פלאנק, קבוע יסודי בפיזיקה קוונטית.",
      category: "quantum",
      difficulty: "beginner",
      formula: "E = hν",
    },
    {
      id: 7,
      front: "E = mc²",
      back: "שקילות מסה-אנרגיה. מסה קטנה מכילה אנרגיה עצומה — היסוד של פיזיקה גרעינית וייצור אנרגיה.",
      category: "relativity",
      difficulty: "beginner",
      formula: "E = mc²",
    },
    {
      id: 2,
      front: "עקרון אי־הווידאות של הייזנברג",
      back: "לא ניתן למדוד בו־זמנית מיקום ותנע בדיוק שרירותי. זוהי מגבלה יסודית של הטבע, לא של כלי מדידה.",
      category: "quantum",
      difficulty: "intermediate",
      formula: "Δx·Δp ≥ ℏ/2",
    },
    {
      id: 12,
      front: "נוסחת בולצמן",
      back: "קושרת בין אנטרופיה למספר המצבים המיקרוסקופיים. החוק השני: אנטרופיה של מערכת סגורה לעולם לא קטנה.",
      category: "thermodynamics",
      difficulty: "beginner",
      formula: "S = k_B ln Ω",
    },
    {
      id: 16,
      front: "רדיוס שוורצשילד",
      back: "הרדיוס שבו מסה הופכת לחור שחור אם נדחסת פנימה. מעבר לאופק האירועים, שום דבר לא יכול לברוח.",
      category: "cosmology",
      difficulty: "beginner",
      formula: "R_s = 2GM/c²",
    },
  ],
}

const TEXTS: Record<Language, FlashcardTexts> = {
  ru: {
    title: "Карточки по физике",
    subtitle: "Изучайте ключевые формулы и концепции",
    next: "Далее",
    previous: "Назад",
    shuffle: "Перемешать",
    reset: "Сбросить",
    flipped: "Повернуть",
    clickToFlip: "Нажмите, чтобы перевернуть",
    progress: "Прогресс",
    of: "из",
    category: "Категория",
    difficulty: "Сложность",
    allCategories: "Все",
    allDifficulties: "Все",
    formula: "Формула",
    concept: "Объяснение",
    beginner: "Начальный",
    intermediate: "Средний",
    advanced: "Продвинутый",
    keyboardHint: "← → навигация, Пробел — перевернуть, S — перемешать",
    mastered: "Изучено",
    learning: "Изучаю",
    markMastered: "Изучено",
    markLearning: "Повторить",
  },
  en: {
    title: "Physics Flashcards",
    subtitle: "Learn key formulas and concepts",
    next: "Next",
    previous: "Previous",
    shuffle: "Shuffle",
    reset: "Reset",
    flipped: "Flip",
    clickToFlip: "Click to flip",
    progress: "Progress",
    of: "of",
    category: "Category",
    difficulty: "Difficulty",
    allCategories: "All",
    allDifficulties: "All",
    formula: "Formula",
    concept: "Explanation",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    keyboardHint: "← → navigate, Space to flip, S to shuffle",
    mastered: "Mastered",
    learning: "Learning",
    markMastered: "Mark as mastered",
    markLearning: "Mark for review",
  },
  zh: {
    title: "物理闪卡",
    subtitle: "学习关键公式和概念",
    next: "下一张",
    previous: "上一张",
    shuffle: "随机",
    reset: "重置",
    flipped: "翻转",
    clickToFlip: "点击翻转",
    progress: "进度",
    of: "共",
    category: "类别",
    difficulty: "难度",
    allCategories: "全部",
    allDifficulties: "全部",
    formula: "公式",
    concept: "解释",
    beginner: "初级",
    intermediate: "中级",
    advanced: "高级",
    keyboardHint: "← → 导航，空格翻转，S 随机",
    mastered: "已掌握",
    learning: "学习中",
    markMastered: "标记为已掌握",
    markLearning: "标记为待复习",
  },
  he: {
    title: "כרטיסי לימוד בפיזיקה",
    subtitle: "למד נוסחאות ומושגים מרכזיים",
    next: "הבא",
    previous: "הקודם",
    shuffle: "ערבב",
    reset: "אפס",
    flipped: "הפוך",
    clickToFlip: "לחץ להפוך",
    progress: "התקדמות",
    of: "מתוך",
    category: "קטגוריה",
    difficulty: "רמת קושי",
    allCategories: "הכל",
    allDifficulties: "הכל",
    formula: "נוסחה",
    concept: "הסבר",
    beginner: "מתחיל",
    intermediate: "בינוני",
    advanced: "מתקדם",
    keyboardHint: "← → ניווט, רווח להפוך, S לערבב",
    mastered: "נלמד",
    learning: "בתהליך למידה",
    markMastered: "סמן כנלמד",
    markLearning: "סמן לחזרה",
  },
}

const CATEGORY_LABELS: Record<Language, Record<Category, string>> = {
  ru: {
    quantum: "Квантовая механика",
    relativity: "Теория относительности",
    thermodynamics: "Термодинамика",
    cosmology: "Космология",
    electromagnetism: "Электромагнетизм",
  },
  en: {
    quantum: "Quantum Mechanics",
    relativity: "Relativity",
    thermodynamics: "Thermodynamics",
    cosmology: "Cosmology",
    electromagnetism: "Electromagnetism",
  },
  zh: {
    quantum: "量子力学",
    relativity: "相对论",
    thermodynamics: "热力学",
    cosmology: "宇宙学",
    electromagnetism: "电磁学",
  },
  he: {
    quantum: "מכניקת הקוונטים",
    relativity: "יחסות",
    thermodynamics: "תרמודינמיקה",
    cosmology: "קוסמולוגיה",
    electromagnetism: "אלקטרומגנטיות",
  },
}

interface PhysicsFlashcardsProps {
  isDark?: boolean
}

export function PhysicsFlashcards({ isDark = true }: PhysicsFlashcardsProps) {
  const locale = useLocale() as Language
  const language: Language = ["ru", "en", "zh", "he"].includes(locale) ? locale : "en"

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [shuffled, setShuffled] = useState(false)
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all")
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | "all">("all")
  const [showFilters, setShowFilters] = useState(false)
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set())
  const [showOnlyMastered, setShowOnlyMastered] = useState(false)

  const text = TEXTS[language]

  const filteredCards = useMemo(() => {
    let cards = FLASHCARDS[language]

    if (filterCategory !== "all") {
      cards = cards.filter((c) => c.category === filterCategory)
    }
    if (filterDifficulty !== "all") {
      cards = cards.filter((c) => c.difficulty === filterDifficulty)
    }
    if (showOnlyMastered) {
      cards = cards.filter((c) => masteredCards.has(c.id))
    }
    if (shuffled) {
      // Fisher-Yates shuffle with crypto.getRandomValues for purity compliance
      const shuffledArray = [...cards]
      for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
         
        ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
      }
      cards = shuffledArray
    }

    return cards
  }, [language, filterCategory, filterDifficulty, shuffled, showOnlyMastered, masteredCards])

  const currentCard = filteredCards[currentIndex]
  const totalCards = filteredCards.length
  const masteredCount = useMemo(
    () => FLASHCARDS[language].filter((c) => masteredCards.has(c.id)).length,
    [language, masteredCards]
  )
  const totalCount = FLASHCARDS[language].length

  const progressPercentage = totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0

  const handleFlip = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setIsFlipped((prev) => !prev)
    setTimeout(() => { setIsAnimating(false); }, 300)
  }, [isAnimating])

  const handleNext = useCallback(() => {
    if (isAnimating || totalCards === 0) return
    setIsFlipped(false)
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % totalCards)
    setTimeout(() => { setIsAnimating(false); }, 300)
  }, [isAnimating, totalCards])

  const handlePrevious = useCallback(() => {
    if (isAnimating || totalCards === 0) return
    setIsFlipped(false)
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards)
    setTimeout(() => { setIsAnimating(false); }, 300)
  }, [isAnimating, totalCards])

  const handleShuffle = useCallback(() => {
    setShuffled((prev) => !prev)
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [])

  const handleReset = useCallback(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setShuffled(false)
    setFilterCategory("all")
    setFilterDifficulty("all")
    setShowFilters(false)
    setShowOnlyMastered(false)
  }, [])

  const toggleMastered = useCallback((cardId: number) => {
    setMasteredCards((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) {
        next.delete(cardId)
      } else {
        next.add(cardId)
      }
      return next
    })
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return
      }

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault()
          handleNext()
          break
        case "ArrowLeft":
          e.preventDefault()
          handlePrevious()
          break
        case " ":
          e.preventDefault()
          handleFlip()
          break
        case "s":
        case "S":
        case "ы":
        case "Ы":
          e.preventDefault()
          handleShuffle()
          break
        case "Escape":
          handleReset()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => { window.removeEventListener("keydown", handleKeyDown); }
  }, [handleNext, handlePrevious, handleFlip, handleShuffle, handleReset])

  // Reset index when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [filterCategory, filterDifficulty, shuffled, showOnlyMastered])

  const bg = isDark ? "bg-gray-950" : "bg-gray-50"
  const cardBg = isDark ? "bg-gray-900" : "bg-white"
  const cardBorder = isDark ? "border-gray-800" : "border-gray-200"
  const textPrimary = isDark ? "text-white" : "text-gray-900"
  const textSecondary = isDark ? "text-gray-400" : "text-gray-500"
  const textMuted = isDark ? "text-gray-500" : "text-gray-400"
  const btnBg = isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
  const filterBg = isDark ? "bg-gray-900/80 border-gray-800" : "bg-white/80 border-gray-200"
  const filterBtnDefault = isDark
    ? "border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
    : "border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"

  if (totalCards === 0) {
    return (
      <div className={`${bg} rounded-xl p-8 text-center`}>
        <BookOpen className={`mx-auto h-12 w-12 ${textMuted}`} />
        <p className={`mt-4 text-lg font-medium ${textSecondary}`}>
          {language === "ru"
            ? "Нет карточек, соответствующих фильтрам"
            : language === "zh"
              ? "没有匹配筛选的卡片"
              : language === "he"
                ? "אין כרטיסים התואמים את הסינון"
                : "No cards matching filters"}
        </p>
        <button onClick={handleReset} className="mt-4 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white">
          {text.reset}
        </button>
      </div>
    )
  }

  const CategoryIcon = CATEGORY_COLORS[currentCard.category]
  const DiffConfig = DIFFICULTY_CONFIG[currentCard.difficulty]
  const IconComponent = CATEGORY_ICONS[currentCard.category]

  return (
    <div className={`${bg} rounded-xl p-4 md:p-6`}>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className={`text-xl font-bold ${textPrimary}`}>{text.title}</h3>
          <p className={`text-sm ${textSecondary}`}>{text.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowFilters(!showFilters); }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${btnBg} ${textSecondary}`}
            aria-label={text.category}
          >
            <Filter className="h-3.5 w-3.5" />
            {text.category}
          </button>
          <button
            onClick={handleShuffle}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              shuffled
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                : `${btnBg} ${textSecondary}`
            }`}
            aria-label={text.shuffle}
          >
            <Shuffle className="h-3.5 w-3.5" />
            {text.shuffle}
          </button>
          <button
            onClick={handleReset}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${btnBg} ${textSecondary}`}
            aria-label={text.reset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {text.reset}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`mb-4 rounded-lg border p-3 backdrop-blur-sm ${filterBg}`}>
          <div className="mb-2 flex items-center gap-2">
            <span className={`text-xs font-medium ${textSecondary}`}>{text.category}:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => { setFilterCategory("all"); }}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  filterCategory === "all"
                    ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                    : filterBtnDefault
                }`}
              >
                {text.allCategories}
              </button>
              {(Object.keys(CATEGORY_LABELS[language]) as Category[]).map((cat) => {
                const Icon = CATEGORY_ICONS[cat]
                const colors = CATEGORY_COLORS[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => { setFilterCategory(filterCategory === cat ? "all" : cat); }}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      filterCategory === cat
                        ? `bg-gradient-to-r ${colors.gradient} text-white`
                        : filterBtnDefault
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {CATEGORY_LABELS[language][cat]}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-medium ${textSecondary}`}>{text.difficulty}:</span>
            {(["all", "beginner", "intermediate", "advanced"] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => { setFilterDifficulty(diff === "all" ? "all" : diff); }}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  filterDifficulty === diff
                    ? diff === "all"
                      ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                      : `${DIFFICULTY_CONFIG[diff].bg} ${DIFFICULTY_CONFIG[diff].color}`
                    : filterBtnDefault
                }`}
              >
                {diff === "all" ? text.allDifficulties : text[diff]}
              </button>
            ))}
            <div className="ml-auto">
              <button
                onClick={() => { setShowOnlyMastered(!showOnlyMastered); }}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  showOnlyMastered
                    ? "bg-green-500/20 text-green-400"
                    : filterBtnDefault
                }`}
              >
                {showOnlyMastered ? text.mastered : (language === "ru" ? "Показать изученные" : language === "zh" ? "显示已掌握" : language === "he" ? "הצג נלמדים" : "Show mastered")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className={textSecondary}>
            {text.progress}: {currentIndex + 1} {text.of} {totalCards}
          </span>
          <span className={textSecondary}>
            {text.mastered}: {masteredCount}/{totalCount}
          </span>
        </div>
        <div className={`h-1.5 overflow-hidden rounded-full ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {/* Mastery dots */}
        <div className="mt-2 flex flex-wrap gap-1">
          {filteredCards.map((card, idx) => {
            const isMastered = masteredCards.has(card.id)
            const isActive = idx === currentIndex
            return (
              <button
                key={`${card.id}-${idx}`}
                onClick={() => {
                  setIsFlipped(false)
                  setCurrentIndex(idx)
                }}
                className={`h-2 w-2 rounded-full transition-all ${
                  isActive
                    ? "scale-150 ring-2 ring-purple-400 ring-offset-1"
                    : isMastered
                      ? "bg-green-400"
                      : isDark
                        ? "bg-gray-700"
                        : "bg-gray-300"
                }`}
                aria-label={`Card ${idx + 1}`}
              />
            )
          })}
        </div>
      </div>

      {/* Flashcard */}
      <div className="perspective-1000 mb-4">
        <div
          className={`relative mx-auto w-full cursor-pointer transition-transform duration-300 ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
          style={{
            minHeight: "280px",
            transformStyle: "preserve-3d",
          }}
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleFlip()
            }
          }}
          aria-label={text.flipped}
        >
          {/* Front */}
          <div
            className={`absolute inset-0 rounded-xl border-2 p-6 ${cardBorder} ${cardBg} ${CategoryIcon.border} shadow-lg`}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex h-full flex-col">
              {/* Category badge */}
              <div className="mb-4 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${CategoryIcon.badge}`}>
                  <IconComponent className="h-3.5 w-3.5" />
                  {CATEGORY_LABELS[language][currentCard.category]}
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        i < DiffConfig.dots ? DiffConfig.color : isDark ? "bg-gray-700" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Front content */}
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className={`mb-2 text-xs font-medium ${textMuted}`}>
                  {text.formula}
                </div>
                <div className={`text-xl md:text-2xl font-bold ${textPrimary}`}>
                  {currentCard.front}
                </div>
              </div>

              {/* Flip hint */}
              <div className={`mt-4 text-center text-xs ${textMuted}`}>
                {text.clickToFlip}
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 rounded-xl border-2 p-6 ${cardBorder} ${cardBg} ${CategoryIcon.border} shadow-lg`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex h-full flex-col">
              {/* Category badge */}
              <div className="mb-4 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${CategoryIcon.badge}`}>
                  <IconComponent className="h-3.5 w-3.5" />
                  {CATEGORY_LABELS[language][currentCard.category]}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DiffConfig.bg} ${DiffConfig.color}`}>
                  {text[currentCard.difficulty]}
                </span>
              </div>

              {/* Back content */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                <div>
                  <div className={`mb-1 flex items-center gap-1 text-xs font-semibold ${CategoryIcon.text}`}>
                    <Lightbulb className="h-3.5 w-3.5" />
                    {text.concept}
                  </div>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {currentCard.back}
                  </p>
                </div>

                {currentCard.formula && (
                  <div className={`rounded-lg p-3 ${isDark ? "bg-gray-800/60" : "bg-gray-100"}`}>
                    <div className={`mb-1 flex items-center gap-1 text-xs font-semibold ${CategoryIcon.text}`}>
                      <BookOpen className="h-3.5 w-3.5" />
                      {text.formula}
                    </div>
                    <div className={`font-mono text-sm ${CategoryIcon.text}`}>
                      {currentCard.formula}
                    </div>
                  </div>
                )}
              </div>

              {/* Mastered toggle */}
              <div className="mt-4 flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleMastered(currentCard.id)
                  }}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                    masteredCards.has(currentCard.id)
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : `${btnBg} ${textSecondary}`
                  }`}
                >
                  {masteredCards.has(currentCard.id) ? (
                    <>
                      <span className="text-green-400">&#10003;</span>
                      {text.mastered}
                    </>
                  ) : (
                    text.markMastered
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={totalCards <= 1}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            totalCards <= 1
              ? `${textMuted} opacity-50 cursor-not-allowed`
              : `${btnBg} ${textPrimary} hover:scale-105`
          }`}
          aria-label={text.previous}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{text.previous}</span>
        </button>

        <span className={`text-sm font-medium ${textSecondary}`}>
          {currentIndex + 1} / {totalCards}
        </span>

        <button
          onClick={handleNext}
          disabled={totalCards <= 1}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            totalCards <= 1
              ? `${textMuted} opacity-50 cursor-not-allowed`
              : `bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:scale-105`
          }`}
          aria-label={text.next}
        >
          <span className="hidden sm:inline">{text.next}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className={`mt-4 text-center text-xs ${textMuted}`}>
        {text.keyboardHint}
      </div>
    </div>
  )
}

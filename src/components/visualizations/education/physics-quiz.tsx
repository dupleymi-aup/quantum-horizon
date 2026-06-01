"use client"

import { useState, useMemo } from "react"
import { useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Lightbulb, BookOpen, Award, Filter, Brain, Zap, Atom, Globe, Flame } from "lucide-react"

type Language = "ru" | "en" | "zh" | "he"
type Difficulty = "beginner" | "intermediate" | "advanced"
type Topic = "quantum" | "relativity" | "thermodynamics" | "cosmology" | "electromagnetism" | "general"

interface Question {
  question: string
  options: string[]
  correct: number
  difficulty: Difficulty
  topic: Topic
  explanation: string
  formula?: string
  relatedConcept?: string
}

interface QuizText {
  score: string
  of: string
  restart: string
  next: string
  correct: string
  incorrect: string
  difficulty: string
  topic: string
  allTopics: string
  allDifficulties: string
  filterBy: string
  formula: string
  related: string
  questionCount: string
  startQuiz: string
  results: string
  accuracy: string
  timeBonus: string
  streak: string
  selectFilters: string
  beginner: string
  intermediate: string
  advanced: string
  totalQuestions: string
  showing: string
}

const TOPIC_ICONS: Record<Topic, typeof Atom> = {
  quantum: Atom,
  relativity: Zap,
  thermodynamics: Flame,
  cosmology: Globe,
  electromagnetism: Zap,
  general: Brain,
}

const TOPIC_COLORS: Record<Topic, string> = {
  quantum: "from-purple-500 to-indigo-500",
  relativity: "from-blue-500 to-cyan-500",
  thermodynamics: "from-orange-500 to-red-500",
  cosmology: "from-teal-500 to-green-500",
  electromagnetism: "from-yellow-500 to-orange-500",
  general: "from-gray-500 to-slate-500",
}

const DIFFICULTY_CONFIG: Record<Difficulty, { points: number; color: string; bg: string }> = {
  beginner: { points: 10, color: "text-green-400", bg: "bg-green-500/20" },
  intermediate: { points: 20, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  advanced: { points: 30, color: "text-red-400", bg: "bg-red-500/20" },
}

const QUESTIONS: Record<Language, Question[]> = {
  ru: [
    // Quantum Mechanics
    {
      question: "Чему равна постоянная Планка (h)?",
      options: ["6.626×10⁻³⁴ Дж·с", "1.602×10⁻¹⁹ Кл", "9.109×10⁻³¹ кг", "8.314 Дж/(моль·К)"],
      correct: 0,
      difficulty: "beginner",
      topic: "quantum",
      explanation: "Постоянная Планка h = 6.626 × 10⁻³⁴ Дж·с — фундаментальная константа квантовой физики, связывающая энергию фотона с его частотой.",
      formula: "E = hν",
      relatedConcept: "Энергия фотона пропорциональна частоте излучения.",
    },
    {
      question: "Какой принцип сформулировал Гейзенберг?",
      options: [
        "Принцип относительности",
        "Принцип неопределённости",
        "Принцип дополнительности",
        "Принцип суперпозиции",
      ],
      correct: 1,
      difficulty: "beginner",
      topic: "quantum",
      explanation: "Принцип неопределённости Гейзенберга (1927): невозможно одновременно точно измерить координату и импульс частицы.",
      formula: "Δx·Δp ≥ ℏ/2",
      relatedConcept: "Это не ограничение приборов, а фундаментальное свойство природы.",
    },
    {
      question: "Что описывает уравнение Шрёдингера?",
      options: [
        "Движение планет",
        "Эволюцию квантового состояния",
        "Распад радиоактивных ядер",
        "Течение жидкости",
      ],
      correct: 1,
      difficulty: "intermediate",
      topic: "quantum",
      explanation: "Уравнение Шрёдингера — основное уравнение нерелятивистской квантовой механики, описывающее изменение волновой функции во времени.",
      formula: "iℏ ∂ψ/∂t = Ĥψ",
      relatedConcept: "Гамильтониан Ĥ определяет полную энергию системы.",
    },
    {
      question: "Что происходит при измерении квантовой системы в суперпозиции?",
      options: [
        "Система продолжает быть в суперпозиции",
        "Происходит коллапс волновой функции",
        "Энергия системы удваивается",
        "Частица исчезает",
      ],
      correct: 1,
      difficulty: "intermediate",
      topic: "quantum",
      explanation: "При измерении суперпозиция «схлопывается» в одно из базовых состояний. Вероятность каждого определяется квадратом амплитуды |cᵢ|².",
      formula: "|ψ⟩ = Σ cᵢ|φᵢ⟩ → |φₖ⟩ при измерении",
      relatedConcept: "Это основа парадокса кота Шрёдингера.",
    },
    {
      question: "Какова вероятность туннелирования частицы через барьер шириной L?",
      options: [
        "T ∝ exp(-2κL)",
        "T ∝ L²",
        "T = 1 - E/V",
        "T ∝ 1/L",
      ],
      correct: 0,
      difficulty: "advanced",
      topic: "quantum",
      explanation: "Вероятность туннелирования экспоненциально убывает с шириной барьера. κ = √(2m(V-E))/ℏ — коэффициент затухания волновой функции в барьере.",
      formula: "T ≈ exp(-2κL), κ = √(2m(V-E))/ℏ",
      relatedConcept: "Это явление объясняет α-распад и работу туннельного микроскопа.",
    },

    // Relativity
    {
      question: "Какая частица является переносчиком электромагнитного взаимодействия?",
      options: ["Глюон", "Фотон", "W-бозон", "Гравитон"],
      correct: 1,
      difficulty: "beginner",
      topic: "relativity",
      explanation: "Фотон — квант электромагнитного поля, безмассовая частица, всегда движущаяся со скоростью света.",
      formula: "E = hc/λ, p = h/λ",
      relatedConcept: "Фотон не имеет электрического заряда и массы покоя.",
    },
    {
      question: "Что происходит с массой объекта при приближении к скорости света?",
      options: ["Уменьшается", "Не изменяется", "Увеличивается", "Становится отрицательной"],
      correct: 2,
      difficulty: "beginner",
      topic: "relativity",
      explanation: "Согласно специальной теории относительности, релятивистская масса увеличивается с ростом скорости через лоренц-фактор γ.",
      formula: "m = γm₀ = m₀/√(1 - v²/c²)",
      relatedConcept: "При v → c, γ → ∞, поэтому разогнать массивную частицу до скорости света невозможно.",
    },
    {
      question: "Чему равна энергия покоя частицы массой 1 кг?",
      options: ["3×10⁸ Дж", "9×10¹⁶ Дж", "1.6×10⁻¹⁹ Дж", "6.6×10⁻³⁴ Дж"],
      correct: 1,
      difficulty: "intermediate",
      topic: "relativity",
      explanation: "E = mc² = 1 × (3×10⁸)² = 9×10¹⁶ Дж. Это колоссальная энергия — эквивалент ~21 мегатонны ТНТ.",
      formula: "E = mc²",
      relatedConcept: "Это основа ядерной энергетики: при делении 1 кг урана выделяется ~8×10¹³ Дж.",
    },
    {
      question: "Каков интервал между событиями в пространстве-времени Минковского?",
      options: [
        "ds² = dx² + dy² + dz² + dt²",
        "ds² = dx² + dy² + dz² - c²dt²",
        "ds² = c²dt²",
        "ds² = 0",
      ],
      correct: 1,
      difficulty: "advanced",
      topic: "relativity",
      explanation: "Интервал Минковского инвариантен при преобразованиях Лоренца. Знак «минус» перед временной компонентой отличает геометрию пространства-времени от евклидовой.",
      formula: "ds² = dx² + dy² + dz² - c²dt²",
      relatedConcept: "Если ds² < 0 — события связаны причинно, если ds² > 0 — пространственноподобны.",
    },

    // Thermodynamics
    {
      question: "Что такое энтропия?",
      options: [
        "Мера упорядоченности",
        "Мера неупорядоченности системы",
        "Количество теплоты",
        "Температура системы",
      ],
      correct: 1,
      difficulty: "beginner",
      topic: "thermodynamics",
      explanation: "Энтропия — мера неупорядоченности. Второй закон термодинамики: энтропия замкнутой системы не убывает.",
      formula: "S = k_B ln Ω",
      relatedConcept: "Формула Больцмана связывает энтропию с числом микросостояний Ω.",
    },
    {
      question: "Каков максимальный КПД тепловой машины с T₁=600K и T₂=300K?",
      options: ["25%", "50%", "75%", "100%"],
      correct: 1,
      difficulty: "intermediate",
      topic: "thermodynamics",
      explanation: "КПД Карно — теоретический предел для любой тепловой машины: η = 1 - T₂/T₁ = 1 - 300/600 = 0.5 = 50%.",
      formula: "η = 1 - T₂/T₁",
      relatedConcept: "Реальные двигатели имеют КПД ниже из-за трения, теплопотерь и необратимости.",
    },
    {
      question: "Что происходит с температурой при адиабатическом расширении идеального газа?",
      options: [
        "Повышается",
        "Понижается",
        "Не изменяется",
        "Зависит от давления",
      ],
      correct: 1,
      difficulty: "intermediate",
      topic: "thermodynamics",
      explanation: "При адиабатическом расширении газ совершает работу за счёт внутренней энергии, поэтому температура падает.",
      formula: "TV^(γ-1) = const, Q = 0",
      relatedConcept: "Это объясняет, почему воздух охлаждается при подъёме в атмосфере.",
    },
    {
      question: "Чему равна энтропия идеального кристалла при абсолютном нуле?",
      options: ["Бесконечность", "k_B", "0", "Не определена"],
      correct: 2,
      difficulty: "advanced",
      topic: "thermodynamics",
      explanation: "Третий закон термодинамики (теорема Нернста): при T → 0 K энтропия идеального кристалла стремится к нулю, так как существует только одно микросостояние.",
      formula: "lim(T→0) S = 0",
      relatedConcept: "Это означает, что абсолютный нуль недостижим за конечное число шагов.",
    },

    // Cosmology
    {
      question: "Что такое сингулярность чёрной дыры?",
      options: [
        "Область низкой плотности",
        "Точка бесконечной плотности",
        "Горизонт событий",
        "Аккреционный диск",
      ],
      correct: 1,
      difficulty: "beginner",
      topic: "cosmology",
      explanation: "Сингулярность — точка в центре чёрной дыры, где плотность и кривизна пространства-времени стремятся к бесконечности.",
      formula: "R_s = 2GM/c²",
      relatedConcept: "За горизонтом событий (радиус Шварцшильда) ничто не может покинуть чёрную дыру.",
    },
    {
      question: "Каков возраст Вселенной согласно современным оценкам?",
      options: ["4.5 млрд лет", "10 млрд лет", "13.8 млрд лет", "20 млрд лет"],
      correct: 2,
      difficulty: "beginner",
      topic: "cosmology",
      explanation: "Возраст Вселенной ~13.8 млрд лет, определён по данным спутника Planck (2018) из анализа реликтового излучения.",
      formula: "t₀ = 1/H₀ ≈ 13.8 млрд лет",
      relatedConcept: "Возраст Земли ~4.5 млрд лет, то есть Солнечная система возникла значительно позже Большого взрыва.",
    },
    {
      question: "Какая сила доминирует во Вселенной на больших масштабах?",
      options: ["Электромагнитная", "Сильная ядерная", "Слабая ядерная", "Гравитационная"],
      correct: 3,
      difficulty: "beginner",
      topic: "cosmology",
      explanation: "Гравитация — единственная сила, действующая на бесконечных расстояниях и всегда притягивающая, поэтому она доминирует в космосе.",
      formula: "F = Gm₁m₂/r²",
      relatedConcept: "На масштабах галактик гравитация тёмной материи играет ключевую роль.",
    },
    {
      question: "Что такое реликтовое излучение (CMB)?",
      options: [
        "Излучение звёзд",
        "Остаточное излучение Большого взрыва",
        "Излучение чёрных дыр",
        "Космические лучи",
      ],
      correct: 1,
      difficulty: "intermediate",
      topic: "cosmology",
      explanation: "CMB — электромагнитное излучение, оставшееся от эпохи рекомбинации (~380 000 лет после Большого взрыва), когда Вселенная стала прозрачной.",
      formula: "T_CMB = 2.725 K",
      relatedConcept: "Анизотропия CMB (флуктуации ~10⁻⁵) — «семена» будущих галактик.",
    },
    {
      question: "Что такое излучение Хокинга?",
      options: [
        "Излучение звёзд",
        "Квантовое излучение чёрных дыр",
        "Рентгеновское излучение",
        "Гравитационные волны",
      ],
      correct: 1,
      difficulty: "advanced",
      topic: "cosmology",
      explanation: "Излучение Хокинга возникает из-за квантовых флуктуаций вблизи горизонта событий. Виртуальные частицы разделяются: одна падает в чёрную дыру, другая улетает.",
      formula: "T = ℏc³/(8πGMk_B)",
      relatedConcept: "Чем меньше чёрная дыра, тем выше её температура. Микроскопические чёрные дыры испаряются мгновенно.",
    },
  ],
  en: [
    // Quantum Mechanics
    {
      question: "What is Planck's constant (h)?",
      options: ["6.626×10⁻³⁴ J·s", "1.602×10⁻¹⁹ C", "9.109×10⁻³¹ kg", "8.314 J/(mol·K)"],
      correct: 0,
      difficulty: "beginner",
      topic: "quantum",
      explanation: "Planck's constant h = 6.626 × 10⁻³⁴ J·s is a fundamental constant of quantum physics, relating photon energy to frequency.",
      formula: "E = hν",
      relatedConcept: "Photon energy is proportional to radiation frequency.",
    },
    {
      question: "What principle did Heisenberg formulate?",
      options: [
        "Principle of relativity",
        "Uncertainty principle",
        "Complementarity principle",
        "Superposition principle",
      ],
      correct: 1,
      difficulty: "beginner",
      topic: "quantum",
      explanation: "Heisenberg's Uncertainty Principle (1927): it is impossible to simultaneously measure position and momentum with arbitrary precision.",
      formula: "Δx·Δp ≥ ℏ/2",
      relatedConcept: "This is not a limitation of instruments, but a fundamental property of nature.",
    },
    {
      question: "What does the Schrödinger equation describe?",
      options: ["Planetary motion", "Quantum state evolution", "Radioactive decay", "Fluid flow"],
      correct: 1,
      difficulty: "intermediate",
      topic: "quantum",
      explanation: "The Schrödinger equation is the fundamental equation of non-relativistic quantum mechanics, describing how the wave function changes over time.",
      formula: "iℏ ∂ψ/∂t = Ĥψ",
      relatedConcept: "The Hamiltonian Ĥ determines the total energy of the system.",
    },
    {
      question: "What happens when a quantum system in superposition is measured?",
      options: [
        "The system remains in superposition",
        "Wave function collapse occurs",
        "The system's energy doubles",
        "The particle disappears",
      ],
      correct: 1,
      difficulty: "intermediate",
      topic: "quantum",
      explanation: "Upon measurement, the superposition 'collapses' into one of the basis states. The probability of each is determined by the squared amplitude |cᵢ|².",
      formula: "|ψ⟩ = Σ cᵢ|φᵢ⟩ → |φₖ⟩ upon measurement",
      relatedConcept: "This is the basis of Schrödinger's cat paradox.",
    },
    {
      question: "What is the tunneling probability through a barrier of width L?",
      options: [
        "T ∝ exp(-2κL)",
        "T ∝ L²",
        "T = 1 - E/V",
        "T ∝ 1/L",
      ],
      correct: 0,
      difficulty: "advanced",
      topic: "quantum",
      explanation: "Tunneling probability decreases exponentially with barrier width. κ = √(2m(V-E))/ℏ is the wave function decay coefficient inside the barrier.",
      formula: "T ≈ exp(-2κL), κ = √(2m(V-E))/ℏ",
      relatedConcept: "This phenomenon explains α-decay and the operation of tunnel microscopes.",
    },

    // Relativity
    {
      question: "Which particle carries the electromagnetic interaction?",
      options: ["Gluon", "Photon", "W-boson", "Graviton"],
      correct: 1,
      difficulty: "beginner",
      topic: "relativity",
      explanation: "Photon is the quantum of the electromagnetic field, a massless particle always moving at the speed of light.",
      formula: "E = hc/λ, p = h/λ",
      relatedConcept: "Photons have no electric charge and no rest mass.",
    },
    {
      question: "What happens to mass as an object approaches the speed of light?",
      options: ["Decreases", "Remains unchanged", "Increases", "Becomes negative"],
      correct: 2,
      difficulty: "beginner",
      topic: "relativity",
      explanation: "According to special relativity, relativistic mass increases with velocity through the Lorentz factor γ.",
      formula: "m = γm₀ = m₀/√(1 - v²/c²)",
      relatedConcept: "As v → c, γ → ∞, so it's impossible to accelerate a massive particle to the speed of light.",
    },
    {
      question: "What is the rest energy of a 1 kg mass?",
      options: ["3×10⁸ J", "9×10¹⁶ J", "1.6×10⁻¹⁹ J", "6.6×10⁻³⁴ J"],
      correct: 1,
      difficulty: "intermediate",
      topic: "relativity",
      explanation: "E = mc² = 1 × (3×10⁸)² = 9×10¹⁶ J. This is enormous energy — equivalent to ~21 megatons of TNT.",
      formula: "E = mc²",
      relatedConcept: "This is the basis of nuclear energy: fission of 1 kg uranium releases ~8×10¹³ J.",
    },
    {
      question: "What is the spacetime interval in Minkowski space?",
      options: [
        "ds² = dx² + dy² + dz² + dt²",
        "ds² = dx² + dy² + dz² - c²dt²",
        "ds² = c²dt²",
        "ds² = 0",
      ],
      correct: 1,
      difficulty: "advanced",
      topic: "relativity",
      explanation: "The Minkowski interval is invariant under Lorentz transformations. The minus sign before the time component distinguishes spacetime geometry from Euclidean.",
      formula: "ds² = dx² + dy² + dz² - c²dt²",
      relatedConcept: "If ds² < 0 — events are causally connected; if ds² > 0 — spacelike separated.",
    },

    // Thermodynamics
    {
      question: "What is entropy?",
      options: [
        "A measure of order",
        "A measure of disorder in a system",
        "Amount of heat",
        "System temperature",
      ],
      correct: 1,
      difficulty: "beginner",
      topic: "thermodynamics",
      explanation: "Entropy is a measure of disorder. The second law of thermodynamics: entropy of a closed system never decreases.",
      formula: "S = k_B ln Ω",
      relatedConcept: "Boltzmann's formula relates entropy to the number of microstates Ω.",
    },
    {
      question: "What is the maximum efficiency of a heat engine with T₁=600K and T₂=300K?",
      options: ["25%", "50%", "75%", "100%"],
      correct: 1,
      difficulty: "intermediate",
      topic: "thermodynamics",
      explanation: "Carnot efficiency is the theoretical maximum for any heat engine: η = 1 - T₂/T₁ = 1 - 300/600 = 0.5 = 50%.",
      formula: "η = 1 - T₂/T₁",
      relatedConcept: "Real engines have lower efficiency due to friction, heat loss, and irreversibility.",
    },
    {
      question: "What happens to temperature during adiabatic expansion of an ideal gas?",
      options: [
        "Increases",
        "Decreases",
        "Remains unchanged",
        "Depends on pressure",
      ],
      correct: 1,
      difficulty: "intermediate",
      topic: "thermodynamics",
      explanation: "During adiabatic expansion, the gas does work at the expense of internal energy, so temperature drops.",
      formula: "TV^(γ-1) = const, Q = 0",
      relatedConcept: "This explains why air cools as it rises in the atmosphere.",
    },
    {
      question: "What is the entropy of a perfect crystal at absolute zero?",
      options: ["Infinity", "k_B", "0", "Undefined"],
      correct: 2,
      difficulty: "advanced",
      topic: "thermodynamics",
      explanation: "Third law of thermodynamics (Nernst's theorem): as T → 0 K, the entropy of a perfect crystal approaches zero, as there is only one microstate.",
      formula: "lim(T→0) S = 0",
      relatedConcept: "This means absolute zero is unattainable in a finite number of steps.",
    },

    // Cosmology
    {
      question: "What is a black hole singularity?",
      options: [
        "A region of low density",
        "A point of infinite density",
        "The event horizon",
        "The accretion disk",
      ],
      correct: 1,
      difficulty: "beginner",
      topic: "cosmology",
      explanation: "The singularity is a point at the center of a black hole where density and spacetime curvature approach infinity.",
      formula: "R_s = 2GM/c²",
      relatedConcept: "Beyond the event horizon (Schwarzschild radius), nothing can escape the black hole.",
    },
    {
      question: "What is the age of the Universe according to modern estimates?",
      options: ["4.5 billion years", "10 billion years", "13.8 billion years", "20 billion years"],
      correct: 2,
      difficulty: "beginner",
      topic: "cosmology",
      explanation: "The age of the Universe is ~13.8 billion years, determined from Planck satellite data (2018) analyzing the cosmic microwave background.",
      formula: "t₀ = 1/H₀ ≈ 13.8 billion years",
      relatedConcept: "Earth's age is ~4.5 billion years, so the Solar System formed much later than the Big Bang.",
    },
    {
      question: "Which force dominates the Universe on large scales?",
      options: ["Electromagnetic", "Strong nuclear", "Weak nuclear", "Gravitational"],
      correct: 3,
      difficulty: "beginner",
      topic: "cosmology",
      explanation: "Gravity is the only force acting at infinite distances and always attractive, so it dominates on cosmic scales.",
      formula: "F = Gm₁m₂/r²",
      relatedConcept: "On galaxy scales, dark matter gravity plays a key role.",
    },
    {
      question: "What is the Cosmic Microwave Background (CMB)?",
      options: [
        "Radiation from stars",
        "Residual radiation from the Big Bang",
        "Black hole radiation",
        "Cosmic rays",
      ],
      correct: 1,
      difficulty: "intermediate",
      topic: "cosmology",
      explanation: "CMB is electromagnetic radiation left over from the recombination epoch (~380,000 years after the Big Bang), when the Universe became transparent.",
      formula: "T_CMB = 2.725 K",
      relatedConcept: "CMB anisotropy (~10⁻⁵ fluctuations) are the 'seeds' of future galaxies.",
    },
    {
      question: "What is Hawking radiation?",
      options: [
        "Stellar radiation",
        "Quantum radiation from black holes",
        "X-ray radiation",
        "Gravitational waves",
      ],
      correct: 1,
      difficulty: "advanced",
      topic: "cosmology",
      explanation: "Hawking radiation arises from quantum fluctuations near the event horizon. Virtual particles are separated: one falls into the black hole, the other escapes.",
      formula: "T = ℏc³/(8πGMk_B)",
      relatedConcept: "The smaller the black hole, the higher its temperature. Microscopic black holes evaporate instantly.",
    },
  ],
  zh: [
    {
      question: "真空中的光速是多少？",
      options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁵ m/s"],
      correct: 1,
      difficulty: "beginner",
      topic: "general",
      explanation: "光速 c ≈ 299,792,458 m/s ≈ 3×10⁸ m/s，是自然界的速度上限。",
      formula: "c = 299,792,458 m/s",
      relatedConcept: "根据狭义相对论，任何有质量的物体都无法达到或超过光速。",
    },
    {
      question: "哪种粒子传递电磁相互作用？",
      options: ["胶子", "光子", "W 玻色子", "引力子"],
      correct: 1,
      difficulty: "beginner",
      topic: "quantum",
      explanation: "光子是电磁场的量子，是电磁相互作用的传递者。",
      formula: "E = hν",
      relatedConcept: "光子没有静止质量，总是以光速运动。",
    },
    {
      question: "薛定谔方程描述什么？",
      options: ["行星运动", "量子态演化", "放射性衰变", "流体流动"],
      correct: 1,
      difficulty: "intermediate",
      topic: "quantum",
      explanation: "薛定谔方程描述量子系统的波函数如何随时间变化。",
      formula: "iℏ ∂ψ/∂t = Ĥψ",
      relatedConcept: "哈密顿量 Ĥ 决定了系统的总能量。",
    },
    {
      question: "当物体接近光速时，质量会发生什么变化？",
      options: ["减小", "保持不变", "增加", "变为负数"],
      correct: 2,
      difficulty: "beginner",
      topic: "relativity",
      explanation: "根据狭义相对论，相对论质量 m = γm₀ 随着速度接近光速而增加。",
      formula: "m = m₀/√(1 - v²/c²)",
      relatedConcept: "当 v → c 时，γ → ∞，所以无法将有质量的物体加速到光速。",
    },
    {
      question: "宇宙的年龄是多少？",
      options: ["45 亿年", "100 亿年", "138 亿年", "200 亿年"],
      correct: 2,
      difficulty: "beginner",
      topic: "cosmology",
      explanation: "宇宙年龄约 138 亿年，由普朗克卫星数据分析得出。",
      formula: "t₀ = 1/H₀ ≈ 138 亿年",
      relatedConcept: "地球年龄约 45 亿年。",
    },
  ],
  he: [
    {
      question: "מהי מהירות האור בריק?",
      options: ["3×10⁶ מ'/ש'", "3×10⁸ מ'/ש'", "3×10¹⁰ מ'/ש'", "3×10⁵ מ'/ש'"],
      correct: 1,
      difficulty: "beginner",
      topic: "general",
      explanation: "מהירות האור c ≈ 299,792,458 מ'/ש' ≈ 3×10⁸ מ'/ש'",
      formula: "c = 299,792,458 m/s",
      relatedConcept: "על פי תורת היחסות הפרטית, שום גוף בעל מסה לא יכול להגיע למהירות האור.",
    },
    {
      question: "איזה חלקיק נושא את האינטראקציה האלקטרומגנטית?",
      options: ["גלואון", "פוטון", "בוזון W", "גרביטון"],
      correct: 1,
      difficulty: "beginner",
      topic: "quantum",
      explanation: "פוטון הוא קוונטום של השדה האלקטרומגנטי.",
      formula: "E = hν",
      relatedConcept: "לפוטון אין מסת מנועה והוא נע תמיד במהירות האור.",
    },
    {
      question: "מהו עקרון אי־הווידאות של הייזנברג?",
      options: [
        "לא ניתן למדוד מיקום ותנע בו־זמנית בדיוק שרירותי",
        "אנרגיה נשמרת תמיד",
        "האור נע בקו ישר",
        "מסה ואנרגיה שקולות",
      ],
      correct: 0,
      difficulty: "beginner",
      topic: "quantum",
      explanation: "עקרון אי־הווידאות: Δx·Δp ≥ ℏ/2 — מגבלה יסודית על דיוק מדידות.",
      formula: "Δx·Δp ≥ ℏ/2",
      relatedConcept: "זהו מאפיין יסודי של הטבע, לא מגבלה של כלי מדידה.",
    },
  ],
}

const RESULT_TEXT: Record<Language, QuizText> = {
  ru: {
    score: "Ваш результат",
    of: "из",
    restart: "Начать заново",
    next: "Далее",
    correct: "Правильно!",
    incorrect: "Неправильно",
    difficulty: "Сложность",
    topic: "Тема",
    allTopics: "Все темы",
    allDifficulties: "Все уровни",
    filterBy: "Фильтр",
    formula: "Формула",
    related: "Связанное понятие",
    questionCount: "вопросов",
    startQuiz: "Начать тест",
    results: "Результаты",
    accuracy: "Точность",
    timeBonus: "Бонус за серию",
    streak: "Серия",
    selectFilters: "Выберите тему и сложность",
    beginner: "Начальный",
    intermediate: "Средний",
    advanced: "Продвинутый",
    totalQuestions: "Всего вопросов",
    showing: "Показано",
  },
  en: {
    score: "Your score",
    of: "of",
    restart: "Restart",
    next: "Next",
    correct: "Correct!",
    incorrect: "Incorrect",
    difficulty: "Difficulty",
    topic: "Topic",
    allTopics: "All Topics",
    allDifficulties: "All Levels",
    filterBy: "Filter",
    formula: "Formula",
    related: "Related concept",
    questionCount: "questions",
    startQuiz: "Start Quiz",
    results: "Results",
    accuracy: "Accuracy",
    timeBonus: "Streak bonus",
    streak: "Streak",
    selectFilters: "Select topic and difficulty",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    totalQuestions: "Total questions",
    showing: "Showing",
  },
  zh: {
    score: "您的得分",
    of: "共",
    restart: "重新开始",
    next: "下一题",
    correct: "正确！",
    incorrect: "错误",
    difficulty: "难度",
    topic: "主题",
    allTopics: "所有主题",
    allDifficulties: "所有级别",
    filterBy: "筛选",
    formula: "公式",
    related: "相关概念",
    questionCount: "题",
    startQuiz: "开始测验",
    results: "结果",
    accuracy: "正确率",
    timeBonus: "连击奖励",
    streak: "连击",
    selectFilters: "选择主题和难度",
    beginner: "初级",
    intermediate: "中级",
    advanced: "高级",
    totalQuestions: "总题数",
    showing: "显示",
  },
  he: {
    score: "הציון שלך",
    of: "מתוך",
    restart: "התחל מחדש",
    next: "הבא",
    correct: "נכון!",
    incorrect: "לא נכון",
    difficulty: "רמת קושי",
    topic: "נושא",
    allTopics: "כל הנושאים",
    allDifficulties: "כל הרמות",
    filterBy: "סינון",
    formula: "נוסחה",
    related: "מושג קשור",
    questionCount: "שאלות",
    startQuiz: "התחל חידון",
    results: "תוצאות",
    accuracy: "דיוק",
    timeBonus: "בונוס רצף",
    streak: "רצף",
    selectFilters: "בחר נושא ורמת קושי",
    beginner: "מתחיל",
    intermediate: "בינוני",
    advanced: "מתקדם",
    totalQuestions: "סה״כ שאלות",
    showing: "מציג",
  },
}

const TOPIC_LABELS: Record<Language, Record<Topic, string>> = {
  ru: { quantum: "Квантовая механика", relativity: "Теория относительности", thermodynamics: "Термодинамика", cosmology: "Космология", electromagnetism: "Электромагнетизм", general: "Общая физика" },
  en: { quantum: "Quantum Mechanics", relativity: "Relativity", thermodynamics: "Thermodynamics", cosmology: "Cosmology", electromagnetism: "Electromagnetism", general: "General Physics" },
  zh: { quantum: "量子力学", relativity: "相对论", thermodynamics: "热力学", cosmology: "宇宙学", electromagnetism: "电磁学", general: "普通物理" },
  he: { quantum: "מכניקת הקוונטים", relativity: "יחסות", thermodynamics: "תרמודינמיקה", cosmology: "קוסמולוגיה", electromagnetism: "אלקטרומגנטיות", general: "פיזיקה כללית" },
}

export function PhysicsQuiz() {
  const locale = useLocale() as Language
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [language] = useState<Language>(["ru", "en", "zh", "he"].includes(locale) ? locale : "en")
  const [filterTopic, setFilterTopic] = useState<Topic | "all">("all")
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | "all">("all")
  const [showFilters, setShowFilters] = useState(true)
  const [streak, setStreak] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [answers, setAnswers] = useState<Array<{ question: string; correct: boolean }>>([])

  const text = RESULT_TEXT[language]

  const filteredQuestions = useMemo(() => {
    return QUESTIONS[language].filter((q) => {
      const matchesTopic = filterTopic === "all" || q.topic === filterTopic
      const matchesDifficulty = filterDifficulty === "all" || q.difficulty === filterDifficulty
      return matchesTopic && matchesDifficulty
    })
  }, [language, filterTopic, filterDifficulty])

  const currentQuestions = filteredQuestions
  const q = currentQuestions[currentQuestion]
  const TopicIcon = q ? TOPIC_ICONS[q.topic] : Brain

  const handleAnswer = (index: number) => {
    if (answered) return
    setSelectedAnswer(index)
    setAnswered(true)
    const isCorrect = index === q.correct
    setAnswers((prev) => [...prev, { question: q.question, correct: isCorrect }])

    if (isCorrect) {
      const newStreak = streak + 1
      setStreak(newStreak)
      const points = DIFFICULTY_CONFIG[q.difficulty].points + (newStreak > 1 ? newStreak * 2 : 0)
      setTotalPoints((prev) => prev + points)
      setScore((s) => s + 1)
    } else {
      setStreak(0)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setAnswered(false)
    } else {
      setShowResult(true)
    }
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer(null)
    setAnswered(false)
    setStreak(0)
    setTotalPoints(0)
    setAnswers([])
  }

  if (showFilters && currentQuestions.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">{text.selectFilters}</h3>
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-xs font-medium text-gray-400">{text.topic}</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setFilterTopic("all"); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${filterTopic === "all" ? "bg-purple-600 text-white" : "border border-gray-700 bg-gray-800 text-gray-300"}`}
              >
                {text.allTopics}
              </button>
              {(Object.keys(TOPIC_LABELS[language]) as Topic[]).map((topic) => {
                const Icon = TOPIC_ICONS[topic]
                return (
                  <button
                    key={topic}
                    onClick={() => { setFilterTopic(filterTopic === topic ? "all" : topic); }}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      filterTopic === topic
                        ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                        : "border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {TOPIC_LABELS[language][topic]}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium text-gray-400">{text.difficulty}</div>
            <div className="flex flex-wrap gap-2">
              {(["all", "beginner", "intermediate", "advanced"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => { setFilterDifficulty(diff); }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    filterDifficulty === diff
                      ? diff === "all"
                        ? "bg-purple-600 text-white"
                        : `${DIFFICULTY_CONFIG[diff].bg} ${DIFFICULTY_CONFIG[diff].color}`
                      : "border border-gray-700 bg-gray-800 text-gray-300"
                  }`}
                >
                  {diff === "all" ? text.allDifficulties : text[diff]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showResult) {
    const percentage = currentQuestions.length > 0 ? Math.round((score / currentQuestions.length) * 100) : 0
    return (
      <div className="space-y-6 text-center">
        <div className="text-2xl font-bold text-white">{text.results}</div>
        <div className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-6xl font-bold text-transparent">
          {score} {text.of} {currentQuestions.length}
        </div>
        <div className="flex justify-center gap-6 text-sm">
          <div>
            <div className="text-gray-400">{text.accuracy}</div>
            <div className="text-xl font-bold text-green-400">{percentage}%</div>
          </div>
          <div>
            <div className="text-gray-400">{text.streak}</div>
            <div className="text-xl font-bold text-yellow-400">{streak}</div>
          </div>
          <div>
            <div className="text-gray-400">{text.score}</div>
            <div className="text-xl font-bold text-purple-400">{totalPoints} pts</div>
          </div>
        </div>
        <div className="text-4xl">
          {percentage >= 80 ? "🏆" : percentage >= 60 ? "🌟" : percentage >= 40 ? "📚" : "💪"}
        </div>
        <Button onClick={restartQuiz} className="bg-gradient-to-r from-purple-600 to-cyan-600">
          {text.restart}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setShowFilters(!showFilters); }}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white"
        >
          <Filter className="h-3 w-3" />
          {text.filterBy}
        </button>
        <span className="text-xs text-gray-500">
          {text.showing} {currentQuestions.length} {text.questionCount}
        </span>
      </div>

      {showFilters && (
        <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setFilterTopic("all"); }}
              className={`rounded-lg px-2 py-1 text-[10px] font-medium ${filterTopic === "all" ? "bg-purple-600 text-white" : "border border-gray-700 bg-gray-800 text-gray-400"}`}
            >
              {text.allTopics}
            </button>
            {(Object.keys(TOPIC_LABELS[language]) as Topic[]).map((topic) => {
              const Icon = TOPIC_ICONS[topic]
              return (
                <button
                  key={topic}
                  onClick={() => { setFilterTopic(filterTopic === topic ? "all" : topic); }}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium ${
                    filterTopic === topic
                      ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                      : "border border-gray-700 bg-gray-800 text-gray-400"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {TOPIC_LABELS[language][topic]}
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            {(["all", "beginner", "intermediate", "advanced"] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => { setFilterDifficulty(diff); }}
                className={`rounded px-2 py-1 text-[10px] font-medium ${
                  filterDifficulty === diff
                    ? diff === "all"
                      ? "bg-purple-600 text-white"
                      : `${DIFFICULTY_CONFIG[diff].bg} ${DIFFICULTY_CONFIG[diff].color}`
                    : "border border-gray-700 bg-gray-800 text-gray-400"
                }`}
              >
                {diff === "all" ? text.allDifficulties : text[diff]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <TopicIcon className="h-3 w-3 text-purple-400" />
          <span className="text-purple-400">
            {q ? TOPIC_LABELS[language][q.topic] : ""} • {currentQuestion + 1}/{currentQuestions.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {streak > 1 && (
            <span className="text-yellow-400">
              🔥 {text.streak}: {streak}
            </span>
          )}
          <span className="text-green-400">
            {text.score}: {totalPoints} pts
          </span>
        </div>
      </div>

      {/* Question */}
      {q && (
        <>
          <div className="rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 p-4">
            <div className="mb-1 flex items-center gap-2">
              <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${DIFFICULTY_CONFIG[q.difficulty].bg} ${DIFFICULTY_CONFIG[q.difficulty].color}`}>
                {text[q.difficulty]} (+{DIFFICULTY_CONFIG[q.difficulty].points} pts)
              </span>
            </div>
            <div className="mb-4 font-medium text-white">{q.question}</div>

            <div className="space-y-2">
              {q.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => { handleAnswer(index); }}
                  disabled={answered}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm transition-all ${
                    answered
                      ? index === q.correct
                        ? "border-2 border-green-400 bg-green-600/50"
                        : index === selectedAnswer
                          ? "border-2 border-red-400 bg-red-600/50"
                          : "bg-gray-800/50 opacity-50"
                      : "border border-gray-700 bg-gray-800/50 hover:border-purple-500 hover:bg-gray-700/50"
                  }`}
                >
                  <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          {answered && (
            <div className="space-y-3">
              <div
                className={`rounded-lg p-4 ${selectedAnswer === q.correct ? "border border-green-500/30 bg-green-900/30" : "border border-red-500/30 bg-red-900/30"}`}
              >
                <div className={selectedAnswer === q.correct ? "font-semibold text-green-400" : "font-semibold text-red-400"}>
                  {selectedAnswer === q.correct ? text.correct : text.incorrect}
                </div>
                <div className="mt-2 text-sm text-gray-300">{q.explanation}</div>

                {q.formula && (
                  <div className="mt-3 rounded bg-gray-900/50 p-3">
                    <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-cyan-400">
                      <BookOpen className="h-3 w-3" />
                      {text.formula}
                    </div>
                    <div className="font-mono text-sm text-cyan-300">{q.formula}</div>
                  </div>
                )}

                {q.relatedConcept && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-gray-400">
                    <Lightbulb className="mt-0.5 h-3 w-3 flex-shrink-0 text-yellow-400" />
                    <span>{q.relatedConcept}</span>
                  </div>
                )}
              </div>

              <Button onClick={nextQuestion} className="w-full bg-gradient-to-r from-purple-600 to-cyan-600">
                {text.next} →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

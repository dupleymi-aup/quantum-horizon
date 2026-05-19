"use client"

import { useState, useMemo } from "react"
import { useLocale } from "next-intl"
import { Search, ChevronDown, ChevronUp, BookOpen, ArrowRight } from "lucide-react"

type Language = "ru" | "en" | "zh" | "he"

interface GlossaryEntry {
  term: string
  definition: string
  category: string
  related?: string[]
  formula?: string
  example?: string
}

const GLOSSARY: Record<Language, GlossaryEntry[]> = {
  ru: [
    {
      term: "Волновая функция (ψ)",
      definition: "Математическое описание квантового состояния системы. Квадрат модуля волновой функции |ψ|² определяет вероятность обнаружения частицы в данной точке пространства.",
      category: "Квантовая механика",
      formula: "∫|ψ(x)|²dx = 1 (условие нормировки)",
      related: ["Уравнение Шрёдингера", "Принцип неопределённости", "Суперпозиция"],
    },
    {
      term: "Уравнение Шрёдингера",
      definition: "Основное уравнение нерелятивистской квантовой механики, описывающее эволюцию волновой функции во времени. Бывает стационарным и нестационарным.",
      category: "Квантовая механика",
      formula: "iℏ ∂ψ/∂t = Ĥψ",
      related: ["Волновая функция", "Гамильтониан", "Квантование энергии"],
    },
    {
      term: "Принцип неопределённости Гейзенберга",
      definition: "Фундаментальный принцип квантовой механики: невозможно одновременно точно измерить пару канонически сопряжённых величин (например, координату и импульс).",
      category: "Квантовая механика",
      formula: "Δx · Δp ≥ ℏ/2",
      related: ["Волновая функция", "Квантовое туннелирование", "Измерение в квантовой механике"],
    },
    {
      term: "Квантовое туннелирование",
      definition: "Явление прохождения частицы через потенциальный барьер, высота которого больше энергии частицы. Невозможно в классической механике.",
      category: "Квантовая механика",
      formula: "T ≈ exp(-2κL), где κ = √(2m(V-E))/ℏ",
      example: "α-распад ядер, сканирующий туннельный микроскоп, туннельные диоды",
      related: ["Потенциальный барьер", "Волновая функция", "Радиоактивный распад"],
    },
    {
      term: "Суперпозиция",
      definition: "Принцип, согласно которому квантовая система может находиться одновременно в нескольких состояниях до момента измерения. При измерении происходит «коллапс» в одно из состояний.",
      category: "Квантовая механика",
      formula: "|ψ⟩ = c₁|ψ₁⟩ + c₂|ψ₂⟩ + ...",
      example: "Кот Шрёдингера — одновременно жив и мёртв до наблюдения",
      related: ["Коллапс волновой функции", "Измерение", "Запутанность"],
    },
    {
      term: "Квантовая запутанность",
      definition: "Явление, при котором квантовые состояния двух или более частиц оказываются взаимозависимыми, даже когда они разделены большими расстояниями. Измерение одной мгновенно влияет на состояние другой.",
      category: "Квантовая механика",
      related: ["Суперпозиция", "Неравенства Белла", "Квантовая телепортация"],
    },
    {
      term: "Фотоэффект",
      definition: "Испускание электронов веществом под действием электромагнитного излучения. Объяснён Эйнштейном в 1905 году с помощью квантовой теории света.",
      category: "Квантовая физика",
      formula: "hν = A + K_max, где A — работа выхода",
      example: "Солнечные батареи, фотоэлементы, датчики освещённости",
      related: ["Фотон", "Работа выхода", "Постоянная Планка"],
    },
    {
      term: "Фотон",
      definition: "Элементарная частица — квант электромагнитного излучения. Не имеет массы покоя, всегда движется со скоростью света. Несёт энергию E = hν и импульс p = h/λ.",
      category: "Квантовая физика",
      formula: "E = hν = hc/λ, p = h/λ",
      related: ["Корпускулярно-волновой дуализм", "Фотоэффект", "Электромагнитное излучение"],
    },
    {
      term: "Корпускулярно-волновой дуализм",
      definition: "Фундаментальное свойство материи: все частицы проявляют как волновые, так и корпускулярные свойства. Свет ведёт себя как волна (интерференция) и как частица (фотоэффект).",
      category: "Квантовая физика",
      formula: "λ = h/p (формула де Бройля)",
      example: "Опыт Юнга — волновые свойства; фотоэффект — корпускулярные",
      related: ["Длина волны де Бройля", "Интерференция", "Фотон"],
    },
    {
      term: "Постоянная Планка (h)",
      definition: "Фундаментальная физическая константа, определяющая масштаб квантовых эффектов. Связывает энергию фотона с его частотой.",
      category: "Квантовая физика",
      formula: "h = 6.626 × 10⁻³⁴ Дж·с, ℏ = h/2π",
      related: ["Квантование", "Энергия фотона", "Уравнение Шрёдингера"],
    },
    {
      term: "Замедление времени",
      definition: "Эффект специальной теории относительности: время в движущейся системе отсчёта течёт медленнее по сравнению с неподвижной. Зависит от скорости через лоренц-фактор.",
      category: "Теория относительности",
      formula: "Δt = γΔt₀, где γ = 1/√(1 - v²/c²)",
      example: "Часы на GPS-спутниках идут быстрее на 38 мкс/день",
      related: ["Лоренц-фактор", "Сокращение длины", "E=mc²"],
    },
    {
      term: "Сокращение длины (Лоренцево сокращение)",
      definition: "Эффект специальной теории относительности: длина движущегося объекта сокращается в направлении движения.",
      category: "Теория относительности",
      formula: "L = L₀/γ = L₀√(1 - v²/c²)",
      related: ["Замедление времени", "Лоренц-фактор", "Преобразования Лоренца"],
    },
    {
      term: "E = mc²",
      definition: "Уравнение эквивалентности массы и энергии. Масса может быть преобразована в энергию и наоборот. Основа ядерной энергетики и понимания звёзд.",
      category: "Теория относительности",
      formula: "E = mc² (полная: E² = (pc)² + (m₀c²)²)",
      example: "При делении 1 кг урана выделяется ~8 × 10¹³ Дж",
      related: ["Замедление времени", "Релятивистская масса", "Ядерная энергия"],
    },
    {
      term: "Чёрная дыра",
      definition: "Область пространства-времени с настолько сильным гравитационным притяжением, что покинуть её не могут даже объекты, движущиеся со скоростью света.",
      category: "Космология",
      formula: "R_s = 2GM/c² (радиус Шварцшильда)",
      related: ["Излучение Хокинга", "Гравитация", "Сингулярность"],
    },
    {
      term: "Излучение Хокинга",
      definition: "Теоретическое предсказание: чёрные дыры излучают частицы благодаря квантовым эффектам вблизи горизонта событий. Это приводит к постепенному испарению чёрной дыры.",
      category: "Космология",
      formula: "T = ℏc³ / (8πGMk_B)",
      related: ["Чёрная дыра", "Квантовая теория поля", "Энтропия"],
    },
    {
      term: "Энтропия",
      definition: "Мера неупорядоченности системы. Второй закон термодинамики: энтропия изолированной системы не убывает. Связана с числом микросостояний.",
      category: "Термодинамика",
      formula: "S = k_B ln Ω (формула Больцмана)",
      related: ["Второй закон термодинамики", "Тепловая смерть", "Информация"],
    },
    {
      term: "Фазовый переход",
      definition: "Качественное изменение свойств вещества при изменении внешних условий (температуры, давления). Примеры: плавление, кипение, сверхпроводимость.",
      category: "Термодинамика",
      example: "Лёд → вода → пар; нормальный металл → сверхпроводник",
      related: ["Критическая точка", "Сверхпроводимость", "Энтропия"],
    },
    {
      term: "Сверхпроводимость",
      definition: "Свойство некоторых материалов иметь нулевое электрическое сопротивление ниже критической температуры. Сопровождается эффектом Мейсснера (вытеснение магнитного поля).",
      category: "Термодинамика",
      example: "MRI-томографы, ускорители частиц (БАК), левитирующие поезда",
      related: ["Эффект Мейсснера", "Фазовый переход", "Куперовские пары"],
    },
    {
      term: "Радиоактивный распад",
      definition: "Самопроизвольное превращение нестабильного атомного ядра с испусканием частиц. Характеризуется периодом полураспада T₁/₂.",
      category: "Ядерная физика",
      formula: "N(t) = N₀ × 2^(-t/T₁/₂)",
      example: "α-распад (He-ядро), β-распад (электрон), γ-излучение (фотон)",
      related: ["Период полураспада", "Квантовое туннелирование", "Ядерные реакции"],
    },
    {
      term: "Тёмная материя",
      definition: "Гипотетическая форма материи, которая не испускает электромагнитного излучения, но проявляется через гравитационное воздействие. Составляет ~27% массы-энергии Вселенной.",
      category: "Космология",
      related: ["Кривые вращения галактик", "Гравитационное линзирование", "Тёмная энергия"],
    },
    {
      term: "Тёмная энергия",
      definition: "Гипотетическая форма энергии, вызывающая ускоренное расширение Вселенной. Составляет ~68% массы-энергии Вселенной. Природа неизвестна.",
      category: "Космология",
      related: ["Расширение Вселенной", "Космологическая постоянная", "Тёмная материя"],
    },
  ],
  en: [
    {
      term: "Wave Function (ψ)",
      definition: "Mathematical description of the quantum state of a system. The square of the wave function |ψ|² determines the probability of finding a particle at a given point in space.",
      category: "Quantum Mechanics",
      formula: "∫|ψ(x)|²dx = 1 (normalization condition)",
      related: ["Schrödinger Equation", "Uncertainty Principle", "Superposition"],
    },
    {
      term: "Schrödinger Equation",
      definition: "The fundamental equation of non-relativistic quantum mechanics, describing the evolution of the wave function over time. Can be stationary or time-dependent.",
      category: "Quantum Mechanics",
      formula: "iℏ ∂ψ/∂t = Ĥψ",
      related: ["Wave Function", "Hamiltonian", "Energy Quantization"],
    },
    {
      term: "Heisenberg Uncertainty Principle",
      definition: "A fundamental principle of quantum mechanics: it is impossible to simultaneously measure a pair of canonically conjugate quantities (e.g., position and momentum) with arbitrary precision.",
      category: "Quantum Mechanics",
      formula: "Δx · Δp ≥ ℏ/2",
      related: ["Wave Function", "Quantum Tunneling", "Measurement in Quantum Mechanics"],
    },
    {
      term: "Quantum Tunneling",
      definition: "The phenomenon of a particle passing through a potential barrier whose height is greater than the particle's energy. Impossible in classical mechanics.",
      category: "Quantum Mechanics",
      formula: "T ≈ exp(-2κL), where κ = √(2m(V-E))/ℏ",
      example: "Nuclear α-decay, scanning tunneling microscope, tunnel diodes",
      related: ["Potential Barrier", "Wave Function", "Radioactive Decay"],
    },
    {
      term: "Superposition",
      definition: "A principle stating that a quantum system can exist in multiple states simultaneously until measurement. Upon measurement, it 'collapses' into one of the states.",
      category: "Quantum Mechanics",
      formula: "|ψ⟩ = c₁|ψ₁⟩ + c₂|ψ₂⟩ + ...",
      example: "Schrödinger's Cat — simultaneously alive and dead until observed",
      related: ["Wave Function Collapse", "Measurement", "Entanglement"],
    },
    {
      term: "Quantum Entanglement",
      definition: "A phenomenon where the quantum states of two or more particles become interdependent, even when separated by large distances. Measuring one instantly affects the state of the other.",
      category: "Quantum Mechanics",
      related: ["Superposition", "Bell's Inequalities", "Quantum Teleportation"],
    },
    {
      term: "Photoelectric Effect",
      definition: "The emission of electrons from a material under the influence of electromagnetic radiation. Explained by Einstein in 1905 using the quantum theory of light.",
      category: "Quantum Physics",
      formula: "hν = A + K_max, where A is the work function",
      example: "Solar panels, photocells, light sensors",
      related: ["Photon", "Work Function", "Planck's Constant"],
    },
    {
      term: "Photon",
      definition: "An elementary particle — the quantum of electromagnetic radiation. Has no rest mass, always moves at the speed of light. Carries energy E = hν and momentum p = h/λ.",
      category: "Quantum Physics",
      formula: "E = hν = hc/λ, p = h/λ",
      related: ["Wave-Particle Duality", "Photoelectric Effect", "Electromagnetic Radiation"],
    },
    {
      term: "Wave-Particle Duality",
      definition: "A fundamental property of matter: all particles exhibit both wave and particle properties. Light behaves as a wave (interference) and as a particle (photoelectric effect).",
      category: "Quantum Physics",
      formula: "λ = h/p (de Broglie formula)",
      example: "Young's experiment — wave properties; photoelectric effect — particle properties",
      related: ["De Broglie Wavelength", "Interference", "Photon"],
    },
    {
      term: "Planck's Constant (h)",
      definition: "A fundamental physical constant that determines the scale of quantum effects. Relates a photon's energy to its frequency.",
      category: "Quantum Physics",
      formula: "h = 6.626 × 10⁻³⁴ J·s, ℏ = h/2π",
      related: ["Quantization", "Photon Energy", "Schrödinger Equation"],
    },
    {
      term: "Time Dilation",
      definition: "An effect of special relativity: time in a moving reference frame flows slower compared to a stationary one. Depends on velocity through the Lorentz factor.",
      category: "Theory of Relativity",
      formula: "Δt = γΔt₀, where γ = 1/√(1 - v²/c²)",
      example: "Clocks on GPS satellites run 38 μs/day faster",
      related: ["Lorentz Factor", "Length Contraction", "E=mc²"],
    },
    {
      term: "Length Contraction",
      definition: "An effect of special relativity: the length of a moving object contracts in the direction of motion.",
      category: "Theory of Relativity",
      formula: "L = L₀/γ = L₀√(1 - v²/c²)",
      related: ["Time Dilation", "Lorentz Factor", "Lorentz Transformations"],
    },
    {
      term: "E = mc²",
      definition: "The mass-energy equivalence equation. Mass can be converted into energy and vice versa. The foundation of nuclear power and understanding of stars.",
      category: "Theory of Relativity",
      formula: "E = mc² (full: E² = (pc)² + (m₀c²)²)",
      example: "Fission of 1 kg of uranium releases ~8 × 10¹³ J",
      related: ["Time Dilation", "Relativistic Mass", "Nuclear Energy"],
    },
    {
      term: "Black Hole",
      definition: "A region of spacetime with gravitational pull so strong that nothing, not even light, can escape from it.",
      category: "Cosmology",
      formula: "R_s = 2GM/c² (Schwarzschild radius)",
      related: ["Hawking Radiation", "Gravity", "Singularity"],
    },
    {
      term: "Hawking Radiation",
      definition: "A theoretical prediction: black holes emit particles due to quantum effects near the event horizon. This leads to gradual evaporation of the black hole.",
      category: "Cosmology",
      formula: "T = ℏc³ / (8πGMk_B)",
      related: ["Black Hole", "Quantum Field Theory", "Entropy"],
    },
    {
      term: "Entropy",
      definition: "A measure of disorder in a system. The second law of thermodynamics: entropy of an isolated system never decreases. Related to the number of microstates.",
      category: "Thermodynamics",
      formula: "S = k_B ln Ω (Boltzmann's formula)",
      related: ["Second Law of Thermodynamics", "Heat Death", "Information"],
    },
    {
      term: "Phase Transition",
      definition: "A qualitative change in the properties of a substance when external conditions (temperature, pressure) change. Examples: melting, boiling, superconductivity.",
      category: "Thermodynamics",
      example: "Ice → water → steam; normal metal → superconductor",
      related: ["Critical Point", "Superconductivity", "Entropy"],
    },
    {
      term: "Superconductivity",
      definition: "The property of some materials to have zero electrical resistance below a critical temperature. Accompanied by the Meissner effect (expulsion of magnetic field).",
      category: "Thermodynamics",
      example: "MRI scanners, particle accelerators (LHC), maglev trains",
      related: ["Meissner Effect", "Phase Transition", "Cooper Pairs"],
    },
    {
      term: "Radioactive Decay",
      definition: "Spontaneous transformation of an unstable atomic nucleus with emission of particles. Characterized by half-life T₁/₂.",
      category: "Nuclear Physics",
      formula: "N(t) = N₀ × 2^(-t/T₁/₂)",
      example: "α-decay (He nucleus), β-decay (electron), γ-radiation (photon)",
      related: ["Half-Life", "Quantum Tunneling", "Nuclear Reactions"],
    },
    {
      term: "Dark Matter",
      definition: "A hypothetical form of matter that does not emit electromagnetic radiation but manifests through gravitational effects. Makes up ~27% of the mass-energy of the Universe.",
      category: "Cosmology",
      related: ["Galaxy Rotation Curves", "Gravitational Lensing", "Dark Energy"],
    },
    {
      term: "Dark Energy",
      definition: "A hypothetical form of energy causing the accelerated expansion of the Universe. Makes up ~68% of the mass-energy of the Universe. Nature unknown.",
      category: "Cosmology",
      related: ["Universe Expansion", "Cosmological Constant", "Dark Matter"],
    },
  ],
  zh: [
    {
      term: "波函数 (ψ)",
      definition: "量子系统状态的数学描述。波函数的模方 |ψ|² 决定了在空间某点发现粒子的概率。",
      category: "量子力学",
      formula: "∫|ψ(x)|²dx = 1（归一化条件）",
      related: ["薛定谔方程", "不确定性原理", "叠加态"],
    },
    {
      term: "薛定谔方程",
      definition: "非相对论量子力学的基本方程，描述波函数随时间的演化。分为定态和非定态两种形式。",
      category: "量子力学",
      formula: "iℏ ∂ψ/∂t = Ĥψ",
      related: ["波函数", "哈密顿量", "能量量子化"],
    },
    {
      term: "光电效应",
      definition: "物质在电磁辐射作用下发射电子的现象。爱因斯坦于1905年用光的量子理论解释。",
      category: "量子物理",
      formula: "hν = A + K_max，其中 A 为逸出功",
      related: ["光子", "逸出功", "普朗克常数"],
    },
    {
      term: "不确定性原理",
      definition: "量子力学的基本原理：无法同时精确测量一对共轭量（如位置和动量）。",
      category: "量子力学",
      formula: "Δx · Δp ≥ ℏ/2",
      related: ["波函数", "量子隧穿", "量子测量"],
    },
    {
      term: "黑洞",
      definition: "引力场极强的时空区域，连光都无法逃逸。",
      category: "宇宙学",
      formula: "R_s = 2GM/c²（史瓦西半径）",
      related: ["霍金辐射", "引力", "奇点"],
    },
  ],
  he: [
    {
      term: "פונקציית הגל (ψ)",
      definition: "תיאור מתמטי של המצב הקוונטי של מערכת. ריבוע המודול של פונקציית הגל |ψ|² קובע את ההסתברות למצוא חלקיק בנקודה מסוימת במרחב.",
      category: "מכניקת הקוונטים",
      formula: "∫|ψ(x)|²dx = 1 (תנאי נרמול)",
      related: ["משוואת שרדינגר", "עקרון אי־הווידאות", "סופרפוזיציה"],
    },
    {
      term: "משוואת שרדינגר",
      definition: "המשוואה היסודית של מכניקת הקוונטים הלא־רלטיביסטית, המתארת את התפתחות פונקציית הגל לאורך זמן.",
      category: "מכניקת הקוונטים",
      formula: "iℏ ∂ψ/∂t = Ĥψ",
      related: ["פונקציית הגל", "המילטוניאן", "קוונטיזציה של אנרגיה"],
    },
    {
      term: "עקרון אי־הווידאות של הייזנברג",
      definition: "עקרון יסודי במכניקת הקוונטים: לא ניתן למדוד בו־זמנית זוג גדלים צמודים קנונית (כגון מיקום ותנע) בדיוק שרירותי.",
      category: "מכניקת הקוונטים",
      formula: "Δx · Δp ≥ ℏ/2",
      related: ["פונקציית הגל", "מנהור קוונטי", "מדידה במכניקת הקוונטים"],
    },
    {
      term: "מנהור קוונטי",
      definition: "תופעה שבה חלקיק עובר דרך מחסום פוטנציאל שגובהו גדול מאנרגיית החלקיק. בלתי אפשרי במכניקה קלאסית.",
      category: "מכניקת הקוונטים",
      related: ["מחסום פוטנציאל", "פונקציית הגל", "דעיכה רדיואקטיבית"],
    },
    {
      term: "חור שחור",
      definition: "אזור במרחב־זמן עם משיכה כבידתית כל כך חזקה ששום דבר, אפילו לא אור, לא יכול להימלט ממנו.",
      category: "קוסמולוגיה",
      formula: "R_s = 2GM/c² (רדיוס שוורצשילד)",
      related: ["קרינת הוקינג", "כבידה", "סינגולריות"],
    },
  ],
}

const CATEGORY_COLORS: Record<string, string> = {
  "Квантовая механика": "from-purple-500 to-indigo-500",
  "Quantum Mechanics": "from-purple-500 to-indigo-500",
  "量子力学": "from-purple-500 to-indigo-500",
  "מכניקת הקוונטים": "from-purple-500 to-indigo-500",
  "Квантовая физика": "from-violet-500 to-purple-500",
  "Quantum Physics": "from-violet-500 to-purple-500",
  "量子物理": "from-violet-500 to-purple-500",
  "Теория относительности": "from-blue-500 to-cyan-500",
  "Theory of Relativity": "from-blue-500 to-cyan-500",
  "Космология": "from-cyan-500 to-teal-500",
  "Cosmology": "from-cyan-500 to-teal-500",
  "宇宙学": "from-cyan-500 to-teal-500",
  "Термодинамика": "from-orange-500 to-red-500",
  "Thermodynamics": "from-orange-500 to-red-500",
  "Ядерная физика": "from-yellow-500 to-orange-500",
  "Nuclear Physics": "from-yellow-500 to-orange-500",
  "Волновая оптика": "from-green-500 to-emerald-500",
  "Wave Optics": "from-green-500 to-emerald-500",
  "קוסמולוגיה": "from-cyan-500 to-teal-500",
}

const GLOSSARY_LABELS: Record<Language, Record<string, string>> = {
  ru: {
    title: "📖 Справочник по физике",
    subtitle: "Определения, формулы и взаимосвязи ключевых понятий",
    search: "Поиск по терминам и определениям...",
    allCategories: "Все разделы",
    formula: "Формула",
    example: "Пример",
    related: "Связанные понятия",
    noResults: "Ничего не найдено",
  },
  en: {
    title: "📖 Physics Glossary",
    subtitle: "Definitions, formulas, and cross-references of key concepts",
    search: "Search terms and definitions...",
    allCategories: "All Categories",
    formula: "Formula",
    example: "Example",
    related: "Related concepts",
    noResults: "No results found",
  },
  zh: {
    title: "📖 物理词典",
    subtitle: "关键概念的定义、公式和交叉引用",
    search: "搜索术语和定义...",
    allCategories: "所有类别",
    formula: "公式",
    example: "示例",
    related: "相关概念",
    noResults: "未找到结果",
  },
  he: {
    title: "📖 מילון פיזיקה",
    subtitle: "הגדרות, נוסחאות והפניות צולבות של מושגי מפתח",
    search: "חיפוש מונחים והגדרות...",
    allCategories: "כל הקטגוריות",
    formula: "נוסחה",
    example: "דוגמה",
    related: "מושגים קשורים",
    noResults: "לא נמצאו תוצאות",
  },
}

export function PhysicsGlossary() {
  const locale = useLocale() as Language
  const [language] = useState<Language>(["ru", "en", "zh", "he"].includes(locale) ? locale : "en")
  const [search, setSearch] = useState("")
  const [expandedTerms, setExpandedTerms] = useState<Set<number>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  const labels = GLOSSARY_LABELS[language]
  const entries = GLOSSARY[language]

  const categories = useMemo(() => {
    const cats = new Set(entries.map((e) => e.category))
    return Array.from(cats)
  }, [entries])

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        search === "" ||
        entry.term.toLowerCase().includes(search.toLowerCase()) ||
        entry.definition.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = selectedCategory === "" || entry.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [entries, search, selectedCategory])

  const toggleTerm = (index: number) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">{labels.title}</h2>
        <p className="mt-1 text-sm text-gray-400">{labels.subtitle}</p>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={labels.search}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory("")}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              selectedCategory === ""
                ? "bg-purple-600 text-white"
                : "border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {labels.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white"
                  : "border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-8 text-center text-gray-400">
            {labels.noResults}
          </div>
        )}
        {filtered.map((entry, idx) => {
          const origIdx = entries.indexOf(entry)
          const isExpanded = expandedTerms.has(origIdx)
          const catColor = CATEGORY_COLORS[entry.category] || "from-gray-500 to-gray-600"

          return (
            <div key={origIdx} className="rounded-lg border border-gray-700 bg-gray-800/50 overflow-hidden">
              <button
                onClick={() => toggleTerm(origIdx)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-1 rounded-full bg-gradient-to-b ${catColor}`} />
                  <div>
                    <span className="font-semibold text-white">{entry.term}</span>
                    <span className="ml-2 rounded-full bg-gray-700 px-2 py-0.5 text-[10px] text-gray-400">
                      {entry.category}
                    </span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-700 p-4 space-y-3">
                  <p className="text-sm leading-relaxed text-gray-300">{entry.definition}</p>

                  {entry.formula && (
                    <div className="rounded-lg bg-gray-900/50 p-3">
                      <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-cyan-400">
                        <BookOpen className="h-3 w-3" />
                        {labels.formula}
                      </div>
                      <div className="font-mono text-sm text-cyan-300">{entry.formula}</div>
                    </div>
                  )}

                  {entry.example && (
                    <div className="rounded-lg bg-green-900/20 border border-green-500/20 p-3">
                      <div className="mb-1 text-xs font-semibold text-green-400">{labels.example}</div>
                      <p className="text-sm text-green-300/80">{entry.example}</p>
                    </div>
                  )}

                  {entry.related && entry.related.length > 0 && (
                    <div>
                      <div className="mb-2 text-xs font-semibold text-purple-400">{labels.related}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.related.map((r) => (
                          <button
                            key={r}
                            onClick={() => setSearch(r)}
                            className="flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs text-purple-300 hover:bg-purple-500/20"
                          >
                            {r}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

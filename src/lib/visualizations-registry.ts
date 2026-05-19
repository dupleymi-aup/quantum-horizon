export type VisualizationCategory = "quantum" | "relativity" | "cosmos" | "thermodynamics" | "advanced"
export type Difficulty = "beginner" | "intermediate" | "advanced"

export interface VisualizationMeta {
  id: string
  category: VisualizationCategory
  title: Record<string, string>
  description: Record<string, string>
  learningObjectives: string[]
  prerequisites?: string[]
  difficulty: Difficulty
  estimatedTimeMin: number
  formulas?: string[]
}

export const VISUALIZATIONS_REGISTRY: VisualizationMeta[] = [
  // QUANTUM
  {
    id: "wave-function",
    category: "quantum",
    title: { ru: "Волновая функция", en: "Wave Function", zh: "波函数", he: "פונקציית גל" },
    description: {
      ru: "Визуализация уравнения Шрёдингера для бесконечной потенциальной ямы",
      en: "Schrödinger equation visualization for infinite potential well",
      zh: "无限势阱的薛定谔方程可视化",
      he: "ויזואליזציה של משוואת שרדינגר לבור פוטנציאל אינסופי",
    },
    learningObjectives: ["Understand quantum numbers", "Stationary states", "Probability density"],
    difficulty: "intermediate",
    estimatedTimeMin: 15,
    formulas: ["E_n = n²π²ℏ²/(2mL²)", "ψ_n(x,t) = √(2/L)sin(nπx/L)e^(-iE_nt/ℏ)"],
  },
  {
    id: "uncertainty",
    category: "quantum",
    title: { ru: "Принцип неопределённости", en: "Uncertainty Principle", zh: "不确定性原理", he: "עקרון אי-הוודאות" },
    description: {
      ru: "Принцип неопределённости Гейзенберга Δx·Δp ≥ ℏ/2",
      en: "Heisenberg uncertainty principle Δx·Δp ≥ ℏ/2",
      zh: "海森堡不确定性原理 Δx·Δp ≥ ℏ/2",
      he: "עקרון אי-הוודאות של הייזנברג Δx·Δp ≥ ℏ/2",
    },
    learningObjectives: ["Position-momentum tradeoff", "Wave packet spreading"],
    prerequisites: ["wave-function"],
    difficulty: "intermediate",
    estimatedTimeMin: 10,
    formulas: ["Δx·Δp ≥ ℏ/2"],
  },
  {
    id: "tunneling",
    category: "quantum",
    title: { ru: "Квантовое туннелирование", en: "Quantum Tunneling", zh: "量子隧穿", he: "מנהור קוונטי" },
    description: {
      ru: "Туннелирование частицы через потенциальный барьер",
      en: "Particle tunneling through a potential barrier",
      zh: "粒子穿过势垒的隧穿效应",
      he: "מנהור חלקיק דרך מחסום פוטנציאל",
    },
    learningObjectives: ["Tunneling probability", "Exponential decay in barrier"],
    prerequisites: ["uncertainty"],
    difficulty: "advanced",
    estimatedTimeMin: 15,
    formulas: ["T ≈ e^(-2κL)", "κ = √(2m(V₀-E))/ℏ"],
  },
  {
    id: "double-slit",
    category: "quantum",
    title: { ru: "Двухщелевой эксперимент", en: "Double Slit Experiment", zh: "双缝实验", he: "ניסוי שני הסדקים" },
    description: {
      ru: "Корпускулярно-волновой дуализм и интерференция",
      en: "Wave-particle duality and interference",
      zh: "波粒二象性和干涉",
      he: "דואליות גל-חלקיק והתאבכות",
    },
    learningObjectives: ["Interference pattern", "Wave-particle duality"],
    prerequisites: ["wave-function"],
    difficulty: "intermediate",
    estimatedTimeMin: 15,
    formulas: ["d·sin(θ) = nλ", "I(θ) = I₀cos²(πd·sin(θ)/λ)"],
  },
  {
    id: "photoelectric-effect",
    category: "quantum",
    title: { ru: "Фотоэлектрический эффект", en: "Photoelectric Effect", zh: "光电效应", he: "האפקט הפוטואלקטרי" },
    description: {
      ru: "Испускание электронов при поглощении фотонов",
      en: "Electron emission upon photon absorption",
      zh: "吸收光子时的电子发射",
      he: "פליטת אלקטרונים בבליעת פוטונים",
    },
    learningObjectives: ["E=hf threshold", "Work function concept"],
    difficulty: "beginner",
    estimatedTimeMin: 10,
    formulas: ["E = hf", "K_max = hf - A"],
  },
  {
    id: "brownian-motion",
    category: "quantum",
    title: { ru: "Броуновское движение", en: "Brownian Motion", zh: "布朗运动", he: "תנועה בראונית" },
    description: {
      ru: "Случайное тепловое движение частиц",
      en: "Random thermal motion of particles",
      zh: "粒子的随机热运动",
      he: "תנועה תרמית אקראית של חלקיקים",
    },
    learningObjectives: ["Random walk", "Thermal energy"],
    difficulty: "beginner",
    estimatedTimeMin: 8,
  },
  {
    id: "schrodingers-cat",
    category: "quantum",
    title: { ru: "Кот Шрёдингера", en: "Schrödinger's Cat", zh: "薛定谔的猫", he: "החתול של שרדינגר" },
    description: {
      ru: "Мысленный эксперимент о квантовой суперпозиции",
      en: "Thought experiment on quantum superposition",
      zh: "关于量子叠加的思想实验",
      he: "ניסוי מחשבתי על סופרפוזיציה קוונטית",
    },
    learningObjectives: ["Superposition concept", "Measurement problem"],
    difficulty: "beginner",
    estimatedTimeMin: 8,
  },
  {
    id: "quantum-entanglement",
    category: "quantum",
    title: { ru: "Квантовая запутанность", en: "Quantum Entanglement", zh: "量子纠缠", he: "שזירה קוונטית" },
    description: {
      ru: "Запутанные частицы и мгновенная корреляция состояний",
      en: "Entangled particles and instant state correlation",
      zh: "纠缠粒子和瞬时状态关联",
      he: "חלקיקים שזורים והתאמת מצבים מיידית",
    },
    learningObjectives: ["Bell states", "Non-locality"],
    prerequisites: ["wave-function"],
    difficulty: "advanced",
    estimatedTimeMin: 15,
    formulas: ["|Ψ⟩ = (|↑↑⟩ + |↓↓⟩)/√2"],
  },
  {
    id: "atomic-model",
    category: "quantum",
    title: { ru: "Атом Бора", en: "Bohr Atomic Model", zh: "玻尔原子模型", he: "המודל האטומי של בוהר" },
    description: {
      ru: "Модель атома Бора с электронными переходами",
      en: "Bohr atomic model with electron transitions",
      zh: "具有电子跃迁的玻尔原子模型",
      he: "המודל האטומי של בוהר עם מעברי אלקטרונים",
    },
    learningObjectives: ["Quantized orbits", "Photon emission/absorption"],
    difficulty: "beginner",
    estimatedTimeMin: 12,
    formulas: ["E_n = -13.6/n² eV", "ΔE = hν"],
  },
  {
    id: "radioactive-decay",
    category: "quantum",
    title: { ru: "Радиоактивный распад", en: "Radioactive Decay", zh: "放射性衰变", he: "דעיכה רדיואקטיבית" },
    description: {
      ru: "Альфа-, бета- и гамма-распад с экспоненциальной кривой",
      en: "Alpha, beta, and gamma decay with exponential curve",
      zh: "α、β和γ衰变及指数曲线",
      he: "דעיכה אלפא, בטא וגמא עם עקומה מעריכית",
    },
    learningObjectives: ["Half-life concept", "Decay types"],
    difficulty: "beginner",
    estimatedTimeMin: 12,
    formulas: ["N(t) = N₀·e^(-λt)", "T_½ = ln(2)/λ"],
  },
  {
    id: "superconductivity",
    category: "quantum",
    title: { ru: "Сверхпроводимость", en: "Superconductivity", zh: "超导性", he: "מוליכות-על" },
    description: {
      ru: "Эффект Мейснера и куперовские пары",
      en: "Meissner effect and Cooper pairs",
      zh: "迈斯纳效应和库珀对",
      he: "אפקט מייסנר וזוגות קופר",
    },
    learningObjectives: ["Critical temperature", "Magnetic field expulsion"],
    difficulty: "advanced",
    estimatedTimeMin: 15,
  },

  // RELATIVITY
  {
    id: "time-dilation",
    category: "relativity",
    title: { ru: "Замедление времени", en: "Time Dilation", zh: "时间膨胀", he: "התארכות זמן" },
    description: {
      ru: "Релятивистское замедление времени Δt' = Δt/γ",
      en: "Relativistic time dilation Δt' = Δt/γ",
      zh: "相对论时间膨胀 Δt' = Δt/γ",
      he: "התארכות זמן יחסותית Δt' = Δt/γ",
    },
    learningObjectives: ["Lorentz factor", "Moving clocks run slow"],
    difficulty: "beginner",
    estimatedTimeMin: 10,
    formulas: ["Δt' = Δt/γ", "γ = 1/√(1-v²/c²)"],
  },
  {
    id: "length-contraction",
    category: "relativity",
    title: { ru: "Сокращение длины", en: "Length Contraction", zh: "长度收缩", he: "התכווצות אורך" },
    description: {
      ru: "Лоренцево сокращение длины L = L₀√(1-v²/c²)",
      en: "Lorentz length contraction L = L₀√(1-v²/c²)",
      zh: "洛伦兹长度收缩 L = L₀√(1-v²/c²)",
      he: "התכווצות אורך לורנץ L = L₀√(1-v²/c²)",
    },
    learningObjectives: ["Moving objects contract", "Reference frames"],
    prerequisites: ["time-dilation"],
    difficulty: "beginner",
    estimatedTimeMin: 10,
    formulas: ["L = L₀√(1-v²/c²)"],
  },
  {
    id: "mass-energy",
    category: "relativity",
    title: { ru: "Эквивалентность массы и энергии", en: "Mass-Energy Equivalence", zh: "质能等价", he: "שקילות מסה-אנרגיה" },
    description: {
      ru: "Знаменитое уравнение E = mc²",
      en: "The famous equation E = mc²",
      zh: "著名方程 E = mc²",
      he: "המשוואה המפורסמת E = mc²",
    },
    learningObjectives: ["Mass-energy conversion", "c² as conversion factor"],
    prerequisites: ["time-dilation"],
    difficulty: "beginner",
    estimatedTimeMin: 8,
    formulas: ["E = mc²"],
  },

  // COSMOS
  {
    id: "black-hole",
    category: "cosmos",
    title: { ru: "Чёрная дыра", en: "Black Hole", zh: "黑洞", he: "חור שחור" },
    description: {
      ru: "Чёрная дыра Шварцшильда с аккреционным диском",
      en: "Schwarzschild black hole with accretion disk",
      zh: "史瓦西黑洞及吸积盘",
      he: "חור שחור שוורצשילד עם דיסקת ספיחה",
    },
    learningObjectives: ["Event horizon", "Gravitational lensing", "Hawking radiation"],
    difficulty: "advanced",
    estimatedTimeMin: 20,
    formulas: ["r_s = 2GM/c²"],
  },
  {
    id: "big-bang",
    category: "cosmos",
    title: { ru: "Большой взрыв", en: "Big Bang", zh: "大爆炸", he: "המפץ הגדול" },
    description: {
      ru: "Расширение Вселенной из сингулярности",
      en: "Universe expansion from singularity",
      zh: "宇宙从奇点膨胀",
      he: "התפשטות היקום מסינגולריות",
    },
    learningObjectives: ["Cosmic expansion", "Particle formation"],
    difficulty: "beginner",
    estimatedTimeMin: 10,
  },
  {
    id: "dark-matter",
    category: "cosmos",
    title: { ru: "Тёмная материя", en: "Dark Matter", zh: "暗物质", he: "חומר אפל" },
    description: {
      ru: "Кривые вращения галактик и тёмная материя",
      en: "Galaxy rotation curves and dark matter",
      zh: "星系旋转曲线和暗物质",
      he: "עקומות סיבוב גלקסיות וחומר אפל",
    },
    learningObjectives: ["Missing mass problem", "Dark matter halo"],
    difficulty: "intermediate",
    estimatedTimeMin: 12,
  },
  {
    id: "hr-diagram",
    category: "cosmos",
    title: { ru: "Диаграмма Герцшпрунга — Рассела", en: "Hertzsprung-Russell Diagram", zh: "赫罗图", he: "דיאגרמת הרצשפרונג-ראסל" },
    description: {
      ru: "Классификация звёзд по светимости и температуре",
      en: "Stellar classification by luminosity and temperature",
      zh: "按光度和温度对恒星分类",
      he: "סיווג כוכבים לפי בהירות וטמפרטורה",
    },
    learningObjectives: ["Main sequence", "Giants and dwarfs"],
    difficulty: "intermediate",
    estimatedTimeMin: 15,
  },
  {
    id: "neutron-star",
    category: "cosmos",
    title: { ru: "Нейтронная звезда", en: "Neutron Star", zh: "中子星", he: "כוכב ניוטרונים" },
    description: {
      ru: "Вращающаяся нейтронная звезда / пульсар",
      en: "Rotating neutron star / pulsar",
      zh: "旋转中子星/脉冲星",
      he: "כוכב ניוטרונים מסתובב / פולסאר",
    },
    learningObjectives: ["Degenerate matter", "Magnetic dipole radiation"],
    prerequisites: ["black-hole"],
    difficulty: "advanced",
    estimatedTimeMin: 12,
  },
  {
    id: "dark-energy",
    category: "cosmos",
    title: { ru: "Тёмная энергия", en: "Dark Energy", zh: "暗能量", he: "אנרגיה אפלה" },
    description: {
      ru: "Ускоренное расширение Вселенной",
      en: "Accelerated expansion of the universe",
      zh: "宇宙加速膨胀",
      he: "התפשטות מואצת של היקום",
    },
    learningObjectives: ["Cosmological constant", "Accelerated expansion"],
    difficulty: "intermediate",
    estimatedTimeMin: 10,
  },
  {
    id: "solar-system",
    category: "cosmos",
    title: { ru: "Солнечная система", en: "Solar System", zh: "太阳系", he: "מערכת השמש" },
    description: {
      ru: "Планетарные орбиты Солнечной системы",
      en: "Planetary orbits of the Solar System",
      zh: "太阳系的行星轨道",
      he: "מסלולים פלנטריים של מערכת השמש",
    },
    learningObjectives: ["Kepler's laws", "Orbital mechanics"],
    difficulty: "beginner",
    estimatedTimeMin: 10,
  },
  {
    id: "standard-model",
    category: "cosmos",
    title: { ru: "Стандартная модель", en: "Standard Model", zh: "标准模型", he: "המודל הסטנדרטי" },
    description: {
      ru: "Классификация элементарных частиц",
      en: "Elementary particle classification",
      zh: "基本粒子分类",
      he: "סיווג חלקיקים אלמנטריים",
    },
    learningObjectives: ["Quarks, leptons, bosons", "Particle families"],
    difficulty: "advanced",
    estimatedTimeMin: 15,
  },
  {
    id: "cmb",
    category: "cosmos",
    title: { ru: "Реликтовое излучение", en: "Cosmic Microwave Background", zh: "宇宙微波背景", he: "קרינת רקע קוסמית" },
    description: {
      ru: "Карта излучения ранней Вселенной",
      en: "Map of early universe radiation",
      zh: "早期宇宙辐射图",
      he: "מפת קרינת היקום המוקדם",
    },
    learningObjectives: ["CMB discovery", "Temperature fluctuations"],
    difficulty: "intermediate",
    estimatedTimeMin: 12,
  },
  {
    id: "wormhole",
    category: "cosmos",
    title: { ru: "Кротовая нора", en: "Wormhole", zh: "虫洞", he: "חור תולעת" },
    description: {
      ru: "Мост Эйнштейна-Розена в пространстве-времени",
      en: "Einstein-Rosen bridge in spacetime",
      zh: "时空中的爱因斯坦-罗森桥",
      he: "גשר איינשטיין-רוזן במרחב-זמן",
    },
    learningObjectives: ["Spacetime topology", "Theoretical passages"],
    prerequisites: ["black-hole"],
    difficulty: "advanced",
    estimatedTimeMin: 10,
  },
  {
    id: "pulsar",
    category: "cosmos",
    title: { ru: "Пульсар", en: "Pulsar", zh: "脉冲星", he: "פולסאר" },
    description: {
      ru: "Луч пульсара, вращающегося в космосе",
      en: "Pulsar beam sweeping through space",
      zh: "脉冲星束扫过太空",
      he: "קרן פולסאר הסורקת את החלל",
    },
    learningObjectives: ["Lighthouse effect", "Rotation period"],
    prerequisites: ["neutron-star"],
    difficulty: "intermediate",
    estimatedTimeMin: 10,
  },
  {
    id: "quasar",
    category: "cosmos",
    title: { ru: "Квазар", en: "Quasar", zh: "类星体", he: "קוואזר" },
    description: {
      ru: "Активное галактическое ядро",
      en: "Active galactic nucleus",
      zh: "活跃星系核",
      he: "גרעין גלקטי פעיל",
    },
    learningObjectives: ["AGN energy source", "Supermassive black holes"],
    prerequisites: ["black-hole"],
    difficulty: "advanced",
    estimatedTimeMin: 12,
  },
  {
    id: "protoplanetary-disk",
    category: "cosmos",
    title: { ru: "Протопланетный диск", en: "Protoplanetary Disk", zh: "原行星盘", he: "דיסקה פרוטו-פלנטרית" },
    description: {
      ru: "Формирование планет из пылевого диска",
      en: "Planet formation from dust disk",
      zh: "从尘埃盘形成行星",
      he: "היווצרות כוכבי לכת מדיסקת אבק",
    },
    learningObjectives: ["Planet formation", "Accretion process"],
    difficulty: "intermediate",
    estimatedTimeMin: 12,
  },
  {
    id: "white-hole",
    category: "cosmos",
    title: { ru: "Белая дыра", en: "White Hole", zh: "白洞", he: "חור לבן" },
    description: {
      ru: "Теоретическая белая дыра (обратная чёрной)",
      en: "Theoretical white hole (reverse black hole)",
      zh: "理论白洞（黑洞的反面）",
      he: "חור לבן תיאורטי (הפוך מחור שחור)",
    },
    learningObjectives: ["Time-reversed black hole", "Theoretical concept"],
    prerequisites: ["black-hole"],
    difficulty: "advanced",
    estimatedTimeMin: 10,
  },
  {
    id: "isoclines",
    category: "cosmos",
    title: { ru: "Изоклины: Кольца Сатурна", en: "Isoclines: Saturn's Rings", zh: "等斜线：土星环", he: "איזוקלינות: טבעות שבתאי" },
    description: {
      ru: "Дифференциальные уравнения методом изоклин",
      en: "Differential equations via isocline method",
      zh: "通过等斜线法解微分方程",
      he: "משוואות דיפרנציאליות בשיטת איזוקלינות",
    },
    learningObjectives: ["Phase plane analysis", "Isocline method"],
    difficulty: "advanced",
    estimatedTimeMin: 15,
  },

  // THERMODYNAMICS
  {
    id: "entropy",
    category: "thermodynamics",
    title: { ru: "Энтропия", en: "Entropy", zh: "熵", he: "אנטרופיה" },
    description: {
      ru: "Второй закон термодинамики, смешивание газов",
      en: "Second law of thermodynamics, gas mixing",
      zh: "热力学第二定律，气体混合",
      he: "החוק השני של התרמודינמיקה, ערבוב גזים",
    },
    learningObjectives: ["Entropy increase", "Irreversibility"],
    difficulty: "intermediate",
    estimatedTimeMin: 12,
    formulas: ["ΔS ≥ 0", "S = k_B·ln(Ω)"],
  },
  {
    id: "phase-transition",
    category: "thermodynamics",
    title: { ru: "Фазовые переходы", en: "Phase Transitions", zh: "相变", he: "מעברי פאזה" },
    description: {
      ru: "Твёрдое/жидкое/газообразное состояние молекул",
      en: "Solid/liquid/gas molecular behavior",
      zh: "分子的固态/液态/气态行为",
      he: "התנהגות מולקולרית מוצק/נוזל/גז",
    },
    learningObjectives: ["Phase changes", "Molecular kinetic energy"],
    difficulty: "beginner",
    estimatedTimeMin: 10,
  },
  {
    id: "ideal-gas",
    category: "thermodynamics",
    title: { ru: "Идеальный газ", en: "Ideal Gas", zh: "理想气体", he: "גז אידיאלי" },
    description: {
      ru: "Уравнение состояния PV = nRT",
      en: "Equation of state PV = nRT",
      zh: "状态方程 PV = nRT",
      he: "משוואת מצב PV = nRT",
    },
    learningObjectives: ["Gas laws", "Molecular collisions"],
    difficulty: "beginner",
    estimatedTimeMin: 10,
    formulas: ["PV = nRT"],
  },
  {
    id: "carnot-engine",
    category: "thermodynamics",
    title: { ru: "Двигатель Карно", en: "Carnot Engine", zh: "卡诺发动机", he: "מנוע קרנו" },
    description: {
      ru: "Цикл Карно: η = 1 - T_cold/T_hot",
      en: "Carnot cycle: η = 1 - T_cold/T_hot",
      zh: "卡诺循环：η = 1 - T_cold/T_hot",
      he: "מעגל קרנו: η = 1 - T_cold/T_hot",
    },
    learningObjectives: ["Maximum efficiency", "Reversible processes"],
    prerequisites: ["ideal-gas"],
    difficulty: "intermediate",
    estimatedTimeMin: 15,
    formulas: ["η = 1 - T_c/T_h"],
  },
  {
    id: "thermal-radiation",
    category: "thermodynamics",
    title: { ru: "Тепловое излучение", en: "Thermal Radiation", zh: "热辐射", he: "קרינה תרמית" },
    description: {
      ru: "Закон Планка и закон смещения Вина",
      en: "Planck's law and Wien's displacement law",
      zh: "普朗克定律和维恩位移定律",
      he: "חוק פלאנק וחוק ההעתקה של וין",
    },
    learningObjectives: ["Black body spectrum", "Wien's law"],
    difficulty: "intermediate",
    estimatedTimeMin: 12,
    formulas: ["B(λ,T) = 2hc²/λ⁵ · 1/(e^(hc/λkT)-1)", "λ_max·T = b"],
  },

  // ADVANCED
  {
    id: "gravitational-waves",
    category: "advanced",
    title: { ru: "Гравитационные волны", en: "Gravitational Waves", zh: "引力波", he: "גלי כבידה" },
    description: {
      ru: "Рябь пространства-времени от двойной системы",
      en: "Spacetime ripples from a binary system",
      zh: "双星系统产生的时空涟漪",
      he: "אדוות מרחב-זמן ממערכת בינארית",
    },
    learningObjectives: ["Binary inspiral", "Spacetime distortion"],
    prerequisites: ["mass-energy"],
    difficulty: "advanced",
    estimatedTimeMin: 15,
  },
]

export function getVisualizationById(id: string): VisualizationMeta | undefined {
  return VISUALIZATIONS_REGISTRY.find((v) => v.id === id)
}

export function getVisualizationsByCategory(category: VisualizationCategory): VisualizationMeta[] {
  return VISUALIZATIONS_REGISTRY.filter((v) => v.category === category)
}

export function getPrerequisites(id: string): string[] {
  const vis = getVisualizationById(id)
  return vis?.prerequisites ?? []
}

export function getAllCategories(): VisualizationCategory[] {
  return ["quantum", "relativity", "cosmos", "thermodynamics", "advanced"]
}

"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import { Play, CheckCircle, XCircle, Lightbulb, RefreshCw, BookOpen, FlaskConical } from "lucide-react"

type Language = "ru" | "en" | "zh" | "he"

interface LabStep {
  title: string
  description: string
  procedure: string
  observation: string
  explanation: string
  interactive?: {
    label: string
    min: number
    max: number
    step: number
    default: number
    unit: string
    result: (value: number) => string
  }
}

interface LabExperiment {
  id: string
  title: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: string
  icon: string
  objective: string
  materials: string[]
  steps: LabStep[]
  safetyNotes?: string[]
}

const LAB_EXPERIMENTS: Record<Language, LabExperiment[]> = {
  ru: [
    {
      id: "photoelectric-effect",
      title: "Фотоэлектрический эффект",
      category: "Квантовая физика",
      difficulty: "intermediate",
      duration: "15 мин",
      icon: "⚡",
      objective: "Исследовать зависимость кинетической энергии фотоэлектронов от частоты света и определить постоянную Планка.",
      materials: [
        "Источник монохроматического света с переменной частотой",
        "Фотокатод (цинковая пластина)",
        "Амперметр",
        "Источник напряжения",
        "Вольтметр",
      ],
      steps: [
        {
          title: "Подготовка установки",
          description: "Соберите схему: фотокатод подключён к амперметру и источнику запирающего напряжения.",
          procedure: "Установите начальную частоту света ниже красной границы фотоэффекта для цинка (ν < 8.06×10¹⁴ Гц).",
          observation: "Фототок отсутствует — энергия фотонов недостаточна для выбивания электронов.",
          explanation: "Фотоэффект происходит только когда энергия фотона hν превышает работу выхода A: hν > A.",
        },
        {
          title: "Измерение запирающего потенциала",
          description: "Постепенно увеличивайте частоту света и измеряйте запирающее напряжение U₃.",
          procedure: "Для каждой частоты найдите напряжение, при котором фототок прекращается.",
          observation: "Запирающее напряжение линейно зависит от частоты: U₃ = (h/e)ν - A/e",
          explanation: "Наклон графика U₃(ν) равен h/e. Это позволяет экспериментально определить постоянную Планка.",
          interactive: {
            label: "Частота света ν",
            min: 4,
            max: 15,
            step: 0.1,
            default: 8,
            unit: "×10¹⁴ Гц",
            result: (freq) => {
              const h = 6.626e-34
              const e = 1.602e-19
              const A_Zn = 4.3 * e // работа выхода цинка в Дж
              const E = h * freq * 1e14
              const Ek = E - A_Zn
              if (Ek <= 0) return "Фотоэффект не наблюдается (hν < A)"
              const Uz = Ek / e
              return `E_фотона = ${(E / e).toFixed(2)} эВ, K_max = ${(Ek / e).toFixed(2)} эВ, U₃ = ${Uz.toFixed(2)} В`
            },
          },
        },
        {
          title: "Определение постоянной Планка",
          description: "Постройте график U₃(ν) и определите наклон.",
          procedure: "Используйте метод наименьших квадратов для нахождения h из наклона графика.",
          observation: "h = e × tan(α) ≈ 6.626 × 10⁻³⁴ Дж·с",
          explanation: "Экспериментальное значение постоянной Планка совпадает с табличным в пределах погрешности.",
        },
      ],
      safetyNotes: [
        "Не смотрите прямо на ультрафиолетовый источник",
        "Работайте в проветриваемом помещении",
      ],
    },
    {
      id: "double-slit",
      title: "Опыт Юнга с двумя щелями",
      category: "Волновая оптика",
      difficulty: "beginner",
      duration: "10 мин",
      icon: "🔬",
      objective: "Наблюдать интерференционную картину и доказать волновую природу света.",
      materials: [
        "Лазерный указ (λ = 650 нм)",
        "Двухщелевая пластинка (d = 0.5 мм)",
        "Экран на расстоянии L = 2 м",
        "Линейка",
      ],
      steps: [
        {
          title: "Настройка эксперимента",
          description: "Расположите лазер, двухщелевую пластинку и экран на одной оптической оси.",
          procedure: "Убедитесь, что лазерный луч проходит через обе щели равномерно.",
          observation: "На экране появляются чередующиеся светлые и тёмные полосы.",
          explanation: "Светлые полосы — конструктивная интерференция (Δ = mλ), тёмные — деструктивная (Δ = (m+½)λ).",
        },
        {
          title: "Измерение длины волны",
          description: "Измерьте расстояние между соседними светлыми полосами Δx.",
          procedure: "Используйте формулу: λ = d × Δx / L",
          observation: "Для d = 0.5 мм, L = 2 м: Δx ≈ 2.6 мм → λ ≈ 650 нм",
          explanation: "Результат соответствует длине волны красного лазера.",
          interactive: {
            label: "Расстояние между полосами Δx",
            min: 1,
            max: 10,
            step: 0.1,
            default: 2.6,
            unit: "мм",
            result: (dx) => {
              const d = 0.5e-3 // м
              const L = 2 // м
              const lambda = (d * dx * 1e-3) / L
              const lambda_nm = lambda * 1e9
              const color = lambda_nm < 450 ? "фиолетовый" : lambda_nm < 495 ? "голубой" : lambda_nm < 570 ? "зелёный" : lambda_nm < 590 ? "жёлтый" : lambda_nm < 620 ? "оранжевый" : "красный"
              return `λ = ${lambda_nm.toFixed(0)} нм — ${color} свет`
            },
          },
        },
      ],
    },
    {
      id: "carnot-cycle",
      title: "Цикл Карно",
      category: "Термодинамика",
      difficulty: "advanced",
      duration: "20 мин",
      icon: "⚙️",
      objective: "Исследовать идеальный тепловой цикл и рассчитать максимальный КПД тепловой машины.",
      materials: [
        "Модель теплового двигателя",
        "Источник нагревания (T₁)",
        "Источник охлаждения (T₂)",
        "Датчики давления и объёма",
      ],
      steps: [
        {
          title: "Изотермическое расширение",
          description: "Газ контактирует с нагревателем при T₁ и расширяется.",
          procedure: "Поддерживайте постоянную температуру T₁ = 500 К. Измерьте Q₁ — теплоту, полученную от нагревателя.",
          observation: "Q₁ = nRT₁ ln(V₂/V₁). Температура постоянна, объём растёт.",
          explanation: "Вся подведённая теплота идёт на работу: Q₁ = W₁₂.",
          interactive: {
            label: "Температура нагревателя T₁",
            min: 300,
            max: 1000,
            step: 10,
            default: 500,
            unit: "К",
            result: (T1) => {
              const T2 = 300
              const eta = (1 - T2 / T1) * 100
              return `T₁ = ${T1} К, T₂ = ${T2} К, η_max = ${eta.toFixed(1)}%`
            },
          },
        },
        {
          title: "Адиабатическое расширение",
          description: "Газ расширяется без теплообмена, температура падает до T₂.",
          procedure: "Изолируйте систему. Продолжайте расширение до T₂ = 300 К.",
          observation: "Q = 0, температура падает от T₁ до T₂. Работа совершается за счёт внутренней энергии.",
          explanation: "ΔU = -W. При адиабатическом процессе: TV^(γ-1) = const.",
        },
        {
          title: "Расчёт КПД Карно",
          description: "КПД идеальной тепловой машины зависит только от температур.",
          procedure: "η = 1 - T₂/T₁. Сравните с реальными двигателями.",
          observation: "Для T₁ = 500 К, T₂ = 300 К: η = 40%",
          explanation: "КПД Карно — теоретический предел. Реальные двигатели имеют КПД 25-35% из-за необратимости процессов.",
        },
      ],
    },
  ],
  en: [
    {
      id: "photoelectric-effect",
      title: "Photoelectric Effect",
      category: "Quantum Physics",
      difficulty: "intermediate",
      duration: "15 min",
      icon: "⚡",
      objective: "Investigate the dependence of photoelectron kinetic energy on light frequency and determine Planck's constant.",
      materials: [
        "Monochromatic light source with variable frequency",
        "Photocathode (zinc plate)",
        "Ammeter",
        "Voltage source",
        "Voltmeter",
      ],
      steps: [
        {
          title: "Setup Preparation",
          description: "Assemble the circuit: photocathode connected to ammeter and stopping voltage source.",
          procedure: "Set the initial light frequency below the threshold for zinc (ν < 8.06×10¹⁴ Hz).",
          observation: "No photocurrent — photon energy is insufficient to eject electrons.",
          explanation: "Photoelectric effect occurs only when photon energy hν exceeds work function A: hν > A.",
        },
        {
          title: "Measuring Stopping Potential",
          description: "Gradually increase the light frequency and measure stopping voltage U₃.",
          procedure: "For each frequency, find the voltage at which photocurrent stops.",
          observation: "Stopping voltage depends linearly on frequency: U₃ = (h/e)ν - A/e",
          explanation: "The slope of U₃(ν) graph equals h/e. This allows experimental determination of Planck's constant.",
          interactive: {
            label: "Light frequency ν",
            min: 4,
            max: 15,
            step: 0.1,
            default: 8,
            unit: "×10¹⁴ Hz",
            result: (freq) => {
              const h = 6.626e-34
              const e = 1.602e-19
              const A_Zn = 4.3 * e
              const E = h * freq * 1e14
              const Ek = E - A_Zn
              if (Ek <= 0) return "No photoelectric effect (hν < A)"
              const Uz = Ek / e
              return `E_photon = ${(E / e).toFixed(2)} eV, K_max = ${(Ek / e).toFixed(2)} eV, U₃ = ${Uz.toFixed(2)} V`
            },
          },
        },
        {
          title: "Determining Planck's Constant",
          description: "Plot U₃(ν) and determine the slope.",
          procedure: "Use least squares method to find h from the graph slope.",
          observation: "h = e × tan(α) ≈ 6.626 × 10⁻³⁴ J·s",
          explanation: "The experimental value of Planck's constant matches the tabulated value within error.",
        },
      ],
      safetyNotes: [
        "Do not look directly at the ultraviolet source",
        "Work in a well-ventilated area",
      ],
    },
    {
      id: "double-slit",
      title: "Young's Double-Slit Experiment",
      category: "Wave Optics",
      difficulty: "beginner",
      duration: "10 min",
      icon: "🔬",
      objective: "Observe the interference pattern and prove the wave nature of light.",
      materials: [
        "Laser pointer (λ = 650 nm)",
        "Double-slit plate (d = 0.5 mm)",
        "Screen at distance L = 2 m",
        "Ruler",
      ],
      steps: [
        {
          title: "Experiment Setup",
          description: "Arrange the laser, double-slit plate, and screen on one optical axis.",
          procedure: "Ensure the laser beam passes through both slits evenly.",
          observation: "Alternating bright and dark fringes appear on the screen.",
          explanation: "Bright fringes — constructive interference (Δ = mλ), dark — destructive (Δ = (m+½)λ).",
        },
        {
          title: "Wavelength Measurement",
          description: "Measure the distance between adjacent bright fringes Δx.",
          procedure: "Use the formula: λ = d × Δx / L",
          observation: "For d = 0.5 mm, L = 2 m: Δx ≈ 2.6 mm → λ ≈ 650 nm",
          explanation: "The result corresponds to the wavelength of a red laser.",
          interactive: {
            label: "Fringe spacing Δx",
            min: 1,
            max: 10,
            step: 0.1,
            default: 2.6,
            unit: "mm",
            result: (dx) => {
              const d = 0.5e-3
              const L = 2
              const lambda = (d * dx * 1e-3) / L
              const lambda_nm = lambda * 1e9
              const color = lambda_nm < 450 ? "violet" : lambda_nm < 495 ? "blue" : lambda_nm < 570 ? "green" : lambda_nm < 590 ? "yellow" : lambda_nm < 620 ? "orange" : "red"
              return `λ = ${lambda_nm.toFixed(0)} nm — ${color} light`
            },
          },
        },
      ],
    },
    {
      id: "carnot-cycle",
      title: "Carnot Cycle",
      category: "Thermodynamics",
      difficulty: "advanced",
      duration: "20 min",
      icon: "⚙️",
      objective: "Investigate the ideal heat cycle and calculate the maximum efficiency of a heat engine.",
      materials: [
        "Heat engine model",
        "Heating source (T₁)",
        "Cooling source (T₂)",
        "Pressure and volume sensors",
      ],
      steps: [
        {
          title: "Isothermal Expansion",
          description: "Gas contacts heater at T₁ and expands.",
          procedure: "Maintain constant temperature T₁ = 500 K. Measure Q₁ — heat received from the heater.",
          observation: "Q₁ = nRT₁ ln(V₂/V₁). Temperature is constant, volume increases.",
          explanation: "All supplied heat goes into work: Q₁ = W₁₂.",
          interactive: {
            label: "Heater temperature T₁",
            min: 300,
            max: 1000,
            step: 10,
            default: 500,
            unit: "K",
            result: (T1) => {
              const T2 = 300
              const eta = (1 - T2 / T1) * 100
              return `T₁ = ${T1} K, T₂ = ${T2} K, η_max = ${eta.toFixed(1)}%`
            },
          },
        },
        {
          title: "Adiabatic Expansion",
          description: "Gas expands without heat exchange, temperature drops to T₂.",
          procedure: "Insulate the system. Continue expansion to T₂ = 300 K.",
          observation: "Q = 0, temperature drops from T₁ to T₂. Work is done at the expense of internal energy.",
          explanation: "ΔU = -W. For adiabatic process: TV^(γ-1) = const.",
        },
        {
          title: "Carnot Efficiency Calculation",
          description: "Efficiency of an ideal heat engine depends only on temperatures.",
          procedure: "η = 1 - T₂/T₁. Compare with real engines.",
          observation: "For T₁ = 500 K, T₂ = 300 K: η = 40%",
          explanation: "Carnot efficiency is the theoretical maximum. Real engines have 25-35% efficiency due to irreversibility.",
        },
      ],
    },
  ],
  zh: [
    {
      id: "photoelectric-effect",
      title: "光电效应",
      category: "量子物理",
      difficulty: "intermediate",
      duration: "15 分钟",
      icon: "⚡",
      objective: "研究光电子动能与光频率的关系，测定普朗克常数。",
      materials: [
        "可变频率单色光源",
        "光阴极（锌板）",
        "电流表",
        "电压源",
        "电压表",
      ],
      steps: [
        {
          title: "实验准备",
          description: "组装电路：光阴极连接到电流表和截止电压源。",
          procedure: "将初始光频率设置为低于锌的阈值（ν < 8.06×10¹⁴ Hz）。",
          observation: "无光电流——光子能量不足以逸出电子。",
          explanation: "只有当光子能量 hν 超过逸出功 A 时，才会发生光电效应：hν > A。",
        },
        {
          title: "测量截止电压",
          description: "逐渐增加光频率，测量截止电压 U₃。",
          procedure: "对于每个频率，找到光电流停止时的电压。",
          observation: "截止电压与频率成线性关系：U₃ = (h/e)ν - A/e",
          explanation: "U₃(ν) 图的斜率等于 h/e。这可以实验测定普朗克常数。",
          interactive: {
            label: "光频率 ν",
            min: 4,
            max: 15,
            step: 0.1,
            default: 8,
            unit: "×10¹⁴ Hz",
            result: (freq) => {
              const h = 6.626e-34
              const e = 1.602e-19
              const A_Zn = 4.3 * e
              const E = h * freq * 1e14
              const Ek = E - A_Zn
              if (Ek <= 0) return "无光电效应 (hν < A)"
              const Uz = Ek / e
              return `E_光子 = ${(E / e).toFixed(2)} eV, K_max = ${(Ek / e).toFixed(2)} eV, U₃ = ${Uz.toFixed(2)} V`
            },
          },
        },
      ],
    },
    {
      id: "double-slit",
      title: "杨氏双缝实验",
      category: "波动光学",
      difficulty: "beginner",
      duration: "10 分钟",
      icon: "🔬",
      objective: "观察干涉条纹，证明光的波动性。",
      materials: [
        "激光笔（λ = 650 nm）",
        "双缝板（d = 0.5 mm）",
        "屏幕（距离 L = 2 m）",
        "尺子",
      ],
      steps: [
        {
          title: "实验设置",
          description: "将激光器、双缝板和屏幕排列在同一光轴上。",
          procedure: "确保激光束均匀通过两个狭缝。",
          observation: "屏幕上出现明暗相间的条纹。",
          explanation: "明条纹——相长干涉（Δ = mλ），暗条纹——相消干涉（Δ = (m+½)λ）。",
        },
      ],
    },
  ],
  he: [
    {
      id: "photoelectric-effect",
      title: "האפקט הפוטואלקטרי",
      category: "פיזיקה קוונטית",
      difficulty: "intermediate",
      duration: "15 דקות",
      icon: "⚡",
      objective: "לחקור את התלות של האנרגיה הקינטית של פוטואלקטרונים בתדירות האור ולקבוע את קבוע פלאנק.",
      materials: [
        "מקור אור מונוכרומטי עם תדירות משתנה",
        "פוטוקתודה (לוחית אבץ)",
        "אמפרמטר",
        "מקור מתח",
        "וולטמטר",
      ],
      steps: [
        {
          title: "הכנת המערכה",
          description: "הרכב את המעגל: פוטוקתודה מחוברת לאמפרמטר ולמקור מתח עצירה.",
          procedure: "קבע את תדירות האור ההתחלתית מתחת לסף לאבץ (ν < 8.06×10¹⁴ Hz).",
          observation: "אין פוטו־זרם — אנרגיית הפוטונים אינה מספיקה לפליטת אלקטרונים.",
          explanation: "האפקט הפוטואלקטרי מתרחש רק כאשר אנרגיית הפוטון hν עולה על פונקציית העבודה A: hν > A.",
        },
      ],
    },
  ],
}

const DIFFICULTY_COLORS = {
  beginner: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  intermediate: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  advanced: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
}

const DIFFICULTY_LABELS: Record<Language, Record<string, string>> = {
  ru: { beginner: "Начальный", intermediate: "Средний", advanced: "Продвинутый" },
  en: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" },
  zh: { beginner: "初级", intermediate: "中级", advanced: "高级" },
  he: { beginner: "מתחיל", intermediate: "בינוני", advanced: "מתקדם" },
}

const LAB_LABELS: Record<Language, Record<string, string>> = {
  ru: {
    title: "🧪 Физическая лаборатория",
    subtitle: "Интерактивные эксперименты с пошаговыми процедурами",
    selectExperiment: "Выберите эксперимент",
    objective: "Цель",
    materials: "Оборудование",
    step: "Шаг",
    procedure: "Процедура",
    observation: "Наблюдение",
    explanation: "Объяснение",
    safetyNotes: "Техника безопасности",
    complete: "Завершить",
    completed: "Завершён",
    startExperiment: "Начать эксперимент",
    reset: "Начать заново",
    nextStep: "Следующий шаг",
    prevStep: "Предыдущий",
    interactive: "Интерактивный расчёт",
    category: "Категория",
    duration: "Время",
    difficulty: "Сложность",
  },
  en: {
    title: "🧪 Physics Laboratory",
    subtitle: "Interactive experiments with step-by-step procedures",
    selectExperiment: "Select an experiment",
    objective: "Objective",
    materials: "Equipment",
    step: "Step",
    procedure: "Procedure",
    observation: "Observation",
    explanation: "Explanation",
    safetyNotes: "Safety Notes",
    complete: "Complete",
    completed: "Completed",
    startExperiment: "Start Experiment",
    reset: "Start Over",
    nextStep: "Next Step",
    prevStep: "Previous",
    interactive: "Interactive Calculation",
    category: "Category",
    duration: "Duration",
    difficulty: "Difficulty",
  },
  zh: {
    title: "🧪 物理实验室",
    subtitle: "带分步程序的互动实验",
    selectExperiment: "选择实验",
    objective: "目标",
    materials: "设备",
    step: "步骤",
    procedure: "程序",
    observation: "观察",
    explanation: "解释",
    safetyNotes: "安全须知",
    complete: "完成",
    completed: "已完成",
    startExperiment: "开始实验",
    reset: "重新开始",
    nextStep: "下一步",
    prevStep: "上一步",
    interactive: "互动计算",
    category: "类别",
    duration: "时长",
    difficulty: "难度",
  },
  he: {
    title: "🧪 מעבדת פיזיקה",
    subtitle: "ניסויים אינטראקטיביים עם הוראות שלב אחר שלב",
    selectExperiment: "בחר ניסוי",
    objective: "מטרה",
    materials: "ציוד",
    step: "שלב",
    procedure: "נוהל",
    observation: "תצפית",
    explanation: "הסבר",
    safetyNotes: "הערות בטיחות",
    complete: "השלם",
    completed: "הושלם",
    startExperiment: "התחל ניסוי",
    reset: "התחל מחדש",
    nextStep: "השלב הבא",
    prevStep: "הקודם",
    interactive: "חישוב אינטראקטיבי",
    category: "קטגוריה",
    duration: "משך",
    difficulty: "רמת קושי",
  },
}

export function PhysicsLaboratory() {
  const locale = useLocale() as Language
  const [language] = useState<Language>(["ru", "en", "zh", "he"].includes(locale) ? locale : "en")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [sliderValues, setSliderValues] = useState<Record<number, number>>({})

  const labels = LAB_LABELS[language]
  const difficultyLabels = DIFFICULTY_LABELS[language]
  const experiments = LAB_EXPERIMENTS[language]
  const experiment = experiments.find((e) => e.id === selectedId)

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setSliderValues({})
  }

  const handleStepComplete = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]))
    if (experiment && currentStep < experiment.steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setSliderValues({})
  }

  const allComplete = completedSteps.size === experiment?.steps.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{labels.title}</h2>
        <p className="mt-1 text-sm text-gray-400">{labels.subtitle}</p>
      </div>

      {/* Experiment list */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {experiments.map((exp) => {
          const diff = DIFFICULTY_COLORS[exp.difficulty]
          return (
            <button
              key={exp.id}
              onClick={() => { handleSelect(exp.id); }}
              className={`rounded-xl border p-4 text-left transition-all hover:scale-[1.02] ${
                selectedId === exp.id
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-gray-700 bg-gray-800/50 hover:bg-gray-700/50"
              }`}
            >
              <div className="mb-2 text-3xl">{exp.icon}</div>
              <h3 className="font-semibold text-white">{exp.title}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs ${diff.bg} ${diff.border} ${diff.text}`}>
                  {difficultyLabels[exp.difficulty]}
                </span>
                <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
                  {exp.duration}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-gray-400">{exp.objective}</p>
            </button>
          )
        })}
      </div>

      {/* Experiment detail */}
      {experiment && (
        <div className="animate-fadeIn space-y-4 rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{experiment.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{experiment.title}</h3>
                  <p className="text-sm text-gray-400">{experiment.category}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg border border-gray-600 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className="h-3 w-3" />
              {labels.reset}
            </button>
          </div>

          <div className="rounded-lg border-l-4 border-purple-500 bg-purple-900/20 p-4">
            <div className="mb-1 text-xs font-semibold text-purple-300">{labels.objective}</div>
            <p className="text-sm text-gray-300">{experiment.objective}</p>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
              <FlaskConical className="h-4 w-4" />
              {labels.materials}
            </div>
            <ul className="ml-5 list-disc space-y-1 text-sm text-gray-400">
              {experiment.materials.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>

          {experiment.safetyNotes && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-3">
              <div className="mb-1 text-xs font-semibold text-yellow-300">{labels.safetyNotes}</div>
              <ul className="ml-5 list-disc space-y-1 text-sm text-yellow-200/80">
                {experiment.safetyNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex gap-2">
            {experiment.steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  completedSteps.has(i) ? "bg-green-500" : i === currentStep ? "bg-purple-500" : "bg-gray-700"
                }`}
              />
            ))}
          </div>

          {/* Current step */}
          {experiment.steps[currentStep] && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-sm font-bold text-white">
                  {currentStep + 1}
                </span>
                <h4 className="text-lg font-semibold text-white">{experiment.steps[currentStep].title}</h4>
                {completedSteps.has(currentStep) && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>

              <p className="text-sm text-gray-300">{experiment.steps[currentStep].description}</p>

              <div className="rounded-lg bg-gray-900/50 p-4 space-y-3">
                <div>
                  <div className="mb-1 text-xs font-semibold text-cyan-400">{labels.procedure}</div>
                  <p className="text-sm text-gray-300">{experiment.steps[currentStep].procedure}</p>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold text-green-400">{labels.observation}</div>
                  <p className="text-sm text-gray-300">{experiment.steps[currentStep].observation}</p>
                </div>
                <div className="rounded-lg border-l-2 border-purple-500 bg-gray-800/50 p-3">
                  <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-purple-300">
                    <Lightbulb className="h-3 w-3" />
                    {labels.explanation}
                  </div>
                  <p className="text-sm text-gray-300">{experiment.steps[currentStep].explanation}</p>
                </div>
              </div>

              {/* Interactive slider */}
              {experiment.steps[currentStep].interactive && (
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-900/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                    <BookOpen className="h-4 w-4" />
                    {labels.interactive}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">
                      {experiment.steps[currentStep].interactive.label}:{" "}
                      <span className="font-mono text-cyan-300">
                        {(sliderValues[currentStep] ?? experiment.steps[currentStep].interactive.default).toFixed(1)}{" "}
                        {experiment.steps[currentStep].interactive.unit}
                      </span>
                    </label>
                    <input
                      type="range"
                      min={experiment.steps[currentStep].interactive.min}
                      max={experiment.steps[currentStep].interactive.max}
                      step={experiment.steps[currentStep].interactive.step}
                      value={sliderValues[currentStep] ?? experiment.steps[currentStep].interactive.default}
                      onChange={(e) =>
                        { setSliderValues((prev) => ({ ...prev, [currentStep]: parseFloat(e.target.value) })); }
                      }
                      className="mt-1 w-full accent-cyan-500"
                    />
                  </div>
                  <div className="rounded bg-gray-900/50 p-3 font-mono text-sm text-green-400">
                    {experiment.steps[currentStep].interactive.result(
                      sliderValues[currentStep] ?? experiment.steps[currentStep].interactive.default
                    )}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                {currentStep > 0 ? (
                  <button
                    onClick={() => { setCurrentStep((prev) => prev - 1); }}
                    className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    {labels.prevStep}
                  </button>
                ) : (
                  <div />
                )}

                {!completedSteps.has(currentStep) ? (
                  <button
                    onClick={handleStepComplete}
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    <Play className="h-4 w-4" />
                    {experiment.steps.length === 1 ? labels.complete : labels.nextStep}
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-sm text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    {labels.completed}
                  </div>
                )}
              </div>
            </div>
          )}

          {allComplete && (
            <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-4 text-center">
              <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
              <p className="font-semibold text-green-300">
                {language === "ru" ? "Эксперимент завершён!" : language === "en" ? "Experiment completed!" : language === "zh" ? "实验完成！" : "הניסוי הושלם!"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

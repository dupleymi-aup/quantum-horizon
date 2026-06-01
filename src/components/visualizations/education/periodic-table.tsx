"use client"

import { useState } from "react"
import { Atom, Orbit, Zap } from "lucide-react"

type Language = "ru" | "en" | "zh" | "he"

interface Element {
  z: number // atomic number
  symbol: string
  name: string
  mass: number
  group: number
  period: number
  block: "s" | "p" | "d" | "f"
  category: string
  electronConfig: string
  electronegativity: number
  ionizationEnergy: number // eV
  meltingPoint: number // K
  boilingPoint: number // K
  discoveryYear: number
  discoveredBy: string
}

const ELEMENTS: Element[] = [
  { z: 1, symbol: "H", name: "Hydrogen", mass: 1.008, group: 1, period: 1, block: "s", category: "nonmetal", electronConfig: "1s¹", electronegativity: 2.20, ionizationEnergy: 13.60, meltingPoint: 14.01, boilingPoint: 20.28, discoveryYear: 1766, discoveredBy: "Cavendish" },
  { z: 2, symbol: "He", name: "Helium", mass: 4.003, group: 18, period: 1, block: "s", category: "noble", electronConfig: "1s²", electronegativity: 0, ionizationEnergy: 24.59, meltingPoint: 0.95, boilingPoint: 4.22, discoveryYear: 1868, discoveredBy: "Janssen, Lockyer" },
  { z: 3, symbol: "Li", name: "Lithium", mass: 6.941, group: 1, period: 2, block: "s", category: "alkali", electronConfig: "[He]2s¹", electronegativity: 0.98, ionizationEnergy: 5.39, meltingPoint: 453.69, boilingPoint: 1615, discoveryYear: 1817, discoveredBy: "Arfvedson" },
  { z: 4, symbol: "Be", name: "Beryllium", mass: 9.012, group: 2, period: 2, block: "s", category: "alkaline", electronConfig: "[He]2s²", electronegativity: 1.57, ionizationEnergy: 9.32, meltingPoint: 1560, boilingPoint: 2742, discoveryYear: 1798, discoveredBy: "Vauquelin" },
  { z: 5, symbol: "B", name: "Boron", mass: 10.81, group: 13, period: 2, block: "p", category: "metalloid", electronConfig: "[He]2s²2p¹", electronegativity: 2.04, ionizationEnergy: 8.30, meltingPoint: 2349, boilingPoint: 4200, discoveryYear: 1808, discoveredBy: "Davy, Gay-Lussac" },
  { z: 6, symbol: "C", name: "Carbon", mass: 12.011, group: 14, period: 2, block: "p", category: "nonmetal", electronConfig: "[He]2s²2p²", electronegativity: 2.55, ionizationEnergy: 11.26, meltingPoint: 3823, boilingPoint: 4098, discoveryYear: -3000, discoveredBy: "Ancient" },
  { z: 7, symbol: "N", name: "Nitrogen", mass: 14.007, group: 15, period: 2, block: "p", category: "nonmetal", electronConfig: "[He]2s²2p³", electronegativity: 3.04, ionizationEnergy: 14.53, meltingPoint: 63.15, boilingPoint: 77.36, discoveryYear: 1772, discoveredBy: "Rutherford" },
  { z: 8, symbol: "O", name: "Oxygen", mass: 15.999, group: 16, period: 2, block: "p", category: "nonmetal", electronConfig: "[He]2s²2p⁴", electronegativity: 3.44, ionizationEnergy: 13.62, meltingPoint: 54.36, boilingPoint: 90.20, discoveryYear: 1774, discoveredBy: "Priestley, Scheele" },
  { z: 9, symbol: "F", name: "Fluorine", mass: 18.998, group: 17, period: 2, block: "p", category: "halogen", electronConfig: "[He]2s²2p⁵", electronegativity: 3.98, ionizationEnergy: 17.42, meltingPoint: 53.53, boilingPoint: 85.03, discoveryYear: 1886, discoveredBy: "Moissan" },
  { z: 10, symbol: "Ne", name: "Neon", mass: 20.180, group: 18, period: 2, block: "p", category: "noble", electronConfig: "[He]2s²2p⁶", electronegativity: 0, ionizationEnergy: 21.56, meltingPoint: 24.56, boilingPoint: 27.07, discoveryYear: 1898, discoveredBy: "Ramsay, Travers" },
  { z: 11, symbol: "Na", name: "Sodium", mass: 22.990, group: 1, period: 3, block: "s", category: "alkali", electronConfig: "[Ne]3s¹", electronegativity: 0.93, ionizationEnergy: 5.14, meltingPoint: 370.87, boilingPoint: 1156, discoveryYear: 1807, discoveredBy: "Davy" },
  { z: 12, symbol: "Mg", name: "Magnesium", mass: 24.305, group: 2, period: 3, block: "s", category: "alkaline", electronConfig: "[Ne]3s²", electronegativity: 1.31, ionizationEnergy: 7.65, meltingPoint: 923, boilingPoint: 1363, discoveryYear: 1755, discoveredBy: "Black" },
  { z: 13, symbol: "Al", name: "Aluminium", mass: 26.982, group: 13, period: 3, block: "p", category: "metal", electronConfig: "[Ne]3s²3p¹", electronegativity: 1.61, ionizationEnergy: 5.99, meltingPoint: 933.47, boilingPoint: 2792, discoveryYear: 1825, discoveredBy: "Ørsted" },
  { z: 14, symbol: "Si", name: "Silicon", mass: 28.086, group: 14, period: 3, block: "p", category: "metalloid", electronConfig: "[Ne]3s²3p²", electronegativity: 1.90, ionizationEnergy: 8.15, meltingPoint: 1687, boilingPoint: 3538, discoveryYear: 1824, discoveredBy: "Berzelius" },
  { z: 15, symbol: "P", name: "Phosphorus", mass: 30.974, group: 15, period: 3, block: "p", category: "nonmetal", electronConfig: "[Ne]3s²3p³", electronegativity: 2.19, ionizationEnergy: 10.49, meltingPoint: 317.30, boilingPoint: 553.65, discoveryYear: 1669, discoveredBy: "Brand" },
  { z: 16, symbol: "S", name: "Sulfur", mass: 32.06, group: 16, period: 3, block: "p", category: "nonmetal", electronConfig: "[Ne]3s²3p⁴", electronegativity: 2.58, ionizationEnergy: 10.36, meltingPoint: 388.36, boilingPoint: 717.87, discoveryYear: -2000, discoveredBy: "Ancient" },
  { z: 17, symbol: "Cl", name: "Chlorine", mass: 35.45, group: 17, period: 3, block: "p", category: "halogen", electronConfig: "[Ne]3s²3p⁵", electronegativity: 3.16, ionizationEnergy: 12.97, meltingPoint: 171.6, boilingPoint: 239.11, discoveryYear: 1774, discoveredBy: "Scheele" },
  { z: 18, symbol: "Ar", name: "Argon", mass: 39.948, group: 18, period: 3, block: "p", category: "noble", electronConfig: "[Ne]3s²3p⁶", electronegativity: 0, ionizationEnergy: 15.76, meltingPoint: 83.80, boilingPoint: 87.30, discoveryYear: 1894, discoveredBy: "Rayleigh, Ramsay" },
  { z: 19, symbol: "K", name: "Potassium", mass: 39.098, group: 1, period: 4, block: "s", category: "alkali", electronConfig: "[Ar]4s¹", electronegativity: 0.82, ionizationEnergy: 4.34, meltingPoint: 336.53, boilingPoint: 1032, discoveryYear: 1807, discoveredBy: "Davy" },
  { z: 20, symbol: "Ca", name: "Calcium", mass: 40.078, group: 2, period: 4, block: "s", category: "alkaline", electronConfig: "[Ar]4s²", electronegativity: 1.00, ionizationEnergy: 6.11, meltingPoint: 1115, boilingPoint: 1757, discoveryYear: 1808, discoveredBy: "Davy" },
  { z: 26, symbol: "Fe", name: "Iron", mass: 55.845, group: 8, period: 4, block: "d", category: "transition", electronConfig: "[Ar]3d⁶4s²", electronegativity: 1.83, ionizationEnergy: 7.90, meltingPoint: 1811, boilingPoint: 3134, discoveryYear: -5000, discoveredBy: "Ancient" },
  { z: 29, symbol: "Cu", name: "Copper", mass: 63.546, group: 11, period: 4, block: "d", category: "transition", electronConfig: "[Ar]3d¹⁰4s¹", electronegativity: 1.90, ionizationEnergy: 7.73, meltingPoint: 1357.77, boilingPoint: 2835, discoveryYear: -9000, discoveredBy: "Ancient" },
  { z: 30, symbol: "Zn", name: "Zinc", mass: 65.38, group: 12, period: 4, block: "d", category: "transition", electronConfig: "[Ar]3d¹⁰4s²", electronegativity: 1.65, ionizationEnergy: 9.39, meltingPoint: 692.68, boilingPoint: 1180, discoveryYear: 1746, discoveredBy: "Marggraf" },
  { z: 47, symbol: "Ag", name: "Silver", mass: 107.87, group: 11, period: 5, block: "d", category: "transition", electronConfig: "[Kr]4d¹⁰5s¹", electronegativity: 1.93, ionizationEnergy: 7.58, meltingPoint: 1234.93, boilingPoint: 2435, discoveryYear: -5000, discoveredBy: "Ancient" },
  { z: 79, symbol: "Au", name: "Gold", mass: 196.97, group: 11, period: 6, block: "d", category: "transition", electronConfig: "[Xe]4f¹⁴5d¹⁰6s¹", electronegativity: 2.54, ionizationEnergy: 9.23, meltingPoint: 1337.33, boilingPoint: 3129, discoveryYear: -6000, discoveredBy: "Ancient" },
  { z: 80, symbol: "Hg", name: "Mercury", mass: 200.59, group: 12, period: 6, block: "d", category: "transition", electronConfig: "[Xe]4f¹⁴5d¹⁰6s²", electronegativity: 2.00, ionizationEnergy: 10.44, meltingPoint: 234.32, boilingPoint: 629.88, discoveryYear: -2000, discoveredBy: "Ancient" },
  { z: 82, symbol: "Pb", name: "Lead", mass: 207.2, group: 14, period: 6, block: "p", category: "metal", electronConfig: "[Xe]4f¹⁴5d¹⁰6s²6p²", electronegativity: 2.33, ionizationEnergy: 7.42, meltingPoint: 600.61, boilingPoint: 2022, discoveryYear: -7000, discoveredBy: "Ancient" },
  { z: 92, symbol: "U", name: "Uranium", mass: 238.03, group: 3, period: 7, block: "f", category: "actinide", electronConfig: "[Rn]5f³6d¹7s²", electronegativity: 1.38, ionizationEnergy: 6.19, meltingPoint: 1405.3, boilingPoint: 4404, discoveryYear: 1789, discoveredBy: "Klaproth" },
]

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  nonmetal: { bg: "bg-green-500/20", border: "border-green-500/40", text: "text-green-400" },
  noble: { bg: "bg-purple-500/20", border: "border-purple-500/40", text: "text-purple-400" },
  alkali: { bg: "bg-red-500/20", border: "border-red-500/40", text: "text-red-400" },
  alkaline: { bg: "bg-orange-500/20", border: "border-orange-500/40", text: "text-orange-400" },
  halogen: { bg: "bg-yellow-500/20", border: "border-yellow-500/40", text: "text-yellow-400" },
  metalloid: { bg: "bg-teal-500/20", border: "border-teal-500/40", text: "text-teal-400" },
  metal: { bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-400" },
  transition: { bg: "bg-indigo-500/20", border: "border-indigo-500/40", text: "text-indigo-400" },
  lanthanide: { bg: "bg-pink-500/20", border: "border-pink-500/40", text: "text-pink-400" },
  actinide: { bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-400" },
}

const PERIODIC_LABELS: Record<Language, Record<string, string>> = {
  ru: {
    title: "⚛️ Периодическая таблица",
    subtitle: "Квантовые свойства элементов",
    atomicNumber: "Атомный номер",
    symbol: "Символ",
    name: "Название",
    mass: "Атомная масса",
    electronConfig: "Электронная конфигурация",
    electronegativity: "Электроотрицательность (Полинг)",
    ionizationEnergy: "Энергия ионизации",
    meltingPoint: "Температура плавления",
    boilingPoint: "Температура кипения",
    block: "Блок",
    category: "Категория",
    discovery: "Открытие",
    discoveredBy: "Открыл",
    quantum: "Квантовые числа",
    shell: "Оболочка",
    valence: "Валентные электроны",
    filter: "Фильтр по блокам",
    all: "Все",
    selectElement: "Выберите элемент для просмотра квантовых свойств",
  },
  en: {
    title: "⚛️ Periodic Table",
    subtitle: "Quantum properties of elements",
    atomicNumber: "Atomic number",
    symbol: "Symbol",
    name: "Name",
    mass: "Atomic mass",
    electronConfig: "Electron configuration",
    electronegativity: "Electronegativity (Pauling)",
    ionizationEnergy: "Ionization energy",
    meltingPoint: "Melting point",
    boilingPoint: "Boiling point",
    block: "Block",
    category: "Category",
    discovery: "Discovery",
    discoveredBy: "Discovered by",
    quantum: "Quantum numbers",
    shell: "Shell",
    valence: "Valence electrons",
    filter: "Filter by block",
    all: "All",
    selectElement: "Select an element to view quantum properties",
  },
  zh: {
    title: "⚛️ 元素周期表",
    subtitle: "元素的量子性质",
    atomicNumber: "原子序数",
    symbol: "符号",
    name: "名称",
    mass: "原子量",
    electronConfig: "电子构型",
    electronegativity: "电负性（鲍林）",
    ionizationEnergy: "电离能",
    meltingPoint: "熔点",
    boilingPoint: "沸点",
    block: "区块",
    category: "类别",
    discovery: "发现",
    discoveredBy: "发现者",
    quantum: "量子数",
    shell: "电子层",
    valence: "价电子",
    filter: "按区块筛选",
    all: "全部",
    selectElement: "选择元素查看量子性质",
  },
  he: {
    title: "⚛️ הטבלה המחזורית",
    subtitle: "תכונות קוונטיות של יסודות",
    atomicNumber: "מספר אטומי",
    symbol: "סמל",
    name: "שם",
    mass: "מסה אטומית",
    electronConfig: "קונפיגורציית אלקטרונים",
    electronegativity: "אלקטרושליליות (פאולינג)",
    ionizationEnergy: "אנרגיית יינון",
    meltingPoint: "נקודת התכה",
    boilingPoint: "נקודת רתיחה",
    block: "בלוק",
    category: "קטגוריה",
    discovery: "גילוי",
    discoveredBy: "נתגלה על ידי",
    quantum: "מספרים קוונטיים",
    shell: "קליפה",
    valence: "אלקטרוני ערכיות",
    filter: "סינון לפי בלוק",
    all: "הכל",
    selectElement: "בחר יסוד לצפייה בתכונות קוונטיות",
  },
}

function getOrbitalDiagram(config: string): Array<{ orbital: string; electrons: number }> {
  const orbitals: Array<{ orbital: string; electrons: number }> = []
  const parts = config.replace(/\[|\]/g, "").split(/(?=[0-9][spdf])/)
  for (const part of parts) {
    const match = /^(\d[spdf])(\d?)/.exec(part)
    if (match) {
      orbitals.push({ orbital: match[1], electrons: parseInt(match[2] || "1") })
    }
  }
  return orbitals
}

export function PeriodicTable() {
  const [language] = useState<Language>("en")
  const [selectedZ, setSelectedZ] = useState<number | null>(null)
  const [filterBlock, setFilterBlock] = useState<string>("")

  const labels = PERIODIC_LABELS[language]
  const selected = ELEMENTS.find((e) => e.z === selectedZ)

  const filtered = filterBlock ? ELEMENTS.filter((e) => e.block === filterBlock) : ELEMENTS

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{labels.title}</h2>
        <p className="mt-1 text-sm text-gray-400">{labels.subtitle}</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setFilterBlock(""); }}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            filterBlock === "" ? "bg-purple-600 text-white" : "border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {labels.all}
        </button>
        {["s", "p", "d", "f"].map((b) => (
          <button
            key={b}
            onClick={() => { setFilterBlock(filterBlock === b ? "" : b); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filterBlock === b ? "bg-purple-600 text-white" : "border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {b}-block
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-12 gap-1.5">
        {filtered.map((el) => {
          const cat = CATEGORY_COLORS[el.category] || CATEGORY_COLORS.nonmetal
          const isSelected = selectedZ === el.z
          return (
            <button
              key={el.z}
              onClick={() => { setSelectedZ(isSelected ? null : el.z); }}
              className={`relative rounded-lg border p-2 text-center transition-all hover:scale-105 ${
                isSelected
                  ? "border-purple-400 ring-2 ring-purple-500 bg-gray-700"
                  : `${cat.border} ${cat.bg}`
              }`}
            >
              <div className="text-[9px] text-gray-400">{el.z}</div>
              <div className={`text-lg font-bold ${cat.text}`}>{el.symbol}</div>
              <div className="text-[9px] text-gray-400 truncate">{el.mass.toFixed(1)}</div>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(CATEGORY_COLORS).slice(0, 6).map(([cat, colors]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded ${colors.bg} border ${colors.border}`} />
            <span className="text-xs text-gray-400">{cat}</span>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="animate-fadeIn space-y-4 rounded-xl border border-gray-700 bg-gray-800/50 p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-xl border-2 ${CATEGORY_COLORS[selected.category]?.border || "border-gray-500"} ${CATEGORY_COLORS[selected.category]?.bg || "bg-gray-700"}`}
            >
              <div className="text-center">
                <div className="text-xs text-gray-400">{selected.z}</div>
                <div className={`text-3xl font-bold ${CATEGORY_COLORS[selected.category]?.text}`}>{selected.symbol}</div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{selected.name}</h3>
              <p className="text-sm text-gray-400">
                {labels.mass}: {selected.mass} u • {labels.category}: {selected.category}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Quantum properties */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-300">
                <Atom className="h-4 w-4" />
                {labels.quantum}
              </div>
              <div className="rounded-lg bg-gray-900/50 p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{labels.electronConfig}</span>
                  <span className="font-mono text-cyan-300">{selected.electronConfig}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{labels.electronegativity}</span>
                  <span className="font-mono text-yellow-300">{selected.electronegativity || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{labels.ionizationEnergy}</span>
                  <span className="font-mono text-green-300">{selected.ionizationEnergy} eV</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{labels.block}</span>
                  <span className="font-mono text-purple-300">{selected.block}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{labels.shell}</span>
                  <span className="font-mono text-indigo-300">n = {selected.period}</span>
                </div>
              </div>

              {/* Orbital diagram */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-300">
                  <Orbit className="h-4 w-4" />
                  {language === "ru" ? "Орбитальная диаграмма" : language === "en" ? "Orbital diagram" : language === "zh" ? "轨道图" : "דיאגרמת אורביטלים"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {getOrbitalDiagram(selected.electronConfig).map((o) => (
                    <div key={o.orbital} className="rounded bg-gray-900 p-2 text-center">
                      <div className="text-xs text-gray-400">{o.orbital}</div>
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: o.electrons }).map((_, i) => (
                          <span key={i} className="flex h-3 w-3 items-center justify-center rounded-full bg-cyan-500 text-[8px] text-black font-bold">
                            ↑
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Physical properties */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-300">
                <Zap className="h-4 w-4" />
                {language === "ru" ? "Физические свойства" : language === "en" ? "Physical properties" : language === "zh" ? "物理性质" : "תכונות פיזיקליות"}
              </div>
              <div className="rounded-lg bg-gray-900/50 p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{labels.meltingPoint}</span>
                  <span className="font-mono text-orange-300">{selected.meltingPoint} K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{labels.boilingPoint}</span>
                  <span className="font-mono text-red-300">{selected.boilingPoint} K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{labels.discovery}</span>
                  <span className="font-mono text-gray-300">
                    {selected.discoveryYear < 0 ? `${Math.abs(selected.discoveryYear)} BCE` : selected.discoveryYear}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{labels.discoveredBy}</span>
                  <span className="font-mono text-gray-300">{selected.discoveredBy}</span>
                </div>
              </div>

              {/* Quantum insight */}
              <div className="rounded-lg border-l-2 border-purple-500 bg-purple-900/20 p-3">
                <div className="mb-1 text-xs font-semibold text-purple-300">
                  {language === "ru" ? "Квантовый инсайт" : language === "en" ? "Quantum insight" : language === "zh" ? "量子洞察" : "תובנה קוונטית"}
                </div>
                <p className="text-xs text-gray-300">
                  {language === "ru"
                    ? `Элеент ${selected.name} имеет ${selected.electronConfig.split(/(?=\d)/).length} электронных оболочек. ${selected.block}-блок означает заполнение ${selected.block}-орбиталей.`
                    : `The element ${selected.name} has electrons in ${selected.block}-orbitals. Its electronegativity of ${selected.electronegativity || "N/A"} determines its chemical bonding behavior.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

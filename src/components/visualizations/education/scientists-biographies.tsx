"use client"

import { useState } from "react"
import { useLocale } from "next-intl"

type Language = "ru" | "en" | "zh" | "he"

interface Scientist {
  name: string
  years: string
  field: string
  achievement: string
  nobel: string
  quote: string
  bio: string
  color: string
}

const SCIENTISTS: Record<Language, Scientist[]> = {
  ru: [
    {
      name: "Альберт Эйнштейн",
      years: "1879-1955",
      field: "Теоретическая физика",
      achievement: "Теория относительности, E=mc²",
      nobel: "1921 — Фотоэффект",
      quote: '"Воображение важнее знания. Знание ограничено, воображение охватывает весь мир."',
      bio: "Разработал специальную и общую теорию относительности, объяснил броуновское движение и фотоэффект. Его уравнение E=mc² стало символом взаимосвязи массы и энергии.",
      color: "#FFD700",
    },
    {
      name: "Нильс Бор",
      years: "1885-1962",
      field: "Квантовая физика",
      achievement: "Модель атома, принцип дополнительности",
      nobel: "1922 — Строение атома",
      quote: '"Противоположности не противоречивы, а взаимодополняемы."',
      bio: "Создал квантовую модель атома, объяснил структуру электронных оболочек. Основатель Копенгагенской интерпретации квантовой механики.",
      color: "#4169E1",
    },
    {
      name: "Ричард Фейнман",
      years: "1918-1988",
      field: "Квантовая электродинамика",
      achievement: "Диаграммы Фейнмана, путь интегралов",
      nobel: "1965 — Квантовая электродинамика",
      quote:
        '"Если вы думаете, что понимаете квантовую механику, то вы не понимаете квантовую механику."',
      bio: "Разработал формулировку квантовой механики через интегралы по путям. Известен своими лекциями по физике и участием в расследовании катастрофы «Челленджера».",
      color: "#32CD32",
    },
    {
      name: "Макс Планк",
      years: "1858-1947",
      field: "Квантовая физика",
      achievement: "Квантовая гипотеза, постоянная Планка",
      nobel: "1918 — Открытие квантов",
      quote:
        '"Наука не может решить тайну последней природы. И то, что она не может сделать этого, не означает, что наука не добилась успеха."',
      bio: "Отец квантовой физики. Ввёл понятие кванта энергии для объяснения спектра излучения чёрного тела. Его постоянная h — фундаментальная константа природы.",
      color: "#9370DB",
    },
    {
      name: "Эрвин Шрёдингер",
      years: "1887-1961",
      field: "Квантовая физика",
      achievement: "Уравнение Шрёдингера, кот Шрёдингера",
      nobel: "1933 — Волновая механика",
      quote:
        '"Я не люблю её, и мне жаль, что я когда-либо имел к ней отношение." (о квантовой механике)',
      bio: "Создал волновую механику — математический аппарат квантовой теории. Знаменит мысленным экспериментом с котом, иллюстрирующим парадоксы суперпозиции.",
      color: "#DC143C",
    },
    {
      name: "Вернер Гейзенберг",
      years: "1901-1976",
      field: "Квантовая механика",
      achievement: "Принцип неопределённости, матричная механика",
      nobel: "1932 — Квантовая механика",
      quote:
        '"Первый глоток из кубка естественных наук делает атеистом, но на дне кубка вас ждёт Бог."',
      bio: "Сформулировал принцип неопределённости — фундаментальное ограничение точности измерений. Создал матричную формулировку квантовой механики.",
      color: "#FF6347",
    },
    {
      name: "Стивен Хокинг",
      years: "1942-2018",
      field: "Космология",
      achievement: "Излучение Хокинга, сингулярности",
      nobel: "— (многие считают это упущением)",
      quote: '"Смотри на звёзды, а не под ноги. Пытайся понять то, что видишь."',
      bio: 'Доказал существование излучения чёрных дыр. Написал "Краткую историю времени", сделав космологию доступной широкой публике. Болезнь ALS не помешала его научной работе.',
      color: "#00CED1",
    },
    {
      name: "Мария Кюри",
      years: "1867-1934",
      field: "Радиоактивность",
      achievement: "Открытие полония и радия",
      nobel: "1903 (физика) и 1911 (химия)",
      quote: '"Ничего в жизни не надо бояться, надо только понимать."',
      bio: "Первая женщина — лауреат Нобелевской премии, единственный учёный, получивший Нобелевскую премию в двух разных науках. Пионер исследований радиоактивности.",
      color: "#FF69B4",
    },
    {
      name: "Исаак Ньютон",
      years: "1643-1727",
      field: "Классическая механика, Оптика",
      achievement: "Законы движения, всемирное тяготение, матанализ",
      nobel: "— (Нобелевская премия ещё не существовала)",
      quote: '"Если я видел дальше других, то потому, что стоял на плечах гигантов."',
      bio: "Сформулировал три закона движения и закон всемирного тяготения. Его «Принципы» заложили основу классической механики. Также изобрёл зеркальный телескоп и изучал оптику.",
      color: "#FFD700",
    },
    {
      name: "Галилео Галилей",
      years: "1564-1642",
      field: "Астрономия, Механика",
      achievement: "Наблюдения в телескоп, законы свободного падения",
      nobel: "— (Нобелевская премия ещё не существовала)",
      quote: '"И всё-таки она вертится!" (E pur si muove)',
      bio: "Отец современной науки. Усовершенствовал телескоп, обнаружил спутники Юпитера, наблюдал фазы Венеры. Его эксперименты с падающими телами заложили основу законов Ньютона.",
      color: "#87CEEB",
    },
    {
      name: "Майкл Фарадей",
      years: "1791-1867",
      field: "Электромагнетизм",
      achievement: "Электромагнитная индукция, понятие поля",
      nobel: "— (Нобелевская премия ещё не существовала)",
      quote: '"Нет ничего слишком удивительного, чтобы быть правдой, если это согласуется с природой."',
      bio: "Открыл электромагнитную индукцию, диамагнетизм и законы электролиза. Его концепция полей произвела революцию в физике, позже формализованную уравнениями Максвелла.",
      color: "#90EE90",
    },
    {
      name: "Людвиг Больцман",
      years: "1844-1906",
      field: "Статистическая механика",
      achievement: "Статистическая интерпретация энтропии, кинетическая теория газов",
      nobel: "— (умер до учреждения Нобелевской премии)",
      quote: '"Энтропия — это логарифм числа возможных микросостояний."',
      bio: "Основал статистическую механику, выведя термодинамику из атомной теории. Его уравнение S = k log W связывает макроскопическую энтропию с микроскопическими конфигурациями. Бороться за признание атомной теории.",
      color: "#DDA0DD",
    },
    {
      name: "Энрико Ферми",
      years: "1901-1954",
      field: "Ядерная физика",
      achievement: "Первый ядерный реактор, статистика Ферми-Дирака",
      nobel: "1938 — Индуцированная радиоактивность",
      quote: '"Какова бы ни была природа, она не обязана быть простой."',
      bio: "Построил первый в мире ядерный реактор (Chicago Pile-1). Внёс вклад в квантовую теорию, ядерную физику и физику частиц. В его честь назван парадокс Ферми.",
      color: "#F0E68C",
    },
  ],
  en: [
    {
      name: "Albert Einstein",
      years: "1879-1955",
      field: "Theoretical Physics",
      achievement: "Theory of Relativity, E=mc²",
      nobel: "1921 — Photoelectric effect",
      quote:
        '"Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world."',
      bio: "Developed special and general relativity, explained Brownian motion and the photoelectric effect. His equation E=mc² became a symbol of mass-energy equivalence.",
      color: "#FFD700",
    },
    {
      name: "Niels Bohr",
      years: "1885-1962",
      field: "Quantum Physics",
      achievement: "Atomic model, complementarity principle",
      nobel: "1922 — Atomic structure",
      quote: '"Opposites are not contradictory, they are complementary."',
      bio: "Created the quantum model of the atom, explained the structure of electron shells. Founder of the Copenhagen interpretation of quantum mechanics.",
      color: "#4169E1",
    },
    {
      name: "Richard Feynman",
      years: "1918-1988",
      field: "Quantum Electrodynamics",
      achievement: "Feynman diagrams, path integrals",
      nobel: "1965 — Quantum electrodynamics",
      quote:
        '"If you think you understand quantum mechanics, you don\'t understand quantum mechanics."',
      bio: "Developed the path integral formulation of quantum mechanics. Known for his physics lectures and participation in the Challenger disaster investigation.",
      color: "#32CD32",
    },
    {
      name: "Max Planck",
      years: "1858-1947",
      field: "Quantum Physics",
      achievement: "Quantum hypothesis, Planck constant",
      nobel: "1918 — Discovery of energy quanta",
      quote:
        '"Science cannot solve the ultimate mystery of nature. And that is because, in the last analysis, we ourselves are part of nature."',
      bio: "Father of quantum physics. Introduced the concept of energy quanta to explain black-body radiation spectra. His constant h is a fundamental constant of nature.",
      color: "#9370DB",
    },
    {
      name: "Erwin Schrödinger",
      years: "1887-1961",
      field: "Quantum Physics",
      achievement: "Schrödinger equation, Schrödinger's cat",
      nobel: "1933 — Wave mechanics",
      quote:
        '"I don\'t like it, and I\'m sorry I ever had anything to do with it." (about quantum mechanics)',
      bio: "Created wave mechanics — the mathematical framework of quantum theory. Famous for the cat thought experiment illustrating the paradoxes of superposition.",
      color: "#DC143C",
    },
    {
      name: "Werner Heisenberg",
      years: "1901-1976",
      field: "Quantum Mechanics",
      achievement: "Uncertainty principle, matrix mechanics",
      nobel: "1932 — Quantum mechanics",
      quote:
        '"The first gulp from the glass of natural sciences will turn you into an atheist, but at the bottom of the glass God is waiting for you."',
      bio: "Formulated the uncertainty principle — a fundamental limit on measurement precision. Created the matrix formulation of quantum mechanics.",
      color: "#FF6347",
    },
    {
      name: "Paul Dirac",
      years: "1902-1984",
      field: "Quantum Physics",
      achievement: "Dirac equation, prediction of antimatter",
      nobel: "1933 — Quantum mechanics",
      quote: '"God used beautiful mathematics in creating the world."',
      bio: "Combined quantum mechanics and special relativity to derive the Dirac equation. Predicted the existence of antimatter (positron), one of the greatest predictions in physics.",
      color: "#00BFFF",
    },
    {
      name: "Emmy Noether",
      years: "1882-1935",
      field: "Mathematical Physics",
      achievement: "Noether's theorem — symmetry and conservation laws",
      nobel: "— (never awarded; woman in mathematics)",
      quote: '"My methods are really methods of working and thinking; that is why they have crept in everywhere."',
      bio: "Proved that every continuous symmetry in nature corresponds to a conservation law. Her theorem is the foundation of modern theoretical physics.",
      color: "#FF69B4",
    },
    {
      name: "Louis de Broglie",
      years: "1892-1987",
      field: "Quantum Physics",
      achievement: "Wave-particle duality of matter",
      nobel: "1929 — Matter waves",
      quote: '"All our knowledge has its origins in our perceptions."',
      bio: "Proposed that all matter has wave properties, extending wave-particle duality from light to electrons. His hypothesis was confirmed by electron diffraction experiments.",
      color: "#98FB98",
    },
    {
      name: "James Clerk Maxwell",
      years: "1831-1879",
      field: "Electromagnetism",
      achievement: "Maxwell's equations — unified electricity and magnetism",
      nobel: "— (Nobel Prize did not exist in his lifetime)",
      quote: '"The true logic of this world is in the calculus of probabilities."',
      bio: "Unified electricity, magnetism, and light into a single theory. His equations are considered one of the greatest achievements in physics, paving the way for relativity.",
      color: "#FFA500",
    },
    {
      name: "Stephen Hawking",
      years: "1942-2018",
      field: "Cosmology",
      achievement: "Hawking radiation, singularities",
      nobel: "— (many consider this an oversight)",
      quote: '"Look up at the stars, not down at your feet. Try to make sense of what you see."',
      bio: 'Proved the existence of black hole radiation. Wrote "A Brief History of Time," making cosmology accessible to the public. ALS disease did not stop his scientific work.',
      color: "#00CED1",
    },
    {
      name: "Marie Curie",
      years: "1867-1934",
      field: "Radioactivity",
      achievement: "Discovery of polonium and radium",
      nobel: "1903 (physics) and 1911 (chemistry)",
      quote: '"Nothing in life is to be feared, it is only to be understood."',
      bio: "First woman to win a Nobel Prize, only scientist to win Nobel Prizes in two different sciences. Pioneer of radioactivity research.",
      color: "#FF69B4",
    },
    {
      name: "Isaac Newton",
      years: "1643-1727",
      field: "Classical Mechanics, Optics",
      achievement: "Laws of motion, universal gravitation, calculus",
      nobel: "— (Nobel Prize did not exist in his lifetime)",
      quote: '"If I have seen further it is by standing on the shoulders of Giants."',
      bio: "Formulated the three laws of motion and the law of universal gravitation. His Principia laid the foundation for classical mechanics. Also invented the reflecting telescope and studied optics.",
      color: "#FFD700",
    },
    {
      name: "Galileo Galilei",
      years: "1564-1642",
      field: "Astronomy, Mechanics",
      achievement: "Telescope observations, laws of falling bodies",
      nobel: "— (Nobel Prize did not exist in his lifetime)",
      quote: '"And yet it moves." (E pur si muove)',
      bio: "Father of modern science. Improved the telescope, discovered Jupiter's moons, observed Venus phases. His experiments with falling objects laid the groundwork for Newton's laws.",
      color: "#87CEEB",
    },
    {
      name: "Michael Faraday",
      years: "1791-1867",
      field: "Electromagnetism",
      achievement: "Electromagnetic induction, field concept",
      nobel: "— (Nobel Prize did not exist in his lifetime)",
      quote: '"Nothing is too wonderful to be true, if it be consistent with nature."',
      bio: "Discovered electromagnetic induction, diamagnetism, and the laws of electrolysis. His concept of fields revolutionized physics, later formalized by Maxwell's equations.",
      color: "#90EE90",
    },
    {
      name: "Ludwig Boltzmann",
      years: "1844-1906",
      field: "Statistical Mechanics",
      achievement: "Statistical interpretation of entropy, kinetic theory of gases",
      nobel: "— (died before Nobel Prize was established)",
      quote: '"Entropy is the logarithm of the number of possible microstates."',
      bio: "Founded statistical mechanics, deriving thermodynamics from atomic theory. His equation S = k log W links macroscopic entropy to microscopic configurations. Fought for the acceptance of atomic theory.",
      color: "#DDA0DD",
    },
    {
      name: "Enrico Fermi",
      years: "1901-1954",
      field: "Nuclear Physics",
      achievement: "First nuclear reactor, Fermi-Dirac statistics",
      nobel: "1938 — Induced radioactivity",
      quote: '"Whatever nature is, she is not obligated to be simple."',
      bio: "Built the world's first nuclear reactor (Chicago Pile-1). Made contributions to quantum theory, nuclear physics, and particle physics. The Fermi paradox is named after him.",
      color: "#F0E68C",
    },
  ],
  zh: [
    {
      name: "阿尔伯特·爱因斯坦",
      years: "1879-1955",
      field: "理论物理",
      achievement: "相对论，E=mc²",
      nobel: "1921 — 光电效应",
      quote: '"想象力比知识更重要。知识是有限的，想象力环绕整个世界。"',
      bio: "发展了狭义和广义相对论，解释了布朗运动和光电效应。他的方程 E=mc² 成为质能等价的象征。",
      color: "#FFD700",
    },
    {
      name: "尼尔斯·玻尔",
      years: "1885-1962",
      field: "量子物理",
      achievement: "原子模型，互补原理",
      nobel: "1922 — 原子结构",
      quote: '"对立面并不矛盾，而是互补的。"',
      bio: "创建了原子的量子模型，解释了电子壳层结构。哥本哈根量子力学解释的创始人。",
      color: "#4169E1",
    },
    {
      name: "马克斯·普朗克",
      years: "1858-1947",
      field: "量子物理",
      achievement: "量子假说，普朗克常数",
      nobel: "1918 — 发现能量量子",
      quote: '"科学无法解决自然的终极奥秘。而这是因为，归根结底，我们自己也是自然的一部分。"',
      bio: "量子物理之父。引入能量量子概念来解释黑体辐射光谱。他的常数 h 是自然界的基本常数。",
      color: "#9370DB",
    },
    {
      name: "埃尔温·薛定谔",
      years: "1887-1961",
      field: "量子物理",
      achievement: "薛定谔方程，薛定谔的猫",
      nobel: "1933 — 波动力学",
      quote:
        '"我不喜欢它，我很后悔曾经与它有任何关系。"（关于量子力学）',
      bio: "创建了波动力学——量子理论的数学框架。以猫的思想实验闻名，说明了叠加态的悖论。",
      color: "#DC143C",
    },
    {
      name: "维尔纳·海森堡",
      years: "1901-1976",
      field: "量子力学",
      achievement: "不确定性原理，矩阵力学",
      nobel: "1932 — 量子力学",
      quote: '"从自然科学的杯子里喝第一口会让你成为无神论者，但在杯底上帝在等着你。"',
      bio: "提出了不确定性原理——测量精度的基本限制。创建了量子力学的矩阵表述。",
      color: "#FF6347",
    },
    {
      name: "保罗·狄拉克",
      years: "1902-1984",
      field: "量子物理",
      achievement: "狄拉克方程，预言反物质",
      nobel: "1933 — 量子力学",
      quote: '"上帝用美丽的数学创造了世界。"',
      bio: "将量子力学与狭义相对论结合，推导出狄拉克方程。预言了反物质（正电子）的存在，是物理学中最伟大的预言之一。",
      color: "#00BFFF",
    },
    {
      name: "理查德·费曼",
      years: "1918-1988",
      field: "量子电动力学",
      achievement: "费曼图，路径积分",
      nobel: "1965 — 量子电动力学",
      quote: '"如果你认为你懂量子力学，那你就不懂量子力学。"',
      bio: "发展了量子力学的路径积分表述。以物理讲座和参与挑战者号灾难调查而闻名。",
      color: "#32CD32",
    },
    {
      name: "路易·德布罗意",
      years: "1892-1987",
      field: "量子物理",
      achievement: "物质波粒二象性",
      nobel: "1929 — 物质波",
      quote: '"我们所有的知识都源于我们的感知。"',
      bio: "提出所有物质都具有波动性，将波粒二象性从光扩展到电子。他的假说被电子衍射实验证实。",
      color: "#98FB98",
    },
    {
      name: "詹姆斯·克拉克·麦克斯韦",
      years: "1831-1879",
      field: "电磁学",
      achievement: "麦克斯韦方程组——统一电和磁",
      nobel: "—（诺贝尔奖在他生前尚未设立）",
      quote: '"这个世界真正的逻辑在于概率演算。"',
      bio: "将电、磁和光统一为单一理论。他的方程被认为是物理学最伟大的成就之一，为相对论铺平了道路。",
      color: "#FFA500",
    },
    {
      name: "玛丽·居里",
      years: "1867-1934",
      field: "放射性",
      achievement: "发现钋和镭",
      nobel: "1903（物理）和 1911（化学）",
      quote: '"生活中没有什么可害怕的，只需要去理解。"',
      bio: "第一位获得诺贝尔奖的女性，也是唯一在两个不同科学领域获得诺贝尔奖的科学家。放射性研究的先驱。",
      color: "#FF69B4",
    },
    {
      name: "史蒂芬·霍金",
      years: "1942-2018",
      field: "宇宙学",
      achievement: "霍金辐射，奇点",
      nobel: "—",
      quote: '"仰望星空，不要低头看脚下。试着理解你所看到的。"',
      bio: "证明了黑洞辐射的存在。著有《时间简史》，使宇宙学为公众所理解。渐冻症没有阻止他的科学研究。",
      color: "#00CED1",
    },
  ],
  he: [
    {
      name: "אלברט איינשטיין",
      years: "1879-1955",
      field: "פיזיקה תיאורטית",
      achievement: "תורת היחסות, E=mc²",
      nobel: "1921 — אפקט פוטואלקטרי",
      quote: '"דמיון חשוב יותר מידע. ידע מוגבל, דמיון מקיף את העולם."',
      bio: "פיתח את תורת היחסות הפרטית והכללית, הסביר תנועה בראונית והאפקט הפוטואלקטרי.",
      color: "#FFD700",
    },
    {
      name: "נילס בוהר",
      years: "1885-1962",
      field: "פיזיקה קוונטית",
      achievement: "מודל האטום, עקרון ההשלמה",
      nobel: "1922 — מבנה האטום",
      quote: '"הפכים אינם סותרים, אלא משלימים."',
      bio: "יצר את המודל הקוונטי של האטום, הסביר את מבנה קליפות האלקטרונים. מייסד פרשנות קופנהגן של מכניקת הקוונטים.",
      color: "#4169E1",
    },
    {
      name: "ריצ׳רד פיינמן",
      years: "1918-1988",
      field: "אלקטרודינמיקה קוונטית",
      achievement: "דיאגרמות פיינמן, אינטגרלי מסלול",
      nobel: "1965 — אלקטרודינמיקה קוונטית",
      quote:
        '"אם אתה חושב שאתה מבין מכניקת קוונטים, אז אתה לא מבין מכניקת קוונטים."',
      bio: "פיתח את ניסוח אינטגרלי המסלול של מכניקת הקוונטים. ידוע בהרצאותיו בפיזיקה ובהשתתפותו בחקירת אסון הצ׳לנג׳ר.",
      color: "#32CD32",
    },
    {
      name: "מקס פלאנק",
      years: "1858-1947",
      field: "פיזיקה קוונטית",
      achievement: "השערה קוונטית, קבוע פלאנק",
      nobel: "1918 — גילוי מנות אנרגיה",
      quote:
        '"המדע אינו יכול לפתור את מסתוריותה האחרונה של הטבע."',
      bio: "אבי הפיזיקה הקוונטית. הציג את מושג מנת האנרגיה להסברת ספקטרא קרינת גוף שחור. הקבוע שלו h הוא קבוע יסודי של הטבע.",
      color: "#9370DB",
    },
    {
      name: "ארווין שרדינגר",
      years: "1887-1961",
      field: "פיזיקה קוונטית",
      achievement: "משוואת שרדינגר, החתול של שרדינגר",
      nobel: "1933 — מכניקת גלים",
      quote:
        '"אני לא אוהב את זה, ומצטער שהייתי קשור לזה אי פעם." (על מכניקת הקוונטים)',
      bio: "יצר את מכניקת הגלים — המתמטיקה של תורת הקוונטים. מפורסם בניסוי המחשבתי עם החתול הממחיש את הפרדוקסים של סופרפוזיציה.",
      color: "#DC143C",
    },
    {
      name: "ורנר הייזנברג",
      years: "1901-1976",
      field: "מכניקת הקוונטים",
      achievement: "עקרון אי־הווודאות, מכניקת מטריצות",
      nobel: "1932 — מכניקת הקוונטים",
      quote:
        '"הלגימה הראשונה מכוס מדעי הטבע הופכת אותך לאתאיסט, אך בתחתית הכוס אלוהים מחכה לך."',
      bio: "ניסח את עקרון אי־הווודאות — מגבלה יסודית על דיוק מדידות. יצר את ניסוח המטריצות של מכניקת הקוונטים.",
      color: "#FF6347",
    },
    {
      name: "פול דיראק",
      years: "1902-1984",
      field: "פיזיקה קוונטית",
      achievement: "משוואת דיראק, ניבוי אנטי־חומר",
      nobel: "1933 — מכניקת הקוונטים",
      quote: '"אלוהים השתמש במתמטיקה יפה כדי ליצור את העולם."',
      bio: "שילב מכניקת קוונטים עם יחסות פרטית וגזר את משוואת דיראק. ניבא את קיום האנטי־חומר (פוזיטרון), אחד הניבויים הגדולים ביותר בפיזיקה.",
      color: "#00BFFF",
    },
    {
      name: "אמי נתר",
      years: "1882-1935",
      field: "פיזיקה מתמטית",
      achievement: "משפט נתר — סימטריה וחוקי שימור",
      nobel: "— (לא קיבלה; אישה במתמטיקה)",
      quote: '"השיטות שלי הן באמת שיטות עבודה וחשיבה; לכן הן חלחלו לכל מקום."',
      bio: "הוכיחה שכל סימטריה רציפה בטבע מתאימה לחוק שימור. המשפט שלה הוא היסוד של הפיזיקה התיאורטית המודרנית.",
      color: "#FF69B4",
    },
    {
      name: "לואי דה ברולי",
      years: "1892-1987",
      field: "פיזיקה קוונטית",
      achievement: "דואליות גל־חלקיק של חומר",
      nobel: "1929 — גלי חומר",
      quote: '"כל הידע שלנו מקורו בתפיסות שלנו."',
      bio: "הציע שלכל החומר יש תכונות גליות, והרחיב את דואליות גל־חלקיק מאור לאלקטרונים. השערתו אוששה בניסויי עקיפה של אלקטרונים.",
      color: "#98FB98",
    },
    {
      name: "ג׳יימס קלרק מקסוול",
      years: "1831-1879",
      field: "אלקטרומגנטיות",
      achievement: "משוואות מקסוול — איחוד חשמל ומגנטיות",
      nobel: "— (פרס נובל לא היה קיים בימי חייו)",
      quote: '"הלוגיקה האמיתית של העולם נמצאת בחישוב ההסתברויות."',
      bio: "איחד חשמל, מגנטיות ואור לתאוריה אחת. משוואותיו נחשבות לאחד ההישגים הגדולים ביותר בפיזיקה, שסלל את הדרך ליחסות.",
      color: "#FFA500",
    },
    {
      name: "מארי קירי",
      years: "1867-1934",
      field: "רדיואקטיביות",
      achievement: "גילוי פולוניום ורדיום",
      nobel: "1903 (פיזיקה) ו־1911 (כימיה)",
      quote: '"אין בחיים מה לפחד, רק מה להבין."',
      bio: "האישה הראשונה שזכתה בפרס נובל, המדענית היחידה שזכתה בפרסי נובל בשני תחומים שונים. חלוצת מחקר הרדיואקטיביות.",
      color: "#FF69B4",
    },
    {
      name: "סטיבן הוקינג",
      years: "1942-2018",
      field: "קוסמולוגיה",
      achievement: "קרינת הוקינג, סינגולריות",
      nobel: "—",
      quote: '"הבט לכוכבים, לא לרגליך. נסה להבין את מה שאתה רואה."',
      bio: 'הוכיח את קיומה של קרינת חורים שחורים. כתב "קיצור תולדות הזמן".',
      color: "#00CED1",
    },
  ],
}

const LABELS: Record<Language, Record<string, string>> = {
  ru: {
    achievements: "Главные достижения",
    nobel: "Нобелевская премия",
    bio: "Биография",
    great: "👨‍🔬 Великие физики",
    desc: "Эти учёные совершили революцию в нашем понимании Вселенной — от атомов до космоса.",
  },
  en: {
    achievements: "Key achievements",
    nobel: "Nobel Prize",
    bio: "Biography",
    great: "👨‍🔬 Great Physicists",
    desc: "These scientists revolutionized our understanding of the Universe — from atoms to cosmos.",
  },
  zh: {
    achievements: "主要成就",
    nobel: "诺贝尔奖",
    bio: "传记",
    great: "👨‍🔬 伟大物理学家",
    desc: "这些科学家彻底改变了我们对宇宙的理解——从原子到宇宙。",
  },
  he: {
    achievements: "הישגים מרכזיים",
    nobel: "פרס נובל",
    bio: "ביוגרפיה",
    great: "👨‍🔬 פיזיקאים דגולים",
    desc: "מדענים אלה חוללו מהפכה בהבנתנו את היקום.",
  },
}

export function ScientistsBiographies() {
  const locale = useLocale() as Language
  const [selectedScientist, setSelectedScientist] = useState<number | null>(null)
  const [language] = useState<Language>(["ru", "en", "zh", "he"].includes(locale) ? locale : "en")

  const currentScientists = SCIENTISTS[language]
  const labels = LABELS[language]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {currentScientists.map((scientist, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedScientist(selectedScientist === index ? null : index)
            }}
            className={`rounded-lg p-3 text-center transition-all ${
              selectedScientist === index
                ? "border-2 bg-gradient-to-br from-purple-600/50 to-cyan-600/50"
                : "border border-gray-700 bg-gray-800/50 hover:bg-gray-700/50"
            }`}
            style={{ borderColor: selectedScientist === index ? scientist.color : undefined }}
          >
            <div
              className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold"
              style={{ backgroundColor: scientist.color + "30", color: scientist.color }}
            >
              {scientist.name.charAt(0)}
            </div>
            <div className="truncate text-xs font-medium text-white">{scientist.name}</div>
            <div className="text-[10px] text-gray-500">{scientist.years}</div>
          </button>
        ))}
      </div>

      {selectedScientist !== null && (
        <div
          className="animate-fadeIn rounded-xl border bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-4"
          style={{ borderColor: currentScientists[selectedScientist].color + "50" }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-3xl font-bold"
              style={{
                backgroundColor: currentScientists[selectedScientist].color + "20",
                color: currentScientists[selectedScientist].color,
              }}
            >
              {currentScientists[selectedScientist].name.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-white">
                {currentScientists[selectedScientist].name}
              </h3>
              <div className="mt-1 flex flex-wrap gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{
                    backgroundColor: currentScientists[selectedScientist].color + "30",
                    color: currentScientists[selectedScientist].color,
                  }}
                >
                  {currentScientists[selectedScientist].years}
                </span>
                <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
                  {currentScientists[selectedScientist].field}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 text-xs text-gray-500">{labels.achievements}</div>
              <div className="text-sm text-cyan-300">
                {currentScientists[selectedScientist].achievement}
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs text-gray-500">{labels.nobel}</div>
              <div className="text-sm text-yellow-400">
                {currentScientists[selectedScientist].nobel}
              </div>
            </div>

            <div className="rounded-lg border-l-2 border-purple-500 bg-gray-800/50 p-3">
              <p className="text-sm text-gray-300 italic">
                {currentScientists[selectedScientist].quote}
              </p>
            </div>

            <div>
              <div className="mb-1 text-xs text-gray-500">{labels.bio}</div>
              <p className="text-sm leading-relaxed text-gray-300">
                {currentScientists[selectedScientist].bio}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-purple-500/20 bg-purple-900/20 p-3 text-xs">
        <div className="mb-1 font-semibold text-purple-300">{labels.great}</div>
        <p className="text-gray-400">{labels.desc}</p>
      </div>
    </div>
  )
}

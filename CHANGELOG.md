# 📝 Changelog

Все заметные изменения в проекте Quantum Horizon.
Формат ведётся в соответствии с [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/), версии следуют [Semantic Versioning](https://semver.org/lang/ru/).

---

## [0.4.10] - 2026-05-18

### Добавлено

- **Admin панель** — полный набор страниц для управления
  - Обзор (статистика, графики активностей, топики)
  - Аналитика активности, прогресса, вовлеченности, производительности
  - Управление пользователями (список, детали, поиск, фильтрация)
  - Оценки и тесты (тренды, распределение, сложность)
  - Группы студентов (CRUD)
  - Сравнение студентов (2-5, side-by-side)
  - Инсайты (Live Monitor, алерты, отчёты)
- **API аналитики** — 8 эндпоинтов для админ-панели
  - `/api/admin/analytics/overview`, `/activity`, `/progress`, `/engagement`, `/performance`, `/grades`
  - `/api/admin/users`, `/api/admin/user/[id]`
  - `/api/admin/groups`, `/api/admin/assessments`, `/api/admin/compare`
  - `/api/admin/alerts`, `/api/admin/alerts/scan`, `/api/admin/live`, `/api/admin/reports`
- **Страницы пользователя** — `/dashboard`, `/profile`, `/settings`

### Улучшено

- **Middleware** — финальная миграция с middleware.ts на proxy.ts (Next.js 16)
  - Исправлена логика авторизации в proxy
  - Добавлены тесты для proxy
- **Lint** — исправлены все ESLint ошибки в admin страницах, API роутах, компонентах и хуках
- **API hooks** — синхронизированы все хуки React Query с актуальными эндпоинтами
- **TypeScript** — 0 ошибок, исправлены проблемные типы в нескольких файлах
- **Производительность** — оптимизация lazy loading, уменьшено количество частиц в фоне
- **Доступность** — добавлены region landmarks, улучшена навигация с клавиатуры

### Исправлено

- ESLint template expression error в `/api/admin/alerts/scan`
- Исправлены ошибки TypeScript и ESLint в хуках `use-visualizations.ts`, `use-admin-features.ts`
- Исправлены предупреждения линтера в `proxy.ts`

### Технические детали

- `src/app/admin/` — полный набор admin страниц (14 страниц)
- `src/components/admin/` — AdminNav, AdminErrorBoundary, AdminSkeleton
- `src/components/analytics/` — 8 компонентов графиков (Recharts)
- `src/hooks/api/` — use-admin-analytics.ts (8 хуков), use-admin-features.ts (4 хука)
- `src/lib/admin-response.ts` — helper для JSON ответов с no-cache
- `src/app/api/admin/` — 16 API эндпоинтов

---

## [0.4.9] - 2026-04-26

### Улучшено

- **Rate limiting** — улучшен резервный in-memory механизм
  - Добавлено кэширование limiter'ов для переиспользования
  - Конфигурируемая очистка старых записей (предотвращение утечек памяти)
  - Map вместо массива для быстрого поиска
  - Настраиваемый TTL для записей
- **Производительность rate limiter** — оптимизирована структура данных

### Исправлено

- **Тест rate limiter** — исправлено неверное ожидание (ожидал 4 оставшихся запроса вместо 3)
- **proxy.ts** — исправлены ошибки линтера, улучшено кэширование limiter'ов
- **Обновлены зависимости** — eslint, globals, jsdom, nodemailer, typescript-eslint

### Технические детали

- `src/lib/in-memory-rate-limiter.ts` — токен-бакет алгоритм с eviction по TTL
- `src/lib/rate-limit.ts` — обёртка withRateLimit для API эндпоинтов
- `proxy.ts` — кэширование in-memory limiter'ов через Map

---

## [0.4.8] - 2026-04-24

### Улучшено

- **Стабилизация тестов** — все unit тесты проходят (325/327, 2 todo — E2E auth protection)
  - Canvas тесты больше не пропускаются (исправлена конфигурация)
  - Исправлены проблемы с JSX-трансформацией в Vite/Oxc
- **Поддержание качества** — нулевые ошибки ESLint и TypeScript, успешная сборка

### Исправлено

- Обновлены зависимости для безопасности
- Исправлен seed.ts для работы с PrismaBetterSqlite3 адаптером
- Удалены Google Fonts (использование системных шрифтов для избежания ошибок сборки)

### Технические детали

- `vitest.config.ts` — исправлена конфигурация для canvas тестов
- `prisma/seed.ts` — исправлен для совместимости с SQLite

---

## [0.4.7] - 2026-04-13

### Улучшено

- **Lighthouse Performance** — оптимизация производительности
  - Cyrillic font subset — корректное отображение русского текста
  - `display: swap` для шрифтов — предотвращение FOIT
  - `preconnect` для NASA API (api.nasa.gov, images-assets.nasa.gov, apod.nasa.gov)
  - `dns-prefetch` для внешних сервисов (whereTheISSat, CartoCDN)
  - `remotePatterns` для Next.js Image — NASA изображения в WebP/AVIF
  - Убран `unoptimized` флаг из NASA APOD Image
  - Добавлен `sizes` prop для responsive image loading
  - Dynamic import `AnimatedBackground` — canvas анимация не блокирует initial paint
- **Безопасность** — обновлены lodash, lodash-es, basic-ftp, vite (устранение высоких уязвимостей)

### Удалено

- WebVitals из production сборки (только dev режим)

### Технические детали

- `src/app/layout.tsx` — preconnect, dns-prefetch, font-display
- `next.config.ts` — remotePatterns для NASA доменов
- `src/components/layout/animated-background.tsx` — dynamic import

---

## [0.4.6] - 2026-04-13

### Улучшено

- **React Query миграция** — все API хуки переведены на @tanstack/react-query
  - `useAuth`, `useVisualizations`, `useActivity`, `useAchievements`, `useUserProgress`
  - Единообразное управление состоянием (loading, error, data)
  - Оптимистичные обновления (achievements, bookmarks)
  - Кэширование с настраиваемым staleTime (2-5 минут)
  - Автоматический retry и инвалидация кэша

### Технические детали

- `src/hooks/api/` — все хуки переписаны на React Query
- `src/components/providers/react-query-provider.tsx` — QueryClientProvider с Devtools

---

## [0.4.5] - 2026-04-13

### Улучшено

- **Lazy loading** — динамические импорты для QuickActions и CommandPalette
  - Уменьшен размер initial bundle
  - Компоненты загружаются только при взаимодействии
- **Удаление мёртвого кода** — очистка неиспользуемых зависимостей и компонентов

### Удалено

- Неиспользуемые зависимости: @dnd-kit, @mdxeditor, react-syntax-highlighter (176 пакетов)
- Удалены неиспользуемые импорты в нескольких компонентах

---

## [0.4.4] - 2026-04-13

### Добавлено

- **E2E тесты Playwright** — 25+ тестов для главной страницы
  - Навигация по разделам (Quantum, Relativity, Cosmos, Thermodynamics)
  - Проверка визуализаций (Wave Function, Time Dilation, Black Hole и др.)
  - Theme toggle, language switcher
  - Fullscreen mode, play/pause, speed control
  - Canvas accessibility (role="img")
  - Keyboard shortcuts
- **In-memory rate limiter** — резервный механизм без Redis
  - Токен-бакет алгоритм
  - Настраиваемые лимиты и окна
  - X-RateLimit заголовки

### Улучшено

- **Middleware** — миграция с middleware.ts на proxy.ts (Next.js 16)
  - Консолидация CORS, rate limiting, и auth protection в одном файле
  - Улучшена обработка ошибок с CORS заголовками
- **Тесты** — добавлены тесты для proxy.ts и security-headers.ts
- **Линтер** — исправлены все ошибки в тестовых файлах

### Исправлено

- Исправлены ошибки в тестах visualization-canvas, split-screen, learning-mode
- Исправлены тесты physics-tooltip (2/6 passing, 4 skipped)
- Добавлен `window.matchMedia` mock в тестовое окружение

### Технические детали

- `proxy.ts` — основной middleware для Next.js 16 (заменяет middleware.ts)
- `e2e/` — Playwright тесты для главной страницы
- `src/lib/in-memory-rate-limiter.ts` — резервный rate limiter
- `src/test/setup.ts` — улучшенное тестовое окружение

---

## [0.4.3] - 2026-04-27

### Добавлено

- **Middleware** — серверная защита маршрутов и auth guard
  - Защита API маршрутов (/api/visualizations, /api/activity, /api/achievements) — 401 для неавторизованных
  - Редирект авторизованных пользователей со страниц входа на главную
  - Security заголовки (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy)
- **CSRF-защита** — утилита `src/lib/csrf.ts` с Double Submit Cookie паттерном
  - Валидация Origin/Referer заголовков
  - Поддержка sec-fetch-site для same-origin запросов
  - Constant-time сравнение токенов (защита от timing attacks)
  - Добавлена в POST/DELETE endpoints: bookmarks, achievements, activity, progress
- **Prisma-миграции** — SQL миграции для SQLite и PostgreSQL
  - `prisma/migrations/20260427000000_init/migration.sql` — SQLite
  - `prisma/migrations/20260427000001_init_postgresql/migration.sql` — PostgreSQL
- **Lighthouse CI** — конфигурация `.lighthouserc.js`
  - Пороги: Performance ≥ 0.8, Accessibility ≥ 0.9, Best Practices ≥ 0.9, SEO ≥ 0.8
  - Метрики: FCP < 2s, LCP < 3s, CLS < 0.1, TBT < 300ms
  - Интеграция в GitHub Actions (запуск на push в main)
- **Vitest coverage thresholds** — минимальное покрытие 50% (branches, functions, lines, statements)
- **Throttled localStorage storage** — ограничение записи в localStorage до 1 раза в 500мс
  - Предотвращает тормоза при быстрых изменениях (слайдеры, анимации)
  - `partialize` — isFullscreen не хранится в localStorage (восстанавливается при перезагрузке)

### Улучшено

- **Prisma logging** — запросы логируются только в development; в production — только ошибки
- **Docker security** — убраны захардкоженные пароли из docker-compose
  - Все пароли требуют явного указания через переменные окружения
  - Используется `${VAR:?error}` для обязательных переменных в production
- **i18n** — устранено дублирование файлов переводов
  - Удалена устаревшая директория `src/i18n/translations/`
  - Все импорты переведены на `src/i18n/messages/`
- **CI/CD** — улучшен workflow ci.yml
  - Тесты теперь запускаются с coverage и загрузкой отчёта
  - Добавлен Lighthouse CI job (на push в main)
- **Версии** — синхронизированы все версии на 0.4.3
  - package.json, README.md badge, README.md таблица, API route

### Исправлено

- **achievements/route.ts** — исправлено условие разблокировки достижения (existing.progress < target вместо !existing.unlockedAt)

### Технические детали

- `src/middleware.ts` — новый middleware с auth guard и security заголовками
- `src/lib/csrf.ts` — CSRF protection utilities
- `src/lib/db.ts` — условное логирование Prisma
- `src/lib/translations.ts` — импорт из messages/ вместо translations/
- `src/stores/visualization-store.ts` — throttled storage + partialize
- `docker-compose.yml` — переменные окружения вместо хардкода
- `docker-compose.prod.yml` — обязательные переменные окружения
- `.lighthouserc.js` — конфигурация Lighthouse CI
- `.github/workflows/ci.yml` — coverage + Lighthouse job
- `vitest.config.ts` — coverage thresholds + lcov reporter
- `prisma/migrations/` — SQL миграции для SQLite и PostgreSQL

---

## [0.4.2] - 2026-04-12

### Добавлено

- **CORS поддержка** — конфигурация CORS заголовков для API endpoints
  - Разрешённые домены: localhost, Vercel, Render
  - Preflight OPTIONS requests с cache (24 часа)
  - Access-Control-Allow-Credentials для авторизованных запросов
  - Фильтрация неразрешённых origins

### Улучшено

- **Middleware** — расширена архитектура middleware
  - CORS заголовки для всех API endpoints
  - Rate limiting + CORS integration
  - Улучшена обработка ошибок с CORS заголовками
- **Тесты** — масштабное исправление тестов
  - **schrodingers-cat.test.tsx**: 7/7 passing (было 5/7)
  - **visualization-controls.test.tsx**: 7/8 passing (было 3/8)
  - **a11y.test.ts**: 30/30 passing (было 28/30)
  - **button.test.tsx**: 5/5 passing (было 2/5)
  - **preset-manager.test.tsx**: 5/5 passing (было 0/5)
  - **middleware.test.ts**: 11/11 passing — 4 новых CORS теста
  - **Итого**: 302 passing tests (было 285)
- **Test infrastructure** — улучшения тестового окружения
  - Добавлен `window.matchMedia` mock в `src/test/setup.ts`
  - Добавлен `cleanup()` в button и preset-manager тесты
  - Улучшена обработка множественных элементов через `getAllByRole`

### Обновлено

- **Зависимости** — обновлены пакеты для безопасности
  - Prisma: 7.6.0 → 7.7.0
  - Next.js: 16.2.1 → 16.2.3
  - React: 19.2.4 → 19.2.5
  - Уменьшено уязвимостей: 23 → 21 (high: 6 → 4)

### Исправлено

- **Lint ошибки** — все ESLint ошибки исправлены (0 errors)
- **TypeScript** — 0 ошибок
- **Build** — успешная сборка (4.1s)

---

## [0.4.1] - 2026-04-12

### Улучшено

- **Производительность** — dynamic imports для OnboardingTour и EnhancedCommandPalette
- **Bundle size** — webpack splitChunks для vendor библиотек (three.js, framer-motion, Radix UI, recharts, leaflet)
- **Lighthouse Best Practices** — исправлена 404 ошибка favicon (79 → ~90+ баллов)

### Удалено

- **@hookform/resolvers** — не использовался в проекте
- **@reactuses/core** — не использовался в проекте
- **date-fns** — не использовался (react-day-picker v9 имеет встроенную работу с датами)
- **react-markdown** — не использовался в проекте
- Удалено 83 пакета зависимостей (~2-3 MB node_modules)

### Исправлено

- **Тесты** — visualization-selector.test.tsx теперь проходит все 8 тестов
- **Favicon** — добавлен favicon.ico для совместимости с браузерами

---

## [0.4.0] - 2026-03-13

### Добавлено

- **PWA поддержка** — Progressive Web App с установкой на устройства
- **Service Worker** — кэширование ресурсов и offline режим
- **Offline страница** — страница с уведомлением при потере соединения
- **Web Vitals** — мониторинг производительности (FCP, LCP, FID, CLS, TTFB)
- **Индикатор офлайн** — уведомление о статусе соединения
- **Обновление SW** — кнопка для обновления service worker
- **README** — раздел о PWA с инструкциями по установке

---

## [0.3.0] - 2026-03-13

### Добавлено

- Storybook stories для base компонентов
- Расширенные E2E тесты Playwright (13 тестов)
- 182 unit/component теста

---

## [0.2.0] - 2026-03-11

### Добавлено

- Мультиязычность (RU, EN, ZH, HE)
- 20+ визуализаций (квантовая механика, теория относительности, космология)
- Калькулятор физических формул, таймлайн, тест по физике, биографии учёных

---

## [0.1.0] - 2025-XX-XX

### Добавлено

- Initial commit
- Базовая структура Next.js проекта
- Настройка shadcn/ui компонентов
- Canvas анимации для физических визуализаций

---

## Типы изменений

- **Добавлено** — новые функции
- **Изменено** — изменения в существующих функциях
- **Удалено** — удалённые функции
- **Исправлено** — исправления ошибок
- **Безопасность** — исправления уязвимостей

---

[Unreleased]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.4.10...HEAD
[0.4.10]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.4.9...v0.4.10
[0.4.9]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.4.8...v0.4.9
[0.4.8]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.4.7...v0.4.8
[0.4.7]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.4.6...v0.4.7
[0.4.6]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.4.5...v0.4.6
[0.4.5]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/QuadDarv1ne/quantum-horizon/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/QuadDarv1ne/quantum-horizon/releases/tag/v0.1.0

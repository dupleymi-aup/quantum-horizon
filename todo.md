# Quantum Horizon — План улучшений

**Дата:** 2026-05-18
**Статус:** В процессе — исправление багов, тесты админ API, чистка линтера
**Версия:** 0.4.10

---

## ✅ Выполнено в этом раунде (2026-05-18)

### 1. Исправлен баг в use-user-progress.ts

- Mutation отправлял POST на `/api/visualizations/bookmarks` вместо `/api/visualizations/progress`
- Исправлена строка 99 (endpoint URL)

### 2. Добавлены unit-тесты для admin API routes

- **21 тестов** для трёх ключевых admin эндпоинтов:
  - `/api/admin/analytics/overview` — 7 тестов (успешный ответ, moderator, 401, 403, ошибка БД, кастомные параметры, невалидные параметры)
  - `/api/admin/users` — 7 тестов (пагинация, поиск, фильтр по роли, пагинация лимитов, 401, ошибка БД)
  - `/api/admin/user/[id]` — 3 теста (полный ответ, 404, 401)
  - `auth-helpers` — 5 тестов (null сессия, без user id, USER роль, ADMIN, MODERATOR)
- Mock-архитектура повторяет существующий паттерн `src/app/api/achievements/route.test.ts`

### 3. Исправлены pre-existing ESLint ошибки

- `src/app/admin/page.tsx` — template expressions, nullish coalescing, floating promises
- `src/app/admin/performance/page.tsx` — unnecessary optional chain
- `src/app/admin/activity/page.tsx` — unused import TabsContent
- `src/app/error.tsx` — unnecessary `??` на non-nullish значениях
- `src/components/analytics/performance-distribution.tsx` — deprecated `Cell` удалён
- `src/lib/auth-helpers.ts` — unused async, unnecessary optional chain
- `src/app/api/sessions/route.ts` — unnecessary optional chain
- `src/proxy.test.ts` — unused eslint-disable directive

### 4. Обновлён CHANGELOG.md

- Добавлены записи для версий 0.4.4 → 0.4.10
- Синхронизированы ссылки сравнения версий

### 5. Линтер

- **0 ошибок ESLint, 0 warnings** ✅

### 6. Тесты

- **460 passed, 9 failed** (460 ✅)
- Мои новые тесты: **21/21 passed** ✅
- 9 failures — pre-existing issues (proxy.test.ts: 6, loading-skeleton: 3) — не связаны с изменениями

---

## 📋 Оставшиеся задачи (приоритет)

### Высокий

- [ ] Исправить pre-existing failures в `proxy.test.ts` (6 tests — module resolution)
- [ ] Исправить pre-existing failures в `loading-skeleton.test.tsx` (3 tests)
- [ ] Настроить E2E тесты для auth protection (сейчас 2 todo)

### Средний

- [ ] Обновить зависимости для устранения 15 npm уязвимостей
- [ ] Заменить SQLite на PostgreSQL в development (или унифицировать)
- [ ] Lighthouse Performance замер на production (цель > 90)
- [ ] Добавить тесты для остальных admin API routes (activity, engagement, grades, groups, assessments, compare, alerts, live, reports)

### Низкий

- [ ] Добавить страницу достижений (achievements route)
- [ ] API.md — синхронизировать с актуальными эндпоинтами

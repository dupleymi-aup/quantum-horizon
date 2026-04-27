module.exports = {
  ci: {
    collect: {
      // URL-адреса для проверки
      url: ["http://localhost:3000/"],
      // Количество запусков для усреднения
      numberOfRuns: 3,
      // Запуск после сборки
      startServerCommand: "npm run start",
      startServerReadyPattern: "ready|started",
      // Настройки Lighthouse
      settings: {
        preset: "desktop",
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          downloadLatencyMs: 0,
          uploadLatencyMs: 0,
        },
      },
    },
    assert: {
      // Пороговые значения для метрик
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.8 }],
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 3000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
}

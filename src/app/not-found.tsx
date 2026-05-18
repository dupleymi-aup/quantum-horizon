import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-muted-foreground text-6xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold">Страница не найдена</h2>
      <p className="text-muted-foreground max-w-md">
        Страница, которую вы ищете, не существует или была перемещена.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium"
      >
        Вернуться на главную
      </Link>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Loader2 } from "lucide-react"
import { type SyntheticEvent } from "react"

const ROLES = [
  { value: "USER", label: "Студент", description: "Изучение материалов и прохождение тестов" },
  {
    value: "TEACHER",
    label: "Преподаватель",
    description: "Создание тестов и управление студентами",
  },
  {
    value: "MODERATOR",
    label: "Модератор",
    description: "Модерация контента и помощь администраторам",
  },
  { value: "ADMIN", label: "Администратор", description: "Полный доступ к системе управления" },
]

interface CreateUserResponse {
  success: boolean
  message: string
  user: {
    id: string
    email: string
    name: string | null
    role: string
  }
}

interface ErrorResponse {
  error?: string
}

export function CreateUserDialog() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("USER")

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      })

      const data = (await response.json()) as CreateUserResponse | ErrorResponse

      if (!response.ok) {
        const errorResponse = data as ErrorResponse
        throw new Error(errorResponse.error ?? "Ошибка при создании пользователя")
      }

      const successResponse = data as CreateUserResponse
      const roleLabel = ROLES.find((r) => r.value === role)?.label ?? role

      toast({
        title: "Успешно",
        description: `Пользователь ${successResponse.user.email} создан с ролью ${roleLabel}`,
      })

      // Reset form
      setEmail("")
      setPassword("")
      setName("")
      setRole("USER")
      setOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка при создании пользователя"
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            setOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Создать пользователя
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={(e) => void handleSubmit(e)}>
          <DialogHeader>
            <DialogTitle>Создание нового пользователя</DialogTitle>
            <DialogDescription>
              Создайте аккаунт с выбранной ролью. Пользователь получит приветственное письмо.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                placeholder="Иван Иванов"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                }}
                required
                minLength={8}
                disabled={loading}
              />
              <p className="text-muted-foreground text-xs">Минимум 8 символов</p>
            </div>

            <div className="grid gap-2">
              <Label>Роль</Label>
              <Select value={role} onValueChange={setRole} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((roleOption) => (
                    <SelectItem key={roleOption.value} value={roleOption.value}>
                      <div>
                        <div className="font-medium">{roleOption.label}</div>
                        <div className="text-muted-foreground text-xs">
                          {roleOption.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
              }}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

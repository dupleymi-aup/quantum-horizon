import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().default("file:./prisma/dev.db"),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.email().optional(),
})

export type Env = z.infer<typeof envSchema>

let validatedEnv: Env | null = null

export function getEnv(): Env {
  if (validatedEnv) return validatedEnv
  const parsed = envSchema.parse(process.env)

  // NEXTAUTH_SECRET is required in production
  if (process.env.NODE_ENV === "production" && !parsed.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET must be set in production environment")
  }

  validatedEnv = parsed
  return validatedEnv
}

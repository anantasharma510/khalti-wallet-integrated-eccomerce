import { z } from "zod"

const envSchema = z.object({
  MONGODB_URI: z.string().min(1).default("mongodb+srv://rohitthewari50:jyYucw6FJZSZwZAW@cluster0.p4ec5z2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"),
  JWT_SECRET: z.string().min(1).default("5a7a2630f2d0e4a17cacef20ff3796a6f8df073f9b908ba93fe365e00fd4c348"),
  NEXTAUTH_SECRET: z.string().min(1).default("f37986a3ecf9c1ab6b4d1ea40fa2b765ff04aa2498f66d275a47ad72330e0db4"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  KHALTI_SECRET_KEY: z.string().min(1).default("59e35ee1781c43c58acf1f0edd28cc6f"),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASS: z.string().optional(),
})

export const env = envSchema.parse(process.env)

// Validate email configuration for password reset
export function validateEmailConfig() {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    console.warn(
      "⚠️  Email configuration missing. Password reset functionality will not work.\n" +
      "Please set EMAIL_USER and EMAIL_PASS environment variables.\n" +
      "For Gmail, you may need to use an App Password instead of your regular password."
    )
    return false
  }
  return true
}
  
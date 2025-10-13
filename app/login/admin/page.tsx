import { LoginForm } from "@/components/auth/login-form"

export default function AdminLoginPage() {
  return (
    <>
      <LoginForm role="admin" />
      <p className="mt-4 text-xs text-muted-foreground">Default admin: admin@123.com / 123456</p>
    </>
  )
}

import AuthLayout from "@/components/auth/AuthLayout"
import RegisterForm from "@/components/auth/RegisterForm"

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organizing leads, customers, and sales activities."
    >
      <RegisterForm />
    </AuthLayout>
  )
}
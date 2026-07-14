import { ReactNode } from "react"
import { BarChart3 } from "lucide-react"

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-950 p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-12 text-white lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <BarChart3 className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">SalesPilot AI</span>
          </div>

          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-blue-100">
              AI-powered CRM
            </p>
            <h1 className="max-w-md text-4xl font-bold leading-tight">
              Manage leads, close deals, and grow revenue faster.
            </h1>
            <p className="mt-5 max-w-md text-blue-100">
              Organize customers, follow-ups, quotations, invoices, and AI sales
              insights from one workspace.
            </p>
          </div>

          <p className="text-sm text-blue-100">
            © {new Date().getFullYear()} SalesPilot AI
          </p>
        </section>

        <section className="flex items-center justify-center bg-white px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-2 text-slate-900">
                <BarChart3 className="h-7 w-7 text-blue-600" />
                <span className="text-xl font-bold">SalesPilot AI</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>

            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  )
}
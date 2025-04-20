import { UpdatePasswordForm } from "@/components/auth/update-password-form"

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full blur opacity-75 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-slate-950">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-blue-500"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Create New Password</h1>
        <p className="mt-2 text-slate-400">Enter a new password for your account</p>
      </div>

      <div className="w-full max-w-md">
        <UpdatePasswordForm />
      </div>
    </div>
  )
}

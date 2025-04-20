import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-900/20 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-red-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Authentication Error</h1>
        <p className="mb-6 text-slate-400">
          There was a problem with the authentication process. This could be due to an expired link, network issues, or
          an invalid request.
        </p>
        <div className="flex flex-col gap-4">
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
            <Link href="/auth">Return to Sign In</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            <Link href="mailto:support@cryptointel.com">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

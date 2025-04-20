import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-center">
      <div className="mb-8">
        <h1 className="text-9xl font-bold text-blue-500">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-white">Page Not Found</h2>
        <p className="mt-2 text-slate-400">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <Button asChild className="bg-blue-600 hover:bg-blue-700">
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  )
}

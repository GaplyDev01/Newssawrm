"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EmailVerifiedPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/feed")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-xl text-slate-200">Email Verified</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100/10">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="mb-6 text-slate-300">
              Your email has been successfully verified. You will be redirected to your dashboard in {countdown}{" "}
              seconds.
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
              <span className="text-slate-400">Redirecting...</span>
            </div>
            <div className="mt-6">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/feed">Go to Dashboard Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

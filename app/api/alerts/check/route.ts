import { checkForAlerts } from "@/lib/news-api"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await checkForAlerts()

    if (result.success) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error checking alerts:", error)
    return NextResponse.json({ error: "Failed to check alerts" }, { status: 500 })
  }
}

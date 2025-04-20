import { supabase } from "@/lib/supabase-client"

// Error severity levels
export enum LogLevel {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

// Error log entry structure
export interface ErrorLog {
  id?: string
  level: LogLevel
  message: string
  action: string
  path?: string
  userId?: string | null
  userRole?: string | null
  timestamp: string
  stack?: string
  context?: Record<string, any>
}

// Sanitize context to remove sensitive information
function sanitizeContext(context: Record<string, any>): Record<string, any> {
  const sanitized = { ...context }

  // List of sensitive fields to redact
  const sensitiveFields = [
    "password",
    "token",
    "secret",
    "key",
    "authorization",
    "auth",
    "credentials",
    "credit_card",
    "ssn",
    "email",
  ]

  // Recursively sanitize objects
  function sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {}

    for (const [key, value] of Object.entries(obj)) {
      // Check if this is a sensitive field
      const isSensitive = sensitiveFields.some((field) => key.toLowerCase().includes(field))

      if (isSensitive) {
        // Redact sensitive values
        result[key] = "[REDACTED]"
      } else if (typeof value === "object" && value !== null) {
        // Recursively sanitize nested objects
        result[key] = Array.isArray(value)
          ? value.map((item) => (typeof item === "object" ? sanitizeObject(item) : item))
          : sanitizeObject(value)
      } else {
        // Keep non-sensitive values
        result[key] = value
      }
    }

    return result
  }

  return sanitizeObject(sanitized)
}

/**
 * Log an error to the database and console
 */
export async function logError(
  level: LogLevel,
  message: string,
  action: string,
  error?: Error | unknown,
  context?: Record<string, any>,
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get user role if user exists
    let userRole = null
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      userRole = profile?.role
    }

    // Create error log entry
    const errorLog: ErrorLog = {
      level,
      message,
      action,
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
      userId: user?.id,
      userRole,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
      context: context ? sanitizeContext(context) : undefined,
    }

    // Log to console
    console[level === LogLevel.ERROR ? "error" : level === LogLevel.WARNING ? "warn" : "info"](
      `[${level.toUpperCase()}] ${action}: ${message}`,
      error || "",
      context ? sanitizeContext(context) : "",
    )

    // Store in database
    const { error: dbError } = await supabase.from("error_logs").insert(errorLog)

    if (dbError) {
      console.error("Failed to store error log:", dbError)
    }
  } catch (loggingError) {
    // Fallback to console if logging fails
    console.error("Error logging failed:", loggingError)
    console.error("Original error:", { level, message, action, error, context })
  }
}

/**
 * Log an error
 */
export function logErrorEvent(
  message: string,
  action: string,
  error?: Error | unknown,
  context?: Record<string, any>,
): Promise<void> {
  return logError(LogLevel.ERROR, message, action, error, context)
}

/**
 * Log a warning
 */
export function logWarningEvent(
  message: string,
  action: string,
  error?: Error | unknown,
  context?: Record<string, any>,
): Promise<void> {
  return logError(LogLevel.WARNING, message, action, error, context)
}

/**
 * Log an info event
 */
export function logInfoEvent(message: string, action: string, context?: Record<string, any>): Promise<void> {
  return logError(LogLevel.INFO, message, action, undefined, context)
}

"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, AlertCircle, RefreshCw, Search, Trash2, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { LogLevel } from "@/lib/error-logger"
import { useRouter } from "next/navigation"

interface ErrorLog {
  id: string
  level: LogLevel
  message: string
  source: string
  context?: Record<string, any>
  stack_trace?: string
  user_id?: string
  timestamp: string
}

interface ErrorLogsListProps {
  initialLogs: ErrorLog[]
  errorCount: number
  warningCount: number
  infoCount: number
}

export function ErrorLogsList({ initialLogs, errorCount, warningCount, infoCount }: ErrorLogsListProps) {
  const [logs, setLogs] = useState<ErrorLog[]>(initialLogs)
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Get unique sources from logs
  const sources = Array.from(new Set(logs.map((log) => log.source)))

  const handleSearch = async () => {
    try {
      setLoading(true)

      let query = supabase.from("error_logs").select("*").order("timestamp", { ascending: false })

      // Apply search if provided
      if (searchQuery) {
        query = query.or(`message.ilike.%${searchQuery}%,source.ilike.%${searchQuery}%`)
      }

      // Apply level filter if selected
      if (levelFilter && levelFilter !== "all") {
        query = query.eq("level", levelFilter)
      }

      // Apply source filter if selected
      if (sourceFilter && sourceFilter !== "all") {
        query = query.eq("source", sourceFilter)
      }

      const { data, error } = await query.limit(100)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error("Error searching logs:", error)
      toast({
        title: "Error",
        description: "Failed to search logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("error_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100)

      if (error) throw error
      setLogs(data || [])

      toast({
        title: "Logs refreshed",
        description: "The error logs have been refreshed",
      })

      router.refresh()
    } catch (error) {
      console.error("Error refreshing logs:", error)
      toast({
        title: "Error",
        description: "Failed to refresh logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all logs? This action cannot be undone.")) return

    try {
      setLoading(true)

      const { error } = await supabase.from("error_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000") // Delete all logs

      if (error) throw error

      setLogs([])

      toast({
        title: "Logs cleared",
        description: "All error logs have been cleared",
      })

      router.refresh()
    } catch (error) {
      console.error("Error clearing logs:", error)
      toast({
        title: "Error",
        description: "Failed to clear logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Error
          </Badge>
        )
      case LogLevel.WARNING:
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-yellow-500">
            <AlertTriangle className="h-3 w-3" /> Warning
          </Badge>
        )
      case LogLevel.INFO:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Info className="h-3 w-3" /> Info
          </Badge>
        )
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const formatContext = (context: any) => {
    if (!context) return "No context data"

    try {
      return JSON.stringify(context, null, 2)
    } catch (e) {
      return String(context)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-500/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Errors</p>
              <p className="text-2xl font-bold">{errorCount}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Warnings</p>
              <p className="text-2xl font-bold">{warningCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Info</p>
              <p className="text-2xl font-bold">{infoCount}</p>
            </div>
            <Info className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Application Logs</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64"
                />
                <Button variant="outline" onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </div>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value={LogLevel.ERROR}>Errors</SelectItem>
                  <SelectItem value={LogLevel.WARNING}>Warnings</SelectItem>
                  <SelectItem value={LogLevel.INFO}>Info</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  <span className="sr-only">Refresh</span>
                </Button>

                <Button variant="outline" onClick={handleClearLogs} disabled={loading}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Clear</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Level</th>
                  <th className="text-left py-3 px-4 font-medium">Message</th>
                  <th className="text-left py-3 px-4 font-medium">Source</th>
                  <th className="text-left py-3 px-4 font-medium">Time</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-muted-foreground">
                      Loading logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-muted-foreground">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="py-3 px-4">{getLevelBadge(log.level)}</td>
                      <td className="py-3 px-4 max-w-md truncate">{log.message}</td>
                      <td className="py-3 px-4">{log.source}</td>
                      <td className="py-3 px-4">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</td>
                      <td className="py-3 px-4 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Log Details</DialogTitle>
                              <DialogDescription>Detailed information about this log entry</DialogDescription>
                            </DialogHeader>

                            {selectedLog && (
                              <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="text-sm font-medium">Level</h3>
                                    <p>{getLevelBadge(selectedLog.level)}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium">Timestamp</h3>
                                    <p>{new Date(selectedLog.timestamp).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium">Source</h3>
                                    <p>{selectedLog.source}</p>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium">User ID</h3>
                                    <p>{selectedLog.user_id || "Not available"}</p>
                                  </div>
                                </div>

                                <div>
                                  <h3 className="text-sm font-medium">Message</h3>
                                  <p className="mt-1 p-2 bg-muted rounded-md">{selectedLog.message}</p>
                                </div>

                                {selectedLog.context && (
                                  <div>
                                    <h3 className="text-sm font-medium">Context</h3>
                                    <pre className="mt-1 p-2 bg-muted rounded-md overflow-auto text-xs">
                                      {formatContext(selectedLog.context)}
                                    </pre>
                                  </div>
                                )}

                                {selectedLog.stack_trace && (
                                  <div>
                                    <h3 className="text-sm font-medium">Stack Trace</h3>
                                    <pre className="mt-1 p-2 bg-muted rounded-md overflow-auto text-xs">
                                      {selectedLog.stack_trace}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

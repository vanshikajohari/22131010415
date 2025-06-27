interface LogEntry {
  timestamp: Date
  level: "info" | "warn" | "error"
  message: string
  data?: any
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private addLog(level: "info" | "warn" | "error", message: string, data?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
    }

    this.logs.push(logEntry)

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Also log to console for development
    const formattedMessage = `[${logEntry.timestamp.toISOString()}] ${level.toUpperCase()}: ${message}`

    switch (level) {
      case "info":
        console.info(formattedMessage, data || "")
        break
      case "warn":
        console.warn(formattedMessage, data || "")
        break
      case "error":
        console.error(formattedMessage, data || "")
        break
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem("url-shortener-logs", JSON.stringify(this.logs))
    } catch (error) {
      console.warn("Failed to store logs in localStorage:", error)
    }
  }

  info(message: string, data?: any) {
    this.addLog("info", message, data)
  }

  warn(message: string, data?: any) {
    this.addLog("warn", message, data)
  }

  error(message: string, data?: any) {
    this.addLog("error", message, data)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
    try {
      localStorage.removeItem("url-shortener-logs")
    } catch (error) {
      console.warn("Failed to clear logs from localStorage:", error)
    }
  }

  // Load logs from localStorage on initialization
  loadLogs() {
    try {
      const storedLogs = localStorage.getItem("url-shortener-logs")
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs)
        this.logs = parsedLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }))
      }
    } catch (error) {
      console.warn("Failed to load logs from localStorage:", error)
    }
  }
}

export const logger = new Logger()

// Load existing logs when the module is imported
if (typeof window !== "undefined") {
  logger.loadLogs()
}

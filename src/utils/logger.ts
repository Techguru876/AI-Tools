/**
 * InfinityStudio Logger
 * Comprehensive logging system for tracking user actions, system events, and errors
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

export type LogCategory =
  | 'user_action'
  | 'system_event'
  | 'api_request'
  | 'api_response'
  | 'api_error'
  | 'export'
  | 'import'
  | 'template'
  | 'animation'
  | 'audio'
  | 'video'
  | 'cloud_sync'
  | 'performance'
  | 'error'

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  category: LogCategory
  studio?: string // lofi, horror, quotes, etc.
  action: string
  result?: 'success' | 'fail' | 'error' | 'warning' | 'pending'
  details?: any
  userId?: string
  sessionId?: string
  duration?: number // milliseconds
  error?: {
    message: string
    stack?: string
    code?: string
  }
}

export interface LogFilter {
  level?: LogLevel[]
  category?: LogCategory[]
  studio?: string[]
  result?: string[]
  startTime?: string
  endTime?: string
  searchTerm?: string
}

class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private maxLogs: number = 1000
  private sessionId: string
  private userId?: string
  private listeners: ((log: LogEntry) => void)[] = []

  private constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.loadFromStorage()
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * Set user ID for log entries
   */
  setUserId(userId: string): void {
    this.userId = userId
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId
  }

  /**
   * Add listener for new log entries
   */
  addListener(callback: (log: LogEntry) => void): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback)
    }
  }

  /**
   * Log an entry
   */
  log(
    level: LogLevel,
    category: LogCategory,
    action: string,
    options?: {
      studio?: string
      result?: 'success' | 'fail' | 'error' | 'warning' | 'pending'
      details?: any
      duration?: number
      error?: Error | string
    }
  ): LogEntry {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      action,
      sessionId: this.sessionId,
      userId: this.userId,
      ...options,
    }

    // Format error if provided
    if (options?.error) {
      if (typeof options.error === 'string') {
        entry.error = { message: options.error }
      } else {
        entry.error = {
          message: options.error.message,
          stack: options.error.stack,
          code: (options.error as any).code,
        }
      }
    }

    this.logs.push(entry)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(entry))

    // Save to storage
    this.saveToStorage()

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      this.consoleOutput(entry)
    }

    return entry
  }

  /**
   * Convenience methods for different log levels
   */
  debug(category: LogCategory, action: string, details?: any): LogEntry {
    return this.log('debug', category, action, { details })
  }

  info(category: LogCategory, action: string, options?: any): LogEntry {
    return this.log('info', category, action, options)
  }

  warn(category: LogCategory, action: string, options?: any): LogEntry {
    return this.log('warn', category, action, options)
  }

  error(category: LogCategory, action: string, error: Error | string, options?: any): LogEntry {
    return this.log('error', category, action, { ...options, error, result: 'error' })
  }

  critical(category: LogCategory, action: string, error: Error | string, options?: any): LogEntry {
    return this.log('critical', category, action, { ...options, error, result: 'error' })
  }

  /**
   * Track API request
   */
  apiRequest(
    endpoint: string,
    method: string = 'GET',
    options?: {
      studio?: string
      details?: any
    }
  ): LogEntry {
    return this.log('info', 'api_request', `${method} ${endpoint}`, {
      ...options,
      result: 'pending',
    })
  }

  /**
   * Track API response
   */
  apiResponse(
    endpoint: string,
    status: number,
    duration: number,
    options?: {
      studio?: string
      details?: any
    }
  ): LogEntry {
    return this.log('info', 'api_response', `${endpoint} responded ${status}`, {
      ...options,
      result: status < 400 ? 'success' : 'error',
      duration,
      details: { status, ...(options?.details || {}) },
    })
  }

  /**
   * Track API error
   */
  apiError(
    endpoint: string,
    error: Error | string,
    duration?: number,
    options?: {
      studio?: string
      details?: any
    }
  ): LogEntry {
    return this.log('error', 'api_error', `API Error: ${endpoint}`, {
      ...options,
      result: 'error',
      error,
      duration,
    })
  }

  /**
   * Track user action
   */
  userAction(
    action: string,
    studio?: string,
    details?: any
  ): LogEntry {
    return this.log('info', 'user_action', action, {
      studio,
      details,
      result: 'success',
    })
  }

  /**
   * Track system event
   */
  systemEvent(
    event: string,
    result: 'success' | 'fail' | 'error' | 'warning' = 'success',
    options?: {
      studio?: string
      details?: any
      error?: Error | string
    }
  ): LogEntry {
    return this.log('info', 'system_event', event, {
      ...options,
      result,
    })
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * Get filtered logs
   */
  getFilteredLogs(filter: LogFilter): LogEntry[] {
    let filtered = [...this.logs]

    if (filter.level && filter.level.length > 0) {
      filtered = filtered.filter(log => filter.level!.includes(log.level))
    }

    if (filter.category && filter.category.length > 0) {
      filtered = filtered.filter(log => filter.category!.includes(log.category))
    }

    if (filter.studio && filter.studio.length > 0) {
      filtered = filtered.filter(log => log.studio && filter.studio!.includes(log.studio))
    }

    if (filter.result && filter.result.length > 0) {
      filtered = filtered.filter(log => log.result && filter.result!.includes(log.result))
    }

    if (filter.startTime) {
      filtered = filtered.filter(log => log.timestamp >= filter.startTime!)
    }

    if (filter.endTime) {
      filtered = filtered.filter(log => log.timestamp <= filter.endTime!)
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase()
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(term) ||
        JSON.stringify(log.details || {}).toLowerCase().includes(term) ||
        log.error?.message.toLowerCase().includes(term)
      )
    }

    return filtered
  }

  /**
   * Get critical errors
   */
  getCriticalErrors(): LogEntry[] {
    return this.logs.filter(log =>
      log.level === 'critical' ||
      (log.level === 'error' && log.category === 'api_error')
    )
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count)
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = []
    this.saveToStorage()
  }

  /**
   * Export logs as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Export logs as CSV
   */
  exportAsCSV(): string {
    const headers = ['Timestamp', 'Level', 'Category', 'Studio', 'Action', 'Result', 'Details', 'Error']
    const rows = this.logs.map(log => [
      log.timestamp,
      log.level,
      log.category,
      log.studio || '',
      log.action,
      log.result || '',
      JSON.stringify(log.details || {}),
      log.error?.message || '',
    ])

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  /**
   * Export logs as text
   */
  exportAsText(): string {
    return this.logs.map(log => {
      const timestamp = new Date(log.timestamp).toLocaleString()
      const level = log.level.toUpperCase().padEnd(8)
      const category = log.category.padEnd(15)
      const studio = log.studio ? `[${log.studio}]`.padEnd(12) : ''.padEnd(12)
      const result = log.result ? `[${log.result}]`.padEnd(10) : ''.padEnd(10)

      let line = `${timestamp} ${level} ${category} ${studio} ${result} ${log.action}`

      if (log.duration) {
        line += ` (${log.duration}ms)`
      }

      if (log.error) {
        line += `\n  Error: ${log.error.message}`
      }

      if (log.details && Object.keys(log.details).length > 0) {
        line += `\n  Details: ${JSON.stringify(log.details)}`
      }

      return line
    }).join('\n\n')
  }

  /**
   * Download logs as file
   */
  downloadLogs(format: 'json' | 'csv' | 'txt' = 'json'): void {
    let content: string
    let mimeType: string
    let extension: string

    switch (format) {
      case 'csv':
        content = this.exportAsCSV()
        mimeType = 'text/csv'
        extension = 'csv'
        break
      case 'txt':
        content = this.exportAsText()
        mimeType = 'text/plain'
        extension = 'txt'
        break
      default:
        content = this.exportAsJSON()
        mimeType = 'application/json'
        extension = 'json'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `infinitystudio-logs-${Date.now()}.${extension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Save logs to localStorage
   */
  private saveToStorage(): void {
    try {
      // Save only recent logs to avoid localStorage quota
      const recentLogs = this.logs.slice(-500)
      localStorage.setItem('infinitystudio_logs', JSON.stringify(recentLogs))
      localStorage.setItem('infinitystudio_session_id', this.sessionId)
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error)
    }
  }

  /**
   * Load logs from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('infinitystudio_logs')
      if (stored) {
        this.logs = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error)
      this.logs = []
    }
  }

  /**
   * Console output for development
   */
  private consoleOutput(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`

    const style = {
      debug: 'color: gray',
      info: 'color: blue',
      warn: 'color: orange',
      error: 'color: red',
      critical: 'color: red; font-weight: bold',
    }[entry.level]

    const message = `${prefix} ${entry.action}`

    if (entry.level === 'error' || entry.level === 'critical') {
      console.error(`%c${message}`, style, entry.error || entry.details)
    } else if (entry.level === 'warn') {
      console.warn(`%c${message}`, style, entry.details)
    } else {
      console.log(`%c${message}`, style, entry.details)
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Export class for testing
export { Logger }

/**
 * Wrapper function for timing operations
 */
export async function withLogging<T>(
  category: LogCategory,
  action: string,
  operation: () => Promise<T> | T,
  options?: {
    studio?: string
    details?: any
  }
): Promise<T> {
  const startTime = Date.now()

  try {
    const result = await operation()
    const duration = Date.now() - startTime

    logger.log('info', category, action, {
      ...options,
      result: 'success',
      duration,
    })

    return result
  } catch (error: any) {
    const duration = Date.now() - startTime

    logger.log('error', category, action, {
      ...options,
      result: 'error',
      error,
      duration,
    })

    throw error
  }
}

/**
 * Wrapper for API calls with automatic logging
 */
export async function loggedFetch(
  url: string,
  options?: RequestInit,
  logOptions?: {
    studio?: string
    category?: LogCategory
  }
): Promise<Response> {
  const method = options?.method || 'GET'
  const startTime = Date.now()

  logger.apiRequest(url, method, {
    studio: logOptions?.studio,
    details: { headers: options?.headers },
  })

  try {
    const response = await fetch(url, options)
    const duration = Date.now() - startTime

    logger.apiResponse(url, response.status, duration, {
      studio: logOptions?.studio,
    })

    return response
  } catch (error: any) {
    const duration = Date.now() - startTime

    logger.apiError(url, error, duration, {
      studio: logOptions?.studio,
    })

    throw error
  }
}

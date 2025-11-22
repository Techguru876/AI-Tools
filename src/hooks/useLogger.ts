/**
 * useLogger Hook
 * React hook for logging actions and events in components
 */

import { useCallback, useEffect, useState } from 'react'
import { logger, LogEntry, LogFilter, LogCategory, LogLevel } from '../utils/logger'

export interface UseLoggerReturn {
  // Logging methods
  log: (level: LogLevel, category: LogCategory, action: string, options?: any) => LogEntry
  debug: (category: LogCategory, action: string, details?: any) => LogEntry
  info: (category: LogCategory, action: string, options?: any) => LogEntry
  warn: (category: LogCategory, action: string, options?: any) => LogEntry
  error: (category: LogCategory, action: string, error: Error | string, options?: any) => LogEntry
  userAction: (action: string, details?: any) => LogEntry
  systemEvent: (event: string, result?: 'success' | 'fail' | 'error' | 'warning', options?: any) => LogEntry

  // Query methods
  logs: LogEntry[]
  criticalErrors: LogEntry[]
  refreshLogs: () => void

  // Export methods
  exportJSON: () => void
  exportCSV: () => void
  exportText: () => void
  clearLogs: () => void
}

/**
 * Hook for logging with automatic studio context
 */
export function useLogger(studio?: string): UseLoggerReturn {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [criticalErrors, setCriticalErrors] = useState<LogEntry[]>([])

  // Refresh logs from logger
  const refreshLogs = useCallback(() => {
    setLogs(logger.getLogs())
    setCriticalErrors(logger.getCriticalErrors())
  }, [])

  // Subscribe to new log entries
  useEffect(() => {
    refreshLogs()

    const unsubscribe = logger.addListener(() => {
      refreshLogs()
    })

    return unsubscribe
  }, [refreshLogs])

  // Logging methods with automatic studio context
  const log = useCallback(
    (level: LogLevel, category: LogCategory, action: string, options?: any) => {
      return logger.log(level, category, action, { ...options, studio })
    },
    [studio]
  )

  const debug = useCallback(
    (category: LogCategory, action: string, details?: any) => {
      return logger.debug(category, action, { ...details, studio })
    },
    [studio]
  )

  const info = useCallback(
    (category: LogCategory, action: string, options?: any) => {
      return logger.info(category, action, { ...options, studio })
    },
    [studio]
  )

  const warn = useCallback(
    (category: LogCategory, action: string, options?: any) => {
      return logger.warn(category, action, { ...options, studio })
    },
    [studio]
  )

  const error = useCallback(
    (category: LogCategory, action: string, err: Error | string, options?: any) => {
      return logger.error(category, action, err, { ...options, studio })
    },
    [studio]
  )

  const userAction = useCallback(
    (action: string, details?: any) => {
      return logger.userAction(action, studio, details)
    },
    [studio]
  )

  const systemEvent = useCallback(
    (event: string, result: 'success' | 'fail' | 'error' | 'warning' = 'success', options?: any) => {
      return logger.systemEvent(event, result, { ...options, studio })
    },
    [studio]
  )

  const exportJSON = useCallback(() => {
    logger.downloadLogs('json')
  }, [])

  const exportCSV = useCallback(() => {
    logger.downloadLogs('csv')
  }, [])

  const exportText = useCallback(() => {
    logger.downloadLogs('txt')
  }, [])

  const clearLogs = useCallback(() => {
    logger.clear()
    refreshLogs()
  }, [refreshLogs])

  return {
    log,
    debug,
    info,
    warn,
    error,
    userAction,
    systemEvent,
    logs,
    criticalErrors,
    refreshLogs,
    exportJSON,
    exportCSV,
    exportText,
    clearLogs,
  }
}

/**
 * Hook for viewing and filtering logs
 */
export function useLogViewer(filter?: LogFilter) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])

  const refreshLogs = useCallback(() => {
    const allLogs = logger.getLogs()
    setLogs(allLogs)

    if (filter) {
      setFilteredLogs(logger.getFilteredLogs(filter))
    } else {
      setFilteredLogs(allLogs)
    }
  }, [filter])

  useEffect(() => {
    refreshLogs()

    const unsubscribe = logger.addListener(() => {
      refreshLogs()
    })

    return unsubscribe
  }, [refreshLogs])

  return {
    logs,
    filteredLogs,
    refreshLogs,
  }
}

/**
 * Hook for tracking action performance
 */
export function useActionTracker(
  category: LogCategory,
  studio?: string
) {
  const trackAction = useCallback(
    async <T,>(action: string, operation: () => Promise<T> | T, details?: any): Promise<T> => {
      const startTime = Date.now()

      try {
        logger.log('info', category, `${action} started`, {
          studio,
          result: 'pending',
          details,
        })

        const result = await operation()
        const duration = Date.now() - startTime

        logger.log('info', category, `${action} completed`, {
          studio,
          result: 'success',
          duration,
          details,
        })

        return result
      } catch (error: any) {
        const duration = Date.now() - startTime

        logger.log('error', category, `${action} failed`, {
          studio,
          result: 'error',
          error,
          duration,
          details,
        })

        throw error
      }
    },
    [category, studio]
  )

  return { trackAction }
}

/**
 * Hook for monitoring critical errors
 */
export function useCriticalErrorMonitor(
  onCriticalError?: (error: LogEntry) => void
) {
  const [criticalErrors, setCriticalErrors] = useState<LogEntry[]>([])
  const [newCriticalError, setNewCriticalError] = useState<LogEntry | null>(null)

  useEffect(() => {
    setCriticalErrors(logger.getCriticalErrors())

    const unsubscribe = logger.addListener((log) => {
      if (log.level === 'critical' || (log.level === 'error' && log.category === 'api_error')) {
        setNewCriticalError(log)
        setCriticalErrors(logger.getCriticalErrors())

        if (onCriticalError) {
          onCriticalError(log)
        }
      }
    })

    return unsubscribe
  }, [onCriticalError])

  return {
    criticalErrors,
    newCriticalError,
    clearNewError: () => setNewCriticalError(null),
  }
}

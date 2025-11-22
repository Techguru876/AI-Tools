/**
 * LogsPanel Component
 * Developer/Debug console for viewing application logs
 */

import { useState, useMemo } from 'react'
import { useLogViewer, useCriticalErrorMonitor } from '../../hooks/useLogger'
import { LogEntry, LogFilter, LogLevel, LogCategory } from '../../utils/logger'
import './LogsPanel.css'

interface LogsPanelProps {
  isOpen: boolean
  onClose: () => void
  defaultFilter?: LogFilter
}

export default function LogsPanel({ isOpen, onClose, defaultFilter }: LogsPanelProps) {
  const [filter, setFilter] = useState<LogFilter>(defaultFilter || {})
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'txt'>('json')

  const { logs, filteredLogs, refreshLogs } = useLogViewer(filter)
  const { criticalErrors } = useCriticalErrorMonitor()

  // Statistics
  const stats = useMemo(() => {
    return {
      total: logs.length,
      errors: logs.filter(l => l.level === 'error' || l.level === 'critical').length,
      warnings: logs.filter(l => l.level === 'warn').length,
      apiCalls: logs.filter(l => l.category === 'api_request').length,
      userActions: logs.filter(l => l.category === 'user_action').length,
    }
  }, [logs])

  // Handle filter changes
  const updateFilter = (key: keyof LogFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }))
  }

  const toggleFilterArray = (key: keyof LogFilter, value: any) => {
    setFilter(prev => {
      const current = (prev[key] as any[]) || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [key]: updated.length > 0 ? updated : undefined }
    })
  }

  // Export logs
  const handleExport = () => {
    const { logger } = require('../../utils/logger')
    logger.downloadLogs(exportFormat)
  }

  // Clear logs
  const handleClear = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      const { logger } = require('../../utils/logger')
      logger.clear()
      refreshLogs()
    }
  }

  // Get log level color
  const getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case 'critical': return '#d32f2f'
      case 'error': return '#f44336'
      case 'warn': return '#ff9800'
      case 'info': return '#2196f3'
      case 'debug': return '#9e9e9e'
      default: return '#000'
    }
  }

  // Get result badge color
  const getResultColor = (result?: string): string => {
    switch (result) {
      case 'success': return '#4caf50'
      case 'error': return '#f44336'
      case 'fail': return '#ff9800'
      case 'warning': return '#ffc107'
      case 'pending': return '#2196f3'
      default: return '#9e9e9e'
    }
  }

  if (!isOpen) return null

  return (
    <div className="logs-panel-overlay">
      <div className="logs-panel">
        {/* Header */}
        <div className="logs-panel-header">
          <h2>📋 Application Logs</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Stats Bar */}
        <div className="logs-stats">
          <div className="stat">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Errors:</span>
            <span className="stat-value error">{stats.errors}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Warnings:</span>
            <span className="stat-value warning">{stats.warnings}</span>
          </div>
          <div className="stat">
            <span className="stat-label">API Calls:</span>
            <span className="stat-value">{stats.apiCalls}</span>
          </div>
          <div className="stat">
            <span className="stat-label">User Actions:</span>
            <span className="stat-value">{stats.userActions}</span>
          </div>
        </div>

        {/* Critical Errors Alert */}
        {criticalErrors.length > 0 && (
          <div className="critical-errors-alert">
            <strong>⚠️ {criticalErrors.length} Critical Error(s) Detected</strong>
            <button onClick={() => setFilter({ level: ['critical', 'error'] })}>
              View Errors
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="logs-filters">
          <div className="filter-row">
            {/* Level Filter */}
            <div className="filter-group">
              <label>Level:</label>
              <div className="filter-buttons">
                {(['debug', 'info', 'warn', 'error', 'critical'] as LogLevel[]).map(level => (
                  <button
                    key={level}
                    className={`filter-btn ${filter.level?.includes(level) ? 'active' : ''}`}
                    onClick={() => toggleFilterArray('level', level)}
                    style={{ borderColor: getLevelColor(level) }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <label>Category:</label>
              <div className="filter-buttons">
                {(['user_action', 'api_request', 'api_error', 'export', 'system_event'] as LogCategory[]).map(cat => (
                  <button
                    key={cat}
                    className={`filter-btn ${filter.category?.includes(cat) ? 'active' : ''}`}
                    onClick={() => toggleFilterArray('category', cat)}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="filter-row">
            {/* Search */}
            <input
              type="text"
              className="search-input"
              placeholder="Search logs..."
              value={filter.searchTerm || ''}
              onChange={(e) => updateFilter('searchTerm', e.target.value || undefined)}
            />

            {/* Actions */}
            <div className="filter-actions">
              <button onClick={() => setFilter({})}>Clear Filters</button>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="txt">Text</option>
              </select>
              <button onClick={handleExport}>📥 Export</button>
              <button onClick={refreshLogs}>🔄 Refresh</button>
              <button onClick={handleClear} className="danger">🗑️ Clear</button>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="logs-list">
          {filteredLogs.length === 0 ? (
            <div className="empty-state">
              <p>No logs match the current filters</p>
            </div>
          ) : (
            filteredLogs.slice().reverse().map(log => (
              <div
                key={log.id}
                className={`log-entry ${log.level} ${selectedLog?.id === log.id ? 'selected' : ''}`}
                onClick={() => setSelectedLog(log)}
              >
                <div className="log-header">
                  <span className="log-timestamp">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className="log-level"
                    style={{ color: getLevelColor(log.level) }}
                  >
                    {log.level.toUpperCase()}
                  </span>
                  <span className="log-category">
                    {log.category}
                  </span>
                  {log.studio && (
                    <span className="log-studio">[{log.studio}]</span>
                  )}
                  {log.result && (
                    <span
                      className="log-result"
                      style={{ color: getResultColor(log.result) }}
                    >
                      {log.result}
                    </span>
                  )}
                  {log.duration && (
                    <span className="log-duration">{log.duration}ms</span>
                  )}
                </div>
                <div className="log-action">{log.action}</div>
                {log.error && (
                  <div className="log-error">❌ {log.error.message}</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Details Panel */}
        {selectedLog && (
          <div className="log-details">
            <div className="details-header">
              <h3>Log Details</h3>
              <button onClick={() => setSelectedLog(null)}>✕</button>
            </div>
            <div className="details-content">
              <div className="detail-row">
                <strong>ID:</strong> {selectedLog.id}
              </div>
              <div className="detail-row">
                <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
              </div>
              <div className="detail-row">
                <strong>Level:</strong> <span style={{ color: getLevelColor(selectedLog.level) }}>{selectedLog.level}</span>
              </div>
              <div className="detail-row">
                <strong>Category:</strong> {selectedLog.category}
              </div>
              {selectedLog.studio && (
                <div className="detail-row">
                  <strong>Studio:</strong> {selectedLog.studio}
                </div>
              )}
              <div className="detail-row">
                <strong>Action:</strong> {selectedLog.action}
              </div>
              {selectedLog.result && (
                <div className="detail-row">
                  <strong>Result:</strong> <span style={{ color: getResultColor(selectedLog.result) }}>{selectedLog.result}</span>
                </div>
              )}
              {selectedLog.duration && (
                <div className="detail-row">
                  <strong>Duration:</strong> {selectedLog.duration}ms
                </div>
              )}
              {selectedLog.userId && (
                <div className="detail-row">
                  <strong>User ID:</strong> {selectedLog.userId}
                </div>
              )}
              {selectedLog.sessionId && (
                <div className="detail-row">
                  <strong>Session ID:</strong> {selectedLog.sessionId}
                </div>
              )}
              {selectedLog.details && (
                <div className="detail-row">
                  <strong>Details:</strong>
                  <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                </div>
              )}
              {selectedLog.error && (
                <div className="detail-row error-details">
                  <strong>Error:</strong>
                  <div>{selectedLog.error.message}</div>
                  {selectedLog.error.code && <div>Code: {selectedLog.error.code}</div>}
                  {selectedLog.error.stack && (
                    <pre>{selectedLog.error.stack}</pre>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

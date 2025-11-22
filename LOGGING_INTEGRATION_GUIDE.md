# InfinityStudio Logging System - Integration Guide

## Overview

The InfinityStudio logging system provides comprehensive tracking of user actions, system events, API calls, and errors across all modules. This guide explains how to integrate logging into your components and functions.

## Architecture

### Core Components

1. **`src/utils/logger.ts`** - Core logging utility with singleton instance
2. **`src/hooks/useLogger.ts`** - React hooks for logging in components
3. **`src/components/common/LogsPanel.tsx`** - UI for viewing and filtering logs
4. **`src/components/common/LogsPanel.css`** - Styles for logs panel

### Log Entry Structure

```typescript
interface LogEntry {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical'
  category: 'user_action' | 'api_request' | 'api_response' | 'api_error' |
            'export' | 'import' | 'template' | 'animation' | 'audio' |
            'video' | 'cloud_sync' | 'performance' | 'error' | 'system_event'
  studio?: string // 'lofi', 'horror', 'quotes', etc.
  action: string
  result?: 'success' | 'fail' | 'error' | 'warning' | 'pending'
  details?: any
  userId?: string
  sessionId?: string
  duration?: number
  error?: { message: string; stack?: string; code?: string }
}
```

## Integration Examples

### 1. Logging in React Components

```typescript
import { useLogger } from '../hooks/useLogger'

export default function LofiStudio() {
  const { userAction, error, info } = useLogger('lofi')

  const handleTemplateSelect = (template: Template) => {
    userAction('Selected template', { templateName: template.name })
    // ... rest of logic
  }

  const handleExport = async () => {
    info('export', 'Export started', { result: 'pending' })

    try {
      await exportVideo(/* ... */)
      info('export', 'Export completed', {
        result: 'success',
        duration: Date.now() - startTime
      })
    } catch (err) {
      error('export', 'Export failed', err)
    }
  }

  return (
    // ... JSX
  )
}
```

### 2. Logging API Calls

```typescript
import { logger } from '../utils/logger'

export async function generateAIImage(prompt: string) {
  const startTime = Date.now()

  logger.apiRequest('https://api.openai.com/v1/images/generations', 'POST', {
    details: { promptLength: prompt.length }
  })

  try {
    const response = await fetch(/* ... */)
    const duration = Date.now() - startTime

    logger.apiResponse(
      'https://api.openai.com/v1/images/generations',
      response.status,
      duration
    )

    if (!response.ok) {
      throw new Error(`API failed: ${response.status}`)
    }

    return await response.json()
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.apiError(
      'https://api.openai.com/v1/images/generations',
      error,
      duration
    )
    throw error
  }
}
```

### 3. Logging with Performance Tracking

```typescript
import { withLogging } from '../utils/logger'

export async function processScene(scene: Scene) {
  return withLogging(
    'video',
    'Process scene',
    async () => {
      // Expensive operation
      await renderScene(scene)
      return scene
    },
    {
      studio: 'horror',
      details: { sceneId: scene.id }
    }
  )
}
```

### 4. Using Action Tracker Hook

```typescript
import { useActionTracker } from '../hooks/useLogger'

export default function AssetLibrary() {
  const { trackAction } = useActionTracker('import', 'lofi')

  const handleImportAsset = async (file: File) => {
    await trackAction(
      'Import asset',
      async () => {
        return await processAsset(file)
      },
      { fileName: file.name, fileSize: file.size }
    )
  }

  return (
    // ... JSX
  )
}
```

### 5. Critical Error Monitoring

```typescript
import { useCriticalErrorMonitor } from '../hooks/useLogger'

export default function App() {
  useCriticalErrorMonitor((error) => {
    // Show toast notification
    toast.error(`Critical Error: ${error.error?.message}`)
  })

  return (
    // ... app JSX
  )
}
```

### 6. Adding Logs Panel to App

```typescript
import { useState } from 'react'
import LogsPanel from './components/common/LogsPanel'

export default function App() {
  const [showLogs, setShowLogs] = useState(false)

  return (
    <>
      {/* Your app */}

      {/* Keyboard shortcut: Ctrl+Shift+L */}
      <button
        onClick={() => setShowLogs(true)}
        className="dev-tools-btn"
      >
        📋 Logs
      </button>

      <LogsPanel
        isOpen={showLogs}
        onClose={() => setShowLogs(false)}
      />
    </>
  )
}
```

## Integration Checklist

### User Actions to Log

- [ ] Template selection
- [ ] Asset import/upload
- [ ] Animation application
- [ ] SFX placement
- [ ] Voice generation
- [ ] Export initiation
- [ ] Cloud sync
- [ ] Project save/load
- [ ] Settings changes

### System Events to Log

- [ ] App initialization
- [ ] Module loading
- [ ] Background tasks
- [ ] Auto-save
- [ ] Cloud sync operations
- [ ] Cache operations

### API Calls to Log

- [ ] TTS generation (OpenAI, ElevenLabs)
- [ ] AI image generation
- [ ] AI video generation
- [ ] Stock media search
- [ ] RSS feed parsing
- [ ] Cloud database operations

### Errors to Log

- [ ] API failures
- [ ] Export errors
- [ ] Import/parsing errors
- [ ] Network timeouts
- [ ] Missing dependencies
- [ ] Invalid configurations

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
logger.debug()    // Development/debugging info
logger.info()     // Normal operations
logger.warn()     // Warnings that don't break functionality
logger.error()    // Errors that impact functionality
logger.critical() // Critical errors requiring immediate attention
```

### 2. Include Relevant Details

```typescript
// Good
userAction('Applied animation', {
  animationType: 'rain',
  duration: 3.5,
  sceneId: scene.id
})

// Better context
userAction('Applied animation', {
  animationType: 'rain',
  duration: 3.5,
  sceneId: scene.id,
  totalAnimations: scene.animations.length,
  timestamp: scene.currentTime
})
```

### 3. Log Results

```typescript
// Track operation outcome
try {
  const result = await operation()
  logger.info('export', 'Export completed', {
    result: 'success',
    duration: 1234,
    details: { fileSize: result.size }
  })
} catch (error) {
  logger.error('export', 'Export failed', error, {
    result: 'error'
  })
}
```

### 4. Avoid Logging Sensitive Data

```typescript
// Bad - exposes API key
logger.debug('api_request', 'Calling API', {
  apiKey: apiKeys.openai
})

// Good - omit sensitive data
logger.debug('api_request', 'Calling OpenAI', {
  hasKey: !!apiKeys.openai
})
```

## Viewing Logs

### In Development

Logs automatically output to browser console with color coding:
- Debug: Gray
- Info: Blue
- Warn: Orange
- Error/Critical: Red

### In Logs Panel

1. Open logs panel (button or Ctrl+Shift+L)
2. Use filters to narrow down:
   - Level: debug, info, warn, error, critical
   - Category: user_action, api_request, export, etc.
   - Studio: lofi, horror, quotes, etc.
   - Search: text search across all fields
3. Click log entry to view details
4. Export logs as JSON, CSV, or TXT

### Exporting Logs

```typescript
import { logger } from '../utils/logger'

// Export as JSON
logger.downloadLogs('json')

// Export as CSV
logger.downloadLogs('csv')

// Export as text
logger.downloadLogs('txt')

// Or programmatically
const jsonLogs = logger.exportAsJSON()
const csvLogs = logger.exportAsCSV()
const textLogs = logger.exportAsText()
```

## Performance Considerations

- Logs are automatically limited to 1000 entries in memory
- Only recent 500 logs are persisted to localStorage
- Logging overhead is minimal (~1-2ms per log entry)
- Console output only in development mode
- No network requests (all local)

## Future Enhancements

### Planned Features

1. **Cloud Log Sync** - Upload logs to Supabase for analysis
2. **Log Aggregation** - View logs across multiple sessions
3. **Analytics Dashboard** - Visualize usage patterns
4. **Crash Reporting** - Automatic error reporting
5. **Performance Metrics** - Track operation timings
6. **User Session Replay** - Recreate user actions

### Optional Integrations

1. **Sentry Integration** - Send critical errors to Sentry
2. **LogRocket Integration** - Session replay
3. **Google Analytics** - Usage analytics
4. **Custom Webhooks** - Send logs to external services

## Troubleshooting

### Logs Not Appearing

1. Check if logger is imported: `import { logger } from '../utils/logger'`
2. Verify log level is appropriate (not using debug in production)
3. Check localStorage quota (logs may not persist)

### Performance Issues

1. Reduce log verbosity (use info/warn/error only)
2. Clear old logs: `logger.clear()`
3. Disable console output in production

### Missing Details

1. Add more context to log calls
2. Include error stack traces
3. Track operation duration

## Support

For questions or issues with the logging system:
1. Check this guide
2. Review examples in `src/hooks/useLogger.ts`
3. Inspect `src/utils/logger.ts` source code
4. File issue with example code

---

**Last Updated:** 2025-11-22
**Version:** 1.0.0
**Author:** InfinityStudio Development Team

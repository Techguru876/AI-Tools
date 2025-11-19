/**
 * Input Validation Utilities
 * Comprehensive validation for user inputs
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' }
  }

  try {
    new URL(url)
    return { isValid: true }
  } catch {
    return { isValid: false, error: 'Invalid URL format' }
  }
}

/**
 * Validate API key format
 */
export function validateApiKey(key: string, provider: string): ValidationResult {
  if (!key || key.trim().length === 0) {
    return { isValid: false, error: `${provider} API key is required` }
  }

  if (key.length < 10) {
    return { isValid: false, error: 'API key is too short' }
  }

  // Provider-specific validation
  if (provider.toLowerCase() === 'openai' && !key.startsWith('sk-')) {
    return { isValid: false, error: 'OpenAI API keys must start with "sk-"' }
  }

  return { isValid: true }
}

/**
 * Validate number range
 */
export function validateNumber(
  value: number,
  min?: number,
  max?: number,
  fieldName = 'Value'
): ValidationResult {
  if (isNaN(value) || value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} must be a number` }
  }

  if (min !== undefined && value < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` }
  }

  if (max !== undefined && value > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max}` }
  }

  return { isValid: true }
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  min?: number,
  max?: number,
  fieldName = 'Field'
): ValidationResult {
  if (!value || typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} is required` }
  }

  const length = value.trim().length

  if (min !== undefined && length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` }
  }

  if (max !== undefined && length > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max} characters` }
  }

  return { isValid: true }
}

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[],
  fieldName = 'File'
): ValidationResult {
  if (!file) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  const fileType = file.type
  const isAllowed = allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      const baseType = type.split('/')[0]
      return fileType.startsWith(baseType + '/')
    }
    return fileType === type
  })

  if (!isAllowed) {
    return {
      isValid: false,
      error: `${fieldName} must be one of: ${allowedTypes.join(', ')}`,
    }
  }

  return { isValid: true }
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number,
  fieldName = 'File'
): ValidationResult {
  if (!file) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  const fileSizeMB = file.size / (1024 * 1024)

  if (fileSizeMB > maxSizeMB) {
    return {
      isValid: false,
      error: `${fieldName} must be smaller than ${maxSizeMB}MB (current: ${fileSizeMB.toFixed(1)}MB)`,
    }
  }

  return { isValid: true }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  return { isValid: true }
}

/**
 * Validate hex color
 */
export function validateHexColor(color: string): ValidationResult {
  if (!color || color.trim().length === 0) {
    return { isValid: false, error: 'Color is required' }
  }

  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  if (!hexRegex.test(color)) {
    return { isValid: false, error: 'Invalid hex color format (use #RRGGBB or #RGB)' }
  }

  return { isValid: true }
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars
    .replace(/_{2,}/g, '_') // Remove consecutive underscores
    .substring(0, 255) // Limit length
}

/**
 * Validate duration
 */
export function validateDuration(seconds: number): ValidationResult {
  const result = validateNumber(seconds, 1, 3600, 'Duration')
  if (!result.isValid) {
    return result
  }

  return { isValid: true }
}

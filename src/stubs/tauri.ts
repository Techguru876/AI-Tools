/**
 * Tauri API Stubs
 * Legacy PhotoVideo Pro (Tauri-based) is disabled
 * These stubs prevent import errors from unused legacy code
 */

export const invoke = async (...args: any[]): Promise<any> => {
  console.warn('Tauri invoke called but PhotoVideo Pro is disabled')
  return null
}

export const open = async (...args: any[]): Promise<any> => {
  console.warn('Tauri dialog.open called but PhotoVideo Pro is disabled')
  return null
}

export const save = async (...args: any[]): Promise<any> => {
  console.warn('Tauri dialog.save called but PhotoVideo Pro is disabled')
  return null
}

export default {
  invoke,
  open,
  save,
}

/**
 * FFmpeg Stubs
 * Legacy PhotoVideo Pro used browser-based FFmpeg
 * These stubs prevent import errors from unused legacy code
 */

export class FFmpeg {
  load = async () => {
    console.warn('FFmpeg.load called but legacy code is disabled')
  }

  writeFile = async (...args: any[]) => {
    console.warn('FFmpeg.writeFile called but legacy code is disabled')
  }

  exec = async (...args: any[]) => {
    console.warn('FFmpeg.exec called but legacy code is disabled')
  }

  readFile = async (...args: any[]) => {
    console.warn('FFmpeg.readFile called but legacy code is disabled')
    return new Uint8Array()
  }
}

export const fetchFile = async (...args: any[]) => {
  console.warn('fetchFile called but legacy code is disabled')
  return new Uint8Array()
}

export const toBlobURL = async (...args: any[]) => {
  console.warn('toBlobURL called but legacy code is disabled')
  return ''
}

export default {
  FFmpeg,
  fetchFile,
  toBlobURL,
}

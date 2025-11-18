/**
 * SHARED CONSTANTS
 *
 * Application-wide constants including default values, supported formats,
 * and configuration parameters.
 */

// ============================================================================
// APPLICATION METADATA
// ============================================================================

export const APP_NAME = 'Pro Photo Video Editor';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Professional photo and video editing suite';

// ============================================================================
// SUPPORTED FORMATS
// ============================================================================

export const SUPPORTED_VIDEO_FORMATS = [
  'mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', 'mpg', 'mpeg'
];

export const SUPPORTED_IMAGE_FORMATS = [
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'svg', 'psd', 'raw', 'cr2', 'nef'
];

export const SUPPORTED_AUDIO_FORMATS = [
  'mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma', 'aiff'
];

// ============================================================================
// DEFAULT PROJECT SETTINGS
// ============================================================================

export const DEFAULT_RESOLUTIONS = {
  '4K_UHD': { width: 3840, height: 2160, name: '4K UHD (3840x2160)' },
  'FULL_HD': { width: 1920, height: 1080, name: 'Full HD (1920x1080)' },
  'HD': { width: 1280, height: 720, name: 'HD (1280x720)' },
  'INSTAGRAM_SQUARE': { width: 1080, height: 1080, name: 'Instagram Square (1080x1080)' },
  'INSTAGRAM_PORTRAIT': { width: 1080, height: 1350, name: 'Instagram Portrait (1080x1350)' },
  'INSTAGRAM_STORY': { width: 1080, height: 1920, name: 'Instagram Story (1080x1920)' },
  'YOUTUBE_THUMBNAIL': { width: 1280, height: 720, name: 'YouTube Thumbnail (1280x720)' },
  'TIKTOK': { width: 1080, height: 1920, name: 'TikTok (1080x1920)' },
  '8K': { width: 7680, height: 4320, name: '8K (7680x4320)' },
  'CINEMA_4K': { width: 4096, height: 2160, name: 'Cinema 4K (4096x2160)' },
};

export const DEFAULT_FRAME_RATES = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60, 120];

export const DEFAULT_ASPECT_RATIOS = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '9:16': 9 / 16,
  '21:9': 21 / 9,
  '2.39:1': 2.39,
};

// ============================================================================
// BLEND MODES
// ============================================================================

export const BLEND_MODES = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
];

// ============================================================================
// EFFECTS LIBRARY
// ============================================================================

export const VIDEO_EFFECTS = {
  color: [
    { id: 'brightness-contrast', name: 'Brightness & Contrast' },
    { id: 'levels', name: 'Levels' },
    { id: 'curves', name: 'Curves' },
    { id: 'hue-saturation', name: 'Hue/Saturation' },
    { id: 'color-balance', name: 'Color Balance' },
    { id: 'vibrance', name: 'Vibrance' },
    { id: 'black-white', name: 'Black & White' },
    { id: 'sepia', name: 'Sepia' },
    { id: 'lut', name: 'LUT' },
  ],
  blur: [
    { id: 'gaussian-blur', name: 'Gaussian Blur' },
    { id: 'motion-blur', name: 'Motion Blur' },
    { id: 'radial-blur', name: 'Radial Blur' },
    { id: 'box-blur', name: 'Box Blur' },
    { id: 'lens-blur', name: 'Lens Blur' },
  ],
  stylize: [
    { id: 'glow', name: 'Glow' },
    { id: 'sharpen', name: 'Sharpen' },
    { id: 'emboss', name: 'Emboss' },
    { id: 'posterize', name: 'Posterize' },
    { id: 'mosaic', name: 'Mosaic' },
    { id: 'noise', name: 'Noise' },
    { id: 'grain', name: 'Film Grain' },
  ],
  distort: [
    { id: 'lens-distortion', name: 'Lens Distortion' },
    { id: 'warp', name: 'Warp' },
    { id: 'ripple', name: 'Ripple' },
    { id: 'bulge', name: 'Bulge' },
    { id: 'twirl', name: 'Twirl' },
  ],
  transform: [
    { id: 'scale', name: 'Scale' },
    { id: 'rotation', name: 'Rotation' },
    { id: 'position', name: 'Position' },
    { id: 'crop', name: 'Crop' },
    { id: 'perspective', name: 'Perspective' },
  ],
  keying: [
    { id: 'chroma-key', name: 'Chroma Key (Green Screen)' },
    { id: 'luma-key', name: 'Luma Key' },
    { id: 'color-key', name: 'Color Key' },
  ],
};

export const AUDIO_EFFECTS = {
  dynamics: [
    { id: 'compressor', name: 'Compressor' },
    { id: 'limiter', name: 'Limiter' },
    { id: 'gate', name: 'Gate' },
    { id: 'expander', name: 'Expander' },
  ],
  eq: [
    { id: 'parametric-eq', name: 'Parametric EQ' },
    { id: 'graphic-eq', name: 'Graphic EQ' },
    { id: 'high-pass', name: 'High Pass Filter' },
    { id: 'low-pass', name: 'Low Pass Filter' },
  ],
  modulation: [
    { id: 'chorus', name: 'Chorus' },
    { id: 'flanger', name: 'Flanger' },
    { id: 'phaser', name: 'Phaser' },
  ],
  time: [
    { id: 'reverb', name: 'Reverb' },
    { id: 'delay', name: 'Delay' },
    { id: 'echo', name: 'Echo' },
  ],
  other: [
    { id: 'noise-reduction', name: 'Noise Reduction' },
    { id: 'de-esser', name: 'De-Esser' },
    { id: 'pitch-shift', name: 'Pitch Shift' },
    { id: 'distortion', name: 'Distortion' },
  ],
};

// ============================================================================
// AI FEATURES
// ============================================================================

export const AI_FEATURES = {
  video: [
    { id: 'auto-reframe', name: 'Auto Reframe', description: 'Automatically reframe video for different aspect ratios' },
    { id: 'scene-detection', name: 'Scene Detection', description: 'Detect scene changes automatically' },
    { id: 'auto-caption', name: 'Auto Caption', description: 'Generate captions from speech' },
    { id: 'speech-to-text', name: 'Speech to Text', description: 'Transcribe audio to text' },
    { id: 'object-tracking', name: 'Object Tracking', description: 'Track objects through video' },
    { id: 'motion-tracking', name: 'Motion Tracking', description: 'Track camera motion' },
    { id: 'stabilization', name: 'Stabilization', description: 'Stabilize shaky footage' },
  ],
  image: [
    { id: 'subject-selection', name: 'Subject Selection', description: 'Automatically select main subject' },
    { id: 'background-removal', name: 'Background Removal', description: 'Remove background automatically' },
    { id: 'sky-replacement', name: 'Sky Replacement', description: 'Replace sky with AI' },
    { id: 'super-resolution', name: 'Super Resolution', description: 'Upscale images with AI' },
    { id: 'denoising', name: 'Denoising', description: 'Remove noise from images' },
    { id: 'portrait-enhancement', name: 'Portrait Enhancement', description: 'Enhance portraits automatically' },
    { id: 'style-transfer', name: 'Style Transfer', description: 'Apply artistic styles' },
    { id: 'generative-fill', name: 'Generative Fill', description: 'Fill areas with AI-generated content' },
    { id: 'content-aware-fill', name: 'Content Aware Fill', description: 'Fill with matching content' },
  ],
};

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export const DEFAULT_SHORTCUTS = {
  // File operations
  'file.new': 'Ctrl+N',
  'file.open': 'Ctrl+O',
  'file.save': 'Ctrl+S',
  'file.save-as': 'Ctrl+Shift+S',
  'file.export': 'Ctrl+M',
  'file.close': 'Ctrl+W',

  // Edit operations
  'edit.undo': 'Ctrl+Z',
  'edit.redo': 'Ctrl+Shift+Z',
  'edit.cut': 'Ctrl+X',
  'edit.copy': 'Ctrl+C',
  'edit.paste': 'Ctrl+V',
  'edit.duplicate': 'Ctrl+D',
  'edit.select-all': 'Ctrl+A',
  'edit.deselect': 'Ctrl+D',

  // Layer operations
  'layer.new': 'Ctrl+Shift+N',
  'layer.merge-down': 'Ctrl+E',
  'layer.merge-visible': 'Ctrl+Shift+E',
  'layer.group': 'Ctrl+G',
  'layer.ungroup': 'Ctrl+Shift+G',

  // View operations
  'view.zoom-in': 'Ctrl+=',
  'view.zoom-out': 'Ctrl+-',
  'view.fit-to-screen': 'Ctrl+0',
  'view.actual-pixels': 'Ctrl+1',
  'view.fullscreen': 'F11',

  // Playback
  'playback.play-pause': 'Space',
  'playback.step-forward': 'Right',
  'playback.step-backward': 'Left',
  'playback.go-to-start': 'Home',
  'playback.go-to-end': 'End',

  // Tools
  'tool.select': 'V',
  'tool.move': 'M',
  'tool.brush': 'B',
  'tool.eraser': 'E',
  'tool.text': 'T',
  'tool.crop': 'C',
  'tool.eyedropper': 'I',
  'tool.hand': 'H',
  'tool.zoom': 'Z',
};

// ============================================================================
// UI COLORS
// ============================================================================

export const UI_COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#5AC8FA',

  background: {
    dark: '#1E1E1E',
    medium: '#2D2D2D',
    light: '#3C3C3C',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    disabled: '#5A5A5A',
  },

  border: '#3C3C3C',
  highlight: '#007AFF',
  selection: 'rgba(0, 122, 255, 0.3)',
};

// ============================================================================
// TIMELINE DEFAULTS
// ============================================================================

export const TIMELINE_DEFAULTS = {
  trackHeight: 60,
  minTrackHeight: 30,
  maxTrackHeight: 200,
  snapThreshold: 10, // pixels
  defaultClipDuration: 5, // seconds
  minClipDuration: 0.1, // seconds
  zoomLevels: [0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 50, 100],
  pixelsPerSecond: 50,
};

// ============================================================================
// CANVAS DEFAULTS
// ============================================================================

export const CANVAS_DEFAULTS = {
  backgroundColor: '#CCCCCC',
  checkerboardSize: 10,
  checkerboardColor1: '#FFFFFF',
  checkerboardColor2: '#E0E0E0',
  guideColor: '#00FFFF',
  selectionColor: '#007AFF',
  handleSize: 8,
};

// ============================================================================
// PERFORMANCE LIMITS
// ============================================================================

export const PERFORMANCE_LIMITS = {
  maxHistoryStates: 50,
  maxUndoLevels: 100,
  maxLayers: 10000,
  maxTracks: 100,
  maxClipsPerTrack: 1000,
  thumbnailCacheSize: 1000, // MB
  previewCacheSize: 2000, // MB
};

// ============================================================================
// EXPORT PRESETS
// ============================================================================

export const EXPORT_PRESETS = {
  video: {
    'youtube-4k': {
      name: 'YouTube 4K',
      format: 'mp4',
      codec: 'h264',
      resolution: { width: 3840, height: 2160 },
      frameRate: 30,
      bitrate: 50000,
      audioBitrate: 320,
    },
    'youtube-1080p': {
      name: 'YouTube 1080p',
      format: 'mp4',
      codec: 'h264',
      resolution: { width: 1920, height: 1080 },
      frameRate: 30,
      bitrate: 12000,
      audioBitrate: 192,
    },
    'instagram-feed': {
      name: 'Instagram Feed',
      format: 'mp4',
      codec: 'h264',
      resolution: { width: 1080, height: 1080 },
      frameRate: 30,
      bitrate: 8000,
      audioBitrate: 128,
    },
    'instagram-story': {
      name: 'Instagram Story',
      format: 'mp4',
      codec: 'h264',
      resolution: { width: 1080, height: 1920 },
      frameRate: 30,
      bitrate: 8000,
      audioBitrate: 128,
    },
    'tiktok': {
      name: 'TikTok',
      format: 'mp4',
      codec: 'h264',
      resolution: { width: 1080, height: 1920 },
      frameRate: 30,
      bitrate: 8000,
      audioBitrate: 128,
    },
  },
  image: {
    'web': {
      name: 'Web (JPEG)',
      format: 'jpg',
      quality: 80,
      resolution: { width: 1920, height: 1080 },
    },
    'print': {
      name: 'Print (PNG)',
      format: 'png',
      quality: 100,
      resolution: { width: 3840, height: 2160 },
    },
  },
};

// ============================================================================
// FILE SIZE LIMITS
// ============================================================================

export const FILE_SIZE_LIMITS = {
  maxImageSize: 500 * 1024 * 1024, // 500 MB
  maxVideoSize: 10 * 1024 * 1024 * 1024, // 10 GB
  maxAudioSize: 500 * 1024 * 1024, // 500 MB
  maxProjectSize: 5 * 1024 * 1024 * 1024, // 5 GB
};

/**
 * SHARED TYPE DEFINITIONS
 *
 * This file contains all TypeScript interfaces and types used throughout the application.
 * These types ensure type safety and provide clear contracts between modules.
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle extends Point, Size {}

export interface Transform {
  position: Point;
  scale: Point;
  rotation: number;
  opacity: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

// ============================================================================
// PROJECT STRUCTURE
// ============================================================================

export interface Project {
  id: string;
  name: string;
  type: 'video' | 'image' | 'hybrid';
  createdAt: Date;
  modifiedAt: Date;
  settings: ProjectSettings;
  timeline?: Timeline;
  composition?: Composition;
  assets: Asset[];
  metadata: ProjectMetadata;
}

export interface ProjectSettings {
  resolution: Size;
  frameRate: number;
  aspectRatio: string;
  colorSpace: 'sRGB' | 'Adobe RGB' | 'ProPhoto RGB' | 'Rec. 709' | 'Rec. 2020';
  bitDepth: 8 | 16 | 32;
  audioSampleRate: 44100 | 48000 | 96000;
  duration?: number; // In seconds, for video projects
}

export interface ProjectMetadata {
  author: string;
  description: string;
  tags: string[];
  customFields: Record<string, any>;
}

// ============================================================================
// VIDEO EDITING TYPES
// ============================================================================

export interface Timeline {
  id: string;
  tracks: Track[];
  duration: number;
  playhead: number;
  markers: Marker[];
  zoomLevel: number;
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'subtitle' | 'graphics';
  clips: Clip[];
  locked: boolean;
  muted: boolean;
  solo: boolean;
  height: number;
  effects: Effect[];
}

export interface Clip {
  id: string;
  name: string;
  assetId: string;
  trackId: string;
  startTime: number; // Timeline position
  duration: number;
  inPoint: number; // Source clip in point
  outPoint: number; // Source clip out point
  transform: Transform;
  speed: number;
  reversed: boolean;
  effects: Effect[];
  transitions: Transition[];
  keyframes: Keyframe[];
  metadata: Record<string, any>;
}

export interface Marker {
  id: string;
  time: number;
  label: string;
  color: string;
  type: 'standard' | 'chapter' | 'comment';
}

export interface Keyframe {
  time: number;
  property: string;
  value: any;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bezier';
  bezierPoints?: Point[];
}

// ============================================================================
// IMAGE EDITING TYPES
// ============================================================================

export interface Composition {
  id: string;
  name: string;
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string | null;
  guides: Guide[];
  rulers: boolean;
  grid: GridSettings;
}

export interface Layer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'adjustment' | 'group' | 'smart-object';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  transform: Transform;
  mask?: Mask;
  effects: Effect[];
  parentId?: string; // For grouped layers
  children?: string[]; // For group layers
  content?: LayerContent;
  thumbnail?: string;
}

export interface LayerContent {
  // For image layers
  imageData?: ImageData;
  assetId?: string;

  // For text layers
  text?: TextData;

  // For shape layers
  shapes?: ShapeData[];

  // For adjustment layers
  adjustments?: Adjustment[];

  // For smart objects
  embeddedComposition?: Composition;
}

export interface TextData {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: Color;
  alignment: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  effects: TextEffect[];
}

export interface TextEffect {
  type: 'stroke' | 'shadow' | 'glow' | 'gradient';
  settings: Record<string, any>;
}

export interface ShapeData {
  type: 'rectangle' | 'ellipse' | 'polygon' | 'path' | 'star';
  points: Point[];
  fill?: Color | Gradient;
  stroke?: StrokeData;
  closed: boolean;
}

export interface StrokeData {
  color: Color;
  width: number;
  dashArray?: number[];
  lineCap: 'butt' | 'round' | 'square';
  lineJoin: 'miter' | 'round' | 'bevel';
}

export interface Gradient {
  type: 'linear' | 'radial' | 'angular';
  stops: GradientStop[];
  angle?: number;
  center?: Point;
}

export interface GradientStop {
  position: number; // 0 to 1
  color: Color;
}

export interface Mask {
  id: string;
  type: 'alpha' | 'vector' | 'luminance';
  inverted: boolean;
  feather: number;
  density: number;
  path?: Point[];
  imageData?: ImageData;
}

export interface Guide {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number;
  color: string;
}

export interface GridSettings {
  enabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  subdivisions: number;
  color: Color;
}

// ============================================================================
// EFFECTS AND ADJUSTMENTS
// ============================================================================

export type BlendMode =
  | 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten'
  | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference'
  | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';

export interface Effect {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  parameters: Record<string, any>;
  keyframes?: Keyframe[];
}

export interface Adjustment {
  id: string;
  type: AdjustmentType;
  enabled: boolean;
  parameters: Record<string, any>;
}

export type AdjustmentType =
  | 'brightness-contrast' | 'levels' | 'curves' | 'hue-saturation'
  | 'color-balance' | 'vibrance' | 'exposure' | 'shadows-highlights'
  | 'channel-mixer' | 'selective-color' | 'color-lookup' | 'invert'
  | 'posterize' | 'threshold' | 'gradient-map' | 'photo-filter';

export interface Transition {
  id: string;
  type: TransitionType;
  duration: number;
  position: 'start' | 'end';
  parameters: Record<string, any>;
}

export type TransitionType =
  | 'dissolve' | 'wipe' | 'slide' | 'push' | 'zoom' | 'fade' | 'iris'
  | 'morph' | 'light-rays' | 'film-dissolve' | 'cross-zoom';

// ============================================================================
// COLOR GRADING
// ============================================================================

export interface ColorGrading {
  id: string;
  name: string;
  enabled: boolean;
  lut?: LUT;
  wheels: ColorWheels;
  curves: ColorCurves;
  hsl: HSLAdjustments;
  temperature: number;
  tint: number;
  vibrance: number;
  saturation: number;
}

export interface LUT {
  id: string;
  name: string;
  data: Uint8Array | Float32Array;
  size: number;
}

export interface ColorWheels {
  shadows: ColorWheel;
  midtones: ColorWheel;
  highlights: ColorWheel;
  global: ColorWheel;
}

export interface ColorWheel {
  hue: number; // 0-360
  saturation: number; // 0-1
  luminance: number; // -1 to 1
}

export interface ColorCurves {
  master: CurvePoints;
  red: CurvePoints;
  green: CurvePoints;
  blue: CurvePoints;
}

export type CurvePoints = Point[];

export interface HSLAdjustments {
  hue: number;
  saturation: number;
  lightness: number;
}

// ============================================================================
// AUDIO
// ============================================================================

export interface AudioClip {
  id: string;
  trackId: string;
  assetId: string;
  startTime: number;
  duration: number;
  volume: number; // 0-1
  pan: number; // -1 to 1 (left to right)
  muted: boolean;
  fadeIn?: number;
  fadeOut?: number;
  effects: AudioEffect[];
  keyframes: Keyframe[];
}

export interface AudioEffect {
  id: string;
  type: AudioEffectType;
  enabled: boolean;
  parameters: Record<string, any>;
}

export type AudioEffectType =
  | 'equalizer' | 'compressor' | 'limiter' | 'reverb' | 'delay'
  | 'chorus' | 'flanger' | 'phaser' | 'distortion' | 'pitch-shift'
  | 'noise-reduction' | 'de-esser' | 'gate' | 'expander';

export interface AudioMixer {
  masterVolume: number;
  tracks: AudioTrackSettings[];
}

export interface AudioTrackSettings {
  trackId: string;
  volume: number;
  pan: number;
  solo: boolean;
  mute: boolean;
  sends: AudioSend[];
}

export interface AudioSend {
  targetBus: string;
  amount: number;
  preFader: boolean;
}

// ============================================================================
// ASSETS
// ============================================================================

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  filePath: string;
  thumbnail?: string;
  duration?: number; // For video/audio
  size: Size; // For images/videos
  fileSize: number; // In bytes
  format: string;
  createdAt: Date;
  metadata: AssetMetadata;
  tags: string[];
  proxy?: ProxyAsset;
}

export type AssetType = 'video' | 'audio' | 'image' | 'graphics' | 'text' | 'effect' | 'lut' | 'template';

export interface AssetMetadata {
  codec?: string;
  bitrate?: number;
  channels?: number;
  sampleRate?: number;
  colorSpace?: string;
  orientation?: number;
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: number;
  shutterSpeed?: string;
  customFields: Record<string, any>;
}

export interface ProxyAsset {
  filePath: string;
  resolution: Size;
}

// ============================================================================
// AI FEATURES
// ============================================================================

export interface AITask {
  id: string;
  type: AITaskType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  input: any;
  output?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

export type AITaskType =
  | 'auto-reframe' | 'scene-detection' | 'object-detection' | 'face-detection'
  | 'background-removal' | 'subject-selection' | 'sky-replacement' | 'style-transfer'
  | 'super-resolution' | 'denoising' | 'colorization' | 'auto-caption'
  | 'speech-to-text' | 'auto-edit' | 'smart-crop' | 'content-aware-fill'
  | 'portrait-enhancement' | 'neural-filter' | 'generative-fill';

export interface AIModel {
  id: string;
  name: string;
  type: AITaskType;
  version: string;
  loaded: boolean;
  path: string;
}

// ============================================================================
// TEMPLATES
// ============================================================================

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  type: 'project' | 'effect' | 'title' | 'transition' | 'layout';
  settings: ProjectSettings;
  content: any; // Timeline, Composition, or specific template data
  tags: string[];
}

export type TemplateCategory =
  | 'social-media' | 'youtube' | 'instagram' | 'tiktok' | 'facebook'
  | 'professional' | 'wedding' | 'corporate' | 'sports' | 'vlog'
  | 'photo-collage' | 'poster' | 'banner' | 'thumbnail';

// ============================================================================
// EXPORT AND RENDERING
// ============================================================================

export interface ExportSettings {
  format: ExportFormat;
  codec: string;
  quality: 'low' | 'medium' | 'high' | 'ultra' | 'custom';
  resolution: Size;
  frameRate: number;
  bitrate?: number;
  audioBitrate?: number;
  audioCodec?: string;
  colorSpace?: string;
  range: ExportRange;
  destination: string;
  fileName: string;
  metadata?: ExportMetadata;
}

export type ExportFormat =
  | 'mp4' | 'mov' | 'avi' | 'webm' | 'mkv' | 'gif'
  | 'png' | 'jpg' | 'tiff' | 'psd' | 'svg' | 'pdf'
  | 'mp3' | 'wav' | 'aac' | 'flac';

export interface ExportRange {
  type: 'full' | 'selection' | 'work-area' | 'custom';
  startTime?: number;
  endTime?: number;
}

export interface ExportMetadata {
  title?: string;
  author?: string;
  copyright?: string;
  description?: string;
  keywords?: string[];
}

export interface RenderJob {
  id: string;
  projectId: string;
  settings: ExportSettings;
  status: 'queued' | 'rendering' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentFrame?: number;
  totalFrames?: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  outputPath?: string;
}

// ============================================================================
// TOOLS AND SELECTION
// ============================================================================

export type Tool =
  | 'select' | 'move' | 'transform' | 'crop' | 'slice'
  | 'brush' | 'eraser' | 'clone' | 'healing' | 'patch'
  | 'lasso' | 'magic-wand' | 'quick-selection' | 'pen'
  | 'text' | 'shape' | 'gradient' | 'paint-bucket'
  | 'blur' | 'sharpen' | 'smudge' | 'dodge' | 'burn' | 'sponge'
  | 'eyedropper' | 'hand' | 'zoom';

export interface Selection {
  id: string;
  type: 'rectangular' | 'elliptical' | 'lasso' | 'polygonal' | 'magnetic' | 'magic-wand' | 'quick-selection';
  path: Point[];
  feather: number;
  antiAlias: boolean;
  inverted: boolean;
  active: boolean;
}

// ============================================================================
// HISTORY AND UNDO
// ============================================================================

export interface HistoryState {
  id: string;
  name: string;
  timestamp: Date;
  data: any; // Serialized state
}

export interface History {
  states: HistoryState[];
  currentIndex: number;
  maxStates: number;
}

// ============================================================================
// COLLABORATION
// ============================================================================

export interface CollaborationSession {
  id: string;
  projectId: string;
  users: CollaborationUser[];
  changes: CollaborationChange[];
  locked: boolean;
}

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: Point;
  activeLayer?: string;
  activeClip?: string;
}

export interface CollaborationChange {
  id: string;
  userId: string;
  timestamp: Date;
  type: string;
  data: any;
}

// ============================================================================
// PREFERENCES AND SETTINGS
// ============================================================================

export interface AppSettings {
  general: GeneralSettings;
  performance: PerformanceSettings;
  interface: InterfaceSettings;
  keyboard: KeyboardShortcuts;
}

export interface GeneralSettings {
  autosave: boolean;
  autosaveInterval: number; // In minutes
  defaultProjectLocation: string;
  recentProjects: string[];
  language: string;
}

export interface PerformanceSettings {
  maxMemory: number; // In GB
  cacheSize: number; // In GB
  gpuAcceleration: boolean;
  proxyResolution: '1/2' | '1/4' | '1/8';
  previewQuality: 'low' | 'medium' | 'high';
  renderThreads: number;
}

export interface InterfaceSettings {
  theme: 'light' | 'dark' | 'auto';
  uiScale: number;
  panelLayout: string;
  showTooltips: boolean;
  compactMode: boolean;
}

export interface KeyboardShortcuts {
  [action: string]: string;
}

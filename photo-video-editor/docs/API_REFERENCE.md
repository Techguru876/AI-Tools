# API Reference

Complete API documentation for all modules and services.

## Table of Contents

1. [VideoProcessor](#videoprocessor)
2. [ImageProcessor](#imageprocessor)
3. [AudioProcessor](#audioprocessor)
4. [AIService](#aiservice)
5. [ProjectManager](#projectmanager)
6. [ExportManager](#exportmanager)
7. [IPC API](#ipc-api)
8. [React Hooks](#react-hooks)

---

## VideoProcessor

### `importVideo(filePath: string): Promise<Asset>`

Import a video file and extract metadata.

**Parameters:**
- `filePath` - Absolute path to video file

**Returns:** Asset object with metadata

**Example:**
```typescript
const asset = await videoProcessor.importVideo('/path/to/video.mp4');
console.log(asset.duration); // Video duration in seconds
```

### `getMetadata(filePath: string): Promise<VideoMetadata>`

Extract detailed metadata from video file.

**Returns:**
```typescript
{
  duration: number;
  width: number;
  height: number;
  format: string;
  codec: string;
  bitrate: number;
  frameRate: number;
  colorSpace: string;
}
```

### `extractFrame(filePath: string, time: number): Promise<string>`

Extract a single frame at specified time.

**Parameters:**
- `filePath` - Path to video
- `time` - Timestamp in seconds

**Returns:** Base64-encoded JPEG image

### `applyEffect(clipId: string, effect: Effect): Promise<void>`

Apply effect to video clip.

**Effect Types:**
- `brightness-contrast`
- `gaussian-blur`
- `chroma-key`
- `color-grade`
- `sharpen`

**Example:**
```typescript
await videoProcessor.applyEffect('clip-123', {
  id: 'effect-1',
  name: 'Brightness',
  type: 'brightness-contrast',
  enabled: true,
  parameters: {
    brightness: 0.2,
    contrast: 1.1
  }
});
```

### `renderTimeline(timeline: Timeline, outputPath: string, onProgress?: (progress: number) => void): Promise<void>`

Render complete timeline to video file.

**Parameters:**
- `timeline` - Timeline object with tracks and clips
- `outputPath` - Where to save rendered video
- `onProgress` - Optional callback for progress updates (0-100)

---

## ImageProcessor

### `importImage(filePath: string): Promise<Asset>`

Import image file with metadata extraction.

### `resize(imageData: Buffer, width: number, height: number, fit?: 'contain' | 'cover' | 'fill'): Promise<Buffer>`

Resize image to specified dimensions.

**Example:**
```typescript
const resized = await imageProcessor.resize(
  imageBuffer,
  1920,
  1080,
  'contain'
);
```

### `crop(imageData: Buffer, left: number, top: number, width: number, height: number): Promise<Buffer>`

Crop image to rectangle.

### `rotate(imageData: Buffer, angle: number): Promise<Buffer>`

Rotate image by angle (in degrees).

### `applyAdjustment(layerId: string, adjustment: Adjustment): Promise<void>`

Apply adjustment to layer.

**Adjustment Types:**
- `brightness-contrast`
- `hue-saturation`
- `levels`
- `curves`
- `color-balance`
- `vibrance`

**Example:**
```typescript
await imageProcessor.applyAdjustment('layer-1', {
  id: 'adj-1',
  type: 'hue-saturation',
  enabled: true,
  parameters: {
    hue: 15,
    saturation: 20,
    lightness: 0
  }
});
```

### `applyFilter(layerId: string, filter: Effect): Promise<void>`

Apply filter effect to layer.

**Filter Types:**
- `gaussian-blur`
- `sharpen`
- `noise`
- `emboss`

### `composeLayers(composition: Composition, outputPath: string): Promise<void>`

Flatten all layers into final image.

---

## AudioProcessor

### `importAudio(filePath: string): Promise<Asset>`

Import audio file.

### `getWaveform(filePath: string, width?: number): Promise<number[]>`

Generate waveform data for visualization.

**Parameters:**
- `filePath` - Path to audio file
- `width` - Number of sample points (default: 1000)

**Returns:** Array of amplitude values (0-1)

### `applyEffect(clipId: string, effect: AudioEffect): Promise<void>`

Apply audio effect.

**Effect Types:**
- `equalizer` - Multi-band EQ
- `compressor` - Dynamic range compression
- `reverb` - Reverb effect
- `delay` - Echo/delay effect
- `noise-reduction` - Remove background noise

**Example:**
```typescript
await audioProcessor.applyEffect('audio-1', {
  id: 'fx-1',
  type: 'compressor',
  enabled: true,
  parameters: {
    threshold: -20,
    ratio: 4,
    attack: 5,
    release: 100,
    knee: 6
  }
});
```

### `mix(clips: AudioClip[], settings: AudioMixer, outputPath: string): Promise<void>`

Mix multiple audio tracks to single output.

### `normalize(filePath: string, targetLevel?: number): Promise<string>`

Normalize audio levels.

**Parameters:**
- `filePath` - Input audio file
- `targetLevel` - Target level in dBFS (default: -3)

**Returns:** Path to normalized file

---

## AIService

### `detectScenes(filePath: string): Promise<number[]>`

Detect scene changes in video.

**Returns:** Array of timestamps where scenes change

### `autoReframe(clipId: string, targetAspectRatio: string): Promise<void>`

Automatically reframe video for different aspect ratio.

**Parameters:**
- `clipId` - Video clip ID
- `targetAspectRatio` - Target ratio (e.g., '9:16' for vertical)

### `removeBackground(layerId: string): Promise<void>`

Remove background from image layer using AI.

### `selectSubject(layerId: string): Promise<void>`

Automatically select main subject in image.

### `enhancePortrait(layerId: string): Promise<void>`

Enhance portrait with AI (skin smoothing, eye enhancement, etc.)

### `upscale(layerId: string, scale: number): Promise<void>`

Upscale image using AI super-resolution.

**Parameters:**
- `layerId` - Layer to upscale
- `scale` - Scale factor (2x, 4x, etc.)

### `generateCaption(clipId: string): Promise<Array<{ time: number; text: string }>>`

Generate captions from speech in video.

**Returns:** Array of caption entries with timestamps

### `transcribe(audioPath: string): Promise<string>`

Transcribe audio to text.

---

## ProjectManager

### `createProject(settings: Partial<ProjectSettings>): Promise<Project>`

Create new project.

**Example:**
```typescript
const project = await projectManager.createProject({
  resolution: { width: 1920, height: 1080 },
  frameRate: 30,
  aspectRatio: '16:9'
});
```

### `openProject(filePath: string): Promise<Project>`

Open existing project file.

### `saveProject(project: Project, filePath?: string): Promise<string>`

Save project to file.

**Returns:** Path where project was saved

### `saveProjectAs(project: Project, filePath: string): Promise<string>`

Save project with new path.

### `getRecentProjects(limit?: number): Promise<Array<ProjectInfo>>`

Get list of recently opened projects.

---

## ExportManager

### `startExport(project: Project, settings: ExportSettings): Promise<string>`

Start export job.

**Returns:** Job ID for tracking progress

**ExportSettings:**
```typescript
{
  format: 'mp4' | 'mov' | 'png' | 'jpg' | ...,
  codec: 'h264' | 'hevc' | ...,
  quality: 'low' | 'medium' | 'high' | 'ultra' | 'custom',
  resolution: { width: number, height: number },
  frameRate: number,
  bitrate?: number,
  range: {
    type: 'full' | 'selection' | 'work-area',
    startTime?: number,
    endTime?: number
  },
  destination: string,
  fileName: string
}
```

### `cancelExport(jobId: string): void`

Cancel running export job.

### `getJob(jobId: string): RenderJob | undefined`

Get export job status.

**RenderJob:**
```typescript
{
  id: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  currentFrame?: number;
  totalFrames?: number;
  outputPath?: string;
  error?: string;
}
```

### `getPreset(presetName: string): Partial<ExportSettings>`

Get export preset configuration.

**Available Presets:**
- `youtube-4k`
- `youtube-1080p`
- `instagram-feed`
- `instagram-story`
- `tiktok`
- `web-image`
- `print-image`

---

## IPC API

All IPC channels for communication between renderer and main process.

### Project Operations

```typescript
// Create project
ipcRenderer.invoke('project:create', settings)

// Open project
ipcRenderer.invoke('project:open', filePath)

// Save project
ipcRenderer.invoke('project:save', project)
```

### Video Operations

```typescript
// Import video
ipcRenderer.invoke('video:import', filePath)

// Get metadata
ipcRenderer.invoke('video:get-metadata', filePath)

// Extract frame
ipcRenderer.invoke('video:extract-frame', filePath, time)

// Apply effect
ipcRenderer.invoke('video:apply-effect', clipId, effect)
```

### Image Operations

```typescript
// Import image
ipcRenderer.invoke('image:import', filePath)

// Resize
ipcRenderer.invoke('image:resize', imageData, width, height)

// Apply adjustment
ipcRenderer.invoke('image:apply-adjustment', layerId, adjustment)
```

### AI Operations

```typescript
// Remove background
ipcRenderer.invoke('ai:remove-background', layerId)

// Auto-reframe
ipcRenderer.invoke('ai:auto-reframe', clipId, aspectRatio)

// Generate captions
ipcRenderer.invoke('ai:generate-caption', clipId)
```

### Export Operations

```typescript
// Start export
ipcRenderer.invoke('export:start', project, settings)

// Listen for progress
ipcRenderer.on('export:progress', (data) => {
  console.log(`Progress: ${data.progress}%`);
})

// Cancel export
ipcRenderer.invoke('export:cancel', jobId)
```

---

## React Hooks

### `useProject()`

Access project state.

```typescript
const {
  project,
  setProject,
  addAsset,
  removeAsset,
  updateAsset,
  saveProject,
  isDirty,
  setIsDirty
} = useProject();
```

### `useTimeline()`

Access timeline state (video editing).

```typescript
const {
  timeline,
  setTimeline,
  playhead,
  setPlayhead,
  isPlaying,
  setIsPlaying,
  selectedClip,
  setSelectedClip,
  zoomLevel,
  setZoomLevel,
  addClip,
  removeClip,
  updateClip
} = useTimeline();
```

### `useTools()`

Access tool state (image editing).

```typescript
const {
  activeTool,
  setActiveTool,
  selection,
  setSelection,
  activeLayer,
  setActiveLayer,
  brushSize,
  setBrushSize,
  foregroundColor,
  setForegroundColor,
  backgroundColor,
  setBackgroundColor
} = useTools();
```

---

## Constants

All constants available in `shared/constants/index.ts`:

- `SUPPORTED_VIDEO_FORMATS`
- `SUPPORTED_IMAGE_FORMATS`
- `SUPPORTED_AUDIO_FORMATS`
- `DEFAULT_RESOLUTIONS`
- `DEFAULT_FRAME_RATES`
- `BLEND_MODES`
- `VIDEO_EFFECTS`
- `AUDIO_EFFECTS`
- `AI_FEATURES`
- `DEFAULT_SHORTCUTS`
- `EXPORT_PRESETS`

## Types

All TypeScript types available in `shared/types/index.ts`:

- `Project`
- `Timeline`, `Track`, `Clip`
- `Composition`, `Layer`
- `Asset`
- `Effect`, `Adjustment`, `Transition`
- `ColorGrading`, `ColorWheels`, `ColorCurves`
- `AudioClip`, `AudioEffect`
- `AITask`
- `ExportSettings`, `RenderJob`
- And many more...

---

## Error Handling

All methods that can fail throw descriptive errors:

```typescript
try {
  await videoProcessor.importVideo(filePath);
} catch (error) {
  console.error('Failed to import video:', error.message);
  // Handle error appropriately
}
```

## Events

Subscribe to events for real-time updates:

```typescript
// Export progress
exportManager.on('progress', (data) => {
  console.log(`Job ${data.jobId}: ${data.progress}%`);
});

// Export complete
exportManager.on('export-complete', (jobId, outputPath) => {
  console.log(`Export completed: ${outputPath}`);
});
```

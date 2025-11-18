# Architecture Documentation

## Overview

Pro Photo Video Editor is built with a modular architecture separating concerns between the main (Node.js) and renderer (React) processes, following Electron best practices.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Application                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐              ┌────────────────────┐   │
│  │  Main Process   │◄────IPC─────►│ Renderer Process   │   │
│  │   (Node.js)     │              │     (React)        │   │
│  └─────────────────┘              └────────────────────┘   │
│         │                                   │               │
│         ├─ VideoProcessor                   ├─ Timeline     │
│         ├─ ImageProcessor                   ├─ Layers       │
│         ├─ AudioProcessor                   ├─ Canvas       │
│         ├─ AIService                        ├─ Tools        │
│         ├─ ProjectManager                   └─ Export UI    │
│         └─ ExportManager                                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Main Process (Backend)

### Core Modules

#### 1. VideoProcessor

**Purpose**: Handle all video-related operations
**Dependencies**: FFmpeg
**Key Methods**:
- `importVideo(filePath)` - Import and analyze video
- `extractFrame(filePath, time)` - Get frame at timestamp
- `applyEffect(clipId, effect)` - Apply video effects
- `renderTimeline(timeline, outputPath)` - Render timeline to video

**Processing Pipeline**:
```
Video Import → Metadata Extraction → Proxy Generation →
Timeline Assembly → Effects Application → Rendering → Export
```

#### 2. ImageProcessor

**Purpose**: High-performance image processing
**Dependencies**: Sharp, Canvas API
**Key Methods**:
- `importImage(filePath)` - Import image with metadata
- `applyAdjustment(layerId, adjustment)` - Apply adjustments
- `applyFilter(layerId, filter)` - Apply filters
- `composeLayers(composition)` - Flatten layers to output

**Layer Compositing**:
```
Base Layer → Apply Blend Mode → Apply Mask →
Apply Effects → Composite Next Layer → Repeat → Output
```

#### 3. AudioProcessor

**Purpose**: Audio processing and mixing
**Dependencies**: Web Audio API, native audio libraries
**Key Methods**:
- `importAudio(filePath)` - Import audio file
- `getWaveform(filePath)` - Generate waveform data
- `applyEffect(clipId, effect)` - Apply audio effects
- `mix(clips, settings)` - Mix multiple audio tracks

**Audio Pipeline**:
```
Audio Input → Decode → Effects Chain → Mix →
Master Effects → Normalize → Encode → Output
```

#### 4. AIService

**Purpose**: AI-powered features and enhancements
**Dependencies**: TensorFlow.js, ONNX Runtime
**Key Methods**:
- `detectScenes(filePath)` - Detect scene changes
- `removeBackground(layerId)` - Remove image background
- `autoReframe(clipId, aspectRatio)` - Auto-reframe video
- `upscale(layerId, scale)` - AI upscaling

**Model Management**:
- Lazy loading of models
- Model caching
- GPU acceleration when available
- Fallback to CPU processing

#### 5. ProjectManager

**Purpose**: Project lifecycle management
**Key Responsibilities**:
- Project creation and loading
- Asset management
- Auto-save functionality
- Project serialization

**Project Structure**:
```json
{
  "id": "uuid",
  "name": "Project Name",
  "type": "video|image|hybrid",
  "settings": { /* resolution, framerate, etc */ },
  "timeline": { /* tracks, clips, markers */ },
  "composition": { /* layers, effects */ },
  "assets": [ /* imported media files */ ]
}
```

#### 6. ExportManager

**Purpose**: Rendering and export queue management
**Features**:
- Job queue with priorities
- Progress tracking
- Background rendering
- Multiple format support
- Export presets

**Export Pipeline**:
```
Project → Validate → Queue Job → Process Timeline/Composition →
Encode → Write File → Cleanup → Complete
```

## Renderer Process (Frontend)

### React Architecture

#### State Management

**Context Providers**:
1. **ProjectContext** - Global project state
2. **TimelineContext** - Video editing state
3. **ToolsContext** - Tool selection and options

**State Flow**:
```
User Action → Context Update → Component Re-render →
IPC Call (if needed) → Main Process → Result → Context Update
```

#### Component Structure

```
App
├── MenuBar
├── Toolbar
│   └── ToolButtons
├── Workspace
│   ├── AssetsPanel
│   ├── Canvas
│   │   └── (Video/Image Renderer)
│   ├── Timeline (video mode)
│   │   ├── PlaybackControls
│   │   ├── Ruler
│   │   └── Tracks
│   │       └── Clips
│   ├── LayersPanel (image mode)
│   │   └── LayerItems
│   └── PropertiesPanel
└── ExportDialog
```

### IPC Communication

**Pattern**: Request-Response using `ipcRenderer.invoke()`

```typescript
// Renderer → Main
const result = await window.electron.ipcRenderer.invoke(
  'video:import',
  filePath
);

// Main → Renderer (events)
window.electron.ipcRenderer.on('export:progress', (data) => {
  updateProgress(data);
});
```

## Data Flow

### Video Editing Flow

```
1. Import Media
   User selects file → IPC call → VideoProcessor.importVideo()
   → Asset created → Added to project → UI updated

2. Add to Timeline
   User drags asset → Create clip → Add to track →
   Timeline state updated → UI re-renders

3. Apply Effect
   User selects effect → IPC call → VideoProcessor.applyEffect()
   → Effect parameters stored → Clip marked for re-render

4. Export
   User clicks export → ExportManager.startExport() →
   Queue job → Render timeline → Encode → Save file →
   Progress updates via IPC → Complete notification
```

### Image Editing Flow

```
1. Import Image
   User opens image → ImageProcessor.importImage() →
   Create layer → Add to composition → Render on canvas

2. Apply Adjustment
   User adjusts slider → Update layer parameters →
   Re-render layer → Composite layers → Update canvas

3. Use AI Tool
   User clicks AI tool → AIService.loadModel() →
   Process image → Update layer → Re-render

4. Export
   User exports → ImageProcessor.composeLayers() →
   Flatten all layers → Save to file
```

## Performance Optimizations

### Video

1. **Proxy Editing**: Lower resolution versions for playback
2. **Frame Caching**: Cache recently accessed frames
3. **GPU Acceleration**: Hardware decoding when available
4. **Lazy Rendering**: Only render visible timeline section

### Images

1. **Layer Thumbnails**: Small previews instead of full res
2. **Tile-based Rendering**: Render only visible canvas area
3. **Operation Caching**: Cache adjustment results
4. **Smart Invalidation**: Only re-render affected layers

### AI

1. **Model Caching**: Keep frequently used models loaded
2. **Batch Processing**: Process multiple requests together
3. **Progressive Results**: Show intermediate results
4. **Worker Threads**: Offload heavy computation

## File Formats

### Project File (.pvep)
JSON format containing:
- Project metadata
- Timeline/composition structure
- Asset references (file paths)
- Effect parameters
- Custom metadata

### Supported Media Formats

**Video**: MP4, MOV, AVI, MKV, WebM
**Images**: JPEG, PNG, TIFF, PSD, RAW, WebP
**Audio**: MP3, WAV, AAC, FLAC

## Scalability

### Current Limitations
- Single project at a time
- Local processing only
- Limited by system resources

### Future Enhancements
- Multi-project support
- Cloud rendering
- Distributed processing
- Real-time collaboration

## Security Considerations

1. **File Access**: Sandboxed file operations
2. **IPC Security**: Validate all IPC messages
3. **External Content**: Sanitize user-provided paths
4. **Model Loading**: Verify model integrity

## Error Handling

### Strategy
1. **Graceful Degradation**: Continue operation when possible
2. **User Feedback**: Clear error messages
3. **Recovery**: Auto-save and crash recovery
4. **Logging**: Comprehensive error logging

### Error Flow
```
Error Occurs → Log to console → Display user-friendly message →
Attempt recovery → If critical, save state → Notify user
```

## Testing Strategy

1. **Unit Tests**: Core processing modules
2. **Integration Tests**: IPC communication
3. **E2E Tests**: User workflows
4. **Performance Tests**: Rendering benchmarks

## Build and Deployment

### Development
```bash
npm run dev          # Start with hot reload
```

### Production Build
```bash
npm run build        # Compile TypeScript
npm run build:windows  # Package for Windows
npm run build:mac      # Package for macOS
```

### Distribution
- Windows: NSIS installer + portable
- macOS: DMG with code signing
- Auto-updates: Electron auto-updater (future)

## Monitoring and Analytics

### Metrics to Track
- Rendering performance
- Export success rates
- AI model accuracy
- Crash reports
- User feature adoption

### Tools
- Electron crash reporter
- Custom analytics (optional)
- Performance profiling tools

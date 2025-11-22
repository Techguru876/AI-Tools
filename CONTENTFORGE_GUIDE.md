# ContentForge Studio - Complete Guide

**Automated YouTube Content Generation System**

ContentForge Studio is a template-based video automation platform for creating faceless YouTube content at scale. Generate 10-50 videos per day with minimal manual intervention.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Systems](#core-systems)
4. [Getting Started](#getting-started)
5. [Template System](#template-system)
6. [Batch Processing](#batch-processing)
7. [API Reference](#api-reference)
8. [Creating Templates](#creating-templates)
9. [Roadmap](#roadmap)

---

## Overview

### What is ContentForge Studio?

ContentForge Studio transforms video content creation from manual editing into automated batch processing:

- **Template-Based**: Define video structure once, generate infinite variations
- **Batch Processing**: Queue 100+ videos, render overnight with 2 concurrent jobs
- **AI Integration**: Auto-generate scripts, voices, and images (coming soon)
- **YouTube Ready**: Direct publishing with SEO-optimized metadata (coming soon)
- **Multi-Niche**: Lofi, horror stories, explainers, motivational content, and more

### Key Differences from Traditional Editors

| Traditional Editor | ContentForge Studio |
|-------------------|---------------------|
| Manual timeline editing | Template + variables |
| One video at a time | Batch queue processing |
| Manual asset selection | AI content generation |
| Manual export | Automated rendering |
| Manual upload | Direct YouTube publishing |

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│  Dashboard • Templates • Batch Queue • Settings     │
└──────────────────┬──────────────────────────────────┘
                   │ IPC Bridge (Electron)
┌──────────────────┴──────────────────────────────────┐
│               Main Process (Node.js)                 │
├─────────────────────────────────────────────────────┤
│  Template Engine  │  Batch Processor  │  Services   │
│  ✓ Variable Sub   │  ✓ Queue Mgmt     │  ✓ FFmpeg   │
│  ✓ Validation     │  ✓ Parallel Jobs  │  ✓ SQLite   │
│  ✓ Database       │  ✓ Progress Track │  ✓ Sharp    │
└─────────────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
  Native FFmpeg        Content Generation
  Compositor           (GPT-4, ElevenLabs)
```

### Directory Structure

```
contentforge-studio/
├── main/                           # Electron main process
│   ├── main.ts                     # App entry point
│   ├── preload.ts                  # IPC bridge
│   ├── ipc-handlers.ts             # IPC routing
│   └── services/
│       ├── templates/
│       │   ├── TemplateEngine.ts   # Core template system
│       │   ├── lofi-template.ts    # Lofi template definition
│       │   └── index.ts            # Template registry
│       ├── batch/
│       │   └── BatchProcessor.ts   # Queue management
│       ├── FFmpegCompositor.ts     # Video rendering
│       ├── project-service.ts      # Project management
│       ├── asset-service.ts        # Media import/processing
│       ├── timeline-service.ts     # Timeline operations
│       └── export-service.ts       # Video export
├── src/                            # React frontend
│   ├── components/
│   │   ├── dashboard/              # Main dashboard
│   │   ├── templates/              # Template selector
│   │   └── batch/                  # Batch queue UI
│   └── lib/
│       └── electron-bridge.ts      # Frontend API wrapper
└── ~/ContentForge/                 # User data
    ├── contentforge.db             # SQLite database
    ├── templates/                  # Custom templates
    ├── temp/                       # Temp files
    └── output/                     # Rendered videos
```

---

## Core Systems

### 1. Template Engine

The Template Engine is the heart of ContentForge. It manages video templates with variable substitution.

**Key Features:**
- ✅ Variable substitution using `${VARIABLE}` syntax
- ✅ Type validation (string, number, boolean, image, video, audio)
- ✅ Layer-based composition (video, image, audio, text, effects)
- ✅ SQLite persistence
- ✅ Clone and modify templates

**Example Template Structure:**

```typescript
{
  id: "lofi_stream_v1",
  name: "Lofi Hip Hop Stream",
  niche: "lofi",
  duration: 3600,
  resolution: [1920, 1080],
  framerate: 30,
  layers: [
    {
      id: "bg_layer",
      type: "image",
      properties: {
        source: "${BACKGROUND_IMAGE}",  // Variable!
        filters: [...]
      }
    },
    {
      id: "audio",
      type: "audio",
      properties: {
        source: "${AUDIO_FILE}",        // Variable!
        volume: 1.0
      }
    }
  ],
  variables: {
    BACKGROUND_IMAGE: {
      type: "image",
      required: true,
      description: "Main background image"
    },
    AUDIO_FILE: {
      type: "audio",
      required: true,
      description: "Lofi music track"
    }
  }
}
```

### 2. Batch Processor

Manages a queue of rendering jobs with parallel processing.

**Features:**
- ✅ SQLite-backed job queue
- ✅ Parallel rendering (configurable concurrency)
- ✅ Real-time progress tracking
- ✅ Event-driven architecture
- ✅ Automatic retry on failure (coming soon)
- ✅ Priority queuing (coming soon)

**Job Lifecycle:**

```
queued → processing → completed
   ↓
cancelled/failed
```

**Events:**
- `job-queued`: Job added to queue
- `job-started`: Rendering began
- `job-progress`: Progress update (0-100%)
- `job-completed`: Success
- `job-failed`: Error occurred
- `queue-empty`: All jobs finished

### 3. FFmpeg Compositor

Renders resolved templates into final video files using FFmpeg's `filter_complex`.

**Capabilities:**
- ✅ Multi-layer video composition
- ✅ Ken Burns effect (zoom/pan on images)
- ✅ Audio visualizers (showcqt)
- ✅ Text overlays with custom fonts
- ✅ Blend modes and effects
- ✅ Hardware acceleration ready (future)

**Performance:**
- 1-hour lofi video: ~6 minutes render time
- Complexity estimation before rendering
- Progress tracking with FFmpeg callbacks

---

## Getting Started

### Installation

```bash
# Clone repository
git clone https://github.com/Techguru876/AI-Tools.git
cd AI-Tools

# Install dependencies
npm install

# Compile backend
npm run compile:main
npm run compile:preload

# Start development
npm run dev
```

### First Time Setup

1. **Initialize Built-in Templates**

```typescript
import { templates } from './lib/electron-bridge';

// Initialize lofi template
await templates.initBuiltIn();
```

2. **Verify Template Installation**

```typescript
const allTemplates = await templates.list();
console.log(allTemplates);
// [{ id: "lofi_stream_v1", name: "Lofi Hip Hop Stream", ... }]
```

3. **Check Batch Processor Status**

```typescript
import { batch } from './lib/electron-bridge';

const stats = await batch.getStats();
console.log(stats);
// { total: 0, pending: 0, processing: 0, completed: 0 }
```

---

## Template System

### Using an Existing Template

**Step 1: Get Template**

```typescript
import { templates } from './lib/electron-bridge';

const lofiTemplate = await templates.get('lofi_stream_v1');
```

**Step 2: Validate Variables**

```typescript
const variables = {
  BACKGROUND_IMAGE: '/path/to/anime-scene.jpg',
  AUDIO_FILE: '/path/to/lofi-track.mp3',
  CHANNEL_NAME: 'My Lofi Channel',
  TITLE_TEXT: 'chill lofi beats 🎵',
  VISUALIZER_COLOR: '#4A90E2',
  OVERLAY_EFFECT: 'rain',
  DURATION: 3600
};

const validation = await templates.validate('lofi_stream_v1', variables);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

**Step 3: Queue for Rendering**

```typescript
import { batch } from './lib/electron-bridge';

const jobId = await batch.addJob({
  templateId: 'lofi_stream_v1',
  variables: variables,
  outputPath: '/path/to/output/lofi-video-001.mp4',
  metadata: {
    youtube_upload: true,
    youtube_metadata: {
      title: 'Lofi Hip Hop Radio - Beats to Study/Relax',
      description: 'Chill lofi beats...',
      tags: ['lofi', 'study', 'relax']
    }
  }
});

console.log('Job queued:', jobId);
```

**Step 4: Monitor Progress**

```typescript
batch.onJobProgress((jobId, progress, stage) => {
  console.log(`Job ${jobId}: ${progress}% - ${stage}`);
});

batch.onJobCompleted((job) => {
  console.log('✓ Completed:', job.output_path);
});

batch.onJobFailed((job, error) => {
  console.error('✗ Failed:', error);
});
```

### Batch Processing Multiple Videos

Generate 50 lofi videos overnight:

```typescript
import { batch } from './lib/electron-bridge';

const backgrounds = [
  '/assets/anime-1.jpg',
  '/assets/anime-2.jpg',
  // ... 50 images
];

const tracks = [
  '/music/track-1.mp3',
  '/music/track-2.mp3',
  // ... 50 tracks
];

const jobs = backgrounds.map((bg, i) => ({
  templateId: 'lofi_stream_v1',
  variables: {
    BACKGROUND_IMAGE: bg,
    AUDIO_FILE: tracks[i],
    CHANNEL_NAME: 'Lofi Radio 24/7',
    TITLE_TEXT: `lofi hip hop radio ${i + 1} 📚`,
    VISUALIZER_COLOR: '#FF6B9D',
    OVERLAY_EFFECT: 'rain',
    DURATION: 3600
  },
  outputPath: `/output/lofi-${String(i + 1).padStart(3, '0')}.mp4`
}));

// Add all 50 jobs to queue
const jobIds = await batch.addJobs(jobs);
console.log(`Queued ${jobIds.length} jobs`);

// Batch processor will render 2 at a time automatically
```

---

## API Reference

### Template API

```typescript
import { templates } from './lib/electron-bridge';

// List all templates
const all = await templates.list();
const lofiOnly = await templates.list('lofi');

// Get specific template
const template = await templates.get('lofi_stream_v1');

// Save custom template
await templates.save({
  id: 'my_custom_template',
  name: 'My Custom Template',
  niche: 'custom',
  // ... full template definition
});

// Delete template
await templates.delete('template_id');

// Clone template
const clone = await templates.clone('lofi_stream_v1', 'My Lofi Clone');

// Resolve variables
const resolved = await templates.resolve('lofi_stream_v1', variables);

// Validate variables
const validation = await templates.validate('lofi_stream_v1', variables);

// Get statistics
const stats = await templates.getStats();
// { total: 5, byNiche: { lofi: 2, horror: 1, ... } }
```

### Batch API

```typescript
import { batch } from './lib/electron-bridge';

// Add single job
const jobId = await batch.addJob({
  templateId: 'template_id',
  variables: { ... },
  outputPath: '/path/to/output.mp4',
  metadata: { ... }
});

// Add multiple jobs
const jobIds = await batch.addJobs([...]);

// Get job details
const job = await batch.getJob(jobId);

// List jobs
const allJobs = await batch.listJobs();
const pendingJobs = await batch.listJobs('pending');
const latest10 = await batch.listJobs(undefined, 10);

// Cancel job
await batch.cancelJob(jobId);

// Clear finished jobs
const cleared = await batch.clearFinished();

// Get statistics
const stats = await batch.getStats();
// {
//   total: 100,
//   pending: 20,
//   processing: 2,
//   completed: 75,
//   failed: 3,
//   averageRenderTime: 360000  // ms
// }

// Control processing
await batch.startProcessing();
await batch.stopProcessing();
```

### Batch Events

```typescript
// Job queued
batch.onJobQueued((job) => {
  console.log('Queued:', job.id);
});

// Job started
batch.onJobStarted((job) => {
  console.log('Started:', job.id);
});

// Progress update
batch.onJobProgress((jobId, progress, stage) => {
  console.log(`${jobId}: ${progress}% - ${stage}`);
  // "job_123: 45% - encoding"
});

// Job completed
batch.onJobCompleted((job) => {
  console.log('Completed:', job.output_path);
});

// Job failed
batch.onJobFailed((job, error) => {
  console.error('Failed:', error);
});

// Queue empty
batch.onQueueEmpty(() => {
  console.log('All jobs finished!');
});
```

---

## Creating Templates

### Template Anatomy

A template consists of:

1. **Metadata**: ID, name, niche, description
2. **Settings**: Duration, resolution, framerate
3. **Layers**: Visual/audio elements (z-index sorted)
4. **Variables**: Configurable inputs with validation

### Layer Types

**Image Layer:**
```typescript
{
  id: 'bg',
  type: 'image',
  start_time: 0,
  duration: 3600,
  z_index: 0,
  properties: {
    source: '${BACKGROUND_IMAGE}',
    filters: [
      { type: 'scale', params: { width: 1920, height: 1080 } },
      { type: 'gblur', params: { sigma: 2 } }
    ]
  }
}
```

**Video Layer:**
```typescript
{
  id: 'intro',
  type: 'video',
  start_time: 0,
  duration: 10,
  z_index: 10,
  properties: {
    source: '${INTRO_VIDEO}',
    volume: 0.5
  }
}
```

**Audio Layer:**
```typescript
{
  id: 'music',
  type: 'audio',
  start_time: 0,
  duration: 3600,
  z_index: 0,
  properties: {
    source: '${AUDIO_FILE}',
    volume: 1.0,
    loop: true,
    fade_in: 2.0,
    fade_out: 2.0
  }
}
```

**Text Layer:**
```typescript
{
  id: 'title',
  type: 'text',
  start_time: 0,
  duration: 3600,
  z_index: 4,
  properties: {
    text: '${TITLE_TEXT}',
    font: 'Arial',
    font_size: 42,
    color: '#FFFFFF',
    stroke_color: '#000000',
    stroke_width: 2,
    position: { x: 'center', y: 80 },
    shadow: {
      offset_x: 2,
      offset_y: 2,
      blur: 5,
      color: '#00000080'
    }
  }
}
```

**Effect Layer:**
```typescript
{
  id: 'visualizer',
  type: 'effect',
  start_time: 0,
  duration: 3600,
  z_index: 2,
  properties: {
    visualizer_type: 'circular_bars',
    position: { x: 1600, y: 850 },
    color: '${VISUALIZER_COLOR}',
    audio_source: '${AUDIO_FILE}',
    ffmpeg_filter: 'showcqt'
  }
}
```

### Variable Validation

```typescript
variables: {
  DURATION: {
    type: 'number',
    required: false,
    default: 3600,
    validation: {
      min: 60,
      max: 86400
    }
  },
  CHANNEL_NAME: {
    type: 'string',
    required: true,
    validation: {
      pattern: '^[a-zA-Z0-9 ]{3,50}$'
    }
  },
  VISUALIZER_COLOR: {
    type: 'color',
    required: false,
    default: '#FF6B9D',
    validation: {
      pattern: '^#[0-9A-Fa-f]{6}$'
    }
  },
  OVERLAY_EFFECT: {
    type: 'string',
    required: false,
    default: 'rain',
    validation: {
      enum: ['rain', 'snow', 'none']
    }
  }
}
```

---

## Roadmap

### ✅ Phase 1: Core Foundation (COMPLETED)

- [x] Template Engine with variable substitution
- [x] Lofi template (first complete workflow)
- [x] Batch Processor with queue management
- [x] FFmpeg Compositor for rendering
- [x] IPC API setup

### 🚧 Phase 2: Content Generation (IN PROGRESS)

- [ ] ScriptGenerator (GPT-4 integration)
- [ ] VoiceGenerator (ElevenLabs + OpenAI TTS)
- [ ] ImageGenerator (DALL-E integration)
- [ ] Horror Story template with AI

### 📋 Phase 3: YouTube Integration (PLANNED)

- [ ] YouTube Data API v3 setup
- [ ] Metadata generator with SEO optimization
- [ ] Direct upload with progress tracking
- [ ] Playlist management
- [ ] Thumbnail upload

### 📋 Phase 4: Frontend Dashboard (PLANNED)

- [ ] Main dashboard with stats
- [ ] Template selector UI
- [ ] Batch queue manager
- [ ] Job progress visualization
- [ ] Settings panel

### 📋 Phase 5: Additional Templates (PLANNED)

- [ ] Horror Story (narration + visuals)
- [ ] Explainer Video (text + animations)
- [ ] Motivational Quotes (images + music)
- [ ] News Compilation (text-to-speech)
- [ ] Fun Facts (trivia format)

### 📋 Phase 6: Advanced Features (FUTURE)

- [ ] Hardware-accelerated encoding (NVENC, VideoToolbox)
- [ ] Multi-platform publishing (TikTok, Instagram)
- [ ] Analytics dashboard
- [ ] A/B testing for thumbnails/titles
- [ ] Cloud rendering cluster

---

## Performance

### Expected Render Times

| Template | Duration | Complexity | Render Time (est.) |
|----------|----------|------------|-------------------|
| Lofi Stream | 1 hour | Medium | ~6 minutes |
| Horror Story | 10 min | High | ~2 minutes |
| Explainer | 5 min | Low | ~1 minute |

*Times based on 2020+ CPU, no GPU acceleration*

### Optimization Tips

1. **Use Proxies**: Generate low-res proxies for faster iteration
2. **Limit Concurrent Jobs**: 2 jobs = optimal CPU usage
3. **Queue Overnight**: Render 50+ videos while you sleep
4. **Reuse Assets**: Same backgrounds = faster encoding
5. **Hardware Acceleration**: NVENC/VideoToolbox (coming soon)

---

## Support

For issues or questions:
- Check ELECTRON_MIGRATION.md for migration details
- Review service layer code in `main/services/`
- Check Electron DevTools console
- Review FFmpeg output in terminal

---

**ContentForge Studio v1.0.0** - Automated YouTube Content at Scale 🚀

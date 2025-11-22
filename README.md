# ContentForge Studio

AI-Powered Video Content Generation Platform - Create viral-ready videos for YouTube with genre-specific studios and automated workflows.

## 🚀 Overview

ContentForge Studio is a comprehensive AI-powered content generation platform that helps creators produce high-quality videos for YouTube across 10 specialized genres. Built with Electron, React, and TypeScript, it combines multiple AI services (OpenAI, ElevenLabs) with powerful automation tools to streamline video production.

## 🎬 Studio Suite

ContentForge Studio includes 10 genre-specific mini-apps, each optimized for different content types:

### 🚀 ContentForge Studio (Core)
Advanced content generation and automation hub with template system, batch processing, and AI integration.

**Features:**
- Template-based video generation
- Batch processing queue
- AI script generation
- Voice synthesis (ElevenLabs + OpenAI)
- AI image generation (DALL-E)
- YouTube automation & metadata generation
- Cost tracking & caching system

### 🎵 Lofi Studio
Create ambient lofi music videos with AI-generated visuals and relaxing soundscapes.

**Features:**
- Lofi music integration
- AI-generated ambient backgrounds
- Animated visualizers
- Mood-based generation (chill, cozy, dreamy, nostalgic)

### 💭 Quotes Studio
Generate motivational and inspirational quote videos.

**Features:**
- AI-powered quote generation
- Typography animation
- Background music integration
- Batch quote processing

### 📚 Explainer Studio
Educational and "Top 10" style videos with professional narration.

**Features:**
- Topic-based script generation
- AI narration
- Visual aids integration
- Target audience customization

### 🎧 ASMR Studio
Relaxation and ambient content creation.

**Features:**
- ASMR sound library
- Ambient scene generation
- Trigger combination tools

### 📖 Storytelling Studio
Audiobooks and narrative content.

**Features:**
- Story script generation
- Character voice customization
- Chapter management
- Background music mixing

### ⏱️ Productivity Studio (Study)
Pomodoro timers and study content.

**Features:**
- Timer configurations
- Focus music integration
- Study ambient scenes

### 🎃 Horror Studio
Horror stories and creepypasta content.

**Features:**
- Horror script generation
- Atmospheric scene generation
- Tension pacing tools
- POV selection (first/third person)

### 📰 News Studio
News and trending topic videos.

**Features:**
- News script templates
- Breaking news formatting
- Trending topic integration

### 😂 Meme Studio
Viral memes and reaction content.

**Features:**
- Meme template library
- Trend detection
- Viral optimization tools

## 🏗 Architecture

**Frontend:**
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5.4
- **Desktop**: Electron 28
- **State Management**: Zustand
- **Styling**: CSS Modules + Theme System

**Backend Services:**
- **Database**: SQLite (better-sqlite3)
- **AI Integration**: OpenAI GPT-4, DALL-E 3
- **Voice Synthesis**: ElevenLabs, OpenAI TTS
- **Video Processing**: FFmpeg
- **YouTube API**: OAuth2 + Data API v3

## 📁 Project Structure

```
contentforge-studio/
├── src/                          # Frontend React application
│   ├── components/               # UI components
│   │   ├── StudioSuite.tsx       # Main studio selector
│   │   ├── contentforge/         # ContentForge core studio
│   │   ├── lofi/                 # Lofi studio
│   │   ├── quotes/               # Quotes studio
│   │   ├── explainer/            # Explainer studio
│   │   ├── asmr/                 # ASMR studio
│   │   ├── storytelling/         # Storytelling studio
│   │   ├── productivity/         # Productivity studio
│   │   ├── horror/               # Horror studio
│   │   ├── news/                 # News studio
│   │   ├── meme/                 # Meme studio
│   │   ├── Settings.tsx          # App settings
│   │   └── common/               # Shared components
│   ├── lib/                      # Libraries
│   │   └── electron-bridge.ts    # Electron IPC bridge
│   ├── stores/                   # State management
│   ├── utils/                    # Utilities
│   │   └── logger.ts             # Logging system
│   ├── theme/                    # Theme system
│   └── main.tsx                  # App entry point
│
├── main/                         # Electron main process
│   ├── main.ts                   # Application entry
│   ├── preload.ts                # Preload script
│   └── services/                 # Backend services
│       ├── project-service.ts    # Project management
│       ├── asset-service.ts      # Asset handling
│       ├── templates/            # Template engine
│       ├── batch/                # Batch processing
│       ├── contentforge/         # AI services
│       │   ├── script-gen.ts     # Script generation
│       │   ├── voice-gen.ts      # Voice synthesis
│       │   ├── image-gen.ts      # Image generation
│       │   └── youtube.ts        # YouTube integration
│       └── database/             # SQLite management
│
├── scripts/                      # Build scripts
├── package.json                  # Dependencies
└── vite.config.ts                # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **System Dependencies**:
  - Windows: Visual Studio C++ Build Tools (for native modules)
  - macOS: Xcode Command Line Tools
  - Linux: build-essential, python3

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Techguru876/AI-Tools.git
cd AI-Tools
```

2. Install dependencies:
```bash
npm install
```

3. Rebuild native modules for Electron:
```bash
# Windows
npx @electron/rebuild -v 28.0.0 -w better-sqlite3 -f

# macOS/Linux
npx @electron/rebuild -v 28.0.0 -w better-sqlite3
```

### Development

1. Compile the main process:
```bash
npm run compile:main
```

2. Start the development server:
```bash
npm run dev
```

This launches:
- Frontend dev server on http://localhost:5173
- Electron window with hot reload

### Building

Build for production:
```bash
npm run build
npm run electron:build
```

## 🔑 API Configuration

ContentForge Studio requires API keys for AI features:

1. **OpenAI API Key** (Required)
   - Used for: Script generation, image generation (DALL-E), TTS
   - Get it at: https://platform.openai.com/api-keys

2. **ElevenLabs API Key** (Optional)
   - Used for: High-quality voice synthesis
   - Get it at: https://elevenlabs.io/

3. **YouTube OAuth2 Credentials** (Optional)
   - Used for: Video upload automation
   - Set up at: https://console.cloud.google.com/

Configure API keys in Settings (⚙️ icon in header).

## 📊 Template System

ContentForge uses a powerful template system for video generation:

**Template Features:**
- Variable substitution (e.g., `{{topic}}`, `{{duration}}`)
- Conditional sections
- AI-driven content generation
- Batch processing support
- Built-in templates for all genres

**Example Template:**
```json
{
  "id": "horror-story-v1",
  "name": "Horror Story Template",
  "niche": "horror",
  "variables": ["theme", "setting", "duration"],
  "script": "{{ai:generate_horror_script}}",
  "voice": "{{ai:voice_synthesis}}",
  "visuals": "{{ai:generate_scenes}}"
}
```

## 🎯 Batch Processing

Generate multiple videos automatically:

1. Create or select a template
2. Prepare CSV with variables (topic, theme, etc.)
3. Add to batch queue
4. Start processing
5. Monitor progress in real-time
6. Export completed videos

**Batch Features:**
- Queue management
- Progress tracking
- Error recovery
- Cost estimation
- Auto-scheduling

## 📈 Cost Tracking

Monitor AI API usage and costs:

- **OpenAI**: Track GPT-4 tokens, DALL-E images, TTS characters
- **ElevenLabs**: Track character usage
- **Caching**: Reduce costs by caching AI responses
- **Statistics**: View detailed cost breakdowns by service

## 🎨 Theme System

ContentForge features a comprehensive theming system:

- **Professional Dark** (Default)
- **Midnight Blue**
- **Sunset Orange**
- **Forest Green**
- **Royal Purple**
- **Neon Cyber**

Each theme is optimized for long editing sessions with reduced eye strain.

## 📝 Logging System

Comprehensive logging for debugging and monitoring:

- **User Actions**: Track all user interactions
- **System Events**: Monitor app lifecycle
- **API Calls**: Log all AI service requests
- **Errors**: Detailed error tracking

Access logs: `Ctrl+Shift+L` or click the 📋 Logs button.

## 🔧 Development

### Main Process Development

The main process (Electron backend) is written in TypeScript and compiled to JavaScript:

```bash
# Watch mode for development
npm run compile:main:watch

# Build once
npm run compile:main
```

### Renderer Process Development

The renderer (React frontend) uses Vite for hot module replacement:

```bash
npm run dev
```

### Database

SQLite database location:
- **Windows**: `C:\Users\<username>\PhotoVideoPro\projects.db`
- **macOS**: `~/PhotoVideoPro/projects.db`
- **Linux**: `~/PhotoVideoPro/projects.db`

## 🤝 Contributing

This is a demonstration project showcasing professional-grade architecture for AI-powered content generation. Contributions welcome!

**Areas for Contribution:**
- New studio templates
- AI prompt optimization
- Additional AI service integrations
- Performance improvements
- Bug fixes

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with:
- **Electron**: Cross-platform desktop framework
- **React**: UI framework
- **TypeScript**: Type safety
- **OpenAI**: GPT-4, DALL-E, TTS
- **ElevenLabs**: Voice synthesis
- **FFmpeg**: Video processing
- **better-sqlite3**: Database management

---

**ContentForge Studio** - AI-Powered Video Content Generation

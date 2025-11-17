# Feature Specifications

## Core Features (MVP)

### 1. Project Dashboard

#### Overview
Centralized hub for managing all video projects, drafts, templates, and analytics.

#### Features
- **Home View**: Quick stats, recent videos, performance trends
- **Project Manager**: Organize videos into projects/collections
- **Drafts**: Access unfinished videos
- **Templates**: Browse and apply templates
- **Scheduled Videos**: View and manage scheduled publications
- **Analytics**: High-level performance metrics

#### Technical Implementation

```typescript
// API Endpoints
GET    /api/dashboard/stats
GET    /api/dashboard/recent-videos
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id

// State Management
interface DashboardState {
  stats: {
    videosCreated: number;
    totalViews: number;
    engagementRate: number;
    storageUsed: number;
  };
  recentVideos: Video[];
  trendData: TrendData[];
  loading: boolean;
}
```

#### User Stories
- As a creator, I want to see my performance at a glance
- As a creator, I want to quickly access my recent work
- As a creator, I want to organize videos into projects
- As a creator, I want AI recommendations for what to create next

---

### 2. Niche/Topic Research with AI

#### Overview
AI-powered content research that analyzes trends, competition, and viral potential.

#### Features
- **Niche Selection**: Pre-defined and custom niches
- **Trend Analysis**: Real-time trending topics from YouTube, TikTok, Google Trends
- **Competition Assessment**: Analyze difficulty and opportunity
- **Keyword Research**: SEO-optimized keyword suggestions
- **Title Generator**: AI-generated attention-grabbing titles
- **Viral Score**: Predictive scoring for viral potential

#### Technical Implementation

```typescript
// AI Service Integration
class NicheResearchService {
  async analyzeTrends(niche: string): Promise<TrendAnalysis> {
    // 1. Fetch data from multiple sources
    const [youtubeData, tiktokData, googleTrends] = await Promise.all([
      this.fetchYouTubeTrends(niche),
      this.fetchTikTokTrends(niche),
      this.fetchGoogleTrends(niche)
    ]);

    // 2. Analyze with AI
    const analysis = await this.aiService.analyze({
      prompt: `Analyze these trends for ${niche}...`,
      data: { youtubeData, tiktokData, googleTrends }
    });

    // 3. Calculate scores
    return {
      topics: analysis.topics.map(topic => ({
        ...topic,
        viralScore: this.calculateViralScore(topic),
        competition: this.assessCompetition(topic),
        keywords: this.extractKeywords(topic)
      }))
    };
  }

  private calculateViralScore(topic: Topic): number {
    const factors = {
      searchVolume: topic.searchVolume / 1000000,  // Normalize
      trendDirection: topic.trendGrowth / 100,     // Growth %
      engagement: topic.avgEngagement / 10,         // Engagement %
      competition: 1 - (topic.competitorCount / 1000) // Inverse
    };

    return (
      factors.searchVolume * 0.3 +
      factors.trendDirection * 0.3 +
      factors.engagement * 0.25 +
      factors.competition * 0.15
    ) * 100;
  }
}

// API Endpoints
GET  /api/research/niches
GET  /api/research/trends/:niche
POST /api/research/analyze
GET  /api/research/keywords/:topic
POST /api/research/title-suggestions
```

#### Data Sources
- **YouTube Data API**: Video stats, trending topics, search volumes
- **TikTok API**: Trending hashtags, video performance
- **Google Trends API**: Search interest over time
- **Custom ML Models**: Sentiment analysis, topic clustering

#### User Stories
- As a creator, I want to discover trending topics in my niche
- As a creator, I want to know if a topic is worth pursuing
- As a creator, I want keyword suggestions for better SEO
- As a creator, I want title ideas that will get clicks

---

### 3. Script & Scene Builder

#### Overview
AI-assisted script generation with visual scene-by-scene breakdown.

#### Features

**Script Generation:**
- Length selection (short, medium, long)
- Tone/style selection (casual, professional, educational, entertaining)
- Target audience specification
- Key points to cover
- Hook, introduction, main content, conclusion, CTA structure

**Scene Cards:**
- Automatic scene segmentation from script
- Visual preview for each scene
- Timing/duration for each scene
- Background selection (stock, AI-generated, upload)
- Overlay and text options
- Scene type classification (intro, main, outro, transition)

#### Technical Implementation

```typescript
// Script Generation Service
class ScriptGeneratorService {
  async generateScript(params: ScriptParams): Promise<Script> {
    const { topic, length, tone, audience, keyPoints } = params;

    // 1. Generate script with AI
    const scriptText = await this.aiService.generate({
      model: 'gpt-4',
      prompt: this.buildScriptPrompt(params),
      maxTokens: this.getTokensForLength(length),
      temperature: 0.7
    });

    // 2. Segment into scenes
    const scenes = await this.segmentIntoScenes(scriptText);

    // 3. Estimate timing
    const timedScenes = this.calculateSceneTiming(scenes);

    // 4. Recommend visuals
    const enrichedScenes = await this.recommendVisuals(timedScenes);

    return {
      text: scriptText,
      scenes: enrichedScenes,
      metadata: {
        wordCount: this.countWords(scriptText),
        estimatedDuration: this.estimateDuration(scriptText),
        tone, audience
      }
    };
  }

  private buildScriptPrompt(params: ScriptParams): string {
    return `
Create a ${params.length} video script about "${params.topic}"
in a ${params.tone} tone for ${params.audience} audience.

Key points to cover:
${params.keyPoints.map(p => `- ${p}`).join('\n')}

Structure:
1. Hook (first 5-10 seconds to grab attention)
2. Introduction (set context and promise value)
3. Main Content (deliver on the promise)
4. Conclusion (summarize key points)
5. Call to Action (clear next step for viewers)

Requirements:
- Conversational and engaging language
- Clear transitions between sections
- Strategic pauses for emphasis
- Visual cues for editing (e.g., "[Show screenshot]")
`;
  }

  private async segmentIntoScenes(script: string): Promise<Scene[]> {
    // Use NLP to detect natural breakpoints
    const paragraphs = script.split('\n\n');

    return paragraphs.map((text, index) => ({
      id: generateId(),
      orderIndex: index,
      scriptText: text,
      sceneType: this.detectSceneType(text, index, paragraphs.length),
      visualCues: this.extractVisualCues(text)
    }));
  }

  private calculateSceneTiming(scenes: Scene[]): Scene[] {
    const wordsPerMinute = 150; // Average speaking pace
    let currentTime = 0;

    return scenes.map(scene => {
      const wordCount = this.countWords(scene.scriptText);
      const duration = (wordCount / wordsPerMinute) * 60; // Convert to seconds

      const timedScene = {
        ...scene,
        startTime: currentTime,
        endTime: currentTime + duration,
        duration
      };

      currentTime += duration;
      return timedScene;
    });
  }

  private async recommendVisuals(scenes: Scene[]): Promise<Scene[]> {
    return Promise.all(
      scenes.map(async scene => {
        // Analyze scene content to recommend visuals
        const keywords = await this.extractKeywords(scene.scriptText);
        const visualSuggestions = await this.searchStockMedia(keywords);

        return {
          ...scene,
          visualSuggestions,
          recommendedBackground: visualSuggestions[0]
        };
      })
    );
  }
}

// API Endpoints
POST /api/scripts/generate
PUT  /api/scripts/:id
GET  /api/scripts/:id
POST /api/scripts/:id/scenes
PUT  /api/scenes/:id
```

#### User Stories
- As a creator, I want AI to write my video script
- As a creator, I want to customize the script tone and style
- As a creator, I want to see my script broken down into scenes
- As a creator, I want visual suggestions for each scene

---

### 4. Automated Visual Assembly

#### Overview
Automatic selection and integration of visuals from multiple sources.

#### Features
- **Stock Media Integration**: Pexels, Unsplash, Pixabay APIs
- **AI Image Generation**: DALL-E, Stable Diffusion for custom visuals
- **User Uploads**: Support for user-provided images/videos
- **B-roll Library**: Curated B-roll footage
- **Animated Graphics**: Pre-made animations and overlays
- **Brand Assets**: Custom logos, intros, outros, watermarks

#### Technical Implementation

```typescript
// Visual Assembly Service
class VisualAssemblyService {
  async assembleVisuals(scene: Scene): Promise<AssembledVisuals> {
    const { scriptText, visualCues, sceneType } = scene;

    // 1. Determine visual needs
    const visualRequirements = await this.analyzeVisualNeeds(
      scriptText,
      visualCues
    );

    // 2. Search for appropriate media
    const mediaOptions = await this.searchMedia(visualRequirements);

    // 3. Select best matches
    const selectedMedia = this.selectBestMedia(mediaOptions, scene);

    // 4. Apply brand assets if applicable
    if (sceneType === 'intro') {
      selectedMedia.overlays.push(await this.getBrandIntro());
    }

    return selectedMedia;
  }

  private async searchMedia(
    requirements: VisualRequirements
  ): Promise<MediaOption[]> {
    const searches = [];

    // Stock photos/videos
    if (requirements.needsBackground) {
      searches.push(
        this.stockService.search({
          query: requirements.keywords,
          type: requirements.preferVideo ? 'video' : 'image',
          orientation: requirements.aspectRatio
        })
      );
    }

    // AI-generated images
    if (requirements.needsCustomVisual) {
      searches.push(
        this.aiImageService.generate({
          prompt: requirements.imagePrompt,
          style: requirements.style
        })
      );
    }

    // User uploads
    searches.push(
      this.assetService.search({
        userId: requirements.userId,
        tags: requirements.keywords,
        type: requirements.preferVideo ? 'video' : 'image'
      })
    );

    const results = await Promise.all(searches);
    return results.flat();
  }

  private selectBestMedia(
    options: MediaOption[],
    scene: Scene
  ): SelectedMedia {
    // Score each option based on relevance, quality, variety
    const scored = options.map(option => ({
      ...option,
      score: this.scoreMediaOption(option, scene)
    }));

    // Sort by score and select top option
    scored.sort((a, b) => b.score - a.score);

    return {
      background: scored[0],
      alternatives: scored.slice(1, 4), // Top 3 alternatives
      overlays: this.selectOverlays(scene),
      transitions: this.selectTransition(scene)
    };
  }
}

// Stock Media Integration
class StockMediaService {
  private providers = {
    pexels: new PexelsAPI(process.env.PEXELS_API_KEY),
    unsplash: new UnsplashAPI(process.env.UNSPLASH_API_KEY),
    pixabay: new PixabayAPI(process.env.PIXABAY_API_KEY)
  };

  async search(params: SearchParams): Promise<MediaItem[]> {
    // Search all providers in parallel
    const results = await Promise.all([
      this.providers.pexels.search(params),
      this.providers.unsplash.search(params),
      this.providers.pixabay.search(params)
    ]);

    // Combine and deduplicate
    return this.deduplicateResults(results.flat());
  }
}

// API Endpoints
GET  /api/media/stock/search
POST /api/media/ai-generate
GET  /api/media/user-assets
POST /api/media/upload
GET  /api/brand-assets/:organizationId
```

#### Supported Formats
```yaml
Images:
  - JPEG, PNG, WebP
  - Minimum: 720p
  - Recommended: 1080p or higher

Videos:
  - MP4, MOV, WebM
  - Codecs: H.264, H.265
  - Minimum: 720p
  - Maximum: 4K

Audio:
  - MP3, WAV, AAC
  - Sample rate: 44.1kHz or 48kHz
  - Bitrate: 128kbps minimum
```

#### User Stories
- As a creator, I want automatic visual suggestions for my scenes
- As a creator, I want to choose from stock images and videos
- As a creator, I want to generate custom images with AI
- As a creator, I want to use my own uploaded media
- As a creator, I want consistent brand assets across videos

---

### 5. Avatar & Animation Integration

#### Overview
Talking avatar integration with lip-sync, emotions, and customizable personas.

#### Features
- **Avatar Selection**: Pre-made avatars in various styles
- **Lip Sync**: Automatic mouth movement matching voice
- **Persona Customization**: Adjust appearance, clothing, accessories
- **Emotional Expressions**: Match avatar emotion to content
- **Background Selection**: Virtual backgrounds for avatars
- **Position Control**: Avatar placement in frame

#### Technical Implementation

```typescript
// Avatar Service Integration
class AvatarService {
  private providers = {
    did: new DIDService(process.env.DID_API_KEY),
    heygen: new HeyGenService(process.env.HEYGEN_API_KEY),
    synthesia: new SynthesiaService(process.env.SYNTHESIA_API_KEY)
  };

  async generateAvatarVideo(params: AvatarParams): Promise<AvatarVideo> {
    const { avatarId, voiceAudio, emotion, background } = params;

    // 1. Select provider based on avatar type
    const provider = this.selectProvider(avatarId);

    // 2. Generate avatar video
    const jobId = await provider.createVideo({
      presenter_id: avatarId,
      audio_url: voiceAudio,
      background: background,
      settings: {
        emotion: emotion,
        crop: params.crop || 'head-and-shoulders'
      }
    });

    // 3. Poll for completion
    const video = await this.pollForCompletion(provider, jobId);

    // 4. Post-process if needed
    return this.postProcess(video, params);
  }

  private async pollForCompletion(
    provider: AvatarProvider,
    jobId: string
  ): Promise<VideoResult> {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    const interval = 5000; // 5 seconds

    while (attempts < maxAttempts) {
      const status = await provider.getStatus(jobId);

      if (status === 'completed') {
        return provider.getResult(jobId);
      }

      if (status === 'failed') {
        throw new Error('Avatar generation failed');
      }

      await sleep(interval);
      attempts++;
    }

    throw new Error('Avatar generation timeout');
  }
}

// Lip Sync (Self-hosted option using Wav2Lip)
class Wav2LipService {
  async generateLipSync(params: LipSyncParams): Promise<string> {
    const { videoPath, audioPath } = params;

    // 1. Preprocess video and audio
    const preprocessed = await this.preprocess(videoPath, audioPath);

    // 2. Run Wav2Lip model
    const result = await this.runModel({
      face: preprocessed.video,
      audio: preprocessed.audio,
      model: 'wav2lip_gan'
    });

    // 3. Post-process and enhance
    return this.enhance(result);
  }

  private async runModel(params: ModelParams): Promise<string> {
    // Execute Python script with Wav2Lip
    return new Promise((resolve, reject) => {
      const python = spawn('python', [
        'wav2lip/inference.py',
        '--checkpoint_path', params.model,
        '--face', params.face,
        '--audio', params.audio,
        '--outfile', params.output
      ]);

      python.on('close', (code) => {
        if (code === 0) resolve(params.output);
        else reject(new Error('Wav2Lip failed'));
      });
    });
  }
}

// API Endpoints
GET  /api/avatars/list
POST /api/avatars/generate
GET  /api/avatars/status/:jobId
POST /api/avatars/customize
```

#### Supported Avatar Providers

```yaml
D-ID:
  - Pros: High quality, realistic
  - Cons: Expensive (~$0.30/minute)
  - Best for: Premium tier users

HeyGen:
  - Pros: Great quality, good pricing
  - Cons: Limited customization
  - Best for: Standard tier users

Synthesia:
  - Pros: Professional avatars
  - Cons: Most expensive
  - Best for: Enterprise users

Wav2Lip (Self-hosted):
  - Pros: Free, unlimited
  - Cons: Requires GPU, lower quality
  - Best for: Free tier users
```

#### User Stories
- As a creator, I want to add a talking avatar to my video
- As a creator, I want the avatar's lips to match the voice
- As a creator, I want to customize the avatar's appearance
- As a creator, I want the avatar to show appropriate emotions

---

### 6. Voice Narration

#### Overview
AI-powered text-to-speech with voice cloning, emotion, and multilingual support.

#### Features
- **Voice Library**: Pre-made professional voices
- **Voice Cloning**: Clone user's voice from samples
- **Emotion Control**: Happy, sad, excited, calm, etc.
- **Speed/Pitch Adjustment**: Fine-tune delivery
- **Multilingual**: 50+ languages and accents
- **Custom Pronunciations**: Dictionary for brand names, technical terms
- **SSML Support**: Advanced speech control

#### Technical Implementation

```typescript
// Voice Synthesis Service
class VoiceSynthesisService {
  private providers = {
    elevenlabs: new ElevenLabsService(process.env.ELEVENLABS_API_KEY),
    azure: new AzureSpeechService(process.env.AZURE_SPEECH_KEY),
    openai: new OpenAITTSService(process.env.OPENAI_API_KEY),
    coqui: new CoquiTTSService() // Self-hosted
  };

  async synthesize(params: VoiceParams): Promise<AudioFile> {
    const { text, voiceId, settings } = params;

    // 1. Preprocess text (SSML, pronunciations)
    const processedText = await this.preprocessText(text, settings);

    // 2. Select provider based on voice
    const provider = this.getProviderForVoice(voiceId);

    // 3. Generate audio
    const audio = await provider.synthesize({
      text: processedText,
      voice: voiceId,
      settings: {
        stability: settings.stability || 0.5,
        similarity_boost: settings.similarity || 0.75,
        speed: settings.speed || 1.0,
        pitch: settings.pitch || 0
      }
    });

    // 4. Post-process (normalize volume, remove silence)
    return this.postProcessAudio(audio, settings);
  }

  async cloneVoice(audioSamples: File[]): Promise<ClonedVoice> {
    // Use ElevenLabs or custom model for voice cloning
    const provider = this.providers.elevenlabs;

    // 1. Validate samples (quality, duration, consistency)
    await this.validateVoiceSamples(audioSamples);

    // 2. Upload samples
    const uploadedSamples = await Promise.all(
      audioSamples.map(sample => provider.uploadSample(sample))
    );

    // 3. Create voice clone
    const voice = await provider.createVoice({
      name: 'Custom Voice',
      samples: uploadedSamples,
      description: 'User cloned voice'
    });

    return {
      voiceId: voice.id,
      name: voice.name,
      previewUrl: await this.generatePreview(voice.id)
    };
  }

  private async preprocessText(
    text: string,
    settings: VoiceSettings
  ): Promise<string> {
    let processed = text;

    // Apply custom pronunciations
    if (settings.pronunciations) {
      for (const [word, pronunciation] of Object.entries(settings.pronunciations)) {
        processed = processed.replace(
          new RegExp(word, 'gi'),
          `<phoneme alphabet="ipa" ph="${pronunciation}">${word}</phoneme>`
        );
      }
    }

    // Add pauses at punctuation
    processed = processed
      .replace(/\.\s/g, '.<break time="0.5s"/> ')
      .replace(/,\s/g, ',<break time="0.2s"/> ');

    // Wrap in SSML
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
      ${processed}
    </speak>`;
  }

  private async postProcessAudio(
    audio: Buffer,
    settings: VoiceSettings
  ): Promise<AudioFile> {
    // Use FFmpeg for audio processing
    const processed = await ffmpeg(audio)
      .audioFilters([
        // Normalize volume
        'loudnorm=I=-16:TP=-1.5:LRA=11',
        // Remove silence at start/end
        'silenceremove=start_periods=1:start_silence=0.1:start_threshold=-50dB',
        // Enhance voice
        'highpass=f=80', // Remove low rumble
        'lowpass=f=8000' // Remove high hiss
      ])
      .toBuffer();

    // Save to storage
    const url = await this.storageService.upload(processed, 'audio/mp3');

    return { url, duration: await this.getAudioDuration(processed) };
  }
}

// API Endpoints
GET  /api/voices/list
POST /api/voices/synthesize
POST /api/voices/clone
GET  /api/voices/preview/:voiceId
POST /api/voices/custom-pronunciation
```

#### Voice Providers Comparison

```yaml
ElevenLabs:
  Quality: ⭐⭐⭐⭐⭐
  Cost: $$$ (~$0.30/1K chars)
  Features: Voice cloning, emotions, multilingual
  Best for: Premium quality narration

Azure Cognitive Services:
  Quality: ⭐⭐⭐⭐
  Cost: $ (~$0.016/1K chars)
  Features: 400+ voices, 140+ languages, SSML
  Best for: Cost-effective multilingual

OpenAI TTS:
  Quality: ⭐⭐⭐⭐
  Cost: $ (~$0.015/1K chars)
  Features: 6 voices, good quality
  Best for: Budget-conscious users

Coqui TTS (Self-hosted):
  Quality: ⭐⭐⭐
  Cost: Free (GPU costs)
  Features: Open source, customizable
  Best for: High-volume users
```

#### User Stories
- As a creator, I want professional voice narration
- As a creator, I want to clone my own voice
- As a creator, I want to adjust voice emotion and speed
- As a creator, I want multilingual narration for global audience

---

### 7. Music and Sound Effects

#### Overview
Automated music selection and sound effect integration with mixing controls.

#### Features
- **Auto-curated Music**: AI-matched background music
- **Genre Selection**: Match music to content mood
- **Rights-cleared Library**: Royalty-free music
- **Sound Effects**: Comprehensive SFX library
- **Volume Mixing**: Balance voice, music, and SFX
- **Fade In/Out**: Smooth audio transitions
- **Beat Sync**: Sync visuals to music beats

#### Technical Implementation

```typescript
// Music Selection Service
class MusicSelectionService {
  async selectMusic(params: MusicSelectionParams): Promise<Track> {
    const { videoMetadata, sceneEmotions, duration } = params;

    // 1. Analyze video content
    const contentAnalysis = await this.analyzeContent(videoMetadata);

    // 2. Determine music requirements
    const requirements = {
      mood: this.determineMood(sceneEmotions),
      energy: this.calculateEnergyLevel(contentAnalysis),
      genre: this.mapNicheToGenre(videoMetadata.niche),
      duration: duration,
      tempo: this.recommendTempo(contentAnalysis)
    };

    // 3. Search music library
    const candidates = await this.searchMusicLibrary(requirements);

    // 4. Score and rank
    const ranked = this.rankTracks(candidates, requirements);

    return ranked[0];
  }

  private async searchMusicLibrary(
    requirements: MusicRequirements
  ): Promise<Track[]> {
    // Integration with music providers
    const sources = [
      this.epidemicSound.search(requirements),
      this.artlist.search(requirements),
      this.audioJungle.search(requirements),
      this.freeMusicArchive.search(requirements)
    ];

    const results = await Promise.all(sources);
    return results.flat();
  }

  private determineMood(sceneEmotions: string[]): string {
    // Aggregate scene emotions to overall mood
    const emotionCounts = sceneEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Return dominant emotion
    return Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)[0][0];
  }
}

// Audio Mixing Service
class AudioMixingService {
  async mixAudio(params: MixParams): Promise<AudioFile> {
    const { voice, music, sfx, settings } = params;

    // 1. Load all audio tracks
    const tracks = await this.loadTracks({ voice, music, sfx });

    // 2. Apply volume levels
    const volumeAdjusted = tracks.map((track, i) => ({
      ...track,
      volume: settings.volumes[i] || 1.0
    }));

    // 3. Apply effects (fade, EQ, compression)
    const processed = await this.applyEffects(volumeAdjusted, settings);

    // 4. Mix down to stereo
    return this.mixdown(processed);
  }

  private async applyEffects(
    tracks: AudioTrack[],
    settings: MixSettings
  ): Promise<AudioTrack[]> {
    return Promise.all(tracks.map(async (track) => {
      let audio = track.buffer;

      // Fade in/out
      if (track.fadeIn) {
        audio = await this.applyFadeIn(audio, track.fadeIn);
      }
      if (track.fadeOut) {
        audio = await this.applyFadeOut(audio, track.fadeOut);
      }

      // Ducking (lower music when voice is speaking)
      if (track.type === 'music' && settings.enableDucking) {
        audio = await this.applyDucking(audio, tracks.find(t => t.type === 'voice'));
      }

      // Normalization
      audio = await this.normalize(audio, track.targetLevel || -16);

      return { ...track, buffer: audio };
    }));
  }

  private async applyDucking(
    musicBuffer: Buffer,
    voiceTrack: AudioTrack
  ): Promise<Buffer> {
    // Detect when voice is speaking
    const voiceActivity = await this.detectVoiceActivity(voiceTrack.buffer);

    // Lower music volume during speech
    return ffmpeg(musicBuffer)
      .audioFilters([
        `sidechaincompress=threshold=0.03:ratio=4:attack=20:release=1000`
      ])
      .toBuffer();
  }
}

// Sound Effects Service
class SoundEffectsService {
  async addSoundEffect(params: SFXParams): Promise<void> {
    const { sceneId, effectType, timestamp, settings } = params;

    // 1. Select appropriate sound effect
    const sfx = await this.selectSFX(effectType);

    // 2. Apply to timeline at timestamp
    await this.addToTimeline({
      sceneId,
      audioUrl: sfx.url,
      startTime: timestamp,
      duration: sfx.duration,
      volume: settings.volume || 0.7,
      fadeIn: settings.fadeIn || 0.1,
      fadeOut: settings.fadeOut || 0.1
    });
  }

  private sfxLibrary = {
    transition: ['whoosh', 'swipe', 'slide'],
    emphasis: ['pop', 'ding', 'chime'],
    action: ['click', 'tap', 'notification'],
    ambient: ['background', 'room-tone', 'nature']
  };
}

// API Endpoints
GET  /api/music/search
GET  /api/music/recommendations
POST /api/audio/mix
GET  /api/sfx/library
POST /api/sfx/add
```

#### Music Library Integration

```yaml
Epidemic Sound:
  - 35K+ tracks
  - All genres
  - $15/month

Artlist:
  - 20K+ songs
  - High quality
  - $9.99/month

AudioJungle:
  - Individual tracks
  - Pay per track
  - $1-50 per track

Free Music Archive:
  - Creative Commons
  - Free
  - Attribution required

YouTube Audio Library:
  - Royalty-free
  - Free
  - No attribution needed
```

#### User Stories
- As a creator, I want background music that matches my video
- As a creator, I want the music to not overpower my voice
- As a creator, I want to add sound effects for emphasis
- As a creator, I want professional audio mixing automatically

---

### 8. Timeline/Card-based Editor

#### Overview
Flexible editing interface with drag-and-drop, scene cards, and timeline view.

#### Features
- **Scene Cards**: Visual card-based scene management
- **Timeline View**: Traditional multi-track timeline
- **Drag-and-Drop**: Reorder scenes, adjust timing
- **Per-scene Preview**: Preview individual scenes
- **Bulk Edit**: Apply changes to multiple scenes
- **Layers**: Video, audio, voice, music, overlays, effects
- **Transitions**: Add transitions between scenes
- **Intros/Outros**: Pre-made and custom intros/outros

#### Technical Implementation

```typescript
// Timeline State Management
interface TimelineState {
  scenes: Scene[];
  selectedSceneId: string | null;
  playhead: number; // Current time in seconds
  zoom: number; // Pixels per second
  tracks: {
    video: TrackItem[];
    audio: TrackItem[];
    voice: TrackItem[];
    music: TrackItem[];
    overlay: TrackItem[];
  };
}

// Timeline Editor Component
class TimelineEditor {
  async reorderScenes(fromIndex: number, toIndex: number): Promise<void> {
    // Update order in state
    const scenes = [...this.state.scenes];
    const [moved] = scenes.splice(fromIndex, 1);
    scenes.splice(toIndex, 0, moved);

    // Recalculate timing for all scenes
    const retimedScenes = this.recalculateTiming(scenes);

    // Update state and database
    await this.updateScenes(retimedScenes);
  }

  private recalculateTiming(scenes: Scene[]): Scene[] {
    let currentTime = 0;

    return scenes.map((scene, index) => {
      const duration = scene.duration || this.calculateDuration(scene);

      const updated = {
        ...scene,
        orderIndex: index,
        startTime: currentTime,
        endTime: currentTime + duration,
        duration
      };

      currentTime += duration;
      return updated;
    });
  }

  async splitScene(sceneId: string, splitPoint: number): Promise<void> {
    const scene = this.getScene(sceneId);

    // Create two new scenes from split
    const scene1 = {
      ...scene,
      id: generateId(),
      endTime: scene.startTime + splitPoint,
      duration: splitPoint,
      scriptText: scene.scriptText.substring(0, this.getTextAtTime(splitPoint))
    };

    const scene2 = {
      ...scene,
      id: generateId(),
      startTime: scene.startTime + splitPoint,
      duration: scene.duration - splitPoint,
      scriptText: scene.scriptText.substring(this.getTextAtTime(splitPoint))
    };

    // Replace original scene with two new scenes
    await this.replaceScene(sceneId, [scene1, scene2]);
  }

  async mergeScenes(sceneIds: string[]): Promise<void> {
    const scenes = sceneIds.map(id => this.getScene(id)).sort((a, b) =>
      a.startTime - b.startTime
    );

    const merged = {
      id: generateId(),
      startTime: scenes[0].startTime,
      endTime: scenes[scenes.length - 1].endTime,
      duration: scenes.reduce((sum, s) => sum + s.duration, 0),
      scriptText: scenes.map(s => s.scriptText).join(' '),
      // Merge other properties intelligently
    };

    await this.replaceScenes(sceneIds, merged);
  }
}

// Drag and Drop Handler
class DragDropHandler {
  onDragStart(item: DraggableItem): void {
    this.draggedItem = item;
    this.originalPosition = item.position;
  }

  onDragOver(event: DragEvent, dropZone: DropZone): void {
    event.preventDefault();

    // Calculate drop position
    const dropPosition = this.calculateDropPosition(event, dropZone);

    // Show drop indicator
    this.showDropIndicator(dropPosition);
  }

  onDrop(event: DragEvent, dropZone: DropZone): void {
    const dropPosition = this.calculateDropPosition(event, dropZone);

    if (this.draggedItem.type === 'scene') {
      this.editor.reorderScenes(
        this.draggedItem.index,
        dropPosition.index
      );
    } else if (this.draggedItem.type === 'asset') {
      this.editor.addAssetToTimeline(
        this.draggedItem.asset,
        dropPosition.time,
        dropPosition.track
      );
    }

    this.clearDragState();
  }
}

// API Endpoints
GET  /api/videos/:id/timeline
PUT  /api/videos/:id/timeline
POST /api/scenes/:id/split
POST /api/scenes/merge
PUT  /api/scenes/:id/move
```

#### User Stories
- As a creator, I want to rearrange scenes by dragging
- As a creator, I want to preview each scene individually
- As a creator, I want to bulk edit multiple scenes
- As a creator, I want precise control over timing

---

(Continuing with remaining core features...)

### 9. Thumbnail/Title/Metadata Generator

### 10. Export, Scheduling, and Bulk Upload

### 11. Analytics Dashboard

These will be detailed in the next section along with advanced features to keep the file manageable.

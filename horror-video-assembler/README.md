# Horror Video Assembler

A Python tool to automatically assemble horror narration videos from pre-existing assets (images, audio, and sound effects).

## Features

- **Automatic video assembly** from scene images and narration audio
- **Scene-specific sound effects** with precise timing and volume control
- **Optional ambient audio** track for atmosphere
- **Ken Burns effects** (slow zoom and pan) to add subtle motion to static images
- **16:9 video output** (1920x1080) with h.264 encoding
- **JSON-based configuration** for easy editing and tweaking
- **Robust error handling** - missing files trigger warnings instead of crashes

## Project Structure

```
horror-video-assembler/
├── assets/
│   ├── narration/
│   │   └── narration.wav          # Main narration audio (from ElevenLabs, etc.)
│   ├── scenes/
│   │   ├── scene_1.png            # Scene images
│   │   ├── scene_2.png
│   │   └── ...
│   ├── sfx/
│   │   ├── thunder.wav            # Sound effect files
│   │   ├── creak.wav
│   │   ├── wind.wav
│   │   └── ...
│   └── ambience/
│       └── ambience.wav           # Optional ambient background audio
├── config.json                     # Video configuration file
├── build_video.py                  # Main script
├── output/
│   └── horror_story.mp4           # Generated video (output)
├── requirements.txt
└── README.md
```

## Installation

### Prerequisites

- Python 3.7 or higher
- ffmpeg installed and available in PATH

#### Installing ffmpeg

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS (with Homebrew):**
```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH.

### Install Python Dependencies

```bash
cd horror-video-assembler
pip install -r requirements.txt
```

## Usage

### Basic Usage

1. Place your assets in the appropriate folders:
   - Narration audio → `assets/narration/`
   - Scene images → `assets/scenes/`
   - Sound effects → `assets/sfx/`
   - Ambient audio → `assets/ambience/`

2. Edit `config.json` to define your scenes and timing

3. Run the script:
```bash
python build_video.py
```

The video will be generated at `output/horror_story.mp4` (or the path specified in your config).

### Using a Custom Config File

```bash
python build_video.py my_custom_config.json
```

## Configuration (config.json)

### JSON Schema

```json
{
  "video": {
    "resolution": {
      "width": 1920,
      "height": 1080
    },
    "fps": 30,
    "output_file": "output/horror_story.mp4"
  },
  "audio": {
    "narration": {
      "file": "assets/narration/narration.wav"
    },
    "ambience": {
      "file": "assets/ambience/ambience.wav",
      "volume": 0.15,
      "enabled": true
    }
  },
  "scenes": [
    {
      "id": "scene_1",
      "image": "assets/scenes/scene_1.png",
      "start_time": 0.0,
      "end_time": 8.5,
      "effects": {
        "ken_burns": {
          "enabled": true,
          "zoom_start": 1.0,
          "zoom_end": 1.1,
          "pan_x": 0,
          "pan_y": -20
        }
      },
      "sfx": [
        {
          "file": "assets/sfx/thunder.wav",
          "offset": 2.0,
          "volume": 0.6
        }
      ]
    }
  ]
}
```

### Configuration Options

#### Video Settings

- **resolution**: Output video dimensions (default: 1920x1080)
- **fps**: Frames per second (default: 30)
- **output_file**: Path where the final video will be saved

#### Audio Settings

**Narration:**
- **file**: Path to the main narration audio file

**Ambience:**
- **file**: Path to the ambient audio file
- **volume**: Volume level (0.0 to 1.0, where 0.15 = 15% volume)
- **enabled**: Set to `false` to disable ambient audio

#### Scene Settings

Each scene object supports:

- **id**: Unique identifier for the scene (for logging/debugging)
- **image**: Path to the scene image file
- **start_time**: When this scene starts (seconds from video beginning)
- **end_time**: When this scene ends (seconds from video beginning)

**Effects:**
- **ken_burns.enabled**: Enable/disable Ken Burns effect
- **ken_burns.zoom_start**: Initial zoom level (1.0 = 100%)
- **ken_burns.zoom_end**: Final zoom level (1.1 = 110%)
- **ken_burns.pan_x**: Horizontal pan in pixels (positive = right, negative = left)
- **ken_burns.pan_y**: Vertical pan in pixels (positive = down, negative = up)

**Sound Effects (sfx):**
- **file**: Path to the sound effect file
- **offset**: Delay from scene start (seconds)
- **volume**: Volume level (0.0 to 1.0)

## Editing Your Video

### Changing Scene Timings

Simply edit the `start_time` and `end_time` values in `config.json`:

```json
{
  "id": "scene_1",
  "start_time": 0.0,    // Change these
  "end_time": 8.5,      // to adjust timing
  ...
}
```

### Adding New Scenes

1. Add the image to `assets/scenes/`
2. Add a new scene object to the `scenes` array in `config.json`

```json
{
  "id": "scene_5",
  "image": "assets/scenes/scene_5.png",
  "start_time": 30.0,
  "end_time": 38.0,
  "effects": {
    "ken_burns": {
      "enabled": true,
      "zoom_start": 1.0,
      "zoom_end": 1.12,
      "pan_x": -15,
      "pan_y": 10
    }
  },
  "sfx": []
}
```

### Adjusting Ken Burns Effects

- **Slow zoom in**: `zoom_start: 1.0, zoom_end: 1.1`
- **Slow zoom out**: `zoom_start: 1.1, zoom_end: 1.0`
- **No zoom, pan right**: `zoom_start: 1.0, zoom_end: 1.0, pan_x: 50`
- **Disable entirely**: `enabled: false`

### Adding Sound Effects

1. Place SFX file in `assets/sfx/`
2. Add to the `sfx` array in the desired scene:

```json
"sfx": [
  {
    "file": "assets/sfx/scream.wav",
    "offset": 3.5,      // 3.5 seconds after scene starts
    "volume": 0.8       // 80% volume
  }
]
```

## Future Extensions

### Ideas for Enhancement

1. **Crossfades Between Scenes**
   - Add `transition` property to scene config
   - Implement fade-in/fade-out effects in `_load_and_prepare_image()`

2. **Per-Scene Zoom Customization**
   - Already supported via `ken_burns` settings
   - Could add presets like "zoom_in_slow", "zoom_out_fast", etc.

3. **Text Overlays**
   - Add `text` property to scene config
   - Use `TextClip` from moviepy to render text

4. **Audio Fade In/Out**
   - Add `audio_fadein()` and `audio_fadeout()` to narration/ambience

5. **Video Clips Instead of Images**
   - Replace `ImageClip` with `VideoFileClip` in scene config
   - Support mixing images and video clips

6. **Batch Processing**
   - Process multiple config files at once
   - Useful for creating series of videos

7. **Preview Mode**
   - Generate low-res preview for faster iteration
   - Add `--preview` command-line flag

8. **Automatic Scene Detection**
   - Analyze narration audio for pauses
   - Auto-suggest scene break points

### Example: Adding Crossfades

To implement crossfades, modify the `_create_video_timeline()` method:

```python
# After loading all clips, apply crossfades
from moviepy.video.compositing.transitions import crossfadein, crossfadeout

for i, clip in enumerate(video_clips[:-1]):
    clip = crossfadeout(clip, 0.5)  # 0.5 second fade out
    next_clip = crossfadein(video_clips[i+1], 0.5)  # 0.5 second fade in
```

## Troubleshooting

### "Config file not found"
- Ensure `config.json` exists in the same directory as `build_video.py`
- Or provide the full path: `python build_video.py /path/to/config.json`

### "Image not found" warnings
- Check that image paths in `config.json` match actual file locations
- Use relative paths from the project root

### "ffmpeg not found"
- Install ffmpeg (see Installation section)
- Ensure it's in your system PATH

### Video is silent
- Check that narration file path is correct
- Verify audio file is not corrupted (test with media player)

### Render is very slow
- Lower the FPS (e.g., 24 instead of 30)
- Reduce resolution temporarily for testing
- Use fewer Ken Burns effects

## License

This project is provided as-is for personal use. Feel free to modify and extend it for your horror narration videos!

## Credits

Built with:
- [MoviePy](https://zulko.github.io/moviepy/) - Video editing library
- [ffmpeg](https://ffmpeg.org/) - Video encoding engine

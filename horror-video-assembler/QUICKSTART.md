# Quick Start Guide

Get your horror video up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
# Install ffmpeg (if not already installed)
# Ubuntu/Debian:
sudo apt install ffmpeg

# macOS:
brew install ffmpeg

# Install Python packages
cd horror-video-assembler
pip install -r requirements.txt
```

## Step 2: Add Your Assets

Place your files in these folders:

```
assets/
├── narration/narration.wav     ← Your ElevenLabs narration
├── scenes/
│   ├── scene_1.png             ← Your scene images
│   ├── scene_2.png
│   └── scene_3.png
├── sfx/
│   ├── thunder.wav             ← Sound effects (optional)
│   └── wind.wav
└── ambience/ambience.wav       ← Background atmosphere (optional)
```

## Step 3: Configure Timing

Edit `config.json` and set the scene timings:

```json
"scenes": [
  {
    "id": "scene_1",
    "image": "assets/scenes/scene_1.png",
    "start_time": 0.0,      ← Scene starts at 0 seconds
    "end_time": 8.5,        ← Scene ends at 8.5 seconds
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
        "offset": 2.0,      ← Play 2 seconds after scene starts
        "volume": 0.6       ← 60% volume
      }
    ]
  }
]
```

**How to find the right timings:**
1. Listen to your narration
2. Note when each scene should change
3. Update `start_time` and `end_time` accordingly

## Step 4: Build Your Video

```bash
python build_video.py
```

Your video will be created at: `output/horror_story.mp4`

## Step 5: Watch & Iterate

1. Watch the generated video
2. Adjust timings in `config.json`
3. Re-run `python build_video.py`
4. Repeat until perfect!

---

## Common First-Time Issues

### Issue: "Config file not found"
**Solution:** Make sure you're in the `horror-video-assembler` directory when running the script.

### Issue: "Narration file not found"
**Solution:** Check that your narration file path in `config.json` matches your actual file name and location.

### Issue: Video has no audio
**Solution:** Verify the narration file path is correct and the audio file isn't corrupted (try playing it in a media player).

### Issue: Scenes appear at wrong times
**Solution:** Double-check your `start_time` and `end_time` values. They should be in seconds from the start of the video.

---

## Next Steps

Once you have a basic video working:

1. **Add more scenes** - Copy a scene object in `config.json` and modify the timings
2. **Add sound effects** - Enhance atmosphere with thunder, creaks, whispers, etc.
3. **Tweak Ken Burns** - Adjust zoom and pan for subtle motion
4. **Add ambience** - Set a spooky background track at low volume
5. **Fine-tune audio** - Adjust SFX volumes for the perfect mix

See the main [README.md](README.md) for detailed documentation and advanced features.

Happy horror video making! 🎃

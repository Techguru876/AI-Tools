#!/usr/bin/env python3
"""
Horror Video Assembler
Automatically assembles horror narration videos from assets and a JSON config file.

Usage:
    python build_video.py [config_file]

    If no config file is specified, defaults to 'config.json'
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional
import logging

from moviepy.editor import (
    ImageClip,
    AudioFileClip,
    CompositeVideoClip,
    CompositeAudioClip,
    concatenate_videoclips,
)
from moviepy.video.fx.all import resize
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class VideoAssembler:
    """Assembles a video from scene images, narration, and sound effects."""

    def __init__(self, config_path: str = "config.json"):
        """
        Initialize the video assembler.

        Args:
            config_path: Path to the JSON configuration file
        """
        self.config_path = config_path
        self.config = self._load_config()
        self.video_config = self.config.get('video', {})
        self.audio_config = self.config.get('audio', {})
        self.scenes = self.config.get('scenes', [])

        # Video settings
        self.width = self.video_config.get('resolution', {}).get('width', 1920)
        self.height = self.video_config.get('resolution', {}).get('height', 1080)
        self.fps = self.video_config.get('fps', 30)
        self.output_file = self.video_config.get('output_file', 'output/output.mp4')

    def _load_config(self) -> Dict:
        """Load and parse the JSON configuration file."""
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
            logger.info(f"Loaded configuration from {self.config_path}")
            return config
        except FileNotFoundError:
            logger.error(f"Config file not found: {self.config_path}")
            sys.exit(1)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in config file: {e}")
            sys.exit(1)

    def _create_ken_burns_effect(self, clip, effects_config: Dict):
        """
        Apply Ken Burns effect (slow zoom and pan) to an image clip.

        Args:
            clip: The ImageClip to apply the effect to
            effects_config: Dictionary containing Ken Burns parameters

        Returns:
            Modified clip with Ken Burns effect applied
        """
        ken_burns = effects_config.get('ken_burns', {})

        if not ken_burns.get('enabled', False):
            return clip

        zoom_start = ken_burns.get('zoom_start', 1.0)
        zoom_end = ken_burns.get('zoom_end', 1.1)
        pan_x = ken_burns.get('pan_x', 0)
        pan_y = ken_burns.get('pan_y', 0)

        duration = clip.duration

        def zoom_pan(get_frame, t):
            """Apply zoom and pan at time t."""
            frame = get_frame(t)

            # Calculate current zoom level (linear interpolation)
            progress = t / duration if duration > 0 else 0
            current_zoom = zoom_start + (zoom_end - zoom_start) * progress

            # Calculate current pan position
            current_pan_x = pan_x * progress
            current_pan_y = pan_y * progress

            # Get frame dimensions
            h, w = frame.shape[:2]

            # Calculate new dimensions after zoom
            new_w = int(w * current_zoom)
            new_h = int(h * current_zoom)

            # Resize frame
            from moviepy.video.fx.all import resize as resize_fx
            temp_clip = ImageClip(frame).set_duration(0.1)
            resized = resize_fx(temp_clip, (new_w, new_h))
            zoomed_frame = resized.get_frame(0)

            # Calculate crop position with pan
            crop_x = int((new_w - w) / 2 + current_pan_x)
            crop_y = int((new_h - h) / 2 + current_pan_y)

            # Ensure crop boundaries are within frame
            crop_x = max(0, min(crop_x, new_w - w))
            crop_y = max(0, min(crop_y, new_h - h))

            # Crop to original size
            cropped = zoomed_frame[crop_y:crop_y+h, crop_x:crop_x+w]

            return cropped

        return clip.fl(zoom_pan)

    def _load_and_prepare_image(self, scene: Dict) -> Optional[ImageClip]:
        """
        Load an image and prepare it for the video timeline.

        Args:
            scene: Scene dictionary containing image path and timing info

        Returns:
            ImageClip ready to be added to the video, or None if loading failed
        """
        image_path = scene.get('image')
        start_time = scene.get('start_time', 0)
        end_time = scene.get('end_time', 0)
        duration = end_time - start_time

        if not image_path or not os.path.exists(image_path):
            logger.warning(f"Image not found: {image_path} (Scene: {scene.get('id')})")
            return None

        try:
            # Load image as clip
            clip = ImageClip(image_path).set_duration(duration)

            # Resize to fit 16:9 aspect ratio (letterbox if needed)
            clip = resize(clip, height=self.height)

            # If width doesn't match after height resize, center it
            if clip.w != self.width:
                clip = clip.on_color(
                    size=(self.width, self.height),
                    color=(0, 0, 0),
                    pos='center'
                )

            # Apply Ken Burns effect if configured
            effects = scene.get('effects', {})
            if effects:
                clip = self._create_ken_burns_effect(clip, effects)

            # Set the start time for this clip
            clip = clip.set_start(start_time)

            logger.info(f"Loaded scene: {scene.get('id')} ({start_time}s - {end_time}s)")
            return clip

        except Exception as e:
            logger.error(f"Error loading image {image_path}: {e}")
            return None

    def _create_video_timeline(self) -> CompositeVideoClip:
        """
        Create the complete video timeline from all scenes.

        Returns:
            CompositeVideoClip containing all scene images
        """
        logger.info("Building video timeline...")

        video_clips = []

        for scene in self.scenes:
            clip = self._load_and_prepare_image(scene)
            if clip:
                video_clips.append(clip)

        if not video_clips:
            logger.error("No valid video clips found!")
            sys.exit(1)

        # Create composite video from all clips
        final_video = CompositeVideoClip(
            video_clips,
            size=(self.width, self.height)
        )

        # Set FPS
        final_video = final_video.set_fps(self.fps)

        return final_video

    def _load_narration(self) -> Optional[AudioFileClip]:
        """
        Load the main narration audio track.

        Returns:
            AudioFileClip of the narration, or None if loading failed
        """
        narration_config = self.audio_config.get('narration', {})
        narration_path = narration_config.get('file')

        if not narration_path or not os.path.exists(narration_path):
            logger.warning(f"Narration file not found: {narration_path}")
            return None

        try:
            audio = AudioFileClip(narration_path)
            logger.info(f"Loaded narration: {narration_path} ({audio.duration:.2f}s)")
            return audio
        except Exception as e:
            logger.error(f"Error loading narration: {e}")
            return None

    def _load_ambience(self) -> Optional[AudioFileClip]:
        """
        Load the ambient audio track (if enabled).

        Returns:
            AudioFileClip of the ambience, or None if disabled or loading failed
        """
        ambience_config = self.audio_config.get('ambience', {})

        if not ambience_config.get('enabled', False):
            logger.info("Ambience track disabled")
            return None

        ambience_path = ambience_config.get('file')
        volume = ambience_config.get('volume', 0.15)

        if not ambience_path or not os.path.exists(ambience_path):
            logger.warning(f"Ambience file not found: {ambience_path}")
            return None

        try:
            audio = AudioFileClip(ambience_path)
            audio = audio.volumex(volume)
            logger.info(f"Loaded ambience: {ambience_path} (volume: {volume})")
            return audio
        except Exception as e:
            logger.error(f"Error loading ambience: {e}")
            return None

    def _load_scene_sfx(self, scene: Dict, scene_start_time: float) -> List[AudioFileClip]:
        """
        Load all sound effects for a specific scene.

        Args:
            scene: Scene dictionary containing SFX list
            scene_start_time: Absolute start time of the scene in the video

        Returns:
            List of AudioFileClips positioned at their correct timestamps
        """
        sfx_list = scene.get('sfx', [])
        loaded_sfx = []

        for sfx in sfx_list:
            sfx_path = sfx.get('file')
            offset = sfx.get('offset', 0)
            volume = sfx.get('volume', 1.0)

            if not sfx_path or not os.path.exists(sfx_path):
                logger.warning(f"SFX file not found: {sfx_path} (Scene: {scene.get('id')})")
                continue

            try:
                audio = AudioFileClip(sfx_path)
                audio = audio.volumex(volume)

                # Calculate absolute timestamp (scene start + offset)
                absolute_time = scene_start_time + offset
                audio = audio.set_start(absolute_time)

                loaded_sfx.append(audio)
                logger.info(f"  Added SFX: {os.path.basename(sfx_path)} at {absolute_time:.2f}s (vol: {volume})")

            except Exception as e:
                logger.error(f"Error loading SFX {sfx_path}: {e}")

        return loaded_sfx

    def _compose_audio(self, video_duration: float) -> Optional[CompositeAudioClip]:
        """
        Compose the complete audio track with narration, ambience, and SFX.

        Args:
            video_duration: Total duration of the video

        Returns:
            CompositeAudioClip containing all audio layers
        """
        logger.info("Composing audio tracks...")

        audio_clips = []

        # Load narration (base layer)
        narration = self._load_narration()
        if narration:
            audio_clips.append(narration)

        # Load ambience (if enabled)
        ambience = self._load_ambience()
        if ambience:
            # Loop ambience to match video duration if needed
            if ambience.duration < video_duration:
                ambience = ambience.loop(duration=video_duration)
            else:
                ambience = ambience.subclip(0, video_duration)
            audio_clips.append(ambience)

        # Load all scene-specific SFX
        logger.info("Loading scene sound effects...")
        for scene in self.scenes:
            scene_start = scene.get('start_time', 0)
            sfx_clips = self._load_scene_sfx(scene, scene_start)
            audio_clips.extend(sfx_clips)

        if not audio_clips:
            logger.warning("No audio clips loaded!")
            return None

        # Composite all audio layers
        final_audio = CompositeAudioClip(audio_clips)
        logger.info(f"Audio composition complete: {len(audio_clips)} audio layers")

        return final_audio

    def build(self):
        """Build the final video from all components."""
        logger.info("=" * 60)
        logger.info("Starting Horror Video Assembly")
        logger.info("=" * 60)

        # Create video timeline
        video = self._create_video_timeline()

        # Compose audio
        audio = self._compose_audio(video.duration)

        # Attach audio to video
        if audio:
            final_video = video.set_audio(audio)
        else:
            final_video = video

        # Ensure output directory exists
        output_dir = os.path.dirname(self.output_file)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)

        # Write final video to disk
        logger.info("=" * 60)
        logger.info(f"Rendering final video: {self.output_file}")
        logger.info(f"Resolution: {self.width}x{self.height} @ {self.fps}fps")
        logger.info(f"Duration: {final_video.duration:.2f}s")
        logger.info("=" * 60)

        try:
            final_video.write_videofile(
                self.output_file,
                fps=self.fps,
                codec='libx264',
                audio_codec='aac',
                preset='medium',
                bitrate='5000k',
                threads=4
            )

            logger.info("=" * 60)
            logger.info(f"✓ Video successfully created: {self.output_file}")
            logger.info("=" * 60)

        except Exception as e:
            logger.error(f"Error writing video file: {e}")
            sys.exit(1)

        finally:
            # Clean up clips
            video.close()
            if audio:
                audio.close()


def main():
    """Main entry point for the script."""
    # Get config file from command line argument or use default
    config_file = sys.argv[1] if len(sys.argv) > 1 else "config.json"

    # Create assembler and build video
    assembler = VideoAssembler(config_file)
    assembler.build()


if __name__ == "__main__":
    main()

// Effects Module
// Video and image effects library

use image::DynamicImage;
use serde::{Deserialize, Serialize};

/// Effect registry - manages all available effects
pub struct EffectRegistry {
    effects: Vec<EffectDefinition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EffectDefinition {
    pub id: String,
    pub name: String,
    pub category: String,
    pub parameters: Vec<Parameter>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Parameter {
    pub name: String,
    pub param_type: ParamType,
    pub default_value: f32,
    pub min_value: f32,
    pub max_value: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ParamType {
    Float,
    Int,
    Bool,
    Color,
    Choice(Vec<String>),
}

impl EffectRegistry {
    pub fn new() -> Self {
        let mut registry = EffectRegistry {
            effects: Vec::new(),
        };
        registry.register_builtin_effects();
        registry
    }

    fn register_builtin_effects(&mut self) {
        // Video Effects
        self.register_effect(EffectDefinition {
            id: "gaussian_blur".to_string(),
            name: "Gaussian Blur".to_string(),
            category: "Blur & Sharpen".to_string(),
            parameters: vec![Parameter {
                name: "Radius".to_string(),
                param_type: ParamType::Float,
                default_value: 5.0,
                min_value: 0.0,
                max_value: 100.0,
            }],
        });

        self.register_effect(EffectDefinition {
            id: "chroma_key".to_string(),
            name: "Chroma Key".to_string(),
            category: "Keying".to_string(),
            parameters: vec![
                Parameter {
                    name: "Hue".to_string(),
                    param_type: ParamType::Float,
                    default_value: 120.0,
                    min_value: 0.0,
                    max_value: 360.0,
                },
                Parameter {
                    name: "Tolerance".to_string(),
                    param_type: ParamType::Float,
                    default_value: 10.0,
                    min_value: 0.0,
                    max_value: 100.0,
                },
            ],
        });
    }

    pub fn register_effect(&mut self, effect: EffectDefinition) {
        self.effects.push(effect);
    }

    pub fn get_effect(&self, id: &str) -> Option<&EffectDefinition> {
        self.effects.iter().find(|e| e.id == id)
    }

    pub fn list_effects(&self) -> &[EffectDefinition] {
        &self.effects
    }
}

/// Video effect processor
pub struct VideoEffectProcessor;

impl VideoEffectProcessor {
    /// Applies an effect to a video frame
    pub fn apply(
        frame: &[u8],
        width: u32,
        height: u32,
        effect_id: &str,
        params: &serde_json::Value,
    ) -> Result<Vec<u8>, String> {
        match effect_id {
            "gaussian_blur" => Self::gaussian_blur(frame, width, height, params),
            "chroma_key" => Self::chroma_key(frame, width, height, params),
            "brightness" => Self::brightness(frame, width, height, params),
            "contrast" => Self::contrast(frame, width, height, params),
            _ => Ok(frame.to_vec()),
        }
    }

    fn gaussian_blur(
        frame: &[u8],
        width: u32,
        height: u32,
        params: &serde_json::Value,
    ) -> Result<Vec<u8>, String> {
        let radius = params.get("radius").and_then(|v| v.as_f64()).unwrap_or(5.0) as f32;

        // In a real implementation, this would:
        // 1. Apply a Gaussian blur kernel
        // 2. Use separable filters for performance
        // 3. Support GPU acceleration

        Ok(frame.to_vec())
    }

    fn chroma_key(
        frame: &[u8],
        width: u32,
        height: u32,
        params: &serde_json::Value,
    ) -> Result<Vec<u8>, String> {
        // Extract parameters
        let hue = params.get("hue").and_then(|v| v.as_f64()).unwrap_or(120.0) as f32;
        let tolerance = params.get("tolerance").and_then(|v| v.as_f64()).unwrap_or(10.0) as f32;

        let mut result = frame.to_vec();

        // Process each pixel
        for i in (0..frame.len()).step_by(4) {
            let r = frame[i] as f32 / 255.0;
            let g = frame[i + 1] as f32 / 255.0;
            let b = frame[i + 2] as f32 / 255.0;

            // Convert RGB to HSV
            let (h, _s, _v) = rgb_to_hsv(r, g, b);

            // Check if pixel matches key color
            let hue_diff = (h - hue).abs();
            if hue_diff < tolerance {
                // Make pixel transparent
                result[i + 3] = 0;
            }
        }

        Ok(result)
    }

    fn brightness(
        frame: &[u8],
        _width: u32,
        _height: u32,
        params: &serde_json::Value,
    ) -> Result<Vec<u8>, String> {
        let value = params.get("value").and_then(|v| v.as_f64()).unwrap_or(0.0) as f32;
        let adjustment = (value * 255.0) as i32;

        let mut result = frame.to_vec();
        for i in (0..result.len()).step_by(4) {
            result[i] = (result[i] as i32 + adjustment).clamp(0, 255) as u8;
            result[i + 1] = (result[i + 1] as i32 + adjustment).clamp(0, 255) as u8;
            result[i + 2] = (result[i + 2] as i32 + adjustment).clamp(0, 255) as u8;
        }

        Ok(result)
    }

    fn contrast(
        frame: &[u8],
        _width: u32,
        _height: u32,
        params: &serde_json::Value,
    ) -> Result<Vec<u8>, String> {
        let value = params.get("value").and_then(|v| v.as_f64()).unwrap_or(1.0) as f32;
        let factor = value;

        let mut result = frame.to_vec();
        for i in (0..result.len()).step_by(4) {
            result[i] = ((result[i] as f32 - 128.0) * factor + 128.0).clamp(0.0, 255.0) as u8;
            result[i + 1] =
                ((result[i + 1] as f32 - 128.0) * factor + 128.0).clamp(0.0, 255.0) as u8;
            result[i + 2] =
                ((result[i + 2] as f32 - 128.0) * factor + 128.0).clamp(0.0, 255.0) as u8;
        }

        Ok(result)
    }
}

/// Helper function: RGB to HSV conversion
fn rgb_to_hsv(r: f32, g: f32, b: f32) -> (f32, f32, f32) {
    let max = r.max(g).max(b);
    let min = r.min(g).min(b);
    let delta = max - min;

    let h = if delta == 0.0 {
        0.0
    } else if max == r {
        60.0 * (((g - b) / delta) % 6.0)
    } else if max == g {
        60.0 * (((b - r) / delta) + 2.0)
    } else {
        60.0 * (((r - g) / delta) + 4.0)
    };

    let s = if max == 0.0 { 0.0 } else { delta / max };
    let v = max;

    (h, s, v)
}

/// Transition effects
pub struct TransitionProcessor;

impl TransitionProcessor {
    /// Applies a transition between two frames
    pub fn apply(
        frame_a: &[u8],
        frame_b: &[u8],
        width: u32,
        height: u32,
        transition_type: &str,
        progress: f32, // 0.0 to 1.0
    ) -> Result<Vec<u8>, String> {
        match transition_type {
            "crossfade" => Self::crossfade(frame_a, frame_b, progress),
            "wipe_left" => Self::wipe_left(frame_a, frame_b, width, height, progress),
            "zoom" => Self::zoom(frame_a, frame_b, width, height, progress),
            _ => Ok(frame_a.to_vec()),
        }
    }

    fn crossfade(frame_a: &[u8], frame_b: &[u8], progress: f32) -> Result<Vec<u8>, String> {
        let mut result = Vec::with_capacity(frame_a.len());

        for (a, b) in frame_a.iter().zip(frame_b.iter()) {
            let value = (*a as f32 * (1.0 - progress) + *b as f32 * progress) as u8;
            result.push(value);
        }

        Ok(result)
    }

    fn wipe_left(
        frame_a: &[u8],
        frame_b: &[u8],
        width: u32,
        height: u32,
        progress: f32,
    ) -> Result<Vec<u8>, String> {
        let mut result = frame_a.to_vec();
        let wipe_x = (width as f32 * progress) as u32;

        for y in 0..height {
            for x in 0..wipe_x {
                let idx = ((y * width + x) * 4) as usize;
                if idx + 3 < frame_b.len() {
                    result[idx..idx + 4].copy_from_slice(&frame_b[idx..idx + 4]);
                }
            }
        }

        Ok(result)
    }

    fn zoom(
        frame_a: &[u8],
        frame_b: &[u8],
        width: u32,
        height: u32,
        progress: f32,
    ) -> Result<Vec<u8>, String> {
        // Zoom out from A and zoom in to B
        Self::crossfade(frame_a, frame_b, progress)
    }
}

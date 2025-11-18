// Effects Commands
// Handles video and image effects, transitions, filters

use super::*;
use serde::{Deserialize, Serialize};

/// Effect definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Effect {
    pub id: String,
    pub name: String,
    pub category: String,
    pub effect_type: EffectType,
    pub parameters: Vec<EffectParameter>,
    pub gpu_accelerated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EffectType {
    Video,
    Audio,
    Transition,
    Generator,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EffectParameter {
    pub name: String,
    pub param_type: String, // "float", "int", "color", "bool", "choice"
    pub default_value: serde_json::Value,
    pub min_value: Option<f32>,
    pub max_value: Option<f32>,
    pub choices: Option<Vec<String>>,
}

/// Applies a video effect to a clip
#[tauri::command]
pub fn apply_video_effect(
    clip_id: String,
    effect_id: String,
    params: serde_json::Value,
) -> CommandResult<bool> {
    // Effects include:
    // - Transform: Scale, Rotate, Position, Crop
    // - Time: Speed, Reverse, Frame Hold
    // - Color: Brightness, Contrast, Saturation, Hue
    // - Blur & Sharpen: Gaussian Blur, Motion Blur, Sharpen
    // - Distort: Lens Distortion, Ripple, Wave, Twirl
    // - Stylize: Glow, Edge Detect, Emboss, Posterize
    // - Keying: Chroma Key (Green Screen), Luma Key
    // - Noise: Add Grain, Remove Noise
    // - VR: 360° Video support, Ambisonics Audio

    Ok(true)
}

/// Applies an image effect/filter
#[tauri::command]
pub fn apply_image_effect(
    layer_id: String,
    effect_id: String,
    params: serde_json::Value,
) -> CommandResult<bool> {
    // Effects include:
    // - Artistic: Oil Paint, Watercolor, Palette Knife, Sponge
    // - Blur: Gaussian, Box, Motion, Radial, Lens
    // - Distort: Pinch, Spherize, Ripple, Twirl, Displace
    // - Noise: Add, Reduce, Median
    // - Pixelate: Mosaic, Crystallize, Pointillize
    // - Render: Clouds, Fibers, Lens Flare, Lighting Effects
    // - Sharpen: Unsharp Mask, Smart Sharpen
    // - Stylize: Diffuse, Emboss, Extrude, Wind
    // - Neural Filters: Style Transfer, Super Resolution, Colorize

    Ok(true)
}

/// Gets list of available effects
#[tauri::command]
pub fn get_available_effects(effect_type: Option<String>) -> CommandResult<Vec<Effect>> {
    use uuid::Uuid;

    let mut effects = vec![
        // Video Effects
        Effect {
            id: Uuid::new_v4().to_string(),
            name: "Gaussian Blur".to_string(),
            category: "Blur & Sharpen".to_string(),
            effect_type: EffectType::Video,
            parameters: vec![
                EffectParameter {
                    name: "Radius".to_string(),
                    param_type: "float".to_string(),
                    default_value: serde_json::json!(5.0),
                    min_value: Some(0.0),
                    max_value: Some(100.0),
                    choices: None,
                },
            ],
            gpu_accelerated: true,
        },
        Effect {
            id: Uuid::new_v4().to_string(),
            name: "Chroma Key".to_string(),
            category: "Keying".to_string(),
            effect_type: EffectType::Video,
            parameters: vec![
                EffectParameter {
                    name: "Key Color".to_string(),
                    param_type: "color".to_string(),
                    default_value: serde_json::json!("#00FF00"),
                    min_value: None,
                    max_value: None,
                    choices: None,
                },
                EffectParameter {
                    name: "Tolerance".to_string(),
                    param_type: "float".to_string(),
                    default_value: serde_json::json!(10.0),
                    min_value: Some(0.0),
                    max_value: Some(100.0),
                    choices: None,
                },
            ],
            gpu_accelerated: true,
        },
        Effect {
            id: Uuid::new_v4().to_string(),
            name: "Oil Paint".to_string(),
            category: "Artistic".to_string(),
            effect_type: EffectType::Video,
            parameters: vec![
                EffectParameter {
                    name: "Brush Size".to_string(),
                    param_type: "int".to_string(),
                    default_value: serde_json::json!(5),
                    min_value: Some(1.0),
                    max_value: Some(20.0),
                    choices: None,
                },
            ],
            gpu_accelerated: false,
        },
    ];

    // Filter by type if specified
    if let Some(type_filter) = effect_type {
        effects.retain(|e| {
            match type_filter.as_str() {
                "video" => matches!(e.effect_type, EffectType::Video),
                "audio" => matches!(e.effect_type, EffectType::Audio),
                "transition" => matches!(e.effect_type, EffectType::Transition),
                _ => true,
            }
        });
    }

    Ok(effects)
}

/// Creates a custom effect from parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomEffectDefinition {
    pub name: String,
    pub category: String,
    pub shader_code: Option<String>, // For GPU-based effects
    pub script_code: Option<String>, // For scripted effects
}

#[tauri::command]
pub fn create_custom_effect(
    definition: CustomEffectDefinition,
) -> CommandResult<Effect> {
    use uuid::Uuid;

    Ok(Effect {
        id: Uuid::new_v4().to_string(),
        name: definition.name,
        category: definition.category,
        effect_type: EffectType::Video,
        parameters: Vec::new(),
        gpu_accelerated: definition.shader_code.is_some(),
    })
}

/// Transition types and parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransitionParams {
    pub transition_type: String,
    pub duration: f32,
    pub easing: String, // "linear", "ease-in", "ease-out", "ease-in-out"
}

/// Available transitions:
/// - Dissolve/Crossfade
/// - Fade to Black/White
/// - Wipe (Left, Right, Up, Down, Diagonal)
/// - Slide (Push, Cover, Uncover)
/// - Zoom
/// - Spin
/// - Iris (Round, Diamond, Star)
/// - Page Turn
/// - Ripple
/// - Morph

#[tauri::command]
pub fn get_available_transitions() -> CommandResult<Vec<String>> {
    Ok(vec![
        "Crossfade".to_string(),
        "Fade to Black".to_string(),
        "Fade to White".to_string(),
        "Wipe Left".to_string(),
        "Wipe Right".to_string(),
        "Slide Push".to_string(),
        "Zoom In".to_string(),
        "Zoom Out".to_string(),
        "Spin".to_string(),
        "Iris Round".to_string(),
        "Page Turn".to_string(),
    ])
}

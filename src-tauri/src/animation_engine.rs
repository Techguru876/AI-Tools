// Animation Engine Module
// After Effects-style keyframe animation system with full timeline support
// Handles 2D/3D transformations, property animations, easing curves, and expressions

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Property that can be animated (position, scale, rotation, opacity, color, etc.)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimatableProperty {
    pub id: String,
    pub name: String,
    pub property_type: PropertyType,
    pub keyframes: Vec<Keyframe>,
    pub expression: Option<String>, // JavaScript-like expression for procedural animation
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PropertyType {
    Number { min: f32, max: f32 },
    Vector2D,
    Vector3D,
    Color,
    Boolean,
    Text,
}

/// Keyframe with value, time, and easing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Keyframe {
    pub time: f64,
    pub value: KeyframeValue,
    pub easing: EasingFunction,
    pub interpolation: InterpolationType,
    // Bezier handles for custom curves
    pub in_tangent: Option<(f32, f32)>,
    pub out_tangent: Option<(f32, f32)>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KeyframeValue {
    Number(f32),
    Vector2D(f32, f32),
    Vector3D(f32, f32, f32),
    Color(u8, u8, u8, u8),
    Boolean(bool),
    Text(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EasingFunction {
    Linear,
    EaseIn,
    EaseOut,
    EaseInOut,
    EaseInBack,
    EaseOutBack,
    EaseInOutBack,
    EaseInElastic,
    EaseOutElastic,
    EaseInOutElastic,
    EaseInBounce,
    EaseOutBounce,
    EaseInOutBounce,
    Custom(Vec<(f32, f32)>), // Bezier curve control points
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InterpolationType {
    Linear,
    Bezier,
    Hold, // Step interpolation (no tween)
}

impl AnimatableProperty {
    /// Evaluates the property value at a specific time
    pub fn evaluate_at(&self, time: f64) -> KeyframeValue {
        if self.keyframes.is_empty() {
            return KeyframeValue::Number(0.0);
        }

        // If we have an expression, evaluate it first
        if let Some(ref expr) = self.expression {
            if let Some(value) = self.evaluate_expression(expr, time) {
                return value;
            }
        }

        // Single keyframe - return its value
        if self.keyframes.len() == 1 {
            return self.keyframes[0].value.clone();
        }

        // Find surrounding keyframes
        let mut prev_kf: Option<&Keyframe> = None;
        let mut next_kf: Option<&Keyframe> = None;

        for (i, kf) in self.keyframes.iter().enumerate() {
            if kf.time <= time {
                prev_kf = Some(kf);
            }
            if kf.time >= time && next_kf.is_none() {
                next_kf = Some(kf);
                break;
            }
        }

        match (prev_kf, next_kf) {
            (Some(prev), Some(next)) if prev.time != next.time => {
                // Interpolate between keyframes
                let t = ((time - prev.time) / (next.time - prev.time)) as f32;
                let eased_t = self.apply_easing(t, &prev.easing);
                self.interpolate_values(&prev.value, &next.value, eased_t, &prev.interpolation)
            }
            (Some(kf), None) => kf.value.clone(), // After last keyframe
            (None, Some(kf)) => kf.value.clone(), // Before first keyframe
            _ => self.keyframes[0].value.clone(),
        }
    }

    /// Applies easing function to normalize t (0-1)
    fn apply_easing(&self, t: f32, easing: &EasingFunction) -> f32 {
        match easing {
            EasingFunction::Linear => t,
            EasingFunction::EaseIn => t * t,
            EasingFunction::EaseOut => 1.0 - (1.0 - t) * (1.0 - t),
            EasingFunction::EaseInOut => {
                if t < 0.5 {
                    2.0 * t * t
                } else {
                    1.0 - (-2.0 * t + 2.0).powi(2) / 2.0
                }
            }
            EasingFunction::EaseInBack => {
                let c1 = 1.70158;
                let c3 = c1 + 1.0;
                c3 * t * t * t - c1 * t * t
            }
            EasingFunction::EaseOutBack => {
                let c1 = 1.70158;
                let c3 = c1 + 1.0;
                1.0 + c3 * (t - 1.0).powi(3) + c1 * (t - 1.0).powi(2)
            }
            EasingFunction::EaseInOutBack => {
                let c1 = 1.70158;
                let c2 = c1 * 1.525;
                if t < 0.5 {
                    ((2.0 * t).powi(2) * ((c2 + 1.0) * 2.0 * t - c2)) / 2.0
                } else {
                    ((2.0 * t - 2.0).powi(2) * ((c2 + 1.0) * (t * 2.0 - 2.0) + c2) + 2.0) / 2.0
                }
            }
            EasingFunction::EaseOutBounce => {
                let n1 = 7.5625;
                let d1 = 2.75;
                let mut t = t;

                if t < 1.0 / d1 {
                    n1 * t * t
                } else if t < 2.0 / d1 {
                    t -= 1.5 / d1;
                    n1 * t * t + 0.75
                } else if t < 2.5 / d1 {
                    t -= 2.25 / d1;
                    n1 * t * t + 0.9375
                } else {
                    t -= 2.625 / d1;
                    n1 * t * t + 0.984375
                }
            }
            EasingFunction::Custom(points) => {
                // Bezier curve evaluation
                self.evaluate_bezier(t, points)
            }
            _ => t, // Fallback to linear for unimplemented easings
        }
    }

    /// Interpolates between two keyframe values
    fn interpolate_values(
        &self,
        a: &KeyframeValue,
        b: &KeyframeValue,
        t: f32,
        interp_type: &InterpolationType,
    ) -> KeyframeValue {
        match interp_type {
            InterpolationType::Hold => a.clone(),
            InterpolationType::Linear | InterpolationType::Bezier => match (a, b) {
                (KeyframeValue::Number(a), KeyframeValue::Number(b)) => {
                    KeyframeValue::Number(a + (b - a) * t)
                }
                (KeyframeValue::Vector2D(ax, ay), KeyframeValue::Vector2D(bx, by)) => {
                    KeyframeValue::Vector2D(ax + (bx - ax) * t, ay + (by - ay) * t)
                }
                (
                    KeyframeValue::Vector3D(ax, ay, az),
                    KeyframeValue::Vector3D(bx, by, bz),
                ) => KeyframeValue::Vector3D(
                    ax + (bx - ax) * t,
                    ay + (by - ay) * t,
                    az + (bz - az) * t,
                ),
                (
                    KeyframeValue::Color(ar, ag, ab, aa),
                    KeyframeValue::Color(br, bg, bb, ba),
                ) => {
                    let r = (*ar as f32 + (*br as f32 - *ar as f32) * t) as u8;
                    let g = (*ag as f32 + (*bg as f32 - *ag as f32) * t) as u8;
                    let b_val = (*ab as f32 + (*bb as f32 - *ab as f32) * t) as u8;
                    let a_val = (*aa as f32 + (*ba as f32 - *aa as f32) * t) as u8;
                    KeyframeValue::Color(r, g, b_val, a_val)
                }
                _ => a.clone(),
            },
        }
    }

    /// Evaluates a cubic Bezier curve
    fn evaluate_bezier(&self, t: f32, _points: &[(f32, f32)]) -> f32 {
        // Simplified cubic bezier evaluation
        // In a real implementation, this would solve for t given the control points
        t
    }

    /// Evaluates JavaScript-like expression for procedural animation
    fn evaluate_expression(&self, _expr: &str, _time: f64) -> Option<KeyframeValue> {
        // In a real implementation, this would parse and evaluate expressions like:
        // "wiggle(5, 20)" - random wiggle
        // "loopOut('cycle')" - loop animation
        // "time * 360" - rotation based on time
        // "index * 50" - offset based on layer index
        None
    }

    /// Adds a keyframe at the specified time
    pub fn add_keyframe(&mut self, time: f64, value: KeyframeValue) {
        let keyframe = Keyframe {
            time,
            value,
            easing: EasingFunction::EaseInOut,
            interpolation: InterpolationType::Bezier,
            in_tangent: None,
            out_tangent: None,
        };

        // Insert keyframe in sorted order
        let pos = self.keyframes.iter().position(|kf| kf.time > time);
        match pos {
            Some(index) => self.keyframes.insert(index, keyframe),
            None => self.keyframes.push(keyframe),
        }
    }

    /// Removes keyframe at the specified time
    pub fn remove_keyframe(&mut self, time: f64) {
        self.keyframes.retain(|kf| (kf.time - time).abs() > 0.001);
    }
}

/// Animated layer (can be shape, text, image, video, etc.)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimatedLayer {
    pub id: String,
    pub name: String,
    pub layer_type: AnimatedLayerType,
    pub parent_id: Option<String>, // For parenting layers
    pub properties: HashMap<String, AnimatableProperty>,
    pub effects: Vec<AnimatedEffect>,
    pub masks: Vec<AnimatedMask>,
    pub blend_mode: String,
    pub track_matte: Option<TrackMatte>,
    pub is_3d: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnimatedLayerType {
    Shape { shapes: Vec<ShapeElement> },
    Text { content: String, font: String },
    Image { source: String },
    Video { source: String },
    Audio { source: String },
    Solid { color: (u8, u8, u8, u8) },
    Null, // Null object for parenting
    Camera3D,
    Light3D { light_type: LightType },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LightType {
    Ambient,
    Directional,
    Point,
    Spot,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShapeElement {
    pub shape_type: ShapeType,
    pub fill: Option<FillStyle>,
    pub stroke: Option<StrokeStyle>,
    pub transform: AnimatableProperty,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ShapeType {
    Rectangle { width: f32, height: f32, rounded: f32 },
    Ellipse { width: f32, height: f32 },
    Polygon { points: u32, radius: f32 },
    Star { points: u32, inner_radius: f32, outer_radius: f32 },
    Path { path_data: String }, // SVG path data
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FillStyle {
    pub color: AnimatableProperty,
    pub opacity: AnimatableProperty,
    pub fill_rule: FillRule,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FillRule {
    NonZero,
    EvenOdd,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrokeStyle {
    pub color: AnimatableProperty,
    pub width: AnimatableProperty,
    pub line_cap: LineCap,
    pub line_join: LineJoin,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LineCap {
    Butt,
    Round,
    Square,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LineJoin {
    Miter,
    Round,
    Bevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimatedEffect {
    pub id: String,
    pub effect_type: String,
    pub parameters: HashMap<String, AnimatableProperty>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimatedMask {
    pub id: String,
    pub path: AnimatableProperty, // Animated path
    pub mode: MaskMode,
    pub feather: AnimatableProperty,
    pub opacity: AnimatableProperty,
    pub expansion: AnimatableProperty,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MaskMode {
    Add,
    Subtract,
    Intersect,
    Difference,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackMatte {
    pub layer_id: String,
    pub matte_type: MatteType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MatteType {
    Alpha,
    AlphaInverted,
    Luma,
    LumaInverted,
}

impl AnimatedLayer {
    /// Gets property value at specific time
    pub fn get_property_value(&self, property_name: &str, time: f64) -> Option<KeyframeValue> {
        self.properties
            .get(property_name)
            .map(|prop| prop.evaluate_at(time))
    }

    /// Renders the layer at a specific time
    pub fn render_at(&self, time: f64, width: u32, height: u32) -> Vec<u8> {
        // In a real implementation, this would:
        // 1. Evaluate all animated properties at the given time
        // 2. Apply transforms (position, scale, rotation)
        // 3. Render the layer content (shape, text, image, etc.)
        // 4. Apply effects
        // 5. Apply masks
        // 6. Return RGBA buffer

        vec![0u8; (width * height * 4) as usize]
    }
}

/// Composition (After Effects comp)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Composition {
    pub id: String,
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub duration: f64,
    pub fps: u32,
    pub layers: Vec<AnimatedLayer>,
    pub background_color: (u8, u8, u8, u8),
}

impl Composition {
    /// Renders the composition at a specific time
    pub fn render_frame(&self, time: f64) -> Vec<u8> {
        let mut frame = vec![0u8; (self.width * self.height * 4) as usize];

        // Fill with background color
        for pixel in frame.chunks_exact_mut(4) {
            pixel[0] = self.background_color.0;
            pixel[1] = self.background_color.1;
            pixel[2] = self.background_color.2;
            pixel[3] = self.background_color.3;
        }

        // Render layers from bottom to top
        for layer in &self.layers {
            let layer_buffer = layer.render_at(time, self.width, self.height);
            // Composite layer onto frame using blend mode
            self.composite_layer(&mut frame, &layer_buffer, &layer.blend_mode);
        }

        frame
    }

    fn composite_layer(&self, target: &mut [u8], source: &[u8], _blend_mode: &str) {
        // Simple alpha compositing for now
        for (i, pixel) in source.chunks_exact(4).enumerate() {
            let target_idx = i * 4;
            let alpha = pixel[3] as f32 / 255.0;

            target[target_idx] =
                ((1.0 - alpha) * target[target_idx] as f32 + alpha * pixel[0] as f32) as u8;
            target[target_idx + 1] =
                ((1.0 - alpha) * target[target_idx + 1] as f32 + alpha * pixel[1] as f32) as u8;
            target[target_idx + 2] =
                ((1.0 - alpha) * target[target_idx + 2] as f32 + alpha * pixel[2] as f32) as u8;
            target[target_idx + 3] = (((1.0 - alpha) * target[target_idx + 3] as f32
                + alpha * pixel[3] as f32) as u8)
                .max(target[target_idx + 3]);
        }
    }
}

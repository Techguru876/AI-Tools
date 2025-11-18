// Motion Graphics Module
// Particle systems, physics simulations, kinetic typography, and advanced effects

use serde::{Deserialize, Serialize};
use crate::animation_engine::{AnimatableProperty, KeyframeValue};
use rand::Rng;

/// Particle system generator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParticleSystem {
    pub id: String,
    pub name: String,
    pub emitter: ParticleEmitter,
    pub particles: Vec<Particle>,
    pub max_particles: usize,
    pub particle_lifetime: f32,
    pub properties: ParticleProperties,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParticleEmitter {
    pub emitter_type: EmitterType,
    pub position: (f32, f32, f32),
    pub emission_rate: f32, // particles per second
    pub spread: f32,         // angle in degrees
    pub velocity: (f32, f32, f32),
    pub velocity_random: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EmitterType {
    Point,
    Line { start: (f32, f32, f32), end: (f32, f32, f32) },
    Circle { radius: f32 },
    Box { width: f32, height: f32, depth: f32 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Particle {
    pub position: (f32, f32, f32),
    pub velocity: (f32, f32, f32),
    pub age: f32,
    pub lifetime: f32,
    pub size: f32,
    pub rotation: f32,
    pub color: (u8, u8, u8, u8),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParticleProperties {
    pub size: AnimatableProperty,
    pub size_random: f32,
    pub color_over_life: Vec<(f32, u8, u8, u8, u8)>, // (time, r, g, b, a)
    pub opacity_over_life: Vec<(f32, f32)>,
    pub rotation_speed: f32,
    pub gravity: (f32, f32, f32),
    pub wind: (f32, f32, f32),
    pub turbulence: f32,
    pub blend_mode: String,
}

impl ParticleSystem {
    /// Updates particle system simulation
    pub fn update(&mut self, delta_time: f32) {
        // Emit new particles
        let particles_to_emit = (self.emitter.emission_rate * delta_time) as usize;
        for _ in 0..particles_to_emit {
            if self.particles.len() < self.max_particles {
                self.emit_particle();
            }
        }

        // Update existing particles
        self.particles.retain_mut(|particle| {
            particle.age += delta_time;

            if particle.age >= particle.lifetime {
                return false; // Remove dead particles
            }

            // Apply physics
            particle.velocity.0 += self.properties.gravity.0 * delta_time;
            particle.velocity.1 += self.properties.gravity.1 * delta_time;
            particle.velocity.2 += self.properties.gravity.2 * delta_time;

            // Apply wind
            particle.velocity.0 += self.properties.wind.0 * delta_time;
            particle.velocity.1 += self.properties.wind.1 * delta_time;
            particle.velocity.2 += self.properties.wind.2 * delta_time;

            // Apply turbulence (noise)
            if self.properties.turbulence > 0.0 {
                let mut rng = rand::thread_rng();
                let turb_x = rng.gen_range(-self.properties.turbulence..self.properties.turbulence);
                let turb_y = rng.gen_range(-self.properties.turbulence..self.properties.turbulence);
                particle.velocity.0 += turb_x * delta_time;
                particle.velocity.1 += turb_y * delta_time;
            }

            // Update position
            particle.position.0 += particle.velocity.0 * delta_time;
            particle.position.1 += particle.velocity.1 * delta_time;
            particle.position.2 += particle.velocity.2 * delta_time;

            // Update rotation
            particle.rotation += self.properties.rotation_speed * delta_time;

            // Update color/opacity based on lifetime
            let life_progress = particle.age / particle.lifetime;
            particle.color = self.interpolate_color_over_life(life_progress);

            true // Keep particle alive
        });
    }

    fn emit_particle(&mut self) {
        let mut rng = rand::thread_rng();

        // Calculate initial position based on emitter type
        let position = match &self.emitter.emitter_type {
            EmitterType::Point => self.emitter.position,
            EmitterType::Circle { radius } => {
                let angle = rng.gen_range(0.0..(2.0 * std::f32::consts::PI));
                let r = rng.gen_range(0.0..*radius);
                (
                    self.emitter.position.0 + r * angle.cos(),
                    self.emitter.position.1 + r * angle.sin(),
                    self.emitter.position.2,
                )
            }
            _ => self.emitter.position,
        };

        // Calculate initial velocity with randomness
        let vel_rand = rng.gen_range(-self.emitter.velocity_random..self.emitter.velocity_random);
        let velocity = (
            self.emitter.velocity.0 + vel_rand,
            self.emitter.velocity.1 + vel_rand,
            self.emitter.velocity.2 + vel_rand,
        );

        // Get size from animated property (evaluate at time 0)
        let size = match self.properties.size.evaluate_at(0.0) {
            KeyframeValue::Number(s) => s,
            _ => 10.0,
        };

        let size_variance = rng.gen_range(1.0 - self.properties.size_random..1.0 + self.properties.size_random);

        let particle = Particle {
            position,
            velocity,
            age: 0.0,
            lifetime: self.particle_lifetime,
            size: size * size_variance,
            rotation: rng.gen_range(0.0..360.0),
            color: self.interpolate_color_over_life(0.0),
        };

        self.particles.push(particle);
    }

    fn interpolate_color_over_life(&self, life_progress: f32) -> (u8, u8, u8, u8) {
        if self.properties.color_over_life.is_empty() {
            return (255, 255, 255, 255);
        }

        // Find surrounding color stops
        for i in 0..self.properties.color_over_life.len() - 1 {
            let (t0, r0, g0, b0, a0) = self.properties.color_over_life[i];
            let (t1, r1, g1, b1, a1) = self.properties.color_over_life[i + 1];

            if life_progress >= t0 && life_progress <= t1 {
                let t = (life_progress - t0) / (t1 - t0);
                return (
                    (r0 as f32 + (r1 as f32 - r0 as f32) * t) as u8,
                    (g0 as f32 + (g1 as f32 - g0 as f32) * t) as u8,
                    (b0 as f32 + (b1 as f32 - b0 as f32) * t) as u8,
                    (a0 as f32 + (a1 as f32 - a0 as f32) * t) as u8,
                );
            }
        }

        self.properties.color_over_life.last().map(|&(_, r, g, b, a)| (r, g, b, a)).unwrap()
    }

    /// Renders particles to buffer
    pub fn render(&self, buffer: &mut [u8], width: u32, height: u32) {
        for particle in &self.particles {
            // Simple point rendering for now
            // In a real implementation, would render sprite/shape with rotation and blending
            let x = particle.position.0 as i32;
            let y = particle.position.1 as i32;

            if x >= 0 && x < width as i32 && y >= 0 && y < height as i32 {
                let idx = ((y * width as i32 + x) * 4) as usize;
                if idx + 3 < buffer.len() {
                    buffer[idx] = particle.color.0;
                    buffer[idx + 1] = particle.color.1;
                    buffer[idx + 2] = particle.color.2;
                    buffer[idx + 3] = particle.color.3;
                }
            }
        }
    }
}

/// Kinetic typography animator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KineticText {
    pub id: String,
    pub text: String,
    pub font: String,
    pub font_size: f32,
    pub animator_groups: Vec<TextAnimatorGroup>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextAnimatorGroup {
    pub name: String,
    pub selector: TextSelector,
    pub properties: TextAnimatorProperties,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextSelector {
    pub selector_type: TextSelectorType,
    pub start: AnimatableProperty,  // 0-100%
    pub end: AnimatableProperty,    // 0-100%
    pub offset: AnimatableProperty, // Animated offset
    pub mode: TextSelectorMode,
    pub shape: TextSelectorShape,
    pub smoothness: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TextSelectorType {
    Range,
    Wiggly,
    Expression,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TextSelectorMode {
    Add,
    Subtract,
    Intersect,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TextSelectorShape {
    Square,
    RampUp,
    RampDown,
    Triangle,
    Round,
    Smooth,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextAnimatorProperties {
    pub position: Option<AnimatableProperty>,
    pub scale: Option<AnimatableProperty>,
    pub rotation: Option<AnimatableProperty>,
    pub opacity: Option<AnimatableProperty>,
    pub fill_color: Option<AnimatableProperty>,
    pub stroke_color: Option<AnimatableProperty>,
    pub stroke_width: Option<AnimatableProperty>,
    pub tracking: Option<AnimatableProperty>, // Letter spacing
    pub blur: Option<AnimatableProperty>,
}

/// Motion tracking data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MotionTracker {
    pub id: String,
    pub track_points: Vec<TrackPoint>,
    pub tracking_method: TrackingMethod,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackPoint {
    pub time: f64,
    pub position: (f32, f32),
    pub confidence: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrackingMethod {
    Point,      // Single point tracking
    Transform,  // Position, scale, rotation
    Corner,     // Four-point tracking
    Planar,     // Planar surface tracking
    Camera,     // 3D camera solve
}

impl MotionTracker {
    /// Applies tracked motion to a layer
    pub fn apply_to_layer(&self, _layer_id: &str, _time: f64) {
        // In a real implementation, this would:
        // 1. Get tracking data at the specified time
        // 2. Apply position/rotation/scale to the layer
        // 3. Handle tracking loss and smoothing
    }

    /// Stabilizes footage based on tracking data
    pub fn stabilize(&self, _frame: &[u8], _time: f64) -> Vec<u8> {
        // Inverse tracking to stabilize footage
        Vec::new()
    }
}

/// Expression engine for procedural animation
pub struct ExpressionEngine {
    variables: std::collections::HashMap<String, f32>,
}

impl ExpressionEngine {
    pub fn new() -> Self {
        ExpressionEngine {
            variables: std::collections::HashMap::new(),
        }
    }

    /// Evaluates an expression string
    pub fn evaluate(&mut self, expression: &str, time: f64) -> Option<f32> {
        // Set built-in variables
        self.variables.insert("time".to_string(), time as f32);
        self.variables.insert("value".to_string(), 0.0);

        // In a real implementation, this would:
        // 1. Parse the expression (using a library like meval or custom parser)
        // 2. Support functions: wiggle, loopOut, loopIn, random, noise, etc.
        // 3. Support math operations and conditionals
        // 4. Return the evaluated result

        // Common After Effects expressions:
        // "wiggle(5, 20)" - wiggle 5 times per second with amplitude 20
        // "loopOut('cycle')" - loop animation infinitely
        // "time * 360" - rotate 360 degrees per second
        // "index * 50" - offset by layer index
        // "linear(time, 0, 1, 0, 100)" - remap time to range

        None
    }

    /// Wiggle function - random oscillation
    pub fn wiggle(&self, frequency: f32, amplitude: f32, time: f64) -> f32 {
        let phase = time as f32 * frequency;
        let noise = self.perlin_noise(phase);
        noise * amplitude
    }

    /// Perlin noise for smooth random values
    fn perlin_noise(&self, x: f32) -> f32 {
        // Simplified Perlin noise
        let i = x.floor() as i32;
        let f = x - x.floor();
        let u = f * f * (3.0 - 2.0 * f); // Smoothstep

        let a = self.noise_hash(i);
        let b = self.noise_hash(i + 1);

        a * (1.0 - u) + b * u
    }

    fn noise_hash(&self, x: i32) -> f32 {
        let mut x = x;
        x = (x << 13) ^ x;
        let t = (x * (x * x * 15731 + 789221) + 1376312589) & 0x7fffffff;
        1.0 - (t as f32 / 1073741824.0)
    }
}

/// 3D Camera for compositions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Camera3D {
    pub id: String,
    pub camera_type: CameraType,
    pub position: AnimatableProperty,
    pub point_of_interest: AnimatableProperty,
    pub orientation: AnimatableProperty, // Rotation in 3D space
    pub zoom: AnimatableProperty,
    pub focal_length: AnimatableProperty,
    pub aperture: AnimatableProperty,
    pub depth_of_field: bool,
    pub focus_distance: AnimatableProperty,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CameraType {
    OneNode,  // Camera position and rotation
    TwoNode,  // Camera and point of interest
}

/// 3D Light for compositions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Light3D {
    pub id: String,
    pub light_type: LightType3D,
    pub position: AnimatableProperty,
    pub point_of_interest: AnimatableProperty,
    pub intensity: AnimatableProperty,
    pub color: AnimatableProperty,
    pub cone_angle: AnimatableProperty,      // For spot lights
    pub cone_feather: AnimatableProperty,    // For spot lights
    pub shadows: bool,
    pub shadow_darkness: AnimatableProperty,
    pub shadow_diffusion: AnimatableProperty,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LightType3D {
    Ambient,
    Directional,
    Point,
    Spot,
}

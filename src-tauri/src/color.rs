// Color Module
// Color grading, LUTs, curves, color spaces

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Color LUT (Look-Up Table) for color grading
pub struct ColorLUT {
    pub size: usize,
    pub data: Vec<[f32; 3]>, // RGB values
}

impl ColorLUT {
    /// Loads a .cube LUT file
    pub fn load_cube(path: &PathBuf) -> Result<Self, String> {
        // In a real implementation, this would:
        // 1. Parse the .cube file format
        // 2. Extract the LUT size and data
        // 3. Support various LUT sizes (17x17x17, 33x33x33, 65x65x65)

        Ok(ColorLUT {
            size: 33,
            data: Vec::new(),
        })
    }

    /// Applies the LUT to an RGB color
    pub fn apply(&self, r: f32, g: f32, b: f32) -> (f32, f32, f32) {
        // Trilinear interpolation through the 3D LUT
        let size = self.size as f32 - 1.0;
        let r_idx = r * size;
        let g_idx = g * size;
        let b_idx = b * size;

        // In a real implementation, would do proper 3D interpolation
        (r, g, b)
    }

    /// Applies LUT to an entire frame
    pub fn apply_to_frame(&self, frame: &mut [u8], intensity: f32) {
        for pixel in frame.chunks_exact_mut(4) {
            let r = pixel[0] as f32 / 255.0;
            let g = pixel[1] as f32 / 255.0;
            let b = pixel[2] as f32 / 255.0;

            let (new_r, new_g, new_b) = self.apply(r, g, b);

            // Blend with original based on intensity
            pixel[0] = ((r + (new_r - r) * intensity) * 255.0).clamp(0.0, 255.0) as u8;
            pixel[1] = ((g + (new_g - g) * intensity) * 255.0).clamp(0.0, 255.0) as u8;
            pixel[2] = ((b + (new_b - b) * intensity) * 255.0).clamp(0.0, 255.0) as u8;
        }
    }
}

/// Color curves for precise adjustment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColorCurves {
    pub master: Vec<(f32, f32)>,
    pub red: Vec<(f32, f32)>,
    pub green: Vec<(f32, f32)>,
    pub blue: Vec<(f32, f32)>,
}

impl ColorCurves {
    pub fn new() -> Self {
        // Default linear curves
        ColorCurves {
            master: vec![(0.0, 0.0), (1.0, 1.0)],
            red: vec![(0.0, 0.0), (1.0, 1.0)],
            green: vec![(0.0, 0.0), (1.0, 1.0)],
            blue: vec![(0.0, 0.0), (1.0, 1.0)],
        }
    }

    /// Evaluates a curve at a given input value
    fn evaluate_curve(curve: &[(f32, f32)], input: f32) -> f32 {
        // Linear interpolation between control points
        for i in 0..curve.len() - 1 {
            if input >= curve[i].0 && input <= curve[i + 1].0 {
                let t = (input - curve[i].0) / (curve[i + 1].0 - curve[i].0);
                return curve[i].1 + t * (curve[i + 1].1 - curve[i].1);
            }
        }
        input
    }

    /// Applies curves to an RGB color
    pub fn apply(&self, r: f32, g: f32, b: f32) -> (f32, f32, f32) {
        // Apply master curve
        let r = Self::evaluate_curve(&self.master, r);
        let g = Self::evaluate_curve(&self.master, g);
        let b = Self::evaluate_curve(&self.master, b);

        // Apply individual channel curves
        let r = Self::evaluate_curve(&self.red, r);
        let g = Self::evaluate_curve(&self.green, g);
        let b = Self::evaluate_curve(&self.blue, b);

        (r.clamp(0.0, 1.0), g.clamp(0.0, 1.0), b.clamp(0.0, 1.0))
    }

    /// Applies curves to an entire frame
    pub fn apply_to_frame(&self, frame: &mut [u8]) {
        for pixel in frame.chunks_exact_mut(4) {
            let r = pixel[0] as f32 / 255.0;
            let g = pixel[1] as f32 / 255.0;
            let b = pixel[2] as f32 / 255.0;

            let (new_r, new_g, new_b) = self.apply(r, g, b);

            pixel[0] = (new_r * 255.0) as u8;
            pixel[1] = (new_g * 255.0) as u8;
            pixel[2] = (new_b * 255.0) as u8;
        }
    }
}

/// Color scopes for analysis
pub struct ColorScopes;

impl ColorScopes {
    /// Generates histogram data
    pub fn histogram(frame: &[u8]) -> ([Vec<u32>; 4], usize) {
        let mut red = vec![0u32; 256];
        let mut green = vec![0u32; 256];
        let mut blue = vec![0u32; 256];
        let mut luma = vec![0u32; 256];
        let mut pixel_count = 0;

        for pixel in frame.chunks_exact(4) {
            red[pixel[0] as usize] += 1;
            green[pixel[1] as usize] += 1;
            blue[pixel[2] as usize] += 1;

            // Calculate luminance (Rec. 709)
            let y = (0.2126 * pixel[0] as f32 + 0.7152 * pixel[1] as f32 + 0.0722 * pixel[2] as f32)
                .clamp(0.0, 255.0) as usize;
            luma[y] += 1;

            pixel_count += 1;
        }

        ([red, green, blue, luma], pixel_count)
    }

    /// Generates waveform data
    pub fn waveform(frame: &[u8], width: u32, height: u32) -> Vec<Vec<u8>> {
        let mut waveform = vec![vec![0u8; width as usize]; 256];

        for y in 0..height {
            for x in 0..width {
                let idx = ((y * width + x) * 4) as usize;
                if idx + 2 < frame.len() {
                    // Calculate luminance
                    let luma = (0.2126 * frame[idx] as f32
                        + 0.7152 * frame[idx + 1] as f32
                        + 0.0722 * frame[idx + 2] as f32)
                        .clamp(0.0, 255.0) as usize;

                    waveform[luma][x as usize] = waveform[luma][x as usize].saturating_add(1);
                }
            }
        }

        waveform
    }

    /// Generates vectorscope data (chrominance)
    pub fn vectorscope(frame: &[u8]) -> Vec<Vec<u32>> {
        let size = 512;
        let mut scope = vec![vec![0u32; size]; size];
        let center = (size / 2) as i32;

        for pixel in frame.chunks_exact(4) {
            let r = pixel[0] as f32 / 255.0;
            let g = pixel[1] as f32 / 255.0;
            let b = pixel[2] as f32 / 255.0;

            // Convert RGB to YUV
            let u = -0.147 * r - 0.289 * g + 0.436 * b;
            let v = 0.615 * r - 0.515 * g - 0.100 * b;

            // Map to vectorscope coordinates
            let x = (center as f32 + u * center as f32 * 0.8).clamp(0.0, (size - 1) as f32) as usize;
            let y = (center as f32 + v * center as f32 * 0.8).clamp(0.0, (size - 1) as f32) as usize;

            scope[y][x] = scope[y][x].saturating_add(1);
        }

        scope
    }
}

/// Color space conversions
pub struct ColorSpace;

impl ColorSpace {
    /// Converts sRGB to linear RGB
    pub fn srgb_to_linear(value: f32) -> f32 {
        if value <= 0.04045 {
            value / 12.92
        } else {
            ((value + 0.055) / 1.055).powf(2.4)
        }
    }

    /// Converts linear RGB to sRGB
    pub fn linear_to_srgb(value: f32) -> f32 {
        if value <= 0.0031308 {
            value * 12.92
        } else {
            1.055 * value.powf(1.0 / 2.4) - 0.055
        }
    }

    /// Converts RGB to HSL
    pub fn rgb_to_hsl(r: f32, g: f32, b: f32) -> (f32, f32, f32) {
        let max = r.max(g).max(b);
        let min = r.min(g).min(b);
        let delta = max - min;

        let l = (max + min) / 2.0;

        if delta == 0.0 {
            return (0.0, 0.0, l);
        }

        let s = if l < 0.5 {
            delta / (max + min)
        } else {
            delta / (2.0 - max - min)
        };

        let h = if max == r {
            ((g - b) / delta + if g < b { 6.0 } else { 0.0 }) / 6.0
        } else if max == g {
            ((b - r) / delta + 2.0) / 6.0
        } else {
            ((r - g) / delta + 4.0) / 6.0
        };

        (h, s, l)
    }

    /// Converts HSL to RGB
    pub fn hsl_to_rgb(h: f32, s: f32, l: f32) -> (f32, f32, f32) {
        if s == 0.0 {
            return (l, l, l);
        }

        let q = if l < 0.5 {
            l * (1.0 + s)
        } else {
            l + s - l * s
        };
        let p = 2.0 * l - q;

        let r = Self::hue_to_rgb(p, q, h + 1.0 / 3.0);
        let g = Self::hue_to_rgb(p, q, h);
        let b = Self::hue_to_rgb(p, q, h - 1.0 / 3.0);

        (r, g, b)
    }

    fn hue_to_rgb(p: f32, q: f32, mut t: f32) -> f32 {
        if t < 0.0 {
            t += 1.0;
        }
        if t > 1.0 {
            t -= 1.0;
        }
        if t < 1.0 / 6.0 {
            p + (q - p) * 6.0 * t
        } else if t < 1.0 / 2.0 {
            q
        } else if t < 2.0 / 3.0 {
            p + (q - p) * (2.0 / 3.0 - t) * 6.0
        } else {
            p
        }
    }
}

// Utils Module
// Utility functions and helpers

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// System information utilities
pub struct SystemInfo;

impl SystemInfo {
    /// Gets CPU information
    pub fn cpu_info() -> CpuInfo {
        CpuInfo {
            cores: num_cpus::get(),
            threads: num_cpus::get(),
            model: "CPU Model".to_string(),
        }
    }

    /// Gets memory information
    pub fn memory_info() -> MemoryInfo {
        // In a real implementation, this would query actual system memory
        MemoryInfo {
            total_bytes: 16 * 1024 * 1024 * 1024,
            available_bytes: 8 * 1024 * 1024 * 1024,
        }
    }

    /// Gets GPU information
    pub fn gpu_info() -> Vec<GpuInfo> {
        // In a real implementation, this would query GPUs via OpenCL/CUDA/Vulkan
        vec![GpuInfo {
            name: "Graphics Card".to_string(),
            vendor: "Vendor".to_string(),
            memory_bytes: 8 * 1024 * 1024 * 1024,
            driver_version: "1.0.0".to_string(),
        }]
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuInfo {
    pub cores: usize,
    pub threads: usize,
    pub model: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryInfo {
    pub total_bytes: u64,
    pub available_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuInfo {
    pub name: String,
    pub vendor: String,
    pub memory_bytes: u64,
    pub driver_version: String,
}

/// File format utilities
pub struct FormatUtils;

impl FormatUtils {
    /// Checks if a file format is supported
    pub fn is_supported(extension: &str) -> bool {
        matches!(
            extension.to_lowercase().as_str(),
            "mp4" | "mov" | "avi" | "webm" | "mkv" | "png" | "jpg" | "jpeg" | "tiff" | "psd"
                | "webp" | "gif" | "svg" | "mp3" | "wav" | "aac" | "flac"
        )
    }

    /// Gets the media type from extension
    pub fn get_media_type(extension: &str) -> Option<MediaType> {
        match extension.to_lowercase().as_str() {
            "mp4" | "mov" | "avi" | "webm" | "mkv" => Some(MediaType::Video),
            "png" | "jpg" | "jpeg" | "tiff" | "psd" | "webp" | "gif" | "svg" => {
                Some(MediaType::Image)
            }
            "mp3" | "wav" | "aac" | "flac" | "ogg" => Some(MediaType::Audio),
            _ => None,
        }
    }

    /// Formats file size for display
    pub fn format_file_size(bytes: u64) -> String {
        const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB"];
        let mut size = bytes as f64;
        let mut unit_index = 0;

        while size >= 1024.0 && unit_index < UNITS.len() - 1 {
            size /= 1024.0;
            unit_index += 1;
        }

        format!("{:.2} {}", size, UNITS[unit_index])
    }

    /// Formats duration for display
    pub fn format_duration(seconds: f64) -> String {
        let hours = (seconds / 3600.0) as u32;
        let minutes = ((seconds % 3600.0) / 60.0) as u32;
        let secs = (seconds % 60.0) as u32;
        let millis = ((seconds % 1.0) * 1000.0) as u32;

        if hours > 0 {
            format!("{:02}:{:02}:{:02}.{:03}", hours, minutes, secs, millis)
        } else {
            format!("{:02}:{:02}.{:03}", minutes, secs, millis)
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum MediaType {
    Video,
    Audio,
    Image,
}

/// Cache management utilities
pub struct CacheManager {
    cache_dir: PathBuf,
    max_size_bytes: u64,
}

impl CacheManager {
    pub fn new(cache_dir: PathBuf, max_size_bytes: u64) -> Self {
        CacheManager {
            cache_dir,
            max_size_bytes,
        }
    }

    /// Gets current cache size
    pub fn get_size(&self) -> Result<u64, String> {
        let mut total_size = 0u64;

        if self.cache_dir.exists() {
            for entry in std::fs::read_dir(&self.cache_dir).map_err(|e| e.to_string())? {
                if let Ok(entry) = entry {
                    if let Ok(metadata) = entry.metadata() {
                        total_size += metadata.len();
                    }
                }
            }
        }

        Ok(total_size)
    }

    /// Clears the cache
    pub fn clear(&self) -> Result<(), String> {
        if self.cache_dir.exists() {
            std::fs::remove_dir_all(&self.cache_dir).map_err(|e| e.to_string())?;
            std::fs::create_dir_all(&self.cache_dir).map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    /// Optimizes cache by removing old files
    pub fn optimize(&self) -> Result<(), String> {
        let current_size = self.get_size()?;

        if current_size <= self.max_size_bytes {
            return Ok(());
        }

        // Get all files sorted by access time
        let mut files: Vec<_> = std::fs::read_dir(&self.cache_dir)
            .map_err(|e| e.to_string())?
            .filter_map(|e| e.ok())
            .filter_map(|e| {
                e.metadata().ok().and_then(|m| {
                    m.accessed()
                        .ok()
                        .map(|t| (e.path(), m.len(), t))
                })
            })
            .collect();

        // Sort by access time (oldest first)
        files.sort_by_key(|(_, _, time)| *time);

        // Remove files until we're under the limit
        let mut removed_size = 0u64;
        let target_remove = current_size - self.max_size_bytes;

        for (path, size, _) in files {
            if removed_size >= target_remove {
                break;
            }

            if let Err(e) = std::fs::remove_file(&path) {
                eprintln!("Failed to remove cache file {:?}: {}", path, e);
            } else {
                removed_size += size;
            }
        }

        Ok(())
    }
}

/// Thumbnail generator
pub struct ThumbnailGenerator;

impl ThumbnailGenerator {
    /// Generates a thumbnail from an image
    pub fn from_image(
        image_path: &PathBuf,
        width: u32,
        height: u32,
    ) -> Result<Vec<u8>, String> {
        use image::GenericImageView;

        let img = image::open(image_path).map_err(|e| e.to_string())?;
        let thumbnail = img.thumbnail(width, height);

        let mut buffer = Vec::new();
        thumbnail
            .write_to(
                &mut std::io::Cursor::new(&mut buffer),
                image::ImageOutputFormat::Jpeg(80),
            )
            .map_err(|e| e.to_string())?;

        Ok(buffer)
    }

    /// Generates a thumbnail from a video frame
    pub fn from_video(
        video_path: &PathBuf,
        timestamp: f64,
        width: u32,
        height: u32,
    ) -> Result<Vec<u8>, String> {
        // In a real implementation, this would:
        // 1. Use FFmpeg to extract a frame at the timestamp
        // 2. Resize it to the thumbnail size
        // 3. Encode as JPEG

        Ok(Vec::new())
    }
}

/// Performance profiler
pub struct Profiler {
    start_time: std::time::Instant,
    markers: Vec<(String, std::time::Duration)>,
}

impl Profiler {
    pub fn new() -> Self {
        Profiler {
            start_time: std::time::Instant::now(),
            markers: Vec::new(),
        }
    }

    pub fn mark(&mut self, label: String) {
        let elapsed = self.start_time.elapsed();
        self.markers.push((label, elapsed));
    }

    pub fn report(&self) -> String {
        let mut report = String::from("Performance Report:\n");
        for (label, duration) in &self.markers {
            report.push_str(&format!("  {}: {:?}\n", label, duration));
        }
        report
    }
}

/// Math utilities
pub mod math {
    /// Clamps a value between min and max
    pub fn clamp<T: PartialOrd>(value: T, min: T, max: T) -> T {
        if value < min {
            min
        } else if value > max {
            max
        } else {
            value
        }
    }

    /// Linear interpolation
    pub fn lerp(a: f32, b: f32, t: f32) -> f32 {
        a + (b - a) * t
    }

    /// Ease-in-out interpolation
    pub fn ease_in_out(t: f32) -> f32 {
        if t < 0.5 {
            2.0 * t * t
        } else {
            -1.0 + (4.0 - 2.0 * t) * t
        }
    }
}

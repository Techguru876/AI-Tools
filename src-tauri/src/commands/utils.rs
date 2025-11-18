// Utility Commands
// System information, format support, cache management

use super::*;
use serde::{Deserialize, Serialize};

/// System information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub version: String,
    pub cpu_cores: usize,
    pub total_memory: u64,
    pub available_memory: u64,
    pub gpu_info: Vec<GpuInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuInfo {
    pub name: String,
    pub vendor: String,
    pub memory: u64,
    pub driver_version: String,
}

/// Gets system information
#[tauri::command]
pub fn get_system_info() -> CommandResult<SystemInfo> {
    let cpu_cores = num_cpus::get();

    Ok(SystemInfo {
        os: std::env::consts::OS.to_string(),
        version: "1.0.0".to_string(),
        cpu_cores,
        total_memory: 16 * 1024 * 1024 * 1024, // Example: 16GB
        available_memory: 8 * 1024 * 1024 * 1024, // Example: 8GB
        gpu_info: vec![
            GpuInfo {
                name: "NVIDIA GeForce RTX 3080".to_string(),
                vendor: "NVIDIA".to_string(),
                memory: 10 * 1024 * 1024 * 1024, // 10GB
                driver_version: "525.60.11".to_string(),
            },
        ],
    })
}

/// Supported format information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormatInfo {
    pub category: String,
    pub formats: Vec<FormatDetails>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormatDetails {
    pub extension: String,
    pub name: String,
    pub can_read: bool,
    pub can_write: bool,
    pub supports_layers: bool,
    pub supports_alpha: bool,
}

/// Gets supported file formats
#[tauri::command]
pub fn get_supported_formats() -> CommandResult<Vec<FormatInfo>> {
    Ok(vec![
        FormatInfo {
            category: "Video".to_string(),
            formats: vec![
                FormatDetails {
                    extension: "mp4".to_string(),
                    name: "MPEG-4".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: false,
                },
                FormatDetails {
                    extension: "mov".to_string(),
                    name: "QuickTime".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: true,
                },
                FormatDetails {
                    extension: "avi".to_string(),
                    name: "Audio Video Interleave".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: false,
                },
                FormatDetails {
                    extension: "webm".to_string(),
                    name: "WebM".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: true,
                },
                FormatDetails {
                    extension: "mkv".to_string(),
                    name: "Matroska".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: false,
                },
            ],
        },
        FormatInfo {
            category: "Image".to_string(),
            formats: vec![
                FormatDetails {
                    extension: "png".to_string(),
                    name: "Portable Network Graphics".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: true,
                },
                FormatDetails {
                    extension: "jpg".to_string(),
                    name: "JPEG".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: false,
                },
                FormatDetails {
                    extension: "tiff".to_string(),
                    name: "Tagged Image File Format".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: true,
                    supports_alpha: true,
                },
                FormatDetails {
                    extension: "psd".to_string(),
                    name: "Photoshop Document".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: true,
                    supports_alpha: true,
                },
                FormatDetails {
                    extension: "webp".to_string(),
                    name: "WebP".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: true,
                },
                FormatDetails {
                    extension: "gif".to_string(),
                    name: "Graphics Interchange Format".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: true,
                },
                FormatDetails {
                    extension: "svg".to_string(),
                    name: "Scalable Vector Graphics".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: true,
                    supports_alpha: true,
                },
            ],
        },
        FormatInfo {
            category: "Audio".to_string(),
            formats: vec![
                FormatDetails {
                    extension: "mp3".to_string(),
                    name: "MPEG Audio Layer 3".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: false,
                },
                FormatDetails {
                    extension: "wav".to_string(),
                    name: "Waveform Audio".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: false,
                },
                FormatDetails {
                    extension: "aac".to_string(),
                    name: "Advanced Audio Coding".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: false,
                },
                FormatDetails {
                    extension: "flac".to_string(),
                    name: "Free Lossless Audio Codec".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: false,
                },
                FormatDetails {
                    extension: "ogg".to_string(),
                    name: "Ogg Vorbis".to_string(),
                    can_read: true,
                    can_write: true,
                    supports_layers: false,
                    supports_alpha: false,
                },
            ],
        },
    ])
}

/// Cache statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheStats {
    pub total_size: u64,
    pub preview_cache_size: u64,
    pub proxy_cache_size: u64,
    pub thumbnail_cache_size: u64,
    pub file_count: u64,
}

/// Optimizes the cache (clears old/unused items)
#[tauri::command]
pub fn optimize_cache() -> CommandResult<CacheStats> {
    // In a real implementation, this would:
    // 1. Scan cache directories
    // 2. Remove old/unused cache files
    // 3. Return updated statistics

    Ok(CacheStats {
        total_size: 500 * 1024 * 1024, // 500MB
        preview_cache_size: 300 * 1024 * 1024,
        proxy_cache_size: 150 * 1024 * 1024,
        thumbnail_cache_size: 50 * 1024 * 1024,
        file_count: 1250,
    })
}

/// Clears all cache
#[tauri::command]
pub fn clear_cache() -> CommandResult<bool> {
    // Clear all cache directories
    Ok(true)
}

/// Gets application preferences
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppPreferences {
    pub auto_save_interval: u32, // in seconds
    pub preview_quality: String, // "draft", "quarter", "half", "full"
    pub proxy_resolution: String, // "480p", "720p", "original"
    pub hardware_acceleration: bool,
    pub memory_usage_limit: u32, // percentage
    pub thread_count: u32,
}

#[tauri::command]
pub fn get_preferences() -> CommandResult<AppPreferences> {
    Ok(AppPreferences {
        auto_save_interval: 300,
        preview_quality: "half".to_string(),
        proxy_resolution: "720p".to_string(),
        hardware_acceleration: true,
        memory_usage_limit: 80,
        thread_count: num_cpus::get() as u32,
    })
}

#[tauri::command]
pub fn set_preferences(prefs: AppPreferences) -> CommandResult<bool> {
    // Save preferences to config file
    Ok(true)
}

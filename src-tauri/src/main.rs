// PhotoVideo Pro - Main Application Entry Point
// This is the core Tauri application that bridges the Rust backend with the React frontend
// All backend processing (video/image manipulation, file I/O, rendering) happens here

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Module declarations - each module handles a specific domain of functionality
mod commands;           // Tauri command handlers for frontend-backend communication
mod video_engine;       // Video processing: timeline, playback, effects, rendering
mod image_engine;       // Image processing: layers, filters, adjustments, selections
mod audio_engine;       // Audio processing: mixing, effects, VST support
mod effects;            // Video/image effects library
mod color;              // Color grading, LUTs, curves, scopes
mod export;             // Export engine for multiple formats
mod project;            // Project management, serialization, auto-save
mod ai;                 // AI/ML features: auto-editing, smart selection, upscaling
mod utils;              // Utility functions, helpers, common types

use log::{info, error};
use tauri::Manager;

fn main() {
    // Initialize logging for debugging and error tracking
    env_logger::init();
    info!("Starting PhotoVideo Pro application");

    tauri::Builder::default()
        // Register all command handlers - these are callable from the frontend
        .invoke_handler(tauri::generate_handler![
            // Project management commands
            commands::create_new_project,
            commands::open_project,
            commands::save_project,
            commands::export_project,

            // Video editing commands
            commands::video::import_video,
            commands::video::create_timeline,
            commands::video::add_clip_to_timeline,
            commands::video::remove_clip,
            commands::video::split_clip,
            commands::video::trim_clip,
            commands::video::apply_transition,
            commands::video::get_frame,
            commands::video::render_preview,

            // Image editing commands
            commands::image::import_image,
            commands::image::create_layer,
            commands::image::delete_layer,
            commands::image::merge_layers,
            commands::image::apply_filter,
            commands::image::apply_adjustment,
            commands::image::create_selection,
            commands::image::transform_layer,
            commands::image::add_text_layer,
            commands::image::add_vector_layer,

            // Color grading commands
            commands::color::apply_lut,
            commands::color::adjust_curves,
            commands::color::adjust_levels,
            commands::color::color_match,
            commands::color::get_color_scopes,

            // Effects commands
            commands::effects::apply_video_effect,
            commands::effects::apply_image_effect,
            commands::effects::get_available_effects,
            commands::effects::create_custom_effect,

            // Audio commands
            commands::audio::import_audio,
            commands::audio::mix_tracks,
            commands::audio::apply_audio_effect,
            commands::audio::extract_audio_from_video,
            commands::audio::normalize_audio,

            // AI/ML commands
            commands::ai::auto_select_subject,
            commands::ai::remove_background,
            commands::ai::upscale_image,
            commands::ai::auto_color_correct,
            commands::ai::generate_caption,
            commands::ai::detect_scenes,
            commands::ai::auto_reframe,

            // Export commands
            commands::export::export_video,
            commands::export::export_image,
            commands::export::batch_export,
            commands::export::get_export_presets,

            // Utility commands
            commands::utils::get_system_info,
            commands::utils::get_supported_formats,
            commands::utils::optimize_cache,
        ])
        .setup(|app| {
            info!("Application setup started");

            // Initialize application state
            let app_handle = app.handle();

            // Create necessary directories
            if let Err(e) = setup_directories(&app_handle) {
                error!("Failed to setup directories: {}", e);
            }

            // Initialize cache system
            if let Err(e) = initialize_cache() {
                error!("Failed to initialize cache: {}", e);
            }

            info!("Application setup completed");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Creates necessary application directories for cache, temp files, etc.
fn setup_directories(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    use std::fs;

    // Get app data directory
    let app_data_dir = app_handle.path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data directory")?;

    // Create subdirectories
    let dirs = vec!["cache", "proxies", "temp", "exports", "projects"];
    for dir in dirs {
        let path = app_data_dir.join(dir);
        fs::create_dir_all(&path)?;
        info!("Created directory: {:?}", path);
    }

    Ok(())
}

/// Initializes the cache system for faster preview rendering
fn initialize_cache() -> Result<(), Box<dyn std::error::Error>> {
    info!("Initializing cache system");
    // Cache initialization logic would go here
    // - Set up preview cache
    // - Set up proxy media cache
    // - Set up thumbnail cache
    Ok(())
}

// Command Handlers Module
// This module contains all Tauri command handlers that can be invoked from the frontend
// Each submodule handles commands for a specific feature domain

pub mod video;
pub mod image;
pub mod color;
pub mod effects;
pub mod audio;
pub mod ai;
pub mod export;
pub mod utils;
pub mod streaming;  // NEW - OBS integration, YouTube API, playlist automation

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

// ============================================================================
// Common Types and Structures
// ============================================================================

/// Standard result type for commands
pub type CommandResult<T> = Result<T, String>;

/// Project structure - represents an entire editing project
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: PathBuf,
    pub created_at: i64,
    pub modified_at: i64,
    pub timeline: Option<Timeline>,
    pub layers: Vec<Layer>,
    pub settings: ProjectSettings,
}

/// Timeline structure for video editing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Timeline {
    pub id: String,
    pub tracks: Vec<Track>,
    pub duration: f64,
    pub fps: u32,
}

/// Video/audio track on the timeline
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Track {
    pub id: String,
    pub track_type: TrackType,
    pub clips: Vec<Clip>,
    pub locked: bool,
    pub muted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrackType {
    Video,
    Audio,
    Graphics,
    Text,
}

/// Clip on a timeline track
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Clip {
    pub id: String,
    pub source_path: PathBuf,
    pub start_time: f64,
    pub end_time: f64,
    pub duration: f64,
    pub offset: f64,
    pub effects: Vec<String>,
    pub transition_in: Option<String>,
    pub transition_out: Option<String>,
}

/// Image layer structure for photo editing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Layer {
    pub id: String,
    pub name: String,
    pub layer_type: LayerType,
    pub visible: bool,
    pub opacity: f32,
    pub blend_mode: String,
    pub transform: Transform,
    pub mask: Option<Mask>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LayerType {
    Image { path: PathBuf },
    Adjustment { adjustment_type: String, params: serde_json::Value },
    Text { content: String, font: String, size: u32 },
    Vector { shapes: Vec<serde_json::Value> },
    Smart { source: Box<Layer> },
}

/// Transformation properties
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transform {
    pub x: f32,
    pub y: f32,
    pub scale_x: f32,
    pub scale_y: f32,
    pub rotation: f32,
    pub skew_x: f32,
    pub skew_y: f32,
}

impl Default for Transform {
    fn default() -> Self {
        Transform {
            x: 0.0,
            y: 0.0,
            scale_x: 1.0,
            scale_y: 1.0,
            rotation: 0.0,
            skew_x: 0.0,
            skew_y: 0.0,
        }
    }
}

/// Mask for selective editing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Mask {
    pub mask_type: MaskType,
    pub inverted: bool,
    pub feather: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MaskType {
    Rectangle { x: f32, y: f32, width: f32, height: f32 },
    Ellipse { x: f32, y: f32, width: f32, height: f32 },
    Path { points: Vec<(f32, f32)> },
    Bitmap { data: Vec<u8> },
}

/// Project settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectSettings {
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    pub sample_rate: u32,
    pub color_space: String,
}

impl Default for ProjectSettings {
    fn default() -> Self {
        ProjectSettings {
            width: 1920,
            height: 1080,
            fps: 30,
            sample_rate: 48000,
            color_space: "sRGB".to_string(),
        }
    }
}

// ============================================================================
// Project Management Commands
// ============================================================================

/// Creates a new project
#[tauri::command]
pub fn create_new_project(
    name: String,
    settings: Option<ProjectSettings>,
) -> CommandResult<Project> {
    use uuid::Uuid;
    use chrono::Utc;

    let project = Project {
        id: Uuid::new_v4().to_string(),
        name,
        path: PathBuf::new(),
        created_at: Utc::now().timestamp(),
        modified_at: Utc::now().timestamp(),
        timeline: None,
        layers: Vec::new(),
        settings: settings.unwrap_or_default(),
    };

    Ok(project)
}

/// Opens an existing project from file
#[tauri::command]
pub fn open_project(path: String) -> CommandResult<Project> {
    use std::fs;

    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read project file: {}", e))?;

    let project: Project = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse project file: {}", e))?;

    Ok(project)
}

/// Saves the current project
#[tauri::command]
pub fn save_project(project: Project) -> CommandResult<String> {
    use std::fs;
    use chrono::Utc;

    let mut project = project;
    project.modified_at = Utc::now().timestamp();

    let json = serde_json::to_string_pretty(&project)
        .map_err(|e| format!("Failed to serialize project: {}", e))?;

    let path = if project.path.as_os_str().is_empty() {
        PathBuf::from(format!("{}.pvp", project.name))
    } else {
        project.path.clone()
    };

    fs::write(&path, json)
        .map_err(|e| format!("Failed to write project file: {}", e))?;

    Ok(path.to_string_lossy().to_string())
}

/// Exports the project in various formats
#[tauri::command]
pub fn export_project(project_id: String, format: String) -> CommandResult<String> {
    // Export logic would be implemented here
    Ok(format!("Project exported to {}", format))
}

// Project Module
// Project management, serialization, auto-save

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use chrono::{DateTime, Utc};

/// Main project structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: PathBuf,
    pub created_at: DateTime<Utc>,
    pub modified_at: DateTime<Utc>,
    pub version: String,
    pub settings: ProjectSettings,
    pub timeline: Option<Timeline>,
    pub image_composition: Option<ImageComposition>,
    pub assets: Vec<Asset>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectSettings {
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    pub sample_rate: u32,
    pub color_space: String,
    pub working_color_space: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Timeline {
    pub id: String,
    pub duration: f64,
    pub tracks: Vec<Track>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Track {
    pub id: String,
    pub name: String,
    pub track_type: TrackType,
    pub clips: Vec<Clip>,
    pub locked: bool,
    pub visible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrackType {
    Video,
    Audio,
    Graphics,
    Text,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Clip {
    pub id: String,
    pub asset_id: String,
    pub start_time: f64,
    pub end_time: f64,
    pub offset: f64,
    pub effects: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageComposition {
    pub id: String,
    pub layers: Vec<Layer>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Layer {
    pub id: String,
    pub name: String,
    pub layer_type: LayerType,
    pub visible: bool,
    pub opacity: f32,
    pub blend_mode: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LayerType {
    Image { asset_id: String },
    Adjustment { params: serde_json::Value },
    Text { content: String },
    Vector { shapes: Vec<serde_json::Value> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Asset {
    pub id: String,
    pub name: String,
    pub path: PathBuf,
    pub asset_type: AssetType,
    pub duration: Option<f64>,
    pub metadata: AssetMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AssetType {
    Video,
    Audio,
    Image,
    Sequence,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetMetadata {
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub fps: Option<f64>,
    pub codec: Option<String>,
    pub tags: Vec<String>,
}

impl Project {
    /// Creates a new project
    pub fn new(name: String) -> Self {
        use uuid::Uuid;

        Project {
            id: Uuid::new_v4().to_string(),
            name,
            path: PathBuf::new(),
            created_at: Utc::now(),
            modified_at: Utc::now(),
            version: "1.0.0".to_string(),
            settings: ProjectSettings::default(),
            timeline: None,
            image_composition: None,
            assets: Vec::new(),
        }
    }

    /// Saves the project to a file
    pub fn save(&mut self, path: &PathBuf) -> Result<(), String> {
        self.modified_at = Utc::now();
        self.path = path.clone();

        let json = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        std::fs::write(path, json).map_err(|e| e.to_string())?;

        Ok(())
    }

    /// Loads a project from a file
    pub fn load(path: &PathBuf) -> Result<Self, String> {
        let json = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
        let project: Project = serde_json::from_str(&json).map_err(|e| e.to_string())?;

        Ok(project)
    }

    /// Adds an asset to the project
    pub fn add_asset(&mut self, asset: Asset) {
        self.assets.push(asset);
        self.modified_at = Utc::now();
    }

    /// Removes an asset from the project
    pub fn remove_asset(&mut self, asset_id: &str) {
        self.assets.retain(|a| a.id != asset_id);
        self.modified_at = Utc::now();
    }

    /// Gets an asset by ID
    pub fn get_asset(&self, asset_id: &str) -> Option<&Asset> {
        self.assets.iter().find(|a| a.id == asset_id)
    }
}

impl Default for ProjectSettings {
    fn default() -> Self {
        ProjectSettings {
            width: 1920,
            height: 1080,
            fps: 30,
            sample_rate: 48000,
            color_space: "sRGB".to_string(),
            working_color_space: "Linear".to_string(),
        }
    }
}

/// Auto-save manager
pub struct AutoSaveManager {
    interval: std::time::Duration,
    last_save: std::time::Instant,
}

impl AutoSaveManager {
    pub fn new(interval_seconds: u64) -> Self {
        AutoSaveManager {
            interval: std::time::Duration::from_secs(interval_seconds),
            last_save: std::time::Instant::now(),
        }
    }

    /// Checks if it's time to auto-save
    pub fn should_save(&self) -> bool {
        self.last_save.elapsed() >= self.interval
    }

    /// Marks that a save has occurred
    pub fn mark_saved(&mut self) {
        self.last_save = std::time::Instant::now();
    }

    /// Performs auto-save
    pub fn auto_save(&mut self, project: &mut Project) -> Result<(), String> {
        if !self.should_save() {
            return Ok(());
        }

        // Create auto-save path
        let mut auto_save_path = project.path.clone();
        auto_save_path.set_file_name(format!(
            "{}.autosave.pvp",
            project.name
        ));

        project.save(&auto_save_path)?;
        self.mark_saved();

        Ok(())
    }
}

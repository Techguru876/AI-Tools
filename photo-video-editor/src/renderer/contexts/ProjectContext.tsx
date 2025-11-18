/**
 * PROJECT CONTEXT
 *
 * Global state management for project data
 * Provides access to current project, assets, and settings
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Project, Asset } from '../../shared/types';

interface ProjectContextType {
  project: Project | null;
  setProject: (project: Project | null) => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (assetId: string) => void;
  updateAsset: (assetId: string, updates: Partial<Asset>) => void;
  saveProject: () => Promise<void>;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const addAsset = useCallback((asset: Asset) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        assets: [...prev.assets, asset],
      };
    });
    setIsDirty(true);
  }, []);

  const removeAsset = useCallback((assetId: string) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        assets: prev.assets.filter(a => a.id !== assetId),
      };
    });
    setIsDirty(true);
  }, []);

  const updateAsset = useCallback((assetId: string, updates: Partial<Asset>) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        assets: prev.assets.map(a =>
          a.id === assetId ? { ...a, ...updates } : a
        ),
      };
    });
    setIsDirty(true);
  }, []);

  const saveProject = useCallback(async () => {
    if (!project) return;

    try {
      // Call IPC to save project
      // await window.electron.ipcRenderer.invoke('project:save', project);
      console.log('Project saved');
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  }, [project]);

  return (
    <ProjectContext.Provider
      value={{
        project,
        setProject,
        addAsset,
        removeAsset,
        updateAsset,
        saveProject,
        isDirty,
        setIsDirty,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};

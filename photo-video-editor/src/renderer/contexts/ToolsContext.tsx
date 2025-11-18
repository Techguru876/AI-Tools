/**
 * TOOLS CONTEXT
 *
 * State management for tools and selections
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Tool, Selection, Layer } from '../../shared/types';

interface ToolsContextType {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  selection: Selection | null;
  setSelection: (selection: Selection | null) => void;
  activeLayer: string | null;
  setActiveLayer: (layerId: string | null) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  foregroundColor: string;
  setForegroundColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
}

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export const ToolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');

  return (
    <ToolsContext.Provider
      value={{
        activeTool,
        setActiveTool,
        selection,
        setSelection,
        activeLayer,
        setActiveLayer,
        brushSize,
        setBrushSize,
        foregroundColor,
        setForegroundColor,
        backgroundColor,
        setBackgroundColor,
      }}
    >
      {children}
    </ToolsContext.Provider>
  );
};

export const useTools = (): ToolsContextType => {
  const context = useContext(ToolsContext);
  if (!context) {
    throw new Error('useTools must be used within ToolsProvider');
  }
  return context;
};

/**
 * Template Layer Types
 */
export interface TemplateLayer {
  id: string;
  type: 'video' | 'image' | 'audio' | 'text' | 'shape' | 'effect';
  name: string;
  start_time: number;
  duration: number;
  properties: Record<string, any>;
  z_index: number;
}

/**
 * Template Variable Definition
 */
export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'image' | 'video' | 'audio' | 'color';
  required: boolean;
  default?: any;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

/**
 * Template Definition
 */
export interface Template {
  id: string;
  name: string;
  niche: 'lofi' | 'horror' | 'explainer' | 'motivational' | 'news' | 'facts' | 'custom';
  description: string;
  duration: number;
  resolution: [number, number];
  framerate: number;
  layers: TemplateLayer[];
  variables: Record<string, TemplateVariable>;
  metadata: {
    created_at: number;
    modified_at: number;
    author?: string;
    tags?: string[];
    preview_url?: string;
  };
}

/**
 * Resolved Template (variables replaced)
 */
export interface ResolvedTemplate extends Omit<Template, 'variables'> {
  resolved_variables: Record<string, any>;
}

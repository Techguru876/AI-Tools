import React, { useEffect, useState } from 'react';
import { Template } from '../types/template';
import '../styles/template-debug.css';

/**
 * Template Debug Test Component
 * Use this to verify templates are loading correctly
 */
export const TemplateDebugTest: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiCheck, setApiCheck] = useState<string>('Checking...');

  useEffect(() => {
    console.log('\n=== TEMPLATE DEBUG TEST STARTED ===');
    checkAPI();
    loadTemplates();
  }, []);

  const checkAPI = () => {
    console.log('🔍 Checking if window.electronAPI exists...');
    if (window.electronAPI) {
      console.log('✓ window.electronAPI is available');
      setApiCheck('✓ Available');

      if (window.electronAPI.listTemplates) {
        console.log('✓ window.electronAPI.listTemplates exists');
      } else {
        console.error('✗ window.electronAPI.listTemplates is undefined!');
        setApiCheck('✗ listTemplates missing');
      }
    } else {
      console.error('✗ window.electronAPI is not defined!');
      setApiCheck('✗ Not Available');
      setError('electronAPI is not defined. Check preload script.');
    }
  };

  const loadTemplates = async () => {
    console.log('\n=== LOADING TEMPLATES ===');

    try {
      setLoading(true);

      // Check if API exists
      if (!window.electronAPI) {
        throw new Error('window.electronAPI is not defined');
      }

      if (!window.electronAPI.listTemplates) {
        throw new Error('window.electronAPI.listTemplates is not defined');
      }

      console.log('📞 Calling window.electronAPI.listTemplates()...');
      const templates = await window.electronAPI.listTemplates();

      console.log('📦 Received response from backend');
      console.log('📊 Template count:', templates.length);

      if (templates.length > 0) {
        console.log('📄 First template structure:');
        console.log(JSON.stringify(templates[0], null, 2));

        console.log('\n📋 All templates:');
        templates.forEach((t, i) => {
          console.log(`   ${i + 1}. ${t.name} (${t.niche})`);
          console.log(`      ID: ${t.id}`);
          console.log(`      Duration: ${t.duration}s`);
          console.log(`      Layers: ${t.layers.length}`);
          console.log(`      Variables: ${Object.keys(t.variables).length}`);
        });
      } else {
        console.warn('⚠️ No templates found!');
      }

      setTemplates(templates);
      setError(null);

    } catch (err: any) {
      console.error('❌ ERROR loading templates:', err);
      console.error('Error stack:', err.stack);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('=== LOADING COMPLETE ===\n');
    }
  };

  const testGetTemplate = async (templateId: string) => {
    console.log('\n=== TESTING GET TEMPLATE ===');
    console.log('Template ID:', templateId);
    try {
      const template = await window.electronAPI.getTemplate(templateId);
      console.log('✓ Got template:', template);
      alert(`Template loaded:\n${template?.name}\nLayers: ${template?.layers.length}`);
    } catch (err: any) {
      console.error('✗ Error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="template-debug">
        <h1>🔍 Template Debug Test</h1>
        <div className="loading">Loading templates...</div>
        <pre className="api-check">electronAPI: {apiCheck}</pre>
      </div>
    );
  }

  if (error) {
    return (
      <div className="template-debug">
        <h1>🔍 Template Debug Test</h1>
        <div className="error">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={loadTemplates}>🔄 Retry</button>
        </div>
        <div className="debug-info">
          <h3>Debug Info:</h3>
          <pre>electronAPI: {apiCheck}</pre>
          <pre>Check browser console for detailed logs</pre>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="template-debug">
        <h1>🔍 Template Debug Test</h1>
        <div className="no-templates">
          <h2>⚠️ No Templates Found</h2>
          <p>The database appears to be empty.</p>
          <button onClick={loadTemplates}>🔄 Reload</button>
          <div className="debug-steps">
            <h3>Check These:</h3>
            <ol>
              <li>Look at Electron main process console</li>
              <li>Verify "✓ Templates initialized successfully!" message</li>
              <li>Check database path in console</li>
              <li>Verify IPC handlers are registered</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="template-debug">
      <h1>🔍 Template Debug Test</h1>

      <div className="summary">
        <h2>✓ Templates Loaded Successfully!</h2>
        <p className="count">Found {templates.length} templates</p>
        <button onClick={loadTemplates}>🔄 Reload</button>
      </div>

      <div className="templates-grid">
        {templates.map((template, index) => (
          <div key={template.id} className="template-card">
            <div className="template-preview" style={getNicheGradient(template.niche)}>
              <div className="template-badge">{template.niche}</div>
              <div className="template-index">#{index + 1}</div>
            </div>

            <div className="template-info">
              <h3>{template.name}</h3>
              <p className="description">{template.description}</p>

              <div className="template-stats">
                <div className="stat">
                  <span className="label">ID:</span>
                  <span className="value">{template.id}</span>
                </div>
                <div className="stat">
                  <span className="label">Duration:</span>
                  <span className="value">{template.duration}s ({Math.floor(template.duration / 60)}min)</span>
                </div>
                <div className="stat">
                  <span className="label">Resolution:</span>
                  <span className="value">{template.resolution[0]}x{template.resolution[1]}</span>
                </div>
                <div className="stat">
                  <span className="label">FPS:</span>
                  <span className="value">{template.framerate}</span>
                </div>
                <div className="stat">
                  <span className="label">Layers:</span>
                  <span className="value">{template.layers.length}</span>
                </div>
                <div className="stat">
                  <span className="label">Variables:</span>
                  <span className="value">{Object.keys(template.variables).length}</span>
                </div>
              </div>

              <div className="template-variables">
                <h4>Variables:</h4>
                <ul>
                  {Object.entries(template.variables).map(([name, varDef]) => (
                    <li key={name}>
                      <strong>{name}</strong> ({varDef.type})
                      {varDef.required && <span className="required">*</span>}
                      {varDef.description && <span className="var-desc"> - {varDef.description}</span>}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="template-actions">
                <button onClick={() => testGetTemplate(template.id)}>
                  📄 Test Get Template
                </button>
                <button onClick={() => console.log('Template data:', template)}>
                  📋 Log to Console
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="debug-console">
        <h3>📊 Debug Console Output</h3>
        <p>Check your browser DevTools console for detailed logs</p>
        <pre>{JSON.stringify({ totalTemplates: templates.length, niches: templates.map(t => t.niche) }, null, 2)}</pre>
      </div>
    </div>
  );
};

// Niche-specific gradient backgrounds
function getNicheGradient(niche: string): React.CSSProperties {
  const gradients: Record<string, string> = {
    lofi: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    horror: 'linear-gradient(135deg, #2d0a0a 0%, #000000 100%)',
    explainer: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    motivational: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    news: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    facts: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    custom: 'linear-gradient(135deg, #999 0%, #666 100%)',
  };

  return {
    background: gradients[niche] || gradients.custom,
  };
}

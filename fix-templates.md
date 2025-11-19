# Template Data Structure Conversion Guide

## Old Structure (BROKEN):
```typescript
background: {
  type: 'image',
  url: 'https://...',
  color: '#...',
  blur: 0,
  brightness: 0.8
}
characters: [{
  position: { x: 400, y: 300 },
  image_url: 'https://...',
  animation: 'subtle-sway'  // STRING
}]
```

## New Structure (WORKS):
```typescript
background: {
  element_type: 'Background',
  x: 960,
  y: 540,
  scale: 1.0,
  rotation: 0,
  opacity: 1,
  z_index: 0,
  source: { type: 'Image', path: 'https://...' },
  animations: []  // ARRAY
}
characters: [{
  element_type: 'Character',
  x: 400,
  y: 300,
  scale: 1.2,
  rotation: 0,
  opacity: 1,
  z_index: 10,
  source: { type: 'Image', path: 'https://...' },
  animations: ['subtle-sway']  // ARRAY
}]
```

## Conversion Rules:
1. Remove position object → use direct x, y
2. Remove type field → add element_type
3. Remove url/image_url → add source: {type, path}
4. Change animation (string) → animations (array)
5. Add z_index (0-100)
6. Overlays stay as-is (they're not SceneElements)

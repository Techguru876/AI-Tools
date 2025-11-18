# InfinityStudio - Brand Guidelines

## Logo Concept

```
┌─────────────────────────────────────┐
│                                     │
│         ∞                          │
│       ╱   ╲                        │
│      │  •  │  INFINITY             │
│       ╲   ╱      STUDIO            │
│         ∞                          │
│                                     │
│   "Create Without Limits"          │
│                                     │
└─────────────────────────────────────┘
```

### Logo Description
- **Symbol**: Infinity symbol (∞) with a circular dot in the center representing endless creativity
- **Primary Version**: Cyan gradient (#00d9ff → #00b8d4)
- **Secondary Version**: Purple gradient (#a855f7 → #8b5cf6)
- **Monochrome**: White on dark backgrounds
- **Icon Only**: Just the infinity symbol for app icons and favicons

### Logo Variations
1. **Full Logo**: Symbol + "INFINITY STUDIO" wordmark
2. **Horizontal**: Symbol left, text right
3. **Vertical**: Symbol top, text below
4. **Icon**: Just the infinity symbol
5. **Minimal**: "∞ STUDIO"

## Color Palette

### Primary Brand Colors
```css
--brand-cyan: #00d9ff       /* Primary brand color - energy, creativity */
--brand-purple: #a855f7     /* Secondary brand - magic, AI features */
--brand-amber: #f59e0b      /* Accent - highlights, warnings */
```

### Background Colors (Professional Dark Theme)
```css
--bg-darkest: #0a0a0f      /* Deep charcoal - main background */
--bg-darker: #13131a        /* Panel backgrounds */
--bg-dark: #1a1a24          /* Cards, elevated elements */
--bg-medium: #21212e        /* Hover states */
--bg-light: #2a2a3a         /* Active states */
```

### Text Colors
```css
--text-primary: #e8e8f0     /* High contrast white */
--text-secondary: #b0b0c8   /* Muted text */
--text-tertiary: #7a7a90    /* Disabled text */
--text-accent: #00d9ff      /* Links, highlights */
```

### Vibe Colors (Lofi Studio)
```css
--vibe-lofi: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--vibe-chill: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)
--vibe-warm: linear-gradient(135deg, #fa709a 0%, #fee140 100%)
--vibe-rain: linear-gradient(135deg, #30cfd0 0%, #330867 100%)
--vibe-sunset: linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)
--vibe-midnight: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)
```

### Semantic Colors
```css
--success: #10b981          /* Green - success states */
--error: #ef4444            /* Red - errors, destructive actions */
--warning: #f59e0b          /* Amber - warnings */
--info: #3b82f6             /* Blue - informational */
```

## Typography

### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-heading: 'Montserrat', 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Sizes
```css
--text-xs: 11px      /* Small labels */
--text-sm: 12px      /* UI text */
--text-md: 14px      /* Body text */
--text-lg: 16px      /* Emphasized text */
--text-xl: 18px      /* Subheadings */
--text-2xl: 24px     /* Headings */
--text-3xl: 32px     /* Large headings */
--text-4xl: 48px     /* Hero text */
```

### Font Weights
```css
--weight-normal: 400
--weight-medium: 500
--weight-semibold: 600
--weight-bold: 700
```

## Spacing System (8px base)
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px
--spacing-xl: 24px
--spacing-2xl: 32px
--spacing-3xl: 48px
```

## Border Radius
```css
--radius-sm: 4px       /* Buttons, small elements */
--radius-md: 6px       /* Cards, inputs */
--radius-lg: 8px       /* Panels */
--radius-xl: 12px      /* Modals */
--radius-full: 9999px  /* Pills, circular elements */
```

## Shadows
```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.4)
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.5)
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.6)
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.7)
--shadow-glow: 0 0 20px rgba(0, 217, 255, 0.3)      /* Cyan glow */
--shadow-glow-purple: 0 0 20px rgba(168, 85, 247, 0.3) /* Purple glow */
```

## Iconography

### Icon Set
- **Primary**: Lucide Icons (https://lucide.dev)
- **Alternative**: Remix Icon (https://remixicon.com)
- **Style**: Outlined, 20px default size
- **Stroke Width**: 1.5px for main UI, 2px for emphasis

### Icon Colors
- Default: `var(--text-secondary)`
- Active: `var(--brand-cyan)`
- Hover: `var(--text-primary)`
- Disabled: `var(--text-tertiary)`

## UI Components Style

### Buttons
```css
/* Primary Button */
background: linear-gradient(135deg, #00d9ff, #00b8d4);
color: #ffffff;
padding: 8px 16px;
border-radius: 6px;
font-weight: 500;
box-shadow: 0 2px 8px rgba(0, 217, 255, 0.3);

/* Secondary Button */
background: var(--bg-elevated);
color: var(--text-primary);
border: 1px solid var(--border-default);

/* Danger Button */
background: var(--error);
color: #ffffff;
```

### Input Fields
```css
background: var(--bg-tertiary);
border: 1px solid var(--border-default);
border-radius: 6px;
padding: 8px 12px;
color: var(--text-primary);

/* Focus State */
border-color: var(--brand-cyan);
box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1);
```

### Panels/Cards
```css
background: var(--bg-tertiary);
border: 1px solid var(--border-default);
border-radius: 8px;
padding: 16px;
box-shadow: var(--shadow-md);
```

## Animation & Motion

### Transitions
```css
--transition-fast: 0.1s ease
--transition-normal: 0.2s ease
--transition-slow: 0.3s ease
```

### Micro-interactions
- Button hover: Scale 1.02, brightness +10%
- Panel focus: Subtle glow effect
- Drag & drop: Opacity 0.8, slight scale
- Loading: Smooth spinner with brand colors

### Easing Functions
```css
ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1)
ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1)
bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

## Design Principles

### 1. Professional Yet Approachable
- Clean, minimal interface
- Generous whitespace
- Clear information hierarchy
- Friendly micro-interactions

### 2. Power User Focused
- Keyboard shortcuts for everything
- Customizable workspace layouts
- Non-destructive editing
- Fast preview rendering

### 3. Creative Freedom
- Vibe modes for different moods
- Lofi Studio for relaxed creation
- Template library for quick starts
- Export presets for all platforms

### 4. Consistent Experience
- Same design language across all modes
- Predictable behavior
- Context-aware help
- Smooth transitions between workspaces

## Workspace Modes

### Video Editing Mode
- Color: Cyan accent
- Icon: 🎬
- Focus: Timeline, effects, color grading
- Vibe: Professional, powerful

### Photo Editing Mode
- Color: Purple accent
- Icon: 🖼
- Focus: Layers, retouching, adjustments
- Vibe: Precise, artistic

### Animation Mode
- Color: Amber accent
- Icon: ✨
- Focus: Keyframes, compositions, motion
- Vibe: Dynamic, creative

### Lofi Studio Mode
- Color: Gradient (lofi vibe)
- Icon: 🎵
- Focus: Loops, playlists, streaming
- Vibe: Chill, relaxed, ambient

## Marketing Taglines

**Primary**: "Create Without Limits"
**Secondary**: "Professional Creative Suite for Everyone"
**Lofi Studio**: "Infinite Vibes, Endless Creativity"

## Voice & Tone

- **Professional**: Clear, concise, knowledgeable
- **Helpful**: Supportive, encouraging, never condescending
- **Creative**: Inspiring, possibility-focused
- **Modern**: Contemporary language, avoid jargon

## Accessibility

### Color Contrast
- All text meets WCAG AAA standards
- Minimum contrast ratio 7:1 for body text
- Minimum contrast ratio 4.5:1 for UI elements

### Focus Indicators
- Visible focus rings on all interactive elements
- 3px outline with brand cyan color
- Never remove focus styles

### Keyboard Navigation
- Full keyboard support for all features
- Logical tab order
- Escape key closes modals
- Arrow keys for navigation

### Screen Reader Support
- Proper ARIA labels
- Semantic HTML
- Descriptive alt text
- Status announcements for important changes

## File Formats

### Logo Files
```
/assets/branding/
  logo-full.svg           # Full logo with text
  logo-icon.svg           # Icon only
  logo-horizontal.svg     # Horizontal layout
  logo-vertical.svg       # Vertical layout
  logo-white.svg          # White version
  logo-black.svg          # Black version
```

### Export Sizes
- **App Icon**: 1024x1024px (macOS), 256x256px (Windows)
- **Favicon**: 32x32px, 16x16px
- **Social Media**: 1200x630px (OG image)
- **Marketing**: Various sizes for web and print

## Usage Guidelines

### Do's
✅ Use official brand colors
✅ Maintain clear space around logo
✅ Use approved font families
✅ Follow spacing system
✅ Use shadows consistently

### Don'ts
❌ Don't distort or skew the logo
❌ Don't use unauthorized colors
❌ Don't use drop shadows on logo
❌ Don't recreate the logo
❌ Don't use gradients on text (except buttons)

## Support & Resources

- Design System: Figma file (link to be created)
- Icon Library: Lucide Icons
- Fonts: Google Fonts (Inter, Montserrat)
- Inspiration: Notion, Figma, Linear, Premiere Pro

---

**InfinityStudio** - Where creativity meets infinity ∞

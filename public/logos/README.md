# TechFrontier Logo Assets

This directory contains the TechFrontier brand logo assets organized by use case.

## Directory Structure

```
/public/logos/
├── header/          # Logos for website header/footer (SVG preferred)
├── social/          # Social media preview images (PNG/JPG)
├── favicon/         # Browser favicon files (PNG/ICO)
└── brand/           # Full brand assets and variants
```

## Recommended File Organization

### `/public/logos/header/` - Website Header & Navigation
Place your scalable logos here (SVG preferred):
- `tf-logo-gradient.svg` - Primary gradient logo (blue-to-teal)
- `tf-logo-light.svg` - Dark logo for light mode backgrounds
- `tf-logo-dark.svg` - Light/gradient logo for dark mode backgrounds

**Size**: 40x40px base size minimum (SVG scales perfectly)

### `/public/logos/social/` - Social Media Previews
Place social sharing images here:
- `og-image.png` - **1200x630px** - OpenGraph/Twitter card (CRITICAL)
  - Should include TechFrontier logo + slogan
  - Gradient background with good contrast
- `og-image.jpg` - Alternative format if needed
- `tf-social-square.png` - 512x512px - Square profile image

**Important**: Copy `og-image.png` to `/public/og-image.png` (root level)

### `/public/logos/favicon/` - Browser Icons
Place all favicon sizes here:
- `favicon.ico` - 32x32px ICO format
- `favicon-16x16.png` - 16x16px PNG
- `favicon-32x32.png` - 32x32px PNG
- `apple-touch-icon.png` - 180x180px for iOS home screen
- `android-chrome-192x192.png` - 192x192px for Android
- `android-chrome-512x512.png` - 512x512px for Android splash

**Important**: Copy these files to `/public/` root:
- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png`

### `/public/logos/brand/` - Full Brand Assets
Place comprehensive brand assets here:
- `tf-full-logo-light.svg` - Full logo with text for light backgrounds
- `tf-full-logo-dark.svg` - Full logo with text for dark backgrounds
- `tf-monogram.svg` - Just "TF" circular logo
- `tf-monogram-light.png` - 512x512px PNG version
- `tf-monogram-dark.png` - 512x512px PNG version
- Any additional variants (JPG for print/email, etc.)

## Logo Usage Guidelines

### 1. Header/Navigation
- Use the colored gradient version on dark backgrounds
- Use the blue-green version on light backgrounds
- Recommended size: 32-48px height for mobile/desktop

### 2. Footer
- Display "TechFrontier" with logo in the new typeface
- Use consistent color scheme with gradient accent

### 3. Favicon
- Use the "TF" circular monogram
- Sizes needed: 16x16, 32x32, 192x192, 512x512

### 4. Social Preview Images
- Create og-image.png (1200x630px) with TechFrontier branding
- Include logo and slogan: "Exploring Tomorrow's Tech, Today"

## Implementation

Once you've placed the logo files in this directory, update the following components:

### Header Component (`src/components/layout/header.tsx`)
Replace the placeholder TF circle with:
```tsx
<Image
  src="/logos/tf-logo-colored.svg"
  alt="TechFrontier"
  width={40}
  height={40}
  className="h-10 w-10"
/>
```

### Footer Component (`src/components/layout/footer.tsx`)
Update the logo placeholder similarly.

### Favicon
Update `public/favicon.ico` with the TF monogram.

### Social Preview
Create and place `public/og-image.png` with TechFrontier branding.

## Color Palette

Ensure logos use the TechFrontier color scheme:
- Primary Gradient: Blue (#3B82F6) to Teal (#14B8A6)
- Blue-Green: #2563EB to #0D9488
- Monochrome: #1F2937 (or white for dark backgrounds)

---

**Note**: Currently using CSS-generated placeholders. Replace with actual logo images once available.

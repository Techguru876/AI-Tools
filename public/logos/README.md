# TechFrontier Logo Assets

This directory contains the TechFrontier brand logo assets.

## Logo Files Structure

Place your TechFrontier logo files in this directory with the following naming convention:

```
/public/logos/
├── tf-logo-colored.svg         # Colored gradient version (for dark backgrounds)
├── tf-logo-colored.png         # PNG version (multiple sizes if needed)
├── tf-logo-blue-green.svg      # Blue-green version (for light backgrounds)
├── tf-logo-blue-green.png      # PNG version
├── tf-logo-monochrome.svg      # Monochrome version (for print)
├── tf-logo-monochrome.png      # PNG version
├── tf-monogram.svg             # "TF" circular monogram for favicon
└── tf-monogram.png             # PNG version
```

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

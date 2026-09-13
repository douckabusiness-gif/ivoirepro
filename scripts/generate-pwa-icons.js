const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Generate crisp SVG icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="bagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f1f5f9" />
    </linearGradient>
    <linearGradient id="zapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#ef4444" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.35"/>
    </filter>
  </defs>
  
  <!-- Background Rounded App Tile -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  
  <!-- Subtle Grid Accent Overlay -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="8" />
  <circle cx="256" cy="256" r="160" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="4" stroke-dasharray="12 12" />
  
  <!-- Shopping Bag Shape -->
  <g filter="url(#shadow)">
    <!-- Bag Handle -->
    <path d="M 196 170 C 196 120, 316 120, 316 170" fill="none" stroke="#ffffff" stroke-width="26" stroke-linecap="round" />
    
    <!-- Bag Body -->
    <path d="M 140 170 L 372 170 L 396 380 C 398 396, 386 410, 370 410 L 142 410 C 126 410, 114 396, 116 380 Z" fill="url(#bagGrad)" />
  </g>
  
  <!-- Lightning / Flash Sale Energy Icon on Front -->
  <path d="M 270 200 L 205 300 L 255 300 L 240 380 L 315 275 L 265 275 Z" fill="url(#zapGrad)" filter="url(#shadow)" />
  
  <!-- Sparkles on Top Right -->
  <path d="M 380 90 L 390 115 L 415 125 L 390 135 L 380 160 L 370 135 L 345 125 L 370 115 Z" fill="#fbbf24" />
</svg>`;

// Save base SVGs
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgIcon);
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), svgIcon);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), svgIcon);

// Create SVG-based standalone icons with viewBox for all required dimensions
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// We can create SVG files for each dimension and data URI fallbacks
sizes.forEach(size => {
  const scaledSvg = svgIcon.replace('width="512" height="512"', `width="${size}" height="${size}"`);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), scaledSvg);
});

// Also create maskable SVG (with extra safe padding)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="bagGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f1f5f9" />
    </linearGradient>
    <linearGradient id="zapGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#ef4444" />
    </linearGradient>
  </defs>
  
  <!-- Full bleed background for maskable icon -->
  <rect width="512" height="512" fill="url(#bgGradM)" />
  
  <!-- Scaled content inside safe zone (approx 80%) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <path d="M 196 170 C 196 120, 316 120, 316 170" fill="none" stroke="#ffffff" stroke-width="26" stroke-linecap="round" />
    <path d="M 140 170 L 372 170 L 396 380 C 398 396, 386 410, 370 410 L 142 410 C 126 410, 114 396, 116 380 Z" fill="url(#bagGradM)" />
    <path d="M 270 200 L 205 300 L 255 300 L 240 380 L 315 275 L 265 275 Z" fill="url(#zapGradM)" />
  </g>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.svg'), maskableSvg);

console.log('✅ PWA SVG icons generated successfully!');

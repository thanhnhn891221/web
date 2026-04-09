/**
 * AIO.MS — Global Theming Engine
 * 
 * Generates a full set of CSS custom properties (HSL shades)
 * from a single base hex color. Supports Primary, Accent, and Background colors
 * with both Light and Dark mode variants.
 */

// ─── Types ───────────────────────────────────────────────

export interface ThemeConfig {
  primaryColor: string;    // hex  e.g. "#C8283C"
  accentColor: string;     // hex  e.g. "#EAB308"
  bgLightColor: string;    // hex  e.g. "#F8F8F8"
  bgDarkColor: string;     // hex  e.g. "#0A0A0F"
}

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#C8283C',  // AIO Red
  accentColor: '#EAB308',   // AIO Gold
  bgLightColor: '#F8F8F8',  // Light mode bg
  bgDarkColor: '#0A0A0F',   // Dark mode bg
};

const STORAGE_KEY = 'aio-theme-config';

// ─── Color Utilities ─────────────────────────────────────

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Generate shade variants (50-950) from a base HSL
function generateShades(h: number, s: number): Record<string, string> {
  return {
    '50':  hsl(h, Math.min(s + 10, 95), 97),
    '100': hsl(h, Math.min(s + 5, 92), 92),
    '200': hsl(h, s, 82),
    '300': hsl(h, Math.max(s - 2, 60), 70),
    '400': hsl(h, Math.max(s - 5, 55), 60),
    '500': hsl(h, s, 50),         // Base
    '600': hsl(h, Math.min(s + 5, 95), 42),
    '700': hsl(h, Math.min(s + 10, 95), 34),
    '800': hsl(h, Math.max(s - 5, 70), 28),
    '900': hsl(h, Math.max(s - 10, 60), 22),
    '950': hsl(h, Math.max(s - 5, 70), 12),
  };
}

function generateAccentShades(h: number, s: number): Record<string, string> {
  return {
    '50':  hsl(h, Math.min(s + 5, 98), 96),
    '100': hsl(h, s, 88),
    '200': hsl(h, Math.min(s + 5, 98), 75),
    '300': hsl(h, Math.min(s + 5, 98), 60),
    '400': hsl(h, Math.min(s + 5, 98), 52),
    '500': hsl(h, s, 48),
    '600': hsl(h, s + 2, 40),
    '700': hsl(h, s + 2, 32),
  };
}

// ─── Theme Application ──────────────────────────────────

export function generateThemeCSS(config: ThemeConfig): string {
  const primary = hexToHSL(config.primaryColor);
  const accent = hexToHSL(config.accentColor);
  const pShades = generateShades(primary.h, primary.s);
  const aShades = generateAccentShades(accent.h, accent.s);

  let css = ':root {\n';
  
  // Primary shades
  for (const [shade, value] of Object.entries(pShades)) {
    css += `  --primary-${shade}: ${value};\n`;
  }
  
  // Accent shades
  for (const [shade, value] of Object.entries(aShades)) {
    css += `  --accent-${shade}: ${value};\n`;
  }

  // Background overrides for light mode
  css += `  --bg-body: ${config.bgLightColor};\n`;
  css += `  --bg-sidebar: ${pShades['950']};\n`;
  css += `  --shadow-glow: 0 0 20px ${pShades['500']}26;\n`;
  css += '}\n\n';

  // Dark mode overrides
  css += '.dark {\n';
  css += `  --bg-body: ${config.bgDarkColor};\n`;
  css += `  --bg-sidebar: ${hsl(primary.h, Math.max(primary.s - 40, 20), 6)};\n`;
  css += `  --shadow-glow: 0 0 20px ${pShades['500']}33;\n`;
  css += '}\n';

  return css;
}

// ─── Persistence ─────────────────────────────────────────

export function saveThemeConfig(config: ThemeConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function loadThemeConfig(): ThemeConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_THEME, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_THEME;
}

export function applyTheme(config: ThemeConfig): void {
  const css = generateThemeCSS(config);
  
  // Remove existing dynamic theme
  let styleEl = document.getElementById('aio-dynamic-theme');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'aio-dynamic-theme';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
}

export function initTheme(): void {
  const config = loadThemeConfig();
  // Only apply if not default (to avoid double-writing CSS on first load)
  const isDefault = config.primaryColor === DEFAULT_THEME.primaryColor 
    && config.accentColor === DEFAULT_THEME.accentColor 
    && config.bgLightColor === DEFAULT_THEME.bgLightColor
    && config.bgDarkColor === DEFAULT_THEME.bgDarkColor;
  
  if (!isDefault) {
    applyTheme(config);
  }
}

import {
  parse,
  converter,
  formatHex,
  formatHex8,
  formatRgb,
  formatHsl,
  formatCss
} from 'culori';

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function parsePercentOr255(val: string): number {
  if (val.endsWith('%')) {
    return clamp(parseFloat(val) * 2.55, 0, 255);
  }
  return clamp(parseFloat(val), 0, 255);
}

function parseAlpha(val: string): number {
  if (val.endsWith('%')) {
    return clamp(parseFloat(val) * 2.55, 0, 255);
  }
  return clamp(parseFloat(val), 0, 255);
}

function parseCmykComponent(val: string): number {
  if (val.endsWith('%')) {
    return clamp(parseFloat(val), 0, 100);
  }
  return clamp(parseFloat(val), 0, 100);
}

function cmykToRgbPercent(c: number, m: number, y: number, k: number) {
  // c, m, y, k: 0-100
  c /= 100; m /= 100; y /= 100; k /= 100;
  const r = Math.round(255 * (1 - c) * (1 - k));
  const g = Math.round(255 * (1 - m) * (1 - k));
  const b = Math.round(255 * (1 - y) * (1 - k));
  return { r, g, b };
}
function rgbToCmykPercent(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  const c = (1 - r - k) / (1 - k) || 0;
  const m = (1 - g - k) / (1 - k) || 0;
  const y = (1 - b - k) / (1 - k) || 0;
  return {
    c: +(c * 100).toFixed(2),
    m: +(m * 100).toFixed(2),
    y: +(y * 100).toFixed(2),
    k: +(k * 100).toFixed(2)
  };
}

export class ColorConvertService {
  /**
   * Convert a color from one format to another using Culori
   * @param fromFormat The source color format
   * @param toFormat The target color format
   * @param color The color to convert
   * @returns The converted color
   */
  public static convertColor(fromFormat: string, toFormat: string, color: string) {
    const from = fromFormat.toLowerCase();
    const to = toFormat.toLowerCase();
    let parsed: any;
    // Special parse for CMYK
    if (from === 'cmyk') {
      // Support percent and float: cmyk(0%, 0%, 90%, 21.57%) or cmyk(0,0,90,21.57)
      const match = color.match(/cmyk\(([-\d.]+%?),\s*([\-\d.]+%?),\s*([\-\d.]+%?),\s*([\-\d.]+%?)\)/);
      if (!match) throw new Error(`Unable to parse color: ${color}`);
      const c = parseCmykComponent(match[1]);
      const m = parseCmykComponent(match[2]);
      const y = parseCmykComponent(match[3]);
      const k = parseCmykComponent(match[4]);
      const rgb = cmykToRgbPercent(c, m, y, k);
      parsed = { mode: 'rgb', r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 };
    } else if (from === 'rgba') {
      // rgba(255, 128, 0, 64) or rgba(255,128,0,25%)
      const match = color.match(/rgba\(([-\d.]+%?),\s*([\-\d.]+%?),\s*([\-\d.]+%?),\s*([\-\d.]+%?)\)/);
      if (!match) throw new Error(`Unable to parse color: ${color}`);
      const r = parsePercentOr255(match[1]);
      const g = parsePercentOr255(match[2]);
      const b = parsePercentOr255(match[3]);
      const a = parseAlpha(match[4]);
      parsed = { mode: 'rgb', r: r / 255, g: g / 255, b: b / 255, alpha: a / 255 };
    } else if (from === 'rgb') {
      // rgb(255, 0, 128) or rgb(100%,0%,50%)
      const match = color.match(/rgb\(([-\d.]+%?),\s*([\-\d.]+%?),\s*([\-\d.]+%?)\)/);
      if (!match) throw new Error(`Unable to parse color: ${color}`);
      const r = parsePercentOr255(match[1]);
      const g = parsePercentOr255(match[2]);
      const b = parsePercentOr255(match[3]);
      parsed = { mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 };
    } else if (from === 'hex') {
      let hex = color.replace('#', '');
      if (!(hex.length === 6 || hex.length === 8)) throw new Error('Invalid hex string');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      let a = 255;
      if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16);
      if ([r, g, b, a].some((v) => isNaN(v))) throw new Error('Invalid hex string');
      parsed = { mode: 'rgb', r: r / 255, g: g / 255, b: b / 255, alpha: a / 255 };
    } else if (from === 'hsl') {
      // hsl(0, 100%, 50%) or hsl(0,100,50)
      const match = color.match(/hsl\(([-\d.]+)[, ]+([\-\d.]+)%?,?[, ]+([\-\d.]+)%?\)/);
      if (!match) throw new Error(`Unable to parse color: ${color}`);
      const h = parseFloat(match[1]);
      const s = parseFloat(match[2]) / 100;
      const l = parseFloat(match[3]) / 100;
      parsed = { mode: 'hsl', h, s, l };
    } else if (from === 'lab') {
      // lab(78.25, -17.71, 76.47) or lab(78.25 -17.71 76.47)
      const match = color.match(/lab\(([-\d.]+)[, ]+([\-\d.]+)[, ]+([\-\d.]+)\)/);
      if (!match) throw new Error(`Unable to parse color: ${color}`);
      const l = parseFloat(match[1]);
      const a = parseFloat(match[2]);
      const b = parseFloat(match[3]);
      parsed = { mode: 'lab', l, a, b };
    } else if (from === 'oklch') {
      // oklch(0.7 0.1 208)
      const match = color.match(/oklch\(([-\d.]+)[, ]+([\-\d.]+)[, ]+([\-\d.]+)\)/);
      if (!match) throw new Error(`Unable to parse color: ${color}`);
      const l = parseFloat(match[1]);
      const c = parseFloat(match[2]);
      const h = parseFloat(match[3]);
      parsed = { mode: 'oklch', l, c, h };
    } else {
      parsed = parse(color);
      if (!parsed) throw new Error(`Unable to parse color: ${color}`);
    }
    // Convert to target
    let out;
    switch (to) {
      case 'hex': {
        const rgb = converter('rgb')(parsed) as any;
        if (!rgb) throw new Error('Conversion to rgb failed');
        const r = clamp(Math.round((rgb.r ?? 0) * 255), 0, 255);
        const g = clamp(Math.round((rgb.g ?? 0) * 255), 0, 255);
        const b = clamp(Math.round((rgb.b ?? 0) * 255), 0, 255);
        const a = clamp(Math.round((rgb.alpha ?? 1) * 255), 0, 255);
        // Always output 8-digit hex if the input is RGBA
        if (from === 'rgba') {
          const hex8 = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a.toString(16).padStart(2, '0')}`;
          // If alpha is 255, cut the trailing ff
          return a === 255 ? hex8.slice(0, 7) : hex8;
        }
        // If input was 8-digit hex, preserve 8 digits
        if (color.startsWith('#') && color.length === 9) {
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a.toString(16).padStart(2, '0')}`;
        }
        // Otherwise, output 6 digits if alpha is 255, else 8 digits
        if (a < 255) {
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a.toString(16).padStart(2, '0')}`;
        } else {
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
      }
      case 'hex8': {
        const rgb = converter('rgb')(parsed) as any;
        if (!rgb) throw new Error('Conversion to rgb failed');
        const r = Math.round((rgb.r ?? 0) * 255).toString(16).padStart(2, '0');
        const g = Math.round((rgb.g ?? 0) * 255).toString(16).padStart(2, '0');
        const b = Math.round((rgb.b ?? 0) * 255).toString(16).padStart(2, '0');
        const a = Math.round((rgb.alpha ?? 1) * 255).toString(16).padStart(2, '0');
        return `#${r}${g}${b}${a}`;
      }
      case 'rgb': {
        const rgb = converter('rgb')(parsed) as any;
        if (!rgb) throw new Error('Conversion to rgb failed');
        const r = clamp(Math.round((rgb.r ?? 0) * 255), 0, 255);
        const g = clamp(Math.round((rgb.g ?? 0) * 255), 0, 255);
        const b = clamp(Math.round((rgb.b ?? 0) * 255), 0, 255);
        return `rgb(${r},${g},${b})`;
      }
      case 'rgba': {
        const rgb = converter('rgb')(parsed) as any;
        if (!rgb) throw new Error('Conversion to rgb failed');
        const r = clamp(Math.round((rgb.r ?? 0) * 255), 0, 255);
        const g = clamp(Math.round((rgb.g ?? 0) * 255), 0, 255);
        const b = clamp(Math.round((rgb.b ?? 0) * 255), 0, 255);
        const a = clamp(Math.round((rgb.alpha ?? 1) * 255), 0, 255);
        return `rgba(${r},${g},${b},${a})`;
      }
      case 'hsl': {
        const hsl = converter('hsl')(parsed) as any;
        if (!hsl) throw new Error('Conversion to hsl failed');
        const h = Math.round(hsl.h ?? 0);
        const s = Math.round((hsl.s ?? 0) * 100);
        const l = Math.round((hsl.l ?? 0) * 100);
        return `hsl(${h},${s},${l})`;
      }
      case 'oklch': {
        const oklch = converter('oklch')(parsed) as any;
        if (!oklch) throw new Error('Conversion to oklch failed');
        return `oklch(${Number(oklch.l?.toFixed(2))} ${Number(oklch.c?.toFixed(2))} ${Number((oklch.h ?? 0).toFixed(2))})`;
      }
      case 'lab': {
        const lab = converter('lab')(parsed) as any;
        if (!lab) throw new Error('Conversion to lab failed');
        return `lab(${Number(lab.l?.toFixed(2))} ${Number(lab.a?.toFixed(2))} ${Number(lab.b?.toFixed(2))})`;
      }
      case 'cmyk': {
        const rgb = converter('rgb')(parsed) as any;
        if (!rgb) throw new Error('Conversion to rgb failed');
        const cmyk = rgbToCmykPercent(clamp(Math.round((rgb.r ?? 0) * 255), 0, 255), clamp(Math.round((rgb.g ?? 0) * 255), 0, 255), clamp(Math.round((rgb.b ?? 0) * 255), 0, 255));
        return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
      }
      default:
        throw new Error(`Unsupported color format: ${to}`);
    }
  }
}

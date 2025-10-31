/**
 * skin-undertone-calib.js
 *
 * - Estimates warm/tungsten color-cast using a linear-space gray-world approach
 * - Applies white-balance gains (in linear RGB)
 * - Converts to CIELAB and computes:
 *     - undertone (warm / neutral / cool) using b*
 *     - skin tone (very light -> deep) using L*
 * - Returns detailed diagnostics for tuning
 *
 * Usage (browser or Node):
 *   const res = detectUndertoneWithCalibration('#e6c9b3', '#5a3d2b', '#2f241f');
 *   console.log(res);
 *
 * Exports:
 *   - detectUndertoneWithCalibration(skinHex, hairHex?, eyeHex?, opts?)
 *   - detectUndertone (alias)
 */

// -------------------- Utilities: hex <-> RGB conversions --------------------

function hexSanitize(hex: string): string {
    if (!hex || typeof hex !== 'string') throw new Error('hex must be a non-empty string like "#aabbcc" or "abc"');
    const h = hex.trim().replace(/^#/, '');
    if (![3,6].includes(h.length)) throw new Error('hex must be 3 or 6 hex digits');
    return h.toLowerCase();
  }
  
  function hexToRgbObj(hex: string): { r: number; g: number; b: number } {
    const h = hexSanitize(hex);
    if (h.length === 3) {
      return {
        r: parseInt(h[0] + h[0], 16),
        g: parseInt(h[1] + h[1], 16),
        b: parseInt(h[2] + h[2], 16)
      };
    }
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16)
    };
  }
  
  function rgbObjToHex({ r, g, b }: { r: number; g: number; b: number }): string {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    const to2 = (v: number) => clamp(v).toString(16).padStart(2, '0');
    return `#${to2(r)}${to2(g)}${to2(b)}`;
  }
  
  // -------------------- Linear / sRGB conversions --------------------
  
  // sRGB channel (0..1) -> linear channel (0..1)
  function srgbToLinearChannel(c: number): number {
    if (c <= 0.04045) return c / 12.92;
    return Math.pow((c + 0.055) / 1.055, 2.4);
  }
  
  // linear channel (0..1) -> sRGB channel (0..1)
  function linearToSrgbChannel(c: number): number {
    if (c <= 0.0031308) return 12.92 * c;
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  }
  
  // hex -> linear RGB object {r,g,b} channels in 0..1
  function hexToLinearRgb(hex: string): { r: number; g: number; b: number } {
    const { r, g, b } = hexToRgbObj(hex);
    return {
      r: srgbToLinearChannel(r / 255),
      g: srgbToLinearChannel(g / 255),
      b: srgbToLinearChannel(b / 255)
    };
  }
  
  // linear RGB (0..1) -> hex
  function linearRgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
    const R = Math.round(255 * linearToSrgbChannel(r));
    const G = Math.round(255 * linearToSrgbChannel(g));
    const B = Math.round(255 * linearToSrgbChannel(b));
    return rgbObjToHex({ r: R, g: G, b: B });
  }
  
  // -------------------- Linear RGB -> XYZ -> Lab (CIELAB) --------------------
  
  function linearRgbToXyz({ r, g, b }: { r: number; g: number; b: number }): { X: number; Y: number; Z: number } {
    // matrix for sRGB to XYZ (D65), multiply linear channels, then scale *100
    const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) * 100;
    const Y = (0.2126729 * r + 0.7151522 * g + 0.0721750 * b) * 100;
    const Z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) * 100;
    return { X, Y, Z };
  }
  
  function xyzToLab({ X, Y, Z }: { X: number; Y: number; Z: number }): { L: number; a: number; b: number } {
    const Xn = 95.047, Yn = 100.000, Zn = 108.883; // D65
    const eps = 216 / 24389; // ~0.008856
    const k = 24389 / 27;    // ~903.3
    function f(t: number): number {
      return t > eps ? Math.cbrt(t) : (k * t + 16) / 116;
    }
    const fx = f(X / Xn);
    const fy = f(Y / Yn);
    const fz = f(Z / Zn);
    const L = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const b = 200 * (fy - fz);
    return { L, a, b };
  }
  
  // convenience: hex -> Lab (computes linear conversion inside)
  function hexToLab(hex: string): { L: number; a: number; b: number } {
    const lin = hexToLinearRgb(hex);
    return xyzToLab(linearRgbToXyz(lin));
  }
  
  // -------------------- Gray-world estimation & white-balance gains --------------------
  
  /**
   * estimateGrayWorldGains(hexArray)
   * - hexArray: array of hex strings (skin, hair, eyes, optional)
   * Returns { gains: {r,g,b}, means: {meanR,meanG,meanB}, target }
   *
   * Gains are computed in linear RGB: gC = target / meanC
   * Guarded to avoid divide-by-zero.
   */
  function estimateGrayWorldGains(hexArray: string[]): { gains: { r: number; g: number; b: number }; means: { meanR: number; meanG: number; meanB: number }; target: number } {
    if (!Array.isArray(hexArray) || hexArray.length === 0) throw new Error('hexArray must be a non-empty array');
    const linear = hexArray.map(hex => hexToLinearRgb(hex));
    let meanR = 0, meanG = 0, meanB = 0;
    linear.forEach(l => { meanR += l.r; meanG += l.g; meanB += l.b; });
    const n = linear.length;
    meanR /= n; meanG /= n; meanB /= n;
    const target = (meanR + meanG + meanB) / 3 || 1e-9;
    const gR = meanR > 1e-9 ? (target / meanR) : 1.0;
    const gG = meanG > 1e-9 ? (target / meanG) : 1.0;
    const gB = meanB > 1e-9 ? (target / meanB) : 1.0;
    return {
      gains: { r: gR, g: gG, b: gB },
      means: { meanR, meanG, meanB },
      target
    };
  }
  
  /**
   * isWarmIlluminant(means, threshold)
   * - heuristic detection: R > G * threshold AND G > B * threshold
   * - threshold default 1.03 (slightly stricter than equality)
   */
  function isWarmIlluminant(means: { meanR: number; meanG: number; meanB: number }, threshold = 1.03): boolean {
    return (means.meanR > means.meanG * threshold) && (means.meanG > means.meanB * threshold);
  }
  
  /**
   * applyGainsToHex(hex, gains)
   * - applies gains in linear RGB space, clamps to [0,1], returns hex (sRGB)
   */
  function applyGainsToHex(hex: string, gains: { r: number; g: number; b: number }): string {
    const lin = hexToLinearRgb(hex);
    const r = Math.max(0, Math.min(1, lin.r * gains.r));
    const g = Math.max(0, Math.min(1, lin.g * gains.g));
    const b = Math.max(0, Math.min(1, lin.b * gains.b));
    return linearRgbToHex({ r, g, b });
  }
  
  // -------------------- Skin tone & undertone classification --------------------
  
  function classifySkinToneByL(L: number): string {
    // L* in range [0..100]
    if (L >= 80) return 'very light';
    if (L >= 65) return 'light';
    if (L >= 50) return 'medium';
    if (L >= 35) return 'tan';
    return 'deep';
  }

  interface DetectionOptions {
    autoCalibrate?: boolean;
    warmDetectThreshold?: number;
    undertoneThresholds?: { warm: number; cool: number };
    weights?: { skin: number; hair: number; eye: number };
  }
  
  /**
   * detectUndertoneWithCalibration(skinHex, hairHex, eyeHex, opts)
   *
   * opts:
   *   - autoCalibrate (default true) : if false, no white-balance applied (gains=1)
   *   - warmDetectThreshold (default 1.03)
   *   - undertoneThresholds: { warm: 6.0, cool: 0.5 } (b* thresholds)
   *   - weights: { skin:0.8, hair:0.12, eye:0.08 } (must sum not necessarily to 1, normalized internally)
   *
   * Returns a detailed object:
   *   { calibrated: {skinHex, hairHex, eyeHex}, gains, isWarmIlluminant, means, target,
   *     undertone, score, skinTone, labs: { skin, hair, eye }, settings }
   */
  function detectUndertoneWithCalibration(skinHex: string, hairHex: string | null = null, eyeHex: string | null = null, opts: DetectionOptions = {}) {
    if (!skinHex) throw new Error('skinHex is required');
  
    const autoCalibrate = opts.autoCalibrate !== undefined ? opts.autoCalibrate : true;
    const warmDetectThreshold = (typeof opts.warmDetectThreshold === 'number') ? opts.warmDetectThreshold : 1.03;
    const undertoneThresholds = opts.undertoneThresholds || { warm: 6.0, cool: 0.5 };
    const weights = opts.weights || { skin: 0.8, hair: 0.12, eye: 0.08 };
  
    // collect samples (at least skin)
    const samples = [skinHex];
    if (hairHex) samples.push(hairHex);
    if (eyeHex) samples.push(eyeHex);
  
    // estimate gains (in linear RGB)
    const { gains, means, target } = estimateGrayWorldGains(samples);
    const warm = isWarmIlluminant(means, warmDetectThreshold);
  
    const appliedGains = autoCalibrate ? gains : { r: 1, g: 1, b: 1 };
  
    // apply gains
    const calibrated = {
      skinHex: applyGainsToHex(skinHex, appliedGains),
      hairHex: hairHex ? applyGainsToHex(hairHex, appliedGains) : null,
      eyeHex: eyeHex ? applyGainsToHex(eyeHex, appliedGains) : null
    };
  
    // convert to Lab (CIELAB)
    const skinLab = hexToLab(calibrated.skinHex);
    const hairLab = calibrated.hairHex ? hexToLab(calibrated.hairHex) : null;
    const eyeLab = calibrated.eyeHex ? hexToLab(calibrated.eyeHex) : null;
  
    // compute weighted b* (higher = more yellow/warm, lower/negative = blue/cool)
    let totalWeight = 0, weightedB = 0;
    weightedB += (weights.skin || 0) * skinLab.b; totalWeight += (weights.skin || 0);
    if (hairLab) { weightedB += (weights.hair || 0) * hairLab.b; totalWeight += (weights.hair || 0); }
    if (eyeLab)  { weightedB += (weights.eye  || 0) * eyeLab.b;  totalWeight += (weights.eye  || 0); }
    const combinedB = weightedB / (totalWeight || 1);
  
    // classify undertone
    let undertone;
    if (combinedB >= undertoneThresholds.warm) undertone = 'warm';
    else if (combinedB <= undertoneThresholds.cool) undertone = 'cool';
    else undertone = 'neutral';
  
    // skin tone by L*
    const skinTone = classifySkinToneByL(skinLab.L);
  
    return {
      calibrated,
      gains: appliedGains,
      isWarmIlluminant: warm,
      means,
      target,
      undertone,
      score: combinedB,
      skinTone,
      labs: {
        skin: skinLab,
        hair: hairLab,
        eye: eyeLab
      },
      settings: {
        weights,
        undertoneThresholds,
        warmDetectThreshold,
        autoCalibrate
      }
    };
  }
  
  // Alias for backward compatibility
  const detectUndertone = detectUndertoneWithCalibration;
  
  // -------------------- Example usage & quick tests --------------------
  
  function exampleRun() {
    console.log('--- Example runs ---');
  
    const example1 = detectUndertoneWithCalibration('#e6c9b3', '#5a3d2b', '#2f241f'); // typical warm-ish skin
    console.log('Example 1 (skin,hair,eye):', example1);
  
    const example2 = detectUndertoneWithCalibration('#f7efe6', null, null); // only skin provided (no calibration possible except skin)
    console.log('Example 2 (only skin):', example2);
  
    // force no calibration (useful when your inputs already are white-balanced)
    const example3 = detectUndertoneWithCalibration('#e6c9b3', '#5a3d2b', '#2f241f', { autoCalibrate: false });
    console.log('Example 3 (no calibration):', example3);
  
    // tune thresholds example (stricter warm threshold)
    const example4 = detectUndertoneWithCalibration('#e6c9b3', '#5a3d2b', '#2f241f', {
      undertoneThresholds: { warm: 7.5, cool: 0.0 }
    });
    console.log('Example 4 (tuned thresholds):', example4);
  }
  
  // TypeScript/ES6 module exports
  export { detectUndertoneWithCalibration, detectUndertone };
  
  // If run in Node or top-level browser script, run example
  if (typeof window === 'undefined' && typeof module !== 'undefined' && module.exports) {
    // Node: auto-run example when executed directly (node skin-undertone-calib.js)
    if (require.main === module) exampleRun();
    module.exports = { detectUndertoneWithCalibration, detectUndertone };
  } else {
    // Browser: attach to window for interactive use
    if (typeof window !== 'undefined') {
      (window as any).detectUndertoneWithCalibration = detectUndertoneWithCalibration;
      (window as any).detectUndertone = detectUndertone;
      // Optionally auto-run examples in console:
      // exampleRun();
    }
  }
  
/**
 * Riemann Zeta Function & Complex Evaluation for Domain Coloring
 */

export interface ComplexNumber {
  re: number;
  im: number;
}

export interface ZetaInfo {
  n: number;
  exactFormula: string;
  latexFormula: string;
  latexExactOnly: string;
  decimalValue: number;
  decimalString: string;
  isPole: boolean;
  eulerProductPreview: string;
  eulerProductLatex: string;
  eulerExpansionLatex: string;
  seriesFormula: string;
  seriesLatex: string;
  eulerFormulaLatex: string;
  description: string;
}

// Precomputed known exact values for even and small integers
const EXACT_ZETA_EVEN: Record<number, { exact: string; latex: string; val: number }> = {
  2: { exact: "π² / 6", latex: "\\frac{\\pi^2}{6}", val: Math.PI ** 2 / 6 },
  4: { exact: "π⁴ / 90", latex: "\\frac{\\pi^4}{90}", val: Math.PI ** 4 / 90 },
  6: { exact: "π⁶ / 945", latex: "\\frac{\\pi^6}{945}", val: Math.PI ** 6 / 945 },
  8: { exact: "π⁸ / 9450", latex: "\\frac{\\pi^8}{9450}", val: Math.PI ** 8 / 9450 },
  10: { exact: "π¹⁰ / 93555", latex: "\\frac{\\pi^{10}}{93555}", val: Math.PI ** 10 / 93555 },
  12: { exact: "691π¹² / 638512875", latex: "\\frac{691\\pi^{12}}{638512875}", val: (691 * Math.PI ** 12) / 638512875 },
  14: { exact: "2π¹⁴ / 18243225", latex: "\\frac{2\\pi^{14}}{18243225}", val: (2 * Math.PI ** 14) / 18243225 },
  16: { exact: "3617π¹⁶ / 325641566250", latex: "\\frac{3617\\pi^{16}}{325641566250}", val: (3617 * Math.PI ** 16) / 325641566250 },
  18: { exact: "43867π¹⁸ / 38979295480125", latex: "\\frac{43867\\pi^{18}}{38979295480125}", val: (43867 * Math.PI ** 18) / 38979295480125 },
  20: { exact: "174611π²⁰ / 1531329465290625", latex: "\\frac{174611\\pi^{20}}{1531329465290625}", val: (174611 * Math.PI ** 20) / 1531329465290625 },
  22: { exact: "854513π²² / 7461370498875", latex: "\\frac{854513\\pi^{22}}{7461370498875}", val: (854513 * Math.PI ** 22) / 7461370498875 },
  24: { exact: "236364091π²⁴ / 20220302787880875", latex: "\\frac{236364091\\pi^{24}}{20220302787880875}", val: (236364091 * Math.PI ** 24) / 20220302787880875 },
  26: { exact: "8553103π²⁶ / 721995804575", latex: "\\frac{8553103\\pi^{26}}{721995804575}", val: (8553103 * Math.PI ** 26) / 721995804575 },
};

// Known high precision values for small odd integers
const ODD_ZETA_VALUES: Record<number, number> = {
  3: 1.2020569031595942, // Constante de Apéry
  5: 1.0369277551433699,
  7: 1.0083492773819228,
  9: 1.0020083928260822,
  11: 1.0004941886041195,
  13: 1.0001227133475785,
  15: 1.000030588236307,
  17: 1.0000076371976379,
  19: 1.0000019082127165,
};

/**
 * Computes exact metadata and numerical value of Riemann Zeta function ζ(n) for positive integer n.
 */
export function getZetaInfo(n: number): ZetaInfo {
  if (n <= 0) {
    return {
      n,
      exactFormula: "Não definido para n ≤ 0",
      latexFormula: "\\text{N/A}",
      latexExactOnly: "\\text{N/A}",
      decimalValue: 0,
      decimalString: "0",
      isPole: false,
      eulerProductPreview: "",
      eulerProductLatex: "",
      eulerExpansionLatex: "",
      seriesFormula: "",
      seriesLatex: "",
      eulerFormulaLatex: "",
      description: "",
    };
  }

  // Pole at n = 1
  if (n === 1) {
    return {
      n: 1,
      exactFormula: "∞ (Polo Simples de Resíduo 1)",
      latexFormula: "\\zeta(1) = \\infty",
      latexExactOnly: "\\infty",
      decimalValue: Infinity,
      decimalString: "∞ (Divergente - Série Harmônica)",
      isPole: true,
      eulerProductPreview: "∏ 1/(1 - p⁻¹) → ∞",
      eulerProductLatex: "\\zeta(1) = \\prod_{p \\in \\mathbb{P}} \\frac{1}{1 - p^{-1}} \\to \\infty",
      eulerExpansionLatex: "= \\left(\\frac{1}{1 - 2^{-1}}\\right) \\cdot \\left(\\frac{1}{1 - 3^{-1}}\\right) \\cdot \\left(\\frac{1}{1 - 5^{-1}}\\right) \\cdots \\to \\infty",
      seriesFormula: "∑_{k=1}^∞ 1/k = 1 + 1/2 + 1/3 + 1/4 + ... = ∞",
      seriesLatex: "\\sum_{k=1}^{\\infty} \\frac{1}{k} = 1 + \\frac{1}{2} + \\frac{1}{3} + \\frac{1}{4} + \\cdots = \\infty",
      eulerFormulaLatex: "\\lim_{s \\to 1} (s - 1)\\zeta(s) = 1",
      description:
        "Para n = 1, ζ(1) corresponde à célebre Série Harmônica divergente. No plano complexo, s = 1 é o único polo da função zeta de Riemann (polo simples com resíduo 1).",
    };
  }

  // Even integers (Euler's closed-form solution)
  if (n % 2 === 0) {
    const eulerFormula = "\\zeta(2k) = \\frac{(-1)^{k+1} B_{2k} (2\\pi)^{2k}}{2 \\cdot (2k)!}";
    const seriesLatex = `\\sum_{k=1}^{\\infty} \\frac{1}{k^{${n}}} = 1 + \\frac{1}{2^{${n}}} + \\frac{1}{3^{${n}}} + \\frac{1}{4^{${n}}} + \\cdots`;
    const eulerProductLatex = `\\zeta(${n}) = \\prod_{p \\in \\mathbb{P}} \\frac{1}{1 - p^{-${n}}}`;
    const eulerExpansionLatex = `= \\left(\\frac{1}{1 - 2^{-${n}}}\\right) \\cdot \\left(\\frac{1}{1 - 3^{-${n}}}\\right) \\cdot \\left(\\frac{1}{1 - 5^{-${n}}}\\right) \\cdots`;

    if (EXACT_ZETA_EVEN[n]) {
      const { exact, latex, val } = EXACT_ZETA_EVEN[n];
      return {
        n,
        exactFormula: exact,
        latexFormula: `\\zeta(${n}) = ${latex}`,
        latexExactOnly: latex,
        decimalValue: val,
        decimalString: val.toFixed(14),
        isPole: false,
        eulerProductPreview: `1/(1 - 2⁻${n}) · 1/(1 - 3⁻${n}) · 1/(1 - 5⁻${n}) ...`,
        eulerProductLatex,
        eulerExpansionLatex,
        seriesFormula: `∑_{k=1}^∞ 1/k^${n} = 1 + 1/2^${n} + 1/3^${n} + ...`,
        seriesLatex,
        eulerFormulaLatex: eulerFormula,
        description:
          n === 2
            ? "O célebre Problema de Basileia, resolvido por Leonhard Euler em 1734. Euler provou que a soma dos inversos dos quadrados perfeitos converge exatamente para π²/6."
            : `Fórmula exata de Euler via números de Bernoulli B_{2k}. A razão entre potências de π e fatoriais produz frações racionais exatas.`,
      };
    }

    // For larger even n (> 26)
    let sum = 0;
    for (let k = 1; k <= 60; k++) {
      const term = 1 / Math.pow(k, n);
      sum += term;
      if (term < 1e-16) break;
    }
    const generalLatex = `\\frac{(-1)^{${n / 2 + 1}} B_{${n}} (2\\pi)^{${n}}}{2 \\cdot ${n}!}`;
    return {
      n,
      exactFormula: `(-1)^(${n / 2 + 1}) · B_${n} · (2π)^${n} / (2 · ${n}!)`,
      latexFormula: `\\zeta(${n}) = ${generalLatex}`,
      latexExactOnly: generalLatex,
      decimalValue: sum,
      decimalString: sum.toFixed(14),
      isPole: false,
      eulerProductPreview: `1/(1 - 2⁻${n}) · 1/(1 - 3⁻${n}) ...`,
      eulerProductLatex,
      eulerExpansionLatex,
      seriesFormula: `∑_{k=1}^∞ 1/k^${n}`,
      seriesLatex,
      eulerFormulaLatex: eulerFormula,
      description: `Fórmula analítica de Euler via números de Bernoulli B_{${n}}. Para n grande, a série converge instantaneamente para 1: ζ(${n}) - 1 ≈ 2⁻${n}.`,
    };
  }

  // Odd integers (n = 3, 5, 7...)
  let decVal = ODD_ZETA_VALUES[n];
  if (!decVal) {
    let sum = 0;
    for (let k = 1; k <= 80; k++) {
      const term = 1 / Math.pow(k, n);
      sum += term;
      if (term < 1e-16) break;
    }
    decVal = sum;
  }

  let desc = `Para potências ímpares ζ(2k+1), não há fórmula fechada simples conhecida em potências de π.`;
  if (n === 3) {
    desc = `Constante de Apéry! Em 1978, Roger Apéry provou que ζ(3) é um número irracional, um dos grandes marcos da teoria analítica dos números.`;
  }

  const seriesLatex = `\\sum_{k=1}^{\\infty} \\frac{1}{k^{${n}}} = 1 + \\frac{1}{2^{${n}}} + \\frac{1}{3^{${n}}} + \\frac{1}{4^{${n}}} + \\cdots`;
  const eulerProductLatex = `\\zeta(${n}) = \\prod_{p \\in \\mathbb{P}} \\frac{1}{1 - p^{-${n}}}`;
  const eulerExpansionLatex = `= \\left(\\frac{1}{1 - 2^{-${n}}}\\right) \\cdot \\left(\\frac{1}{1 - 3^{-${n}}}\\right) \\cdot \\left(\\frac{1}{1 - 5^{-${n}}}\\right) \\cdots`;

  const approxLatex = `\\approx ${decVal.toFixed(14)}`;

  return {
    n,
    exactFormula: n === 3 ? "Constante de Apéry (Irracional)" : `∑_{k=1}^∞ 1/k^${n}`,
    latexFormula: n === 3 ? `\\zeta(3) \\approx ${decVal.toFixed(14)}` : `\\zeta(${n}) \\approx ${decVal.toFixed(14)}`,
    latexExactOnly: approxLatex,
    decimalValue: decVal,
    decimalString: decVal.toFixed(14),
    isPole: false,
    eulerProductPreview: `1/(1 - 2⁻${n}) · 1/(1 - 3⁻${n}) · 1/(1 - 5⁻${n}) ...`,
    eulerProductLatex,
    eulerExpansionLatex,
    seriesFormula: `∑_{k=1}^∞ 1/k^${n} = 1 + 1/2^${n} + 1/3^${n} + ...`,
    seriesLatex,
    eulerFormulaLatex: `\\zeta(${n}) = \\sum_{k=1}^{\\infty} \\frac{1}{k^{${n}}}`,
    description: desc,
  };
}

/**
 * Accelerated Dirichlet Eta function to evaluate Riemann Zeta in C:
 *   η(s) = ∑_{k=1}^M (-1)^(k-1) c_k / k^s
 *   ζ(s) = η(s) / (1 - 2^(1 - s))
 * Highly accurate and fast for domain coloring in the critical strip and surrounding complex plane.
 */
export function evaluateZetaComplex(sigma: number, t: number): ComplexNumber {
  // Pole at s = 1
  const distToPoleSq = (sigma - 1) * (sigma - 1) + t * t;
  if (distToPoleSq < 1e-10) {
    return { re: 1e6, im: 0 };
  }

  // Precomputed weights for accelerated alternating series (Euler/Borwein transform, N = 16)
  const N = 16;
  const halfN = 8;
  const twoPowHalfN = 256; // 2^8

  let etaRe = 0;
  let etaIm = 0;

  for (let k = 1; k <= N; k++) {
    // Weight c_k
    let weight = 1;
    if (k > halfN) {
      // Partial binomial sum tail
      let binomSum = 0;
      let binom = 1;
      const m = halfN;
      const idx = k - halfN;
      for (let j = 0; j <= m; j++) {
        if (j >= idx) {
          binomSum += binom;
        }
        binom = (binom * (m - j)) / (j + 1);
      }
      weight = binomSum / twoPowHalfN;
    }

    const sign = k % 2 === 1 ? 1 : -1;
    // k^(-s) = k^(-sigma) * [cos(t * ln(k)) - i * sin(t * ln(k))]
    const lnK = Math.log(k);
    const mag = Math.pow(k, -sigma);
    const angle = -t * lnK;

    const termRe = sign * weight * mag * Math.cos(angle);
    const termIm = sign * weight * mag * Math.sin(angle);

    etaRe += termRe;
    etaIm += termIm;
  }

  // Denominator: 1 - 2^(1 - s)
  // 2^(1 - s) = 2^(1 - sigma) * [cos(-t * ln 2) + i * sin(-t * ln 2)]
  const ln2 = 0.6931471805599453;
  const mag2 = Math.pow(2, 1 - sigma);
  const angle2 = -t * ln2;

  const denRe = 1 - mag2 * Math.cos(angle2);
  const denIm = -mag2 * Math.sin(angle2);

  const denModSq = denRe * denRe + denIm * denIm;
  if (denModSq < 1e-12) {
    return { re: 1e5, im: 1e5 };
  }

  // ζ(s) = (etaRe + i*etaIm) / (denRe + i*denIm)
  const zetaRe = (etaRe * denRe + etaIm * denIm) / denModSq;
  const zetaIm = (etaIm * denRe - etaRe * denIm) / denModSq;

  return { re: zetaRe, im: zetaIm };
}

/**
 * Domain coloring: maps complex number w = u + iv to RGB color.
 * Hue: phase arg(w) in [0, 2π).
 * Value / Brightness: periodic logarithmic lightness with grid contours.
 */
export function complexToRGB(
  u: number,
  v: number,
  showContours = true
): [number, number, number] {
  const modSq = u * u + v * v;
  if (!Number.isFinite(modSq) || modSq === 0) {
    return [0, 0, 0];
  }

  const mod = Math.sqrt(modSq);
  // Phase angle in [0, 2π)
  const angle = Math.atan2(v, u);
  let hue = (angle * 180) / Math.PI;
  if (hue < 0) hue += 360;

  // Logarithmic modulus for contour rings
  let lightness = 0.5;
  if (showContours) {
    const logMod = Math.log2(mod);
    const frac = logMod - Math.floor(logMod);
    // Smooth grid brightness oscillation
    const contour = 0.82 + 0.18 * Math.sin(2 * Math.PI * frac);
    // Phase grid rays
    const phaseGrid = 0.88 + 0.12 * Math.sin(16 * angle);
    lightness = 0.48 * contour * phaseGrid;
  }

  // Saturation
  const sat = 0.92;

  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * lightness - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (hue < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (hue < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (hue < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (hue < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return [
    Math.min(255, Math.max(0, Math.round((r + m) * 255))),
    Math.min(255, Math.max(0, Math.round((g + m) * 255))),
    Math.min(255, Math.max(0, Math.round((b + m) * 255))),
  ];
}

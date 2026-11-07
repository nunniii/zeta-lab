/** ─── Number Theory & Trigonometry Core ─── */

export interface NumberProfile {
  n: number;
  isPrime: boolean;
  divisors: number[];
  primeDivisors: number[];
  divisorCount: number;       // σ₀(n)
  divisorSum: number;         // σ₁(n)
  totient: number;            // φ(n) — Euler's totient
  angle: number;              // radians on unit circle: 2πn / modulus
  complex: { re: number; im: number }; // e^(i·2πn/N)
  spin: 'up' | 'down';       // parity-based spin analogy
  primeIndex: number | null;  // index in prime sequence if prime
}

export interface TrigPoint {
  n: number;
  angle: number;           // θ = 2πn / N
  cos: number;
  sin: number;
  x: number;               // projected canvas x
  y: number;               // projected canvas y
  radius: number;          // visual radius based on divisor count
  profile: NumberProfile;
}

/* ─── Primality ─── */
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/* ─── Sieve of Eratosthenes up to limit ─── */
export function sieve(limit: number): boolean[] {
  const flags = new Array(limit + 1).fill(true);
  flags[0] = flags[1] = false;
  for (let i = 2; i * i <= limit; i++) {
    if (flags[i]) {
      for (let j = i * i; j <= limit; j += i) {
        flags[j] = false;
      }
    }
  }
  return flags;
}

/* ─── Divisors ─── */
export function getDivisors(n: number): number[] {
  if (n < 1) return [];
  const divs: number[] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      divs.push(i);
      if (i !== n / i) divs.push(n / i);
    }
  }
  return divs.sort((a, b) => a - b);
}

/* ─── Euler's Totient ─── */
export function eulerTotient(n: number): number {
  if (n <= 1) return n;
  let result = n;
  let temp = n;
  for (let p = 2; p * p <= temp; p++) {
    if (temp % p === 0) {
      while (temp % p === 0) temp /= p;
      result -= result / p;
    }
  }
  if (temp > 1) result -= result / temp;
  return Math.round(result);
}

/* ─── Full Profile ─── */
export function profileNumber(n: number, modulus: number, primeFlags?: boolean[]): NumberProfile {
  const divs = getDivisors(n);
  const primeCheck = primeFlags ? (n >= 2 && primeFlags[n]) : isPrime(n);
  const primeDivisors = divs.filter(d => d > 1 && (primeFlags ? primeFlags[d] : isPrime(d)));
  const angle = (2 * Math.PI * n) / modulus;

  return {
    n,
    isPrime: primeCheck,
    divisors: divs,
    primeDivisors,
    divisorCount: divs.length,
    divisorSum: divs.reduce((s, d) => s + d, 0),
    totient: eulerTotient(n),
    angle,
    complex: { re: Math.cos(angle), im: Math.sin(angle) },
    spin: n % 2 === 0 ? 'down' : 'up',
    primeIndex: primeCheck ? countPrimesBelow(n, primeFlags) : null,
  };
}

function countPrimesBelow(n: number, flags?: boolean[]): number {
  let count = 0;
  for (let i = 2; i <= n; i++) {
    if (flags ? flags[i] : isPrime(i)) count++;
  }
  return count;
}

/* ─── Generate all TrigPoints for 1..N ─── */
export function generateTrigPoints(
  N: number,
  cx: number,
  cy: number,
  baseRadius: number,
): TrigPoint[] {
  const flags = sieve(N);
  const points: TrigPoint[] = [];

  for (let n = 1; n <= N; n++) {
    const profile = profileNumber(n, N, flags);
    const θ = profile.angle - Math.PI / 2; // start from top
    const r = baseRadius;
    const nodeRadius = 3 + profile.divisorCount * 1.5;

    points.push({
      n,
      angle: profile.angle,
      cos: Math.cos(θ),
      sin: Math.sin(θ),
      x: cx + r * Math.cos(θ),
      y: cy + r * Math.sin(θ),
      radius: Math.min(nodeRadius, 18),
      profile,
    });
  }

  return points;
}

/* ─── Complex Plane Projection ─── */
export function complexPlanePoint(
  profile: NumberProfile,
  cx: number,
  cy: number,
  scale: number,
): { x: number; y: number } {
  return {
    x: cx + profile.complex.re * scale,
    y: cy - profile.complex.im * scale, // canvas y is inverted
  };
}

/* ─── Spiral mapping (prime spiral) ─── */
export function spiralPoint(
  n: number,
  cx: number,
  cy: number,
  a: number = 0,
  b: number = 4,
): { x: number; y: number; angle: number } {
  const angle = n * 0.3;
  const r = a + b * Math.sqrt(n);
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
    angle,
  };
}

/* ─── Divisor Connection Lines ─── */
export interface DivisorLink {
  from: number;
  to: number;
  type: 'divisor' | 'prime-factor';
}

export function getDivisorLinks(n: number): DivisorLink[] {
  const divs = getDivisors(n);
  const links: DivisorLink[] = [];

  for (const d of divs) {
    if (d !== n && d !== 1) {
      links.push({
        from: n,
        to: d,
        type: isPrime(d) ? 'prime-factor' : 'divisor',
      });
    }
  }

  return links;
}

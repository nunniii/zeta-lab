import { isPrime } from "./engine";

export type CircleData = {
  a: number;
  b: number;
  r2: number;
  radius: number;
};

export interface InterprimeInfo {
  isInterprime: boolean;
  p1: number | null;
  p2: number | null;
  distance: number | null;
  isTwinMean: boolean;
}

export function getInterprimeInfo(n: number): InterprimeInfo {
  if (n < 4) {
    return { isInterprime: false, p1: null, p2: null, distance: null, isTwinMean: false };
  }

  // Interprimes cannot be prime themselves
  if (isPrime(n)) {
    return { isInterprime: false, p1: null, p2: null, distance: null, isTwinMean: false };
  }

  // Find greatest prime < n
  let p1 = n - 1;
  while (p1 >= 3 && !isPrime(p1)) {
    p1--;
  }
  if (p1 < 3) {
    return { isInterprime: false, p1: null, p2: null, distance: null, isTwinMean: false };
  }

  // Find smallest prime > n
  let p2 = n + 1;
  while (!isPrime(p2)) {
    p2++;
  }

  // Check if n is the arithmetic mean of p1 and p2
  if (p1 + p2 === 2 * n) {
    const distance = n - p1;
    return {
      isInterprime: true,
      p1,
      p2,
      distance,
      isTwinMean: p2 - p1 === 2,
    };
  }

  return { isInterprime: false, p1: null, p2: null, distance: null, isTwinMean: false };
}

export interface TwinPrimeInfo {
  isTwinPrime: boolean;
  twinsOfN: number[]; // e.g. for 5: [3, 7]; for 11: [13]
  twinPairsOfN: [number, number][]; // pairs containing n, e.g. for 5: [[3, 5], [5, 7]]
  isBetweenTwins: boolean; // if n is even and (n - 1, n + 1) are twin primes (e.g. 12 -> 11, 13)
  surroundingTwins: [number, number] | null;
  nearestTwinPair: [number, number];
  distanceToNearest: number;
}

export function getTwinPrimeInfo(n: number): TwinPrimeInfo {
  const isNPrime = isPrime(n);
  const twinsOfN: number[] = [];
  const twinPairsOfN: [number, number][] = [];

  if (isNPrime) {
    if (n - 2 >= 3 && isPrime(n - 2)) {
      twinsOfN.push(n - 2);
      twinPairsOfN.push([n - 2, n]);
    }
    if (isPrime(n + 2)) {
      twinsOfN.push(n + 2);
      twinPairsOfN.push([n, n + 2]);
    }
  }

  const isBetweenTwins = n >= 4 && isPrime(n - 1) && isPrime(n + 1) && (n - 1 >= 3);
  const surroundingTwins: [number, number] | null = isBetweenTwins ? [n - 1, n + 1] : null;

  // Search nearest twin pair to n
  let nearestTwinPair: [number, number] = [3, 5];
  let minDiff = Infinity;

  // Scan distances around n
  for (let delta = 0; delta <= 500; delta++) {
    const pDown = n - delta;
    if (pDown >= 3 && isPrime(pDown) && isPrime(pDown + 2)) {
      nearestTwinPair = [pDown, pDown + 2];
      minDiff = delta;
      break;
    }
    const pUp = n + delta;
    if (pUp >= 3 && isPrime(pUp) && isPrime(pUp + 2)) {
      nearestTwinPair = [pUp, pUp + 2];
      minDiff = delta;
      break;
    }
  }

  return {
    isTwinPrime: twinsOfN.length > 0,
    twinsOfN,
    twinPairsOfN,
    isBetweenTwins,
    surroundingTwins,
    nearestTwinPair,
    distanceToNearest: minDiff,
  };
}

export interface DivisorTriangleData {
  a: number;
  b: number;
  n: number;
  r2: number;
  hypotenuse: number;
  hypotenuseStr: string;
  isPythagorean: boolean;
  pythagoreanK: number | null;
  area: number;
  perimeter: number;
  semiperimeter: number;
  inradius: number;
  circumradius: number;
  altitudeH: number;
  thetaRad: number;
  thetaDeg: number;
  phiRad: number;
  phiDeg: number;
  sinTheta: number;
  cosTheta: number;
  tanTheta: number;
  cotTheta: number;
  secTheta: number;
  cscTheta: number;
}

export function getDivisorTriangleData(a: number, b: number): DivisorTriangleData {
  const n = a * b;
  const r2 = a * a + b * b;
  const hypotenuse = Math.sqrt(r2);
  const hypotenuseStr = formatSqrt(r2);
  const roundedHyp = Math.round(hypotenuse);
  const isPythagorean = roundedHyp * roundedHyp === r2;
  const pythagoreanK = isPythagorean ? roundedHyp : null;
  const area = n / 2;
  const perimeter = a + b + hypotenuse;
  const semiperimeter = perimeter / 2;
  const inradius = (a + b - hypotenuse) / 2;
  const circumradius = hypotenuse / 2;
  const altitudeH = n / hypotenuse;

  const thetaRad = Math.atan2(b, a);
  const thetaDeg = (thetaRad * 180) / Math.PI;
  const phiRad = Math.PI / 2 - thetaRad;
  const phiDeg = (phiRad * 180) / Math.PI;

  const sinTheta = b / hypotenuse;
  const cosTheta = a / hypotenuse;
  const tanTheta = b / a;
  const cotTheta = a / b;
  const secTheta = hypotenuse / a;
  const cscTheta = hypotenuse / b;

  return {
    a,
    b,
    n,
    r2,
    hypotenuse,
    hypotenuseStr,
    isPythagorean,
    pythagoreanK,
    area,
    perimeter,
    semiperimeter,
    inradius,
    circumradius,
    altitudeH,
    thetaRad,
    thetaDeg,
    phiRad,
    phiDeg,
    sinTheta,
    cosTheta,
    tanTheta,
    cotTheta,
    secTheta,
    cscTheta,
  };
}

export function getDivisores(n: number): number[] {
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

export function getParesDivisores(n: number): [number, number][] {
  const pares: [number, number][] = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) {
      pares.push([d, n / d]);
    }
  }
  return pares;
}

export function simplifySqrt(n: number): { coefficient: number; radicand: number } {
  if (n <= 0) {
    return { coefficient: 0, radicand: 1 };
  }

  let coefficient = 1;
  let radicand = n;

  for (let i = Math.floor(Math.sqrt(n)); i >= 2; i--) {
    const square = i * i;
    if (n % square === 0) {
      coefficient = i;
      radicand = n / square;
      break;
    }
  }

  return { coefficient, radicand };
}

export function formatSqrt(n: number): string {
  const { coefficient, radicand } = simplifySqrt(n);

  if (radicand === 1) {
    return `${coefficient}`;
  }
  if (coefficient === 1) {
    return `√${radicand}`;
  }
  return `${coefficient}√${radicand}`;
}

export function formatSqrtMultiple(multiplier: number, n: number): string {
  const { coefficient, radicand } = simplifySqrt(n);
  const value = multiplier * coefficient;

  if (radicand === 1) {
    return `${value}`;
  }
  if (value === 1) {
    return `√${radicand}`;
  }
  return `${value}√${radicand}`;
}

export function getCircles(n: number): CircleData[] {
  return getParesDivisores(n).map(([a, b]) => {
    const r2 = a * a + b * b;
    return {
      a,
      b,
      r2,
      radius: Math.sqrt(r2),
    };
  });
}

export function getIntegerPoints(r2: number): [number, number][] {
  const points: [number, number][] = [];
  const limit = Math.floor(Math.sqrt(r2));

  for (let x = -limit; x <= limit; x++) {
    for (let y = -limit; y <= limit; y++) {
      if (x * x + y * y === r2) {
        points.push([x, y]);
      }
    }
  }

  return points;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

export function isCubic(n: number): boolean {
  if (n <= 0) return false;
  const c = Math.round(Math.cbrt(n));
  return c * c * c === n;
}

export function isSquare(n: number): boolean {
  if (n <= 0) return false;
  const s = Math.round(Math.sqrt(n));
  return s * s === n;
}

export interface PrimeFactorNode {
  value: number;
  isPrime: boolean;
  left?: PrimeFactorNode;
  right?: PrimeFactorNode;
}

export function buildFactorTree(n: number): PrimeFactorNode {
  if (n <= 1) return { value: n, isPrime: false };

  // Find smallest prime factor
  let factor = -1;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) {
      factor = i;
      break;
    }
  }

  if (factor === -1) {
    // n is prime
    return { value: n, isPrime: true };
  }

  return {
    value: n,
    isPrime: false,
    left: { value: factor, isPrime: true },
    right: buildFactorTree(n / factor),
  };
}

export function getPrimeFactorCounts(n: number): { prime: number; power: number }[] {
  if (n <= 1) return [];
  const counts: Record<number, number> = {};
  let temp = n;

  for (let d = 2; d * d <= temp; d++) {
    while (temp % d === 0) {
      counts[d] = (counts[d] || 0) + 1;
      temp /= d;
    }
  }
  if (temp > 1) {
    counts[temp] = (counts[temp] || 0) + 1;
  }

  return Object.entries(counts).map(([p, power]) => ({
    prime: Number(p),
    power,
  }));
}

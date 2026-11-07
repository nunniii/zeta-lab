import {
  type TrigPoint,
  type NumberProfile,
  generateTrigPoints,
  complexPlanePoint,
  spiralPoint,
  getDivisorLinks,
} from '../math/engine';

/* ─── Color Palette ─── */
const COLORS = {
  void: '#0a0a0f',
  prime: '#fbbf24',
  composite: '#3b82f6',
  one: '#6a6680',
  spinUp: '#22d3ee',
  spinDown: '#f472b6',
  accent: '#8b5cf6',
  cyan: '#00d4ff',
  rose: '#f43f5e',
  emerald: '#10b981',
  gridLine: 'rgba(255,255,255,0.03)',
  gridAxis: 'rgba(255,255,255,0.08)',
  linkDivisor: 'rgba(59,130,246,0.12)',
  linkPrime: 'rgba(251,191,36,0.18)',
  text: '#e8e6f0',
  textMuted: '#6a6680',
};

export type ViewMode = 'circle' | 'spiral' | 'complex';

export interface RenderOptions {
  viewMode: ViewMode;
  showDivisorLinks: boolean;
  showLabels: boolean;
  showSpinColors: boolean;
  showComplexProjection: boolean;
  highlightPrimes: boolean;
  animationPhase: number;
}

interface HoverTarget {
  point: TrigPoint;
  screenX: number;
  screenY: number;
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private points: TrigPoint[] = [];
  private N = 60;
  private dpr = 1;
  private width = 0;
  private height = 0;
  private animFrame = 0;
  private phase = 0;
  private hovered: HoverTarget | null = null;

  public options: RenderOptions = {
    viewMode: 'circle',
    showDivisorLinks: true,
    showLabels: true,
    showSpinColors: false,
    showComplexProjection: true,
    highlightPrimes: true,
    animationPhase: 0,
  };

  public onHover: ((profile: NumberProfile | null, x: number, y: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    this.bindEvents();
  }

  /* ─── Lifecycle ─── */
  resize() {
    const rect = this.canvas.parentElement!.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.recalculate();
  }

  setN(n: number) {
    this.N = Math.max(2, Math.min(n, 500));
    this.recalculate();
  }

  getN(): number {
    return this.N;
  }

  private recalculate() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const baseRadius = Math.min(this.width, this.height) * 0.38;
    this.points = generateTrigPoints(this.N, cx, cy, baseRadius);
  }

  /* ─── Events ─── */
  private bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      this.findHover(mx, my);
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hovered = null;
      this.onHover?.(null, 0, 0);
    });

    window.addEventListener('resize', () => this.resize());
  }

  private findHover(mx: number, my: number) {
    let closest: HoverTarget | null = null;
    let minDist = 20;

    for (const p of this.points) {
      const pos = this.getPointPosition(p);
      const dist = Math.hypot(pos.x - mx, pos.y - my);
      if (dist < minDist) {
        minDist = dist;
        closest = { point: p, screenX: pos.x, screenY: pos.y };
      }
    }

    this.hovered = closest;
    if (closest) {
      this.onHover?.(closest.point.profile, closest.screenX, closest.screenY);
    } else {
      this.onHover?.(null, 0, 0);
    }
  }

  private getPointPosition(p: TrigPoint): { x: number; y: number } {
    const cx = this.width / 2;
    const cy = this.height / 2;

    switch (this.options.viewMode) {
      case 'spiral': {
        const sp = spiralPoint(p.n, cx, cy);
        return { x: sp.x, y: sp.y };
      }
      case 'complex': {
        const scale = Math.min(this.width, this.height) * 0.35;
        const cp = complexPlanePoint(p.profile, cx, cy, scale);
        return { x: cp.x, y: cp.y };
      }
      default:
        return { x: p.x, y: p.y };
    }
  }

  /* ─── Render Loop ─── */
  start() {
    const loop = () => {
      this.phase += 0.003;
      this.render();
      this.animFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    cancelAnimationFrame(this.animFrame);
  }

  private render() {
    const { ctx, width, height } = this;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background grid
    this.drawGrid();

    // Divisor links
    if (this.options.showDivisorLinks) {
      this.drawDivisorLinks();
    }

    // Complex projection lines
    if (this.options.showComplexProjection && this.options.viewMode === 'circle') {
      this.drawComplexProjections();
    }

    // Points
    this.drawPoints();

    // Hover highlight
    if (this.hovered) {
      this.drawHoverHighlight(this.hovered);
    }
  }

  /* ─── Grid ─── */
  private drawGrid() {
    const { ctx, width, height } = this;
    const cx = width / 2;
    const cy = height / 2;

    // Concentric circles
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 0.5;
    const maxR = Math.min(width, height) * 0.45;
    for (let r = maxR / 5; r <= maxR; r += maxR / 5) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = COLORS.gridAxis;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Radial lines every 30°
    ctx.strokeStyle = COLORS.gridLine;
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + maxR * Math.cos(a), cy + maxR * Math.sin(a));
      ctx.stroke();
    }

    // Angle labels
    if (this.options.viewMode !== 'spiral') {
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = COLORS.textMuted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labels = ['0°', '30°', '60°', '90°', '120°', '150°', '180°', '210°', '240°', '270°', '300°', '330°'];
      const labelR = maxR + 18;
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI * 2) / 12 - Math.PI / 2;
        ctx.fillText(labels[i], cx + labelR * Math.cos(a), cy + labelR * Math.sin(a));
      }
    }
  }

  /* ─── Divisor Links ─── */
  private drawDivisorLinks() {
    const { ctx } = this;

    for (const p of this.points) {
      if (p.n <= 1) continue;
      const links = getDivisorLinks(p.n);
      const fromPos = this.getPointPosition(p);

      for (const link of links) {
        const target = this.points.find(q => q.n === link.to);
        if (!target) continue;
        const toPos = this.getPointPosition(target);

        ctx.strokeStyle = link.type === 'prime-factor' ? COLORS.linkPrime : COLORS.linkDivisor;
        ctx.lineWidth = link.type === 'prime-factor' ? 1.2 : 0.6;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(fromPos.x, fromPos.y);

        // Curved bezier for visual interest
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        const cx = this.width / 2;
        const cy = this.height / 2;
        const offsetX = (midX - cx) * 0.15;
        const offsetY = (midY - cy) * 0.15;

        ctx.quadraticCurveTo(midX + offsetX, midY + offsetY, toPos.x, toPos.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  /* ─── Complex Plane Projections ─── */
  private drawComplexProjections() {
    const { ctx, width, height } = this;
    const cx = width / 2;
    const cy = height / 2;

    for (const p of this.points) {
      if (!p.profile.isPrime) continue;
      const pos = this.getPointPosition(p);

      // Dashed line from center to point
      ctx.strokeStyle = `rgba(251,191,36,${0.08 + Math.sin(this.phase * 2 + p.n) * 0.04})`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Projection onto real axis
      ctx.strokeStyle = 'rgba(0,212,255,0.06)';
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x, cy);
      ctx.stroke();

      // Projection onto imaginary axis
      ctx.strokeStyle = 'rgba(139,92,246,0.06)';
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(cx, pos.y);
      ctx.stroke();
    }
  }

  /* ─── Points ─── */
  private drawPoints() {
    const { ctx } = this;

    for (const p of this.points) {
      const pos = this.getPointPosition(p);
      const isHovered = this.hovered?.point.n === p.n;

      // Determine color
      let color: string;
      if (this.options.showSpinColors) {
        color = p.profile.spin === 'up' ? COLORS.spinUp : COLORS.spinDown;
      } else if (p.n === 1) {
        color = COLORS.one;
      } else if (p.profile.isPrime) {
        color = COLORS.prime;
      } else {
        color = COLORS.composite;
      }

      const r = p.radius * (isHovered ? 1.6 : 1);

      // Glow for primes
      if (p.profile.isPrime && this.options.highlightPrimes) {
        const glowR = r + 6 + Math.sin(this.phase * 3 + p.n * 0.5) * 2;
        const grad = ctx.createRadialGradient(pos.x, pos.y, r * 0.5, pos.x, pos.y, glowR);
        grad.addColorStop(0, `${color}33`);
        grad.addColorStop(1, `${color}00`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node fill
      ctx.fillStyle = color;
      ctx.globalAlpha = isHovered ? 1 : 0.85;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright core
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Label
      if (this.options.showLabels && (r > 5 || isHovered || this.N <= 40)) {
        ctx.font = `${isHovered ? '11' : '9'}px "JetBrains Mono", monospace`;
        ctx.fillStyle = isHovered ? '#fff' : COLORS.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = isHovered ? 1 : 0.7;
        ctx.fillText(String(p.n), pos.x, pos.y - r - 7);
        ctx.globalAlpha = 1;
      }
    }
  }

  /* ─── Hover Highlight ─── */
  private drawHoverHighlight(target: HoverTarget) {
    const { ctx } = this;
    const pos = this.getPointPosition(target.point);
    const r = target.point.radius * 1.6;

    // Outer ring
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Show divisor connections highlighted
    if (target.point.n > 1) {
      const links = getDivisorLinks(target.point.n);
      for (const link of links) {
        const tp = this.points.find(q => q.n === link.to);
        if (!tp) continue;
        const toPos = this.getPointPosition(tp);

        ctx.strokeStyle = link.type === 'prime-factor'
          ? 'rgba(251,191,36,0.5)'
          : 'rgba(59,130,246,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(toPos.x, toPos.y);
        ctx.stroke();

        // Highlight target node
        ctx.fillStyle = link.type === 'prime-factor' ? COLORS.prime : COLORS.composite;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(toPos.x, toPos.y, tp.radius + 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Angle arc
    const cx = this.width / 2;
    const cy = this.height / 2;
    const arcR = 30;
    ctx.strokeStyle = 'rgba(0,212,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, arcR, -Math.PI / 2, target.point.angle - Math.PI / 2);
    ctx.stroke();
  }
}

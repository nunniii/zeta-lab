import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { getZetaInfo, evaluateZetaComplex, complexToRGB, ZetaInfo } from "../math/zeta";
import { MathView } from "./MathView";

interface RiemannZetaVisualizerProps {
  n: number;
}

export function RiemannZetaVisualizer({ n }: RiemannZetaVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zetaInfo: ZetaInfo = useMemo(() => getZetaInfo(n), [n]);

  // Viewport in complex plane s = sigma + i*t
  const [center, setCenter] = useState<{ sigma: number; t: number }>({
    sigma: Math.max(n, 1.5),
    t: 0,
  });
  const [zoom, setZoom] = useState<number>(1);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<{
    sigma: number;
    t: number;
    zetaRe: number;
    zetaIm: number;
    mod: number;
    argDeg: number;
  } | null>(null);

  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Update center when n changes
  useEffect(() => {
    setCenter({ sigma: Math.max(n, 1.5), t: 0 });
    setZoom(1);
    setHoveredPoint(null);
  }, [n]);

  // Canvas pixel dimensions
  const canvasWidth = 520;
  const canvasHeight = 380;

  // Complex plane bounds
  const spanSigma = 6 / zoom;
  const spanT = (spanSigma * canvasHeight) / canvasWidth;

  const minSigma = center.sigma - spanSigma / 2;
  const maxSigma = center.sigma + spanSigma / 2;
  const minT = center.t - spanT / 2;
  const maxT = center.t + spanT / 2;

  // Render Domain Coloring to Canvas
  const renderPlot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.createImageData(canvasWidth, canvasHeight);
    const data = imgData.data;

    const dSigma = (maxSigma - minSigma) / canvasWidth;
    const dT = (maxT - minT) / canvasHeight;

    let ptr = 0;
    for (let py = 0; py < canvasHeight; py++) {
      // Screen Y goes downwards, so imaginary part t goes downwards from maxT to minT
      const t = maxT - py * dT;

      for (let px = 0; px < canvasWidth; px++) {
        const sigma = minSigma + px * dSigma;

        const w = evaluateZetaComplex(sigma, t);
        const [r, g, b] = complexToRGB(w.re, w.im, showContours);

        data[ptr] = r;
        data[ptr + 1] = g;
        data[ptr + 2] = b;
        data[ptr + 3] = 255;
        ptr += 4;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Overlay Axes and Critical Line Re(s) = 0.5
    ctx.lineWidth = 1.5;

    // Real Axis t = 0
    if (minT <= 0 && maxT >= 0) {
      const axisY = ((maxT - 0) / (maxT - minT)) * canvasHeight;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, axisY);
      ctx.lineTo(canvasWidth, axisY);
      ctx.stroke();
    }

    // Critical Line Re(s) = 0.5 (Hypothesis of Riemann)
    if (minSigma <= 0.5 && maxSigma >= 0.5) {
      const critX = ((0.5 - minSigma) / (maxSigma - minSigma)) * canvasWidth;
      ctx.strokeStyle = "rgba(236, 72, 153, 0.65)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(critX, 0);
      ctx.lineTo(critX, canvasHeight);
      ctx.stroke();
    }

    // Pole Marker at s = 1 + 0i
    if (minSigma <= 1 && maxSigma >= 1 && minT <= 0 && maxT >= 0) {
      const poleX = ((1 - minSigma) / (maxSigma - minSigma)) * canvasWidth;
      const poleY = ((maxT - 0) / (maxT - minT)) * canvasHeight;
      ctx.setLineDash([]);
      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(poleX, poleY, 3.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    // Target Marker for s = n + 0i
    if (minSigma <= n && maxSigma >= n && minT <= 0 && maxT >= 0) {
      const targetX = ((n - minSigma) / (maxSigma - minSigma)) * canvasWidth;
      const targetY = ((maxT - 0) / (maxT - minT)) * canvasHeight;

      ctx.setLineDash([]);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 8, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(targetX, targetY, 3.5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [canvasWidth, canvasHeight, minSigma, maxSigma, minT, maxT, showContours, n]);

  useEffect(() => {
    renderPlot();
  }, [renderPlot]);

  // Coordinate Conversion Helpers
  function screenToComplex(sx: number, sy: number) {
    const sigma = minSigma + (sx / canvasWidth) * (maxSigma - minSigma);
    const t = maxT - (sy / canvasHeight) * (maxT - minT);
    return { sigma, t };
  }

  function handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * canvasWidth;
    const sy = ((e.clientY - rect.top) / rect.height) * canvasHeight;

    const mouseComplex = screenToComplex(sx, sy);
    const factor = e.deltaY < 0 ? 1.25 : 1 / 1.25;
    const newZoom = Math.max(0.2, Math.min(100, zoom * factor));

    // Keep mouse point stationary in screen coordinates
    const newSpanSigma = 6 / newZoom;
    const newSpanT = (newSpanSigma * canvasHeight) / canvasWidth;

    const ratioX = sx / canvasWidth;
    const ratioY = sy / canvasHeight;

    const newCenterSigma = mouseComplex.sigma + (0.5 - ratioX) * newSpanSigma;
    const newCenterT = mouseComplex.t + (ratioY - 0.5) * newSpanT;

    setZoom(newZoom);
    setCenter({ sigma: newCenterSigma, t: newCenterT });
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * canvasWidth;
    const sy = ((e.clientY - rect.top) / rect.height) * canvasHeight;

    const { sigma, t } = screenToComplex(sx, sy);
    const w = evaluateZetaComplex(sigma, t);
    const mod = Math.sqrt(w.re * w.re + w.im * w.im);
    let argDeg = (Math.atan2(w.im, w.re) * 180) / Math.PI;
    if (argDeg < 0) argDeg += 360;

    setHoveredPoint({
      sigma,
      t,
      zetaRe: w.re,
      zetaIm: w.im,
      mod,
      argDeg,
    });

    if (!dragging.current) return;

    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;

    const dSigma = (dx / rect.width) * spanSigma;
    const dT = (dy / rect.height) * spanT;

    setCenter((prev) => ({
      sigma: prev.sigma - dSigma,
      t: prev.t + dT,
    }));

    lastMouse.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseUp() {
    dragging.current = false;
  }

  // Preset Navigation Views
  function focusOnN() {
    setCenter({ sigma: Math.max(n, 1.5), t: 0 });
    setZoom(1.5);
  }

  function focusOnCriticalZeros() {
    // Focus around the famous first non-trivial zeros t ~ 14.13, 21.02, 25.01
    setCenter({ sigma: 0.5, t: 20 });
    setZoom(0.7);
  }

  function focusOnPole() {
    setCenter({ sigma: 1, t: 0 });
    setZoom(2.5);
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 font-mono">
            <span className="text-cyan-400 text-lg">ζ(s)</span>
            <span>Função Zeta de Riemann & Domain Coloring</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40">
              s = n = {n}
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Valor exato de <span className="font-mono text-zinc-200">ζ({n})</span> e mapeamento
            conforme por coloração de domínio no plano complexo <span className="font-mono text-zinc-200">s = σ + it</span>.
          </p>
        </div>

        {/* Exact Value Top Badge */}
        <div className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/30 text-xs font-mono">
          <span className="text-zinc-400 mr-2">ζ({n}) =</span>
          <span className="text-cyan-300 font-bold text-sm">{zetaInfo.exactFormula}</span>
          {!zetaInfo.isPole && (
            <span className="text-zinc-400 ml-2">≈ {zetaInfo.decimalValue.toFixed(8)}</span>
          )}
        </div>
      </div>

      {/* Preset Buttons & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-zinc-500 text-[11px] uppercase tracking-wider mr-1">Regiões:</span>
          <button
            type="button"
            onClick={focusOnN}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-500/30 transition cursor-pointer flex items-center gap-1"
          >
            <span>🎯</span>
            <span>Focar em s = {n}</span>
          </button>

          <button
            type="button"
            onClick={focusOnCriticalZeros}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-pink-300 border border-pink-500/30 transition cursor-pointer flex items-center gap-1"
            title="Visualizar a reta crítica Re(s) = 1/2 e os zeros não triviais de Riemann"
          >
            <span>⚡</span>
            <span>Zeros Críticos (Re = 0.5)</span>
          </button>

          <button
            type="button"
            onClick={focusOnPole}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 transition cursor-pointer flex items-center gap-1"
            title="Visualizar o polo simples em s = 1"
          >
            <span>💥</span>
            <span>Polo em s = 1</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 select-none">
            <input
              type="checkbox"
              checked={showContours}
              onChange={(e) => setShowContours(e.target.checked)}
              className="rounded accent-cyan-500 cursor-pointer"
            />
            <span>Contornos e Anéis de Módulo</span>
          </label>
        </div>
      </div>

      {/* Main Grid: Canvas on Left, Math Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(330px,0.8fr)] gap-4 items-start">
        {/* Domain Coloring Canvas Viewport */}
        <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-[#00041a] shadow-xl select-none">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="w-full h-[380px] block cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* Floating Zoom & Preset Controls */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-lg border border-zinc-700/60 font-mono text-xs text-zinc-300 shadow">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(100, z * 1.3))}
              className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
              title="Aumentar Zoom"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.2, z / 1.3))}
              className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
              title="Diminuir Zoom"
            >
              -
            </button>
            <span className="px-2 text-[11px] text-zinc-400 font-bold border-l border-zinc-700">
              {zoom.toFixed(2)}×
            </span>
          </div>

          {/* Legend Overlay at Top Left */}
          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md p-2 rounded-lg border border-zinc-700/60 font-mono text-[10px] space-y-1 text-zinc-300 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-white"></span>
              <span className="font-bold text-cyan-300">Ponto s = {n}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-pink-400"></span>
              <span className="text-pink-300">Reta Crítica Re(s) = 0.5</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span className="text-zinc-300">Polo em s = 1</span>
            </div>
          </div>

          {/* Mouse Hover Coordinates Tooltip */}
          {hoveredPoint && (
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur border border-cyan-500/40 font-mono text-xs text-zinc-200 shadow-md">
              <span className="text-cyan-300 font-bold">
                s = {hoveredPoint.sigma.toFixed(3)} {hoveredPoint.t >= 0 ? "+" : "-"} {Math.abs(hoveredPoint.t).toFixed(3)}i
              </span>
              <span className="text-zinc-500 mx-1.5">•</span>
              <span className="text-zinc-300">
                |ζ(s)| = {hoveredPoint.mod > 999 ? "∞" : hoveredPoint.mod.toFixed(3)}
              </span>
              <span className="text-zinc-500 mx-1.5">•</span>
              <span className="text-amber-300">
                fase = {hoveredPoint.argDeg.toFixed(1)}°
              </span>
            </div>
          )}

          {/* Color Wheel Bar at Bottom */}
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-400 py-1 px-3 border-t border-zinc-800 bg-black/60">
            <span>Fase (arg): 0° (Vermelho) → 90° (Verde) → 180° (Ciano) → 270° (Azul)</span>
            <span>Zeros = Vórtices Arco-íris</span>
          </div>
        </div>

        {/* Exact Mathematical Properties Panel for Zeta */}
        <div className="space-y-3 font-mono text-xs">
          {/* Valor Exato em Destaque */}
          <div className="p-3.5 rounded-xl bg-gradient-to-tr from-cyan-950/40 via-blue-950/30 to-purple-950/30 border border-cyan-500/40 space-y-2">
            <span className="text-[11px] text-cyan-300 uppercase tracking-wider font-bold block">
              Valor Exato de ζ({n})
            </span>
            <div className="py-1 px-2 rounded bg-black/40 border border-cyan-500/20 text-center overflow-x-auto">
              <MathView
                math={zetaInfo.latexFormula}
                display={true}
                className="text-white text-base font-bold"
              />
            </div>
            <div className="text-xs text-zinc-300 pt-1 border-t border-cyan-500/20">
              <span className="text-zinc-400">Expansão Decimal: </span>
              <span className="text-amber-300 font-semibold select-all">
                {zetaInfo.decimalString}
              </span>
            </div>
          </div>

          {/* Produto de Euler (Conexão Primos) */}
          <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30 space-y-1.5">
            <span className="text-zinc-300 font-bold text-[11px] uppercase tracking-wider block border-b border-zinc-700/40 pb-1">
              Produto Euleriano sobre Primos (Identidade de Euler)
            </span>
            <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
              A função zeta codifica todos os números primos através do produto infinito:
            </p>
            <div className="p-2 rounded bg-black/50 border border-zinc-800 text-cyan-300 font-bold text-center text-xs overflow-x-auto">
              <MathView
                math={zetaInfo.eulerProductLatex}
                display={true}
                className="text-cyan-300 text-xs font-bold"
              />
            </div>
            <div className="pt-0.5 text-center overflow-x-auto">
              <MathView
                math={zetaInfo.eulerExpansionLatex}
                display={true}
                className="text-rose-300 text-[11px]"
              />
            </div>
          </div>

          {/* Série de Dirichlet */}
          <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30 space-y-1.5">
            <span className="text-zinc-300 font-bold text-[11px] uppercase tracking-wider block border-b border-zinc-700/40 pb-1">
              Série de Dirichlet Canônica
            </span>
            <div className="p-2 rounded bg-black/50 border border-zinc-800 text-amber-300 font-bold text-center text-xs overflow-x-auto">
              <MathView
                math={zetaInfo.seriesLatex}
                display={true}
                className="text-amber-300 text-xs font-bold"
              />
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
              {zetaInfo.description}
            </p>
          </div>

          {/* Hipótese de Riemann Context */}
          <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30 space-y-1 text-[11px] text-zinc-300">
            <span className="text-pink-300 font-bold uppercase tracking-wider block text-[10px]">
              A Hipótese de Riemann (1859)
            </span>
            <p className="text-zinc-400 leading-relaxed">
              Todos os zeros não triviais de ζ(s) situam-se estritamente na reta crítica{" "}
              <strong className="text-pink-300">Re(s) = 1/2</strong>. No gráfico de domain coloring
              ao lado, eles aparecem como os pontos focais de convergência de todas as cores do arco-íris!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { getZetaInfo, evaluateZetaComplex, complexToRGB, ZetaInfo } from "../math/zeta";
import { MathView } from "./MathView";

interface RiemannZetaFloatingWindowProps {
  n: number;
  onClose: () => void;
  onChangeN?: (newN: number) => void;
}

export function RiemannZetaFloatingWindow({
  n,
  onClose,
  onChangeN,
}: RiemannZetaFloatingWindowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const zetaInfo: ZetaInfo = useMemo(() => getZetaInfo(n), [n]);

  // Window position (draggable)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingWindow = useRef(false);
  const dragWindowStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  // Complex plane bounds s = sigma + i*t
  const [center, setCenter] = useState<{ sigma: number; t: number }>({
    sigma: Math.max(n, 1.5),
    t: 0,
  });
  const [zoom, setZoom] = useState<number>(1);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [isHighQuality, setIsHighQuality] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    sigma: number;
    t: number;
    zetaRe: number;
    zetaIm: number;
    mod: number;
    argDeg: number;
  } | null>(null);

  const isDraggingCanvas = useRef(false);
  const lastCanvasMouse = useRef({ x: 0, y: 0 });

  // Dimensions of canvas
  const canvasWidth = 460;
  const canvasHeight = 290;

  // Sync center when n changes
  useEffect(() => {
    setCenter({ sigma: Math.max(n, 1.5), t: 0 });
    setHoveredPoint(null);
  }, [n]);

  // Complex plane span
  const spanSigma = 6 / zoom;
  const spanT = (spanSigma * canvasHeight) / canvasWidth;

  const minSigma = center.sigma - spanSigma / 2;
  const maxSigma = center.sigma + spanSigma / 2;
  const minT = center.t - spanT / 2;
  const maxT = center.t + spanT / 2;

  // Render plot
  const renderPlot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.createImageData(canvasWidth, canvasHeight);
    const data = imgData.data;

    const step = isHighQuality ? 1 : 1; // High performance evaluation
    const dSigma = (maxSigma - minSigma) / canvasWidth;
    const dT = (maxT - minT) / canvasHeight;

    let ptr = 0;
    for (let py = 0; py < canvasHeight; py += step) {
      const t = maxT - py * dT;
      for (let px = 0; px < canvasWidth; px += step) {
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

    // Critical Line Re(s) = 0.5
    if (minSigma <= 0.5 && maxSigma >= 0.5) {
      const critX = ((0.5 - minSigma) / (maxSigma - minSigma)) * canvasWidth;
      ctx.strokeStyle = "rgba(236, 72, 153, 0.75)";
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
      ctx.arc(targetX, targetY, 7, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(targetX, targetY, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [canvasWidth, canvasHeight, minSigma, maxSigma, minT, maxT, showContours, isHighQuality, n]);

  useEffect(() => {
    if (!isMinimized) {
      const frame = requestAnimationFrame(renderPlot);
      return () => cancelAnimationFrame(frame);
    }
  }, [renderPlot, isMinimized]);

  // Handle window dragging
  const handleWindowHeaderMouseDown = (e: React.MouseEvent) => {
    // Ignore clicks on buttons or inputs
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) {
      return;
    }
    isDraggingWindow.current = true;
    const currentX = position ? position.x : Math.max(16, window.innerWidth - 490);
    const currentY = position ? position.y : Math.max(70, window.innerHeight - 530);

    dragWindowStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: currentX,
      posY: currentY,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingWindow.current) return;
      const dx = moveEvent.clientX - dragWindowStart.current.mouseX;
      const dy = moveEvent.clientY - dragWindowStart.current.mouseY;

      const newX = Math.max(10, Math.min(window.innerWidth - 300, dragWindowStart.current.posX + dx));
      const newY = Math.max(60, Math.min(window.innerHeight - 80, dragWindowStart.current.posY + dy));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingWindow.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Canvas interactions
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

    const newSpanSigma = 6 / newZoom;
    const newSpanT = (newSpanSigma * canvasHeight) / canvasWidth;

    const ratioX = sx / canvasWidth;
    const ratioY = sy / canvasHeight;

    const newCenterSigma = mouseComplex.sigma + (0.5 - ratioX) * newSpanSigma;
    const newCenterT = mouseComplex.t + (ratioY - 0.5) * newSpanT;

    setZoom(newZoom);
    setCenter({ sigma: newCenterSigma, t: newCenterT });
  }

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    isDraggingCanvas.current = true;
    lastCanvasMouse.current = { x: e.clientX, y: e.clientY };
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
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

    if (!isDraggingCanvas.current) return;

    const dx = e.clientX - lastCanvasMouse.current.x;
    const dy = e.clientY - lastCanvasMouse.current.y;

    const dSigma = (dx / rect.width) * spanSigma;
    const dT = (dy / rect.height) * spanT;

    setCenter((prev) => ({
      sigma: prev.sigma - dSigma,
      t: prev.t + dT,
    }));

    lastCanvasMouse.current = { x: e.clientX, y: e.clientY };
  }

  function handleCanvasMouseUp() {
    isDraggingCanvas.current = false;
  }

  // Presets
  const focusOnN = () => {
    setCenter({ sigma: Math.max(n, 1.5), t: 0 });
    setZoom(1.5);
  };

  const focusOnCriticalZeros = () => {
    setCenter({ sigma: 0.5, t: 20 });
    setZoom(0.7);
  };

  const focusOnPole = () => {
    setCenter({ sigma: 1, t: 0 });
    setZoom(2.5);
  };

  const defaultStyle: React.CSSProperties = position
    ? { top: `${position.y}px`, left: `${position.x}px` }
    : { bottom: "24px", right: "24px" };

  return (
    <aside
      aria-label="Janela Flutuante da Função Zeta de Riemann"
      className="fixed z-50 transition-shadow select-none"
      style={defaultStyle}
    >
      <div className="bg-zinc-950/95 border-2 border-cyan-500/50 rounded-2xl shadow-2xl backdrop-blur-xl w-[480px] max-w-[95vw] overflow-hidden flex flex-col font-mono text-xs">
        {/* =====================================================
            HEADER (DRAGGABLE)
            ===================================================== */}
        <div
          onMouseDown={handleWindowHeaderMouseDown}
          className="px-3.5 py-2.5 bg-gradient-to-r from-cyan-950/80 via-zinc-900 to-blue-950/80 border-b border-cyan-500/30 flex items-center justify-between cursor-move"
          title="Arraste para mover esta janela na tela"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
              <span>ζ(s)</span>
              <span>Domain Coloring</span>
            </span>

            {/* Quick n Selector */}
            <div className="flex items-center gap-1 ml-2 bg-black/50 px-2 py-0.5 rounded border border-zinc-700/60">
              <span className="text-zinc-400 text-[11px]">n =</span>
              <button
                type="button"
                onClick={() => onChangeN && onChangeN(Math.max(1, n - 1))}
                className="text-zinc-400 hover:text-white px-1 font-bold cursor-pointer"
                title="Diminuir n"
              >
                ◀
              </button>
              <span className="text-cyan-200 font-bold px-1">{n}</span>
              <button
                type="button"
                onClick={() => onChangeN && onChangeN(n + 1)}
                className="text-zinc-400 hover:text-white px-1 font-bold cursor-pointer"
                title="Aumentar n"
              >
                ▶
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Minimize / Expand */}
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs transition cursor-pointer"
              title={isMinimized ? "Expandir Janela" : "Minimizar Janela"}
            >
              {isMinimized ? "□" : "–"}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded bg-zinc-800 hover:bg-rose-700 hover:text-white text-zinc-300 flex items-center justify-center text-xs transition cursor-pointer"
              title="Fechar Janela Flutuante"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Minimized Bar Preview */}
        {isMinimized ? (
          <div className="p-3 bg-zinc-900/90 flex items-center justify-between text-xs">
            <div className="text-zinc-300">
              <span>ζ({n}) = </span>
              <span className="text-cyan-300 font-bold">{zetaInfo.exactFormula}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition cursor-pointer"
            >
              Restaurar Gráfico ↗
            </button>
          </div>
        ) : (
          /* =====================================================
              EXPANDED BODY: CANVAS & CONTROLS
              ===================================================== */
          <div className="p-3 space-y-2.5 bg-zinc-900/50">
            {/* Quick Presets & Zoom Info */}
            <div className="flex items-center justify-between gap-1 flex-wrap text-[11px]">
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={focusOnN}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
                  title="Focar no ponto s = n"
                >
                  🎯 s = {n}
                </button>
                <button
                  type="button"
                  onClick={focusOnCriticalZeros}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-pink-300 border border-pink-500/30 transition cursor-pointer"
                  title="Reta Crítica Re(s)=0.5 & Zeros de Riemann"
                >
                  ⚡ Zeros Críticos
                </button>
                <button
                  type="button"
                  onClick={focusOnPole}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 transition cursor-pointer"
                  title="Polo Simples em s = 1"
                >
                  💥 Polo s = 1
                </button>
              </div>

              <div className="flex items-center gap-2 text-zinc-400">
                <label className="flex items-center gap-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showContours}
                    onChange={(e) => setShowContours(e.target.checked)}
                    className="rounded accent-cyan-500 cursor-pointer"
                  />
                  <span>Anéis</span>
                </label>
              </div>
            </div>

            {/* Canvas Viewport */}
            <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-[#00041a] shadow-inner">
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="w-full h-[230px] block cursor-grab active:cursor-grabbing"
                onWheel={handleWheel}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />

              {/* Zoom buttons top right */}
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur p-0.5 rounded-lg border border-zinc-700/60 font-mono text-xs text-zinc-300 shadow">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(100, z * 1.3))}
                  className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer font-bold"
                  title="Zoom +"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.2, z / 1.3))}
                  className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer font-bold"
                  title="Zoom -"
                >
                  -
                </button>
                <span className="px-1 text-[10px] text-zinc-400 font-bold border-l border-zinc-700">
                  {zoom.toFixed(1)}×
                </span>
              </div>

              {/* Legend Badges top left */}
              <div className="absolute top-2 left-2 bg-black/85 backdrop-blur p-1.5 rounded-lg border border-zinc-700/60 font-mono text-[9px] space-y-0.5 text-zinc-300 pointer-events-none">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 border border-white" />
                  <span className="text-cyan-300 font-bold">s = {n}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-pink-400" />
                  <span className="text-pink-300">Re(s) = 0.5</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span className="text-zinc-300">Polo s = 1</span>
                </div>
              </div>

              {/* Hover Coordinates tooltip */}
              {hoveredPoint && (
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/90 backdrop-blur border border-cyan-500/40 font-mono text-[10px] text-zinc-200 shadow-md">
                  <span className="text-cyan-300 font-bold">
                    s = {hoveredPoint.sigma.toFixed(2)}{" "}
                    {hoveredPoint.t >= 0 ? "+" : "-"} {Math.abs(hoveredPoint.t).toFixed(2)}i
                  </span>
                  <span className="text-zinc-500 mx-1">•</span>
                  <span className="text-zinc-300">
                    |ζ| = {hoveredPoint.mod > 999 ? "∞" : hoveredPoint.mod.toFixed(2)}
                  </span>
                  <span className="text-zinc-500 mx-1">•</span>
                  <span className="text-amber-300">{hoveredPoint.argDeg.toFixed(0)}°</span>
                </div>
              )}
            </div>

            {/* Exact Zeta Formula Bar */}
            <div className="p-2 rounded-lg bg-black/50 border border-zinc-800 flex items-center justify-between text-[11px] gap-2">
              <span className="text-zinc-400 shrink-0">Valor em s = {n}:</span>
              <div className="text-right flex items-center gap-1.5 overflow-x-auto justify-end">
                <MathView
                  math={zetaInfo.latexFormula}
                  className="text-cyan-300 font-semibold"
                />
                {!zetaInfo.isPole && (
                  <span className="text-zinc-400 text-[10px] shrink-0">(≈ {zetaInfo.decimalValue.toFixed(6)})</span>
                )}
              </div>
            </div>

            {/* Mini Footer / Helper */}
            <div className="text-[10px] text-zinc-500 flex items-center justify-between px-1">
              <span>Arraste o gráfico para navegar • Roda do mouse para zoom</span>
              <span className="text-zinc-400">Arraste pela barra superior</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

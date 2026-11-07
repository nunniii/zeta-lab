import { useEffect, useRef, useState } from "react";
import { Renderer, type ViewMode } from "../render/canvas";
import { type NumberProfile, isPrime } from "../math/engine";
import { NumberDetailsOverlay } from "./NumberDetailsOverlay";


const MAX_N = 10000;
export function TrigSpinMode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  const [n, setN] = useState(60);
  const [viewMode, setViewMode] = useState<ViewMode>("circle");
  const [showDivisorLinks, setShowDivisorLinks] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showSpinColors, setShowSpinColors] = useState(false);
  const [showComplexProjection, setShowComplexProjection] = useState(true);
  const [highlightPrimes, setHighlightPrimes] = useState(true);

  const [hoveredProfile, setHoveredProfile] = useState<NumberProfile | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new Renderer(canvas);
    rendererRef.current = renderer;
    renderer.setN(n);

    renderer.onHover = (profile) => {
      setHoveredProfile(profile);
    };

    // Click on canvas to open overlay
    function handleClick() {
      if (rendererRef.current) {
        // If hovered, select it
        if (hoveredProfile) {
          setSelectedNumber(hoveredProfile.n);
        }
      }
    }
    canvas.addEventListener("click", handleClick);

    renderer.start();

    return () => {
      canvas.removeEventListener("click", handleClick);
      renderer.stop();
    };
  }, []);

  // Sync state changes with renderer
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setN(n);
    }
  }, [n]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.options.viewMode = viewMode;
      rendererRef.current.options.showDivisorLinks = showDivisorLinks;
      rendererRef.current.options.showLabels = showLabels;
      rendererRef.current.options.showSpinColors = showSpinColors;
      rendererRef.current.options.showComplexProjection = showComplexProjection;
      rendererRef.current.options.highlightPrimes = highlightPrimes;
    }
  }, [viewMode, showDivisorLinks, showLabels, showSpinColors, showComplexProjection, highlightPrimes]);

  // Prime statistics
  let primeCount = 0;
  for (let i = 2; i <= n; i++) {
    if (isPrime(i)) primeCount++;
  }
  const density = ((primeCount / n) * 100).toFixed(1);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Side Panel */}
      <aside className="w-80 shrink-0 bg-zinc-950/80 border-r border-zinc-800/80 flex flex-col overflow-y-auto">
        {/* N input */}
        <div className="p-4 border-b border-zinc-800/60">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
            Quantidade de Números (N)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={n}
              onChange={(e) =>
    setN(
      Math.max(
        2,
        Math.min(MAX_N, parseInt(e.target.value) || 2)
      )
    )
  }
              className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 font-mono text-base font-bold text-white outline-none focus:border-cyan-500"
              min="2"
              max={MAX_N}
            />
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setN((prev) => Math.min(MAX_N, prev + 1))}
                className="w-7 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center transition cursor-pointer"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => setN((prev) => Math.max(2, prev - 1))}
                className="w-7 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center transition cursor-pointer"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* View Mode */}
        <div className="p-4 border-b border-zinc-800/60">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
            Modo de Visualização
          </label>
          <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setViewMode("circle")}
              className={`py-1.5 rounded transition cursor-pointer ${
                viewMode === "circle" ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40" : "text-zinc-400 hover:text-white"
              }`}
            >
              Círculo
            </button>
            <button
              type="button"
              onClick={() => setViewMode("spiral")}
              className={`py-1.5 rounded transition cursor-pointer ${
                viewMode === "spiral" ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40" : "text-zinc-400 hover:text-white"
              }`}
            >
              Espiral
            </button>
            <button
              type="button"
              onClick={() => setViewMode("complex")}
              className={`py-1.5 rounded transition cursor-pointer ${
                viewMode === "complex" ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40" : "text-zinc-400 hover:text-white"
              }`}
            >
              Complexo
            </button>
          </div>
        </div>

        {/* Camadas Toggles */}
        <div className="p-4 border-b border-zinc-800/60 space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-medium">
            Camadas Matemáticas
          </label>

          <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer p-2 rounded-lg hover:bg-zinc-900 transition">
            <span>Conexões de Divisores</span>
            <input
              type="checkbox"
              checked={showDivisorLinks}
              onChange={(e) => setShowDivisorLinks(e.target.checked)}
              className="accent-cyan-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer p-2 rounded-lg hover:bg-zinc-900 transition">
            <span>Rótulos Numéricos</span>
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="accent-cyan-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer p-2 rounded-lg hover:bg-zinc-900 transition">
            <span>Spin / Paridade (Up/Down)</span>
            <input
              type="checkbox"
              checked={showSpinColors}
              onChange={(e) => setShowSpinColors(e.target.checked)}
              className="accent-cyan-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer p-2 rounded-lg hover:bg-zinc-900 transition">
            <span>Projeções Complexas</span>
            <input
              type="checkbox"
              checked={showComplexProjection}
              onChange={(e) => setShowComplexProjection(e.target.checked)}
              className="accent-cyan-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer p-2 rounded-lg hover:bg-zinc-900 transition">
            <span>Glow Dourado em Primos</span>
            <input
              type="checkbox"
              checked={highlightPrimes}
              onChange={(e) => setHighlightPrimes(e.target.checked)}
              className="accent-cyan-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Hovered Number Card */}
        {hoveredProfile ? (
          <div className="p-4 border-b border-zinc-800/60 bg-zinc-900/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">
                Em Foco: n = {hoveredProfile.n}
              </span>
              <button
                type="button"
                onClick={() => setSelectedNumber(hoveredProfile.n)}
                className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded hover:bg-cyan-900/60 transition cursor-pointer"
              >
                Abrir Geometria ➔
              </button>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Tipo:</span>
                <span className={hoveredProfile.isPrime ? "text-amber-400 font-bold" : "text-blue-400"}>
                  {hoveredProfile.isPrime ? "Número Primo" : "Composto"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">z = e^(iθ):</span>
                <span className="text-purple-300">
                  {hoveredProfile.complex.re.toFixed(3)} + {hoveredProfile.complex.im.toFixed(3)}i
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Divisores |D|:</span>
                <span className="text-zinc-200">{hoveredProfile.divisorCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Euler φ(n):</span>
                <span className="text-cyan-300">{hoveredProfile.totient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Spin:</span>
                <span className={hoveredProfile.spin === "up" ? "text-cyan-400" : "text-pink-400"}>
                  {hoveredProfile.spin === "up" ? "↑ Up (ímpar)" : "↓ Down (par)"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-zinc-800/60 text-xs text-zinc-500 italic">
            Passe o mouse sobre os nós no gráfico para ver detalhes e clique para abrir a análise completa.
          </div>
        )}

        {/* Estatísticas */}
        <div className="p-4 space-y-2 mt-auto">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-medium">
            Estatísticas Globais
          </label>
          <div className="bg-zinc-900/70 p-2.5 rounded-lg border border-zinc-800 text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-500">Primos até {n}:</span>
              <span className="text-amber-400 font-bold">{primeCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Densidade:</span>
              <span className="text-zinc-300">{density}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Teor. PNT N/ln(N):</span>
              <span className="text-cyan-400">{(n / Math.log(n)).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-[#0a0a0f]">
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

        {/* Canvas HUD */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur border border-zinc-800 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-zinc-400">N:</span>
            <span className="text-white font-bold ml-auto">{n}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur border border-zinc-800 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-zinc-400">Primos:</span>
            <span className="text-amber-300 font-bold ml-auto">{primeCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur border border-zinc-800 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span className="text-zinc-400">Modo:</span>
            <span className="text-purple-300 font-bold ml-auto capitalize">{viewMode}</span>
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-4 px-3.5 py-2 rounded-xl bg-zinc-900/80 backdrop-blur border border-zinc-800 flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow"></span>
            <span className="text-zinc-300">Primo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-zinc-300">Composto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-amber-400/60"></span>
            <span className="text-zinc-400">Fator Primo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-blue-500/40"></span>
            <span className="text-zinc-400">Divisor Próprio</span>
          </div>
        </div>
      </div>

      {/* Selected Number Details Modal */}
      {selectedNumber !== null && (
        <NumberDetailsOverlay
          n={selectedNumber}
          onClose={() => setSelectedNumber(null)}
        />
      )}
    </div>
  );
}

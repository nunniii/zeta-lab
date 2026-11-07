import { useState, useMemo } from "react";
import { getDivisorTriangleData, DivisorTriangleData } from "../math/divisor";

interface PairTriangleVisualizerProps {
  n: number;
  pares: [number, number][];
  initialPairIndex?: number;
}

const COLORS = [
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#a855f7", // purple
  "#10b981", // emerald
  "#ec4899", // pink
  "#3b82f6", // blue
  "#eab308", // yellow
  "#14b8a6", // teal
];

export function PairTriangleVisualizer({
  n,
  pares,
  initialPairIndex = 0,
}: PairTriangleVisualizerProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(initialPairIndex);

  // Compute all triangle datasets
  const allTriangles: DivisorTriangleData[] = useMemo(() => {
    return pares.map(([a, b]) => getDivisorTriangleData(a, b));
  }, [pares]);

  const activeTriangle = allTriangles[selectedIdx] || allTriangles[0];

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
            <span>📐</span>
            <span>Relações Métricas & Trigonométricas dos Pares Divisores</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40">
              n = {n}
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cada par divisor <span className="font-mono text-zinc-200">[a, b]</span> com{" "}
            <span className="font-mono text-zinc-200">a·b = {n}</span> define os catetos e a hipotenusa de mesma área.
          </p>
        </div>

        {/* Invariance Badge */}
        <div className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium">
          Área Constante: A = n / 2 ={" "}
          <span className="font-bold text-amber-200">{(n / 2).toFixed(1)}</span>
        </div>
      </div>

      {/* Pair Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-zinc-500 text-[11px] uppercase tracking-wider shrink-0 mr-1">
          Pares Divisores:
        </span>
        {pares.map(([a, b], idx) => {
          const tri = allTriangles[idx];
          const isSelected = selectedIdx === idx;
          const color = COLORS[idx % COLORS.length];

          return (
            <button
              key={`${a}-${b}`}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-2 shrink-0 border ${
                isSelected
                  ? "bg-zinc-800 text-white font-bold border-cyan-500/70 shadow-md ring-1 ring-cyan-500/30"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span>
                [{a}, {b}]
              </span>
              {tri.isPythagorean && (
                <span
                  className="text-[10px] text-amber-400 font-bold"
                  title="Terno Pitagórico Inteiro"
                >
                  ★
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Highlighted Square on Left, Trig Matrix on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)] gap-4 items-stretch">
        {/* ========================================================= */}
        {/* QUADRADO DESTACADO: CATETO ADJACENTE, OPOSTO E HIPOTENUSA */}
        {/* ========================================================= */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#020b24] via-zinc-900/90 to-[#0c0524] border-2 border-cyan-500/40 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-700/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-cyan-300">
                Quadrado Métrico do Par Divisor [{activeTriangle.a}, {activeTriangle.b}]
              </span>
            </div>
            {activeTriangle.isPythagorean && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/40 font-bold">
                ★ Terno Pitagórico: ({activeTriangle.a}, {activeTriangle.b}, {activeTriangle.pythagoreanK})
              </span>
            )}
          </div>

          {/* Cards dos 3 Lados empilhados um debaixo do outro */}
          <div className="flex flex-col gap-2.5">
            {/* Cateto Adjacente */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between gap-3 hover:bg-cyan-950/40 transition">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold font-mono text-lg flex items-center justify-center shrink-0 shadow-sm">
                  a
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono font-semibold block">
                    Cateto Adjacente (Base)
                  </span>
                  <div className="text-xl font-extrabold font-mono text-cyan-300 flex items-center gap-2">
                    <span>a = {activeTriangle.a}</span>
                    <span className="text-xs text-zinc-400 font-normal">• Eixo Real (X)</span>
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-zinc-400 shrink-0">
                <span className="block text-[10px] uppercase text-zinc-500">Quadrado</span>
                <span className="text-cyan-200 font-bold">a² = {activeTriangle.a * activeTriangle.a}</span>
              </div>
            </div>

            {/* Cateto Oposto */}
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between gap-3 hover:bg-amber-950/40 transition">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold font-mono text-lg flex items-center justify-center shrink-0 shadow-sm">
                  b
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 font-mono font-semibold block">
                    Cateto Oposto (Altura)
                  </span>
                  <div className="text-xl font-extrabold font-mono text-amber-300 flex items-center gap-2">
                    <span>b = {activeTriangle.b}</span>
                    <span className="text-xs text-zinc-400 font-normal">• Eixo Imaginário (Y)</span>
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-zinc-400 shrink-0">
                <span className="block text-[10px] uppercase text-zinc-500">Quadrado</span>
                <span className="text-amber-200 font-bold">b² = {activeTriangle.b * activeTriangle.b}</span>
              </div>
            </div>

            {/* Hipotenusa */}
            <div className="p-3.5 rounded-xl bg-pink-950/30 border border-pink-500/40 flex items-center justify-between gap-3 hover:bg-pink-950/40 transition">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 font-bold font-mono text-lg flex items-center justify-center shrink-0 shadow-sm">
                  h
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-pink-400 font-mono font-semibold block">
                    Hipotenusa (Raio Euclidiano r)
                  </span>
                  <div className="text-xl font-extrabold font-mono text-pink-300 flex items-center gap-2">
                    <span>h = {activeTriangle.hypotenuseStr}</span>
                    <span className="text-xs text-zinc-400 font-normal">(≈ {activeTriangle.hypotenuse.toFixed(2)})</span>
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-zinc-400 shrink-0">
                <span className="block text-[10px] uppercase text-zinc-500">Raio ao Quadrado</span>
                <span className="text-pink-200 font-bold">h² = r² = {activeTriangle.r2}</span>
              </div>
            </div>
          </div>

          {/* Relações Algébricas Centrais */}
          <div className="p-3.5 rounded-xl bg-black/50 border border-zinc-700/60 font-mono space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400">Teorema de Pitágoras:</span>
              <span className="font-bold text-white">
                {activeTriangle.a}² + {activeTriangle.b}² = {activeTriangle.a * activeTriangle.a} + {activeTriangle.b * activeTriangle.b} = {activeTriangle.r2} = h²
              </span>
            </div>

            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400">Produto & Área Invariante:</span>
              <span className="font-bold text-amber-300">
                a · b = {n} &nbsp;➔&nbsp; Área = (a · b) / 2 = {activeTriangle.area.toFixed(1)}
              </span>
            </div>

            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400">Inteiro de Gauss (ℤ[i]):</span>
              <span className="font-bold text-cyan-300">
                z = {activeTriangle.a} + {activeTriangle.b}i &nbsp;(|z| = {activeTriangle.hypotenuseStr})
              </span>
            </div>
          </div>

          {/* Resumo de Proporção dos Catetos */}
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
            <span>Razão dos Catetos (tan θ = b/a): <strong className="text-zinc-200">{(activeTriangle.b / activeTriangle.a).toFixed(3)}</strong></span>
            <span>Ângulo Agudo: <strong className="text-purple-300">{activeTriangle.thetaDeg.toFixed(2)}°</strong> ({activeTriangle.thetaRad.toFixed(3)} rad)</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PAINEL DE TRIGONOMETRIA & MÉTRICAS lineares               */}
        {/* ========================================================= */}
        <div className="space-y-3 font-mono text-xs">
          {/* Ângulos e Funções Trigonométricas */}
          <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30 space-y-2">
            <div className="text-zinc-300 font-bold text-[11px] uppercase tracking-wider flex items-center justify-between border-b border-zinc-700/40 pb-1.5">
              <span>Trigonometria do Ângulo Agudo θ</span>
              <span className="text-purple-400 lowercase">{activeTriangle.thetaRad.toFixed(3)} rad</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">sen(θ) = b / h</span>
                <span className="text-zinc-200 font-bold">
                  {activeTriangle.sinTheta.toFixed(4)}
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  {activeTriangle.b} / {activeTriangle.hypotenuseStr}
                </span>
              </div>

              <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">cos(θ) = a / h</span>
                <span className="text-zinc-200 font-bold">
                  {activeTriangle.cosTheta.toFixed(4)}
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  {activeTriangle.a} / {activeTriangle.hypotenuseStr}
                </span>
              </div>

              <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">tan(θ) = b / a</span>
                <span className="text-cyan-300 font-bold">
                  {activeTriangle.tanTheta.toFixed(4)}
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  {activeTriangle.b} / {activeTriangle.a}
                </span>
              </div>

              <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">cot(θ) = a / b</span>
                <span className="text-amber-300 font-bold">
                  {activeTriangle.cotTheta.toFixed(4)}
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  {activeTriangle.a} / {activeTriangle.b}
                </span>
              </div>
            </div>

            {/* Secante e Cossecante */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1.5 border-t border-zinc-700/30">
              <span>sec(θ) = {activeTriangle.secTheta.toFixed(3)}</span>
              <span>csc(θ) = {activeTriangle.cscTheta.toFixed(3)}</span>
              <span>φ = 90° - θ = {activeTriangle.phiDeg.toFixed(1)}°</span>
            </div>
          </div>

          {/* Dimensões Lineares & Círculos Notáveis */}
          <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/30 space-y-2">
            <span className="text-zinc-300 font-bold text-[11px] uppercase tracking-wider block border-b border-zinc-700/40 pb-1.5">
              Dimensões Métricas & Círculos
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px]">Área Invariante (n/2)</span>
                <span className="text-amber-300 font-bold text-sm">
                  {activeTriangle.area.toFixed(1)}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">Perímetro 2p</span>
                <span className="text-zinc-200 font-bold text-sm">
                  {activeTriangle.perimeter.toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">Inraio r_in</span>
                <span className="text-emerald-400 font-bold">
                  {activeTriangle.inradius.toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">Circunraio R (h/2)</span>
                <span className="text-blue-400 font-bold">
                  {activeTriangle.circumradius.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-700/30 text-[11px] text-zinc-400">
              <span className="text-zinc-300 font-semibold">Altura relativa à hipotenusa: </span>
              <span className="text-rose-400 font-bold">
                hc = {activeTriangle.altitudeH.toFixed(2)}
              </span>
              <span className="text-[10px] text-zinc-500 ml-1">
                ({n} / {activeTriangle.hypotenuseStr})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { getDivisores, getParesDivisores } from "../math/divisor";
import { CircleDivisorPlot } from "./CircleDivisorPlot";
import { CircleDivisorAtom } from "./CircleDivisorAtom";
import { PairTriangleVisualizer } from "./PairTriangleVisualizer";
import { RiemannZetaCard } from "./RiemannZetaCard";
import { SolutionsCards } from "./SolutionsCards";
import { NumbersDetailsOverlayResume } from "./NumberDetailsOverlayResume";
import { PrimeFactorTree } from "./PrimeFactorTree";

type NumberDetailsOverlayProps = {
  n: number;
  onClose: () => void;
  onOpenZetaFloating?: (n: number) => void;
};

type ActiveTab = "trig" | "zeta" | "circles" | "all";

export function NumberDetailsOverlay({ n, onClose, onOpenZetaFloating }: NumberDetailsOverlayProps) {
  const [showPrimeFactorTree, setShowPrimeFactorTree] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("circles");

  const divisores = getDivisores(n);
  const pares = getParesDivisores(n);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950/95 border border-zinc-800 rounded-2xl w-full max-w-7xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =====================================================
            CABEÇALHO
            ===================================================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white font-mono shadow-md">
              n
            </div>
            <div>
              <h2 className="text-xl font-bold font-mono text-zinc-100 flex items-center gap-2">
                <span>n = {n}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                  {pares.length} {pares.length === 1 ? "par divisor" : "pares divisores"}
                </span>
              </h2>
              <span className="text-xs text-zinc-400">
                Função Zeta ζ({n}), coloração de domínio, relações métricas de catetos e inteiros de Gauss
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Switcher */}
            <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs font-mono flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab("trig")}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "trig"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>📐</span>
                <span>Catetos & Trigonometria</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("zeta")}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "zeta"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>ζ(s)</span>
                <span>Valor Exato Zeta</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("circles")}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "circles"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>◎</span>
                <span>Circunferências 2D</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "all"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>⊞</span>
                <span>Visão Completa</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-sm transition cursor-pointer"
              title="Fechar (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* =====================================================
            ÁREA PRINCIPAL
            ===================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)] gap-6 items-start">
            {/* ===================================================
                LADO ESQUERDO: CATETOS / ZETA / CÍRCULOS
                =================================================== */}
            <div className="space-y-4">
              {activeTab === "trig" && (
                <PairTriangleVisualizer n={n} pares={pares} />
              )}

              {activeTab === "zeta" && (
                <RiemannZetaCard
                  n={n}
                  onOpenFloatingWindow={() => onOpenZetaFloating && onOpenZetaFloating(n)}
                />
              )}

              {activeTab === "circles" && (
                <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-800/80 shadow-md">
                  <CircleDivisorPlot n={n} />
                </div>
              )}

              {activeTab === "all" && (
                <div className="space-y-4">
                  <PairTriangleVisualizer n={n} pares={pares} />
                  <RiemannZetaCard
                    n={n}
                    onOpenFloatingWindow={() => onOpenZetaFloating && onOpenZetaFloating(n)}
                  />
                  <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-800/80 shadow-md">
                    <CircleDivisorPlot n={n} />
                  </div>
                </div>
              )}
            </div>

            {/* ===================================================
                LADO DIREITO: ÁTOMO 3D, RESUMO, CARDS E FATORAÇÃO
                =================================================== */}
            <div className="space-y-4">
              {/* Modelo 3D Átomo */}
              <CircleDivisorAtom n={n} />

              {/* Resumo Aritmético e Interprimos */}
              <NumbersDetailsOverlayResume
                n={n}
                divisores={divisores}
                pares={pares}
              />

              {/* Tabela de Soluções e Frações */}
              <SolutionsCards pares={pares} />

              {/* Árvore de Fatoração Prima */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowPrimeFactorTree(!showPrimeFactorTree)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition cursor-pointer border border-zinc-700/60"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-amber-400">❖</span> Fatoração Prima Canônica & Árvore
                  </span>
                  <span className="text-xs text-zinc-400">
                    {showPrimeFactorTree ? "▲ Recolher" : "▼ Expandir"}
                  </span>
                </button>

                {showPrimeFactorTree && (
                  <div className="mt-3">
                    <PrimeFactorTree n={n} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            RODAPÉ
            ===================================================== */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-900/60 flex-wrap gap-2">
          <span className="text-xs text-zinc-400 font-mono flex items-center gap-2">
            <span>{pares.length} {pares.length === 1 ? "par divisor" : "pares divisores"}</span>
            <span>•</span>
            <span>a² + b² = h²</span>
            <span>•</span>
            <span className="text-amber-300 font-bold">Área Constante A = {(n / 2).toFixed(1)}</span>
          </span>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-5 py-2 rounded-lg transition cursor-pointer shadow"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

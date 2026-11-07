import { useMemo, useState } from "react";
import { getZetaInfo, ZetaInfo } from "../math/zeta";
import { MathView } from "./MathView";

interface RiemannZetaCardProps {
  n: number;
  onOpenFloatingWindow?: () => void;
}

export function RiemannZetaCard({ n, onOpenFloatingWindow }: RiemannZetaCardProps) {
  const zetaInfo: ZetaInfo = useMemo(() => getZetaInfo(n), [n]);
  const [copied, setCopied] = useState(false);

  const handleCopyDecimal = () => {
    if (zetaInfo.decimalString) {
      navigator.clipboard.writeText(zetaInfo.decimalString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isEven = n % 2 === 0;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 font-mono">
            <span className="text-cyan-400 text-lg">ζ(s)</span>
            <span>Função Zeta de Riemann — Valores Exatos & Teoria</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40">
              s = n = {n}
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Valor analítico exato de <span className="font-mono text-zinc-200">ζ({n})</span>, conexão profunda
            com os números primos por Euler e expansão em séries de Dirichlet.
          </p>
        </div>

        {/* Action Button to Open Floating Domain Coloring Window */}
        {onOpenFloatingWindow && (
          <button
            type="button"
            onClick={onOpenFloatingWindow}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <span>🌐</span>
            <span>Abrir Gráfico Flutuante</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded">Domain Coloring</span>
          </button>
        )}
      </div>

      {/* Main Grid: Exact Formula Highlighted Card & Dirichlet Series */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Valor Exato / Fechado em Destaque */}
        <div className="p-4 rounded-xl bg-gradient-to-tr from-cyan-950/40 via-blue-950/30 to-purple-950/30 border border-cyan-500/40 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-cyan-300 uppercase tracking-wider font-bold font-mono">
                Valor Exato de ζ({n})
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {isEven ? "Fórmula Fechada de Euler" : n === 1 ? "Polo Simples" : n === 3 ? "Constante de Apéry" : "Potência Ímpar"}
              </span>
            </div>

            {/* Renderização Matemática Limpa com KaTeX */}
            <div className="my-3 py-2 px-3 rounded-lg bg-black/40 border border-cyan-500/20 text-center overflow-x-auto">
              <MathView
                math={zetaInfo.latexFormula}
                display={true}
                className="text-white text-lg sm:text-xl font-bold"
              />
            </div>
          </div>

          <div className="text-xs text-zinc-300 pt-2 border-t border-cyan-500/20 flex items-center justify-between flex-wrap gap-2 font-mono">
            <div className="truncate">
              <span className="text-zinc-400">Expansão Decimal: </span>
              <span className="text-amber-300 font-semibold select-all">
                {zetaInfo.decimalString}
              </span>
            </div>
            {zetaInfo.decimalString && !zetaInfo.isPole && (
              <button
                type="button"
                onClick={handleCopyDecimal}
                className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                title="Copiar valor decimal"
              >
                {copied ? "✓ Copiado" : "Copiar"}
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Série de Dirichlet Canônica */}
        <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/30 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-zinc-300 font-bold text-[11px] uppercase tracking-wider block border-b border-zinc-700/40 pb-1 font-mono">
              Série de Dirichlet Canônica
            </span>

            {/* Expressão Matemática da Série */}
            <div className="my-2.5 p-3 rounded-lg bg-black/50 border border-zinc-800 text-amber-300 text-center overflow-x-auto">
              <MathView
                math={zetaInfo.seriesLatex}
                display={true}
                className="text-amber-300 text-sm sm:text-base font-semibold"
              />
            </div>
          </div>

          {/* Contexto Teórico com Fórmulas Limpas */}
          <div className="text-xs text-zinc-400 leading-relaxed pt-1 space-y-1">
            {n === 1 && (
              <div className="space-y-1">
                <p>
                  Para <span className="font-mono text-zinc-200">s = 1</span>, <MathView math="\zeta(1)" /> corresponde à célebre <strong className="text-amber-300">Série Harmônica divergente</strong>. No plano complexo, é o único polo da função:
                </p>
                <div className="text-center py-1 bg-black/30 rounded border border-zinc-800/60">
                  <MathView math="\lim_{s \to 1} (s - 1)\zeta(s) = 1" display={true} className="text-rose-300 text-xs" />
                </div>
              </div>
            )}

            {n === 2 && (
              <div>
                O célebre <strong className="text-cyan-300">Problema de Basileia</strong>, resolvido por Leonhard Euler em 1734. Euler provou que a soma dos inversos dos quadrados perfeitos converge exatamente para <MathView math="\frac{\pi^2}{6}" />.
              </div>
            )}

            {isEven && n > 2 && (
              <div className="space-y-1.5">
                <p>
                  Fórmula exata de Euler via números de Bernoulli <MathView math="B_{2k}" />:
                </p>
                <div className="text-center py-1 bg-black/30 rounded border border-zinc-800/60 overflow-x-auto">
                  <MathView
                    math="\zeta(2k) = \frac{(-1)^{k+1} B_{2k} (2\pi)^{2k}}{2 \cdot (2k)!}"
                    display={true}
                    className="text-amber-200 text-xs"
                  />
                </div>
              </div>
            )}

            {n === 3 && (
              <div>
                <strong className="text-amber-300">Constante de Apéry:</strong> Em 1978, o matemático Roger Apéry provou que <MathView math="\zeta(3)" /> é um número irracional, um dos maiores marcos da teoria analítica dos números.
              </div>
            )}

            {!isEven && n > 3 && (
              <div>
                Para potências ímpares <MathView math="\zeta(2k+1)" />, não há fórmula fechada simples conhecida em potências de <MathView math="\pi" />. A convergência da soma é ultra rápida para potências elevadas.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Produto Euleriano e Conexão com os Números Primos */}
      <div className="bg-zinc-800/40 p-4 rounded-xl border border-zinc-700/30 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-700/40 pb-2">
          <span className="text-zinc-200 font-bold text-xs uppercase tracking-wider font-mono">
            Produto Infinito de Euler sobre Todos os Números Primos
          </span>
          <span className="text-rose-400 text-xs font-semibold font-mono">Leonhard Euler (1737)</span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          A função zeta codifica diretamente a distribuição e multiplicidade de todos os números primos através do produto infinito de Euler:
        </p>

        {/* Produto Principal com KaTeX */}
        <div className="p-3.5 rounded-lg bg-black/60 border border-zinc-800 text-cyan-300 text-center overflow-x-auto">
          <MathView
            math={zetaInfo.eulerProductLatex}
            display={true}
            className="text-cyan-300 text-sm sm:text-base font-bold"
          />
        </div>

        {/* Desenvolvimento com os Primeiros Primos */}
        <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-xs text-zinc-300 space-y-1.5">
          <div className="text-zinc-400 flex items-center justify-between text-[11px] font-mono">
            <span>Desenvolvimento com os primeiros primos (2, 3, 5, 7, 11...):</span>
            <span className="text-rose-400/80 font-semibold">Identidade de Ouro de Euler</span>
          </div>
          <div className="overflow-x-auto py-1 text-center">
            <MathView
              math={zetaInfo.eulerExpansionLatex}
              display={true}
              className="text-rose-300 text-xs sm:text-sm font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Janela Flutuante Call to Action */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-purple-950/40 border border-cyan-500/30 flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1 max-w-xl">
          <div className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
            <span>🌐</span>
            <span>Visualização de Domain Coloring no Plano Complexo s = σ + it</span>
          </div>
          <p className="text-xs text-zinc-400">
            Para garantir máximo desempenho e fluidez total na análise dos divisores, o gráfico de coloração de domínio está disponível em uma janela flutuante interativa com zoom, pan e visualização da reta crítica <MathView math="\mathrm{Re}(s) = \frac{1}{2}" />.
          </p>
        </div>

        {onOpenFloatingWindow && (
          <button
            type="button"
            onClick={onOpenFloatingWindow}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <span>Explorar no Gráfico Flutuante</span>
            <span>➔</span>
          </button>
        )}
      </div>
    </div>
  );
}

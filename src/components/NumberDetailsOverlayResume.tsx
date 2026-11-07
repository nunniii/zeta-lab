import { isCubic, isSquare, getInterprimeInfo, getTwinPrimeInfo } from "../math/divisor";
import { isPrime, eulerTotient } from "../math/engine";
import { getZetaInfo } from "../math/zeta";
import { MathView } from "./MathView";

interface NumberDetailsOverlayResumeProps {
  n: number;
  divisores: number[];
  pares: [number, number][];
}

export function NumbersDetailsOverlayResume({
  n,
  divisores,
  pares,
}: NumberDetailsOverlayResumeProps) {
  const prime = isPrime(n);
  const square = isSquare(n);
  const cubic = isCubic(n);
  const totient = eulerTotient(n);
  const interprime = getInterprimeInfo(n);
  const twinInfo = getTwinPrimeInfo(n);
  const zeta = getZetaInfo(n);
  const divisorSum = divisores.reduce((sum, d) => sum + d, 0);
  const spin = n % 2 === 0 ? "Down (Par)" : "Up (Ímpar)";

  // Classificação
  let classificacao = "Número Composto";
  let badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/40";
  let symbol = "○";

  if (n === 1) {
    classificacao = "Unidade";
    badgeColor = "bg-zinc-700/40 text-zinc-300 border-zinc-600";
    symbol = "⚪";
  } else if (prime) {
    classificacao = "Número Primo";
    badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
    symbol = "●";
  } else if (square && cubic) {
    classificacao = "Quadrado e Cubo (6ª Potência)";
    badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
    symbol = "✦";
  } else if (square) {
    classificacao = "Quadrado Perfeito";
    badgeColor = "bg-lime-500/20 text-lime-300 border-lime-500/40";
    symbol = "■";
  } else if (cubic) {
    classificacao = "Cubo Perfeito";
    badgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/40";
    symbol = "▲";
  } else if (interprime.isInterprime) {
    classificacao = "Número Interprimo";
    badgeColor = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    symbol = "◈";
  }

  return (
    <div className="mb-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-zinc-200 text-sm font-semibold">
          Propriedades e Resumo Aritmético
        </h4>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${badgeColor}`}>
            <span>{symbol}</span>
            <span>{classificacao}</span>
          </span>
          {interprime.isInterprime && classificacao !== "Número Interprimo" && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-cyan-500/20 text-cyan-300 border-cyan-500/40 flex items-center gap-1">
              <span>◈</span>
              <span>Interprimo</span>
            </span>
          )}
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="bg-zinc-800/40 p-2 rounded-lg border border-zinc-700/30">
          <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-mono">
            Divisores |D|
          </span>
          <span className="text-base font-bold font-mono text-zinc-100">
            {divisores.length}
          </span>
        </div>

        <div className="bg-zinc-800/40 p-2 rounded-lg border border-zinc-700/30">
          <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-mono">
            Soma σ₁(n)
          </span>
          <span className="text-base font-bold font-mono text-zinc-100">
            {divisorSum}
          </span>
        </div>

        <div className="bg-zinc-800/40 p-2 rounded-lg border border-zinc-700/30">
          <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-mono">
            Euler φ(n)
          </span>
          <span className="text-base font-bold font-mono text-cyan-300">
            {totient}
          </span>
        </div>

        <div className="bg-zinc-800/40 p-2 rounded-lg border border-zinc-700/30 overflow-hidden" title={zeta.exactFormula}>
          <span className="text-[10px] text-cyan-400 block uppercase tracking-wider font-mono font-semibold truncate">
            Riemann ζ({n})
          </span>
          <div className="text-xs font-bold text-cyan-300 truncate mt-0.5 overflow-x-auto">
            <MathView math={zeta.latexFormula} className="text-cyan-300 text-xs" />
          </div>
        </div>

        <div className="bg-zinc-800/40 p-2 rounded-lg border border-zinc-700/30">
          <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-mono">
            Spin / Paridade
          </span>
          <span className={`text-xs font-bold font-mono ${n % 2 === 0 ? "text-pink-400" : "text-cyan-400"}`}>
            {spin}
          </span>
        </div>
      </div>

      {/* Divisores detalhados */}
      <div className="bg-zinc-800/30 p-2.5 rounded-lg border border-zinc-700/20 text-xs font-mono space-y-1">
        <div className="text-zinc-400 text-[11px]">
          Conjunto de Divisores D({n}):
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {divisores.map((d) => (
            <span
              key={d}
              className={`px-2 py-0.5 rounded text-xs border ${
                isPrime(d) && d > 1
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300"
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Conexão com Inteiros de Gauss */}
      <div className="bg-gradient-to-r from-blue-950/30 to-purple-950/30 p-2.5 rounded-lg border border-blue-500/20 text-xs space-y-1 text-zinc-300">
        <span className="text-cyan-300 font-semibold block text-[11px]">
          Conexão com Números Complexos & Inteiros de Gauss (ℤ[i]):
        </span>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Cada par divisor [a, b] com a·b = {n} define uma circunferência no plano complexo com raio ao quadrado r² = a² + b² = |a + bi|². Os pontos inteiros (x, y) sobre o círculo representam os inteiros gaussianos z = x + yi de mesma norma euclidiana.
        </p>
      </div>

      {/* Seção especial para Números Interprimos */}
      {interprime.isInterprime && (
        <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/30 p-2.5 rounded-lg border border-cyan-500/30 text-xs space-y-1.5 text-zinc-300">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-cyan-300 font-semibold flex items-center gap-1.5 text-[11px]">
              <span>◈</span>
              <span>Propriedade de Número Interprimo (OEIS A024675):</span>
            </span>
            {interprime.isTwinMean && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-mono">
                Média de Primos Gêmeos!
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-300 font-mono leading-relaxed">
            {n} é a média aritmética dos dois primos ímpares consecutivos{" "}
            <span className="text-cyan-300 font-bold">{interprime.p1}</span> e{" "}
            <span className="text-cyan-300 font-bold">{interprime.p2}</span>:
          </p>
          <div className="px-2.5 py-1.5 rounded bg-black/40 border border-zinc-700/50 font-mono text-center text-xs">
            <span className="text-zinc-400">({interprime.p1} + {interprime.p2}) / 2 = </span>
            <span className="text-cyan-300 font-bold">{n}</span>
            <span className="text-zinc-500 ml-2">(distância simétrica aos primos: ±{interprime.distance})</span>
          </div>
        </div>
      )}

      {/* Seção de Números Primos Gêmeos (OEIS A001097) */}
      <div className="bg-gradient-to-r from-rose-950/30 via-pink-950/20 to-purple-950/20 p-3 rounded-lg border border-rose-500/30 text-xs space-y-2 text-zinc-300 font-mono">
        <div className="flex items-center justify-between flex-wrap gap-1 border-b border-rose-500/20 pb-1.5">
          <span className="text-rose-300 font-bold flex items-center gap-1.5 text-[11px]">
            <span>👯</span>
            <span>Primos Gêmeos (OEIS A001097):</span>
          </span>
          {twinInfo.isTwinPrime && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/40 font-bold">
              ★ {n} É UM PRIMO GÊMEO!
            </span>
          )}
          {twinInfo.isBetweenTwins && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 font-bold">
              ★ SEPARA PRIMOS GÊMEOS ({twinInfo.surroundingTwins?.[0]}, {twinInfo.surroundingTwins?.[1]})
            </span>
          )}
        </div>

        {/* Status do Número n */}
        {twinInfo.isTwinPrime ? (
          <div className="p-2 rounded bg-black/40 border border-rose-900/50 text-zinc-200 text-xs">
            <span className="text-rose-400 font-bold">{n}</span> é primo gêmeo formando o(s) par(es):{" "}
            <span className="text-rose-300 font-bold">
              {twinInfo.twinPairsOfN.map(([p, q]) => `(${p}, ${q})`).join(" e ")}
            </span>
            {twinInfo.twinsOfN.length > 1 && (
              <span className="text-amber-300 ml-2">(O único primo pertencente a dois pares de gêmeos!)</span>
            )}
          </div>
        ) : twinInfo.isBetweenTwins ? (
          <div className="p-2 rounded bg-black/40 border border-amber-900/50 text-zinc-200 text-xs">
            <span className="text-amber-300 font-bold">{n}</span> é o número par que separa exatamente os primos gêmeos:{" "}
            <span className="text-rose-300 font-bold">
              ({twinInfo.surroundingTwins?.[0]}, {twinInfo.surroundingTwins?.[1]})
            </span>{" "}
            ({n} - 1 e {n} + 1).
          </div>
        ) : (
          <div className="p-2 rounded bg-black/40 border border-zinc-800 text-zinc-400 text-[11px]">
            <span>Par de primos gêmeos mais próximo: </span>
            <span className="text-rose-300 font-bold">
              ({twinInfo.nearestTwinPair[0]}, {twinInfo.nearestTwinPair[1]})
            </span>
            <span className="text-zinc-500 ml-1.5">(distância de {twinInfo.distanceToNearest})</span>
          </div>
        )}

        {/* Descrição Teórica Oficial */}
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          <a href="https://pt.wikipedia.org/wiki/N%C3%BAmeros_primos_g%C3%A9meos" target="_blank" rel="noreferrer" className="text-rose-400 underline hover:text-rose-300 font-semibold">
            Números primos gémeos
          </a>, na <a href="https://pt.wikipedia.org/wiki/Teoria_dos_n%C3%BAmeros" target="_blank" rel="noreferrer" className="text-rose-400 underline">teoria dos números</a>, são dois <a href="https://pt.wikipedia.org/wiki/N%C3%BAmeros_primos" target="_blank" rel="noreferrer" className="text-rose-400 underline">números primos</a> cuja diferença é igual a dois (p₂ - p₁ = 2).
        </p>

        <div className="text-[10px] text-zinc-400 bg-black/30 p-2 rounded border border-zinc-800 space-y-1">
          <div>
            <span className="text-zinc-300 font-semibold">Primeiros pares de números primos gémeos:</span>{" "}
            <span className="text-rose-300">
              (3,5), (5,7), (11,13), (17,19), (29,31), (41,43), (59,61), (71,73), (101,103), (107,109), (137,139)...
            </span>{" "}
            <span className="text-zinc-500">(sequência <a href="https://oeis.org/A001097" target="_blank" rel="noreferrer" className="text-cyan-400 underline">A001097</a> na OEIS)</span>
          </div>
          <div>
            <span className="text-zinc-300 font-semibold">Recorde (2011):</span>{" "}
            <span className="text-amber-300 font-mono">3756801695685 · 2⁶⁶⁶⁶⁶⁹ ± 1</span>{" "}
            <span className="text-zinc-500">(388.342 dígitos)</span>.
          </div>
          <div className="text-zinc-500">
            Existem cerca de 1.000 primos gêmeos abaixo de 100.000 e 8.000 abaixo de 1.000.000.
          </div>
        </div>
      </div>
    </div>
  );
}

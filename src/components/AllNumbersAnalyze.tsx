import { useState, useMemo } from "react";
import {
  getDivisores,
  isCubic,
  getInterprimeInfo,
  InterprimeInfo,
  getTwinPrimeInfo,
  TwinPrimeInfo,
} from "../math/divisor";
import { NumberDetailsOverlay } from "./NumberDetailsOverlay";
import { RiemannZetaFloatingWindow } from "./RiemannZetaFloatingWindow";

type FilterType = "all" | "primes" | "twins" | "squares" | "cubes" | "sixthPower" | "interprimes" | "composites";

interface NumberDataItem {
  n: number;
  divisores: number[];
  corQuantidade: string;
  isSquare: boolean;
  isPrimeNum: boolean;
  isCubicNum: boolean;
  isSixthPower: boolean;
  interprime: InterprimeInfo;
  twinInfo: TwinPrimeInfo;
  symbol: string;
  badgeClass: string;
  tag: string;
}

export function AllNumbersAnalyze() {
  const limite = 1000;
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showInterprimeInfo, setShowInterprimeInfo] = useState(false);

  // Floating Window for Riemann Zeta Domain Coloring
  const [showZetaFloating, setShowZetaFloating] = useState(false);
  const [zetaFloatingN, setZetaFloatingN] = useState<number>(2);

  const numbersData = useMemo<NumberDataItem[]>(() => {
    return Array.from({ length: limite }, (_, i) => {
      const n = i + 1;
      const divisores = getDivisores(n);
      const isSquare = divisores.length % 2 === 1;
      const isPrimeNum = divisores.length === 2;
      const isCubicNum = isCubic(n);
      const isSixthPower = isSquare && isCubicNum && n > 1;
      const interprime = getInterprimeInfo(n);
      const twinInfo = getTwinPrimeInfo(n);

      let corQuantidade = "text-zinc-300";
      let tag = "Composto normal";
      let symbol = "○";
      let badgeClass = "bg-zinc-800/80 text-zinc-400 border-zinc-700/60";

      if (n === 1) {
        corQuantidade = "text-white";
        tag = "Unidade";
        symbol = "⚪";
        badgeClass = "bg-zinc-800 text-zinc-300 border-zinc-600";
      } else if (isPrimeNum) {
        corQuantidade = "text-rose-400";
        tag = "Primos (|D|=2)";
        symbol = "●";
        badgeClass = "bg-rose-500/20 text-rose-300 border-rose-500/40";
      } else if (isSixthPower) {
        corQuantidade = "text-yellow-400";
        tag = "Quadrado & Cubo (6ª pot.)";
        symbol = "✦";
        badgeClass = "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
      } else if (isSquare) {
        corQuantidade = "text-lime-400";
        tag = "Quadrados (|D| ímpar)";
        symbol = "■";
        badgeClass = "bg-lime-500/20 text-lime-300 border-lime-500/40";
      } else if (isCubicNum) {
        corQuantidade = "text-purple-400";
        tag = "Cubos (k³)";
        symbol = "▲";
        badgeClass = "bg-purple-500/20 text-purple-300 border-purple-500/40";
      } else if (interprime.isInterprime) {
        corQuantidade = "text-cyan-400";
        tag = "Interprimo";
        symbol = "◈";
        badgeClass = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
      }

      return {
        n,
        divisores,
        corQuantidade,
        isSquare,
        isPrimeNum,
        isCubicNum,
        isSixthPower,
        interprime,
        twinInfo,
        symbol,
        badgeClass,
        tag,
      };
    });
  }, [limite]);

  // Statistics counts
  const counts = useMemo(() => {
    let primes = 0;
    let twins = 0;
    let squares = 0;
    let cubes = 0;
    let sixthPower = 0;
    let interprimes = 0;
    let composites = 0;

    for (const item of numbersData) {
      if (item.isPrimeNum) primes++;
      if (item.twinInfo.isTwinPrime) twins++;
      if (item.isSquare) squares++;
      if (item.isCubicNum) cubes++;
      if (item.isSixthPower) sixthPower++;
      if (item.interprime.isInterprime) interprimes++;
      if (!item.isPrimeNum && item.n > 1) composites++;
    }

    return { primes, twins, squares, cubes, sixthPower, interprimes, composites };
  }, [numbersData]);

  const filteredNumbers = useMemo(() => {
    return numbersData.filter((item) => {
      if (search.trim()) {
        const query = search.trim();
        if (!String(item.n).includes(query)) return false;
      }
      if (filter === "primes") return item.isPrimeNum;
      if (filter === "twins") return item.twinInfo.isTwinPrime;
      if (filter === "squares") return item.isSquare;
      if (filter === "cubes") return item.isCubicNum;
      if (filter === "sixthPower") return item.isSixthPower;
      if (filter === "interprimes") return item.interprime.isInterprime;
      if (filter === "composites") return !item.isPrimeNum && item.n > 1;
      return true;
    });
  }, [numbersData, search, filter]);

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Barra Superior de Filtros */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span>Análise Global de Números & Divisores</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
              1 a {limite}
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Clique em qualquer número para abrir a geometria (Triângulos Retângulos, Trigonometria, Circunferências 2D & Átomo 3D)
          </p>
        </div>

        {/* Busca e Filtros Rápidos com Símbolos */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="number"
            placeholder="Ir para n..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-28 px-2.5 py-1 text-xs rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 font-mono outline-none focus:border-cyan-500"
            min="1"
            max={limite}
          />

          <div className="flex bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-700/60 text-xs font-mono flex-wrap">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded cursor-pointer transition ${
                filter === "all" ? "bg-zinc-700 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Todos ({limite})
            </button>
            <button
              type="button"
              onClick={() => setFilter("primes")}
              className={`px-2.5 py-1 rounded cursor-pointer transition flex items-center gap-1 ${
                filter === "primes" ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40" : "text-rose-400 hover:text-rose-300"
              }`}
            >
              <span>●</span>
              <span>Primos ({counts.primes})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("squares")}
              className={`px-2.5 py-1 rounded cursor-pointer transition flex items-center gap-1 ${
                filter === "squares" ? "bg-lime-500/20 text-lime-300 font-bold border border-lime-500/40" : "text-lime-400 hover:text-lime-300"
              }`}
            >
              <span>■</span>
              <span>Quadrados ({counts.squares})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("cubes")}
              className={`px-2.5 py-1 rounded cursor-pointer transition flex items-center gap-1 ${
                filter === "cubes" ? "bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40" : "text-purple-400 hover:text-purple-300"
              }`}
            >
              <span>▲</span>
              <span>Cubos ({counts.cubes})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("sixthPower")}
              className={`px-2.5 py-1 rounded cursor-pointer transition flex items-center gap-1 ${
                filter === "sixthPower" ? "bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/40" : "text-yellow-400 hover:text-yellow-300"
              }`}
            >
              <span>✦</span>
              <span>6ª Pot. ({counts.sixthPower})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter("interprimes");
                setShowInterprimeInfo(true);
              }}
              className={`px-2.5 py-1 rounded cursor-pointer transition flex items-center gap-1 ${
                filter === "interprimes" ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40" : "text-cyan-400 hover:text-cyan-300"
              }`}
            >
              <span>◈</span>
              <span>Interprimos ({counts.interprimes})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legenda com Símbolos Geométricos e Cores */}
      <div className="px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between gap-4 text-xs font-mono flex-wrap shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold">Legenda:</span>
          
          <span className="flex items-center gap-1.5 text-rose-400" title="Números primos: exatamente 2 divisores (1 e ele mesmo)">
            <span className="text-sm">●</span> Primos (|D|=2)
          </span>

          <span className="flex items-center gap-1.5 text-lime-400" title="Quadrados perfeitos: número ímpar de divisores">
            <span className="text-sm">■</span> Quadrados (|D| ímpar)
          </span>

          <span className="flex items-center gap-1.5 text-purple-400" title="Cubos perfeitos: n = k³">
            <span className="text-sm">▲</span> Cubos (k³)
          </span>

          <span className="flex items-center gap-1.5 text-yellow-400" title="Quadrado e Cubo: n = k⁶ (6ª potência)">
            <span className="text-sm">✦</span> Quadrado & Cubo (6ª pot.)
          </span>

          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold" title="Média aritmética de dois primos ímpares consecutivos">
            <span className="text-sm">◈</span> Interprimos (Média de primos ímpares)
          </span>

          <span className="flex items-center gap-1.5 text-zinc-400" title="Números compostos normais">
            <span className="text-sm">○</span> Compostos normais
          </span>
        </div>

        {/* Botão de Ajuda Teórica sobre Interprimos */}
        <button
          type="button"
          onClick={() => setShowInterprimeInfo(!showInterprimeInfo)}
          className={`px-2.5 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1.5 border ${
            showInterprimeInfo
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm"
              : "bg-zinc-800/80 text-zinc-400 hover:text-cyan-300 border-zinc-700/60"
          }`}
        >
          <span>ℹ</span>
          <span>{showInterprimeInfo ? "Ocultar Teoria dos Interprimos" : "O que é um Interprimo?"}</span>
        </button>
      </div>

      {/* Caixa Explicativa Completa dos Números Interprimos */}
      {showInterprimeInfo && (
        <div className="px-5 py-3.5 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/20 border-b border-cyan-500/30 text-xs font-mono space-y-2.5 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <span className="text-base">◈</span>
              <span>Definição & Teoremas: Números Interprimos (OEIS A024675)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowInterprimeInfo(false)}
              className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer px-1.5 py-0.5 rounded hover:bg-zinc-800"
            >
              ✕ Fechar
            </button>
          </div>

          <p className="text-zinc-200 leading-relaxed">
            Em <a href="https://pt.wikipedia.org/wiki/Matem%C3%A1tica" target="_blank" rel="noreferrer" className="text-cyan-400 underline hover:text-cyan-300">matemática</a>, um <strong>número interprimo</strong> é a <strong>média aritmética de dois números primos ímpares consecutivos</strong>. Por exemplo, <a href="https://pt.wikipedia.org/wiki/Nove" target="_blank" rel="noreferrer" className="text-cyan-400 underline hover:text-cyan-300">9</a> é um número interprimo porque é a média de <strong>7</strong> e <strong>11</strong>: <code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-300 font-bold">(7 + 11) / 2 = 9</code>.
          </p>

          <div className="p-2.5 rounded-lg bg-black/50 border border-cyan-900/40 text-zinc-300 space-y-1">
            <span className="text-zinc-400 block text-[11px] font-semibold">Os primeiros interprimos são:</span>
            <span className="text-cyan-300 font-bold leading-relaxed tracking-wide">
              4, 6, 9, 12, 15, 18, 21, 26, 30, 34, 39, 42, 45, 50, 56, 60, 64, 69, 72, 76, 81, 86, 93, 99, ...
            </span>
            <div className="text-[11px] text-zinc-400 pt-0.5">
              (sequência <a href="https://oeis.org/A024675" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">A024675</a> na <a href="https://pt.wikipedia.org/wiki/On-Line_Encyclopedia_of_Integer_Sequences" target="_blank" rel="noreferrer" className="text-cyan-400 underline">OEIS</a>)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] text-zinc-300 leading-relaxed">
            <div className="space-y-1.5 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
              <p>
                • <strong>Não-primalidade garantida:</strong> Os interprimos <em>não são números primos</em> (caso contrário, os primos usados na conta não seriam consecutivos).
              </p>
              <p>
                • <strong>Infinitude:</strong> Há um número infinito de números primos e por isso é também <em>infinito o número de interprimos</em>.
              </p>
            </div>
            <div className="space-y-1.5 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
              <p>
                • <strong>Primos Gêmeos:</strong> Quando a distância entre os primos for de 2 (<code className="text-cyan-300">p₂ - p₁ = 2</code>), o interprimo é exatamente o número par intermediário dos <a href="https://pt.wikipedia.org/wiki/N%C3%BAmeros_primos_g%C3%A9meos" target="_blank" rel="noreferrer" className="text-cyan-400 underline">números primos gémeos</a> (ex: 4, 6, 12, 18, 30, 42, 60...).
              </p>
              <p>
                • <strong>Maior interprimo conhecido (2017):</strong> Tinha 388.342 dígitos: <code className="text-amber-300 font-bold">n = 2996863034895 · 2¹²⁹⁰⁰⁰⁰</code>, sendo <code className="text-zinc-200">n ± 1</code> o mais alto par de primos gêmeos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista Principal de Números */}
      <div className="flex-1 overflow-y-auto p-4 divide-y divide-zinc-800/50 font-mono text-xs">
        {filteredNumbers.map((item) => (
          <button
            key={item.n}
            type="button"
            onClick={() => setSelectedNumber(item.n)}
            className="w-full flex items-center justify-between py-2 px-3 hover:bg-zinc-800/70 duration-50 rounded-lg transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              {/* Símbolo Geométrico da Classificação */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${item.badgeClass} shadow-sm group-hover:scale-110 transition-transform`}
                title={item.tag}
              >
                {item.symbol}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`w-28 font-bold ${item.corQuantidade} transition-colors flex items-center gap-1.5`}>
                  <span>n = {item.n}</span>
                  <span className="opacity-75 font-normal text-[11px]">|D|={item.divisores.length}</span>
                </span>

                {/* Badges Adicionais com Símbolos */}
                {item.interprime.isInterprime && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0 font-medium flex items-center gap-1">
                    <span>◈</span>
                    <span>Interprimo ({item.interprime.p1} + {item.interprime.p2})/2</span>
                    {item.interprime.isTwinMean && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-200 font-bold ml-0.5">
                        Gêmeos
                      </span>
                    )}
                  </span>
                )}
                {item.isSixthPower && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shrink-0 flex items-center gap-1 font-semibold">
                    <span>✦</span>
                    <span>6ª Pot.</span>
                  </span>
                )}
                {item.isSquare && !item.isSixthPower && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-lime-500/20 text-lime-300 border border-lime-500/40 shrink-0 flex items-center gap-1">
                    <span>■</span>
                    <span>Quadrado</span>
                  </span>
                )}
                {item.isCubicNum && !item.isSixthPower && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0 flex items-center gap-1">
                    <span>▲</span>
                    <span>Cubo</span>
                  </span>
                )}
              </div>

              <p className="text-zinc-400 text-xs truncate max-w-sm hidden md:block">
                D({item.n}) = [{item.divisores.join(", ")}]
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-cyan-300 transition">
                Ver Geometria ➔
              </span>
            </div>
          </button>
        ))}

        {filteredNumbers.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            Nenhum número encontrado para os filtros selecionados.
          </div>
        )}
      </div>

      {/* =====================================================
          MODAL OVERLAY COM GEOMETRIA & TRIÂNGULOS
          ===================================================== */}
      {selectedNumber !== null && (
        <NumberDetailsOverlay
          n={selectedNumber}
          onClose={() => setSelectedNumber(null)}
        />
      )}
    </div>
  );
}

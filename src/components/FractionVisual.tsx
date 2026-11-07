import { gcd, formatSqrt } from "../math/divisor";

interface FractionVisualProps {
  numerador: number;
  denominador: number;
}

export function FractionVisual({ numerador, denominador }: FractionVisualProps) {
  const g = gcd(numerador, denominador);
  const irredutivelNum = numerador / g;
  const irredutivelDen = denominador / g;
  const hipotenusaR2 = numerador * numerador + denominador * denominador;
  const hipotenusaStr = formatSqrt(hipotenusaR2);
  const hipotenusaDec = Math.sqrt(hipotenusaR2).toFixed(2);

  const total = numerador + denominador;
  const percentA = Math.round((numerador / total) * 100);
  const percentB = 100 - percentA;
  const ratio = (numerador / denominador).toFixed(3);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 2fr",
        alignItems: "center",
      }}
      className="px-3 py-2 border-b border-zinc-700/40 text-xs font-mono hover:bg-zinc-700/30 transition items-center"
    >
      {/* Fração original */}
      <div className="text-center font-bold text-zinc-200">
        <span className="text-cyan-400">{numerador}</span> / <span className="text-amber-400">{denominador}</span>
      </div>

      {/* Irredutível */}
      <div className="text-center text-zinc-300">
        {g > 1 ? (
          <span>
            <span className="text-cyan-300">{irredutivelNum}</span> / <span className="text-amber-300">{irredutivelDen}</span>
            <span className="text-[10px] text-zinc-500 ml-1">(:{g})</span>
          </span>
        ) : (
          <span className="text-emerald-400">irredutível</span>
        )}
      </div>

      {/* Hipotenusa */}
      <div className="text-center text-zinc-300">
        <span className="text-violet-300">{hipotenusaStr}</span>
        <span className="text-[10px] text-zinc-500 ml-1">({hipotenusaDec})</span>
      </div>

      {/* Proporção visual */}
      <div className="flex items-center gap-2 pr-2">
        <div className="flex-1 h-3 rounded-full bg-zinc-900 overflow-hidden flex border border-zinc-700/50">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${percentA}%` }}
            title={`a: ${numerador} (${percentA}%)`}
          />
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
            style={{ width: `${percentB}%` }}
            title={`b: ${denominador} (${percentB}%)`}
          />
        </div>
        <span className="text-[10px] text-zinc-400 w-12 text-right shrink-0">
          {ratio}
        </span>
      </div>
    </div>
  );
}

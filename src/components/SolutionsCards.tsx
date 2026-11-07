import { FractionVisual } from "./FractionVisual";

interface SolutionsCardsProps {
  pares: [number, number][];
}

export function SolutionsCards({ pares }: SolutionsCardsProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-zinc-300 text-xs font-semibold">
          Quadrados relativos do divisor associados à função quadrática
        </p>
        <span className="text-zinc-500 text-xs">
          {pares.length} {pares.length === 1 ? "par" : "pares"}
        </span>
      </div>

      <div className="rounded-xl overflow-hidden border border-zinc-700/60 shadow-lg">
        {/* Cabeçalho */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 2fr",
            alignItems: "center",
          }}
          className="min-h-9 px-3 bg-zinc-900 border-b border-zinc-700/80 text-zinc-400 text-[11px] uppercase tracking-wider font-mono font-medium"
        >
          <div className="text-center">Fração</div>
          <div className="text-center">Irredutível</div>
          <div className="text-center">Hipotenusa</div>
          <div>Proporção</div>
        </div>

        {/* Cards / Rows */}
        <div className="bg-zinc-800/80 divide-y divide-zinc-700/40">
          {pares.map(([a, b]) => (
            <FractionVisual
              key={`${a}-${b}`}
              numerador={a}
              denominador={b}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

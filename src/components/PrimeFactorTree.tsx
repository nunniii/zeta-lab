import { useMemo } from "react";
import { buildFactorTree, getPrimeFactorCounts, type PrimeFactorNode } from "../math/divisor";

interface PrimeFactorTreeProps {
  n: number;
}

function RenderTreeNode({ node }: { node: PrimeFactorNode }) {
  if (node.isPrime || (!node.left && !node.right)) {
    return (
      <div className="flex flex-col items-center">
        <div className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold shadow">
          {node.value}
        </div>
        <span className="text-[10px] text-amber-500/80 mt-0.5">primo</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Nó composto */}
      <div className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold">
        {node.value}
      </div>

      {/* Linhas de bifurcação */}
      <div className="w-px h-3 bg-zinc-600 my-1" />

      {/* Filhos */}
      <div className="flex items-start gap-6 relative pt-1">
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-zinc-600" />
        {node.left && (
          <div className="flex flex-col items-center">
            <RenderTreeNode node={node.left} />
          </div>
        )}
        {node.right && (
          <div className="flex flex-col items-center">
            <RenderTreeNode node={node.right} />
          </div>
        )}
      </div>
    </div>
  );
}

export function PrimeFactorTree({ n }: PrimeFactorTreeProps) {
  const tree = useMemo(() => buildFactorTree(n), [n]);
  const primePowers = useMemo(() => getPrimeFactorCounts(n), [n]);

  if (n <= 1) {
    return (
      <div className="p-3 text-zinc-500 text-xs italic bg-zinc-900/40 rounded-lg">
        O número {n} não possui fatores primos.
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
      {/* Expressão Canônica */}
      <div className="flex items-center justify-between bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-700/50">
        <span className="text-xs text-zinc-400">Decomposição Canônica:</span>
        <span className="text-sm font-mono font-bold text-amber-300">
          {n} ={" "}
          {primePowers.length === 0
            ? n
            : primePowers
                .map(({ prime, power }) =>
                  power > 1 ? `${prime}^${power}` : `${prime}`
                )
                .join(" × ")}
        </span>
      </div>

      {/* Árvore Hierárquica */}
      <div className="overflow-x-auto py-3 flex justify-center">
        <RenderTreeNode node={tree} />
      </div>

      <div className="text-[11px] text-zinc-500 text-center">
        Pelo Teorema Fundamental da Aritmética, toda fatoração prima é única até a ordem dos fatores.
      </div>
    </div>
  );
}

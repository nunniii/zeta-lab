import { useState } from "react";

// Representação de ordinal de Von Neumann
function buildVonNeumannSet(n: number): string {
  if (n === 0) return "∅";
  const elements: string[] = [];
  for (let i = 0; i < n; i++) {
    elements.push(buildVonNeumannSet(i));
  }
  return `{ ${elements.join(", ")} }`;
}

function buildVonNeumannNumeric(n: number): string {
  if (n === 0) return "∅";
  const elements: number[] = [];
  for (let i = 0; i < n; i++) {
    elements.push(i);
  }
  return `{ ${elements.join(", ")} }`;
}

export function VonNeumannMode() {
  const [limite, setLimite] = useState(5);

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-zinc-950 text-zinc-100 font-mono">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-cyan-400">∅</span> Teoria dos Conjuntos: Ordinais de Von Neumann
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Construção rigorosa dos números naturais a partir do conjunto vazio: S(n) = n ∪ &#123;n&#125;
          </p>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
          <label className="text-xs text-zinc-300">
            Limite de Ordinais a Gerar (0 a n-1):
          </label>
          <input
            type="range"
            min="1"
            max="7"
            value={limite}
            onChange={(e) => setLimite(Number(e.target.value))}
            className="w-48 accent-cyan-500 cursor-pointer"
          />
          <span className="text-xs px-2.5 py-1 rounded bg-zinc-800 text-cyan-400 font-bold">
            {limite} ordinais
          </span>
        </div>

        {/* Lista de Ordinais */}
        <div className="space-y-3">
          {Array.from({ length: limite }, (_, i) => i).map((n) => {
            const rawSet = buildVonNeumannSet(n);
            const numSet = buildVonNeumannNumeric(n);

            return (
              <div
                key={n}
                className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-2 hover:border-zinc-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-cyan-400">
                    Ordinal {n} : S({n - 1 >= 0 ? n - 1 : "∅"})
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    Cardinalidade: |{n}| = {n}
                  </span>
                </div>

                {/* Forma com índices numéricos */}
                <div className="text-xs text-zinc-300 bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500">Notação de elementos: </span>
                  <span className="text-amber-300">{n} = {numSet}</span>
                </div>

                {/* Forma pura com vazio ∅ */}
                <div className="text-xs text-zinc-400 bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/50 break-words leading-relaxed font-mono">
                  <span className="text-zinc-500 block mb-1">Definição pura em termos de ∅:</span>
                  <span className="text-purple-300">{rawSet}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explicação Matemática */}
        <div className="bg-gradient-to-r from-blue-950/30 to-purple-950/30 p-4 rounded-xl border border-blue-500/20 text-xs space-y-2 text-zinc-300">
          <h4 className="text-cyan-300 font-bold text-sm">
            Fundamentos Axiomáticos de Von Neumann:
          </h4>
          <p className="text-zinc-400 leading-relaxed">
            Em ZFC (Zermelo-Fraenkel), cada número natural n é literalmente o conjunto de todos os números naturais menores que ele. Assim, a relação &lt; entre números coincide exatamente com a relação de pertinência ∈ entre conjuntos: a &lt; b se e somente se a ∈ b.
          </p>
        </div>
      </div>
    </div>
  );
}

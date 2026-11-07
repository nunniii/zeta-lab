import { useState } from "react";
import { TrigSpinMode } from "./components/TrigSpinMode";
import { AllNumbersAnalyze } from "./components/AllNumbersAnalyze";
import { VonNeumannMode } from "./components/VonNeumannMode";

type AppMode = "trig" | "divisors" | "sets";

export function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>("divisors");

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0f] text-zinc-100 overflow-hidden font-sans">
      {/* Top Navigation */}
      <nav className="h-14 px-4 sm:px-6 bg-zinc-950/80 backdrop-blur border-b border-zinc-800/80 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg text-lg">
            ∞
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
              Number<span className="text-cyan-400">Lab</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-normal">
                v2.0
              </span>
            </h1>
            <p className="text-[10px] text-zinc-400 hidden sm:block">
              Trigonometria, Spin, Primos, Divisores & Inteiros Gaussianos
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setCurrentMode("divisors")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              currentMode === "divisors"
                ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>◎</span>
            <span>Geometria & Divisores</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentMode("trig")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              currentMode === "trig"
                ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>∿</span>
            <span>Trigonometria & Spin</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentMode("sets")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              currentMode === "sets"
                ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>∅</span>
            <span>Conjuntos & Ordinais</span>
          </button>
        </div>

        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Pronto</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {currentMode === "divisors" && <AllNumbersAnalyze />}
        {currentMode === "trig" && <TrigSpinMode />}
        {currentMode === "sets" && <VonNeumannMode />}
      </main>
    </div>
  );
}

import React, { useMemo, useRef, useState, useEffect } from "react";
import { getCircles, getIntegerPoints } from "../math/divisor";

type CircleDivisorPlotProps = {
  n: number;
};

const COLORS = [
  "#B6DB00",
  "#E5F0FE",
  "#4B75FF",
  "#FF94DB",
  "#566700",
  "#F59E0B",
  "#00D4FF",
  "#A855F7",
];

export function CircleDivisorPlot({ n }: CircleDivisorPlotProps) {
  const circles = useMemo(() => getCircles(n), [n]);

  const width = 700;
  const height = 700;

  const maxRadius = Math.max(
    ...circles.map((circle) => circle.radius),
    1
  );

  const initialRange = maxRadius + 2;

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<[number, number] | null>(null);

  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Reset zoom & pan when n changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHoveredPoint(null);
  }, [n]);

  const baseScale = Math.min(width, height) / (2 * initialRange);
  const scale = baseScale * zoom;

  const cx = width / 2;
  const cy = height / 2;

  function screenX(x: number) {
    return cx + (x - pan.x) * scale;
  }

  function screenY(y: number) {
    return cy - (y - pan.y) * scale;
  }

  function handleWheel(event: React.WheelEvent<SVGSVGElement>) {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();

    const mouseX = ((event.clientX - rect.left) / rect.width) * width;
    const mouseY = ((event.clientY - rect.top) / rect.height) * height;

    const worldX = pan.x + (mouseX - cx) / scale;
    const worldY = pan.y - (mouseY - cy) / scale;

    const factor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
    const newZoom = Math.max(0.15, Math.min(50, zoom * factor));
    const newScale = baseScale * newZoom;

    const newPanX = worldX - (mouseX - cx) / newScale;
    const newPanY = worldY + (mouseY - cy) / newScale;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }

  function handleMouseDown(event: React.MouseEvent<SVGSVGElement>) {
    dragging.current = true;
    lastMouse.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  function handleMouseMove(event: React.MouseEvent<SVGSVGElement>) {
    if (!dragging.current) return;

    const dx = event.clientX - lastMouse.current.x;
    const dy = event.clientY - lastMouse.current.y;

    const worldDx = dx / scale;
    const worldDy = dy / scale;

    setPan((previous) => ({
      x: previous.x - worldDx,
      y: previous.y + worldDy,
    }));

    lastMouse.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  function handleMouseUp() {
    dragging.current = false;
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  const visibleRange = Math.max(width, height) / (2 * scale);
  const gridStartX = Math.floor(pan.x - visibleRange);
  const gridEndX = Math.ceil(pan.x + visibleRange);
  const gridStartY = Math.floor(pan.y - visibleRange);
  const gridEndY = Math.ceil(pan.y + visibleRange);

  // Dynamic grid step based on zoom
  const step = scale > 80 ? 1 : scale > 30 ? 2 : scale > 10 ? 5 : scale > 3 ? 10 : 25;

  const circlePoints = useMemo(() => {
    return circles.map((circle) => ({
      circle,
      points: getIntegerPoints(circle.r2),
    }));
  }, [circles]);

  const totalPoints = useMemo(() => {
    return circlePoints.reduce((acc, curr) => acc + curr.points.length, 0);
  }, [circlePoints]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="text-zinc-200 font-semibold text-sm">
            Circunferências dos Pares de Divisores
          </h3>
          <p className="text-zinc-400 text-xs">
            x² + y² = a² + b² com a·b = {n} ({circles.length} {circles.length === 1 ? 'par' : 'pares'}, {totalPoints} pontos inteiros)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetView}
            className="px-3 py-1 rounded-md text-xs text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer"
          >
            Resetar Visão
          </button>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#000422]/90">
        <svg
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          className="select-none block"
          style={{
            height: "540px",
            cursor: dragging.current ? "grabbing" : "grab",
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <radialGradient id="originGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ============================= */}
          {/* GRID VERTICAL                 */}
          {/* ============================= */}
          {Array.from(
            { length: Math.ceil((gridEndX - gridStartX) / step) + 1 },
            (_, i) => {
              const x = Math.floor(gridStartX / step) * step + i * step;
              const sx = screenX(x);

              if (sx < -50 || sx > width + 50) return null;

              return (
                <g key={`x-${x}`}>
                  <line
                    x1={sx}
                    y1={0}
                    x2={sx}
                    y2={height}
                    stroke={x === 0 ? "#71717a" : "#1f1f2e"}
                    strokeWidth={x === 0 ? 1.5 : 0.6}
                    strokeDasharray={x === 0 ? "" : "3,3"}
                  />
                  {x !== 0 && (
                    <text
                      x={sx + 4}
                      y={screenY(0) > height - 20 ? height - 10 : screenY(0) < 20 ? 20 : screenY(0) - 5}
                      fill="#71717a"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {x}
                    </text>
                  )}
                </g>
              );
            }
          )}

          {/* ============================= */}
          {/* GRID HORIZONTAL               */}
          {/* ============================= */}
          {Array.from(
            { length: Math.ceil((gridEndY - gridStartY) / step) + 1 },
            (_, i) => {
              const y = Math.floor(gridStartY / step) * step + i * step;
              const sy = screenY(y);

              if (sy < -50 || sy > height + 50) return null;

              return (
                <g key={`y-${y}`}>
                  <line
                    x1={0}
                    y1={sy}
                    x2={width}
                    y2={sy}
                    stroke={y === 0 ? "#71717a" : "#1f1f2e"}
                    strokeWidth={y === 0 ? 1.5 : 0.6}
                    strokeDasharray={y === 0 ? "" : "3,3"}
                  />
                  {y !== 0 && (
                    <text
                      x={screenX(0) < 20 ? 10 : screenX(0) > width - 30 ? width - 30 : screenX(0) + 5}
                      y={sy - 4}
                      fill="#71717a"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {y}
                    </text>
                  )}
                </g>
              );
            }
          )}

          {/* ============================= */}
          {/* EIXO X                        */}
          {/* ============================= */}
          <line
            x1={0}
            y1={screenY(0)}
            x2={width}
            y2={screenY(0)}
            stroke="#a1a1aa"
            strokeWidth={1.5}
          />

          {/* ============================= */}
          {/* EIXO Y                        */}
          {/* ============================= */}
          <line
            x1={screenX(0)}
            y1={0}
            x2={screenX(0)}
            y2={height}
            stroke="#a1a1aa"
            strokeWidth={1.5}
          />

          {/* ============================= */}
          {/* CÍRCULOS                      */}
          {/* ============================= */}
          {circles.map((circle, index) => {
            const color = COLORS[index % COLORS.length];
            return (
              <g key={`${circle.r2}-${index}`}>
                <circle
                  cx={screenX(0)}
                  cy={screenY(0)}
                  r={circle.radius * scale}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  opacity={0.85}
                />
                {/* Visual pair label along circle */}
                <text
                  x={screenX(circle.radius * Math.SQRT1_2)}
                  y={screenY(circle.radius * Math.SQRT1_2) - 8}
                  fill={color}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                  opacity={0.8}
                >
                  [{circle.a}, {circle.b}] r²={circle.r2}
                </text>
              </g>
            );
          })}

          {/* ============================= */}
          {/* PONTOS INTEIROS               */}
          {/* ============================= */}
          {circlePoints.flatMap(({ circle, points }, circleIndex) => {
            const color = COLORS[circleIndex % COLORS.length];

            return points.map(([x, y]) => {
              const sx = screenX(x);
              const sy = screenY(y);

              if (sx < -30 || sx > width + 30 || sy < -30 || sy > height + 30) {
                return null;
              }

              const isHovered = hoveredPoint && hoveredPoint[0] === x && hoveredPoint[1] === y;

              return (
                <g
                  key={`${circle.r2}-${x}-${y}`}
                  onMouseEnter={() => setHoveredPoint([x, y])}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                >
                  {/* Subtle point glow */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={isHovered ? 8 : 5}
                    fill={color}
                    opacity={isHovered ? 1 : 0.85}
                  />

                  {/* Inner dot */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r={isHovered ? 3 : 2}
                    fill="#ffffff"
                  />

                  {/* Point Coordinate Text */}
                  {(scale > 15 || isHovered) && (
                    <text
                      x={sx + 7}
                      y={sy - 7}
                      fill={isHovered ? "#ffffff" : "#e4e4e7"}
                      fontSize={isHovered ? "12" : "10"}
                      fontWeight={isHovered ? "bold" : "normal"}
                      fontFamily="monospace"
                    >
                      ({x},{y})
                    </text>
                  )}
                </g>
              );
            });
          })}

          {/* ============================= */}
          {/* ORIGEM                        */}
          {/* ============================= */}
          <circle
            cx={screenX(0)}
            cy={screenY(0)}
            r={10}
            fill="url(#originGlow)"
          />
          <circle
            cx={screenX(0)}
            cy={screenY(0)}
            r={4}
            fill="#ffffff"
          />
          <text
            x={screenX(0) + 6}
            y={screenY(0) + 14}
            fill="#ffffff"
            fontSize="10"
            fontFamily="monospace"
            opacity={0.6}
          >
            (0,0)
          </text>
        </svg>

        {/* Indicador de zoom e auxílio de navegação */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {hoveredPoint && (
            <div className="px-2.5 py-1 rounded bg-black/70 backdrop-blur border border-zinc-700 text-cyan-400 text-xs font-mono">
              x: {hoveredPoint[0]}, y: {hoveredPoint[1]} | |z|² = {hoveredPoint[0]**2 + hoveredPoint[1]**2}
            </div>
          )}
          <div className="px-2.5 py-1 rounded bg-black/60 backdrop-blur border border-zinc-800 text-zinc-400 text-xs font-mono pointer-events-none">
            Zoom: {zoom.toFixed(2)}×
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 mt-2 px-1">
        <span>Arraste com o mouse para mover • Scroll para zoom</span>
        <span>n = {n}</span>
      </div>
    </div>
  );
}

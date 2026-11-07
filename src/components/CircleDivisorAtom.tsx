import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  getCircles,
  getIntegerPoints,
  formatSqrt,
  formatSqrtMultiple,
} from "../math/divisor";

type CircleDivisorAtomProps = {
  n: number;
};

const COLORS = [
  0xB6DB00,
  0xE5F0FE,
  0x4B75FF,
  0xFF94DB,
  0x566700,
  0xF59E0B,
  0x00D4FF,
  0xA855F7,
];

export function CircleDivisorAtom({ n }: CircleDivisorAtomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [expandedPairIndex, setExpandedPairIndex] = useState<number | null>(null);
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const circles = useMemo(() => getCircles(n), [n]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000422);

    // AMBIENT & POINT LIGHTS for 3D depth
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2, 500);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    const maxRadius = Math.max(
      ...circles.map((circle) => Math.sqrt(circle.r2)),
      1
    );

    // CAMERA
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 320;

    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      2000
    );

    camera.position.set(
      maxRadius * 2.4,
      maxRadius * 1.8,
      maxRadius * 2.4
    );

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1;
    controls.maxDistance = maxRadius * 15;

    // ATOM GROUP
    const atomGroup = new THREE.Group();
    scene.add(atomGroup);

    // SPHERES GEOMETRY
    const sphereRadius = Math.max(maxRadius * 0.015, 0.08);
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 16, 16);

    // CÍRCULOS E PONTOS
    circles.forEach((circle, index) => {
      const radius = Math.sqrt(circle.r2);
      const arcColor = COLORS[index % COLORS.length];

      // ARGOLA (TORUS LINE)
      const segments = 256;
      const circlePoints: THREE.Vector3[] = [];

      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        circlePoints.push(
          new THREE.Vector3(
            radius * Math.cos(theta),
            radius * Math.sin(theta),
            0
          )
        );
      }

      const circleGeometry = new THREE.BufferGeometry().setFromPoints(circlePoints);
      const circleMaterial = new THREE.LineBasicMaterial({
        color: arcColor,
        transparent: true,
        opacity: 0.85,
        linewidth: 2,
      });

      const torus = new THREE.LineLoop(circleGeometry, circleMaterial);

      // INCLINAÇÃO
      const angle = index * 1.1;
      torus.rotation.x = Math.PI * 0.25 * Math.sin(angle);
      torus.rotation.y = Math.PI * 0.35 * Math.cos(angle);
      torus.rotation.z = Math.PI * 0.20 * Math.sin(angle * 1.7);

      atomGroup.add(torus);

      // PONTOS INTEIROS (LATTICE POINTS)
      const integerPoints = getIntegerPoints(circle.r2);

      integerPoints.forEach(([x, y]) => {
        const point = new THREE.Vector3(x, y, 0);
        point.applyEuler(torus.rotation);

        const sphereMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: arcColor,
          emissiveIntensity: 0.9,
          roughness: 0.2,
          metalness: 0.1,
        });

        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(point);
        atomGroup.add(sphere);
      });
    });

    // NÚCLEO / ORIGEM
    const nucleusRadius = Math.max(maxRadius * 0.06, 0.12);
    const nucleusGeometry = new THREE.SphereGeometry(nucleusRadius, 32, 32);
    const nucleusMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00d4ff,
      emissiveIntensity: 1.6,
      roughness: 0.1,
    });

    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    nucleus.position.set(0, 0, 0);
    atomGroup.add(nucleus);

    // RESIZE
    function handleResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
    window.addEventListener("resize", handleResize);

    // ANIMATION LOOP
    let animationId = 0;

    function animate() {
      animationId = requestAnimationFrame(animate);

      if (autoRotateRef.current) {
        atomGroup.rotation.y += 0.003;
        atomGroup.rotation.x += 0.001;
      }

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      controls.dispose();

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [circles]);

  return (
    <div className="mb-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-zinc-200 text-sm font-semibold">
            Modelo Atômico Tridimensional
          </h4>
          <p className="text-zinc-400 text-xs">
            Argolas orbitais inclinadas com pontos inteiros esféricos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
              autoRotate ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {autoRotate ? "Rotação Ativa" : "Pausado"}
          </button>
          <span className="text-zinc-400 text-xs font-mono">
            n = {n}
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full h-72 rounded-lg overflow-hidden select-none bg-[#000422] border border-zinc-800/60"
      />

      <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {circles.map((circle, index) => {
          const hexColor = `#${COLORS[index % COLORS.length]
            .toString(16)
            .padStart(6, "0")}`;

          const isExpanded = expandedPairIndex === index;
          const thetaDeg = (Math.atan2(circle.b, circle.a) * 180 / Math.PI).toFixed(1);
          const tanVal = (circle.b / circle.a).toFixed(2);

          return (
            <div
              key={`${circle.r2}-${index}`}
              className="rounded bg-zinc-800/40 hover:bg-zinc-800/70 transition border border-zinc-700/30 font-mono text-xs overflow-hidden"
            >
              <div
                onClick={() => setExpandedPairIndex(isExpanded ? null : index)}
                className="flex items-center justify-between px-2.5 py-1.5 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: hexColor }}
                  />
                  <span className="text-zinc-300 font-semibold">
                    [{circle.a}, {circle.b}]
                  </span>
                  <span className="text-zinc-400">
                    r = {formatSqrt(circle.r2)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-zinc-400">
                  <span>d = {formatSqrtMultiple(2, circle.r2)}</span>
                  <span>C = {formatSqrtMultiple(2, circle.r2)}π</span>
                  <span className="text-amber-300 font-bold">A = {circle.r2}π</span>
                  <button
                    type="button"
                    title="Ver propriedades trigonométricas e triângulo retângulo"
                    className={`px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer border ${
                      isExpanded
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-700"
                    }`}
                  >
                    📐 {isExpanded ? "▲" : "▼"}
                  </button>
                </div>
              </div>

              {/* Triangle Trigonometry Drawer */}
              {isExpanded && (
                <div className="px-3 py-2 bg-zinc-950/80 border-t border-zinc-700/40 text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-300">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">
                      Triângulo Catetos
                    </span>
                    <span className="text-cyan-300 font-semibold">a = {circle.a}</span>,{" "}
                    <span className="text-amber-300 font-semibold">b = {circle.b}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">
                      Hipotenusa h
                    </span>
                    <span className="text-pink-300 font-semibold">
                      h = {formatSqrt(circle.r2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">
                      Área Invariante
                    </span>
                    <span className="text-amber-300 font-semibold">
                      A = n/2 = {(n / 2).toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">
                      Ângulo θ & tan(θ)
                    </span>
                    <span className="text-purple-300 font-semibold">
                      {thetaDeg}° (tan = {tanVal})
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

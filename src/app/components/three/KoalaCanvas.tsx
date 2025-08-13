"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { usePathname } from "next/navigation";

/** Mapea ruta -> modelo GLB (en /public/models) */
const ROUTE_TO_MODEL: Record<string, string> = {
  "/": "/models/koala_main.glb",
  "/home": "/models/koala_main.glb",
  "/work": "/models/koala_work.glb",
  "/education": "/models/koala_education.glb",
};

function pickModelForPath(pathname: string) {
  if (pathname.startsWith("/work")) return ROUTE_TO_MODEL["/work"];
  if (pathname.startsWith("/education")) return ROUTE_TO_MODEL["/education"];
  if (pathname === "/" || pathname.startsWith("/home")) return ROUTE_TO_MODEL["/"];
  // fallback
  return ROUTE_TO_MODEL["/"];
}

/** Carga y pinta un GLB */
function GLB({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  // opcional: centrar/escala si hiciera falta
  return <primitive object={scene} />;
}

// Preload de los modelos para cambios fluidos
useGLTF.preload("/models/koala_main.glb");
useGLTF.preload("/models/koala_work.glb");
useGLTF.preload("/models/koala_education.glb");

/** Gestiona: giro por cambio de ruta + giro idle cuando no hay interacción */
function SpinningSwitcher({
  url,
  duration = 1.0,        // seg. para la animación de cambio
  idleSpeed = 0.6,        // radianes/segundo mientras está en reposo
}: {
  url: string;
  duration?: number;
  idleSpeed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [rotationProgress, setRotationProgress] = useState<number | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Cuando cambia la url target, lanzamos el giro si no estamos ya girando
  useEffect(() => {
    if (url !== currentUrl && rotationProgress === null) {
      setRotationProgress(0);
    }
  }, [url, currentUrl, rotationProgress]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    // Animación de cambio de modelo (180º)
    if (rotationProgress !== null) {
      const newProgress = rotationProgress + delta / duration; // 0..1
      g.rotation.y = Math.PI * newProgress; // 0..PI (180º)

      // A mitad de giro hacemos el swap del modelo
      if (newProgress >= 0.5 && currentUrl !== url) {
        setCurrentUrl(url);
      }

      if (newProgress >= 1) {
        // Reseteo final
        g.rotation.y = 0;
        setRotationProgress(null);
      } else {
        setRotationProgress(newProgress);
      }
    }
    // Giro idle cuando no hay interacción
    else if (!isUserInteracting) {
      g.rotation.y += idleSpeed * delta;
    }
  });

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        <GLB url={currentUrl} />
      </Suspense>
      {/* Luz suave extra por si el Environment no llega */}
      <hemisphereLight intensity={0.5} />
      <directionalLight position={[2, 5, 3]} intensity={1.2} />
      <Environment preset="city" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        onStart={() => setIsUserInteracting(true)}
        onEnd={() => setIsUserInteracting(false)}
      />
    </group>
  );
}

export default function KoalaCanvas() {
  const pathname = usePathname();
  const modelUrl: string = useMemo(() => pickModelForPath(pathname || "/"), [pathname]) || "/";

  return (
    <div id="koala-canvas-container" aria-hidden>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [10, 15.3, 15.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <SpinningSwitcher url={modelUrl} />
      </Canvas>
    </div>
  );
}


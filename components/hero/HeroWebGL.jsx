"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import AICoreScene from "./AICoreScene";

export default function HeroWebGL({ reducedMotion, className = "" }) {
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const [tabVisible, setTabVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const f = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, []);

  useEffect(() => {
    const onModalState = (e) => {
      setModalOpen(Boolean(e?.detail?.open));
    };
    window.addEventListener("lead-modal:state", onModalState);
    return () => window.removeEventListener("lead-modal:state", onModalState);
  }, []);

  const onMove = (e) => {
    if (modalOpen) return;
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -((e.clientY / window.innerHeight) * 2 - 1);
    const m = mouseRef.current;
    const s = 0.11;
    const px = m.x ?? 0;
    const py = m.y ?? 0;
    m.vx = (nx - px) * 0.12 + (m.vx || 0) * 0.58;
    m.vy = (ny - py) * 0.12 + (m.vy || 0) * 0.58;
    m.x = px + (nx - px) * s;
    m.y = py + (ny - py) * s;
  };
  const onLeave = () => {
    mouseRef.current.x = 0;
    mouseRef.current.y = 0;
  };

  return (
    <div
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-hidden
    >
      <Canvas
        frameloop={tabVisible && !modalOpen ? "always" : "never"}
        camera={{ position: [0, 0.15, 8.8], fov: 42 }}
        gl={{
          powerPreference: "high-performance",
          antialias: false,
          alpha: false,
          stencil: false,
        }}
        dpr={[1, Math.min(1.5, typeof window !== "undefined" ? window.devicePixelRatio : 1)]}
      >
        <Suspense fallback={null}>
          <AICoreScene mouseRef={mouseRef} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}

"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  SHELL_COUNT,
  fibonacciSpherePoints,
  buildShellEdges,
  coreLinkIndices,
} from "@/lib/aiCoreGeometry";

const CAM_BASE = new THREE.Vector3(0, 0.15, 8.8);
const ORIGIN = new THREE.Vector3(0, 0.02, 0);
const LIGHT_TARGET = new THREE.Vector3();
const COL_INDIGO = new THREE.Color(0x6366f1);
const COL_SOFT = new THREE.Color(0x818cf8);

function SceneContent({ mouseRef, reducedMotion }) {
  const rootRef = useRef(null);
  const instRef = useRef(null);
  const linesRef = useRef(null);
  const chipGroupRef = useRef(null);
  const lightRef = useRef(null);
  const probeRefs = [useRef(), useRef(), useRef()];
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const energy = useRef(0);
  const yaw = useRef(0);
  const flowPhase = useRef(0);
  const seeded = useRef(false);
  const closestOnRay = useMemo(() => new THREE.Vector3(), []);
  const lightPos = useMemo(() => new THREE.Vector3(2, 1, 5), []);

  const shell = useMemo(() => fibonacciSpherePoints(SHELL_COUNT, 3.15), []);
  const edges = useMemo(() => buildShellEdges(shell), [shell]);
  const toCore = useMemo(() => coreLinkIndices(SHELL_COUNT, 4), []);

  const { lineGeo, lineMat } = useMemo(() => {
    const segCount = edges.length + toCore.length;
    const pos = new Float32Array(segCount * 6);
    let o = 0;
    for (const [a, b] of edges) {
      pos[o++] = shell[a][0];
      pos[o++] = shell[a][1];
      pos[o++] = shell[a][2];
      pos[o++] = shell[b][0];
      pos[o++] = shell[b][1];
      pos[o++] = shell[b][2];
    }
    for (const i of toCore) {
      pos[o++] = shell[i][0];
      pos[o++] = shell[i][1];
      pos[o++] = shell[i][2];
      pos[o++] = 0;
      pos[o++] = 0;
      pos[o++] = 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    return { lineGeo: geo, lineMat: mat };
  }, [shell, edges, toCore]);

  const chipEdgesGeo = useMemo(() => {
    const b = new THREE.BoxGeometry(0.42, 0.11, 0.42);
    const e = new THREE.EdgesGeometry(b);
    b.dispose();
    return e;
  }, []);

  const sphereGeo = useMemo(
    () => new THREE.SphereGeometry(0.085, 10, 10),
    []
  );
  const nodeMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xa5b4fc,
        transparent: true,
        opacity: 0.92,
      }),
    []
  );
  const probeGeo = useMemo(() => new THREE.SphereGeometry(0.055, 8, 8), []);
  const probeMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xc4b5fd,
        transparent: true,
        opacity: 0.85,
      }),
    []
  );

  useEffect(() => {
    return () => {
      lineGeo.dispose();
      lineMat.dispose();
      sphereGeo.dispose();
      nodeMat.dispose();
      probeGeo.dispose();
      probeMat.dispose();
      chipEdgesGeo.dispose();
    };
  }, [
    lineGeo,
    lineMat,
    sphereGeo,
    nodeMat,
    probeGeo,
    probeMat,
    chipEdgesGeo,
  ]);

  const { camera } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const m = mouseRef.current;
    const mx = m.x ?? 0;
    const my = m.y ?? 0;

    /* Спокойная «энергия» от движения мыши — без рывков */
    m.vx = THREE.MathUtils.lerp(m.vx ?? 0, 0, 0.04);
    m.vy = THREE.MathUtils.lerp(m.vy ?? 0, 0, 0.04);
    const move = Math.min(1, Math.hypot(m.vx, m.vy) * 2.2);
    energy.current = THREE.MathUtils.lerp(energy.current, move * 0.35 + 0.15, 0.06);

    pointer.x = mx;
    pointer.y = my;
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.closestPointToPoint(ORIGIN, closestOnRay);
    const rayProximity = Math.min(
      1,
      Math.max(0, 1 - closestOnRay.distanceTo(ORIGIN) / 2.8)
    );

    flowPhase.current += delta * 0.55;
    const flow =
      0.03 * Math.sin(flowPhase.current) +
      0.02 * Math.sin(t * 0.9 + mx * 1.8 + my);

    if (!reducedMotion) {
      camera.position.x = THREE.MathUtils.lerp(
        camera.position.x,
        CAM_BASE.x + mx * 0.34,
        0.028
      );
      camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        CAM_BASE.y + my * 0.12,
        0.028
      );
      camera.position.z = THREE.MathUtils.lerp(
        camera.position.z,
        CAM_BASE.z - Math.hypot(mx, my) * 0.09,
        0.022
      );
      camera.lookAt(ORIGIN);
    } else {
      camera.position.lerp(CAM_BASE, 0.08);
      camera.lookAt(0, 0, 0);
    }

    if (lightRef.current && !reducedMotion) {
      raycaster.ray.at(5.2 + energy.current * 0.8, LIGHT_TARGET);
      lightPos.lerp(LIGHT_TARGET, 0.045);
      lightRef.current.position.copy(lightPos);
      lightRef.current.intensity =
        0.05 + rayProximity * 0.1 + energy.current * 0.06;
    } else if (lightRef.current) {
      lightRef.current.intensity = 0.04;
      lightRef.current.position.set(2.2, 0.8, 4.5);
    }

    const mesh = instRef.current;
    let hit = -1;
    if (mesh) {
      const hits = raycaster.intersectObject(mesh, false);
      if (hits.length && hits[0].instanceId != null)
        hit = hits[0].instanceId;
    }

    const hoverBoost = hit >= 0 ? 0.14 : 0;
    const lineOpacity =
      0.12 +
      energy.current * 0.22 +
      rayProximity * 0.12 +
      hoverBoost +
      flow +
      (reducedMotion ? 0.02 : Math.sin(t * 1.1) * 0.025);
    lineMat.opacity = THREE.MathUtils.clamp(lineOpacity, 0.1, 0.58);
    const tone = THREE.MathUtils.clamp(
      hoverBoost * 2.8 + rayProximity * 0.35,
      0,
      1
    );
    lineMat.color.copy(COL_INDIGO).lerp(COL_SOFT, tone);

    if (rootRef.current && !reducedMotion) {
      yaw.current += delta * 0.09;
      rootRef.current.rotation.y = THREE.MathUtils.lerp(
        rootRef.current.rotation.y,
        yaw.current + mx * 0.28,
        0.045
      );
      rootRef.current.rotation.x = THREE.MathUtils.lerp(
        rootRef.current.rotation.x,
        -my * 0.16,
        0.05
      );
      rootRef.current.rotation.z = THREE.MathUtils.lerp(
        rootRef.current.rotation.z,
        mx * my * 0.04,
        0.04
      );
    } else if (rootRef.current && reducedMotion) {
      rootRef.current.rotation.y = t * 0.035;
      rootRef.current.rotation.x = 0.06;
      rootRef.current.rotation.z = 0;
    }

    if (chipGroupRef.current && !reducedMotion) {
      chipGroupRef.current.rotation.y = Math.sin(t * 0.35) * 0.04 + mx * 0.06;
      chipGroupRef.current.rotation.x = my * 0.05;
    }

    if (mesh && !seeded.current) {
      seeded.current = true;
      for (let i = 0; i < SHELL_COUNT; i++) {
        dummy.position.set(shell[i][0], shell[i][1], shell[i][2]);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    if (mesh) {
      const pulse = reducedMotion ? 0.025 : 0.06 + energy.current * 0.08;
      for (let i = 0; i < SHELL_COUNT; i++) {
        dummy.position.set(shell[i][0], shell[i][1], shell[i][2]);
        const near =
          i === hit ? 0.38 : i % 7 === Math.floor(t * 2 + mx * 3) % 7 ? 0.08 : 0;
        const w =
          1 +
          Math.sin(t * 1.25 + i * 0.1) * pulse +
          near +
          rayProximity * 0.06;
        dummy.scale.setScalar(0.78 * w);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    const orbits = [1.55, 2.05, 2.48];
    const speeds = [0.42, 0.32, -0.36];
    probeMat.opacity = THREE.MathUtils.clamp(
      0.72 + hoverBoost * 1.8 + rayProximity * 0.1,
      0.48,
      0.95
    );
    probeRefs.forEach((pr, i) => {
      if (!pr.current) return;
      const ang = t * speeds[i] + i * 2.1;
      const R = orbits[i];
      pr.current.position.set(
        Math.cos(ang) * R,
        Math.sin(ang * 0.65) * 0.32,
        Math.sin(ang) * R
      );
      const sc =
        1 +
        (hit >= 0 ? 0.15 : 0) +
        energy.current * 0.35 +
        (reducedMotion ? 0 : Math.sin(t * 2.2 + i) * 0.06);
      pr.current.scale.setScalar(sc);
    });
  });

  return (
    <group ref={rootRef}>
      <pointLight
        ref={lightRef}
        color="#a5b4fc"
        intensity={0.06}
        distance={14}
        decay={2}
      />

      <group ref={chipGroupRef}>
        <mesh>
          <boxGeometry args={[0.42, 0.11, 0.42]} />
          <meshBasicMaterial
            color="#1e1b4b"
            transparent
            opacity={0.78}
          />
        </mesh>
        <lineSegments geometry={chipEdgesGeo}>
          <lineBasicMaterial
            color="#818cf8"
            transparent
            opacity={0.52}
            depthWrite={false}
          />
        </lineSegments>
        <mesh rotation={[Math.PI / 4, Math.PI / 5, 0]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshBasicMaterial
            color="#6366f1"
            wireframe
            transparent
            opacity={0.32}
            depthWrite={false}
          />
        </mesh>
      </group>

      <lineSegments ref={linesRef} geometry={lineGeo} material={lineMat} />

      <instancedMesh
        ref={instRef}
        args={[sphereGeo, nodeMat, SHELL_COUNT]}
        frustumCulled={false}
      />

      {probeRefs.map((ref, i) => (
        <mesh key={i} ref={ref} geometry={probeGeo} material={probeMat} />
      ))}
    </group>
  );
}

export default function AICoreScene({ mouseRef, reducedMotion }) {
  return (
    <>
      <color attach="background" args={["#050508"]} />
      <fog attach="fog" args={["#050508", 5.5, 19]} />
      <SceneContent mouseRef={mouseRef} reducedMotion={reducedMotion} />
    </>
  );
}

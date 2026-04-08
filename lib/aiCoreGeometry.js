/**
 * Геометрия сцены «AI-ядро»: оболочка узлов + рёбра без тяжёлого рантайма.
 */

export const SHELL_COUNT = 42;
export const K_NEIGH = 3;

export function fibonacciSpherePoints(count, radius) {
  const pts = [];
  const inc = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const y = 1 - 2 * t;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = inc * i;
    pts.push([
      Math.cos(phi) * r * radius,
      y * radius + (Math.random() - 0.5) * 0.08,
      Math.sin(phi) * r * radius,
    ]);
  }
  return pts;
}

export function buildShellEdges(pts) {
  const n = pts.length;
  const set = new Set();
  const edges = [];
  for (let i = 0; i < n; i++) {
    const dists = [];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const dx = pts[i][0] - pts[j][0];
      const dy = pts[i][1] - pts[j][1];
      const dz = pts[i][2] - pts[j][2];
      dists.push({ j, d: dx * dx + dy * dy + dz * dz });
    }
    dists.sort((a, b) => a.d - b.d);
    for (let k = 0; k < K_NEIGH; k++) {
      const j = dists[k].j;
      const a = Math.min(i, j);
      const b = Math.max(i, j);
      const key = `${a},${b}`;
      if (!set.has(key)) {
        set.add(key);
        edges.push([a, b]);
      }
    }
  }
  return edges;
}

export function coreLinkIndices(count, step = 4) {
  const arr = [];
  for (let i = 0; i < count; i += step) arr.push(i);
  return arr;
}

// The snowfield is a large virtual plane the viewer pans around.
// Positions are stored in these world units (roughly pixels at 1x).
export const FIELD = {
  width: 1700,
  height: 1150,
  margin: 120,
};

const MIN_DIST = 210; // keep notes from stacking / clipping text

export function randomPosition(existing: { x: number; y: number }[] = []): {
  x: number;
  y: number;
} {
  const rx = () => FIELD.margin + Math.random() * (FIELD.width - 2 * FIELD.margin);
  const ry = () => FIELD.margin + Math.random() * (FIELD.height - 2 * FIELD.margin);

  let best = { x: rx(), y: ry() };
  let bestGap = -1;
  for (let attempt = 0; attempt < 60; attempt++) {
    const cand = { x: rx(), y: ry() };
    let gap = Infinity;
    for (const p of existing) {
      const d = Math.hypot(cand.x - p.x, cand.y - p.y);
      if (d < gap) gap = d;
    }
    if (gap >= MIN_DIST) return cand;
    if (gap > bestGap) {
      bestGap = gap;
      best = cand;
    }
  }
  return best; // field is crowded — take the roomiest spot we found
}

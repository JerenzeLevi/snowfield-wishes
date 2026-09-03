// The snowfield is a large virtual plane the viewer pans around.
// Positions are stored in these world units (roughly pixels at 1x).
export const FIELD = {
  width: 2600,
  height: 1800,
  margin: 140,
};

export function randomPosition(): { x: number; y: number } {
  return {
    x: FIELD.margin + Math.random() * (FIELD.width - 2 * FIELD.margin),
    y: FIELD.margin + Math.random() * (FIELD.height - 2 * FIELD.margin),
  };
}

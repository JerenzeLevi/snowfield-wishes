export type Mood = "longing" | "gratitude" | "hopes";

export const MOODS: {
  key: Mood;
  label: string;
  blurb: string;
  seal: string; // seal / ribbon colour
  ink: string; // readable text on the seal
}[] = [
  {
    key: "longing",
    label: "Longing & Distance",
    blurb: "for someone far away or missed this holiday",
    seal: "#7a1f2b", // festive burgundy
    ink: "#ffe9ec",
  },
  {
    key: "gratitude",
    label: "Quiet Gratitude",
    blurb: "for small blessings or someone special",
    seal: "#1f4d3a", // deep pine green
    ink: "#e9fff4",
  },
  {
    key: "hopes",
    label: "Hopes for the New Year",
    blurb: "for courage, fresh starts, or dreams",
    seal: "#b8860b", // warm gold
    ink: "#fff7e2",
  },
];

export const moodMap: Record<Mood, (typeof MOODS)[number]> = MOODS.reduce(
  (acc, m) => {
    acc[m.key] = m;
    return acc;
  },
  {} as Record<Mood, (typeof MOODS)[number]>,
);

export function isMood(v: unknown): v is Mood {
  return v === "longing" || v === "gratitude" || v === "hopes";
}

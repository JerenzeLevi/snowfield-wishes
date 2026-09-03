import { moodMap, type Mood } from "@/lib/mood";

const LETTER: Record<Mood, string> = {
  longing: "L",
  gratitude: "G",
  hopes: "H",
};

export default function MoodSeal({
  mood,
  size = 34,
  title = true,
}: {
  mood: Mood;
  size?: number;
  title?: boolean;
}) {
  const m = moodMap[mood];
  return (
    <span
      className="wax-seal"
      title={title ? m.label : undefined}
      style={{
        width: size,
        height: size,
        background: m.seal,
        color: m.ink,
        fontSize: size * 0.5,
      }}
      aria-label={m.label}
    >
      {LETTER[mood]}
    </span>
  );
}

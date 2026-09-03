// Small best-effort wordlist filter. Not exhaustive — the report/hide flow and
// the /admin view are the real safety net.
const BLOCKLIST = [
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "asshole",
  "bastard",
  "dick",
  "piss",
  "slut",
  "whore",
  "nigger",
  "faggot",
  "retard",
  "rape",
  "kys",
];

const LEET: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[013457@$]/g, (c) => LEET[c] ?? c)
    .replace(/[^a-z]+/g, " ");
}

export function findProfanity(text: string): string | null {
  const normalized = normalize(text);
  const collapsed = normalized.replace(/\s+/g, "");
  for (const word of BLOCKLIST) {
    const wordRe = new RegExp(`\\b${word}\\b`);
    if (wordRe.test(normalized) || collapsed.includes(word)) {
      return word;
    }
  }
  return null;
}

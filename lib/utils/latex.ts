// lib/utils/latex.ts
export function normalizeLatex(input?: string | null) {
  if (!input) return null;

  let s = String(input).trim();

  // enlève $$ ... $$ ou $ ... $
  if (s.startsWith("$$") && s.endsWith("$$")) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith("$") && s.endsWith("$")) {
    s = s.slice(1, -1).trim();
  }

  return s;
}
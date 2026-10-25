/**
 * Tiny, safe expression evaluator for the public calculator (no `eval`).
 * Supports + − × ÷ (also + - * /), postfix % (divide by 100), parentheses,
 * decimals and unary minus, with normal operator precedence.
 */

type Token = { type: "num"; value: number } | { type: "op"; value: string } | { type: "paren"; value: "(" | ")" };

const PRECEDENCE: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "neg": 3, "%": 4 };

function normalise(expr: string) {
  return expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, "");
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      const text = expr.slice(i, j);
      if ((text.match(/\./g) ?? []).length > 1) throw new Error("Invalid number");
      tokens.push({ type: "num", value: Number(text) });
      i = j;
    } else if (c === "(" || c === ")") {
      tokens.push({ type: "paren", value: c });
      i++;
    } else if ("+-*/%".includes(c)) {
      const prev = tokens.at(-1);
      // A minus at the start, after an operator or after "(" is a negative sign
      const unary = c === "-" && (!prev || (prev.type === "op" && prev.value !== "%") || (prev.type === "paren" && prev.value === "("));
      tokens.push({ type: "op", value: unary ? "neg" : c });
      i++;
    } else {
      throw new Error("Invalid character");
    }
  }
  return tokens;
}

/** Evaluates the expression; throws on invalid input or division by zero. */
export function evaluate(input: string): number {
  const tokens = tokenize(normalise(input));
  if (tokens.length === 0) throw new Error("Empty");

  const output: number[] = [];
  const ops: string[] = [];

  const apply = (op: string) => {
    if (op === "neg" || op === "%") {
      const a = output.pop();
      if (a === undefined) throw new Error("Invalid expression");
      output.push(op === "neg" ? -a : a / 100);
      return;
    }
    const b = output.pop();
    const a = output.pop();
    if (a === undefined || b === undefined) throw new Error("Invalid expression");
    if (op === "/" && b === 0) throw new Error("Division by zero");
    output.push(op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b);
  };

  for (const t of tokens) {
    if (t.type === "num") output.push(t.value);
    else if (t.type === "paren" && t.value === "(") ops.push("(");
    else if (t.type === "paren") {
      while (ops.length && ops.at(-1) !== "(") apply(ops.pop()!);
      if (ops.pop() !== "(") throw new Error("Mismatched parentheses");
    } else if (t.value === "%") {
      apply("%"); // postfix: applies immediately to the number before it
    } else {
      const right = t.value === "neg"; // unary minus is right-associative
      while (ops.length && ops.at(-1) !== "(" && (PRECEDENCE[ops.at(-1)!] > PRECEDENCE[t.value] || (!right && PRECEDENCE[ops.at(-1)!] === PRECEDENCE[t.value]))) {
        apply(ops.pop()!);
      }
      ops.push(t.value);
    }
  }
  while (ops.length) {
    const op = ops.pop()!;
    if (op === "(") throw new Error("Mismatched parentheses");
    apply(op);
  }
  if (output.length !== 1 || !Number.isFinite(output[0])) throw new Error("Invalid expression");
  // Remove floating-point noise such as 0.1 + 0.2 = 0.30000000000000004
  return Number(output[0].toPrecision(12));
}

/** Indian digit grouping, up to 10 decimals. */
export function formatResult(value: number): string {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 10 });
}

// ---------- history with 24-hour expiry (browser localStorage) ----------

export type HistoryEntry = { expression: string; result: string; at: number };

export const HISTORY_KEY = "victory-youth:calculator-history";
export const HISTORY_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 50;

/** Entries younger than 24 hours. Storage errors (private mode etc.) → empty list. */
export function loadHistory(now = Date.now()): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const entries: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    const fresh = entries.filter((e) => typeof e?.at === "number" && now - e.at < HISTORY_TTL_MS);
    if (fresh.length !== entries.length) saveHistory(fresh); // permanently delete expired entries
    return fresh;
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  try {
    if (entries.length === 0) window.localStorage.removeItem(HISTORY_KEY);
    else window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // storage unavailable — history simply isn't kept
  }
}

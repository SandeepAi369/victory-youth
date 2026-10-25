/**
 * Tiny, safe expression evaluator for the public calculator (no `eval`).
 * Supports + − × ÷ (also + - * /), phone-style % (200+10% = 220, 200×10% = 20),
 * parentheses, decimals and unary minus, with normal operator precedence.
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

  // `pct` remembers the original number of a "b%" operand, so that + and −
  // can treat it like a phone calculator: 200 + 10% = 200 + (10% of 200) = 220.
  type Operand = { value: number; pct?: number };
  const output: Operand[] = [];
  const ops: string[] = [];

  const apply = (op: string) => {
    if (op === "neg" || op === "%") {
      const a = output.pop();
      if (a === undefined) throw new Error("Invalid expression");
      output.push(op === "neg" ? { value: -a.value } : { value: a.value / 100, pct: a.value });
      return;
    }
    const b = output.pop();
    const a = output.pop();
    if (a === undefined || b === undefined) throw new Error("Invalid expression");
    const right = (op === "+" || op === "-") && b.pct !== undefined ? (a.value * b.pct) / 100 : b.value;
    if (op === "/" && right === 0) throw new Error("Division by zero");
    output.push({ value: op === "+" ? a.value + right : op === "-" ? a.value - right : op === "*" ? a.value * right : a.value / right });
  };

  for (const t of tokens) {
    if (t.type === "num") output.push({ value: t.value });
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
  if (output.length !== 1 || !Number.isFinite(output[0].value)) throw new Error("Invalid expression");
  // Remove floating-point noise such as 0.1 + 0.2 = 0.30000000000000004
  return Number(output[0].value.toPrecision(12));
}

// ---------- keypad input rules (pure, so they can be unit-tested) ----------

export type CalcState = { expr: string; showingResult: boolean };
export const INITIAL_STATE: CalcState = { expr: "", showingResult: false };

const BINARY = ["+", "−", "×", "÷"];
const MAX_LENGTH = 40;

/** The number currently being typed at the end of the expression (e.g. "12.5" in "3+12.5"). */
function currentNumber(expr: string) {
  return expr.match(/[0-9.]*$/)?.[0] ?? "";
}

/**
 * Applies one keypad key (digits, ".", + − × ÷, %, ±, ⌫, AC, "(", ")") and
 * returns the new state. "=" is handled by the caller (it evaluates).
 */
export function inputKey(state: CalcState, key: string): CalcState {
  let { expr } = state;
  const fresh = state.showingResult;
  if (key === "AC") return INITIAL_STATE;
  if (key === "⌫") return fresh ? INITIAL_STATE : { expr: expr.slice(0, -1), showingResult: false };

  if (/^[0-9]$/.test(key) || key === ".") {
    if (fresh) expr = ""; // typing after "=" starts a new calculation
    if (expr.length >= MAX_LENGTH || expr.endsWith("%") || expr.endsWith(")")) return state;
    const num = currentNumber(expr);
    if (key === ".") {
      if (num.includes(".")) return state; // one decimal point per number
      return { expr: expr + (num === "" ? "0." : "."), showingResult: false };
    }
    if (num === "0") return { expr: expr.slice(0, -1) + key, showingResult: false }; // no "007"
    return { expr: expr + key, showingResult: false };
  }

  if (BINARY.includes(key)) {
    if (expr === "" || expr === "−") return key === "−" ? { expr: "−", showingResult: false } : state;
    if (expr.endsWith(".")) expr = expr.slice(0, -1);
    const last = expr.slice(-1);
    if (BINARY.includes(last)) {
      // 5×− (negative number) is allowed; otherwise replace the previous operator(s)
      if (key === "−" && (last === "×" || last === "÷")) return { expr: expr + key, showingResult: false };
      expr = expr.replace(/[+−×÷]+$/, "");
      if (expr === "") return state;
    }
    if (expr.endsWith("(")) return key === "−" ? { expr: expr + key, showingResult: false } : state;
    return { expr: expr + key, showingResult: false };
  }

  if (key === "%") {
    if (/[0-9)]$/.test(expr)) return { expr: expr + "%", showingResult: false };
    return state;
  }

  if (key === "±") {
    // Toggle the sign of the number at the end of the expression
    const m = expr.match(/(^|[+−×÷(])(−?)([0-9.]+%?)$/);
    if (!m) return state;
    const start = expr.length - m[2].length - m[3].length;
    return { expr: expr.slice(0, start) + (m[2] ? "" : "−") + m[3], showingResult: false };
  }

  if (key === "(") {
    if (fresh) expr = "";
    if (/[0-9.%)]$/.test(expr)) return state;
    return { expr: expr + "(", showingResult: false };
  }
  if (key === ")") {
    const open = (expr.match(/\(/g) ?? []).length - (expr.match(/\)/g) ?? []).length;
    if (open > 0 && /[0-9.%)]$/.test(expr)) return { expr: expr + ")", showingResult: false };
    return state;
  }
  return state;
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

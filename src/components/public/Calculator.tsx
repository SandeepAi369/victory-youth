"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Clock, Delete, Trash2, X } from "lucide-react";
import {
  evaluate,
  formatResult,
  inputKey,
  INITIAL_STATE,
  loadHistory,
  saveHistory,
  type CalcState,
  type HistoryEntry,
} from "@/lib/calculator";

type KeyStyle = "fn" | "op" | "num" | "eq";
const KEYS: { key: string; label?: string; style: KeyStyle; aria?: string }[] = [
  { key: "AC", style: "fn", aria: "All clear" },
  { key: "⌫", style: "fn", aria: "Backspace" },
  { key: "%", style: "fn", aria: "Percent" },
  { key: "÷", style: "op", aria: "Divide" },
  { key: "7", style: "num" }, { key: "8", style: "num" }, { key: "9", style: "num" },
  { key: "×", style: "op", aria: "Multiply" },
  { key: "4", style: "num" }, { key: "5", style: "num" }, { key: "6", style: "num" },
  { key: "−", style: "op", aria: "Minus" },
  { key: "1", style: "num" }, { key: "2", style: "num" }, { key: "3", style: "num" },
  { key: "+", style: "op", aria: "Plus" },
  { key: "±", label: "+/−", style: "fn", aria: "Change sign" },
  { key: "0", style: "num" },
  { key: ".", style: "num", aria: "Decimal point" },
  { key: "=", style: "eq", aria: "Equals" },
];

const KEY_CLASS: Record<KeyStyle, string> = {
  num: "bg-white text-stone-900 border border-stone-200 shadow-sm hover:bg-stone-50 dark:bg-stone-800 dark:text-white dark:border-stone-700 dark:hover:bg-stone-700",
  fn: "bg-stone-200 text-stone-800 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-100 dark:hover:bg-stone-600",
  op: "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:hover:bg-orange-500/30",
  eq: "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-red-600",
};

const timeFormat = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });

/** Big-number font size that shrinks as the text gets longer. */
function displaySize(text: string) {
  if (text.length > 18) return "text-2xl";
  if (text.length > 13) return "text-3xl";
  if (text.length > 9) return "text-4xl";
  return "text-5xl";
}

/** Homepage launcher: a round icon like the five quick-link icons above it. */
export function CalculatorLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex flex-col items-center text-center group" aria-haspopup="dialog">
        {/* Same look as the five emoji quick-link icons above it */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center text-xl sm:text-2xl mb-1.5 group-hover:scale-110 transition-transform border-orange-400 dark:border-yellow-600 bg-orange-50 dark:bg-yellow-900/20">
          <span aria-hidden>🧮</span>
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-orange-700 dark:text-yellow-400">Calculator</span>
      </button>
      {open && createPortal(<CalculatorDialog onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function CalculatorDialog({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<CalcState>(INITIAL_STATE);
  const [lastExpression, setLastExpression] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [showHistory, setShowHistory] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Cover the page: lock background scrolling while open, and move focus into the calculator
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Expire entries older than 24 hours while the calculator stays open
  useEffect(() => {
    const timer = setInterval(() => setHistory(loadHistory()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const { expr, showingResult } = state;
  let preview = "";
  if (!showingResult && /[+−×÷%]/.test(expr.replace(/^−/, ""))) {
    try {
      preview = formatResult(evaluate(expr));
    } catch {
      preview = "";
    }
  }

  const press = useCallback(
    (key: string) => {
      setError("");
      if (key !== "=") {
        setState((s) => inputKey(s, key));
        return;
      }
      if (!expr || showingResult) return;
      try {
        const result = formatResult(evaluate(expr));
        // Side effects stay outside state updaters (React may call updaters twice)
        const next = [{ expression: expr, result, at: Date.now() }, ...loadHistory()];
        saveHistory(next);
        setHistory(next);
        setLastExpression(expr);
        setState({ expr: result.replace(/,/g, "").replace(/^-/, "−"), showingResult: true });
      } catch (e) {
        setError(e instanceof Error && e.message === "Division by zero" ? "Can't divide by zero" : "Incomplete calculation");
      }
    },
    [expr, showingResult]
  );

  // Keyboard support
  useEffect(() => {
    const map: Record<string, string> = { "*": "×", x: "×", "/": "÷", "-": "−", Enter: "=", "=": "=", Backspace: "⌫", Delete: "AC", c: "AC" };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") return onClose();
      const key = map[ev.key] ?? ev.key;
      if (/^[0-9.()+%]$/.test(key) || ["×", "÷", "−", "=", "⌫", "AC"].includes(key)) {
        ev.preventDefault();
        press(key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, press]);

  const clearHistory = () => {
    saveHistory([]);
    setHistory([]);
  };

  const shown = expr || "0";
  const topLine = showingResult ? `${lastExpression} =` : preview ? `= ${preview}` : "";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-stretch sm:items-center justify-center bg-stone-950/70 backdrop-blur-sm sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calculator-title"
        className="flex flex-col w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-sm bg-stone-50 dark:bg-stone-900 sm:rounded-[2rem] shadow-2xl sm:border border-stone-200 dark:border-stone-700 overflow-hidden outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
          <h2 id="calculator-title" className="flex items-center gap-2 text-base font-bold text-stone-900 dark:text-white">
            <span aria-hidden className="text-xl">🧮</span> Calculator
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close calculator"
            className="w-10 h-10 rounded-full flex items-center justify-center text-stone-600 bg-stone-200/70 hover:bg-stone-300 dark:text-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display: grows on phones so the keypad sits at the bottom, like a phone calculator */}
        <div className="flex-1 sm:flex-none flex flex-col justify-end px-6 pt-4 pb-5 min-h-[9rem] text-right" aria-live="polite">
          <div className="min-h-[1.5rem] text-base text-stone-500 dark:text-stone-400 truncate">
            {error ? <span className="text-red-600 dark:text-red-400 font-semibold">{error}</span> : topLine}
          </div>
          <div className={`${displaySize(shown)} font-light tracking-tight text-stone-900 dark:text-white break-all leading-tight`}>{shown}</div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3 px-5 pb-4">
          {KEYS.map(({ key, label, style, aria }) => (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              aria-label={aria ?? key}
              className={`aspect-square sm:aspect-auto sm:h-16 rounded-2xl select-none ${style === "op" || style === "eq" ? "text-3xl font-semibold" : "text-2xl font-medium"} transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${KEY_CLASS[style]}`}
            >
              {key === "⌫" ? <Delete className="w-6 h-6 mx-auto" aria-hidden /> : label ?? key}
            </button>
          ))}
        </div>

        {/* History (collapsible) + the 24-hour notice, always visible */}
        <div className="border-t border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-950/40 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              aria-expanded={showHistory}
              className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 dark:text-stone-200"
            >
              <Clock className="w-4 h-4" aria-hidden /> History ({history.length})
              <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {history.length > 0 && (
              <button type="button" onClick={clearHistory} aria-label="Clear history" className="flex items-center gap-1 text-xs text-stone-500 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" aria-hidden /> Clear
              </button>
            )}
          </div>
          <p className="mt-1.5 text-xs font-medium text-orange-700 dark:text-yellow-400">
            Calculation history is automatically deleted after 24 hours.
          </p>
          {showHistory && (
            <ul className="mt-2 max-h-40 overflow-y-auto space-y-1">
              {history.length === 0 && <li className="text-xs text-stone-400 py-2">No calculations yet.</li>}
              {history.map((h, i) => (
                <li key={`${h.at}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setState({ expr: h.result.replace(/,/g, "").replace(/^-/, "−"), showingResult: true })}
                    className="w-full flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-800"
                    title="Use this result"
                  >
                    <span className="text-xs text-stone-500 truncate">{h.expression} =</span>
                    <span className="text-sm font-semibold text-stone-900 dark:text-white">{h.result}</span>
                    <span className="text-[10px] text-stone-400 shrink-0">{timeFormat.format(h.at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

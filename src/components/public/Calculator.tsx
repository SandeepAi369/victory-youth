"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calculator as CalculatorIcon, Clock, Delete, Trash2, X } from "lucide-react";
import { evaluate, formatResult, loadHistory, saveHistory, type HistoryEntry } from "@/lib/calculator";

const KEYS = [
  ["C", "⌫", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["(", ")", "0", "."],
];
const OPERATORS = new Set(["÷", "×", "−", "+", "%"]);
const timeFormat = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });

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
  const [expression, setExpression] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());

  // Expire entries older than 24 hours while the calculator stays open
  useEffect(() => {
    const timer = setInterval(() => setHistory(loadHistory()), 60_000);
    return () => clearInterval(timer);
  }, []);

  let preview = "";
  try {
    if (expression && /[÷×−+%]/.test(expression)) preview = formatResult(evaluate(expression));
  } catch {
    preview = "";
  }

  const press = useCallback((key: string) => {
    setError("");
    if (key === "C") return setExpression("");
    if (key === "⌫") return setExpression((e) => e.slice(0, -1));
    if (key === "=") {
      if (!expression) return;
      try {
        const result = formatResult(evaluate(expression));
        // Side effects stay outside state updaters (React may call updaters twice)
        const next = [{ expression, result, at: Date.now() }, ...loadHistory()];
        saveHistory(next);
        setHistory(next);
        setExpression(result.replace(/,/g, ""));
      } catch (e) {
        setError(e instanceof Error && e.message === "Division by zero" ? "Can't divide by zero" : "Invalid calculation");
      }
      return;
    }
    setExpression((e) => {
      const last = e.slice(-1);
      // Replace a trailing operator instead of stacking two (except "%" and minus after an operator)
      if (OPERATORS.has(key) && key !== "−" && key !== "%" && OPERATORS.has(last) && last !== "%") return e.slice(0, -1) + key;
      return (e + key).slice(0, 80);
    });
  }, [expression]);

  // Keyboard support
  useEffect(() => {
    const map: Record<string, string> = { "*": "×", "/": "÷", "-": "−", Enter: "=", "=": "=", Backspace: "⌫", Delete: "C" };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") return onClose();
      const key = map[ev.key] ?? ev.key;
      if (/^[0-9.()+%]$/.test(key) || ["×", "÷", "−", "=", "⌫", "C"].includes(key)) {
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

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-3" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="calculator-title" className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 id="calculator-title" className="flex items-center gap-2 font-bold text-stone-900 dark:text-white">
            <CalculatorIcon className="w-5 h-5 text-orange-500" aria-hidden /> Calculator
          </h2>
          <button type="button" onClick={onClose} aria-label="Close calculator" className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display */}
        <div className="mx-5 mt-3 rounded-2xl bg-stone-100 dark:bg-stone-800 px-4 py-3 text-right" aria-live="polite">
          <div className="min-h-[2.25rem] text-2xl font-semibold text-stone-900 dark:text-white break-all">{expression || "0"}</div>
          <div className="min-h-[1.25rem] text-sm text-stone-500 dark:text-stone-400">{error ? <span className="text-red-600">{error}</span> : preview && `= ${preview}`}</div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 p-5 pb-3">
          {KEYS.flat().map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              aria-label={key === "⌫" ? "Backspace" : key === "C" ? "Clear" : key}
              className={
                "h-12 rounded-xl text-lg font-semibold transition active:scale-95 " +
                (key === "C" || key === "⌫"
                  ? "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200"
                  : OPERATORS.has(key)
                    ? "bg-orange-100 text-orange-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                    : "bg-stone-50 text-stone-900 dark:bg-stone-800 dark:text-white border border-stone-200 dark:border-stone-700")
              }
            >
              {key === "⌫" ? <Delete className="w-5 h-5 mx-auto" aria-hidden /> : key}
            </button>
          ))}
          <button type="button" onClick={() => press("=")} className="col-span-4 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold active:scale-[0.99]">
            =
          </button>
        </div>

        {/* History */}
        <div className="border-t border-stone-200 dark:border-stone-700 px-5 py-3 bg-stone-50 dark:bg-stone-900/60">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-500">
              <Clock className="w-3.5 h-3.5" aria-hidden /> History
            </h3>
            {history.length > 0 && (
              <button type="button" onClick={clearHistory} aria-label="Clear history" className="flex items-center gap-1 text-xs text-stone-500 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" aria-hidden /> Clear
              </button>
            )}
          </div>
          <p className="mt-1 text-[11px] font-medium text-orange-700 dark:text-yellow-400">
            Calculation history is automatically deleted after 24 hours.
          </p>
          <ul className="mt-2 max-h-36 overflow-y-auto space-y-1">
            {history.length === 0 && <li className="text-xs text-stone-400 py-2">No calculations yet.</li>}
            {history.map((h, i) => (
              <li key={`${h.at}-${i}`}>
                <button
                  type="button"
                  onClick={() => setExpression(h.result.replace(/,/g, ""))}
                  className="w-full flex items-baseline justify-between gap-3 rounded-lg px-2 py-1 text-left hover:bg-white dark:hover:bg-stone-800"
                  title="Use this result"
                >
                  <span className="text-xs text-stone-500 truncate">{h.expression} =</span>
                  <span className="text-sm font-semibold text-stone-900 dark:text-white">{h.result}</span>
                  <span className="text-[10px] text-stone-400 shrink-0">{timeFormat.format(h.at)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

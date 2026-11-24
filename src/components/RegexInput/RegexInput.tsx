import React, { useState, useId } from 'react';
import { validateRegex } from '../../algorithms/regexParser';
import { buildNfaFromRegex } from '../../algorithms/thompsonConstruction';
import { Automaton, EPSILON } from '../../types/automaton';
import { Sparkles, CheckCircle2, AlertCircle, HelpCircle, Code2 } from 'lucide-react';

interface RegexInputProps {
  onGenerate: (automaton: Automaton, regex: string) => void;
  currentRegex?: string;
}

export function RegexInput({ onGenerate, currentRegex = '(a|b)*abb' }: RegexInputProps) {
  const [regex, setRegex] = useState(currentRegex);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputId = useId();

  const validation = validateRegex(regex);

  const handleGenerate = () => {
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid regular expression.');
      return;
    }

    try {
      setErrorMessage(null);
      const generatedNfa = buildNfaFromRegex(regex);
      onGenerate(generatedNfa, regex);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating automaton.';
      setErrorMessage(msg);
    }
  };

  const handleInsertSymbol = (sym: string) => {
    setRegex((prev) => prev + sym);
  };

  const presets = [
    { label: '(a|b)*abb', desc: 'Ends with abb' },
    { label: '(0|1)*01', desc: 'Binary ending in 01' },
    { label: 'a*b*', desc: 'Ordered a and b' },
    { label: '(a|b)*', desc: 'All strings on {a,b}' },
    { label: 'a(b|c)*', desc: 'Starts with a' },
    { label: '(a|b)*a(a|b)', desc: 'Second symbol from end is a' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-600" />
            Regular Expression Input
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter a regular expression to construct an equivalent ε-NFA using Thompson's Construction algorithm.
          </p>
        </div>

        <span className="text-[11px] font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
          Thompson's Construction
        </span>
      </div>

      {/* Input box and actions */}
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700">
          Regular Expression (Union: <span className="font-mono text-blue-600">|</span>, Star:{' '}
          <span className="font-mono text-blue-600">*</span>, Epsilon:{' '}
          <span className="font-mono text-blue-600">{EPSILON}</span>)
        </label>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              id={inputId}
              type="text"
              value={regex}
              onChange={(e) => {
                setRegex(e.target.value);
                setErrorMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate();
              }}
              placeholder="e.g. (a|b)*abb"
              className={`w-full px-4 py-2.5 text-base font-mono rounded-lg border focus:outline-none transition-all ${
                !validation.isValid && regex.trim() !== ''
                  ? 'border-rose-300 focus:ring-2 focus:ring-rose-500 bg-rose-50/20'
                  : 'border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white'
              }`}
            />

            {/* Validation badge */}
            <div className="absolute right-3 top-3">
              {validation.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                regex.trim() !== '' && <AlertCircle className="w-5 h-5 text-rose-500" />
              )}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!validation.isValid}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xs transition-all ${
              validation.isValid
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed text-slate-500'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Generate ε-NFA
          </button>
        </div>

        {/* Error notification */}
        {(errorMessage || (!validation.isValid && regex.trim() !== '')) && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage || validation.error}</span>
          </div>
        )}
      </div>

      {/* Operator quick inserts & presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        {/* Quick symbol insertion buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500 mr-1">Insert:</span>
          {['(', ')', '|', '*', EPSILON, 'a', 'b', '0', '1', '∅'].map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => handleInsertSymbol(sym)}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 rounded-md border border-slate-200 transition-colors"
            >
              {sym}
            </button>
          ))}
        </div>

        {/* Example Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500 mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setRegex(p.label);
                setErrorMessage(null);
              }}
              title={p.desc}
              className="px-2 py-1 text-[11px] font-mono bg-slate-50 hover:bg-slate-200 text-slate-600 rounded border border-slate-200 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

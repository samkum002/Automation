import React, { useState, useEffect, useMemo, useId } from 'react';
import { Automaton, SimulationResult } from '../../types/automaton';
import { simulateNfa } from '../../algorithms/nfaSimulation';
import { simulateDfa } from '../../algorithms/dfaSimulation';
import { validateInputString } from '../../utils/automatonValidator';
import { AutomatonDiagram } from '../AutomatonDiagram/AutomatonDiagram';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Sliders,
} from 'lucide-react';

interface SimulationPanelProps {
  nfa: Automaton;
  dfa: Automaton;
  defaultString?: string;
  presetStrings?: { string: string; shouldAccept: boolean; note: string }[];
}

export function SimulationPanel({
  nfa,
  dfa,
  defaultString = 'abb',
  presetStrings = [],
}: SimulationPanelProps) {
  const [inputString, setInputString] = useState(defaultString);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1200); // ms per step
  const stringInputId = useId();

  // Alphabet validation
  const alphabetValidation = useMemo(
    () => validateInputString(inputString, dfa.alphabet),
    [inputString, dfa.alphabet]
  );

  // Run simulation on both automata
  const nfaResult: SimulationResult = useMemo(
    () => simulateNfa(nfa, inputString),
    [nfa, inputString]
  );

  const dfaResult: SimulationResult = useMemo(
    () => simulateDfa(dfa, inputString),
    [dfa, inputString]
  );

  const maxSteps = Math.max(nfaResult.steps.length, dfaResult.steps.length);

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setStepIndex((curr) => {
          if (curr + 1 < maxSteps) {
            return curr + 1;
          } else {
            setIsPlaying(false);
            return curr;
          }
        });
      }, playSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, maxSteps, playSpeed]);

  const currentNfaStep = nfaResult.steps[Math.min(stepIndex, nfaResult.steps.length - 1)];
  const currentDfaStep = dfaResult.steps[Math.min(stepIndex, dfaResult.steps.length - 1)];

  const isAtEnd = stepIndex >= maxSteps - 1;

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (stepIndex + 1 < maxSteps) setStepIndex(stepIndex + 1);
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleSelectPreset = (str: string) => {
    setInputString(str);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const resultsMatch = nfaResult.accepted === dfaResult.accepted;

  return (
    <div className="flex flex-col gap-5">
      {/* Simulation Controls & Input Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Automata String Simulation Engine
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate input strings simultaneously on both the ε-NFA and the generated DFA to verify formal language equivalence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Alphabet:</span>
            <div className="flex items-center gap-1">
              {dfa.alphabet.map((sym) => (
                <span
                  key={sym}
                  className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200"
                >
                  {sym}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Input box */}
        <div className="flex flex-col gap-2">
          <label htmlFor={stringInputId} className="text-xs font-semibold text-slate-700">
            Input String to Simulate (leave empty for empty string <span className="font-mono text-blue-600">ε</span>)
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                id={stringInputId}
                type="text"
                value={inputString}
                onChange={(e) => {
                  setInputString(e.target.value);
                  setStepIndex(0);
                  setIsPlaying(false);
                }}
                placeholder="Enter string using alphabet (e.g. abb, 01, or empty for ε)"
                className={`w-full px-4 py-2.5 text-base font-mono rounded-lg border focus:outline-none transition-all ${
                  !alphabetValidation.isValid
                    ? 'border-amber-400 bg-amber-50/20 focus:ring-2 focus:ring-amber-500'
                    : 'border-slate-300 bg-white focus:ring-2 focus:ring-blue-500'
                }`}
              />
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Invalid character warning */}
          {!alphabetValidation.isValid && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Warning: Character(s) <span className="font-mono font-bold">{alphabetValidation.invalidChars.join(', ')}</span> are not in the automaton alphabet ({`{${dfa.alphabet.join(', ')}}`}).
              </span>
            </div>
          )}
        </div>

        {/* Preset test buttons */}
        {presetStrings.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Test Cases:</span>
            {presetStrings.map((tc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(tc.string)}
                className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-all flex items-center gap-1.5 ${
                  inputString === tc.string
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{tc.string === '' ? 'ε (empty)' : tc.string}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-sans font-bold ${
                    tc.shouldAccept
                      ? inputString === tc.string
                        ? 'bg-emerald-400 text-slate-900'
                        : 'bg-emerald-100 text-emerald-800'
                      : inputString === tc.string
                      ? 'bg-rose-400 text-slate-900'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {tc.shouldAccept ? 'Accept' : 'Reject'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Tape & Stepper Control Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tape Visualizer */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-xs font-mono text-slate-400 mr-2">Input Tape:</span>
            {inputString.length === 0 ? (
              <div className="w-10 h-10 rounded border-2 border-dashed border-slate-600 flex items-center justify-center font-mono text-sm font-bold text-slate-400 bg-slate-800">
                ε
              </div>
            ) : (
              inputString.split('').map((char, idx) => {
                const isCurrent = stepIndex - 1 === idx;
                const isConsumed = stepIndex - 1 > idx;

                return (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded flex flex-col items-center justify-center font-mono text-base font-bold transition-all relative ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-900 shadow-md ring-2 ring-amber-300 scale-105'
                        : isConsumed
                        ? 'bg-slate-800 text-slate-500 border border-slate-700'
                        : 'bg-slate-800 text-white border border-slate-600'
                    }`}
                  >
                    <span>{char}</span>
                    {isCurrent && (
                      <span className="absolute -bottom-2 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                        ▲
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Stepper buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono mr-1">
              Step {stepIndex} / {maxSteps - 1}
            </span>

            <button
              onClick={handleStepBackward}
              disabled={stepIndex === 0}
              className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Step backward"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-900 transition-all ${
                isPlaying ? 'bg-amber-400 hover:bg-amber-300' : 'bg-emerald-400 hover:bg-emerald-300'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Auto-Run
                </>
              )}
            </button>

            <button
              onClick={handleStepForward}
              disabled={isAtEnd}
              className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Step forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <select
              value={playSpeed}
              onChange={(e) => setPlaySpeed(Number(e.target.value))}
              className="bg-slate-800 text-xs text-slate-300 rounded px-2 py-1.5 border border-slate-700 focus:outline-none"
            >
              <option value={1800}>0.5x</option>
              <option value={1200}>1.0x</option>
              <option value={600}>2.0x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equivalence and Result Comparison Banner */}
      {isAtEnd && (
        <div
          className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-xs transition-all ${
            resultsMatch
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3">
            {resultsMatch ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>
                  Simulation Completed: String "{inputString === '' ? 'ε' : inputString}" is{' '}
                  <span className={dfaResult.accepted ? 'text-emerald-700' : 'text-rose-700'}>
                    {dfaResult.accepted ? 'ACCEPTED' : 'REJECTED'}
                  </span>
                </span>
                {resultsMatch && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 font-semibold">
                    Equivalence Verified ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                ε-NFA result: <span className="font-bold">{nfaResult.accepted ? 'ACCEPTED' : 'REJECTED'}</span> | DFA result:{' '}
                <span className="font-bold">{dfaResult.accepted ? 'ACCEPTED' : 'REJECTED'}</span>.
                Both automata produce identical acceptance outcomes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-side Dual Simulation Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: ε-NFA Live Simulation */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                ε-NFA Simulation
              </h4>
              <span className="text-[11px] text-slate-500">
                Active State Set: <span className="font-mono font-bold text-blue-700">{`{${currentNfaStep?.currentStates.join(', ') || '∅'}}`}</span>
              </span>
            </div>

            <div className="text-right">
              {isAtEnd && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    nfaResult.accepted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {nfaResult.accepted ? 'ACCEPTED' : 'REJECTED'}
                </span>
              )}
            </div>
          </div>

          {/* Diagram */}
          <div className="h-[380px]">
            <AutomatonDiagram
              automaton={nfa}
              options={{
                activeStateIds: currentNfaStep?.currentStates || [],
                activeTransitions: currentNfaStep?.activeTransitions || [],
              }}
            />
          </div>

          {/* Step Explanation */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs font-mono text-slate-700">
            <span className="font-sans font-bold text-slate-500 block text-[10px] uppercase">
              Current Step Details
            </span>
            <p className="mt-0.5 leading-relaxed">{currentNfaStep?.explanation || 'Awaiting simulation.'}</p>
          </div>
        </div>

        {/* Right: DFA Live Simulation */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                DFA Simulation
              </h4>
              <span className="text-[11px] text-slate-500">
                Current DFA State:{' '}
                <span className="font-mono font-bold text-purple-700">
                  {currentDfaStep?.currentStates[0] || 'Trap/Dead'}
                </span>
              </span>
            </div>

            <div className="text-right">
              {isAtEnd && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    dfaResult.accepted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {dfaResult.accepted ? 'ACCEPTED' : 'REJECTED'}
                </span>
              )}
            </div>
          </div>

          {/* Diagram */}
          <div className="h-[380px]">
            <AutomatonDiagram
              automaton={dfa}
              options={{
                activeStateIds: currentDfaStep?.currentStates || [],
                activeTransitions: currentDfaStep?.activeTransitions || [],
              }}
            />
          </div>

          {/* Step Explanation */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs font-mono text-slate-700">
            <span className="font-sans font-bold text-slate-500 block text-[10px] uppercase">
              Current Step Details
            </span>
            <p className="mt-0.5 leading-relaxed">{currentDfaStep?.explanation || 'Awaiting simulation.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

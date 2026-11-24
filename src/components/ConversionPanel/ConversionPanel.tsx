import React, { useState } from 'react';
import { Automaton, ConversionResult } from '../../types/automaton';
import { AutomatonDiagram } from '../AutomatonDiagram/AutomatonDiagram';
import { TransitionTable } from '../TransitionTable/TransitionTable';
import { StepViewer } from '../StepViewer/StepViewer';
import {
  ArrowRight,
  Sparkles,
  Layers,
  Table as TableIcon,
  Play,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface ConversionPanelProps {
  nfa: Automaton;
  conversionResult: ConversionResult;
  onNavigateToSimulation: () => void;
  onEditNfa: () => void;
}

export function ConversionPanel({
  nfa,
  conversionResult,
  onNavigateToSimulation,
  onEditNfa,
}: ConversionPanelProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'diagrams' | 'tables' | 'steps'>('diagrams');

  const { dfa, stats, subsetMap, deadStateId } = conversionResult;
  const currentStep = conversionResult.steps[currentStepIndex];

  // Highlight active states based on current conversion step
  const nfaActiveStates = currentStep?.sourceDfaSubset || [];
  const dfaActiveStateId = currentStep?.sourceDfaStateId;

  return (
    <div className="flex flex-col gap-5">
      {/* Conversion Banner & Summary Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-xl p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
              Automata Transformation
            </span>
            <span className="text-emerald-300 flex items-center gap-1 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Deterministic Equivalence Guaranteed
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1">ε-NFA to DFA Conversion Complete</h2>
          <p className="text-xs text-blue-100 max-w-2xl mt-0.5">
            Constructed using rigorous mathematical subset construction and ε-closure calculation.
            Both automata recognize the exact same formal language.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/10 backdrop-blur-xs">
          <div className="text-center px-3 border-r border-white/20">
            <span className="text-[10px] text-blue-200 uppercase font-semibold block">ε-NFA States</span>
            <span className="text-lg font-bold">{stats.nfaStateCount}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-blue-200" />
          <div className="text-center px-3 border-r border-white/20">
            <span className="text-[10px] text-purple-200 uppercase font-semibold block">DFA States</span>
            <span className="text-lg font-bold text-amber-300">{stats.dfaStateCount}</span>
          </div>
          <div className="text-center px-2">
            <span className="text-[10px] text-blue-200 uppercase font-semibold block">Alphabet</span>
            <span className="text-xs font-mono font-bold">{`{${dfa.alphabet.join(', ')}}`}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToSimulation}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Simulate Strings
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('diagrams')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'diagrams'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Visual Automata (Side-by-Side)
          </button>

          <button
            onClick={() => setViewMode('steps')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'steps'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Step-by-Step Mathematical Derivation
          </button>

          <button
            onClick={() => setViewMode('tables')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'tables'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Transition Tables Comparison
          </button>
        </div>

        <button
          onClick={onEditNfa}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Edit ε-NFA
        </button>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'diagrams' && (
        <div className="flex flex-col gap-4">
          {/* Side-by-Side Diagrams */}
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
            {/* Left: Original ε-NFA */}
            <div className="lg:col-span-5 flex flex-col gap-2 min-h-[460px]">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Original ε-NFA Diagram
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  q₀: {nfa.initialStateId} | F: {`{${nfa.finalStateIds.join(', ')}}`}
                </span>
              </div>
              <div className="flex-1 min-h-[420px]">
                <AutomatonDiagram
                  automaton={nfa}
                  title="Source ε-NFA"
                  subtitle="Contains non-deterministic paths and ε-transitions"
                  options={{ activeStateIds: nfaActiveStates }}
                />
              </div>
            </div>

            {/* Middle: Conversion Arrow Indicator */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center py-4 text-center">
              <div className="flex flex-col items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl shadow-xs">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  \u2192
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 leading-tight">
                  Subset Construction
                </span>
                <span className="text-[9px] text-indigo-600 font-mono">
                  2^{nfa.states.length} power set
                </span>
              </div>
            </div>

            {/* Right: Generated DFA */}
            <div className="lg:col-span-5 flex flex-col gap-2 min-h-[460px]">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  Generated DFA Diagram
                </span>
                <span className="text-xs text-purple-700 font-mono font-semibold">
                  q₀: {dfa.initialStateId} | F: {`{${dfa.finalStateIds.join(', ')}}`}
                </span>
              </div>
              <div className="flex-1 min-h-[420px]">
                <AutomatonDiagram
                  automaton={dfa}
                  title="Equivalent DFA"
                  subtitle="Each state represents a subset of original NFA states"
                  options={{ activeStateIds: dfaActiveStateId ? [dfaActiveStateId] : [] }}
                />
              </div>
            </div>
          </div>

          {/* Quick Transition Tables beneath diagrams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <TransitionTable
              automaton={nfa}
              title="Original ε-NFA Transition Table"
              isNfa={true}
              activeStateIds={nfaActiveStates}
            />
            <TransitionTable
              automaton={dfa}
              title="Generated DFA Transition Table"
              isNfa={false}
              activeStateIds={dfaActiveStateId ? [dfaActiveStateId] : []}
            />
          </div>
        </div>
      )}

      {viewMode === 'steps' && (
        <div className="flex flex-col gap-4">
          <StepViewer
            conversionResult={conversionResult}
            currentStepIndex={currentStepIndex}
            onStepChange={setCurrentStepIndex}
          />

          {/* Live Diagram Synchronized with Current Step */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[380px]">
            <AutomatonDiagram
              automaton={nfa}
              title={`ε-NFA (Active subset: {${nfaActiveStates.join(', ')}})`}
              options={{ activeStateIds: nfaActiveStates }}
            />
            <AutomatonDiagram
              automaton={dfa}
              title={`DFA (Processing state: ${dfaActiveStateId || 'None'})`}
              options={{ activeStateIds: dfaActiveStateId ? [dfaActiveStateId] : [] }}
            />
          </div>
        </div>
      )}

      {viewMode === 'tables' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TransitionTable
              automaton={nfa}
              title="ε-NFA Transition Function (δ: Q × (Σ ∪ {ε}) → 2^Q)"
              isNfa={true}
            />
            <TransitionTable
              automaton={dfa}
              title="DFA Transition Function (δ': Q' × Σ → Q')"
              isNfa={false}
            />
          </div>

          {/* DFA Subset Mapping Reference Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              DFA State to NFA Subset Mapping
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {dfa.states.map((st) => (
                <div
                  key={st.id}
                  className={`p-2.5 rounded-lg border text-xs flex flex-col font-mono ${
                    st.isFinal
                      ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{st.id}</span>
                    {st.isInitial && <span className="text-[10px] text-emerald-700 font-bold">Start</span>}
                    {st.isFinal && <span className="text-[10px] text-purple-700 font-bold">*Final</span>}
                  </div>
                  <span className="text-[11px] text-blue-700 font-bold mt-1">
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

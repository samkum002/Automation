import React, { useState, useMemo, useEffect } from 'react';
import { Automaton, ConversionResult } from './types/automaton';
import { EXAMPLE_AUTOMATA, AutomatonExample } from './examples/exampleAutomata';
import { convertNfaToDfa } from './algorithms/subsetConstruction';
import { buildNfaFromRegex } from './algorithms/thompsonConstruction';
import { validateAutomaton } from './utils/automatonValidator';

import { AutomatonEditor } from './components/AutomatonEditor/AutomatonEditor';
import { AutomatonDiagram } from './components/AutomatonDiagram/AutomatonDiagram';
import { TransitionTable } from './components/TransitionTable/TransitionTable';
import { RegexInput } from './components/RegexInput/RegexInput';
import { ConversionPanel } from './components/ConversionPanel/ConversionPanel';
import { SimulationPanel } from './components/SimulationPanel/SimulationPanel';
import { AcademicDocs } from './components/AcademicDocs/AcademicDocs';

import {
  Sparkles,
  Play,
  RotateCcw,
  BookOpen,
  Code2,
  Workflow,
  Download,
  Upload,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Layers,
  HelpCircle,
  Home as HomeIcon,
  Library,
  PenTool,
} from 'lucide-react';

type NavigationTab =
  | 'home'
  | 'regex'
  | 'graphical'
  | 'conversion'
  | 'simulation'
  | 'examples'
  | 'academic';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedExampleId, setSelectedExampleId] = useState<string>('textbook-abb');

  // Active ε-NFA state
  const [currentNfa, setCurrentNfa] = useState<Automaton>(() => {
    return EXAMPLE_AUTOMATA[0].automaton;
  });

  // Current regular expression
  const [currentRegex, setCurrentRegex] = useState<string>('(a|b)*abb');

  // Conversion result & DFA
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(() => {
    try {
      return convertNfaToDfa(EXAMPLE_AUTOMATA[0].automaton);
    } catch {
      return null;
    }
  });

  // Automaton validation
  const validation = useMemo(() => validateAutomaton(currentNfa), [currentNfa]);

  // Selected example details
  const activeExample = useMemo(
    () => EXAMPLE_AUTOMATA.find((e) => e.id === selectedExampleId) || EXAMPLE_AUTOMATA[0],
    [selectedExampleId]
  );

  // Trigger conversion
  const handlePerformConversion = () => {
    if (!validation.isValid) return;
    try {
      const result = convertNfaToDfa(currentNfa);
      setConversionResult(result);
      setActiveTab('conversion');
    } catch (err: unknown) {
      alert(`Conversion error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // When regex input generates an NFA
  const handleRegexGenerated = (nfa: Automaton, regex: string) => {
    setCurrentNfa(nfa);
    setCurrentRegex(regex);
    try {
      const result = convertNfaToDfa(nfa);
      setConversionResult(result);
    } catch {
      setConversionResult(null);
    }
    setActiveTab('graphical');
  };

  // When an example is chosen
  const handleSelectExample = (example: AutomatonExample) => {
    setSelectedExampleId(example.id);
    setCurrentNfa(example.automaton);
    if (example.regex) setCurrentRegex(example.regex);
    try {
      const res = convertNfaToDfa(example.automaton);
      setConversionResult(res);
    } catch {
      setConversionResult(null);
    }
  };

  // Export automaton as JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentNfa, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentNfa.id || 'automaton'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import automaton from JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.states && parsed.transitions) {
          setCurrentNfa(parsed);
          const res = convertNfaToDfa(parsed);
          setConversionResult(res);
          setActiveTab('graphical');
        } else {
          alert('Invalid automaton JSON structure: missing states or transitions.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  ε-NFA to DFA Simulator
                </h1>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-md">
                  v2.0 Academic
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Subset Construction & ε-Closure Engine (JFLAP Inspired)
              </p>
            </div>
          </div>

          {/* Quick Example Selector in Header */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Preset:</span>
            <select
              value={selectedExampleId}
              onChange={(e) => {
                const ex = EXAMPLE_AUTOMATA.find((item) => item.id === e.target.value);
                if (ex) handleSelectExample(ex);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {EXAMPLE_AUTOMATA.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.category})
                </option>
              ))}
            </select>
          </div>

          {/* Top Actions: Convert Button & JSON Export/Import */}
          <div className="flex items-center gap-2">
            <label
              title="Import JSON"
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>

            <button
              onClick={handleExportJson}
              title="Export Automaton JSON"
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={handlePerformConversion}
              disabled={!validation.isValid}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all ${
                validation.isValid
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer scale-100 hover:scale-102 active:scale-98'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Convert to DFA</span>
            </button>
          </div>
        </div>

        {/* Navigation Bar Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HomeIcon className="w-3.5 h-3.5" /> Home & Overview
          </button>

          <button
            onClick={() => setActiveTab('regex')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'regex'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Option A: Regex Input
          </button>

          <button
            onClick={() => setActiveTab('graphical')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'graphical'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" /> Option B: Graphical ε-NFA Editor
          </button>

          <button
            onClick={() => {
              if (conversionResult) {
                setActiveTab('conversion');
              } else {
                handlePerformConversion();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'conversion'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> DFA Conversion & Steps
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'simulation'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" /> String Simulation
          </button>

          <button
            onClick={() => setActiveTab('examples')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'examples'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Library className="w-3.5 h-3.5" /> Examples & Test Bank
          </button>

          <button
            onClick={() => setActiveTab('academic')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'academic'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Academic Deliverables
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* HOME & OVERVIEW TAB */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-6">
            {/* Hero Card */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col gap-3 max-w-2xl">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-blue-100 w-fit backdrop-blur-xs">
                  Automata Theory & Computability
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  ε-NFA to DFA Conversion Simulator
                </h2>
                <p className="text-sm text-blue-100 leading-relaxed">
                  An academic, mathematically rigorous simulator designed to help computer science students and faculty explore automata theory. Convert non-deterministic automata with epsilon transitions into equivalent deterministic finite automata via step-by-step subset construction and ε-closure computation.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('regex')}
                    className="px-4 py-2.5 bg-white text-blue-800 hover:bg-blue-50 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Code2 className="w-4 h-4 text-blue-600" />
                    Option A: Start from Regular Expression
                  </button>

                  <button
                    onClick={() => setActiveTab('graphical')}
                    className="px-4 py-2.5 bg-blue-500/40 hover:bg-blue-500/60 text-white rounded-xl text-xs font-bold border border-white/20 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <PenTool className="w-4 h-4" />
                    Option B: Graphical ε-NFA Canvas
                  </button>

                  <button
                    onClick={() => setActiveTab('academic')}
                    className="px-4 py-2.5 bg-purple-900/60 hover:bg-purple-900/80 text-purple-200 rounded-xl text-xs font-bold border border-purple-400/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    Academic Guide & Theory
                  </button>
                </div>
              </div>

              {/* Stats / Highlight Box */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex flex-col gap-3 w-full md:w-72">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  Currently Loaded ε-NFA
                </span>
                <div className="text-xl font-bold text-white">{currentNfa.name || 'Automaton'}</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-100 font-mono">
                  <div className="bg-black/20 p-2 rounded">
                    States: <span className="text-white font-bold">{currentNfa.states.length}</span>
                  </div>
                  <div className="bg-black/20 p-2 rounded">
                    Transitions: <span className="text-white font-bold">{currentNfa.transitions.length}</span>
                  </div>
                  <div className="bg-black/20 p-2 rounded">
                    Alphabet: <span className="text-white font-bold">{`{${currentNfa.alphabet.join(', ')}}`}</span>
                  </div>
                  <div className="bg-black/20 p-2 rounded">
                    Finals: <span className="text-white font-bold">{`{${currentNfa.finalStateIds.join(', ')}}`}</span>
                  </div>
                </div>

                <button
                  onClick={handlePerformConversion}
                  className="w-full mt-2 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  Convert to DFA Now
                </button>
              </div>
            </div>

            {/* Workflow Architecture Diagram */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-blue-600" />
                End-to-End Application Workflow
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Dual Input Methods</h4>
                  <p className="text-xs text-slate-500">
                    Choose between Regular Expression input (parsed via Thompson's Construction) or manual Graphical Canvas construction.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Unified ε-NFA Structure</h4>
                  <p className="text-xs text-slate-500">
                    Both inputs feed into the exact same 5-tuple data structure with transition tables, initial state, and accepting states.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Subset Construction</h4>
                  <p className="text-xs text-slate-500">
                    Calculates ε-closures, power-set moves, discovers new DFA states, and handles dead/trap states ∅ with total transitions.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                    4
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">Dual String Simulation</h4>
                  <p className="text-xs text-slate-500">
                    Simulate test strings on both automata simultaneously with step-by-step tape playback to verify formal equivalence.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Preview of Current Automaton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="h-[380px]">
                <AutomatonDiagram
                  automaton={currentNfa}
                  title="Current ε-NFA"
                  subtitle="Ready for conversion or graphical editing"
                />
              </div>
              <TransitionTable
                automaton={currentNfa}
                title="ε-NFA Transition Table"
                isNfa={true}
              />
            </div>
          </div>
        )}

        {/* REGEX INPUT TAB (Option A) */}
        {activeTab === 'regex' && (
          <div className="flex flex-col gap-5">
            <RegexInput
              onGenerate={handleRegexGenerated}
              currentRegex={currentRegex}
            />

            {/* Diagram and Table of the Generated ε-NFA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="h-[420px]">
                <AutomatonDiagram
                  automaton={currentNfa}
                  title={`Generated ε-NFA for "${currentRegex}"`}
                  subtitle="Generated dynamically via Thompson's Construction algorithm"
                />
              </div>
              <TransitionTable
                automaton={currentNfa}
                title="Generated ε-NFA Transition Table"
                isNfa={true}
              />
            </div>
          </div>
        )}

        {/* GRAPHICAL ε-NFA EDITOR TAB (Option B) */}
        {activeTab === 'graphical' && (
          <div className="flex flex-col gap-5">
            <div className="h-[540px]">
              <AutomatonEditor
                automaton={currentNfa}
                onChange={(updated) => {
                  setCurrentNfa(updated);
                  try {
                    const res = convertNfaToDfa(updated);
                    setConversionResult(res);
                  } catch {
                    setConversionResult(null);
                  }
                }}
                onProceedToConversion={handlePerformConversion}
              />
            </div>

            <TransitionTable
              automaton={currentNfa}
              title="Interactive ε-NFA Transition Table (Live Synchronization)"
              isNfa={true}
            />
          </div>
        )}

        {/* CONVERSION & STEPS TAB */}
        {activeTab === 'conversion' && (
          <div>
            {conversionResult ? (
              <ConversionPanel
                nfa={currentNfa}
                conversionResult={conversionResult}
                onNavigateToSimulation={() => setActiveTab('simulation')}
                onEditNfa={() => setActiveTab('graphical')}
              />
            ) : (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center flex flex-col items-center gap-3">
                <p className="text-slate-600 text-sm">No conversion executed yet.</p>
                <button
                  onClick={handlePerformConversion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  Convert to DFA
                </button>
              </div>
            )}
          </div>
        )}

        {/* STRING SIMULATION TAB */}
        {activeTab === 'simulation' && (
          <div>
            {conversionResult ? (
              <SimulationPanel
                nfa={currentNfa}
                dfa={conversionResult.dfa}
                defaultString={activeExample.testStrings[0]?.string ?? 'abb'}
                presetStrings={activeExample.testStrings}
              />
            ) : (
              <div className="bg-white p-8 rounded-xl border border-slate-200 text-center flex flex-col items-center gap-3">
                <p className="text-slate-600 text-sm">Please convert the ε-NFA to DFA first.</p>
                <button
                  onClick={handlePerformConversion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  Convert Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* EXAMPLES & TEST BANK TAB */}
        {activeTab === 'examples' && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Library className="w-4 h-4 text-blue-600" />
                Academic Example Automata Library
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-configured automata covering classic textbook cases, edge cases, cyclic epsilons, and trap states.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXAMPLE_AUTOMATA.map((ex) => {
                const isSelected = ex.id === selectedExampleId;

                return (
                  <div
                    key={ex.id}
                    className={`bg-white rounded-xl border p-5 flex flex-col justify-between gap-4 transition-all ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-300 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {ex.category}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            Active
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm">{ex.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{ex.description}</p>

                      {ex.regex && (
                        <div className="text-xs font-mono bg-slate-50 p-1.5 rounded border border-slate-200 text-blue-700 font-semibold">
                          Regex: {ex.regex}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-1">
                        <span>|Q| = {ex.automaton.states.length}</span>
                        <span>|Σ| = {ex.automaton.alphabet.length}</span>
                        <span>|δ| = {ex.automaton.transitions.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          handleSelectExample(ex);
                          setActiveTab('graphical');
                        }}
                        className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Edit Canvas
                      </button>

                      <button
                        onClick={() => {
                          handleSelectExample(ex);
                          handlePerformConversion();
                        }}
                        className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        Convert to DFA
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACADEMIC DELIVERABLES & THEORY TAB */}
        {activeTab === 'academic' && <AcademicDocs />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ε-NFA to DFA Conversion Simulator • Academic Automata Theory Project</span>
          <span className="font-mono text-[11px] text-slate-400">
            TypeScript • React • React Flow • Tailwind CSS
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;

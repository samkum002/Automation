import React, { useState, useEffect } from 'react';
import { ConversionResult, SubsetConstructionStep } from '../../types/automaton';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  List,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface StepViewerProps {
  conversionResult: ConversionResult;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}

export function StepViewer({
  conversionResult,
  currentStepIndex,
  onStepChange,
}: StepViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1500); // ms per step
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [activeTab, setActiveTab] = useState<'subset' | 'closures'>('subset');

  const { steps, epsilonClosureSteps } = conversionResult;
  const totalSteps = steps.length;
  const currentStep: SubsetConstructionStep | undefined = steps[currentStepIndex];

  // Auto-play timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        onStepChange(
          currentStepIndex + 1 < totalSteps ? currentStepIndex + 1 : 0
        );
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStepIndex, totalSteps, playbackSpeed, onStepChange]);

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) onStepChange(currentStepIndex - 1);
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStepIndex + 1 < totalSteps) onStepChange(currentStepIndex + 1);
  };

  const handleFirst = () => {
    setIsPlaying(false);
    onStepChange(0);
  };

  const handleLast = () => {
    setIsPlaying(false);
    onStepChange(totalSteps - 1);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Top Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">Conversion Steps & Mathematics</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab selector */}
          <div className="flex bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('subset')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'subset' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Subset Construction ({steps.length})
            </button>
            <button
              onClick={() => setActiveTab('closures')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'closures' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              ε-Closures ({epsilonClosureSteps.length})
            </button>
          </div>

          <button
            onClick={() => setShowAllSteps(!showAllSteps)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
              showAllSteps
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            {showAllSteps ? 'Stepper Mode' : 'Show All Steps'}
          </button>
        </div>
      </div>

      {activeTab === 'closures' ? (
        /* ε-Closures Table & Explanations */
        <div className="p-4 overflow-y-auto max-h-96 flex flex-col gap-3">
          <p className="text-xs text-slate-500">
            For every state <span className="font-mono font-semibold">q</span>, its <span className="font-semibold">ε-closure</span> is the set of all states reachable from <span className="font-mono">q</span> via zero or more ε-transitions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {epsilonClosureSteps.map((s) => (
              <div
                key={s.stateId}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                  <span>ε-closure({s.stateLabel || s.stateId})</span>
                  <span className="text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                    {`{${s.closure.join(', ')}}`}
                  </span>
                </div>
                <p className="text-slate-600 font-mono text-[11px] leading-relaxed">
                  {s.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : showAllSteps ? (
        /* Show All Steps Mode */
        <div className="p-4 overflow-y-auto max-h-96 flex flex-col gap-3 divide-y divide-slate-100">
          {steps.map((st, idx) => (
            <div key={idx} className="pt-3 first:pt-0 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                    {st.stepNumber}
                  </span>
                  {st.type === 'INIT' && 'Initial DFA State'}
                  {st.type === 'PROCESS_SYMBOL' && `Transition on '${st.symbol}' from ${st.sourceDfaStateId}`}
                  {st.type === 'COMPLETE' && 'Conversion Complete'}
                </span>

                {st.isNewDfaState && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    New State Discovered
                  </span>
                )}
                {st.isDeadState && (
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                    Dead State ∅
                  </span>
                )}
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                {st.explanation}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Stepper Interactive Mode */
        <div className="flex flex-col">
          {/* Main Card for Current Step */}
          {currentStep && (
            <div className="p-5 flex flex-col gap-4">
              {/* Step indicator and tags */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Step {currentStep.stepNumber} of {totalSteps}
                  </span>

                  <span className="text-xs font-bold text-slate-700">
                    {currentStep.type === 'INIT' && 'Initial State Creation'}
                    {currentStep.type === 'PROCESS_SYMBOL' && `Evaluating Input Symbol '${currentStep.symbol}'`}
                    {currentStep.type === 'COMPLETE' && 'Subset Construction Finalized'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {currentStep.isNewDfaState && (
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> New State
                    </span>
                  )}
                  {currentStep.isDeadState && (
                    <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                      Dead State ∅
                    </span>
                  )}
                </div>
              </div>

              {/* Mathematical calculation card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col gap-3 font-mono">
                {currentStep.type === 'INIT' && (
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="text-slate-500 font-sans font-semibold uppercase text-[11px]">
                      Initial Closure Formula
                    </div>
                    <div className="text-sm text-slate-800 font-bold">
                      S₀ = ε-closure(q₀) = {`{${currentStep.sourceDfaSubset.join(', ')}}`}
                    </div>
                    <p className="text-xs font-sans text-slate-600">
                      The subset of NFA states reachable from the initial state without consuming any input symbol forms the initial DFA state.
                    </p>
                  </div>
                )}

                {currentStep.type === 'PROCESS_SYMBOL' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-1.5 p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">
                        Source DFA State & Input
                      </span>
                      <div className="font-bold text-slate-800">
                        {currentStep.sourceDfaStateId} = {`{${currentStep.sourceDfaSubset.join(', ')}}`}
                      </div>
                      <div className="text-blue-600 font-bold">Input Symbol: '{currentStep.symbol}'</div>
                    </div>

                    <div className="flex flex-col gap-1.5 p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">
                        Transition & Target
                      </span>
                      <div className="text-slate-800">
                        Move({currentStep.sourceDfaStateId}, '{currentStep.symbol}') ={' '}
                        <span className="font-bold text-indigo-700">
                          {currentStep.movedStates && currentStep.movedStates.length > 0
                            ? `{${currentStep.movedStates.join(', ')}}`
                            : '∅'}
                        </span>
                      </div>
                      <div className="text-slate-800">
                        ε-closure(Move) ={' '}
                        <span className="font-bold text-emerald-700">
                          {currentStep.closureOfMove && currentStep.closureOfMove.length > 0
                            ? `{${currentStep.closureOfMove.join(', ')}}`
                            : '∅'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1 pt-1 border-t border-slate-100">
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                        δ'({currentStep.sourceDfaStateId}, {currentStep.symbol}) ={' '}
                        {currentStep.targetDfaStateId} (
                        {currentStep.targetDfaSubset && currentStep.targetDfaSubset.length > 0
                          ? `{${currentStep.targetDfaSubset.join(', ')}}`
                          : '∅'}
                        )
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.type === 'COMPLETE' && (
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-sans font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Subset construction is complete! All reachable states and transitions have been discovered.</span>
                  </div>
                )}

                {/* Explanation text */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs font-sans text-slate-700 whitespace-pre-line leading-relaxed">
                  {currentStep.explanation}
                </div>
              </div>
            </div>
          )}

          {/* Stepper Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleFirst}
                disabled={currentStepIndex === 0}
                className="px-2.5 py-1.5 text-xs font-medium rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                onClick={handleNext}
                disabled={currentStepIndex >= totalSteps - 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleLast}
                disabled={currentStepIndex >= totalSteps - 1}
                className="px-2.5 py-1.5 text-xs font-medium rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>

            {/* Play/Pause & Speed */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all ${
                  isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Auto-Step
                  </>
                )}
              </button>

              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="px-2 py-1 text-xs rounded border border-slate-300 bg-white text-slate-700 focus:outline-none"
              >
                <option value={2500}>0.5x (Slow)</option>
                <option value={1500}>1.0x (Normal)</option>
                <option value={800}>2.0x (Fast)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

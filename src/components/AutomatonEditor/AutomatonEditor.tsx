import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Automaton, State, Transition, EPSILON, isEpsilon } from '../../types/automaton';
import { CustomStateNode } from '../AutomatonDiagram/CustomStateNode';
import { CustomEdge } from '../AutomatonDiagram/CustomEdge';
import { automatonToReactFlow } from '../../utils/automatonConverter';
import { validateAutomaton } from '../../utils/automatonValidator';
import {
  Plus,
  ArrowRight,
  Flag,
  PlayCircle,
  Trash2,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  MousePointer,
  Sparkles,
  Info,
} from 'lucide-react';

interface AutomatonEditorProps {
  automaton: Automaton;
  onChange: (updated: Automaton) => void;
  onProceedToConversion?: () => void;
}

type EditorTool = 'select' | 'addState' | 'addTransition' | 'setInitial' | 'toggleFinal' | 'delete';

const nodeTypes = { customState: CustomStateNode };
const edgeTypes = { customEdge: CustomEdge };

function AutomatonEditorInner({
  automaton,
  onChange,
  onProceedToConversion,
}: AutomatonEditorProps) {
  const { screenToFlowPosition, fitView } = useReactFlow();

  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Transition creation modal / state
  const [transitionSourceId, setTransitionSourceId] = useState<string | null>(null);
  const [transitionTargetId, setTransitionTargetId] = useState<string | null>(null);
  const [newTransitionSymbol, setNewTransitionSymbol] = useState<string>('a');
  const [showTransitionModal, setShowTransitionModal] = useState<boolean>(false);

  // Quick state editor modal
  const [editingStateId, setEditingStateId] = useState<string | null>(null);

  // Convert automaton to React Flow
  const { initialNodes, initialEdges } = useMemo(() => {
    const rf = automatonToReactFlow(automaton, { isEditor: true });
    return { initialNodes: rf.nodes, initialEdges: rf.edges };
  }, [automaton]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Synchronize when external automaton identity or structure changes
  const lastSyncKeyRef = useRef<string>('');
  useEffect(() => {
    const key = `${automaton.id}_${automaton.states.length}_${automaton.transitions.length}_${automaton.initialStateId}_${automaton.finalStateIds.join(',')}`;
    if (lastSyncKeyRef.current !== key) {
      lastSyncKeyRef.current = key;
      const rf = automatonToReactFlow(automaton, { isEditor: true });
      setNodes(rf.nodes);
      setEdges(rf.edges);
      setTimeout(() => {
        fitView({ padding: 0.25, duration: 300 });
      }, 50);
    }
  }, [automaton, fitView, setNodes, setEdges]);

  // Sync state positions back when dragged
  const handleNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      const updatedStates = automaton.states.map((s) => {
        if (s.id === node.id) {
          return { ...s, x: Math.round(node.position.x), y: Math.round(node.position.y) };
        }
        return s;
      });
      onChange({ ...automaton, states: updatedStates });
    },
    [automaton, onChange]
  );

  // Canvas click to add state
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool !== 'addState') return;

      const target = event.target as HTMLElement;
      if (!target.classList.contains('react-flow__pane')) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Generate next unique state id
      let maxNum = -1;
      automaton.states.forEach((s) => {
        const match = s.id.match(/^q(\d+)$/);
        if (match) {
          maxNum = Math.max(maxNum, parseInt(match[1], 10));
        }
      });
      const newId = `q${maxNum + 1}`;

      const newState: State = {
        id: newId,
        label: newId,
        isInitial: automaton.states.length === 0, // first state automatically initial
        isFinal: false,
        x: Math.round(position.x),
        y: Math.round(position.y),
      };

      const updatedStates = [...automaton.states, newState];
      const updatedInitialId = automaton.states.length === 0 ? newId : automaton.initialStateId;

      onChange({
        ...automaton,
        states: updatedStates,
        initialStateId: updatedInitialId,
      });
    },
    [activeTool, screenToFlowPosition, automaton, onChange]
  );

  // State click handling depending on active tool
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const stateId = node.id;
      setSelectedStateId(stateId);
      setSelectedEdgeId(null);

      if (activeTool === 'setInitial') {
        const updated = automaton.states.map((s) => ({
          ...s,
          isInitial: s.id === stateId,
        }));
        onChange({
          ...automaton,
          states: updated,
          initialStateId: stateId,
        });
      } else if (activeTool === 'toggleFinal') {
        const updated = automaton.states.map((s) => {
          if (s.id === stateId) return { ...s, isFinal: !s.isFinal };
          return s;
        });
        const finalIds = updated.filter((s) => s.isFinal).map((s) => s.id);
        onChange({
          ...automaton,
          states: updated,
          finalStateIds: finalIds,
        });
      } else if (activeTool === 'delete') {
        deleteState(stateId);
      } else if (activeTool === 'addTransition') {
        if (!transitionSourceId) {
          setTransitionSourceId(stateId);
        } else {
          setTransitionTargetId(stateId);
          setShowTransitionModal(true);
        }
      }
    },
    [activeTool, automaton, onChange, transitionSourceId]
  );

  // React Flow connection handler (drag line from handle to handle)
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        setTransitionSourceId(connection.source);
        setTransitionTargetId(connection.target);
        setShowTransitionModal(true);
      }
    },
    []
  );

  // Add transition confirmation
  const handleConfirmTransition = () => {
    if (!transitionSourceId || !transitionTargetId) return;

    const sym = newTransitionSymbol.trim() === '' ? EPSILON : newTransitionSymbol.trim();
    const newTrans: Transition = {
      id: `t_${Date.now()}`,
      from: transitionSourceId,
      to: transitionTargetId,
      symbol: sym,
    };

    // Update alphabet if not epsilon
    const alphabet = [...automaton.alphabet];
    if (!isEpsilon(sym) && !alphabet.includes(sym)) {
      alphabet.push(sym);
      alphabet.sort();
    }

    onChange({
      ...automaton,
      transitions: [...automaton.transitions, newTrans],
      alphabet,
    });

    setShowTransitionModal(false);
    setTransitionSourceId(null);
    setTransitionTargetId(null);
  };

  // Delete state
  const deleteState = (stateId: string) => {
    const updatedStates = automaton.states.filter((s) => s.id !== stateId);
    const updatedTransitions = automaton.transitions.filter(
      (t) => t.from !== stateId && t.to !== stateId
    );
    const updatedFinalIds = automaton.finalStateIds.filter((id) => id !== stateId);
    let updatedInitialId = automaton.initialStateId;
    if (updatedInitialId === stateId) {
      updatedInitialId = updatedStates.length > 0 ? updatedStates[0].id : '';
      if (updatedStates.length > 0) {
        updatedStates[0].isInitial = true;
      }
    }

    // Recalculate alphabet
    const activeSymbols = new Set(
      updatedTransitions.map((t) => t.symbol).filter((s) => !isEpsilon(s))
    );
    const updatedAlphabet = Array.from(activeSymbols).sort();

    onChange({
      ...automaton,
      states: updatedStates,
      transitions: updatedTransitions,
      initialStateId: updatedInitialId,
      finalStateIds: updatedFinalIds,
      alphabet: updatedAlphabet,
    });

    setSelectedStateId(null);
  };

  // Delete transition
  const deleteTransition = (transId: string) => {
    const updatedTransitions = automaton.transitions.filter((t) => t.id !== transId);
    const activeSymbols = new Set(
      updatedTransitions.map((t) => t.symbol).filter((s) => !isEpsilon(s))
    );
    onChange({
      ...automaton,
      transitions: updatedTransitions,
      alphabet: Array.from(activeSymbols).sort(),
    });
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the canvas? All states and transitions will be removed.')) {
      onChange({
        id: `custom-${Date.now()}`,
        name: 'Manual ε-NFA',
        states: [],
        transitions: [],
        alphabet: [],
        initialStateId: '',
        finalStateIds: [],
      });
      setSelectedStateId(null);
    }
  };

  // Validation
  const validation = useMemo(() => validateAutomaton(automaton), [automaton]);

  const selectedState = automaton.states.find((s) => s.id === selectedStateId);
  const selectedStateTransitions = automaton.transitions.filter(
    (t) => t.from === selectedStateId || t.to === selectedStateId
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setActiveTool('select');
              setTransitionSourceId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTool === 'select'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            Select / Move
          </button>

          <button
            onClick={() => {
              setActiveTool('addState');
              setTransitionSourceId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTool === 'addState'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add State
          </button>

          <button
            onClick={() => {
              setActiveTool('addTransition');
              setTransitionSourceId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTool === 'addTransition'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Add Transition
          </button>

          <div className="h-5 w-px bg-slate-300 mx-1" />

          <button
            onClick={() => {
              setActiveTool('setInitial');
              setTransitionSourceId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTool === 'setInitial'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Set Initial
          </button>

          <button
            onClick={() => {
              setActiveTool('toggleFinal');
              setTransitionSourceId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTool === 'toggleFinal'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            Toggle Final
          </button>

          <button
            onClick={() => {
              setActiveTool('delete');
              setTransitionSourceId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTool === 'delete'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-600 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearCanvas}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>

          {onProceedToConversion && (
            <button
              onClick={onProceedToConversion}
              disabled={!validation.isValid}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-xs ${
                validation.isValid
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Convert to DFA
            </button>
          )}
        </div>
      </div>

      {/* Helpful Mode Notification Banner */}
      <div className="px-4 py-1.5 bg-slate-100/90 text-slate-600 text-xs flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>
            {activeTool === 'select' && 'Select / Move mode: Drag states or select them to inspect properties.'}
            {activeTool === 'addState' && 'Add State mode: Click anywhere on the grid canvas to place a new state.'}
            {activeTool === 'addTransition' && (
              transitionSourceId
                ? `Click target state to complete transition from ${transitionSourceId} (or click canvas to cancel).`
                : 'Add Transition mode: Click the source state, then click the target state.'
            )}
            {activeTool === 'setInitial' && 'Set Initial mode: Click any state to designate it as the initial state.'}
            {activeTool === 'toggleFinal' && 'Toggle Final mode: Click any state to toggle accepting/final status.'}
            {activeTool === 'delete' && 'Delete mode: Click a state or transition to remove it.'}
          </span>
        </div>

        {/* Validation indicator */}
        <div className="flex items-center gap-2">
          {validation.isValid ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid ε-NFA
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <AlertCircle className="w-3 h-3 text-rose-600" /> {validation.errors.length} Issue(s)
            </span>
          )}
        </div>
      </div>

      {/* Main Workspace Area: Canvas + Inspector Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas */}
        <div className="flex-1 h-full min-h-[420px]" onClick={handleCanvasClick}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={handleNodeDragStop}
            onNodeClick={handleNodeClick}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            minZoom={0.2}
            maxZoom={2.5}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
            <Controls position="bottom-right" />
          </ReactFlow>
        </div>

        {/* Selected State / Transition Inspector Panel */}
        {selectedState && (
          <div className="w-72 bg-white border-l border-slate-200 p-4 flex flex-col gap-3 overflow-y-auto z-10 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">State Inspector</h4>
              <button
                onClick={() => setSelectedStateId(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                State ID / Label
              </label>
              <input
                type="text"
                value={selectedState.label || selectedState.id}
                onChange={(e) => {
                  const newLabel = e.target.value;
                  const updated = automaton.states.map((s) =>
                    s.id === selectedState.id ? { ...s, label: newLabel } : s
                  );
                  onChange({ ...automaton, states: updated });
                }}
                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                State Roles
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedState.isInitial}
                  onChange={(e) => {
                    const isInit = e.target.checked;
                    const updated = automaton.states.map((s) => ({
                      ...s,
                      isInitial: s.id === selectedState.id ? isInit : false,
                    }));
                    onChange({
                      ...automaton,
                      states: updated,
                      initialStateId: isInit ? selectedState.id : '',
                    });
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Initial State
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedState.isFinal}
                  onChange={(e) => {
                    const isFin = e.target.checked;
                    const updated = automaton.states.map((s) =>
                      s.id === selectedState.id ? { ...s, isFinal: isFin } : s
                    );
                    const finalIds = updated.filter((s) => s.isFinal).map((s) => s.id);
                    onChange({
                      ...automaton,
                      states: updated,
                      finalStateIds: finalIds,
                    });
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Final / Accepting State
              </label>
            </div>

            {/* Outgoing Transitions */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Transitions ({selectedStateTransitions.length})
                </label>
              </div>

              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {selectedStateTransitions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No transitions connected.</p>
                ) : (
                  selectedStateTransitions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded text-xs border border-slate-200"
                    >
                      <span className="font-mono text-slate-700">
                        {t.from} <span className="text-blue-600 font-bold">{`--${t.symbol}-->`}</span> {t.to}
                      </span>
                      <button
                        onClick={() => deleteTransition(t.id)}
                        className="text-rose-500 hover:text-rose-700 p-0.5"
                        title="Delete transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => deleteState(selectedState.id)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete State
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Validation Errors & Warnings Tray */}
      {(!validation.isValid || validation.warnings.length > 0) && (
        <div className="p-2.5 bg-amber-50/70 border-t border-amber-200 text-xs">
          <div className="flex flex-col gap-1">
            {validation.errors.map((err, i) => (
              <div key={i} className="flex items-center gap-1.5 text-rose-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{err}</span>
              </div>
            ))}
            {validation.warnings.map((warn, i) => (
              <div key={i} className="flex items-center gap-1.5 text-amber-700">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transition Creation Modal */}
      {showTransitionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-80 p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800">Add Transition</h3>
            <p className="text-xs text-slate-500">
              Create transition from <span className="font-semibold text-slate-700">{transitionSourceId}</span> to{' '}
              <span className="font-semibold text-slate-700">{transitionTargetId}</span>.
            </p>

            <div>
              <label className="text-xs font-medium text-slate-700">Transition Symbol</label>
              <input
                type="text"
                value={newTransitionSymbol}
                onChange={(e) => setNewTransitionSymbol(e.target.value)}
                placeholder="e.g. a, b, 0, 1, or ε"
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                autoFocus
              />

              {/* Quick symbol buttons */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400">Presets:</span>
                {['ε', 'a', 'b', '0', '1'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setNewTransitionSymbol(sym)}
                    className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 rounded border border-slate-200 transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowTransitionModal(false);
                  setTransitionSourceId(null);
                  setTransitionTargetId(null);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTransition}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
              >
                Add Transition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AutomatonEditor(props: AutomatonEditorProps) {
  return (
    <ReactFlowProvider>
      <AutomatonEditorInner {...props} />
    </ReactFlowProvider>
  );
}

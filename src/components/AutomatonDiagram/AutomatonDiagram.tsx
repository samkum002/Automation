import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Automaton } from '../../types/automaton';
import { CustomStateNode } from './CustomStateNode';
import { CustomEdge } from './CustomEdge';
import { automatonToReactFlow, ConverterOptions } from '../../utils/automatonConverter';
import { Maximize2 } from 'lucide-react';

interface AutomatonDiagramProps {
  automaton: Automaton;
  title?: string;
  subtitle?: string;
  options?: ConverterOptions;
  interactive?: boolean;
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

const nodeTypes = {
  customState: CustomStateNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
};

const EMPTY_OPTIONS: ConverterOptions = {};

function AutomatonDiagramInner({
  automaton,
  title,
  subtitle,
  options = EMPTY_OPTIONS,
  interactive = true,
  className = '',
}: AutomatonDiagramProps) {
  const { fitView } = useReactFlow();

  // Stable keys for options to prevent reference-based re-render loops
  const activeKey = options.activeStateIds?.slice().sort().join(',') ?? '';
  const activeTransKey =
    options.activeTransitions
      ?.map((t) => `${t.from}-${t.to}-${t.symbol}`)
      .sort()
      .join(',') ?? '';
  const currentStepKey = options.currentStepStateId ?? '';

  // Compute React Flow nodes and edges stably
  const { initialNodes, initialEdges } = useMemo(() => {
    const rf = automatonToReactFlow(automaton, options);
    return { initialNodes: rf.nodes, initialEdges: rf.edges };
  }, [automaton, activeKey, activeTransKey, currentStepKey, options]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  // Synchronize nodes and edges only when computed representations change
  const lastRenderedKeyRef = useRef<string>('');
  useEffect(() => {
    const syncKey = `${automaton.id}_${automaton.states.length}_${automaton.transitions.length}_${activeKey}_${activeTransKey}_${currentStepKey}`;
    if (lastRenderedKeyRef.current !== syncKey) {
      lastRenderedKeyRef.current = syncKey;
      const rf = automatonToReactFlow(automaton, options);
      setNodes(rf.nodes);
      setEdges(rf.edges);
    }
  }, [automaton, activeKey, activeTransKey, currentStepKey, options, setNodes, setEdges]);

  // Fit view only when the automaton itself changes identity, not on every simulation step
  const prevAutomatonIdRef = useRef<string>('');
  useEffect(() => {
    const currentId = `${automaton.id || 'auto'}_${automaton.states.length}_${automaton.transitions.length}`;
    if (prevAutomatonIdRef.current !== currentId) {
      prevAutomatonIdRef.current = currentId;
      const timer = setTimeout(() => {
        fitView({ padding: 0.25, duration: 300 });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [automaton.id, automaton.states.length, automaton.transitions.length, fitView]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.25, duration: 400 });
  }, [fitView]);

  return (
    <div className={`relative flex flex-col h-full bg-slate-50/70 rounded-xl border border-slate-200 overflow-hidden shadow-xs ${className}`}>
      {/* Header bar */}
      {(title || subtitle) && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 z-10">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              |Q| = {automaton.states.length}
            </span>
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              |δ| = {automaton.transitions.length}
            </span>
            <button
              onClick={handleFitView}
              title="Fit to view"
              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 w-full h-full min-h-[300px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={interactive ? onNodesChange : undefined}
          onEdgesChange={interactive ? onEdgesChange : undefined}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          nodesDraggable={interactive}
          nodesConnectable={false}
          elementsSelectable={interactive}
          minZoom={0.2}
          maxZoom={2.5}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
          <Controls position="bottom-right" showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}

export function AutomatonDiagram(props: AutomatonDiagramProps) {
  return (
    <ReactFlowProvider>
      <AutomatonDiagramInner {...props} />
    </ReactFlowProvider>
  );
}

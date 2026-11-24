import { Automaton, State, Transition } from '../types/automaton';
import { Node, Edge, MarkerType } from '@xyflow/react';

export interface ConverterOptions {
  activeStateIds?: string[];
  activeTransitions?: { from: string; to: string; symbol: string }[];
  currentStepStateId?: string;
  isEditor?: boolean;
}

/**
 * Converts an Automaton data structure to React Flow nodes and edges.
 */
export function automatonToReactFlow(
  automaton: Automaton,
  options: ConverterOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  const {
    activeStateIds = [],
    activeTransitions = [],
    currentStepStateId,
    isEditor = false,
  } = options;

  // 1. Build Nodes
  const nodes: Node[] = automaton.states.map((state) => {
    const isActive = activeStateIds.includes(state.id);
    const isCurrentInStep = currentStepStateId === state.id;
    const isDead = state.id === 'q_dead' || state.label === '∅';

    return {
      id: state.id,
      type: 'customState',
      position: { x: state.x ?? 100, y: state.y ?? 100 },
      data: {
        id: state.id,
        label: state.label || state.id,
        isInitial: state.isInitial,
        isFinal: state.isFinal,
        nfaSubset: state.nfaSubset,
        isActive,
        isCurrentInStep,
        isDeadState: isDead,
        isEditor,
      },
    };
  });

  // 2. Group transitions by (from, to) pair
  const groupedTransitions = new Map<string, { from: string; to: string; symbols: string[]; isSelfLoop: boolean }>();

  for (const t of automaton.transitions) {
    const key = `${t.from}->${t.to}`;
    if (!groupedTransitions.has(key)) {
      groupedTransitions.set(key, {
        from: t.from,
        to: t.to,
        symbols: [t.symbol],
        isSelfLoop: t.from === t.to,
      });
    } else {
      const existing = groupedTransitions.get(key)!;
      if (!existing.symbols.includes(t.symbol)) {
        existing.symbols.push(t.symbol);
      }
    }
  }

  // 3. Build Edges
  const edges: Edge[] = [];
  groupedTransitions.forEach((group, key) => {
    const isSelfLoop = group.isSelfLoop;
    const hasReverse = !isSelfLoop && groupedTransitions.has(`${group.to}->${group.from}`);

    // Check if this transition group has any active transition
    const isActive = activeTransitions.some(
      (at) => at.from === group.from && at.to === group.to && group.symbols.includes(at.symbol)
    );

    // Pick handles:
    let sourceHandle: string | undefined = undefined;
    let targetHandle: string | undefined = undefined;

    if (isSelfLoop) {
      sourceHandle = 'top-source';
      targetHandle = 'top-target';
    } else if (hasReverse) {
      // Curve opposite directions
      sourceHandle = 'bottom-source';
      targetHandle = 'bottom-target';
    }

    edges.push({
      id: `edge_${key}`,
      source: group.from,
      target: group.to,
      type: 'customEdge',
      sourceHandle,
      targetHandle,
      data: {
        symbols: group.symbols,
        isActive,
        isSelfLoop,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isActive ? '#f59e0b' : '#475569',
        width: 14,
        height: 14,
      },
      animated: isActive,
    });
  });

  return { nodes, edges };
}

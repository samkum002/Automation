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
 * Every transition is mapped to an independent, clearly labeled, visually distinguishable edge.
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

  // 2. Index transitions by directed pair (from -> to) to calculate non-overlapping curve offsets
  const pairMap = new Map<string, Transition[]>();
  for (const t of automaton.transitions) {
    const key = `${t.from}->${t.to}`;
    if (!pairMap.has(key)) {
      pairMap.set(key, []);
    }
    pairMap.get(key)!.push(t);
  }

  // 3. Build Edges (one edge per transition, maintaining symbol purity and distinct paths)
  const edges: Edge[] = [];

  automaton.transitions.forEach((t, globalIndex) => {
    const isSelfLoop = t.from === t.to;
    const forwardList = pairMap.get(`${t.from}->${t.to}`) || [];
    const idx = forwardList.indexOf(t);
    const hasReverse = !isSelfLoop && pairMap.has(`${t.to}->${t.from}`);

    let curveOffset = 0;
    let loopIndex = 0;

    if (isSelfLoop) {
      loopIndex = idx >= 0 ? idx : 0;
    } else if (hasReverse) {
      // Both u->v and v->u exist: curve outwards so they never overlap
      curveOffset = 30 + idx * 30;
    } else if (forwardList.length > 1) {
      // Multiple edges in the same direction: distribute them symmetrically around center
      if (forwardList.length % 2 === 1) {
        if (idx === 0) {
          curveOffset = 0;
        } else {
          const sign = (idx - 1) % 2 === 0 ? 1 : -1;
          const mag = (Math.floor((idx - 1) / 2) + 1) * 32;
          curveOffset = sign * mag;
        }
      } else {
        const sign = idx % 2 === 0 ? 1 : -1;
        const mag = (Math.floor(idx / 2) + 1) * 32;
        curveOffset = sign * mag;
      }
    }

    // Determine if this transition is actively being traversed during simulation
    const isActive = activeTransitions.some(
      (at) => at.from === t.from && at.to === t.to && at.symbol === t.symbol
    );

    let sourceHandle: string | undefined = undefined;
    let targetHandle: string | undefined = undefined;

    if (isSelfLoop) {
      if (loopIndex < 2) {
        sourceHandle = 'top-source';
        targetHandle = 'top-target';
      } else {
        sourceHandle = 'bottom-source';
        targetHandle = 'bottom-target';
      }
    } else if (hasReverse) {
      sourceHandle = 'bottom-source';
      targetHandle = 'bottom-target';
    }

    const edgeId = t.id ? `edge_${t.id}` : `edge_${t.from}_${t.to}_${globalIndex}`;

    edges.push({
      id: edgeId,
      source: t.from,
      target: t.to,
      type: 'customEdge',
      sourceHandle,
      targetHandle,
      data: {
        transitionId: t.id,
        symbol: t.symbol,
        isActive,
        isSelfLoop,
        loopIndex,
        curveOffset,
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

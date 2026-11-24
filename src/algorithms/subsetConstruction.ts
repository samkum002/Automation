import {
  Automaton,
  State,
  Transition,
  ConversionResult,
  SubsetConstructionStep,
  isEpsilon,
} from '../types/automaton';
import {
  computeAllEpsilonClosures,
  computeSetEpsilonClosure,
} from './epsilonClosure';

/**
 * Helper to convert an array of state IDs to a canonical sorted subset string key.
 * e.g., ["q1", "q0"] -> "{q0, q1}"
 */
export function formatSubsetKey(states: string[]): string {
  if (states.length === 0) return '∅';
  const sorted = [...new Set(states)].sort();
  return `{${sorted.join(', ')}}`;
}

/**
 * Computes Move(T, symbol) = { s' | ∃ s ∈ T such that (s, symbol, s') ∈ transitions }
 */
export function computeMove(
  states: string[],
  symbol: string,
  transitions: Transition[]
): string[] {
  const result = new Set<string>();
  for (const s of states) {
    for (const t of transitions) {
      if (t.from === s && t.symbol === symbol) {
        result.add(t.to);
      }
    }
  }
  return Array.from(result).sort();
}

/**
 * Converts an ε-NFA to a DFA using subset construction.
 */
export function convertNfaToDfa(nfa: Automaton): ConversionResult {
  const { closures: epsilonClosures, steps: epsilonClosureSteps } =
    computeAllEpsilonClosures(nfa);

  // Derive alphabet excluding epsilon symbols
  const alphabet = Array.from(
    new Set(
      nfa.transitions
        .map((t) => t.symbol)
        .filter((sym) => !isEpsilon(sym) && sym.trim() !== '')
    )
  ).sort();

  // If automaton has explicit alphabet defined, union with that
  if (nfa.alphabet && nfa.alphabet.length > 0) {
    for (const sym of nfa.alphabet) {
      if (!isEpsilon(sym) && !alphabet.includes(sym)) {
        alphabet.push(sym);
      }
    }
    alphabet.sort();
  }

  // Initial state closure: ε-closure(q0)
  const initialClosure = epsilonClosures[nfa.initialStateId] || [nfa.initialStateId];
  const initialSubsetString = formatSubsetKey(initialClosure);

  // Mapping from subset string to DFA state info
  // Key: "{q0, q1}", Value: { id: "D0", label: "{q0, q1}", subset: ["q0", "q1"], isFinal: boolean, isInitial: boolean }
  let stateCounter = 0;
  const subsetToStateIdMap = new Map<string, string>();
  const dfaStatesMap = new Map<
    string,
    { id: string; label: string; subset: string[]; isFinal: boolean; isInitial: boolean }
  >();

  const getOrCreateDfaState = (
    subset: string[],
    isInitial: boolean = false,
    isDead: boolean = false
  ): { id: string; isNew: boolean } => {
    const key = isDead ? '∅' : formatSubsetKey(subset);
    if (subsetToStateIdMap.has(key)) {
      return { id: subsetToStateIdMap.get(key)!, isNew: false };
    }

    const id = isDead ? 'q_dead' : `D${stateCounter++}`;
    const label = isDead ? '∅' : key;
    const isFinal = !isDead && subset.some((s) => nfa.finalStateIds.includes(s));

    subsetToStateIdMap.set(key, id);
    dfaStatesMap.set(id, {
      id,
      label,
      subset: isDead ? [] : [...subset].sort(),
      isFinal,
      isInitial,
    });

    return { id, isNew: true };
  };

  // Create initial DFA state
  const { id: initialDfaId } = getOrCreateDfaState(initialClosure, true, false);

  const dfaTransitions: Transition[] = [];
  const steps: SubsetConstructionStep[] = [];
  const unprocessedQueue: string[] = [initialDfaId];
  const processedSet = new Set<string>();

  // Add initial step
  steps.push({
    stepNumber: 1,
    type: 'INIT',
    sourceDfaStateId: initialDfaId,
    sourceDfaSubset: initialClosure,
    explanation: `Compute initial DFA state: ε-closure(${nfa.initialStateId}) = ${initialSubsetString}. ` +
      `This forms initial DFA state ${initialDfaId} = ${initialSubsetString}` +
      (dfaStatesMap.get(initialDfaId)?.isFinal
        ? ' (Marked as FINAL because it contains NFA final state(s)).'
        : '.'),
    currentDfaStates: Array.from(dfaStatesMap.values()),
    currentDfaTransitions: [],
  });

  let deadStateCreated = false;
  let deadStateId: string | undefined = undefined;

  // Process states in queue
  let stepIndex = 2;
  while (unprocessedQueue.length > 0) {
    const currentId = unprocessedQueue.shift()!;
    if (processedSet.has(currentId)) continue;
    processedSet.add(currentId);

    const currentState = dfaStatesMap.get(currentId)!;
    const currentSubset = currentState.subset;

    // Special handling if current state is the dead/trap state
    if (currentState.id === 'q_dead' || currentState.label === '∅') {
      for (const symbol of alphabet) {
        dfaTransitions.push({
          id: `t_${currentId}_${symbol}_${currentId}`,
          from: currentId,
          to: currentId,
          symbol,
        });
      }
      continue;
    }

    // For every symbol in alphabet
    for (const symbol of alphabet) {
      // 1. Move(T, symbol)
      const movedStates = computeMove(currentSubset, symbol, nfa.transitions);

      // 2. ε-closure(Move)
      const { closure: closureOfMove } = computeSetEpsilonClosure(
        movedStates,
        nfa.transitions
      );

      let targetStateId: string;
      let isNewState = false;
      let isDead = false;

      if (closureOfMove.length === 0) {
        // Empty set -> Dead/trap state
        isDead = true;
        if (!deadStateCreated) {
          deadStateCreated = true;
          const { id } = getOrCreateDfaState([], false, true);
          deadStateId = id;
          unprocessedQueue.push(id);
        }
        targetStateId = subsetToStateIdMap.get('∅')!;
      } else {
        const { id, isNew } = getOrCreateDfaState(closureOfMove, false, false);
        targetStateId = id;
        isNewState = isNew;
        if (isNew) {
          unprocessedQueue.push(id);
        }
      }

      // Add transition
      const transitionId = `t_${currentId}_${symbol}_${targetStateId}`;
      dfaTransitions.push({
        id: transitionId,
        from: currentId,
        to: targetStateId,
        symbol,
      });

      const movedStr = formatSubsetKey(movedStates);
      const closureStr = isDead ? '∅' : formatSubsetKey(closureOfMove);
      const targetState = dfaStatesMap.get(targetStateId)!;

      let explanation = `From DFA state ${currentId} = ${currentState.label} on input '${symbol}':\n` +
        `• Move(${currentState.label}, '${symbol}') = ${movedStr}\n` +
        `• ε-closure(${movedStr}) = ${closureStr}\n` +
        `\u2192 Transition to ${targetStateId} (${targetState.label})`;

      if (isDead) {
        explanation += ' [Dead/Trap State created/referenced]';
      } else if (isNewState) {
        explanation += ` [New DFA State discovered!${targetState.isFinal ? ' Marked FINAL.' : ''}]`;
      } else {
        explanation += ' [Existing DFA State]';
      }

      steps.push({
        stepNumber: stepIndex++,
        type: 'PROCESS_SYMBOL',
        sourceDfaStateId: currentId,
        sourceDfaSubset: currentSubset,
        symbol,
        movedStates,
        closureOfMove,
        targetDfaStateId: targetStateId,
        targetDfaSubset: targetState.subset,
        isNewDfaState: isNewState,
        isDeadState: isDead,
        explanation,
        currentDfaStates: Array.from(dfaStatesMap.values()),
        currentDfaTransitions: [...dfaTransitions],
      });
    }
  }

  // Final completion step
  const finalDfaStatesList = Array.from(dfaStatesMap.values()).map((s, index) => {
    // Generate clean circular / grid positions for visualization
    const angle = (2 * Math.PI * index) / dfaStatesMap.size;
    const radius = Math.max(160, dfaStatesMap.size * 35);
    const x = Math.round(250 + radius * Math.cos(angle));
    const y = Math.round(220 + radius * Math.sin(angle));

    return {
      id: s.id,
      label: s.label,
      isInitial: s.isInitial,
      isFinal: s.isFinal,
      nfaSubset: s.subset,
      x,
      y,
    } as State;
  });

  const finalDfaFinalStateIds = finalDfaStatesList
    .filter((s) => s.isFinal)
    .map((s) => s.id);

  const subsetMap: Record<string, string[]> = {};
  for (const [key, id] of subsetToStateIdMap.entries()) {
    const state = dfaStatesMap.get(id);
    if (state) {
      subsetMap[id] = state.subset;
    }
  }

  const generatedDfa: Automaton = {
    id: 'generated-dfa',
    name: 'Equivalent DFA',
    states: finalDfaStatesList,
    transitions: dfaTransitions,
    alphabet,
    initialStateId: initialDfaId,
    finalStateIds: finalDfaFinalStateIds,
  };

  steps.push({
    stepNumber: stepIndex,
    type: 'COMPLETE',
    sourceDfaStateId: initialDfaId,
    sourceDfaSubset: initialClosure,
    explanation: `Subset construction complete! Generated ${finalDfaStatesList.length} DFA states and ${dfaTransitions.length} transitions. ` +
      `Final states: {${finalDfaFinalStateIds.join(', ') || 'none'}}.`,
    currentDfaStates: Array.from(dfaStatesMap.values()),
    currentDfaTransitions: [...dfaTransitions],
  });

  return {
    dfa: generatedDfa,
    epsilonClosures,
    epsilonClosureSteps,
    steps,
    subsetMap,
    deadStateId,
    stats: {
      nfaStateCount: nfa.states.length,
      dfaStateCount: generatedDfa.states.length,
      nfaTransitionCount: nfa.transitions.length,
      dfaTransitionCount: generatedDfa.transitions.length,
    },
  };
}

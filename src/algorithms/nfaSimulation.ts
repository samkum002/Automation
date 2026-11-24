import { Automaton, SimulationResult, SimulationStep, isEpsilon } from '../types/automaton';
import { computeSetEpsilonClosure, computeSingleStateEpsilonClosure } from './epsilonClosure';
import { computeMove, formatSubsetKey } from './subsetConstruction';

/**
 * Simulates an input string on an ε-NFA.
 * Correctly accounts for initial ε-closure and ε-closure after every symbol.
 */
export function simulateNfa(nfa: Automaton, inputString: string): SimulationResult {
  const steps: SimulationStep[] = [];

  // Step 0: Initial states are ε-closure of initialStateId
  const { closure: initialStates } = computeSingleStateEpsilonClosure(
    nfa.initialStateId,
    nfa.transitions
  );

  steps.push({
    stepIndex: 0,
    symbolRead: '',
    currentStates: initialStates,
    activeTransitions: [],
    explanation: `Initial configuration: ε-closure(${nfa.initialStateId}) = ${formatSubsetKey(initialStates)}`,
  });

  let currentActiveStates = [...initialStates];

  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];

    // Find direct transitions on 'symbol' from any active state
    const movedStates = computeMove(currentActiveStates, symbol, nfa.transitions);

    // Collect the exact transitions taken
    const transitionsTaken: { from: string; to: string; symbol: string }[] = [];
    for (const fromState of currentActiveStates) {
      for (const t of nfa.transitions) {
        if (t.from === fromState && t.symbol === symbol) {
          transitionsTaken.push({ from: t.from, to: t.to, symbol: t.symbol });
        }
      }
    }

    // Now take ε-closure of the moved states
    const { closure: nextActiveStates } = computeSetEpsilonClosure(
      movedStates,
      nfa.transitions
    );

    // Also include any epsilon transitions taken during epsilon-closure
    for (const s of movedStates) {
      for (const t of nfa.transitions) {
        if (t.from === s && isEpsilon(t.symbol) && nextActiveStates.includes(t.to)) {
          transitionsTaken.push({ from: t.from, to: t.to, symbol: t.symbol });
        }
      }
    }

    currentActiveStates = nextActiveStates;

    const explanation =
      currentActiveStates.length === 0
        ? `Read '${symbol}': No transitions available. Automaton reached empty state set ∅ (dead branch).`
        : `Read '${symbol}': Move(${formatSubsetKey(steps[steps.length - 1].currentStates)}, '${symbol}') = ${formatSubsetKey(movedStates)}. ` +
          `ε-closure = ${formatSubsetKey(currentActiveStates)}.`;

    steps.push({
      stepIndex: i + 1,
      symbolRead: symbol,
      currentStates: currentActiveStates,
      activeTransitions: transitionsTaken,
      explanation,
    });

    if (currentActiveStates.length === 0) {
      // Any remaining symbols stay in empty set
      for (let j = i + 1; j < inputString.length; j++) {
        steps.push({
          stepIndex: j + 1,
          symbolRead: inputString[j],
          currentStates: [],
          activeTransitions: [],
          explanation: `Read '${inputString[j]}': Already trapped in ∅.`,
        });
      }
      break;
    }
  }

  // Accepted if any current active state is in nfa.finalStateIds
  const finalStatesReached = currentActiveStates.filter((s) =>
    nfa.finalStateIds.includes(s)
  );
  const accepted = finalStatesReached.length > 0;

  return {
    inputString,
    accepted,
    steps,
    finalStatesReached,
  };
}

import { Automaton, SimulationResult, SimulationStep } from '../types/automaton';

/**
 * Simulates an input string on a DFA.
 * In a DFA, there is exactly one active state at any time.
 */
export function simulateDfa(dfa: Automaton, inputString: string): SimulationResult {
  const steps: SimulationStep[] = [];

  let currentStateId = dfa.initialStateId;
  const initialObj = dfa.states.find((s) => s.id === currentStateId);
  const initialLabel = initialObj ? initialObj.label || initialObj.id : currentStateId;

  steps.push({
    stepIndex: 0,
    symbolRead: '',
    currentStates: [currentStateId],
    activeTransitions: [],
    explanation: `Start at initial state ${initialLabel} (${currentStateId}).`,
  });

  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];
    const trans = dfa.transitions.find(
      (t) => t.from === currentStateId && t.symbol === symbol
    );

    const fromObj = dfa.states.find((s) => s.id === currentStateId);
    const fromLabel = fromObj ? fromObj.label || fromObj.id : currentStateId;

    if (!trans) {
      // No transition found (or missing)
      steps.push({
        stepIndex: i + 1,
        symbolRead: symbol,
        currentStates: [],
        activeTransitions: [],
        explanation: `Read '${symbol}': No valid transition defined from state ${fromLabel}. Trapped/Rejected.`,
      });
      // Remaining characters
      for (let j = i + 1; j < inputString.length; j++) {
        steps.push({
          stepIndex: j + 1,
          symbolRead: inputString[j],
          currentStates: [],
          activeTransitions: [],
          explanation: `Read '${inputString[j]}': Trapped.`,
        });
      }
      return {
        inputString,
        accepted: false,
        steps,
        finalStatesReached: [],
      };
    }

    const nextStateId = trans.to;
    const toObj = dfa.states.find((s) => s.id === nextStateId);
    const toLabel = toObj ? toObj.label || toObj.id : nextStateId;

    steps.push({
      stepIndex: i + 1,
      symbolRead: symbol,
      currentStates: [nextStateId],
      activeTransitions: [{ from: trans.from, to: trans.to, symbol: trans.symbol }],
      explanation: `Read '${symbol}': δ(${fromLabel}, '${symbol}') \u2192 ${toLabel}.`,
    });

    currentStateId = nextStateId;
  }

  const isAccepted = dfa.finalStateIds.includes(currentStateId);
  const finalStatesReached = isAccepted ? [currentStateId] : [];

  return {
    inputString,
    accepted: isAccepted,
    steps,
    finalStatesReached,
  };
}

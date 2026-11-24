import { Automaton, EPSILON, isEpsilon, EpsilonClosureStep } from '../types/automaton';

/**
 * Computes the epsilon-closure of a single state in an automaton.
 * ε-closure(s) = set of states reachable from state s on zero or more ε-transitions.
 */
export function computeSingleStateEpsilonClosure(
  stateId: string,
  transitions: Automaton['transitions']
): { closure: string[]; explanation: string } {
  const closure = new Set<string>([stateId]);
  const queue: string[] = [stateId];
  const stepsExpl: string[] = [`Initial: {${stateId}}`];

  while (queue.length > 0) {
    const current = queue.shift()!;
    // Find all outgoing transitions on epsilon
    const epsTransitions = transitions.filter(
      (t) => t.from === current && isEpsilon(t.symbol)
    );

    for (const t of epsTransitions) {
      if (!closure.has(t.to)) {
        closure.add(t.to);
        queue.push(t.to);
        stepsExpl.push(`From ${current} via ε \u2192 ${t.to}`);
      }
    }
  }

  const sortedClosure = Array.from(closure).sort();
  const explanation =
    stepsExpl.length === 1
      ? `No outgoing ε-transitions from ${stateId}. ε-closure(${stateId}) = {${sortedClosure.join(', ')}}`
      : `${stepsExpl.join(', ')}. Final ε-closure(${stateId}) = {${sortedClosure.join(', ')}}`;

  return {
    closure: sortedClosure,
    explanation,
  };
}

/**
 * Computes epsilon-closure for all individual states in an automaton.
 */
export function computeAllEpsilonClosures(automaton: Automaton): {
  closures: Record<string, string[]>;
  steps: EpsilonClosureStep[];
} {
  const closures: Record<string, string[]> = {};
  const steps: EpsilonClosureStep[] = [];

  for (const state of automaton.states) {
    const { closure, explanation } = computeSingleStateEpsilonClosure(
      state.id,
      automaton.transitions
    );
    closures[state.id] = closure;
    steps.push({
      stateId: state.id,
      stateLabel: state.label || state.id,
      closure,
      explanation,
    });
  }

  return { closures, steps };
}

/**
 * Computes the epsilon-closure of a set of states T.
 * ε-closure(T) = ⋃_{s ∈ T} ε-closure(s)
 */
export function computeSetEpsilonClosure(
  stateIds: string[],
  transitions: Automaton['transitions']
): { closure: string[]; explanation: string } {
  if (stateIds.length === 0) {
    return { closure: [], explanation: 'ε-closure(∅) = ∅' };
  }

  const combinedClosure = new Set<string>();
  const perStateExplanations: string[] = [];

  for (const id of stateIds) {
    const { closure } = computeSingleStateEpsilonClosure(id, transitions);
    closure.forEach((s) => combinedClosure.add(s));
    perStateExplanations.push(`ε-closure(${id}) = {${closure.join(', ')}}`);
  }

  const sorted = Array.from(combinedClosure).sort();
  const explanation = `${perStateExplanations.join(' ∪ ')} = {${sorted.join(', ')}}`;

  return { closure: sorted, explanation };
}

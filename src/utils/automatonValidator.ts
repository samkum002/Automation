import { Automaton, ValidationResult, isEpsilon } from '../types/automaton';

/**
 * Validates an automaton before conversion or simulation.
 */
export function validateAutomaton(automaton: Automaton): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check states exist
  if (!automaton.states || automaton.states.length === 0) {
    errors.push('The automaton has no states. Please add at least one state.');
    return { isValid: false, errors, warnings };
  }

  // Check unique IDs
  const stateIds = new Set<string>();
  for (const s of automaton.states) {
    if (!s.id || s.id.trim() === '') {
      errors.push('One or more states have an empty identifier.');
    } else if (stateIds.has(s.id)) {
      errors.push(`Duplicate state identifier found: "${s.id}". Each state must have a unique identifier.`);
    } else {
      stateIds.add(s.id);
    }
  }

  // Check initial state
  const initialStates = automaton.states.filter((s) => s.isInitial);
  if (initialStates.length === 0) {
    errors.push('No initial state is set. Exactly one state must be designated as the initial state.');
  } else if (initialStates.length > 1) {
    errors.push(`Multiple initial states designated (${initialStates.map((s) => s.id).join(', ')}). An automaton must have exactly one initial state.`);
  }

  // Check final state
  const finalStates = automaton.states.filter((s) => s.isFinal);
  if (finalStates.length === 0) {
    warnings.push('No final/accepting state is designated. The automaton will reject all input strings.');
  }

  // Check transitions
  for (let i = 0; i < automaton.transitions.length; i++) {
    const t = automaton.transitions[i];
    if (!stateIds.has(t.from)) {
      errors.push(`Transition #${i + 1} references non-existent source state: "${t.from}".`);
    }
    if (!stateIds.has(t.to)) {
      errors.push(`Transition #${i + 1} references non-existent target state: "${t.to}".`);
    }
    if (t.symbol === undefined || t.symbol === null || t.symbol.trim() === '') {
      errors.push(`Transition from "${t.from}" to "${t.to}" has an empty symbol. Use 'ε' for epsilon.`);
    }
  }

  // Check unreachable states from initial state
  if (initialStates.length === 1) {
    const reachable = new Set<string>([initialStates[0].id]);
    const queue = [initialStates[0].id];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const t of automaton.transitions) {
        if (t.from === curr && !reachable.has(t.to)) {
          reachable.add(t.to);
          queue.push(t.to);
        }
      }
    }
    const unreachable = automaton.states.filter((s) => !reachable.has(s.id));
    if (unreachable.length > 0) {
      warnings.push(`Unreachable state(s) detected: ${unreachable.map((s) => s.id).join(', ')}. These will not affect language recognition.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates an input string against an automaton's alphabet.
 */
export function validateInputString(
  inputString: string,
  alphabet: string[]
): { isValid: boolean; invalidChars: string[] } {
  const allowed = new Set(alphabet);
  const invalidChars: string[] = [];

  for (const ch of inputString) {
    if (!allowed.has(ch) && !isEpsilon(ch)) {
      if (!invalidChars.includes(ch)) {
        invalidChars.push(ch);
      }
    }
  }

  return {
    isValid: invalidChars.length === 0,
    invalidChars,
  };
}

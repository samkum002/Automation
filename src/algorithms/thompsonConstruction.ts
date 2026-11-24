import { Automaton, State, Transition, EPSILON, isEpsilon } from '../types/automaton';
import { validateRegex, insertExplicitConcat, infixToPostfix } from './regexParser';

interface Fragment {
  start: string;
  end: string;
  states: Set<string>;
  transitions: Transition[];
}

/**
 * Builds an ε-NFA from a regular expression using Thompson's Construction.
 */
export function buildNfaFromRegex(regex: string): Automaton {
  const validation = validateRegex(regex);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid regular expression.');
  }

  const explicitConcat = insertExplicitConcat(regex);
  const postfix = infixToPostfix(explicitConcat);

  let stateCounter = 0;
  const nextState = () => `s${stateCounter++}`;
  let transCounter = 0;
  const nextTransId = () => `t${transCounter++}`;

  const stack: Fragment[] = [];

  for (const token of postfix) {
    if (token === '*') {
      // Kleene Star
      if (stack.length < 1) {
        throw new Error('Malformed expression near *');
      }
      const frag = stack.pop()!;
      const newStart = nextState();
      const newEnd = nextState();

      const newTransitions: Transition[] = [
        ...frag.transitions,
        { id: nextTransId(), from: newStart, to: frag.start, symbol: EPSILON },
        { id: nextTransId(), from: newStart, to: newEnd, symbol: EPSILON },
        { id: nextTransId(), from: frag.end, to: frag.start, symbol: EPSILON },
        { id: nextTransId(), from: frag.end, to: newEnd, symbol: EPSILON },
      ];

      const newStates = new Set(frag.states);
      newStates.add(newStart);
      newStates.add(newEnd);

      stack.push({
        start: newStart,
        end: newEnd,
        states: newStates,
        transitions: newTransitions,
      });
    } else if (token === '+') {
      // One or more: A+ = A.A*
      if (stack.length < 1) throw new Error('Malformed expression near +');
      const frag = stack.pop()!;
      const newStart = nextState();
      const newEnd = nextState();

      const newTransitions: Transition[] = [
        ...frag.transitions,
        { id: nextTransId(), from: newStart, to: frag.start, symbol: EPSILON },
        { id: nextTransId(), from: frag.end, to: frag.start, symbol: EPSILON },
        { id: nextTransId(), from: frag.end, to: newEnd, symbol: EPSILON },
      ];

      const newStates = new Set(frag.states);
      newStates.add(newStart);
      newStates.add(newEnd);

      stack.push({
        start: newStart,
        end: newEnd,
        states: newStates,
        transitions: newTransitions,
      });
    } else if (token === '.') {
      // Concatenation
      if (stack.length < 2) {
        throw new Error('Malformed expression near concatenation.');
      }
      const frag2 = stack.pop()!;
      const frag1 = stack.pop()!;

      const newTransitions: Transition[] = [
        ...frag1.transitions,
        ...frag2.transitions,
        { id: nextTransId(), from: frag1.end, to: frag2.start, symbol: EPSILON },
      ];

      const newStates = new Set([...frag1.states, ...frag2.states]);

      stack.push({
        start: frag1.start,
        end: frag2.end,
        states: newStates,
        transitions: newTransitions,
      });
    } else if (token === '|') {
      // Union
      if (stack.length < 2) {
        throw new Error('Malformed expression near |');
      }
      const frag2 = stack.pop()!;
      const frag1 = stack.pop()!;

      const newStart = nextState();
      const newEnd = nextState();

      const newTransitions: Transition[] = [
        ...frag1.transitions,
        ...frag2.transitions,
        { id: nextTransId(), from: newStart, to: frag1.start, symbol: EPSILON },
        { id: nextTransId(), from: newStart, to: frag2.start, symbol: EPSILON },
        { id: nextTransId(), from: frag1.end, to: newEnd, symbol: EPSILON },
        { id: nextTransId(), from: frag2.end, to: newEnd, symbol: EPSILON },
      ];

      const newStates = new Set([...frag1.states, ...frag2.states, newStart, newEnd]);

      stack.push({
        start: newStart,
        end: newEnd,
        states: newStates,
        transitions: newTransitions,
      });
    } else {
      // Base case: Literal symbol or EPSILON or Empty Set
      const start = nextState();
      const end = nextState();
      const transitions: Transition[] = [];

      if (token === '∅') {
        // Empty language: start and end disconnected
      } else {
        const symbol = isEpsilon(token) ? EPSILON : token;
        transitions.push({
          id: nextTransId(),
          from: start,
          to: end,
          symbol,
        });
      }

      stack.push({
        start,
        end,
        states: new Set([start, end]),
        transitions,
      });
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid regular expression parsing result.');
  }

  const finalFrag = stack[0];

  // Renumber states systematically starting with initial state = q0
  const stateIdMap = new Map<string, string>();
  let qCounter = 0;

  // BFS / topological order to assign q0, q1, q2...
  const queue = [finalFrag.start];
  stateIdMap.set(finalFrag.start, `q${qCounter++}`);

  const visited = new Set<string>([finalFrag.start]);
  while (queue.length > 0) {
    const curr = queue.shift()!;
    const outgoing = finalFrag.transitions.filter((t) => t.from === curr);
    for (const t of outgoing) {
      if (!visited.has(t.to)) {
        visited.add(t.to);
        stateIdMap.set(t.to, `q${qCounter++}`);
        queue.push(t.to);
      }
    }
  }

  // Any remaining disconnected states
  for (const s of finalFrag.states) {
    if (!stateIdMap.has(s)) {
      stateIdMap.set(s, `q${qCounter++}`);
    }
  }

  // Renumbered transitions
  const renumberedTransitions: Transition[] = finalFrag.transitions.map((t, idx) => ({
    id: `t_${stateIdMap.get(t.from)!}_${stateIdMap.get(t.to)!}_${idx}`,
    from: stateIdMap.get(t.from)!,
    to: stateIdMap.get(t.to)!,
    symbol: t.symbol,
  }));

  const initialRenumbered = stateIdMap.get(finalFrag.start)!;
  const finalRenumbered = stateIdMap.get(finalFrag.end)!;

  // Extract alphabet (unique non-epsilon symbols)
  const alphabet = Array.from(
    new Set(
      renumberedTransitions
        .map((t) => t.symbol)
        .filter((sym) => !isEpsilon(sym) && sym !== '∅')
    )
  ).sort();

  // Layout states in layers
  const layers = computeLayers(
    initialRenumbered,
    Array.from(stateIdMap.values()),
    renumberedTransitions
  );

  const states: State[] = Array.from(stateIdMap.values()).map((qId) => {
    const pos = layers[qId] || { x: 100, y: 150 };
    return {
      id: qId,
      label: qId,
      isInitial: qId === initialRenumbered,
      isFinal: qId === finalRenumbered,
      x: pos.x,
      y: pos.y,
    };
  });

  return {
    id: `nfa-${Date.now()}`,
    name: `ε-NFA for "${regex}"`,
    states,
    transitions: renumberedTransitions,
    alphabet,
    initialStateId: initialRenumbered,
    finalStateIds: [finalRenumbered],
  };
}

/**
 * Computes layered (x, y) coordinates for a cleaner left-to-right diagram.
 */
function computeLayers(
  initialId: string,
  stateIds: string[],
  transitions: Transition[]
): Record<string, { x: number; y: number }> {
  const depth: Record<string, number> = {};
  const queue = [{ id: initialId, d: 0 }];
  depth[initialId] = 0;

  while (queue.length > 0) {
    const { id, d } = queue.shift()!;
    const outgoing = transitions.filter((t) => t.from === id);
    for (const t of outgoing) {
      if (depth[t.to] === undefined || depth[t.to] < d + 1) {
        // avoid infinite loops on back-edges
        if (depth[t.to] === undefined) {
          depth[t.to] = d + 1;
          queue.push({ id: t.to, d: d + 1 });
        }
      }
    }
  }

  // Any unreachable states get depth = 0
  for (const s of stateIds) {
    if (depth[s] === undefined) {
      depth[s] = 0;
    }
  }

  // Group states by layer
  const layerGroups: Record<number, string[]> = {};
  for (const s of stateIds) {
    const d = depth[s];
    if (!layerGroups[d]) layerGroups[d] = [];
    layerGroups[d].push(s);
  }

  const result: Record<string, { x: number; y: number }> = {};
  const X_SPACING = 150;
  const Y_SPACING = 110;

  Object.entries(layerGroups).forEach(([dStr, statesInLayer]) => {
    const d = parseInt(dStr, 10);
    const totalInLayer = statesInLayer.length;
    statesInLayer.forEach((sId, index) => {
      const x = 80 + d * X_SPACING;
      const y = 80 + (index - (totalInLayer - 1) / 2) * Y_SPACING + 100;
      result[sId] = { x, y: Math.max(60, y) };
    });
  });

  return result;
}

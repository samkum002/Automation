import { Automaton, EPSILON } from '../types/automaton';

export interface AutomatonExample {
  id: string;
  name: string;
  category: string;
  description: string;
  regex?: string;
  automaton: Automaton;
  testStrings: { string: string; shouldAccept: boolean; note: string }[];
}

export const EXAMPLE_AUTOMATA: AutomatonExample[] = [
  {
    id: 'textbook-abb',
    name: 'Strings ending with "abb"',
    category: 'Textbook Classics',
    description: 'Classic textbook ε-NFA for (a|b)*abb. Demonstrates non-determinism with multiple paths on "a" and "b".',
    regex: '(a|b)*abb',
    automaton: {
      id: 'ex-abb',
      name: 'Strings ending with "abb"',
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 80, y: 150 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 230, y: 150 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: false, x: 380, y: 150 },
        { id: 'q3', label: 'q3', isInitial: false, isFinal: true, x: 530, y: 150 },
      ],
      transitions: [
        { id: 't0_a', from: 'q0', to: 'q0', symbol: 'a' },
        { id: 't0_b', from: 'q0', to: 'q0', symbol: 'b' },
        { id: 't0_1_a', from: 'q0', to: 'q1', symbol: 'a' },
        { id: 't1_2_b', from: 'q1', to: 'q2', symbol: 'b' },
        { id: 't2_3_b', from: 'q2', to: 'q3', symbol: 'b' },
      ],
      alphabet: ['a', 'b'],
      initialStateId: 'q0',
      finalStateIds: ['q3'],
    },
    testStrings: [
      { string: 'abb', shouldAccept: true, note: 'Direct match' },
      { string: 'aabb', shouldAccept: true, note: 'Prefix a, then abb' },
      { string: 'babb', shouldAccept: true, note: 'Prefix b, then abb' },
      { string: 'ab', shouldAccept: false, note: 'Incomplete string' },
      { string: 'abba', shouldAccept: false, note: 'Ends with a, not abb' },
      { string: '', shouldAccept: false, note: 'Empty string rejected' },
    ],
  },
  {
    id: 'epsilon-chain',
    name: 'Epsilon Chain (q0 → q1 → q2)',
    category: 'ε-Transitions',
    description: 'Demonstrates multi-hop ε-closure computation through a chain of epsilon transitions.',
    automaton: {
      id: 'ex-eps-chain',
      name: 'Epsilon Chain',
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 80, y: 150 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 230, y: 150 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: false, x: 380, y: 150 },
        { id: 'q3', label: 'q3', isInitial: false, isFinal: true, x: 530, y: 150 },
      ],
      transitions: [
        { id: 't_0_1_eps', from: 'q0', to: 'q1', symbol: EPSILON },
        { id: 't_1_2_eps', from: 'q1', to: 'q2', symbol: EPSILON },
        { id: 't_2_3_a', from: 'q2', to: 'q3', symbol: 'a' },
        { id: 't_3_3_b', from: 'q3', to: 'q3', symbol: 'b' },
      ],
      alphabet: ['a', 'b'],
      initialStateId: 'q0',
      finalStateIds: ['q3'],
    },
    testStrings: [
      { string: 'a', shouldAccept: true, note: 'Traverses ε to q2 then a to q3' },
      { string: 'ab', shouldAccept: true, note: 'a followed by b' },
      { string: 'abbb', shouldAccept: true, note: 'a followed by multiple bs' },
      { string: 'b', shouldAccept: false, note: 'Cannot start with b' },
      { string: '', shouldAccept: false, note: 'Requires at least one a' },
    ],
  },
  {
    id: 'epsilon-cycle',
    name: 'Cyclic Epsilon Transitions',
    category: 'ε-Transitions',
    description: 'Contains an ε-cycle (q0 → q1 → q2 → q0). The algorithm must terminate and correctly group these states.',
    automaton: {
      id: 'ex-eps-cycle',
      name: 'Cyclic Epsilon Transitions',
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 120, y: 100 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 320, y: 100 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: false, x: 220, y: 250 },
        { id: 'q3', label: 'q3', isInitial: false, isFinal: true, x: 450, y: 180 },
      ],
      transitions: [
        { id: 't_c01', from: 'q0', to: 'q1', symbol: EPSILON },
        { id: 't_c12', from: 'q1', to: 'q2', symbol: EPSILON },
        { id: 't_c20', from: 'q2', to: 'q0', symbol: EPSILON },
        { id: 't_c13_a', from: 'q1', to: 'q3', symbol: 'a' },
        { id: 't_c23_b', from: 'q2', to: 'q3', symbol: 'b' },
      ],
      alphabet: ['a', 'b'],
      initialStateId: 'q0',
      finalStateIds: ['q3'],
    },
    testStrings: [
      { string: 'a', shouldAccept: true, note: 'q0 reaches q1 via ε then takes a' },
      { string: 'b', shouldAccept: true, note: 'q0 reaches q2 via ε then takes b' },
      { string: 'ab', shouldAccept: false, note: 'No transition out of q3' },
      { string: '', shouldAccept: false, note: 'No final state in initial closure' },
    ],
  },
  {
    id: 'initial-is-final',
    name: 'Initial State is Final (Accepts ε)',
    category: 'Edge Cases',
    description: 'Initial state is accepting, meaning the language accepts the empty string ε. Example: a*b*.',
    automaton: {
      id: 'ex-init-final',
      name: 'Accepts Empty String (a*b*)',
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: true, x: 100, y: 150 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: true, x: 320, y: 150 },
      ],
      transitions: [
        { id: 't_0_0_a', from: 'q0', to: 'q0', symbol: 'a' },
        { id: 't_0_1_eps', from: 'q0', to: 'q1', symbol: EPSILON },
        { id: 't_1_1_b', from: 'q1', to: 'q1', symbol: 'b' },
      ],
      alphabet: ['a', 'b'],
      initialStateId: 'q0',
      finalStateIds: ['q0', 'q1'],
    },
    testStrings: [
      { string: '', shouldAccept: true, note: 'Empty string accepted' },
      { string: 'a', shouldAccept: true, note: 'Single a' },
      { string: 'b', shouldAccept: true, note: 'Single b' },
      { string: 'aaabb', shouldAccept: true, note: 'a* followed by b*' },
      { string: 'ba', shouldAccept: false, note: 'b cannot precede a' },
    ],
  },
  {
    id: 'dead-state-demo',
    name: 'Dead / Trap State Generation',
    category: 'Edge Cases',
    description: 'Automaton with missing transitions where subset construction must construct the dead state ∅ with self-loops.',
    automaton: {
      id: 'ex-dead-state',
      name: 'Automaton Generating Dead State',
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 100, y: 150 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: true, x: 320, y: 150 },
      ],
      transitions: [
        { id: 't_0_1_0', from: 'q0', to: 'q1', symbol: '0' },
        // Notice no transition on '1' from q0, and no transition from q1!
      ],
      alphabet: ['0', '1'],
      initialStateId: 'q0',
      finalStateIds: ['q1'],
    },
    testStrings: [
      { string: '0', shouldAccept: true, note: 'Only accepted string' },
      { string: '1', shouldAccept: false, note: 'Goes directly to dead state ∅' },
      { string: '00', shouldAccept: false, note: 'Goes to dead state after 0' },
      { string: '', shouldAccept: false, note: 'Rejected' },
    ],
  },
  {
    id: 'multiple-final-states',
    name: 'Multiple Final States',
    category: 'Complex',
    description: 'Automaton with distinct accepting conditions (either starts with "a" or starts with "b").',
    automaton: {
      id: 'ex-multi-final',
      name: 'Multiple Final States (a+ | b+)',
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 80, y: 160 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: true, x: 280, y: 90 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: true, x: 280, y: 230 },
      ],
      transitions: [
        { id: 't_0_1_a', from: 'q0', to: 'q1', symbol: 'a' },
        { id: 't_0_2_b', from: 'q0', to: 'q2', symbol: 'b' },
        { id: 't_1_1_a', from: 'q1', to: 'q1', symbol: 'a' },
        { id: 't_2_2_b', from: 'q2', to: 'q2', symbol: 'b' },
      ],
      alphabet: ['a', 'b'],
      initialStateId: 'q0',
      finalStateIds: ['q1', 'q2'],
    },
    testStrings: [
      { string: 'a', shouldAccept: true, note: 'Accepts on q1' },
      { string: 'aaa', shouldAccept: true, note: 'Accepts on q1' },
      { string: 'b', shouldAccept: true, note: 'Accepts on q2' },
      { string: 'bbb', shouldAccept: true, note: 'Accepts on q2' },
      { string: 'ab', shouldAccept: false, note: 'Cannot mix a and b' },
      { string: '', shouldAccept: false, note: 'Rejected' },
    ],
  },
  {
    id: 'ends-in-01',
    name: 'Binary Strings Ending in "01"',
    category: 'Textbook Classics',
    description: 'Standard textbook problem: (0|1)*01 over alphabet {0, 1}.',
    regex: '(0|1)*01',
    automaton: {
      id: 'ex-ends-01',
      name: 'Binary ending with 01',
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 80, y: 150 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 260, y: 150 },
        { id: 'q2', label: 'q2', isInitial: false, isFinal: true, x: 440, y: 150 },
      ],
      transitions: [
        { id: 't0_0', from: 'q0', to: 'q0', symbol: '0' },
        { id: 't0_1', from: 'q0', to: 'q0', symbol: '1' },
        { id: 't0_q1_0', from: 'q0', to: 'q1', symbol: '0' },
        { id: 't1_q2_1', from: 'q1', to: 'q2', symbol: '1' },
      ],
      alphabet: ['0', '1'],
      initialStateId: 'q0',
      finalStateIds: ['q2'],
    },
    testStrings: [
      { string: '01', shouldAccept: true, note: 'Exact match' },
      { string: '1101', shouldAccept: true, note: 'Ends in 01' },
      { string: '0001', shouldAccept: true, note: 'Ends in 01' },
      { string: '10', shouldAccept: false, note: 'Ends in 10' },
      { string: '0', shouldAccept: false, note: 'Incomplete' },
    ],
  },
];

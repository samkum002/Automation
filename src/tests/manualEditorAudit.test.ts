import { describe, it, expect } from 'vitest';
import { automatonToReactFlow } from '../utils/automatonConverter';
import { Automaton, EPSILON } from '../types/automaton';
import { convertNfaToDfa } from '../algorithms/subsetConstruction';
import { simulateDfa } from '../algorithms/dfaSimulation';

describe('Manual Automaton Editor & Diagram Synchronization Audit', () => {
  it('Bug 1: Every transition in automaton must produce an edge in the diagram (1-to-1 mapping)', () => {
    const automaton: Automaton = {
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: true, x: 200, y: 0 },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q1', symbol: 'a' },
        { id: 't2', from: 'q0', to: 'q1', symbol: 'b' },
        { id: 't3', from: 'q0', to: 'q1', symbol: EPSILON },
      ],
      alphabet: ['a', 'b'],
      initialStateId: 'q0',
      finalStateIds: ['q1'],
    };

    const graph = automatonToReactFlow(automaton);
    // Number of edges must equal number of transitions
    expect(graph.edges.length).toBe(automaton.transitions.length);
    expect(graph.edges.length).toBe(3);

    // Each edge has an id corresponding to transition id
    expect(graph.edges.map((e) => (e.data as any).transitionId)).toEqual(['t1', 't2', 't3']);
  });

  it('Bug 2: Transitions must have single individual labels, NEVER automatically combined as "a,b"', () => {
    const automaton: Automaton = {
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: true, x: 200, y: 0 },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q1', symbol: 'a' },
        { id: 't2', from: 'q0', to: 'q1', symbol: 'b' },
      ],
      alphabet: ['a', 'b'],
      initialStateId: 'q0',
      finalStateIds: ['q1'],
    };

    const graph = automatonToReactFlow(automaton);
    const symbols = graph.edges.map((e) => (e.data as any).symbol);

    expect(symbols).toEqual(['a', 'b']);
    expect(symbols).not.toContain('a,b');
    expect(symbols).not.toContain('a, b');
  });

  it('Bug 3 / Visuals: Parallel edges between same pair must have distinct curveOffsets to prevent overlapping', () => {
    const automaton: Automaton = {
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: true, x: 200, y: 0 },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q1', symbol: 'a' },
        { id: 't2', from: 'q0', to: 'q1', symbol: 'b' },
        { id: 't3', from: 'q0', to: 'q1', symbol: EPSILON },
      ],
      alphabet: ['a', 'b'],
      initialStateId: 'q0',
      finalStateIds: ['q1'],
    };

    const graph = automatonToReactFlow(automaton);
    const offsets = graph.edges.map((e) => (e.data as any).curveOffset);

    // All offsets must be unique
    const uniqueOffsets = new Set(offsets);
    expect(uniqueOffsets.size).toBe(graph.edges.length);
  });

  it('Self-loops: Multiple self-loops on the same state must have distinct loopIndices', () => {
    const automaton: Automaton = {
      states: [{ id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 0, y: 0 }],
      transitions: [
        { id: 't1', from: 'q0', to: 'q0', symbol: 'a' },
        { id: 't2', from: 'q0', to: 'q0', symbol: 'b' },
      ],
      alphabet: ['a', 'b'],
      initialStateId: 'q0',
      finalStateIds: [],
    };

    const graph = automatonToReactFlow(automaton);
    expect(graph.edges.length).toBe(2);
    expect((graph.edges[0].data as any).isSelfLoop).toBe(true);
    expect((graph.edges[1].data as any).isSelfLoop).toBe(true);
    expect((graph.edges[0].data as any).loopIndex).toBe(0);
    expect((graph.edges[1].data as any).loopIndex).toBe(1);
  });

  it('Deleting a transition removes only that specific edge without affecting others', () => {
    let transitions = [
      { id: 't1', from: 'q0', to: 'q1', symbol: 'a' },
      { id: 't2', from: 'q0', to: 'q1', symbol: 'b' },
    ];

    // Delete t1
    transitions = transitions.filter((t) => t.id !== 't1');

    const automaton: Automaton = {
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: true, x: 200, y: 0 },
      ],
      transitions,
      alphabet: ['a', 'b'],
      initialStateId: 'q0',
      finalStateIds: ['q1'],
    };

    const graph = automatonToReactFlow(automaton);
    expect(graph.edges.length).toBe(1);
    expect((graph.edges[0].data as any).symbol).toBe('b');
    expect((graph.edges[0].data as any).transitionId).toBe('t2');
  });

  it('Deleting a state cleans up all connected transitions', () => {
    const stateToDelete = 'q1';
    let states = [
      { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 0, y: 0 },
      { id: 'q1', label: 'q1', isInitial: false, isFinal: false, x: 200, y: 0 },
      { id: 'q2', label: 'q2', isInitial: false, isFinal: true, x: 400, y: 0 },
    ];
    let transitions = [
      { id: 't1', from: 'q0', to: 'q1', symbol: 'a' },
      { id: 't2', from: 'q1', to: 'q2', symbol: 'b' },
      { id: 't3', from: 'q0', to: 'q2', symbol: 'a' },
    ];

    // State deletion logic as implemented in AutomatonEditor
    states = states.filter((s) => s.id !== stateToDelete);
    transitions = transitions.filter((t) => t.from !== stateToDelete && t.to !== stateToDelete);

    expect(states.length).toBe(2);
    expect(transitions.length).toBe(1);
    expect(transitions[0].id).toBe('t3');

    const graph = automatonToReactFlow({
      states,
      transitions,
      alphabet: ['a', 'b'],
      initialStateId: 'q0',
      finalStateIds: ['q2'],
    });

    expect(graph.nodes.length).toBe(2);
    expect(graph.edges.length).toBe(1);
    expect(graph.edges[0].source).toBe('q0');
    expect(graph.edges[0].target).toBe('q2');
  });

  it('Converting a manually constructed multi-transition ε-NFA produces an equivalent DFA', () => {
    // Automaton accepting strings matching (a|b)
    const automaton: Automaton = {
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isFinal: false, x: 0, y: 0 },
        { id: 'q1', label: 'q1', isInitial: false, isFinal: true, x: 200, y: 0 },
      ],
      transitions: [
        { id: 't1', from: 'q0', to: 'q1', symbol: 'a' },
        { id: 't2', from: 'q0', to: 'q1', symbol: 'b' },
      ],
      alphabet: ['a', 'b'],
      initialStateId: 'q0',
      finalStateIds: ['q1'],
    };

    const conversion = convertNfaToDfa(automaton);
    const dfa = conversion.dfa;

    // Simulation on DFA
    expect(simulateDfa(dfa, 'a').accepted).toBe(true);
    expect(simulateDfa(dfa, 'b').accepted).toBe(true);
    expect(simulateDfa(dfa, 'ab').accepted).toBe(false);
    expect(simulateDfa(dfa, '').accepted).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import {
  computeSingleStateEpsilonClosure,
  computeSetEpsilonClosure,
  computeAllEpsilonClosures,
} from '../algorithms/epsilonClosure';
import { Automaton, EPSILON } from '../types/automaton';

describe('Epsilon Closure Algorithm', () => {
  it('should compute epsilon-closure for a single isolated state as itself', () => {
    const transitions = [
      { id: 't1', from: 'q0', to: 'q1', symbol: 'a' },
    ];
    const res = computeSingleStateEpsilonClosure('q0', transitions);
    expect(res.closure).toEqual(['q0']);
  });

  it('should compute epsilon-closure for a chain of epsilon transitions', () => {
    const transitions = [
      { id: 't1', from: 'q0', to: 'q1', symbol: EPSILON },
      { id: 't2', from: 'q1', to: 'q2', symbol: EPSILON },
      { id: 't3', from: 'q2', to: 'q3', symbol: 'a' },
    ];
    const res = computeSingleStateEpsilonClosure('q0', transitions);
    expect(res.closure).toEqual(['q0', 'q1', 'q2']);
  });

  it('should handle cyclic epsilon transitions without infinite looping', () => {
    const transitions = [
      { id: 't1', from: 'q0', to: 'q1', symbol: EPSILON },
      { id: 't2', from: 'q1', to: 'q2', symbol: EPSILON },
      { id: 't3', from: 'q2', to: 'q0', symbol: EPSILON },
    ];
    const res = computeSingleStateEpsilonClosure('q0', transitions);
    expect(res.closure).toEqual(['q0', 'q1', 'q2']);
  });

  it('should compute epsilon-closure for a set of states', () => {
    const transitions = [
      { id: 't1', from: 'q0', to: 'q1', symbol: EPSILON },
      { id: 't2', from: 'q2', to: 'q3', symbol: EPSILON },
    ];
    const res = computeSetEpsilonClosure(['q0', 'q2'], transitions);
    expect(res.closure).toEqual(['q0', 'q1', 'q2', 'q3']);
  });

  it('should return empty set for empty input set', () => {
    const res = computeSetEpsilonClosure([], []);
    expect(res.closure).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import {
  validateRegex,
  insertExplicitConcat,
  infixToPostfix,
} from '../algorithms/regexParser';
import { buildNfaFromRegex } from '../algorithms/thompsonConstruction';
import { simulateNfa } from '../algorithms/nfaSimulation';

describe('Regex Parser & Thompson Construction', () => {
  it('should validate valid regular expressions', () => {
    expect(validateRegex('a').isValid).toBe(true);
    expect(validateRegex('a*').isValid).toBe(true);
    expect(validateRegex('(a|b)*abb').isValid).toBe(true);
    expect(validateRegex('a(b|c)*').isValid).toBe(true);
  });

  it('should invalidate malformed expressions', () => {
    expect(validateRegex('').isValid).toBe(false);
    expect(validateRegex('(a|b').isValid).toBe(false);
    expect(validateRegex('a||b').isValid).toBe(false);
    expect(validateRegex('*a').isValid).toBe(false);
    expect(validateRegex('|a').isValid).toBe(false);
  });

  it('should insert explicit concatenation dots', () => {
    expect(insertExplicitConcat('ab')).toBe('a.b');
    expect(insertExplicitConcat('a*b')).toBe('a*.b');
    expect(insertExplicitConcat('(a|b)c')).toBe('(a|b).c');
    expect(insertExplicitConcat('(a|b)*abb')).toBe('(a|b)*.a.b.b');
  });

  it('should convert infix to postfix correctly', () => {
    const postfix = infixToPostfix('a.b');
    expect(postfix).toEqual(['a', 'b', '.']);

    const postfixStar = infixToPostfix('a*.b');
    expect(postfixStar).toEqual(['a', '*', 'b', '.']);
  });

  it('should construct valid ε-NFA for (a|b)*abb and simulate correctly', () => {
    const nfa = buildNfaFromRegex('(a|b)*abb');
    expect(nfa.states.length).toBeGreaterThan(0);
    expect(nfa.initialStateId).toBeDefined();
    expect(nfa.finalStateIds.length).toBe(1);

    // Test simulation on the constructed NFA
    expect(simulateNfa(nfa, 'abb').accepted).toBe(true);
    expect(simulateNfa(nfa, 'aabb').accepted).toBe(true);
    expect(simulateNfa(nfa, 'babb').accepted).toBe(true);
    expect(simulateNfa(nfa, 'ab').accepted).toBe(false);
    expect(simulateNfa(nfa, 'abba').accepted).toBe(false);
  });
});

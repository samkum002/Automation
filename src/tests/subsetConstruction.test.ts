import { describe, it, expect } from 'vitest';
import { convertNfaToDfa } from '../algorithms/subsetConstruction';
import { simulateNfa } from '../algorithms/nfaSimulation';
import { simulateDfa } from '../algorithms/dfaSimulation';
import { EXAMPLE_AUTOMATA } from '../examples/exampleAutomata';
import { buildNfaFromRegex } from '../algorithms/thompsonConstruction';

describe('Subset Construction Algorithm', () => {
  it('should convert textbook example (a|b)*abb and produce equivalent DFA', () => {
    const textbook = EXAMPLE_AUTOMATA.find((e) => e.id === 'textbook-abb')!;
    const conversion = convertNfaToDfa(textbook.automaton);
    const dfa = conversion.dfa;

    expect(dfa.states.length).toBeGreaterThan(0);
    expect(dfa.finalStateIds.length).toBeGreaterThan(0);

    const testStrings = ['abb', 'aabb', 'babb', 'ab', 'abba', '', 'bbbaabb', 'b'];
    for (const str of testStrings) {
      const nfaRes = simulateNfa(textbook.automaton, str);
      const dfaRes = simulateDfa(dfa, str);
      expect(dfaRes.accepted).toBe(nfaRes.accepted);
    }
  });

  it('should handle dead state correctly when transitions are missing', () => {
    const deadExample = EXAMPLE_AUTOMATA.find((e) => e.id === 'dead-state-demo')!;
    const conversion = convertNfaToDfa(deadExample.automaton);
    const dfa = conversion.dfa;

    expect(conversion.deadStateId).toBeDefined();

    const testStrings = ['0', '1', '00', '01', '', '10'];
    for (const str of testStrings) {
      const nfaRes = simulateNfa(deadExample.automaton, str);
      const dfaRes = simulateDfa(dfa, str);
      expect(dfaRes.accepted).toBe(nfaRes.accepted);
    }
  });

  it('should convert an automaton whose initial state is final (accepts empty string)', () => {
    const initFinalEx = EXAMPLE_AUTOMATA.find((e) => e.id === 'initial-is-final')!;
    const conversion = convertNfaToDfa(initFinalEx.automaton);
    const dfa = conversion.dfa;

    // Check empty string acceptance
    const nfaEmpty = simulateNfa(initFinalEx.automaton, '');
    const dfaEmpty = simulateDfa(dfa, '');
    expect(nfaEmpty.accepted).toBe(true);
    expect(dfaEmpty.accepted).toBe(true);

    const testStrings = ['', 'a', 'b', 'aa', 'bb', 'aabb', 'ba'];
    for (const str of testStrings) {
      const nfaRes = simulateNfa(initFinalEx.automaton, str);
      const dfaRes = simulateDfa(dfa, str);
      expect(dfaRes.accepted).toBe(nfaRes.accepted);
    }
  });

  it('should convert Thompson ε-NFA for (0|1)*01 and preserve language equivalence', () => {
    const nfa = buildNfaFromRegex('(0|1)*01');
    const conversion = convertNfaToDfa(nfa);
    const dfa = conversion.dfa;

    const testStrings = ['01', '001', '101', '11101', '0', '1', '10', '00', ''];
    for (const str of testStrings) {
      const nfaRes = simulateNfa(nfa, str);
      const dfaRes = simulateDfa(dfa, str);
      expect(dfaRes.accepted).toBe(nfaRes.accepted);
    }
  });
});

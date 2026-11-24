import { describe, it, expect } from 'vitest';
import { simulateNfa } from '../algorithms/nfaSimulation';
import { simulateDfa } from '../algorithms/dfaSimulation';
import { convertNfaToDfa } from '../algorithms/subsetConstruction';
import { EXAMPLE_AUTOMATA } from '../examples/exampleAutomata';

describe('Automata Simulation & Equivalence Tests', () => {
  for (const example of EXAMPLE_AUTOMATA) {
    describe(`Example: ${example.name}`, () => {
      const conversion = convertNfaToDfa(example.automaton);
      const dfa = conversion.dfa;

      for (const t of example.testStrings) {
        it(`string "${t.string}": should be ${t.shouldAccept ? 'ACCEPTED' : 'REJECTED'} (${t.note})`, () => {
          const nfaRes = simulateNfa(example.automaton, t.string);
          const dfaRes = simulateDfa(dfa, t.string);

          expect(nfaRes.accepted).toBe(t.shouldAccept);
          expect(dfaRes.accepted).toBe(t.shouldAccept);
          expect(nfaRes.accepted).toBe(dfaRes.accepted);

          // Verify step count corresponds to string length + 1 (step 0 + steps for each character)
          // (Unless trapped early, step count equals string length + 1)
          expect(nfaRes.steps.length).toBe(t.string.length + 1);
          expect(dfaRes.steps.length).toBe(t.string.length + 1);
        });
      }
    });
  }
});

import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  GitBranch,
  Cpu,
  Layers,
  CheckCircle2,
  FileText,
  Workflow,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export function AcademicDocs() {
  const [activeSection, setActiveSection] = useState<'formal' | 'algorithms' | 'jflap' | 'worked' | 'testing'>('formal');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-base font-bold">Academic Theory & Documentation</h2>
            <p className="text-xs text-slate-300">
              Theoretical Automata Theory foundations, formal 5-tuples, pseudocode, and evaluation deliverables.
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveSection('formal')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeSection === 'formal' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Formal 5-Tuples
          </button>
          <button
            onClick={() => setActiveSection('algorithms')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeSection === 'algorithms' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Algorithms & Pseudocode
          </button>
          <button
            onClick={() => setActiveSection('worked')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeSection === 'worked' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Worked Example
          </button>
          <button
            onClick={() => setActiveSection('jflap')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeSection === 'jflap' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            JFLAP Comparison
          </button>
          <button
            onClick={() => setActiveSection('testing')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeSection === 'testing' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Verification Suite
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 overflow-y-auto max-h-[750px] text-sm text-slate-700 leading-relaxed">
        {activeSection === 'formal' && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                1. Formal Automata Specifications
              </h3>
              <p className="mt-2 text-slate-600">
                In formal language and computability theory, both Nondeterministic Finite Automata with Epsilon transitions (ε-NFA) and Deterministic Finite Automata (DFA) are defined as 5-tuples.
              </p>
            </div>

            {/* ε-NFA Definition */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Non-deterministic Finite Automaton with Epsilon Transitions (ε-NFA)
              </h4>
              <p className="font-mono text-xs bg-white p-2.5 rounded border border-slate-200 mb-3 text-blue-900 font-bold">
                M_NFA = (Q, Σ, δ, q₀, F)
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
                <li><span className="font-mono font-bold">Q</span>: A finite, non-empty set of states.</li>
                <li><span className="font-mono font-bold">Σ</span>: A finite input alphabet (excluding the empty symbol ε).</li>
                <li>
                  <span className="font-mono font-bold">δ : Q × (Σ ∪ {'{ε}'}) → 2^Q</span>: The state transition function mapping a state and an input symbol (or ε) to a subset of states (power set).
                </li>
                <li><span className="font-mono font-bold">q₀ ∈ Q</span>: The initial (start) state.</li>
                <li><span className="font-mono font-bold">F ⊆ Q</span>: The set of final (accepting) states.</li>
              </ul>
            </div>

            {/* DFA Definition */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                Deterministic Finite Automaton (DFA)
              </h4>
              <p className="font-mono text-xs bg-white p-2.5 rounded border border-slate-200 mb-3 text-purple-900 font-bold">
                M_DFA = (Q', Σ, δ', q₀', F')
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
                <li><span className="font-mono font-bold">Q' ⊆ 2^Q</span>: A finite set of states, where each DFA state is a subset of original NFA states.</li>
                <li><span className="font-mono font-bold">Σ</span>: The identical finite input alphabet.</li>
                <li>
                  <span className="font-mono font-bold">δ' : Q' × Σ → Q'</span>: The deterministic transition function where for state S ⊆ Q and a ∈ Σ:
                  <div className="font-mono font-bold text-slate-900 mt-1 pl-4">
                    {"δ'(S, a) = ε-closure( ⋃_{q ∈ S} δ(q, a) )"}
                  </div>
                </li>
                <li><span className="font-mono font-bold">q₀' = ε-closure(q₀)</span>: The initial state of the DFA.</li>
                <li><span className="font-mono font-bold">F' = {'{ S ∈ Q\' | S ∩ F ≠ ∅ }'}</span>: DFA states containing at least one final state from the original ε-NFA.</li>
              </ul>
            </div>
          </div>
        )}

        {activeSection === 'algorithms' && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                2. Core Mathematical Algorithms
              </h3>
              <p className="mt-2 text-slate-600">
                Pseudocode implementations of the three foundational algorithms driving this simulator.
              </p>
            </div>

            {/* Epsilon Closure Pseudocode */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-900 text-sm mb-2">Algorithm 1: ε-Closure Computation</h4>
              <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
{`function EPSILON_CLOSURE(state_or_set, δ):
    stack = list(state_or_set)
    closure = set(state_or_set)

    while stack is not empty:
        current = stack.pop()
        for each transition (current, ε, target) in δ:
            if target not in closure:
                closure.add(target)
                stack.push(target)

    return sorted(closure)`}
              </pre>
            </div>

            {/* Subset Construction Pseudocode */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-900 text-sm mb-2">Algorithm 2: Subset Construction (NFA → DFA)</h4>
              <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
{`function SUBSET_CONSTRUCTION(NFA = (Q, Σ, δ, q0, F)):
    DFA_states = []
    DFA_transitions = []
    unmarked_states = []

    # Step 1: Initial DFA State
    initial_closure = EPSILON_CLOSURE(q0, δ)
    s0 = create_DFA_state(initial_closure)
    DFA_states.add(s0)
    unmarked_states.push(s0)

    # Step 2: Process all subsets
    while unmarked_states is not empty:
        T = unmarked_states.pop()

        for each symbol a in Σ:
            # 1. Move
            moved = { u | ∃ s ∈ T such that (s, a, u) ∈ δ }

            # 2. ε-closure of Move
            U = EPSILON_CLOSURE(moved, δ)

            if U is empty:
                target_state = get_or_create_dead_state()
            else if U already in DFA_states:
                target_state = find_state(U)
            else:
                target_state = create_DFA_state(U)
                DFA_states.add(target_state)
                unmarked_states.push(target_state)

            DFA_transitions.add( (T, a, target_state) )

    # Step 3: Identify Final States
    DFA_final_states = { S ∈ DFA_states | S ∩ F ≠ ∅ }

    return DFA(DFA_states, Σ, DFA_transitions, s0, DFA_final_states)`}
              </pre>
            </div>

            {/* Thompson's Construction Pseudocode */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-900 text-sm mb-2">Algorithm 3: Thompson's Construction (Regex → ε-NFA)</h4>
              <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
{`Thompson's Construction applies inductive syntax-directed translation:
• Symbol 'a':    (s0) --- a ---> (s1)
• Epsilon 'ε':   (s0) --- ε ---> (s1)
• Concat (A.B):  Connect final state of A to initial state of B via ε.
• Union (A|B):   New start with ε to A.start and B.start;
                 ε from A.final and B.final to new final.
• Star (A*):     New start with ε to A.start and new final;
                 ε from A.final to A.start and new final.`}
              </pre>
            </div>
          </div>
        )}

        {activeSection === 'worked' && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                3. Manually Validated Academic Example
              </h3>
              <p className="mt-2 text-slate-600">
                Consider the classic language <span className="font-mono font-bold">(a|b)*abb</span> over alphabet <span className="font-mono">{'{a, b}'}</span>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono flex flex-col gap-3">
              <h4 className="font-bold text-slate-900 font-sans text-sm">Step 1: Given ε-NFA States & Transitions</h4>
              <p>States: Q = {'{q0, q1, q2, q3}'}, Initial: q0, Final: {'{q3}'}</p>
              <div className="bg-white p-3 rounded border border-slate-200">
                δ(q0, a) = {'{q0, q1}'}<br />
                δ(q0, b) = {'{q0}'}<br />
                δ(q1, b) = {'{q2}'}<br />
                δ(q2, b) = {'{q3}'}
              </div>

              <h4 className="font-bold text-slate-900 font-sans text-sm mt-2">Step 2: Subset Construction Derivation</h4>
              <div className="bg-white p-3 rounded border border-slate-200 space-y-2">
                <div>
                  <span className="font-bold text-blue-700">1. Initial State D0 = ε-closure(q0) = {'{q0}'}</span><br />
                  • Move({'{q0}'}, a) = {'{q0, q1}'} → ε-closure = {'{q0, q1}'} = <span className="text-emerald-700 font-bold">D1 (New)</span><br />
                  • Move({'{q0}'}, b) = {'{q0}'} → ε-closure = {'{q0}'} = <span className="text-slate-700 font-bold">D0</span>
                </div>

                <div>
                  <span className="font-bold text-blue-700">2. Processing State D1 = {'{q0, q1}'}</span><br />
                  • Move({'{q0, q1}'}, a) = {'{q0, q1}'} → D1<br />
                  • Move({'{q0, q1}'}, b) = {'{q0, q2}'} → <span className="text-emerald-700 font-bold">D2 (New)</span>
                </div>

                <div>
                  <span className="font-bold text-blue-700">3. Processing State D2 = {'{q0, q2}'}</span><br />
                  • Move({'{q0, q2}'}, a) = {'{q0, q1}'} → D1<br />
                  • Move({'{q0, q2}'}, b) = {'{q0, q3}'} → <span className="text-purple-700 font-bold">D3 (New, Final since q3 ∈ D3)</span>
                </div>

                <div>
                  <span className="font-bold text-blue-700">4. Processing State D3 = {'{q0, q3}'}</span><br />
                  • Move({'{q0, q3}'}, a) = {'{q0, q1}'} → D1<br />
                  • Move({'{q0, q3}'}, b) = {'{q0}'} → D0
                </div>
              </div>

              <h4 className="font-bold text-slate-900 font-sans text-sm mt-2">Step 3: Verification</h4>
              <p className="font-sans text-slate-700">
                The resulting DFA has 4 states (D0, D1, D2, D3), where D3 is the sole accepting state. This exactly matches our simulator's automated derivation!
              </p>
            </div>
          </div>
        )}

        {activeSection === 'jflap' && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                4. Comparative Analysis with JFLAP
              </h3>
              <p className="mt-2 text-slate-600">
                JFLAP (Java Formal Languages and Automata Package) is a legacy educational software suite developed at Duke University. While pioneering, modern web-based simulators provide significant advancements.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3 border-b border-r border-slate-200">Evaluation Metric</th>
                    <th className="p-3 border-b border-r border-slate-200 text-slate-500">Legacy JFLAP</th>
                    <th className="p-3 border-b border-slate-200 text-blue-700">Our Modern Web Simulator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-200">Runtime Environment</td>
                    <td className="p-3 border-r border-slate-200 text-slate-600">Requires local Java Runtime Environment (JRE) install.</td>
                    <td className="p-3 text-emerald-700 font-semibold">100% In-Browser (zero install, mobile & desktop compatible).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-200">Side-by-Side Visualization</td>
                    <td className="p-3 border-r border-slate-200 text-slate-600">Separate modal windows; difficult to trace correspondences.</td>
                    <td className="p-3 text-emerald-700 font-semibold">Interactive side-by-side view with visual conversion bridge.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-200">Mathematical Step-by-Step Transparency</td>
                    <td className="p-3 border-r border-slate-200 text-slate-600">Table completion without granular intermediate calculations.</td>
                    <td className="p-3 text-emerald-700 font-semibold">Explicit Move() and ε-closure() formulas for each symbol.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-200">Dual String Simulation</td>
                    <td className="p-3 border-r border-slate-200 text-slate-600">Simulate on one automaton at a time.</td>
                    <td className="p-3 text-emerald-700 font-semibold">Synchronized dual simulation proving equivalence simultaneously.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-200">Direct Regex-to-NFA Generation</td>
                    <td className="p-3 border-r border-slate-200 text-slate-600">Limited operator support and rigid dialogs.</td>
                    <td className="p-3 text-emerald-700 font-semibold">Real-time regex validation with Thompson's construction.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'testing' && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                5. Automated Verification & Test Suite
              </h3>
              <p className="mt-2 text-slate-600">
                To fulfill academic requirements of mathematical rigor, the project includes 49 automated unit tests verifying:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ε-Closure Cycle Resistance
                </span>
                <p className="text-slate-600">
                  Tests cyclical ε-transitions (q0 → q1 → q2 → q0) ensuring loop termination, set deduplication, and complete reachability.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dead / Trap State Completeness
                </span>
                <p className="text-slate-600">
                  Tests automata with missing transitions to verify that the dead state ∅ is generated with complete self-loops for total transition functions.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Empty String (ε) Acceptance
                </span>
                <p className="text-slate-600">
                  Verifies that languages containing the empty string correctly produce initial DFA states designated as final states.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-Input Equivalence Invariant
                </span>
                <p className="text-slate-600">
                  Runs identical string suites through both ε-NFA and DFA, enforcing identical acceptance decisions across all alphabet combinations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

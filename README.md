# ε-NFA to DFA Conversion Simulator

An interactive, web-based educational simulator inspired by JFLAP for **Automata Theory & Computability** courses.

Developed with React, TypeScript, Vite, React Flow (`@xyflow/react`), and Tailwind CSS. Runs 100% client-side in the browser with zero backend dependencies.

---

## 🚀 Key Capabilities & Features

1. **Option A: Regular Expression Input (Thompson's Construction)**
   - Enter regular expressions such as `(a|b)*abb`, `(0|1)*01`, `a*b*`.
   - Supports:
     - `|` (Union)
     - `*` (Kleene Star)
     - `()` (Grouping)
     - Implicit Concatenation (`ab` $\rightarrow$ `a.b`)
     - `ε` (Epsilon transition)
     - `∅` (Empty language)
   - Real-time syntax validation.
   - Automatically builds an equivalent ε-NFA using genuine Thompson's Construction (not hardcoded).
   - Generates layered DAG layouts and transition tables.
   - Generated automata are fully editable in the graphical canvas before conversion.

2. **Option B: Interactive Graphical ε-NFA Canvas (JFLAP Inspired)**
   - Add, move, and delete states with unique state IDs (`q0`, `q1`, `q2`, ...).
   - Connect states with transitions, supporting multiple transitions and self-loops.
   - Support for epsilon transitions (`ε`).
   - Designate initial state (indicated with $\rightarrow$ and Start badge).
   - Designate one or multiple final/accepting states (indicated with double concentric circles and $*$).
   - Real-time validation checking for missing initial states, unreachable states, disconnected transitions, and duplicate IDs.

3. **Rigorous Subset Construction & ε-Closure Engine**
   - **Step 1: ε-Closure Computation**: Calculates reachable states through zero or more epsilon transitions with cycle detection.
   - **Step 2: Subset Construction**:
     - Initial DFA state: $S_0 = \text{ε-closure}(q_0)$.
     - Transitions: $\delta'(S, a) = \text{ε-closure}(\text{Move}(S, a))$.
     - Discovery of new DFA states until the worklist is empty.
     - **Dead/Trap State Handling**: Automatically introduces dead state $\emptyset$ with self-loops on all alphabet symbols when empty subsets are reached.
   - **Step 3: Final State Identification**: DFA state $S$ is accepting if $S \cap F_{NFA} \neq \emptyset$.
   - **Step 4: Canonical Subset Naming**: Displays both DFA IDs (`D0, D1, ...`) and exact subset notation (`{q0, q1}`, `{q1, q2}`).

4. **Side-by-Side Visual Comparison & Transition Tables**
   - Left: Original ε-NFA diagram and transition table.
   - Center: Animated Subset Construction bridge.
   - Right: Generated DFA diagram and transition table.
   - Synchronized transition tables with $\rightarrow$ initial, $*$ final, and $\emptyset$ for empty transitions.

5. **Step-by-Step Mathematical Derivation Panel**
   - Step forward / backward, jump to start/end, and auto-play at variable speeds ($0.5\times, 1.0\times, 2.0\times$).
   - Shows granular mathematical formulas for:
     $$\text{Move}(S, a) = \{ \dots \}$$
     $$\text{ε-closure}(\text{Move}(S, a)) = \{ \dots \}$$
     $$\delta'(S, a) = S'$$
   - Highlights whether a new DFA state was discovered, dead state was generated, or marked final.
   - "Show All Steps" mode for exam review and report copying.

6. **Dual Synchronized String Simulation**
   - Interactive tape visualization with current symbol cursor.
   - Simulates string on the ε-NFA (tracking the active state set and traversed epsilon hops).
   - Simultaneously simulates string on the DFA (tracking single deterministic state transitions).
   - Confirms language equivalence: $\text{Result}_{NFA} = \text{Result}_{DFA}$ (ACCEPTED / REJECTED).

7. **Pre-configured Test Bank & Examples**
   - Strings ending with `abb` (`(a|b)*abb`)
   - Epsilon chain ($q_0 \xrightarrow{\varepsilon} q_1 \xrightarrow{\varepsilon} q_2 \xrightarrow{a} q_3$)
   - Cyclic epsilon transitions ($q_0 \xrightarrow{\varepsilon} q_1 \xrightarrow{\varepsilon} q_2 \xrightarrow{\varepsilon} q_0$)
   - Initial state is accepting (accepts $\varepsilon$, e.g. $a^*b^*$)
   - Dead / trap state generation
   - Multiple final states ($a^+ \mid b^+$)
   - Binary strings ending in `01` (`(0|1)*01`)

8. **Academic Deliverables & Documentation**
   - Formal 5-tuple definitions for ε-NFA and DFA:
     $$M = (Q, \Sigma, \delta, q_0, F)$$
   - Pseudocode for all algorithms.
   - Comparison matrix with JFLAP.
   - Worked textbook example derivation.
   - JSON Export and Import for saving and grading automata.

---

## 🛠️ Project Structure

```text
Automation/
├── src/
│   ├── types/
│   │   └── automaton.ts               # Core data structures (State, Transition, Automaton, Steps)
│   ├── algorithms/
│   │   ├── regexParser.ts             # Shunting-yard parser, explicit concat insertion, validation
│   │   ├── thompsonConstruction.ts    # Thompson's construction and layered DAG coordinate layout
│   │   ├── epsilonClosure.ts          # BFS ε-closure with cycle handling and step logs
│   │   ├── subsetConstruction.ts      # Power-set subset construction, dead state handling
│   │   ├── nfaSimulation.ts           # Non-deterministic simulation with multi-state tracking
│   │   └── dfaSimulation.ts           # Deterministic single-state simulation
│   ├── utils/
│   │   ├── automatonValidator.ts      # Formal automata consistency checker
│   │   └── automatonConverter.ts      # Maps Automaton to React Flow nodes/edges
│   ├── examples/
│   │   └── exampleAutomata.ts         # 7 academic test bank automata with accept/reject suites
│   ├── components/
│   │   ├── AutomatonDiagram/          # CustomStateNode, CustomEdge, React Flow canvas
│   │   ├── AutomatonEditor/           # Interactive graphical editor with tools
│   │   ├── TransitionTable/           # LaTeX-style transition table with CSV export
│   │   ├── RegexInput/                # Regular expression input with quick symbol pads
│   │   ├── ConversionPanel/           # Side-by-side layout & conversion stats
│   │   ├── StepViewer/                # Step-by-step mathematical derivation stepper
│   │   ├── SimulationPanel/           # Synchronized dual tape runner
│   │   └── AcademicDocs/              # 5-tuples, pseudocode, JFLAP comparison, test report
│   ├── tests/
│   │   ├── epsilonClosure.test.ts     # Epsilon-closure unit tests
│   │   ├── regexParser.test.ts        # Regex parsing & Thompson construction tests
│   │   ├── subsetConstruction.test.ts # NFA to DFA conversion equivalence tests
│   │   └── simulation.test.ts         # 35+ test suite across all example automata
│   ├── App.tsx                        # Main application orchestrator
│   ├── main.tsx                       # React root
│   └── index.css                      # Tailwind & diagram styles
├── package.json
└── vite.config.ts
```

---

## 🧪 Automated Unit Tests (49 Passing Tests)

Run the test suite with:

```bash
npm test
```

Test coverage:
- **`epsilonClosure.test.ts`**: Single state, multi-hop chains, cyclical ε-transitions, empty input sets.
- **`regexParser.test.ts`**: Parentheses validation, operator precedence, implicit concatenation, Thompson construction.
- **`subsetConstruction.test.ts`**: Textbook `(a|b)*abb`, dead/trap state creation, initial state is final, binary strings.
- **`simulation.test.ts`**: 35 automated string tests verifying identical acceptance decisions between ε-NFA and DFA on both positive and negative strings, as well as the empty string $\varepsilon$.

---

## 💻 Running Locally

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

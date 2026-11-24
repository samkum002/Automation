export const EPSILON = 'ε';
export const EPSILON_ALTS = ['ε', 'E', 'e', 'λ', 'lambda', 'eps'];

export function isEpsilon(symbol: string): boolean {
  return symbol === EPSILON || EPSILON_ALTS.includes(symbol);
}

export interface State {
  id: string;
  label?: string;
  isInitial: boolean;
  isFinal: boolean;
  x?: number;
  y?: number;
  nfaSubset?: string[]; // For DFA states, the set of NFA states it represents
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  symbol: string; // single symbol or EPSILON
}

export interface Automaton {
  id?: string;
  name?: string;
  states: State[];
  transitions: Transition[];
  alphabet: string[]; // Set of input symbols excluding EPSILON
  initialStateId: string;
  finalStateIds: string[];
}

export interface EpsilonClosureStep {
  stateId: string;
  stateLabel?: string;
  closure: string[];
  explanation: string;
}

export interface SubsetConstructionStep {
  stepNumber: number;
  type: 'INIT' | 'PROCESS_SYMBOL' | 'DISCOVER_STATE' | 'COMPLETE';
  sourceDfaStateId: string;
  sourceDfaSubset: string[];
  symbol?: string;
  movedStates?: string[]; // Move(S, a) = { ... }
  closureOfMove?: string[]; // ε-closure(Move(S, a))
  targetDfaStateId?: string;
  targetDfaSubset?: string[];
  isNewDfaState?: boolean;
  isDeadState?: boolean;
  explanation: string;
  currentDfaStates: { id: string; subset: string[]; isFinal: boolean; isInitial: boolean }[];
  currentDfaTransitions: { from: string; to: string; symbol: string }[];
}

export interface ConversionResult {
  dfa: Automaton;
  epsilonClosures: Record<string, string[]>;
  epsilonClosureSteps: EpsilonClosureStep[];
  steps: SubsetConstructionStep[];
  subsetMap: Record<string, string[]>; // dfaStateId -> sorted array of nfaStateIds
  deadStateId?: string;
  stats: {
    nfaStateCount: number;
    dfaStateCount: number;
    nfaTransitionCount: number;
    dfaTransitionCount: number;
  };
}

export interface SimulationStep {
  stepIndex: number;
  symbolRead: string; // empty string for initial state
  currentStates: string[];
  activeTransitions: { from: string; to: string; symbol: string }[];
  explanation: string;
}

export interface SimulationResult {
  inputString: string;
  accepted: boolean;
  steps: SimulationStep[];
  finalStatesReached: string[];
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

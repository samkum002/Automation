import { EPSILON, isEpsilon } from '../types/automaton';

/**
 * Precedence of regex operators:
 * '*' (Kleene star) - Precedence 3 (Highest)
 * '.' (Explicit concatenation) - Precedence 2
 * '|' (Union) - Precedence 1 (Lowest)
 */
const PRECEDENCE: Record<string, number> = {
  '*': 3,
  '+': 3, // Optional support for 1 or more: a+
  '?': 3, // Optional support for 0 or 1: a?
  '.': 2,
  '|': 1,
};

export interface RegexToken {
  type: 'LITERAL' | 'OPERATOR' | 'LPAREN' | 'RPAREN';
  value: string;
}

/**
 * Validates regular expression syntax and matching parentheses.
 */
export function validateRegex(regex: string): { isValid: boolean; error?: string } {
  const trimmed = regex.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Regular expression cannot be empty.' };
  }

  // Check matching parentheses
  let parenDepth = 0;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '(') parenDepth++;
    if (ch === ')') parenDepth--;
    if (parenDepth < 0) {
      return { isValid: false, error: `Unmatched closing parenthesis at position ${i + 1}.` };
    }
  }
  if (parenDepth !== 0) {
    return { isValid: false, error: 'Unclosed parenthesis in regular expression.' };
  }

  // Check invalid operator sequences like '||', '^*', '(*', etc.
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    const next = trimmed[i + 1];

    if (ch === '|' && (next === '|' || next === '*' || next === ')')) {
      return { isValid: false, error: `Invalid operator sequence after '|' at position ${i + 1}.` };
    }
    if ((ch === '*' || ch === '+' || ch === '?') && (next === '*' || next === '+' || next === '?')) {
      return { isValid: false, error: `Consecutive star/quantifier operators at position ${i + 1}.` };
    }
    if (ch === '(' && (next === '*' || next === '+' || next === '?' || next === '|')) {
      return { isValid: false, error: `Quantifier or union immediately following '(' at position ${i + 1}.` };
    }
  }

  if (trimmed.startsWith('|') || trimmed.endsWith('|')) {
    return { isValid: false, error: "Regular expression cannot begin or end with '|'." };
  }
  if (trimmed.startsWith('*') || trimmed.startsWith('+') || trimmed.startsWith('?')) {
    return { isValid: false, error: 'Quantifier cannot appear at the beginning of an expression.' };
  }

  return { isValid: true };
}

/**
 * Normalizes input: handles alternate epsilon characters and strips excess whitespace.
 */
export function normalizeRegex(regex: string): string {
  return regex
    .trim()
    .replace(/\s+/g, '')
    .replace(/\\e/g, EPSILON)
    .replace(/\\eps/g, EPSILON);
}

/**
 * Inserts explicit concatenation operator '.' where concatenation is implicit.
 * e.g., 'ab' -> 'a.b', '(a|b)c' -> '(a|b).c', 'a*b' -> 'a*.b'
 */
export function insertExplicitConcat(regex: string): string {
  let result = '';
  const str = normalizeRegex(regex);

  const isLiteral = (ch: string) =>
    ch !== '(' && ch !== ')' && ch !== '|' && ch !== '*' && ch !== '+' && ch !== '?';

  for (let i = 0; i < str.length; i++) {
    const c1 = str[i];
    result += c1;

    if (i + 1 < str.length) {
      const c2 = str[i + 1];

      // Conditions where concatenation is inserted between c1 and c2:
      // 1. literal and literal: 'ab' -> 'a.b'
      // 2. literal and '(': 'a(' -> 'a.('
      // 3. ')' and literal: ')a' -> ').a'
      // 4. '*' and literal: 'a*b' -> 'a*.b'
      // 5. '*' and '(': 'a*(' -> 'a*.('
      // 6. ')' and '(': ')(' -> ').('
      const c1CanEnd = isLiteral(c1) || c1 === ')' || c1 === '*' || c1 === '+' || c1 === '?';
      const c2CanBegin = isLiteral(c2) || c2 === '(';

      if (c1CanEnd && c2CanBegin) {
        result += '.';
      }
    }
  }

  return result;
}

/**
 * Converts infix regular expression with explicit concatenation to postfix (Reverse Polish Notation)
 * using the Shunting-Yard algorithm.
 */
export function infixToPostfix(infixWithConcat: string): string[] {
  const output: string[] = [];
  const operatorStack: string[] = [];

  const isOperator = (ch: string) => ch in PRECEDENCE;

  for (let i = 0; i < infixWithConcat.length; i++) {
    const ch = infixWithConcat[i];

    if (ch === '(') {
      operatorStack.push(ch);
    } else if (ch === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        output.push(operatorStack.pop()!);
      }
      operatorStack.pop(); // discard '('
    } else if (isOperator(ch)) {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== '(' &&
        PRECEDENCE[operatorStack[operatorStack.length - 1]] >= PRECEDENCE[ch]
      ) {
        output.push(operatorStack.pop()!);
      }
      operatorStack.push(ch);
    } else {
      // Literal character / operand
      output.push(ch);
    }
  }

  while (operatorStack.length > 0) {
    output.push(operatorStack.pop()!);
  }

  return output;
}

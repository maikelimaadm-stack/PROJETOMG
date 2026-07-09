import { ExpressionError } from './errors.js';

/**
 * Safe expression evaluator (M13) — recursive-descent tokenizer/parser/AST
 * walker. No `eval`, no `new Function`, no dynamic code execution. Read-only:
 * evaluates against a plain `bindings` object, never Prisma/MMM/backend.
 */

const MAX_EXPRESSION_LENGTH = 500;
const MAX_AST_DEPTH = 32;

/** Identifier path segments that must never resolve — prevents prototype/global escape. */
const BLOCKED_IDENTIFIERS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  'globalThis',
  'global',
  'window',
  'document',
  'process',
  'Function',
  'require',
  'module',
  'exports',
  'eval',
]);

/** @type {Record<string, (...args: any[]) => unknown>} */
const ALLOWED_FUNCTIONS = Object.freeze({
  min: (...args) => Math.min(...args),
  max: (...args) => Math.max(...args),
  round: (value, digits = 0) => {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  },
  abs: (value) => Math.abs(value),
  coalesce: (...args) => args.find((value) => value !== null && value !== undefined),
});

const TOKEN_PATTERNS = [
  { type: 'WHITESPACE', regex: /^\s+/ },
  { type: 'NUMBER', regex: /^\d+(\.\d+)?/ },
  { type: 'STRING', regex: /^'(?:[^'\\]|\\.)*'|^"(?:[^"\\]|\\.)*"/ },
  { type: 'BOOLEAN', regex: /^(true|false)\b/ },
  { type: 'NULL', regex: /^null\b/ },
  { type: 'IDENT', regex: /^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*/ },
  { type: 'OP', regex: /^(==|!=|>=|<=|&&|\|\||[+\-*/!><(),])/ },
];

/** @param {string} source */
function tokenize(source) {
  const tokens = [];
  let rest = source;
  while (rest.length > 0) {
    let matched = false;
    for (const { type, regex } of TOKEN_PATTERNS) {
      const match = regex.exec(rest);
      if (match) {
        matched = true;
        if (type !== 'WHITESPACE') tokens.push({ type, value: match[0] });
        rest = rest.slice(match[0].length);
        break;
      }
    }
    if (!matched) {
      throw new ExpressionError('MAK-L3-EXPRESSION-002', `Unrecognized token near: "${rest.slice(0, 20)}"`);
    }
  }
  tokens.push({ type: 'EOF', value: '' });
  return tokens;
}

class Parser {
  /**
   * @param {{type: string, value: string}[]} tokens
   * @param {number} maxDepth
   */
  constructor(tokens, maxDepth) {
    this.tokens = tokens;
    this.pos = 0;
    this.maxDepth = maxDepth;
  }

  peek() {
    return this.tokens[this.pos];
  }

  next() {
    return this.tokens[this.pos++];
  }

  /** @param {string} value */
  expect(value) {
    const token = this.peek();
    if (token.value !== value) {
      throw new ExpressionError('MAK-L3-EXPRESSION-002', `Expected "${value}" but found "${token.value || 'EOF'}"`);
    }
    return this.next();
  }

  /** @param {number} depth */
  _checkDepth(depth) {
    if (depth > this.maxDepth) {
      throw new ExpressionError('MAK-L3-EXPRESSION-005', `Expression exceeds maximum depth (${this.maxDepth})`);
    }
  }

  parseExpression(depth = 0) {
    return this.parseOr(depth);
  }

  parseOr(depth) {
    this._checkDepth(depth);
    let node = this.parseAnd(depth + 1);
    while (this.peek().value === '||') {
      this.next();
      node = { type: 'Binary', op: '||', left: node, right: this.parseAnd(depth + 1) };
    }
    return node;
  }

  parseAnd(depth) {
    this._checkDepth(depth);
    let node = this.parseEquality(depth + 1);
    while (this.peek().value === '&&') {
      this.next();
      node = { type: 'Binary', op: '&&', left: node, right: this.parseEquality(depth + 1) };
    }
    return node;
  }

  parseEquality(depth) {
    this._checkDepth(depth);
    let node = this.parseComparison(depth + 1);
    while (this.peek().value === '==' || this.peek().value === '!=') {
      const op = this.next().value;
      node = { type: 'Binary', op, left: node, right: this.parseComparison(depth + 1) };
    }
    return node;
  }

  parseComparison(depth) {
    this._checkDepth(depth);
    let node = this.parseAdditive(depth + 1);
    while (['>', '>=', '<', '<='].includes(this.peek().value)) {
      const op = this.next().value;
      node = { type: 'Binary', op, left: node, right: this.parseAdditive(depth + 1) };
    }
    return node;
  }

  parseAdditive(depth) {
    this._checkDepth(depth);
    let node = this.parseMultiplicative(depth + 1);
    while (this.peek().value === '+' || this.peek().value === '-') {
      const op = this.next().value;
      node = { type: 'Binary', op, left: node, right: this.parseMultiplicative(depth + 1) };
    }
    return node;
  }

  parseMultiplicative(depth) {
    this._checkDepth(depth);
    let node = this.parseUnary(depth + 1);
    while (this.peek().value === '*' || this.peek().value === '/') {
      const op = this.next().value;
      node = { type: 'Binary', op, left: node, right: this.parseUnary(depth + 1) };
    }
    return node;
  }

  parseUnary(depth) {
    this._checkDepth(depth);
    if (this.peek().value === '!' || this.peek().value === '-') {
      const op = this.next().value;
      return { type: 'Unary', op, arg: this.parseUnary(depth + 1) };
    }
    return this.parsePrimary(depth + 1);
  }

  parsePrimary(depth) {
    this._checkDepth(depth);
    const token = this.peek();

    if (token.type === 'NUMBER') {
      this.next();
      return { type: 'Literal', value: Number(token.value) };
    }
    if (token.type === 'STRING') {
      this.next();
      return { type: 'Literal', value: token.value.slice(1, -1) };
    }
    if (token.type === 'BOOLEAN') {
      this.next();
      return { type: 'Literal', value: token.value === 'true' };
    }
    if (token.type === 'NULL') {
      this.next();
      return { type: 'Literal', value: null };
    }
    if (token.value === '(') {
      this.next();
      const node = this.parseExpression(depth + 1);
      this.expect(')');
      return node;
    }
    if (token.type === 'IDENT') {
      this.next();
      if (this.peek().value === '(') {
        this.next();
        const args = [];
        if (this.peek().value !== ')') {
          args.push(this.parseExpression(depth + 1));
          while (this.peek().value === ',') {
            this.next();
            args.push(this.parseExpression(depth + 1));
          }
        }
        this.expect(')');
        return { type: 'Call', name: token.value, args };
      }

      const path = token.value.split('.');
      for (const segment of path) {
        if (BLOCKED_IDENTIFIERS.has(segment)) {
          throw new ExpressionError('MAK-L3-EXPRESSION-003', `Blocked identifier segment: ${segment}`);
        }
      }
      return { type: 'Identifier', path };
    }

    throw new ExpressionError('MAK-L3-EXPRESSION-002', `Unexpected token: "${token.value || 'EOF'}"`);
  }
}

/**
 * @param {{type: string, [key: string]: unknown}} node
 * @param {Record<string, unknown>} bindings
 * @returns {unknown}
 */
function evaluateNode(node, bindings) {
  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'Identifier':
      return resolvePath(bindings, /** @type {string[]} */ (node.path));
    case 'Unary': {
      const value = evaluateNode(/** @type {any} */ (node.arg), bindings);
      if (node.op === '!') return !value;
      return -value;
    }
    case 'Binary': {
      const left = evaluateNode(/** @type {any} */ (node.left), bindings);
      if (node.op === '&&') return left && evaluateNode(/** @type {any} */ (node.right), bindings);
      if (node.op === '||') return left || evaluateNode(/** @type {any} */ (node.right), bindings);

      const right = evaluateNode(/** @type {any} */ (node.right), bindings);
      switch (node.op) {
        case '+':
          return /** @type {any} */ (left) + /** @type {any} */ (right);
        case '-':
          return /** @type {any} */ (left) - /** @type {any} */ (right);
        case '*':
          return /** @type {any} */ (left) * /** @type {any} */ (right);
        case '/':
          return /** @type {any} */ (left) / /** @type {any} */ (right);
        case '==':
          return left === right;
        case '!=':
          return left !== right;
        case '>':
          return /** @type {any} */ (left) > /** @type {any} */ (right);
        case '>=':
          return /** @type {any} */ (left) >= /** @type {any} */ (right);
        case '<':
          return /** @type {any} */ (left) < /** @type {any} */ (right);
        case '<=':
          return /** @type {any} */ (left) <= /** @type {any} */ (right);
        default:
          throw new ExpressionError('MAK-L3-EXPRESSION-002', `Unknown operator: ${node.op}`);
      }
    }
    case 'Call': {
      const fn = ALLOWED_FUNCTIONS[/** @type {string} */ (node.name)];
      if (!fn) {
        throw new ExpressionError('MAK-L3-EXPRESSION-004', `Unknown function: ${node.name}`);
      }
      const args = /** @type {any[]} */ (node.args).map((arg) => evaluateNode(arg, bindings));
      return fn(...args);
    }
    default:
      throw new ExpressionError('MAK-L3-EXPRESSION-002', `Unknown AST node type: ${node.type}`);
  }
}

/**
 * @param {Record<string, unknown>} bindings
 * @param {string[]} path
 */
function resolvePath(bindings, path) {
  let current = bindings;
  for (const segment of path) {
    if (current === null || current === undefined || typeof current !== 'object') {
      throw new ExpressionError('MAK-L3-EXPRESSION-003', `Unknown identifier: ${path.join('.')}`);
    }
    if (!Object.prototype.hasOwnProperty.call(current, segment)) {
      throw new ExpressionError('MAK-L3-EXPRESSION-003', `Unknown identifier: ${path.join('.')}`);
    }
    current = /** @type {Record<string, unknown>} */ (current)[segment];
  }
  return current;
}

/**
 * @implements {import('../../types/expression.js').IExpressionEngine}
 */
export class ExpressionEngine {
  /**
   * @param {Object} [options]
   * @param {number} [options.maxExpressionLength]
   * @param {number} [options.maxDepth]
   */
  constructor(options = {}) {
    const maxLength = options.maxExpressionLength ?? MAX_EXPRESSION_LENGTH;
    const maxDepth = options.maxDepth ?? MAX_AST_DEPTH;
    if (!Number.isInteger(maxLength) || maxLength <= 0) {
      throw new ExpressionError('MAK-L3-EXPRESSION-001', 'maxExpressionLength must be a positive integer');
    }
    if (!Number.isInteger(maxDepth) || maxDepth <= 0) {
      throw new ExpressionError('MAK-L3-EXPRESSION-001', 'maxDepth must be a positive integer');
    }
    this._maxLength = maxLength;
    this._maxDepth = maxDepth;
  }

  /**
   * @param {string} expr
   * @param {Record<string, unknown>} [bindings]
   * @returns {unknown}
   */
  evaluate(expr, bindings = {}) {
    const ast = this._parse(expr);
    return evaluateNode(ast, bindings);
  }

  /**
   * @param {string} expr
   * @returns {import('../../types/expression.js').ValidationResult}
   */
  validate(expr) {
    try {
      this._parse(expr);
      return { valid: true, errors: [] };
    } catch (err) {
      return { valid: false, errors: [err instanceof Error ? err.message : String(err)] };
    }
  }

  /** @param {string} expr */
  _parse(expr) {
    if (typeof expr !== 'string' || expr.length === 0) {
      throw new ExpressionError('MAK-L3-EXPRESSION-002', 'Expression must be a non-empty string');
    }
    if (expr.length > this._maxLength) {
      throw new ExpressionError('MAK-L3-EXPRESSION-005', `Expression exceeds maximum length (${this._maxLength})`);
    }

    const tokens = tokenize(expr);
    const parser = new Parser(tokens, this._maxDepth);
    const ast = parser.parseExpression(0);
    if (parser.peek().type !== 'EOF') {
      throw new ExpressionError('MAK-L3-EXPRESSION-002', `Unexpected trailing tokens near: "${parser.peek().value}"`);
    }
    return ast;
  }
}

/**
 * @param {Object} [options]
 * @returns {ExpressionEngine}
 */
export function createExpressionEngine(options) {
  return new ExpressionEngine(options);
}

export { ExpressionError };

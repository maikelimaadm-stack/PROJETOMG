/**
 * Expression Parser — official single parser (Program 2.3.2)
 */
import {
  createLiteralNode,
  createVariableNode,
  createPropertyAccessNode,
  createUnaryNode,
  createBinaryNode,
  createNullCoalesceNode,
  createCallNode,
  createExpressionAstRoot,
} from "../ast/expressionAst.js";

const KEYWORDS = new Set(["true", "false", "null"]);

function tokenize(source) {
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let value = "";
      i += 1;
      while (i < source.length && source[i] !== quote) {
        value += source[i];
        i += 1;
      }
      i += 1;
      tokens.push({ type: "string", value });
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(source[i + 1]))) {
      let num = "";
      while (i < source.length && /[0-9.]/.test(source[i])) {
        num += source[i];
        i += 1;
      }
      tokens.push({ type: "number", value: Number(num) });
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let id = "";
      while (i < source.length && /[a-zA-Z0-9_]/.test(source[i])) {
        id += source[i];
        i += 1;
      }
      if (KEYWORDS.has(id)) tokens.push({ type: "keyword", value: id });
      else tokens.push({ type: "identifier", value: id });
      continue;
    }
    const two = source.slice(i, i + 2);
    const ops = ["??", "==", "!=", "<=", ">=", "&&", "||"];
    if (ops.includes(two)) {
      tokens.push({ type: "operator", value: two });
      i += 2;
      continue;
    }
    if (["+", "-", "*", "/", "%", "<", ">", "!", "(", ")", ",", ".", "[", "]"].includes(ch)) {
      tokens.push({ type: "punct", value: ch });
      i += 1;
      continue;
    }
    throw new Error(`Unexpected character '${ch}' at position ${i}`);
  }
  tokens.push({ type: "eof", value: null });
  return tokens;
}

export function createExpressionParser() {
  let tokens = [];
  let pos = 0;

  const peek = () => tokens[pos];
  const advance = () => tokens[pos++];

  const parsePrimary = () => {
    const t = peek();
    if (t.type === "number") {
      advance();
      return createLiteralNode(t.value, "number");
    }
    if (t.type === "string") {
      advance();
      return createLiteralNode(t.value, "string");
    }
    if (t.type === "keyword" && t.value === "true") {
      advance();
      return createLiteralNode(true, "boolean");
    }
    if (t.type === "keyword" && t.value === "false") {
      advance();
      return createLiteralNode(false, "boolean");
    }
    if (t.type === "keyword" && t.value === "null") {
      advance();
      return createLiteralNode(null, "null");
    }
    if (t.type === "punct" && t.value === "(") {
      advance();
      const expr = parseNullCoalesce();
      if (peek().type !== "punct" || peek().value !== ")") throw new Error("Expected ')'");
      advance();
      return expr;
    }
    if (t.type === "identifier") {
      const name = t.value;
      advance();
      let node = createVariableNode(name);
      while (peek().type === "punct" && peek().value === ".") {
        advance();
        const prop = peek();
        if (prop.type !== "identifier") throw new Error("Expected property name");
        advance();
        node = createPropertyAccessNode(node, prop.value);
      }
      if (peek().type === "punct" && peek().value === "(") {
        advance();
        const args = [];
        if (!(peek().type === "punct" && peek().value === ")")) {
          while (true) {
            args.push(parseNullCoalesce());
            if (peek().type === "punct" && peek().value === ",") {
              advance();
              continue;
            }
            break;
          }
        }
        if (peek().type !== "punct" || peek().value !== ")") throw new Error("Expected ')'");
        advance();
        return createCallNode(name, args);
      }
      return node;
    }
    throw new Error(`Unexpected token at ${pos}`);
  };

  const isOp = (...values) => {
    const t = peek();
    return (t.type === "operator" || t.type === "punct") && values.includes(t.value);
  };

  const parseUnary = () => {
    if (isOp("!", "-")) {
      const op = advance().value;
      return createUnaryNode(op, parseUnary());
    }
    return parsePrimary();
  };

  const parseMultiplicative = () => {
    let node = parseUnary();
    while (isOp("*", "/", "%")) {
      const op = advance().value;
      node = createBinaryNode(op, node, parseUnary());
    }
    return node;
  };

  const parseAdditive = () => {
    let node = parseMultiplicative();
    while (isOp("+", "-")) {
      const op = advance().value;
      node = createBinaryNode(op, node, parseMultiplicative());
    }
    return node;
  };

  const parseComparison = () => {
    let node = parseAdditive();
    while (isOp("==", "!=", "<", ">", "<=", ">=")) {
      const op = advance().value;
      node = createBinaryNode(op, node, parseAdditive());
    }
    return node;
  };

  const parseLogical = () => {
    let node = parseComparison();
    while (isOp("&&", "||")) {
      const op = advance().value;
      node = createBinaryNode(op, node, parseComparison());
    }
    return node;
  };

  const parseNullCoalesce = () => {
    let node = parseLogical();
    while (isOp("??")) {
      advance();
      node = createNullCoalesceNode(node, parseLogical());
    }
    return node;
  };

  return Object.freeze({
    parse(source, partial = {}) {
      const trimmed = String(source ?? "").trim();
      if (!trimmed) {
        return createExpressionAstRoot(createLiteralNode(null, "null"), partial);
      }
      tokens = tokenize(trimmed);
      pos = 0;
      const expression = parseNullCoalesce();
      if (peek().type !== "eof") throw new Error("Unexpected tokens after expression");
      return createExpressionAstRoot(expression, partial);
    },
    tokenize,
  });
}

export default createExpressionParser;

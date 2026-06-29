/**
 * Studio Expression Engine — official facade (Program 2.3.2)
 */
import {
  STUDIO_EXPRESSION_VERSION,
  OFFICIAL_EXPRESSION_ENGINES,
} from "./contracts/expressionContracts.js";
import { createExpressionDocument, validateExpressionDocument } from "./document/expressionDocument.js";
import { validateExpressionAst } from "./ast/expressionAst.js";
import { createExpressionParser } from "./parser/expressionParser.js";
import { createExpressionCompiler } from "./compiler/expressionCompiler.js";
import { createExpressionValidator } from "./validator/expressionValidator.js";
import { createExpressionTypeSystem } from "./types/expressionTypeSystem.js";
import { createFunctionCatalog } from "./catalog/functionCatalog.js";
import { createExpressionContext } from "./context/expressionContext.js";
import { createExpressionDependencyGraph } from "./dependency/expressionDependencyGraph.js";
import { createExpressionRefactoring } from "./refactoring/expressionRefactoring.js";
import { createExpressionEvaluationBridge } from "./runtime/expressionEvaluationBridge.js";

export function createExpressionEngine(options = {}) {
  const functionCatalog = options.functionCatalog ?? createFunctionCatalog();
  const typeSystem = createExpressionTypeSystem(functionCatalog);
  const parser = createExpressionParser();
  const compiler = createExpressionCompiler();
  const validator = createExpressionValidator(typeSystem, functionCatalog);
  const dependencyGraph = createExpressionDependencyGraph();
  const refactoring = createExpressionRefactoring();
  const evaluationBridge = createExpressionEvaluationBridge({ functionCatalog });

  return Object.freeze({
    version: STUDIO_EXPRESSION_VERSION,
    engines: OFFICIAL_EXPRESSION_ENGINES,
    functionCatalog,
    typeSystem,
    parser,
    compiler,
    validator,
    dependencyGraph,
    refactoring,
    evaluationBridge,
    createDocument: createExpressionDocument,
    validateDocument: validateExpressionDocument,
    parse(source, partial) {
      return parser.parse(source, partial);
    },
    validate(ast, context) {
      const struct = validateExpressionAst(ast);
      if (!struct.valid) {
        return { valid: false, ok: false, errors: struct.errors.map((m) => ({ severity: "error", message: m })), issues: [] };
      }
      return validator.validate(ast, context);
    },
    compile(ast) {
      return compiler.compile(ast);
    },
    createContext: createExpressionContext,
    extractDependencies(ast, ownerId) {
      return dependencyGraph.extractFromAst(ast, ownerId);
    },
    renameVariable(ast, from, to) {
      return refactoring.renameVariable(ast, from, to);
    },
    execute(ast, context) {
      return evaluationBridge.evaluateSync(ast, context);
    },
    evaluate(ast, context, partial) {
      return evaluationBridge.evaluateExpression(ast, context, partial);
    },
    inferType(ast, context) {
      return typeSystem.infer(ast?.expression, context);
    },
  });
}

export default createExpressionEngine;

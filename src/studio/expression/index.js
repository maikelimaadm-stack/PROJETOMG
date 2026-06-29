export {
  STUDIO_EXPRESSION_VERSION,
  EXPRESSION_DOCUMENT_VERSION,
  EXPRESSION_AST_VERSION,
  EXPRESSION_IR_VERSION,
  OFFICIAL_EXPRESSION_ENGINES,
  EXPRESSION_NODE_KINDS,
  EXPRESSION_PRIMITIVE_TYPES,
} from "./contracts/expressionContracts.js";

export { createExpressionDocument, validateExpressionDocument } from "./document/expressionDocument.js";

export {
  createAstNode,
  createLiteralNode,
  createVariableNode,
  createPropertyAccessNode,
  createUnaryNode,
  createBinaryNode,
  createNullCoalesceNode,
  createCallNode,
  createExpressionAstRoot,
  validateExpressionAst,
} from "./ast/expressionAst.js";

export { createExpressionParser } from "./parser/expressionParser.js";
export { createExpressionCompiler } from "./compiler/expressionCompiler.js";
export { createExpressionValidator } from "./validator/expressionValidator.js";
export { createExpressionTypeSystem } from "./types/expressionTypeSystem.js";
export {
  EXPRESSION_FUNCTION_CATALOG_VERSION,
  OFFICIAL_EXPRESSION_FUNCTIONS,
  createFunctionCatalog,
  getOfficialFunctionCatalog,
} from "./catalog/functionCatalog.js";
export { createExpressionContext } from "./context/expressionContext.js";
export { createExpressionDependencyGraph } from "./dependency/expressionDependencyGraph.js";
export { createExpressionRefactoring } from "./refactoring/expressionRefactoring.js";
export { executeExpressionAst } from "./runtime/expressionExecutor.js";
export { createExpressionEngine } from "./createExpressionEngine.js";

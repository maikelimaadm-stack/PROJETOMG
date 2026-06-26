import { createCadastroModuleDefinition } from "@/framework/cadastro/moduleSchema";
import { ProdutoApi } from "@/apis/produtos/ProdutoApi";
import produtoRepository from "@/modules/produtos/repositories/produtoRepository";
import { produtosSchema } from "@/modules/produtos/config/produtosSchema";

export const produtosModuleDefinition = createCadastroModuleDefinition({
  moduleId: "produtos",
  entityName: "ProdutoCadastro",
  singularLabel: "Produto",
  pluralLabel: "Produtos",
  repository: produtoRepository,
  api: ProdutoApi,
  schema: produtosSchema,
});

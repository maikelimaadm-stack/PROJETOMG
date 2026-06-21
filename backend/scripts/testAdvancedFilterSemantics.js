import assert from "node:assert/strict";
import { empresaRepository } from "../src/modules/empresas/repositories/empresaRepository.js";

const baseScope = {
  clienteId: "tenant-test",
  acessoGlobal: true,
  allowedEmpresaIds: [],
  selectedEmpresaId: null,
};

const findInTree = (node, predicate) => {
  if (predicate(node)) return true;
  if (Array.isArray(node)) return node.some((item) => findInTree(item, predicate));
  if (node && typeof node === "object") {
    return Object.values(node).some((item) => findInTree(item, predicate));
  }
  return false;
};

const mockPrisma = () => {
  const calls = [];
  return {
    calls,
    $queryRawUnsafe: async (sql, ...params) => {
      calls.push({ sql, params });
      return [];
    },
  };
};

const buildWhere = async (filters, prisma = mockPrisma()) => {
  const where = await empresaRepository.buildListWhere(prisma, baseScope, { search: "", filters });
  return { where, prisma };
};

const run = async () => {
  const invalidNumeric = await buildWhere({ id_global: "undefined" });
  assert.equal(
    findInTree(invalidNumeric.where, (node) => node && typeof node === "object" && Object.prototype.hasOwnProperty.call(node, "id_global")),
    false,
    "valor inválido não pode gerar filtro id_global=0"
  );

  const notEqualsWhere = await buildWhere({ id_global__not_equals: "3073" });
  const hasNotEquals = findInTree(
    notEqualsWhere.where,
    (node) => node && typeof node === "object" && node.id_global && node.id_global.not === 3073
  );
  assert.equal(hasNotEquals, true, "not_equals deve produzir clause Prisma com not");

  const equalsWhere = await buildWhere({ id_global: "3073" });
  const hasEquals = findInTree(
    equalsWhere.where,
    (node) => node && typeof node === "object" && node.id_global === 3073
  );
  assert.equal(hasEquals, true, "equals deve manter igualdade direta");
  assert.notDeepEqual(notEqualsWhere.where, equalsWhere.where, "equals e not_equals não podem gerar where idêntico");

  const numericOperators = [
    ["id_global__gt", "3073", (node) => node?.id_global?.gt === 3073],
    ["id_global__gte", "3073", (node) => node?.id_global?.gte === 3073],
    ["id_global__lt", "3073", (node) => node?.id_global?.lt === 3073],
    ["id_global__lte", "3073", (node) => node?.id_global?.lte === 3073],
  ];
  for (const [key, value, matcher] of numericOperators) {
    const { where } = await buildWhere({ [key]: value });
    assert.equal(findInTree(where, matcher), true, `${key} deve gerar clause correspondente`);
  }

  const betweenWhere = await buildWhere({ id_global__between: { from: "100", to: "200" } });
  assert.equal(
    findInTree(
      betweenWhere.where,
      (node) => node && typeof node === "object" && node.id_global?.gte === 100 && node.id_global?.lte === 200
    ),
    true,
    "between numérico deve aplicar faixa inclusiva"
  );

  const notBetweenWhere = await buildWhere({ id_global__not_between: { from: "100", to: "200" } });
  assert.equal(
    findInTree(notBetweenWhere.where, (node) => Array.isArray(node?.OR)),
    true,
    "not_between numérico deve aplicar OR fora da faixa"
  );

  const dateBetweenWhere = await buildWhere({
    updatedAt__between: { from: "2026-06-01", to: "2026-06-30" },
  });
  assert.equal(
    findInTree(
      dateBetweenWhere.where,
      (node) =>
        node &&
        typeof node === "object" &&
        node.updatedAt?.gte instanceof Date &&
        node.updatedAt?.lte instanceof Date
    ),
    true,
    "between de data deve converter para início/fim do dia"
  );

  const singleSelectionWhere = await buildWhere({
    estado: { operator: "in", values: ["MT"] },
  });
  assert.equal(
    findInTree(
      singleSelectionWhere.where,
      (node) => node && typeof node === "object" && Array.isArray(node.estado?.in) && node.estado.in.includes("MT")
    ),
    true,
    "formato { operator: 'in', values: [...] } deve virar clause in no backend"
  );

  const multiSelectionWhere = await buildWhere({
    estado: { operator: "in", values: ["MT", "SP"] },
  });
  assert.equal(
    findInTree(
      multiSelectionWhere.where,
      (node) =>
        node &&
        typeof node === "object" &&
        Array.isArray(node.estado?.in) &&
        node.estado.in.includes("MT") &&
        node.estado.in.includes("SP")
    ),
    true,
    "seleção múltipla deve virar in com todos os valores"
  );

  const selectedAliasWhere = await buildWhere({
    estado: { operator: "in", selectedValues: ["MT", "SP"] },
  });
  assert.equal(
    findInTree(
      selectedAliasWhere.where,
      (node) =>
        node &&
        typeof node === "object" &&
        Array.isArray(node.estado?.in) &&
        node.estado.in.length === 2
    ),
    true,
    "backend deve aceitar alias selectedValues para filtros de seleção"
  );

  const checkedAliasWhere = await buildWhere({
    estado: { operator: "in", checkedValues: { MT: true, SP: true, RJ: false } },
  });
  assert.equal(
    findInTree(
      checkedAliasWhere.where,
      (node) =>
        node &&
        typeof node === "object" &&
        Array.isArray(node.estado?.in) &&
        node.estado.in.includes("MT") &&
        node.estado.in.includes("SP") &&
        !node.estado.in.includes("RJ")
    ),
    true,
    "backend deve aceitar alias checkedValues em formato mapa"
  );

  const idGlobalFormattedInWhere = await buildWhere({
    id_global__in: ["2.573", "2.574", "2.575"],
  });
  assert.equal(
    findInTree(
      idGlobalFormattedInWhere.where,
      (node) =>
        node &&
        typeof node === "object" &&
        Array.isArray(node.id_global?.in) &&
        node.id_global.in.includes(2573) &&
        node.id_global.in.includes(2574) &&
        node.id_global.in.includes(2575)
    ),
    true,
    "id_global__in deve normalizar valores numéricos formatados"
  );

  const nestedObjectSelectionWhere = await buildWhere({
    id_global: {
      operator: "in",
      values: [{ value: "2.573", label: "2.573" }, { id: "2.574" }],
    },
  });
  assert.equal(
    findInTree(
      nestedObjectSelectionWhere.where,
      (node) =>
        node &&
        typeof node === "object" &&
        Array.isArray(node.id_global?.in) &&
        node.id_global.in.includes(2573) &&
        node.id_global.in.includes(2574)
    ),
    true,
    "backend deve aceitar seleção com objetos value/id"
  );

  const clearedSelectionWhere = await buildWhere({
    estado: { operator: "in", values: [] },
  });
  assert.equal(
    findInTree(
      clearedSelectionWhere.where,
      (node) => node && typeof node === "object" && Object.prototype.hasOwnProperty.call(node, "estado")
    ),
    false,
    "limpar seleção deve remover clause da coluna"
  );

  const customDateBetweenPrisma = mockPrisma();
  await buildWhere(
    {
      "custom:teste__date_between": { from: "2026-06-01", to: "2026-06-30" },
    },
    customDateBetweenPrisma
  );
  assert.equal(customDateBetweenPrisma.calls.length > 0, true, "custom date between deve consultar SQL sem erro");

  const customDateNotBetweenPrisma = mockPrisma();
  await buildWhere(
    {
      "custom:teste__date_not_between": { from: "2026-06-01", to: "2026-06-30" },
    },
    customDateNotBetweenPrisma
  );
  assert.equal(
    customDateNotBetweenPrisma.calls.some((call) => call.sql.includes(" OR ")),
    true,
    "custom date not_between deve gerar cláusula de exclusão da faixa"
  );

  const customNumberNotEqualsPrisma = mockPrisma();
  await buildWhere(
    {
      "custom:ranking__num_not_equals": "42",
    },
    customNumberNotEqualsPrisma
  );
  assert.equal(
    customNumberNotEqualsPrisma.calls.some((call) => call.sql.includes("<>")),
    true,
    "custom number not_equals deve usar operador SQL <>"
  );

  const customDateInvalidPrisma = mockPrisma();
  const invalidCustomDateWhere = await buildWhere(
    {
      "custom:teste__date_between": { from: "null", to: "undefined" },
    },
    customDateInvalidPrisma
  );
  assert.equal(
    findInTree(invalidCustomDateWhere.where, (node) => node && node.id && Array.isArray(node.id.in)),
    true,
    "entrada inválida deve ser tratada com vazio controlado, sem lançar erro interno"
  );

  console.log("testAdvancedFilterSemantics: OK");
};

run().catch((error) => {
  console.error(`testAdvancedFilterSemantics: FAIL\n${error.stack || error.message}`);
  process.exit(1);
});
